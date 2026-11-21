// Encode every Unicode code point. This reversible mapping cannot merge spelling/case variants.
export const tagSlug = (label: string) =>
  Array.from(label, char => char.codePointAt(0)!.toString(16)).join("-");
export function tagsFor(entries: { data: { tags: string[] } }[]) {
  return [...new Set(entries.flatMap(entry => entry.data.tags))]
    .sort()
    .map(label => ({ label, slug: tagSlug(label) }));
}
