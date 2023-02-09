import { basename, dirname } from "node:path";

import { createFilter } from "@rollup/pluginutils";
import { createUnplugin } from "unplugin";

import { Context } from "./ctx";
import type { Options } from "./types";
import {
  PREFIX_MIXCODE_SNIPPET,
  checkUnimportPlugn,
  checkVuePlugin,
  name,
  snippetsFromPreset,
} from "./utils";

export default createUnplugin<Options>((options = {}) => {
  const filter = createFilter(
    options.include || [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
  );

  const { framework = "react", presets = [], snippets = {} } = options;
  const ctx: Context = new Context({
    framework,
    snippets: {
      ...snippetsFromPreset(presets),
      ...snippets,
    },
  });

  return {
    // TODO: writeConfigFiles
    name,
    enforce: "pre",

    resolver(name: string) {
      return ctx.resolver(name);
    },

    transformInclude(id) {
      return filter(id);
    },
    transform(code, id) {
      return ctx.transform(code, id);
    },

    resolveId(source, _importer) {
      if (!source.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      const snippetType = basename(dirname(source));
      const { suffix = "" } = ctx.snippets[snippetType] ?? {};
      if (!suffix) return;
      return source.endsWith(suffix) ? source : `${source}${suffix}`;
    },
    async load(id) {
      if (!id.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      const snippetType = basename(dirname(id));
      const { suffix = "", load } = ctx.snippets[snippetType] ?? {};
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
            ctx.setFramework("vue");
          }
        }
      },
    },
  };
});
