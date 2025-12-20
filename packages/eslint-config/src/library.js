import globals from "globals";
import { baseConfig } from "./base.js";
import { createCompat } from "./compat.js";

/**
 * TS library preset: base TS + import rules + Node globals (for build tooling).
 */
export function libraryConfig() {
  const compat = createCompat();

  return [
    ...baseConfig(),
    ...compat.extends("plugin:import/recommended", "plugin:import/typescript"),
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
      settings: {
        "import/resolver": {
          typescript: true,
          node: true,
        },
      },
    },
  ];
}


