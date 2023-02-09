import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Inspect from "vite-plugin-inspect";

// @ts-ignore
import unocssConfig from "../../unocss.config";

import { presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  dts: "src/auto-mixcode.d.ts",
  presets: [presetRecommend],
});

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [
    Inspect(),
    UnoCSS(unocssConfig),
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
