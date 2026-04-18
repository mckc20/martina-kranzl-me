# Gallery

## Purpose

An image gallery component for MDX blog posts powered by [PhotoSwipe v5](https://photoswipe.com). Renders a grid or masonry layout of optimized thumbnails that open in a full-screen lightbox with navigation, swipe, and zoom support.

## Usage

Import the component and glob your images in an MDX post:

```mdx
import Gallery from '@/components/Gallery.astro';

export const photos = Object.values(
  import.meta.glob('./images/*.jpg', { eager: true, import: 'default' })
);

<Gallery images={photos} />
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ImageMetadata[]` | *required* | Array of pre-globbed/imported images |
| `captions` | `Record<string, string>` | `{}` | Map of filename to caption text |
| `layout` | `"grid" \| "masonry"` | `"grid"` | Thumbnail layout style |
| `columns` | `number` | `3` | Number of columns on desktop (always 2 on mobile) |

### Captions

Captions are keyed by the original filename (e.g. `"sunset.jpg"`). They appear as an overlay at the bottom of the lightbox when viewing that image.

```mdx
<Gallery
  images={photos}
  captions={{
    "sunset.jpg": "Sunset over the lake",
    "mountain.jpg": "Mountain view at dawn",
  }}
/>
```

### Layout modes

- **grid** — Uniform square cells. Good for photos that work well cropped to 1:1.
- **masonry** — Preserves natural aspect ratios using CSS columns. Good for mixed portrait/landscape sets.

```mdx
<Gallery images={photos} layout="masonry" columns={2} />
```

## Examples

### Basic grid (3 columns)

```mdx
<Gallery images={photos} />
```

### Masonry with captions

```mdx
<Gallery
  images={photos}
  layout="masonry"
  columns={4}
  captions={{
    "photo1.jpg": "First photo",
    "photo2.jpg": "Second photo",
  }}
/>
```

## Implementation details

- **Component**: `src/components/Gallery.astro`
- **Dependency**: `photoswipe` (npm)
- **Thumbnails**: Rendered with Astro's `<Image>` component for automatic optimization (responsive `widths` and `sizes`)
- **Lightbox**: PhotoSwipe Lightbox with dynamic import of the full PhotoSwipe module (code-split)
- **View transitions**: Re-initializes on `astro:after-swap` events
- **Styling**: Gallery breaks out of the `app-prose` max-width via negative margins for wider visual impact; prose `img` border is removed inside `.gallery-wrapper`
