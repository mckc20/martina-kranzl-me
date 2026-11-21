/** Compatibility helper for shared blog components. Filenames are stable route IDs. */
export function getPath(id: string, _filePath?: string, includeBase = true) {
  return `${includeBase ? "/blog" : ""}/${id}/`;
}
