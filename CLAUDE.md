# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro using the AstroPaper theme. The site is deployed on Vercel, using the `@astrojs/vercel` adapter. Images are processed locally by Sharp and sanitised at build time; Vercel image service is disabled.

## Common Commands

```bash
npm run dev              # Start development server
npm run build            # Full build: type check → astro build → pagefind index
npm run preview          # Preview production build locally
npm run lint             # Run ESLint
npm run format:check     # Check code formatting with Prettier
npm run format           # Auto-format code with Prettier
```

## Architecture

### Content System
- Flat Photos and Blog content lives in `src/data/photos/*.{md,mdx}` and `src/data/blog/*.{md,mdx}`. See `docs/publishing.md`.
- Content schema defined in `src/content.config.ts` using Zod validation
- Blog requires title and pubDatetime; Photos requires image and pubDatetime. Draft defaults to true.
- Optional metadata and examples are documented in `docs/publishing.md`; templates live outside content loaders.
- Draft and future posts are excluded everywhere, including development. Publication timestamps alone determine ordering.

### Key Directories
- `src/pages/` - File-based routing (Astro pages)
- `src/components/` - Reusable Astro components
- `src/layouts/` - Page layouts (`Layout.astro` is the base, `PhotoDetails.astro` and `BlogDetails.astro` for entries)
- `src/utils/` - TypeScript utilities for post filtering, sorting, slug generation
- `src/config.ts` - Site configuration (author, posts per page, feature toggles)
- `src/constants.ts` - Social links and share links arrays

### Dynamic Routes
- `/photos/[slug]/` and `/blog/[slug]/` - Canonical entries; dated `/posts/` URLs permanently redirect
- `/photos/page/[page]/` and `/blog/page/[page]/` - Paginated listings
- `/tags/[tag]/[...page]/` - Posts filtered by tag

### OG Image Generation
- Social images are generated locally with Sharp at `/photos/[slug]/index.png`, `/blog/[slug]/index.png` and `/og.png`; old dated endpoints redirect. No remote font requests during builds.

### Code Highlighting
Shiki with custom transformers supporting:
- `// [!highlight]` - Line highlighting
- `// [!highlight-word words]` - Word highlighting
- `// [!code ++]` / `// [!code --]` - Diff notation

### Styling
- Tailwind CSS with Typography plugin
- Dark/light mode via CSS variables (toggle in `public/toggle-theme.js`)
- Global styles in `src/styles/global.css`

## Documentation Standards

- Store feature docs in `/docs/features/`
- Use format: `feature-name.md`
- Include: purpose, usage, configuration, examples

## CI/CD

GitHub Actions runs on PRs: lint → format check → build. All three must pass.
