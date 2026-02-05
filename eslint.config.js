import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  /* -------------------------------------------------- */
  /* Global ignores (REPLACES .eslintignore)            */
  /* -------------------------------------------------- */
  {
    ignores: [
      "public/**",
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
    ],
  },

  /* ------------------ NODE FILES ------------------ */
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node, // ✅ enables process, __dirname, etc
      },
    },
  },
  /* -------------------------------------------------- */
  /* Base JS rules                                      */
  /* -------------------------------------------------- */
  js.configs.recommended,

  /* -------------------------------------------------- */
  /* TypeScript rules                                  */
  /* -------------------------------------------------- */
  ...tseslint.configs.recommended,

  /* -------------------------------------------------- */
  /* React Hooks rules                                 */
  /* -------------------------------------------------- */
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",

      // 👇 allow intentional effects
      "react-hooks/exhaustive-deps": "warn",

      // 👇 safe defaults
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
