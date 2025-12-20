import globals from "globals";
import { baseConfig } from "./base.js";
import { createCompat } from "./compat.js";

/**
 * React (web) preset: base TS + React + a11y + import hygiene.
 *
 * Notes:
 * - Uses FlatCompat so we can consume standard plugin recommended presets.
 * - Keep this broadly applicable (Vite/CRA/Next) without framework-specific rules.
 */
export function reactConfig() {
  const compat = createCompat();

  return [
    ...baseConfig(),
    ...compat.extends(
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript"
    ),
    {
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      settings: {
        react: { version: "detect" },
        // Makes eslint-plugin-import work well in TS monorepos.
        "import/resolver": {
          typescript: true,
          node: true,
        },
      },
      rules: {
        // React 17+ (and modern toolchains) don't require React in scope.
        "react/react-in-jsx-scope": "off",
        // We use TypeScript types instead of runtime prop-types.
        "react/prop-types": "off",
      },
    },
  ];
}


