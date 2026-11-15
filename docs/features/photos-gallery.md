# Photos gallery

## Purpose

The `/photos` gallery ports AntfuStyle's actual `PhotoView.astro` component,
including its layout calculations, rendering, batching, resizing, hover effects,
and layout switch. The surrounding site retains its own navigation, fonts, and
colors. Post galleries continue to use PhotoSwipe.

## Photo selection

See the [README frontmatter example](../../README.md#photos-gallery).

- `photos`: optional array, default `[]`.
- `src`: required local image, validated by Astro.
- `showInGallery`: defaults to `false`.
- `alt`: optional, falling back to the post title.
- `caption`: optional, used as the visible description; otherwise the post title.

Draft and future posts are excluded. Posts sort newest first, with photos in
frontmatter order and repeated sources shown once. A rebuild includes newly
published photos.

## Upstream layout and interactions

The gallery uses AntfuStyle's defaults: 16px gaps, 240px target column widths,
1000px maximum photo width, sequential masonry, and batches of 15. The page has
28px horizontal padding; the gallery adds 80px margins on desktop, 40px below
1128px, and 4px below 768px. Column count follows available space without the
previous three-column cap or mobile two-column minimum.

Masonry preserves aspect ratios with 6px corners. Square mode uses uncropped
container dimensions with square image cropping and square corners, as upstream.
Hover or keyboard focus zooms images and reveals a white description over the
dark gradient. Titles use 18px regular text with a stronger gradient and subtle
text shadow for readability. The floating bottom-left toggle stores the chosen layout
under `photo-layout`. Switching layout starts again with the first batch.
Scrolling near the page bottom loads more photos automatically.

Viewer.js uses AntfuStyle's full initial coverage, thumbnail navigation from
768px upwards, no toolbar or close button, and no transitions. Escape or clicking
outside closes the viewer. Arrow keys navigate; wheel, double-click, and touch
gestures zoom. Focus returns to the viewed figure. The 24px preview title is visible on mobile
and desktop and links to the photo’s source post.

## Integration differences

`/photos/photos.[hash].json` adapts the site's existing selected blog photos to
AntfuStyle's data format. It emits 720px thumbnails and the original blurred,
100-pixel WebP placeholders. The hash changes with photo data. The endpoint is
prerendered during production builds; development uses the stable `/photos/data.json` URL, refreshes selections on each
request, and disables response caching. This avoids missing data URLs when Astro
retains an earlier rendered content hash during local edits.

UnoCSS-only presentation classes are expressed as equivalent CSS and Tailwind
classes. Explicit image alt text, reduced motion, blocked-storage handling,
error/empty states, Space-key activation, and Astro transition cleanup are retained.
The custom gallery renderer and manual Load more button have been removed.

## Source and licenses

Ported from [AntfuStyle PhotoView](https://github.com/lin-stephanie/astro-antfustyle-theme/blob/f3ef02cae0b8f4a5ae76e7afcef6a75cc6d42709/src/components/views/PhotoView.astro),
commit `f3ef02cae0b8f4a5ae76e7afcef6a75cc6d42709`.
Its placeholder generator, loader, and Viewer.js configuration are also reused.
See `licenses/astro-antfustyle-theme.txt` and `licenses/remixicon.txt`.

Run `npm test` for photo-selection tests, and `npm run build` for Astro checks,
endpoint generation, and the production build.
