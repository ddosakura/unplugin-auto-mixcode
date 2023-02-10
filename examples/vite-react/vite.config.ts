import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Inspect from "vite-plugin-inspect";

import { macroRegExp, presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  dts: "src/auto-mixcode.d.ts",
  presets: [presetRecommend],
  snippets: {
    foo: {
      macro(s) {
        s.replace(macroRegExp("foo"), 'import "~mixcode/foo/bar"');
      },
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [
    Inspect(),
    UnoCSS(),
    react(),
    AutoImport({
      // eslintrc: { enabled: true },
      dts: "src/auto-imports.d.ts",
      imports: [
        "react",
        // { "@mixcode/glue-react": ["usePromisifyDialog"] },
      ],
      dirs: ["src/hooks", "src/components"],
      resolvers: [mixcode.resolver],
    }),
    mixcode,
  ],
});
