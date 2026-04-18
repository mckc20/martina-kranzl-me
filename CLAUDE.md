# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro using the AstroPaper theme. The site is deployed on Netlify.

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
- Blog posts live in `src/data/blog/` organized by date: `YYYY/MM/DD/slug.md`
- Content schema defined in `src/content.config.ts` using Zod validation
- Posts require frontmatter with: `title`, `pubDatetime`, `description`, `tags`
- Optional frontmatter: `featured`, `draft`, `modDatetime`, `ogImage`, `canonicalURL`
- Draft posts (`draft: true`) are excluded from production builds

### Key Directories
- `src/pages/` - File-based routing (Astro pages)
- `src/components/` - Reusable Astro components
- `src/layouts/` - Page layouts (`Layout.astro` is the base, `PostDetails.astro` for posts)
- `src/utils/` - TypeScript utilities for post filtering, sorting, slug generation
- `src/config.ts` - Site configuration (author, posts per page, feature toggles)
- `src/constants.ts` - Social links and share links arrays

### Dynamic Routes
- `/posts/[...slug]/` - Individual blog posts (generated from content collection)
- `/posts/[...page]/` - Paginated post listings
- `/tags/[tag]/[...page]/` - Posts filtered by tag

### OG Image Generation
- Dynamic OG images generated at build time via `src/pages/posts/[...slug]/index.png.ts`
- Uses Satori for SVG rendering and Resvg for PNG conversion
- Templates in `src/utils/og-templates/`

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
