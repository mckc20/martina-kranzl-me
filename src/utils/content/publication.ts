// One instant shared by all content consumers in this build (including development).
export const BUILD_TIME = Date.now();
export interface Publication {
  id: string;
  data: { draft?: boolean; pubDatetime: Date; modDatetime?: Date | null };
}
export const isPublic = (entry: Publication, now = BUILD_TIME) =>
  !entry.data.draft && entry.data.pubDatetime.getTime() <= now;
export const publicationOrder = (a: Publication, b: Publication) =>
  b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime() ||
  (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
interface Photograph extends Publication {
  data: Publication["data"] & { dateTaken?: string };
}
const captureTime = (entry: Photograph) =>
  entry.data.dateTaken
    ? Date.parse(`${entry.data.dateTaken}T00:00:00Z`)
    : entry.data.pubDatetime.getTime();
export const captureOrder = (a: Photograph, b: Photograph) =>
  captureTime(b) - captureTime(a) || publicationOrder(a, b);
export function publicEntries<T extends Publication>(
  entries: T[],
  now = BUILD_TIME
): T[] {
  return entries.filter(entry => isPublic(entry, now)).sort(publicationOrder);
}
export function validateIds(entries: { id: string }[]) {
  const used = new Set<string>();
  for (const { id } of entries) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
      ["page", "tags", "index"].includes(id) ||
      used.has(id)
    ) {
      throw new Error(
        `Invalid, duplicate or reserved entry filename: ${id}. Use lowercase ASCII words separated by hyphens.`
      );
    }
    used.add(id);
  }
}
