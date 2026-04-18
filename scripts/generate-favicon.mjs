import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// Favicon sizes to generate
const SIZES = {
  "favicon-96x96.png": 96,
  "apple-touch-icon.png": 180,
};
const SVG_SIZE = 128;

/** SVG circle mask for clipping an image to a circle. */
function circleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
}

/** Resize and crop an image to a circle at the given size. */
async function makeCircularIcon(inputBuffer, size) {
  const resized = await sharp(inputBuffer)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  return sharp(resized)
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/generate-favicon.mjs <input-image>");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const inputBuffer = fs.readFileSync(inputPath);
  console.log(`Generating favicons from ${inputPath}...`);

  // Generate PNG favicons
  for (const [filename, size] of Object.entries(SIZES)) {
    const buf = await makeCircularIcon(inputBuffer, size);
    const outPath = path.join(PUBLIC, filename);
    await sharp(buf).toFile(outPath);
    console.log(`  ${filename} (${size}x${size})`);
  }

  // Generate SVG favicon (embeds a base64-encoded circular PNG)
  const svgPng = await makeCircularIcon(inputBuffer, SVG_SIZE);
  const base64 = svgPng.toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">
  <image href="data:image/png;base64,${base64}" width="${SVG_SIZE}" height="${SVG_SIZE}"/>
</svg>
`;
  fs.writeFileSync(path.join(PUBLIC, "favicon.svg"), svgContent);
  console.log(`  favicon.svg (${SVG_SIZE}x${SVG_SIZE})`);

  console.log("Done!");
}

main().catch(err => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
