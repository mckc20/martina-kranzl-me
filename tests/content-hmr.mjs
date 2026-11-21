import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

// Exercise a running Astro server: a static build cannot catch stale MDX maps.
const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "content-hmr-"));
const baseline = process.argv.includes("--baseline");
const port = baseline ? 4397 : 4398;
const origin = `http://127.0.0.1:${port}`;
let server;
let output = "";
const write = async (file, value) => {
  const target = path.join(fixture, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
};
const body = text => `---\ntitle: Example\n---\n\n${text}\n`;
const page = async (url, expected) => {
  const response = await fetch(`${origin}${url}`);
  const html = await response.text();
  assert.equal(response.status, 200, `${url}: ${html.slice(0, 300)}`);
  assert.ok(html.includes(expected), `${url}: missing ${expected}`);
};

try {
  await fs.symlink(
    path.join(root, "node_modules"),
    path.join(fixture, "node_modules")
  );
  await write("package.json", '{"type":"module"}');
  await write(
    "astro.config.mjs",
    `
    import { defineConfig } from 'astro/config';
    import mdx from '@astrojs/mdx';
    import contentImportsHmr from ${JSON.stringify(path.join(root, "src/utils/contentImportsHmr.ts"))};
    export default defineConfig({
      integrations: [mdx()],
      vite: { plugins: ${baseline ? "[]" : "[contentImportsHmr()]"} },
    });
  `
  );
  await write(
    "src/content.config.ts",
    `
    import { defineCollection } from 'astro:content';
    import { glob } from 'astro/loaders';
    export const collections = Object.fromEntries(['photos', 'blog'].map(name => [name,
      defineCollection({ loader: glob({ pattern: '*.{md,mdx}', base: './src/data/' + name }) })
    ]));
  `
  );
  await write(
    "src/pages/[collection]/[slug].astro",
    `---
    import { getCollection, render } from 'astro:content';
    export async function getStaticPaths() {
      const entries = [...await getCollection('photos'), ...await getCollection('blog')];
      return entries.map(entry => ({params: {collection: entry.collection, slug: entry.id}, props: {entry}}));
    }
    const { Content } = await render(Astro.props.entry);
    ---
    <html lang="en"><body><Content /></body></html>
  `
  );
  for (const collection of ["photos", "blog"]) {
    await write(
      `src/data/${collection}/existing.mdx`,
      body("Existing content")
    );
  }
  server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/astro/bin/astro.mjs"),
      "dev",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { cwd: fixture }
  );
  server.stdout.on("data", data => {
    output += data;
  });
  server.stderr.on("data", data => {
    output += data;
  });
  for (let attempt = 0; ; attempt++) {
    try {
      await page("/photos/existing/", "Existing content");
      break;
    } catch (error) {
      if (attempt === 59 || server.exitCode !== null) throw error;
      await delay(500);
    }
  }
  await page("/blog/existing/", "Existing content");

  for (const collection of ["photos", "blog"]) {
    const file = `src/data/${collection}/new-entry.mdx`;
    await write(file, body("New MDX content"));
    await delay(2000);
    await page(`/${collection}/new-entry/`, "New MDX content");
    await write(file, body("Edited MDX content"));
    await delay(2000);
    await page(`/${collection}/new-entry/`, "Edited MDX content");
    await fs.rename(
      path.join(fixture, file),
      path.join(fixture, `src/data/${collection}/renamed.mdx`)
    );
    await delay(2000);
    await page(`/${collection}/renamed/`, "Edited MDX content");
    await fs.unlink(path.join(fixture, `src/data/${collection}/renamed.mdx`));
    await delay(2000);
    assert.equal((await fetch(`${origin}/${collection}/renamed/`)).status, 404);
    await write(
      `src/data/${collection}/plain.md`,
      body("Plain Markdown content")
    );
    await delay(2000);
    await page(`/${collection}/plain/`, "Plain Markdown content");
  }
  process.stdout.write(
    "Content HMR passed: add, edit, rename, delete MDX and add Markdown in Photos and Blog.\n"
  );
} catch (error) {
  process.stderr.write(output);
  throw error;
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
  await fs.rm(fixture, { recursive: true, force: true });
}
