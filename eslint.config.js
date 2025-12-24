// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

// Root ESLint config intentionally minimal.
// Each workspace (apps/*, packages/*) should own its own eslint.config.js.

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/.turbo/**",
    ],
  },
];
