import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { parse } from "yaml";
import {
  isPublic,
  captureOrder,
  publicEntries,
  validateIds,
} from "../src/utils/content/publication.ts";
import { tagSlug, tagsFor } from "../src/utils/content/tags.ts";
const now = Date.parse("2026-11-15T12:00:00Z");
const item = (id: string, date: number, draft = false, modified?: number) => ({
  id,
  data: {
    pubDatetime: new Date(date),
    draft,
    modDatetime: modified ? new Date(modified) : undefined,
  },
});
test("photo capture dates take priority, missing dates use publication time, and ties are stable", () => {
  const photo = (id: string, publication: string, dateTaken?: string) => ({
    id,
    data: { pubDatetime: new Date(publication), dateTaken },
  });
  const entries = [
    photo("old-upload", "2026-11-15T12:00:00Z", "2020-01-01"),
    photo("z", "2026-11-10T12:00:00Z", "2026-11-12"),
    photo("missing-date", "2026-11-13T12:00:00Z"),
    photo("a", "2026-11-10T12:00:00Z", "2026-11-12"),
    photo("newer-publication", "2026-11-11T12:00:00Z", "2026-11-12"),
  ];
  assert.deepEqual(entries.toSorted(captureOrder).map(entry => entry.id), [
    "missing-date",
    "newer-publication",
    "a",
    "z",
    "old-upload",
  ]);
  assert.equal(publicEntries(entries, now)[0].id, "old-upload");
});
test("one publication boundary excludes drafts and future entries; edits never reorder; ties use IDs", () => {
  const entries = [
    item("z", now),
    item("a", now),
    item("old", now - 1, false, now + 9999),
    item("future", now + 1),
    item("draft", now - 999, true),
  ];
  assert.deepEqual(
    publicEntries(entries, now).map(entry => entry.id),
    ["a", "z", "old"]
  );
  assert.equal(isPublic(entries[0], now), true);
  assert.equal(entries[0].id, "z");
});
test("IDs reject reserved segments and duplicate extensions; titles do not participate", () => {
  for (const id of ["page", "tags", "index", "Uppercase", "a/b", "a_b"]) {
    assert.throws(() => validateIds([{ id }]));
  }
  assert.throws(() => validateIds([{ id: "one" }, { id: "one" }]));
  assert.doesNotThrow(() => validateIds([{ id: "photo-001" }]));
});
test("tag routes preserve case, punctuation and accents without collisions", () => {
  const labels = [
    "Schweden",
    "schweden",
    "schweden!",
    "schwëden",
    "a b",
    "a-b",
  ];
  assert.equal(new Set(labels.map(tagSlug)).size, labels.length);
  assert.deepEqual(
    tagsFor([{ data: { tags: [...labels, labels[0]] } }]).map(tag => tag.label),
    [...labels].sort()
  );
});
const migration = JSON.parse(
  fs.readFileSync("src/data/migration-map.json", "utf8")
);
const split = (source: string) => {
  const [, front, body] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  return { data: parse(front), body };
};
const prose = (body: string) =>
  body
    .replace(/^import .*?;\s*/gm, "")
    .replace(/export const photos = [\s\S]*?;\s*/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .replaceAll("_", "*");
test("all 31 originals retain metadata and prose; classification, lead images and exact dated URLs are recorded", () => {
  assert.equal(migration.length, 31);
  assert.equal(
    migration.filter((m: { collection: string }) => m.collection === "photos")
      .length,
    30
  );
  assert.equal(migration.filter((m: { draft: boolean }) => m.draft).length, 12);
  for (const m of migration) {
    const original = split(
      execFileSync("git", ["show", `1a05e1d:${m.oldFile}`], {
        encoding: "utf8",
      })
    );
    const migrated = split(
      fs.readFileSync(`src/data/${m.collection}/${m.id}.mdx`, "utf8")
    );
    for (const key of [
      "title",
      "pubDatetime",
      "modDatetime",
      "tags",
      "author",
      "canonicalURL",
      "timezone",
    ]) {
      assert.deepEqual(
        migrated.data[key],
        original.data[key],
        `${m.id}: ${key}`
      );
    }
    assert.equal(migrated.data.draft, original.data.draft ?? false);
    assert.equal(
      m.collection,
      original.data.title === "Himmelsjäger" ? "blog" : "photos"
    );
    assert.equal(m.primaryImage, original.data.photos[0].src);
    if (m.collection === "photos")
      assert.equal(migrated.data.image, m.primaryImage);
    assert.equal(
      prose(migrated.body),
      prose(original.body),
      `${m.id}: prose and captions`
    );
    // These original filenames already match Astro's GitHub slugger, including ä.
    assert.equal(
      m.oldUrl,
      m.oldFile.replace("src/data/blog", "/posts").replace(/\.mdx$/, "")
    );
  }
});
test("every migration has direct permanent redirects, including social image URLs", () => {
  const redirects = JSON.parse(
    fs.readFileSync("vercel.json", "utf8")
  ).redirects;
  for (const m of migration) {
    assert.ok(
      redirects.some(
        (r: { source: string; destination: string; permanent: boolean }) =>
          r.source === m.oldUrl &&
          r.destination === m.destination &&
          r.permanent
      )
    );
    assert.ok(
      redirects.some(
        (r: { source: string; destination: string; permanent: boolean }) =>
          r.source === m.oldSocialImage &&
          r.destination === `${m.destination}index.png` &&
          r.permanent
      )
    );
  }
});
