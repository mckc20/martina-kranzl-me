import { cp, rm } from "node:fs/promises";

// Astro's Vercel adapter copies dist before the Pagefind CLI runs. Publish the
// newly generated index explicitly so deployments never use a previous build.
for (const destination of [
  ".vercel/output/static/pagefind",
  "public/pagefind",
]) {
  await rm(destination, { recursive: true, force: true });
  await cp("dist/pagefind", destination, { recursive: true });
}
