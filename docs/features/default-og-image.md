# Default OG Image Generator

## Purpose

Generates a personalized default Open Graph image for the site by compositing square tiles from blog photos into a 3D-perspective mosaic on a white background with drop shadows. Replaces the stock AstroPaper OG image with one that showcases the blog's own photography.

## Usage

```bash
npm run generate:og
```

This produces `public/astropaper-og.jpg` (1200×630px progressive JPEG), which is used as the default OG image for non-post pages (homepage, about, tags, etc.).

Photos are automatically selected from `src/assets/images/blog/photoblog/` by picking the 16 newest files (by modification date). To update the OG image after adding new photos, just re-run the command.

## Configuration

All settings are constants at the top of the script:

| Constant | Default | Description |
|----------|---------|-------------|
| `TILE_SIZE` | `300` | Width/height of each square tile in pixels |
| `GAP` | `24` | Space between tiles (filled with background color) |
| `COLS` / `ROWS` | `4` / `4` | Grid dimensions (16 tiles total) |
| `ROTATION_DEG` | `-25` | Rotation angle in degrees (negative = clockwise) |
| `BG_COLOR` | `#ffffff` | White background color |
| `SHADOW_OFFSET` | `8` | Shadow offset in pixels |
| `SHADOW_BLUR` | `12` | Shadow blur radius |

### Adjusting the 3D effect

- **Rotation**: Change `ROTATION_DEG` (e.g., `-15` for a subtler tilt, `-35` for more dramatic).
- **Perspective skew**: Modify the affine matrix in the `sharp.affine()` call. The default `[[1, 0.15], [-0.1, 1]]` applies a vertical shear and slight horizontal compression.

## Examples

Regenerate after adding new photoblog images:

```bash
npm run generate:og
```

## Implementation details

- **Script**: `scripts/generate-og-image.mjs`
- **Output**: `public/astropaper-og.jpg`
- **Dependency**: `sharp` (npm, already in project dependencies)
- **Config reference**: `src/config.ts` defines `ogImage: "astropaper-og.jpg"` which layouts resolve to this file
- **Pipeline**: Auto-select 16 newest photos → resize to square tiles → add drop shadows → composite into grid on white background → place on oversized canvas → rotate → affine skew → crop center to 1200×630 → save as progressive JPEG
