import { defineConfig } from "vite";

import UnoCSS from "unocss/vite";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    UnoCSS(),
    {
      name: "fix",
      enforce: "pre",
      transform(code) {
        return code.replace(
          "/** @jsxImportSource @mixcode/jsx/dist */",
          "/** @jsxImportSource @mixcode/jsx */",
        );
      },
    },
  ],
});
