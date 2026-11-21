# Photo diary migration

Rollback baseline: clean commit `1a05e1d` (prior gallery/style work and corrected
Vercel documentation). No existing uncommitted work was present at implementation.
Issue #28 supersedes the gallery viewer/layout toggle decisions in #26 and the
fonts/palette in #27. PhotoSwipe inside MDX remains supported.

Inventory: 31 dated MDX files, 19 public and 12 draft; all carry `fotoblog`.
30 move to Photos and `orion.mdx` (Himmelsjäger) moves to Blog as
`himmelsjaeger.mdx`. The old gallery's 20 selected images do not limit migration.
The migration map records original filesystem dates rather than reconstructing
URLs from publication dates. Its old URL algorithm matches the original
`getPath`: slugified directory segments plus the glob loader's GitHub-slugged filename.
The legacy `im-geäst` URL retains its umlaut; the new stable filename is `im-geast`.

The first image in each former `photos` list becomes the lead. The Dark Side's
`dark-side.jpg` remains body-only. Primary `<Image>` rendering is removed from the
body; its existing caption is retained verbatim once as Markdown. The Alles im
Blick body gallery excludes its primary cover. All remaining body text, quotations,
additional images, draft flags, timestamps and exact tag labels are preserved.
No old internal `/posts/` links were found in content.

`vercel.json` contains exact permanent content/social redirects. Old numbered
post indexes redirect to Archives, which contains both content types. Legacy tag
routes and numbered indexes still render combined canonical items. Search indexes
only canonical detail-page `data-pagefind-body` blocks; each entry appears once.

Validation covers baseline-to-migration inventory/text/metadata, publication
boundaries, stable IDs, tag collisions, actual built HTML/routes/feed/search and
metadata stripping/orientation. Preview review on Vercel remains a release step;
no production deployment is included in this change.

## Local verification

- `npm test`: six content/migration/privacy tests pass.
- `npm run build`: zero Astro errors, warnings or hints; Pagefind indexes 19
  canonical entries (18 Photos and one Blog).
- `node --test tests/production.mjs`: five production artifact tests pass,
  including Vercel redirect configuration, canonical URLs, feed identities,
  primary/body-image separation and all 232 raster downloads in each output.
- Lint, formatting and whitespace checks pass. Generated Vercel/Netlify output is
  excluded from ESLint; CLI progress messages and the vendor analytics bootstrap
  have narrowly scoped lint exceptions.
- Chrome: 1440, 1200, 768, 480, 390 and 195px viewports across Home, Photos,
  Blog detail, Photo detail and About have no horizontal overflow. Checked photo
  links/Back, dark preference persistence, keyboard Camera Details disclosure,
  reduced motion, existing PhotoSwipe, no-JavaScript gallery/detail navigation
  and Pagefind search against the production build.
- Temporary content verified untitled Markdown publishing, omitted empty camera
  sections, draft defaults, future exclusion and second-page pagination. Fixtures
  were removed before the final production build.
