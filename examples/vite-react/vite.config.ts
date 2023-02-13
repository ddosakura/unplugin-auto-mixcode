import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Inspect from "vite-plugin-inspect";

import { presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  dts: "src/auto-mixcode.d.ts",
  presets: [presetRecommend()],
  snippets: {
    foo: {
      macro() {
        return 'import "~mixcode/foo/bar"';
      },
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [
    Inspect(),
    mixcode,
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
  ],
  resolve: {
    alias: { "@": "./src" },
  },
});
