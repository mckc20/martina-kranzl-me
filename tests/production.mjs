// Run after npm run build: node --test tests/production.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const migration = JSON.parse(
  await fs.readFile("src/data/migration-map.json", "utf8")
);
const publicItems = migration.filter(
  item => !item.draft && Date.parse(item.pubDatetime) <= Date.now()
);
const html = route =>
  fs.readFile(path.join("dist", route, "index.html"), "utf8");

test("Vercel deploys the complete search index from the current build", async () => {
  const source = "dist/pagefind";
  const destination = ".vercel/output/static/pagefind";
  const files = (await fs.readdir(source, { recursive: true })).sort();
  assert.ok(files.includes("pagefind.js"));
  assert.ok(files.includes("pagefind-entry.json"));
  assert.ok(files.some(file => file.endsWith(".pf_meta")));
  assert.ok(files.some(file => file.endsWith(".pf_index")));
  assert.ok(files.some(file => file.endsWith(".pf_fragment")));
  assert.deepEqual(
    (await fs.readdir(destination, { recursive: true })).sort(),
    files
  );
  for (const file of files) {
    if (!(await fs.stat(path.join(source, file))).isFile()) continue;
    assert.deepEqual(
      await fs.readFile(path.join(destination, file)),
      await fs.readFile(path.join(source, file)),
      `Deployed search asset differs: ${file}`
    );
  }
});

test("canonical detail pages, sitemap, language and structured data match public inventory", async () => {
  const sitemap = await fs.readFile("dist/sitemap-0.xml", "utf8");
  assert.ok(!sitemap.includes("/posts/"));
  for (const item of migration) {
    const filename = path.join("dist", item.destination, "index.html");
    if (item.draft) {
      await assert.rejects(fs.access(filename));
      assert.ok(!sitemap.includes(item.destination));
      continue;
    }
    const page = await fs.readFile(filename, "utf8");
    assert.match(page, /data-pagefind-body/);
    assert.match(page, /lang="de"/);
    assert.ok(
      page.includes(`href="https://martina-kranzl.me${item.destination}"`)
    );
    assert.match(
      page,
      new RegExp(
        `"@type":"${item.collection === "photos" ? "ImageObject" : "BlogPosting"}"`
      )
    );
    assert.ok(sitemap.includes(item.destination));
  }
});
test("HTML gallery has one primary image/link per public Photo; body-only images stay on detail", async () => {
  const gallery = await html("photos");
  const links = [
    ...gallery.matchAll(/class="photo-tile"[^>]*href="([^"]+)"/g),
  ].map(match => match[1]);
  // Attribute order is intentionally not assumed below.
  const anchors = [
    ...gallery.matchAll(/<a\b[^>]*class="photo-tile"[^>]*>/g),
  ].map(match => match[0]);
  assert.equal(
    anchors.length,
    publicItems.filter(item => item.collection === "photos").length
  );
  assert.equal(
    anchors.filter(anchor => anchor.includes("/photos/the-dark-side/")).length,
    1
  );
  assert.ok(!gallery.includes("dark-side."));
  assert.ok(!gallery.includes("/photos/himmelsjaeger/"));
  const detail = await html("photos/the-dark-side");
  assert.equal((detail.match(/<img /g) || []).length, 2);
  assert.match(detail, /Camera Details/);
  assert.ok(!detail.includes("<details open"));
  assert.equal(links.length, anchors.length);
});
test("RSS keeps old GUIDs, canonical links and publication dates, once per public item", async () => {
  const feed = await fs.readFile("dist/rss.xml", "utf8");
  assert.equal((feed.match(/<item>/g) || []).length, publicItems.length);
  assert.equal((feed.match(/<guid /g) || []).length, publicItems.length);
  for (const item of publicItems) {
    assert.ok(feed.includes(`https://martina-kranzl.me${item.destination}`));
    assert.ok(
      feed.includes(new URL(item.oldUrl, "https://martina-kranzl.me").href)
    );
    assert.ok(feed.includes(new Date(item.pubDatetime).toUTCString()));
  }
});
test("Vercel has direct real permanent redirects for every historical URL and social endpoint", async () => {
  const config = JSON.parse(
    await fs.readFile(".vercel/output/config.json", "utf8")
  );
  for (const item of migration) {
    for (const [source, destination] of [
      [item.oldUrl, item.destination],
      [item.oldSocialImage, `${item.destination}index.png`],
    ]) {
      assert.ok(
        config.routes.some(
          route =>
            route.src &&
            new RegExp(route.src).test(source) &&
            [301, 308].includes(route.status) &&
            route.headers?.Location === destination
        ),
        source
      );
    }
    if (!item.draft)
      await fs.access(path.join("dist", item.destination, "index.png"));
  }
  assert.equal(config.images, undefined);
});
test("all deployed raster downloads, including lightbox originals and social previews, lack private metadata", async () => {
  for (const root of ["dist", ".vercel/output/static"]) {
    const images = (await fs.readdir(root, { recursive: true })).filter(file =>
      /\.(jpe?g|png|webp|avif)$/i.test(file)
    );
    assert.ok(images.length > 100);
    for (const file of images) {
      const metadata = await sharp(path.join(root, file)).metadata();
      assert.equal(metadata.exif, undefined, `${root}/${file}: EXIF`);
      assert.equal(metadata.xmp, undefined, `${root}/${file}: XMP`);
      assert.equal(metadata.iptc, undefined, `${root}/${file}: IPTC`);
    }
  }
});
