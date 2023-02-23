/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  plugins: [
    "react",
  ],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "./typescript.js",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/prop-types": 0,
    "react/jsx-no-undef": 0,
  },
};
