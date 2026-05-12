# Post Header Image

## Purpose

Adds an optional full-width header image to individual blog posts. The image is rendered above the post date, title, tags, and article body, giving photo-heavy posts a visual lead-in without requiring the image to be embedded manually in the MDX content.

## Usage

Add `heroImage` to the post frontmatter. Add `heroImageAlt` when the image needs descriptive alternative text.

```mdx
---
title: "Sonnenuntergang im Weingarten"
pubDatetime: 2024-10-20T18:00:00+02:00
description: "Ein Abend im Weingarten."
tags: ["photoblog"]
heroImage: "../../../../assets/blogimages/sonnenuntergang-im-weingarten/cover.jpg"
heroImageAlt: "Sonnenuntergang über einem Weingarten"
---

Post content starts here.
```

For images that already live under `public/` or are hosted externally, use a URL string:

```mdx
---
heroImage: "/images/posts/sonnenuntergang-cover.jpg"
heroImageAlt: "Sonnenuntergang über einem Weingarten"
---
```

## Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `heroImage` | `ImageMetadata \| string` | *none* | Header image rendered above the post content |
| `heroImageAlt` | `string` | `""` | Alternative text for the header image |

### Local optimized images

When `heroImage` points to a local source image resolved by Astro's content image pipeline, the layout renders it with Astro's `<Image>` component. This enables responsive widths and image optimization.

Use a relative path from the MDX file to the image file. For the current blog structure, posts live in `src/data/blog/YYYY/MM/DD/` and post images usually live in `src/assets/blogimages/<post-slug>/`, so the relative path commonly starts with `../../../../assets/blogimages/`.

### URL strings

When `heroImage` is a plain string URL, the layout renders a regular `<img>`. This is useful for images in `public/` or externally hosted images.

Examples:

```yaml
heroImage: "/images/posts/example-cover.jpg"
heroImage: "https://example.com/example-cover.jpg"
```

## Examples

### Header image only

```mdx
---
title: "Blätterregen"
pubDatetime: 2026-05-06T12:00:00+02:00
description: "Ein kurzer Fotopost."
tags: ["photoblog"]
heroImage: "../../../../assets/blogimages/blaetterregen/cover.jpg"
heroImageAlt: "Gelbe Blätter vor blauem Himmel"
---
```

### Header image and in-post image

Use `heroImage` for the wide header. If the same image should also appear inside the article body, import and render it separately in the MDX content:

```mdx
---
title: "Blätterregen"
pubDatetime: 2026-05-06T12:00:00+02:00
description: "Ein kurzer Fotopost."
tags: ["photoblog"]
heroImage: "../../../../assets/blogimages/blaetterregen/cover.jpg"
heroImageAlt: "Gelbe Blätter vor blauem Himmel"
---

import { Image } from "astro:assets";
import cover from "@/assets/blogimages/blaetterregen/cover.jpg";

<Image src={cover} alt="Gelbe Blätter vor blauem Himmel" />
```

## Implementation details

- **Schema**: `src/content.config.ts` defines `heroImage` as `image().or(z.string()).optional()` and `heroImageAlt` as an optional string.
- **Layout**: `src/layouts/PostDetails.astro` renders the image before the post metadata when `heroImage` is present.
- **Sizing**: The header uses a full-viewport-width layout with a `21 / 8` aspect ratio and `object-cover`, so the image may be cropped horizontally or vertically depending on the viewport.
- **Optimization**: Local images resolved as Astro image metadata are rendered through `<Image>` with responsive widths; URL strings are rendered with a plain `<img>`.
