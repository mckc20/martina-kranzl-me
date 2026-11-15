My personal blog built with [Astro](https://astro.build/) and the [AstroPaper theme](https://astro.build/themes/details/astropaper/).

Web: [https://rafael.cordones.me](https://rafael.cordones.me)

## 📜 License

Licensed under the MIT License, Copyright © 2026

## Photos gallery

The **Photos** tab at `/photos` displays photos explicitly selected in each blog
post's frontmatter, including posts that also contain text:

```yaml
photos:
  - src: "@/assets/blogimages/orion/orion-ueber-den-bergen.jpg"
    alt: "Orion above the mountains"
    caption: "A winter night on the Tauplitzalm"
    showInGallery: true
  - src: "@/assets/blogimages/orion/orion.jpg"
    showInGallery: false
```

Use local image paths validated by Astro. `photos` defaults to an empty list;
`showInGallery` defaults to `false`, so new photos require opt-in. Alt text falls
back to the post title. Gallery descriptions use captions when supplied, otherwise
the post title. The original post
body and its PhotoSwipe galleries work independently of these selections.

Draft and future-dated posts are always excluded, including in development.
Posts appear newest first, with photos in frontmatter order; repeated sources
appear once. Scheduled photos require a new build after publication time.

Visitors can switch between masonry and square layouts using the floating bottom-left
toggle. Their choice is saved locally when storage is available. Photos load in
batches of 15 as visitors scroll and open in a keyboard- and touch-enabled Viewer.js viewer.

See [Photos gallery documentation](docs/features/photos-gallery.md) for details.
