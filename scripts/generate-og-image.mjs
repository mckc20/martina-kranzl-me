import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOBLOG_DIR = path.join(ROOT, "src/assets/images/blog/photoblog");

// Configuration
const TILE_SIZE = 200;
const GAP = 40;
const COLS = 6;
const ROWS = 6;
const TILE_COUNT = COLS * ROWS;
const ROTATION_DEG = -25;
const BG_COLOR = { r: 255, g: 255, b: 255, alpha: 1 };
const BORDER_RADIUS = 16;
const SHADOW_OFFSET = 12;
const SHADOW_BLUR = 30;
const FINAL_WIDTH = 1200;
const FINAL_HEIGHT = 630;
const OUTPUT = path.join(ROOT, "public", "astropaper-og.jpg");

/**
 * Pick images from the photoblog directory sorted by newest mtime.
 * Cycles through images if more tiles are needed than available photos.
 */
function pickPhotos() {
  const files = fs
    .readdirSync(PHOTOBLOG_DIR)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .map(f => ({
      name: f,
      mtime: fs.statSync(path.join(PHOTOBLOG_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(f => f.name);

  if (files.length === 0) {
    throw new Error(`No images found in ${PHOTOBLOG_DIR}`);
  }

  // Cycle through images if we need more than available
  const result = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    result.push(files[i % files.length]);
  }
  return result;
}

/** SVG rounded-rectangle mask for clipping tiles and shadows. */
function roundedRectMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  );
}

/** Apply rounded corners to a tile buffer. */
async function applyRoundedCorners(buf) {
  return sharp(buf)
    .composite([
      {
        input: roundedRectMask(TILE_SIZE, TILE_SIZE, BORDER_RADIUS),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

/** Create a gradient drop-shadow image with rounded corners. */
async function createTileShadow() {
  const shadow = await sharp({
    create: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      channels: 4,
      background: { r: 200, g: 200, b: 200, alpha: 120 },
    },
  })
    .composite([
      {
        input: roundedRectMask(TILE_SIZE, TILE_SIZE, BORDER_RADIUS),
        blend: "dest-in",
      },
    ])
    .blur(SHADOW_BLUR)
    .png()
    .toBuffer();

  return shadow;
}

async function main() {
  const photos = pickPhotos();
  console.log(
    `Generating OG image with ${COLS}x${ROWS} grid (${TILE_COUNT} tiles)...`
  );

  // 1. Resize each photo to a square tile with rounded corners
  const tiles = await Promise.all(
    photos.map(async photo => {
      const filePath = path.join(PHOTOBLOG_DIR, photo);
      const resized = await sharp(filePath)
        .resize(TILE_SIZE, TILE_SIZE, { fit: "cover", position: "centre" })
        .png()
        .toBuffer();
      return applyRoundedCorners(resized);
    })
  );

  // 2. Create shadow template
  const shadowBuf = await createTileShadow();

  // 3. Compose tiles with shadows into a grid
  const gridWidth = COLS * TILE_SIZE + (COLS - 1) * GAP;
  const gridHeight = ROWS * TILE_SIZE + (ROWS - 1) * GAP;

  const compositeOps = [];
  for (let i = 0; i < tiles.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * (TILE_SIZE + GAP);
    const y = row * (TILE_SIZE + GAP);

    // Shadow (semi-transparent, composited with alpha blending)
    compositeOps.push({
      input: shadowBuf,
      left: x + SHADOW_OFFSET,
      top: y + SHADOW_OFFSET,
      blend: "over",
    });
    // Photo tile
    compositeOps.push({
      input: tiles[i],
      left: x,
      top: y,
    });
  }

  const gridBuffer = await sharp({
    create: {
      width: gridWidth + SHADOW_OFFSET + SHADOW_BLUR * 2,
      height: gridHeight + SHADOW_OFFSET + SHADOW_BLUR * 2,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite(compositeOps)
    .png()
    .toBuffer();

  // 4. Place grid on oversized canvas for rotation headroom
  const canvasSize = 3200;
  const gridMeta = await sharp(gridBuffer).metadata();
  const offsetX = Math.round((canvasSize - gridMeta.width) / 2);
  const offsetY = Math.round((canvasSize - gridMeta.height) / 2);

  const largeCanvas = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: gridBuffer, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();

  // 5. Rotate for the 3D tilt effect
  const rotated = await sharp(largeCanvas)
    .rotate(ROTATION_DEG, { background: BG_COLOR })
    .png()
    .toBuffer();

  // 6. Apply affine skew for perspective/3D depth
  const skewed = await sharp(rotated)
    .affine(
      [
        [1, 0.15],
        [-0.1, 1],
      ],
      {
        background: BG_COLOR,
        interpolator: sharp.interpolators.bicubic,
      }
    )
    .png()
    .toBuffer();

  // 7. Crop to final OG dimensions from center
  const meta = await sharp(skewed).metadata();
  const extractLeft = Math.round((meta.width - FINAL_WIDTH) / 2);
  const extractTop = Math.round((meta.height - FINAL_HEIGHT) / 2);

  await sharp(skewed)
    .extract({
      left: extractLeft,
      top: extractTop,
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
    })
    .jpeg({ quality: 85, progressive: true })
    .toFile(OUTPUT);

  console.log(`OG image saved to ${OUTPUT}`);
}

main().catch(err => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
