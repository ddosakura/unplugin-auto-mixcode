import { URL, fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Inspect from "vite-plugin-inspect";

import { presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  presets: [presetRecommend({ pages: { dirs: ["src/views"] } })],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    mixcode,
    vue(),
    Components({}),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      dirs: ["src/composables", "src/stores"],
      resolvers: [mixcode.resolver],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
