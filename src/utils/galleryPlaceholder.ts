// Ported from Astro AntfuStyle Theme (MIT), commit f3ef02cae0b8f4a5ae76e7afcef6a75cc6d42709.
// Copyright (c) 2024 Stephanie Lin. See licenses/astro-antfustyle-theme.txt.
import sharp, { type SharpInput } from "sharp";

/**
 * Calculates appropriate dimensions for the placeholder
 * based on original image size and quality.
 */
function getBitmapDimensions(
  imgWidth: number,
  imgHeight: number,
  pixelTarget: number
) {
  // h * r * h = ~P
  const ratioWH = imgWidth / imgHeight;
  let bitmapHeight = pixelTarget / ratioWH;
  bitmapHeight = Math.sqrt(bitmapHeight);
  const bitmapWidth = pixelTarget / bitmapHeight;

  return { width: Math.round(bitmapWidth), height: Math.round(bitmapHeight) };
}

/**
 * Generates a placeholder image for the given image buffer.
 */
export async function generatePlaceholder(
  buffer: SharpInput,
  width: number,
  height: number,
  pixelTarget: number
) {
  // calculate appropriate dimensions for the placeholder
  const dims = getBitmapDimensions(width, height, pixelTarget);

  // process the image buffer to create a low-quality placeholder
  const placeholder = await sharp(buffer)
    .resize(dims.width, dims.height, { fit: "inside" })
    .toFormat("webp", { quality: 1 })
    .modulate({ brightness: 1, saturation: 1.2 })
    .blur()
    .toBuffer({ resolveWithObject: true });

  // convert the processed image to a base64 data URL for embedding in HTML
  const dataUrl = `data:image/${placeholder.info.format};base64,${placeholder.data.toString("base64")}`;

  return dataUrl;
}
