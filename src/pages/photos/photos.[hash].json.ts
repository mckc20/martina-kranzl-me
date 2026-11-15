// Local photo-selection adapter for AntfuStyle's PhotoView data endpoint.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";
import type { APIRoute, ImageMetadata } from "astro";
import { getGalleryPhotos } from "@/utils/getGalleryPhotos";
import { getPath } from "@/utils/getPath";
import { generatePlaceholder } from "@/utils/galleryPlaceholder";

export interface PhotoItem {
  uuid: string;
  src: string;
  desc: string;
  alt: string;
  postUrl: string;
  thumbnail: string;
  placeholder: string;
  aspectRatio: number;
}

const photos = getGalleryPhotos(await getCollection("blog"));
export const hash = createHash("sha256")
  .update(JSON.stringify(photos))
  .digest("hex")
  .slice(0, 8);

let photoData: Promise<PhotoItem[]> | undefined;

async function buildPhotoData(items: typeof photos): Promise<PhotoItem[]> {
  return Promise.all(
    items.map(async photo => {
      const src = photo.src as ImageMetadata & { fsPath: string };
      const aspectRatio = src.width / src.height;
      const [thumbnail, placeholder] = await Promise.all([
        getImage({ src, width: 720, height: 720 / aspectRatio }),
        generatePlaceholder(
          readFileSync(src.fsPath),
          src.width,
          src.height,
          100
        ),
      ]);
      return {
        uuid: createHash("sha256").update(src.src).digest("hex").slice(0, 8),
        src: src.src,
        desc: photo.caption || photo.title,
        alt: photo.alt,
        postUrl: getPath(photo.postId, photo.postFilePath),
        thumbnail: thumbnail.src,
        placeholder,
        aspectRatio,
      };
    })
  );
}

export const GET: APIRoute = async ({ params }) => {
  const data = import.meta.env.DEV
    ? await buildPhotoData(getGalleryPhotos(await getCollection("blog")))
    : await (photoData ??= buildPhotoData(photos));
  return new Response(JSON.stringify([params.hash ?? hash, data]), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        import.meta.env.DEV || !params.hash
          ? "no-store"
          : "public, max-age=31536000, immutable",
    },
  });
};

export function getStaticPaths() {
  return [{ params: { hash } }];
}
