import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue2";
import AutoImport from "unplugin-auto-import/vite";

import { presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  dts: false,
  cache: false,
  presets: [presetRecommend()],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mixcode,
    vue(),
    AutoImport({
      dts: false,
      resolvers: [mixcode.resolver],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
