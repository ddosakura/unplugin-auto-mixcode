import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";

import AutoMixcode, {
  createSnippetResolver,
  snippets,
} from "@mixcode/unplugin-auto-mixcode";

// @ts-ignore
import unocssConfig from "../../unocss.config";

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
      resolvers: [createSnippetResolver(snippets)],
    }),
    AutoMixcode.vite({}),
    {
      name: "tmp",
      async handleHotUpdate({ file }) {
        console.log("[hook handleHotUpdate]", file);
      },
    },
  ],
});
