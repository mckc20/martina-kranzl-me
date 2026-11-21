import { getCollection, type CollectionEntry } from "astro:content";
import { captureOrder, publicEntries, validateIds } from "./publication";
import { captureMetadata } from "./exif";
export type Entry = CollectionEntry<"photos"> | CollectionEntry<"blog">;
export async function photos(order: "capture" | "publication" = "capture") {
  const entries = await getCollection("photos");
  validateIds(entries);
  const published = publicEntries(entries);
  if (order === "publication") return published;
  const dated = await Promise.all(
    published.map(async entry => ({
      ...entry,
      data: {
        ...entry.data,
        dateTaken:
          entry.data.dateTaken ?? (await captureMetadata(entry)).dateTaken,
      },
    }))
  );
  return dated.sort(captureOrder);
}
export async function blog() {
  const entries = await getCollection("blog");
  validateIds(entries);
  return publicEntries(entries);
}
export async function allEntries() {
  return publicEntries([...(await photos("publication")), ...(await blog())]);
}
export const entryUrl = (entry: Entry) => `/${entry.collection}/${entry.id}/`;
export const entryTitle = (entry: Entry) =>
  entry.data.title ??
  (entry.collection === "photos" ? entry.data.caption : undefined) ??
  `Photo · ${entry.id}`;
