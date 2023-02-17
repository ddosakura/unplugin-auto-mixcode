/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  plugins: [
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-empty": ["error", { "allowEmptyCatch": true }],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
    }],
  },
};
