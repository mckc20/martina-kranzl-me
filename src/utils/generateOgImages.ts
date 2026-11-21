import sharp from "sharp";

// Fully local, sanitised social preview. No runtime font requests during builds.
export async function generateOgImageForSite() {
  return sharp("src/assets/blogimages/abendlicht/cover.jpg")
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .toColourspace("srgb")
    .png()
    .toBuffer();
}
