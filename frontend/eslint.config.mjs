// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // Enables prettier as an ESLint rule and throws errors when format issues are found
      "prettier/prettier": "error",
    },
  },

  // Combine with Prettier's recommended config to disable conflicts
  prettier,

  // Override default ignores of eslint-config-next
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
