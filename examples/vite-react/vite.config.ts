import { basename } from "node:path";

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Inspect from "vite-plugin-inspect";

// @ts-ignore
import unocssConfig from "../../unocss.config";

const PREFIX_MIXCODE = "~mixcode/";
const IINJECTED_MIXCODE_DIALOG = "__unplugin_auto_mixcode_dialog_";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    UnoCSS(unocssConfig),
    react(),
    AutoImport({
      dts: "src/auto-imports.d.ts",
      imports: [
        "react",
        {
          "@mixcode/glue-react": ["usePromisifyDialog"],
        },
      ],
      dirs: ["src/hooks", "src/components"],
      resolvers: [
        (name) => {
          if (name === "useExampleDialog") {
            return {
              name: "default",
              as: "useExampleDialog",
              from: `${PREFIX_MIXCODE}useExampleDialog`,
            };
          }
          // console.log("resolve", name);
        },
      ],
      eslintrc: { enabled: true },
    }),
    {
      name: "tmp",
      enforce: "pre",
      async handleHotUpdate({ file }) {
        console.log("[hook handleHotUpdate]", file);
      },
      async resolveId(source, _importer) {
        if (!source.startsWith(PREFIX_MIXCODE)) return;
        return source.endsWith(".tsx") ? source : `${source}.tsx`;
      },
      async load(id) {
        if (!id.startsWith(PREFIX_MIXCODE)) return;
        const fn = basename(id, ".tsx");
        const componentName = fn.replace("use", "");
        return {
          map: { mappings: "" },
          code: `export default function(props) {\n  return usePromisifyDialog(${componentName}, props);\n}`,
        };
      },
      async transform(code, id, options?) {
        let counter = 0;
        const injected = code.replace(
          new RegExp("([a-zA-Z_]\\w*) = use([A-Z]\\w*)Dialog\\(", "g"),
          (_$0, $1, $2) =>
            `[${IINJECTED_MIXCODE_DIALOG}${counter++}, ${$1}] = use${$2}Dialog(`,
        );
        const dialogs = Array({ length: counter })
          .map((_, index) => {
            const dialog = `${IINJECTED_MIXCODE_DIALOG}${index}`;
            return `{typeof ${dialog} === 'undefined' ? null : ${dialog}}`;
          })
          .join("");
        return injected.replace(
          new RegExp("\\{\\/\\*\\* @mixcode dialog \\*\\/}", "g"),
          dialogs,
        );
      },
    },
  ],
});
