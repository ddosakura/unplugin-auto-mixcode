import { createFilter } from "@rollup/pluginutils";
import { isPackageExists } from "local-pkg";
import { createUnplugin } from "unplugin";

import { Context } from "./ctx";
import type { Options } from "./types";
import {
  checkUnimportPlugn,
  checkVue2Plugin,
  checkVuePlugin,
  createURI,
  normalizeStringOption,
  PLUGIN_NAME,
  PREFIX_MIXCODE_VIRTUAL_MODULE,
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
    name: PLUGIN_NAME,
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

    async resolveId(id, importer, options) {
      if (id === "~mixcode") {
        return `${PREFIX_MIXCODE_VIRTUAL_MODULE}__init__.ts`;
      }
      if (importer === `${PREFIX_MIXCODE_VIRTUAL_MODULE}__init__.ts`) {
        return `${PREFIX_MIXCODE_VIRTUAL_MODULE}__init__`;
      }

      const result = await ctx.resolveId(id, importer, options);
      if (result) return result;

      const uri = id.replace(/^\/?~mixcode\//, PREFIX_MIXCODE_VIRTUAL_MODULE);
      if (!uri.startsWith(PREFIX_MIXCODE_VIRTUAL_MODULE)) return;
      return ctx.resolveVirtualModuleId(createURI(uri), importer);
    },
    loadInclude(id) {
      return id.startsWith(PREFIX_MIXCODE_VIRTUAL_MODULE);
    },
    load(id) {
      if (id === `${PREFIX_MIXCODE_VIRTUAL_MODULE}__init__.ts`) {
        return ctx.initScript();
      }
      if (id === `${PREFIX_MIXCODE_VIRTUAL_MODULE}__init__`) {
        return ctx.initScript(true);
      }
      return ctx.load(id);
    },

    async buildStart() {
      await ctx.cacheStore;
    },
    async buildEnd() {
      await ctx.writeConfigFiles();
    },

    vite: {
      async handleHotUpdate({ file }) {
        ctx.updateCacheImports(file);
      },
      configResolved(config) {
        checkUnimportPlugn(config);

        if (options.root) {
          ctx.setRoot(options.root);
        }
        ctx.setLogger(config.logger);
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

        if (config.build.watch && config.command === "build") {
          ctx.setupWatcher();
        }
      },
      configureServer(server) {
        ctx.setupViteServer(server);
      },
    },

    // https://github1s.com/antfu/unplugin-vue-components/blob/HEAD/src/core/unplugin.ts
    webpack(compiler) {
      let watcher: any; // Watching
      let fileDepQueue: {
        path: string;
        type: "unlink" | "add" | "change";
      }[] = [];
      compiler.hooks.watchRun.tap(PLUGIN_NAME, () => {
        // ensure watcher is ready(supported since webpack@5.0.0-rc.1)
        if (!watcher && compiler.watching) {
          watcher = compiler.watching;
          ctx.setupWatcher(async function (this, path, type) {
            const result = await this.options.onUpdate?.(path, type);
            if (!result) return;
            fileDepQueue.push({ path, type });
            // process.nextTick is for aggregated file change event
            process.nextTick(() => {
              watcher.invalidate();
            });
          });
        }
      });
      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation: any) => {
        if (fileDepQueue.length) {
          fileDepQueue.forEach(({ path, type }) => {
            if (type === "unlink") compilation.fileDependencies.delete(path);
            if (type === "add") compilation.fileDependencies.add(path);
          });
          fileDepQueue = [];
        }
      });
    },
  };
});
