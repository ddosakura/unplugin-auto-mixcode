import { basename, dirname } from "node:path";

import { snippets } from "@/snippets";
import { createFilter } from "@rollup/pluginutils";
import { createUnplugin } from "unplugin";

import { Context } from "./ctx";
import type { Options } from "./types";
import {
  PREFIX_MIXCODE_SNIPPET,
  checkUnimportPlugn,
  checkVuePlugin,
  name,
} from "./utils";

export default createUnplugin<Options>((options = {}) => {
  const filter = createFilter(
    options.include || [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
  );
  const ctx: Context = new Context({
    framework: "react",
    ...options,
  });

  return {
    // TODO: writeConfigFiles
    name,
    enforce: "pre",

    transformInclude(id) {
      return filter(id);
    },
    transform(code, id) {
      return ctx.transform(code, id);
    },

    resolveId(source, _importer) {
      if (!source.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      const snippetType = basename(dirname(source));
      const { suffix = "" } = snippets[snippetType] ?? {};
      if (!suffix) return;
      return source.endsWith(suffix) ? source : `${source}${suffix}`;
    },
    async load(id) {
      if (!id.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      const snippetType = basename(dirname(id));
      const { suffix = "", load } = snippets[snippetType] ?? {};
      if (!load) return;
      const fn = basename(id, suffix);
      const result = await load(fn);
      return typeof result === "string"
        ? {
            map: { mappings: "" },
            code: result,
          }
        : result;
    },

    vite: {
      configResolved(config) {
        checkUnimportPlugn(config);

        // ctx.options.root = config.root;
        if (!options.framework) {
          if (checkVuePlugin(config)) {
            ctx.options.framework = "vue";
          }
        }
      },
    },
  };
});
