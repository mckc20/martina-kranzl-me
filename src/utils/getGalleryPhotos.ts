import type { ImageMetadata } from "astro";

export interface PhotoPost {
  id: string;
  filePath?: string;
  data: {
    title: string;
    pubDatetime: Date;
    draft?: boolean;
    photos?: {
      src: ImageMetadata;
      alt?: string;
      caption?: string;
      showInGallery?: boolean;
    }[];
  };
}

export function getGalleryPhotos(posts: PhotoPost[], now = Date.now()) {
  const seen = new Set<string>();
  return posts
    .filter(post => !post.data.draft && post.data.pubDatetime.getTime() <= now)
    .sort(
      (a, b) =>
        b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime() ||
        a.id.localeCompare(b.id)
    )
    .flatMap(post =>
      (post.data.photos ?? []).flatMap(photo => {
        if (!photo.showInGallery || seen.has(photo.src.src)) return [];
        seen.add(photo.src.src);
        return [
          {
            ...photo,
            title: post.data.title,
            postId: post.id,
            postFilePath: post.filePath,
            alt: photo.alt || post.data.title,
          },
        ];
      })
    );
}
