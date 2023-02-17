/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["./typescript.js"],
  overrides: [
    {
      files: ["**/*.(j|t)sx"],
      extends: ["./react.js"],
    },
    {
      files: ["**/*.vue"],
      extends: ["./vue.js"],
    },
  ],
};
