import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Inspect from "vite-plugin-inspect";

import { presetRecommend, snippetI18n } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  dts: "src/auto-mixcode.d.ts",
  presets: [presetRecommend()],
  snippets: {
    i18n: snippetI18n(),
    foo: {
      macro() {
        return 'import "~mixcode/foo/bar"';
      },
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
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
        "react-router-dom",
        "jotai",
        // { "@mixcode/glue-react": ["usePromisifyDialog"] },
      ],
      dirs: ["src/hooks", "src/components"],
      resolvers: [mixcode.resolver],
    }),
  ],
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
