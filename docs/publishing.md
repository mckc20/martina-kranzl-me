# Publishing photographs and writing

The site uses local Markdown/MDX files, Astro and Git. There is no CMS or custom
publishing command. Copy a template from `templates/` into a content folder,
replace its examples and preview before publishing. Templates themselves never
create routes.

## Add a photo

1. Put the image in `src/assets/photos/photo-001/main.jpg` (create the folders).
2. Copy `templates/photo-minimal.md` to `src/data/photos/photo-001.md`.
3. Set `image` and a manual `pubDatetime`. Keep `draft: true` while editing.
4. Optionally add alt text, a title, caption, tags, location, capture date,
   camera overrides or a Markdown body. Use `photo-with-details.mdx` for examples.
5. Change `draft` to `false` when ready, then commit and push through the normal
   review/deployment workflow.

The minimal file needs only `image` and `pubDatetime`; omitting `draft` safely
means true. A title, caption, body and camera information are never required.
Without a title the page gets an accessible heading/browser title based on the
filename; the gallery has no compulsory title overlay.

Use flat lowercase ASCII filenames separated by hyphens. `photo-001.md` becomes
`/photos/photo-001/`. `my-day.mdx` in Blog becomes `/blog/my-day/`. Editing the
visible title never changes a URL. Do not use `page`, `tags` or `index`. Do not
create both `.md` and `.mdx` with the same filename. Validation rejects colliding
or reserved IDs. Existing image paths under `src/assets/blogimages/` still work.

Relative image paths are relative to the content file, so
`../../assets/photos/photo-001/main.jpg` is valid from either flat content folder.
`@/assets/photos/photo-001/main.jpg` also works (quote aliases in YAML frontmatter).
Do not use bare `src/assets/...` paths in frontmatter or MDX imports; use
`@/assets/...` or `../../assets/...` instead. Images are local assets validated
by Astro. Do not place private originals in `public/` or link directly to an
original file. For MDX body images import the local asset and Astro's `Image`
component, as in the detailed template. Markdown local images also use Astro's
processing. Avoid raw `<img>` or raw original download links.

Each photo entry contributes exactly its `image` to gallery surfaces. Extra body
photographs stay inside its detail page. The Dark Side's second image, for example,
is body-only. To give an additional photo its own tile, deliberately create a
separate entry. Do not repeat the primary image in the body. Annotations, quotations,
captions and additional photographs can follow in ordinary Markdown/MDX.

Alt text describes the visual content for someone who cannot see the photograph;
a caption supplies context. Both are optional, but useful alt text is recommended.
If omitted, alt text falls back to caption/title, then the empty string. Keep a
caption out of alt text if it does not describe the photograph.

## Dates, drafts and scheduling

Enter `pubDatetime` manually, with a time and UTC offset. For Vienna:

```yaml
pubDatetime: 2026-11-15T16:30:00+01:00 # winter
# pubDatetime: 2026-07-15T16:30:00+02:00 # summer
modDatetime: 2026-11-16T09:00:00+01:00 # optional edit timestamp
```

Photo galleries, subject photo previews and photo previous/next links sort by
`dateTaken`, newest first, using the EXIF capture date when frontmatter omits it,
then publication time when neither is available. Calendar capture dates are
compared at midnight UTC. Ties use publication time, then the stable filename ID.
The homepage's Recent Photos, blog, feeds and archives use publication time,
newest first; ties use the stable filename ID. Edits never move an entry to the
top. Dates display in English, Europe/Vienna.
A published entry requires `draft: false` and a timestamp at or before the
captured build time. This rule also applies in development, feeds, tags, archives,
search and previous/next links. Future entries need a rebuild after their date;
the static deployment cannot reveal them by itself.

Draft preview is explicit: in a **local, uncommitted working copy**, temporarily
set `draft: false` and a past publication timestamp, inspect it, then restore both
before committing. No production draft routes are generated. For original German
content use `lang: de`; the interface stays English.

`dateTaken`, when supplied, is a quoted real calendar date (`"2026-11-14"`). It is
separate from publication time. EXIF capture dates do not imply a timezone.

## Camera information and privacy

At build time the site reads only camera make, model, lens, focal length,
aperture, exposure, ISO and capture date from the original image. Missing or broken
EXIF never blocks publication. Explicit frontmatter values override extracted
values individually. Delete example camera fields unless you mean to override
those values. Supports phone photographs as well as dedicated cameras.

The optional `camera` object accepts only `make`, `model`, `lens`,
`focalLengthMm`, `aperture`, `exposureSeconds` (seconds, e.g. `0.004` for 1/250),
and positive integer `iso`. Empty fields are omitted. Camera Details is a native,
initially closed disclosure and is absent when there are no populated fields.
Location is optional, deliberate human-readable text; GPS is never inferred.

The build uses Sharp locally rather than Vercel's image optimisation service.
Responsive renditions, emitted originals used by existing PhotoSwipe galleries,
and social previews strip private metadata. Orientation is baked into the pixels
and colour converted to sRGB. Processing is cached by source content. Raw EXIF,
GPS, serial/owner fields and embedded previews are never written to content or
public data. Source originals remain in the repository: its access permissions
still determine who can download those source files. Review the downloadable
images on a Vercel preview before a production release.

Prefer sRGB JPEG for photographs; PNG, WebP and AVIF are also supported. Convert
HEIC/RAW files to JPEG before adding them. Export at a useful web resolution
(roughly 2000–3000px on the long edge), retaining enough pixels for large displays;
Astro makes smaller responsive renditions. Avoid excessive JPEG recompression.
Check portrait/phone orientation and colours in preview. Only the hero or primary
visible photograph is prioritised; gallery tiles load lazily.

## Add a Blog entry and embed photos

Copy `templates/blog-entry.mdx` into `src/data/blog/my-day.mdx`. Required fields
are `title` and `pubDatetime`; drafts default to true. `description` supplies an
optional excerpt for lists. `introduction` is a separate opening paragraph below
the title. `heroImage`, `heroImageAlt`, `heroImagePosition`, `heroBackLinkColor`, `ogImage`, `tags`, `modDatetime`,
`author`, `canonicalURL`, `timezone` and `lang` are optional. `heroImage` and
`ogImage` use local validated assets. `canonicalURL` is only for intentional
cross-publication; normally omit it.

### Hero and introduction

A post's order is: optional full-width hero, publication date/title, optional
introduction, then the body. The writing keeps the site's shared side margins;
the hero extends across the viewport and uses a bounded-height crop. Omit
`heroImage` to have no cover and `introduction` to have no separate opening paragraph.
`description` stays the short excerpt in lists and metadata, so it need not repeat
the introduction.

```yaml
heroImage: ../../assets/blogimages/abendlicht/cover.jpg
heroImageAlt: Two birds flying towards the evening horizon
heroImagePosition: "50% 55%"
heroBackLinkColor: black
introduction: >-
  This is the introduction beneath the title.
  YAML joins these lines into one paragraph.
```

Use `heroImagePosition` to adjust the crop: `center`, `top`, `bottom`, or a CSS
position such as `50% 65%`. The first percentage moves horizontally, the second
vertically. Default is `center`. The introduction is plain text; put rich Markdown
in the body instead.

Set `heroBackLinkColor` to `black` or `white` to choose the “Back to Blog” link
color over the hero for each post. Omit it to choose automatically from the image
behind the link. Without a hero image, the link is always black.

### Position and scale body photographs

Use **`.mdx`** for image components. A `.md` file supports ordinary Markdown and a
frontmatter cover, but component imports need `.mdx`. Keeping the same basename
when changing the extension preserves the post URL. The working example is
`src/data/blog/example-post.mdx` at `/blog/example-post/`.

```mdx
import PostImage from "@/components/PostImage.astro";
import photo from "../../assets/blogimages/abendlicht/cover.jpg";

<PostImage
  src={photo}
  alt="Two birds flying towards the evening horizon"
  align="right"
  width="40%"
  caption="An optional caption."
/>

Write the paragraphs that should wrap around the image directly after it.
```

| Control   | Values                                                                |
| --------- | --------------------------------------------------------------------- |
| `align`   | `left` or `right` for wrapping; `center` for an image on its own line |
| `width`   | `"40%"` for a proportion of the writing column; `{280}` for pixels    |
| `alt`     | A description of the photograph, for accessibility                    |
| `caption` | Optional text beneath the image                                       |

Floated images default to 42% width; centred images default to 100%. Percentages
must be greater than zero and at most 100; pixel widths must be positive. Images
retain their proportions and never exceed the writing column. Under 640px viewport
width, they stack at full column width with text below them. Section headings
clear preceding images, and captions stay with their photograph. The site continues
to optimise these images and strip private metadata at build time.

Use Markdown for prose, headings, lists, quotations and footnotes. Use MDX for
Astro components, including existing `Gallery.astro`/PhotoSwipe galleries. A Blog
entry can refer to an already published photo without creating a duplicate entry:

```mdx
import PhotoFigure from "@/components/PhotoFigure.astro";

<PhotoFigure id="abendlicht" caption="A caption just for this story." />
```

The ID is the Photo filename without extension. An absent, draft or scheduled
photo raises an error rather than leaking it. The embed links to its detail page.

Tags retain exact spelling and capitalisation, including `fotoblog`, `Spanien`
and `Schweden`. Do not translate or normalise existing labels. Tag URLs use a
reversible code-point encoding, so case/accent/punctuation differences cannot
silently merge. Copy tag links from the site rather than constructing them.
Legacy tag URLs continue to work; ambiguous historical slugs show all matching
labels explicitly. No empty draft-only subject pages are created.

“Explore by subject” pages show a single row of square photographs: up to three
on tablet/desktop, or two on mobile. The “All photos ->” link opens the complete
Photos gallery with that exact tag applied. Matching written posts appear below,
with ten posts per page; the photo preview does not create extra pagination pages.
Counts describe all matching public photos/posts, and empty sections are omitted.
Tags on Home, photo details and written posts lead to these shared subject pages.
Filters inside Photos continue to open photo-only galleries. Historical subject
URLs that combine multiple tag spellings offer a separate gallery link for each
exact label.

### Quotes

Ordinary Markdown quotes (`> Quote text`) use italic Literata text, a hanging
opening quotation mark, a closing mark, and a vertical line on the left. Wrapped lines
align with the start of the text.

For a custom attribution, use `Quote` in an `.mdx` post. It shares the song quote
layout, including upright attribution text in the same font, size and color:

```mdx
import Quote from "@/components/Quote.astro";

<Quote>
  Your quote goes here.
  <span slot="attribution">
    Your own text and <a href="https://example.com/">a source link</a>.
  </span>
</Quote>
```

You can also use `attribution="Your own text"` for a plain-text attribution, or
omit attribution altogether. Use `<br />` for deliberate line breaks.

### Song quotes

Use `SongQuote` in a `.mdx` post for indented, italic lyrics framed by music
notes. Import it once, then use it wherever a quote belongs:

The opening note sits to the left of the text. Wrapped lines and deliberate line
breaks align with the start of the quote text; the closing note follows the text.

```mdx
import SongQuote from "@/components/SongQuote.astro";

<SongQuote attribution="Your own text about this song">
  Put a short song quote here.
</SongQuote>
```

The optional `attribution` attribute accepts your own plain text. For links or
formatted text, use the `attribution` slot instead (it takes precedence over the
attribute):

```mdx
<SongQuote>
  Put a short song quote here.
  <span slot="attribution">
    From <a href="https://open.spotify.com/track/YOUR_TRACK_ID">Song title</a>
    {" "}by <a href="https://open.spotify.com/artist/YOUR_ARTIST_ID">Artist</a>
    {" "}— your own words about the song.
  </span>
</SongQuote>
```

Replace the example links with the Spotify URLs for your artist and song. Omit
both the attribute and slot for a quote alone. Use `<br />` for deliberate line
breaks within the quote. The notes are decorative and hidden from screen readers.
Ordinary Markdown blockquotes use the same structure with quotation marks.

## Preview, checks and deployment

```sh
npm install
npm run dev
npm test
npm run lint
npm run format:check
npm run build
```

Open the URL printed by `npm run dev`. The production build includes Astro type
checks, responsive images, sitemap, RSS and a Pagefind index. Search in development
requires a previous build; rebuild after content changes to refresh it.

Review changes in Git, commit on a branch and open a pull request. The existing
Vercel project supplies preview deployments through its configured Git workflow.
Inspect the preview on desktop/mobile, with keyboard navigation and dark mode,
including image downloads, before merging for production. Implementation of the
redesign does not itself authorise production deployment.

## Troubleshooting and redirects

- `UnknownContentCollectionError: Unexpected error while rendering → ...` after
  adding or renaming MDX: Astro 6 can refresh the content data while retaining an
  old MDX import map in its development renderer. The `content-imports-hmr` Vite
  plugin refreshes these generated import maps and renderer caches automatically
  for both Photos and Blog. Restart `npm run dev` once if an older server is
  still running. Run `npm run test:content-hmr` to check adding, editing, renaming
  and deleting entries against an isolated development server.
- Schema error: check YAML indentation, required timestamp/image/title (Blog only),
  positive camera numbers, real dates and non-empty optional text. Omit absent
  fields instead of writing empty strings. Never use build-time “now”.
- Missing image: check filename case and the path relative to the content file.
  Assets must exist locally; imported paths retain the extension.
- Entry absent: check `draft`, its publication timestamp/offset and rebuild time.
- Repeated lead image: remove it from the body or an in-post gallery's image list.
- A filename rename changes the URL. Add an exact permanent redirect in
  `vercel.json` from the old route to the final canonical route (also its
  `/index.png` social endpoint where applicable). Update internal links; avoid
  redirect chains and loops. Do not redirect all dated entries to one index.

`src/data/migration-map.json` records all 31 original file paths, exact old URLs,
primary images, publication dates, draft states and canonical destinations. Legacy
post indexes map explicitly to Archives. Legacy RSS GUIDs retain their old absolute
URLs while links point to canonical entries, to avoid reannouncing the migration.
See `docs/migration.md` for the rollback baseline and validation approach.
