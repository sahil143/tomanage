import js from "@eslint/js";
import globals from "globals";
import { createCompat } from "./compat.js";

/**
 * Base config for all TypeScript in the monorepo (apps + packages).
 * Keep this low-opinionated; layer app/library specifics in other presets.
 */
export function baseConfig() {
  const compat = createCompat();

  return [
    {
      ignores: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.expo/**",
        "**/.turbo/**",
        "**/coverage/**",
      ],
    },
    js.configs.recommended,
    ...compat.extends("plugin:@typescript-eslint/recommended"),
    {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...globals.es2024,
        },
      },
      rules: {
        // Prefer letting TypeScript handle these where possible.
        "no-unused-vars": "off",
        // Keep baseline config flexible; many SDKs need `any` at integration boundaries.
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ];
}


