import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

import vercel from "@astrojs/vercel";
import migration from "./src/data/migration-map.json";
import sanitisedImages from "./src/utils/sanitiseImages";
import contentImportsHmr from "./src/utils/contentImportsHmr";

import remarkGfm from "remark-gfm";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  redirects: {
    ...Object.fromEntries(
      migration.flatMap(item => [
        [item.oldUrl, { status: 308, destination: item.destination }],
        [
          item.oldSocialImage,
          { status: 308, destination: `${item.destination}index.png` },
        ],
      ])
    ),
    "/posts": { status: 308, destination: "/archives/" },
    "/posts/2": { status: 308, destination: "/archives/" },
  },

  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
    mdx(),
    sanitisedImages(),
  ],

  markdown: {
    remarkPlugins: [
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
      remarkGfm, // footnotes, tables, strikethrough, autolinks, task lists
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },

  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss(), contentImportsHmr()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },

  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
    responsiveStyles: true,
    layout: "constrained",
  },

  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },

  adapter: vercel({ imageService: false }),
});
