import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin
    },
    rules: {
      // ❗ ЗАБОРОНЯЄ .js / .ts В ІМПОРТАХ
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
          js: "never"
        }
      ]
    }
  }
];
