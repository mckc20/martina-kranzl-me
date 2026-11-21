import sharp from "sharp";
import fs from "node:fs/promises";
import type { APIRoute } from "astro";
import { blog } from "@/utils/content";
import { parse } from "yaml";
import path from "node:path";
export async function getStaticPaths() {
  return (await blog()).map(entry => ({
    params: { slug: entry.id },
    props: { filePath: entry.filePath },
  }));
}
export const GET: APIRoute = async ({ props }) => {
  const source = await fs.readFile(props.filePath, "utf8");
  const data = parse(source.split(/^---\s*$/m)[1]);
  const ref = data.ogImage ?? data.heroImage;
  if (!ref) return new Response(null, { status: 404 });
  const filename = ref.startsWith("@/")
    ? path.resolve("src", ref.slice(2))
    : ref.startsWith("src/")
      ? path.resolve(ref)
      : path.resolve(path.dirname(props.filePath), ref);
  const buffer = await sharp(filename)
    .rotate()
    .resize({
      width: 1200,
      height: 630,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toColourspace("srgb")
    .png()
    .toBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
