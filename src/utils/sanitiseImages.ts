import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import type { AstroIntegration } from "astro";

/** Sharp strips EXIF/XMP/IPTC by default. Convert to sRGB and bake orientation into pixels. */
export async function sanitiseImage(input: Buffer): Promise<Buffer> {
  return sharp(input).rotate().toColourspace("srgb").toBuffer();
}
export default function sanitisedImages(): AstroIntegration {
  return {
    name: "sanitised-public-images",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const roots = [
          dir,
          new URL(`file://${path.resolve(".vercel/output/static")}/`),
        ];
        const seen = new Set<string>();
        for (const root of roots) {
          let files: string[];
          try {
            files = await fs.readdir(root, { recursive: true });
          } catch {
            continue;
          }
          for (const file of files) {
            if (!/\.(jpe?g|png|webp|avif|tiff?)$/i.test(file)) continue;
            const filename = path.join(root.pathname, file);
            if (seen.has(filename)) continue;
            seen.add(filename);
            const input = await fs.readFile(filename);
            const metadata = await sharp(input).metadata();
            // Process only originals containing metadata; Astro's generated renditions are already clean.
            if (
              !metadata.exif &&
              !metadata.xmp &&
              !metadata.iptc &&
              !metadata.icc
            )
              continue;
            const digest = createHash("sha256").update(input).digest("hex");
            const cached = path.resolve(
              "node_modules/.cache/diary-images",
              digest
            );
            let output: Buffer;
            try {
              output = await fs.readFile(cached);
            } catch {
              output = await sanitiseImage(input);
              await fs.mkdir(path.dirname(cached), { recursive: true });
              await fs.writeFile(cached, output);
            }
            await fs.writeFile(filename, output);
          }
        }
      },
    },
  };
}
