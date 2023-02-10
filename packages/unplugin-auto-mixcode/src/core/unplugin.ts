import { createFilter } from "@rollup/pluginutils";
import { isPackageExists } from "local-pkg";
import { createUnplugin } from "unplugin";

import { Context } from "./ctx";
import type { Options } from "./types";
import {
  PREFIX_MIXCODE_SNIPPET,
  checkUnimportPlugn,
  checkVue2Plugin,
  checkVuePlugin,
  name,
  normalizeStringOption,
  snippetsFromPreset,
} from "./utils";

export default createUnplugin<Options>((options = {}) => {
  const filter = createFilter(
    options.include || [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
  );

  const {
    cache: rawCache = true,
    dts: rawDts = isPackageExists("typescript"),
    framework = "react",
    presets = [],
    snippets = {},
  } = options;
  const ctx: Context = new Context({
    root: process.cwd(),
    cache: normalizeStringOption(rawCache, "./mixcode.json"),
    dts: normalizeStringOption(rawDts, "./auto-mixcode.d.ts"),
    framework,
    snippets: {
      ...snippetsFromPreset(presets),
      ...snippets,
    },
  });

  return {
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

    resolveId(id, importer) {
      if (!id.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      return ctx.resolveId(id, importer);
    },
    load(id) {
      if (!id.startsWith(PREFIX_MIXCODE_SNIPPET)) return;
      return ctx.load(id);
    },

    async buildStart() {
      await ctx.cacheStore;
    },
    async buildEnd() {
      await ctx.writeConfigFiles();
    },

    vite: {
      configResolved(config) {
        checkUnimportPlugn(config);

        if (options.root) {
          ctx.setRoot(options.root);
        }
        if (config.command === "serve") {
          ctx.devMode = true;
        }

        if (!options.framework) {
          if (checkVuePlugin(config)) {
            ctx.setFramework("vue");
          }
          if (checkVue2Plugin(config)) {
            ctx.setFramework("vue2");
          }
        }
      },
      async handleHotUpdate({ file }) {
        ctx.updateCacheImports(file);
      },
    },
  };
});
