import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import exifr from "exifr";
import type { CollectionEntry } from "astro:content";
import { cameraSchema, calendarDate } from "@/content.config";

const cache = new Map<
  string,
  Promise<{ camera?: Record<string, string | number>; dateTaken?: string }>
>();
export async function captureMetadata(entry: CollectionEntry<"photos">) {
  // Read the original before output sanitisation. Never persist raw metadata.
  const source = await fs.readFile(entry.filePath!, "utf8");
  const front = parseYaml(source.split(/^---\s*$/m)[1]);
  const ref = front.image as string;
  const filename = ref.startsWith("@/")
    ? path.resolve("src", ref.slice(2))
    : ref.startsWith("src/")
      ? path.resolve(ref)
      : path.resolve(path.dirname(entry.filePath!), ref);
  if (!cache.has(filename))
    cache.set(
      filename,
      (async () => {
        try {
          const raw = await exifr.parse(filename, {
            pick: [
              "Make",
              "Model",
              "LensModel",
              "FocalLength",
              "FNumber",
              "ExposureTime",
              "ISO",
              "DateTimeOriginal",
            ],
            gps: false,
            xmp: false,
            iptc: false,
            makerNote: false,
            userComment: false,
            reviveValues: false,
          });
          const candidates = {
            make: raw?.Make,
            model: raw?.Model,
            lens: raw?.LensModel,
            focalLengthMm: raw?.FocalLength,
            aperture: raw?.FNumber,
            exposureSeconds: raw?.ExposureTime,
            iso: raw?.ISO,
          };
          const camera: Record<string, string | number> = {};
          for (const [key, value] of Object.entries(candidates)) {
            const result = cameraSchema.partial().safeParse({ [key]: value });
            if (value !== undefined && result.success) camera[key] = value;
          }
          const match =
            typeof raw?.DateTimeOriginal === "string" &&
            raw.DateTimeOriginal.match(/^(\d{4}):(\d{2}):(\d{2})/);
          const dateTaken = match
            ? `${match[1]}-${match[2]}-${match[3]}`
            : undefined;
          return {
            camera,
            dateTaken: calendarDate.safeParse(dateTaken).success
              ? dateTaken
              : undefined,
          };
        } catch {
          return {};
        }
      })()
    );
  const extracted = await cache.get(filename)!;
  return {
    dateTaken: entry.data.dateTaken ?? extracted.dateTaken,
    camera: { ...extracted.camera, ...entry.data.camera },
  };
}
