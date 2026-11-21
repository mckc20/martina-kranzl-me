import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  { rules: { "no-console": "error" } },
  // CLI generators intentionally report progress; keep the vendor analytics snippet intact.
  { files: ["scripts/*.mjs"], rules: { "no-console": "off" } },
  {
    files: ["src/components/PostHogWebSnippet.astro"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "no-var": "off",
      "prefer-rest-params": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      ".astro",
      ".vercel/**",
      ".netlify/**",
      "public/pagefind/**",
    ],
  },
];
