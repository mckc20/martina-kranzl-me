# Photos gallery

`/photos/` lists public entries from the flat `src/data/photos/` collection. Each
entry contributes one primary photograph and links to its own detail page.
Additional images stay in the entry body. Drafts and scheduled entries are absent.
Photos sort by capture date, newest first: explicit `dateTaken`, otherwise the
EXIF capture date, otherwise `pubDatetime`. Ties use publication time and then
filename ID. Filtered galleries, subject previews and previous/next navigation
follow this order. The homepage's Recent Photos uses publication time so newly
published older photographs still appear there.

The gallery renders links and responsive images in HTML. A small enhancement
arranges those same elements into natural-proportion columns, preserving DOM and
keyboard order. Without JavaScript it remains a usable grid. There is no gallery
viewer, layout toggle or client data feed. Existing in-post PhotoSwipe galleries
continue to work.

There are 24 entries per page, visible pagination and exact-label subject filters.
Gallery breakpoints are one column below 480px, two below 768px, three below
1200px and four above. Gaps are 10px. Home uses a compact recent selection.

See [Publishing](../publishing.md) for schemas, copyable templates, image handling,
privacy, dates, tags and deployment, and [Migration](../migration.md) for the
superseded gallery's compatibility details.
