import { existsSync } from "node:fs";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { validateIds } from "./utils/content/publication";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
const text = z.string().trim().min(1);
export const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(value => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Use a real calendar date (YYYY-MM-DD)");
const shared = {
  pubDatetime: z.date(),
  modDatetime: z.date().nullable().optional(),
  draft: z.boolean().default(true),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .refine(value => /\S/.test(value))
    )
    .default([]),
  author: text.default(SITE.author),
  canonicalURL: z.url().optional(),
  timezone: text.optional(),
  lang: text.default("en"),
};
export const cameraSchema = z
  .object({
    make: text.optional(),
    model: text.optional(),
    lens: text.optional(),
    focalLengthMm: z.number().positive().optional(),
    aperture: z.number().positive().optional(),
    exposureSeconds: z.number().positive().optional(),
    iso: z.number().int().positive().optional(),
  })
  .strict();

function stableFilename() {
  const seen = new Map<string, string>();
  return ({ entry, base }: { entry: string; base: URL }) => {
    const id = entry.split("/").pop()!.replace(/\.(md|mdx)$/, "");
    validateIds([{ id }]);
    const previousFile = seen.get(id);
    if (
      previousFile &&
      previousFile !== entry &&
      existsSync(new URL(previousFile, base))
    )
      throw new Error(`Duplicate content filename: ${entry}`);
    seen.set(id, entry);
    return id;
  };
}
const photos = defineCollection({
  loader: glob({
    pattern: "[^_]*.{md,mdx}",
    base: "./src/data/photos",
    generateId: stableFilename(),
  }),
  schema: ({ image }) =>
    z.object({
      ...shared,
      image: image(),
      title: text.optional(),
      caption: text.optional(),
      alt: text.optional(),
      dateTaken: calendarDate.optional(),
      location: text.optional(),
      camera: cameraSchema.optional(),
      ogImage: image().optional(),
      description: z.string().optional(),
    }),
});
const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
    generateId: stableFilename(),
  }),
  schema: ({ image }) =>
    z.object({
      ...shared,
      title: text,
      description: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: text.optional(),
      heroImagePosition: text.optional(),
      heroBackLinkColor: z.enum(["black", "white"]).optional(),
      introduction: text.optional(),
      ogImage: image().optional(),
    }),
});
export const collections = { photos, blog };
