import type { Options } from "tsup";

export default <Options> {
  entryPoints: ["src/*.ts", "src/snippets/index.ts"],
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
};
