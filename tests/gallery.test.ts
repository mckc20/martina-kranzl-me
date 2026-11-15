import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getGalleryPhotos,
  type PhotoPost,
} from "../src/utils/getGalleryPhotos.ts";

const now = new Date("2026-11-10T12:00:00Z").getTime();
const image = (src: string) => ({
  src,
  width: 800,
  height: 600,
  format: "jpg" as const,
});
const photo = (src: string, showInGallery = true) => ({
  src: image(src),
  showInGallery,
});
const post = (
  id: string,
  data: Partial<PhotoPost["data"]> = {}
): PhotoPost => ({
  id,
  data: {
    title: id,
    pubDatetime: new Date(now - 1000),
    photos: [photo(id)],
    ...data,
  },
});

test("excludes drafts, future posts (including within 15 minutes), and unselected photos", () => {
  const posts = [
    post("draft", { draft: true }),
    post("future", { pubDatetime: new Date(now + 1) }),
    post("disabled", { photos: [photo("disabled", false)] }),
    post("default", { photos: [{ src: image("default") }] }),
    post("empty", { photos: undefined }),
    post("published", { pubDatetime: new Date(now) }),
  ];
  assert.deepEqual(
    getGalleryPhotos(posts, now).map(p => p.src.src),
    ["published"]
  );
});

test("orders posts newest first, keeps photo order, deduplicates enabled sources without mutating posts", () => {
  const posts = [
    post("older", {
      pubDatetime: new Date(now - 2000),
      photos: [photo("shared"), photo("old")],
    }),
    post("newer", {
      photos: [photo("second"), photo("shared"), photo("third")],
    }),
  ];
  assert.deepEqual(
    getGalleryPhotos(posts, now).map(p => p.src.src),
    ["second", "shared", "third", "old"]
  );
  assert.equal(posts[0].id, "older");
});

test("uses title for omitted alt, preserves explicit alt and optional captions, ignores disabled duplicates", () => {
  const posts = [
    post("title", {
      photos: [
        photo("a", false),
        { ...photo("a"), caption: "Caption" },
        { ...photo("b"), alt: "Specific alt" },
      ],
    }),
  ];
  const result = getGalleryPhotos(posts, now);
  assert.equal(result[0].alt, "title");
  assert.equal(result[0].caption, "Caption");
  assert.equal(result[1].alt, "Specific alt");
  assert.equal(result[1].caption, undefined);
  assert.deepEqual(getGalleryPhotos([], now), []);
});
