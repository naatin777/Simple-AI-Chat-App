import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const strictFiles = [
  "lib/**/*.{ts,tsx}",
  "stores/**/*.{ts,tsx}",
  "hooks/**/*.{ts,tsx}",
  "app/api/**/*.{ts,tsx}",
  "scripts/**/*.ts",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: strictFiles,
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-implicit-coercion": "error",
    },
  },
  {
    files: ["hooks/use-mobile.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["lib/api/generated/**/*", "lib/api/custom-fetch.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: [".storybook/**/*", "**/*.stories.{ts,tsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: [
      "eslint.config.mjs",
      "postcss.config.mjs",
      "vitest.config.ts",
      "orval.config.ts",
      "drizzle.config.ts",
    ],
    extends: [tseslint.configs.disableTypeChecked],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    "next-env.d.ts",
    "lib/api/generated/**",
    "public/pdf.worker.min.mjs",
    "scripts/copy-pdf-worker.mjs",
  ]),
  ...storybook.configs["flat/recommended"],
]);

export default eslintConfig;
