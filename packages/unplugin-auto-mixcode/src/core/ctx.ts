import type { FSWatcher } from "node:fs";

import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";
import type { Logger, ViteDevServer } from "vite";

import { createCacheStore } from "./cache";
import type {
  Framework,
  ParsedOptions,
  Snippet,
  SnippetContext,
} from "./types";
import {
  PREFIX_MIXCODE_VIRTUAL_MODULE,
  type SnippetResolver,
  type URI,
  createSnippetResolver,
  createURI,
  parseSnippets,
  stripSuffix,
} from "./utils";
import type { Watcher } from "./watcher";

type DtsFn = NonNullable<NonNullable<Snippet["virtual"]>["dts"]>;

const DECLARE_VIRTUAL_MODULE = `declare module "${PREFIX_MIXCODE_VIRTUAL_MODULE}`;

const wrapDtsFn = (scope: string, fn: DtsFn): DtsFn =>
  async function (this: SnippetContext, id: string) {
    const raw = await fn.call(this, id);
    if (raw.startsWith("{") && raw.endsWith("}")) {
      return `\n${DECLARE_VIRTUAL_MODULE}${scope}/${id}" ${raw}\n`;
    }
    const code = raw
      .split("\n")
      .map((line) => (line ? `  ${line}` : ""))
      .filter(Boolean)
      .join("\n");
    return `\n${DECLARE_VIRTUAL_MODULE}${scope}/${id}" {\n${code}\n}\n`;
  };

export class Context {
  constructor(private options: ParsedOptions, public devMode = false) {
    this.setFramework(options.framework);
  }
  setFramework(framework: Framework) {
    this.options.framework = framework;
    const snippets = parseSnippets(framework, this.options.snippets);
    Object.entries(snippets).forEach(([scope, snippet]) => {
      if (snippet.virtual?.dts) {
        snippet.virtual.dts = wrapDtsFn(scope, snippet.virtual.dts);
      }
    });
    this.#snippets = snippets;
    this.#resolver = createSnippetResolver(snippets);
    this.#macro = Object.entries(snippets)
      .map(([name, { macro }]) => {
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        return (macro ? [name, macro!] : undefined) as any;
      })
      .filter(Boolean);
    this.#watchers = Object.values(snippets)
      .map(({ createWatcher }) => createWatcher?.call(this.snippetContext)!)
      .filter(Boolean);
  }
  setRoot(root: string) {
    this.options.root = root;
  }
  #logger?: Logger;
  setLogger(logger: Logger) {
    this.#logger = logger;
  }

  #snippets: Record<string, Snippet> = {};
  get snippets() {
    return this.#snippets;
  }

  #resolver?: SnippetResolver;
  resolver(name: string) {
    return this.#resolver?.(name);
  }

  get snippetContext(): SnippetContext {
    return {
      root: this.options.root,
      logger: this.#logger,
      framework: this.options.framework,
    };
  }

  #macro: Array<[string, NonNullable<Snippet["macro"]>]> = [];
  async transform(code: string, id: string) {
    const s = new MagicString(code);
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    const contexts = new Map<string, any>();
    s.replace(/\/\*\*([\s\S]*?)\*\//g, (_$0: string, $1: string) => {
      const snippets: string[] = [];
      this.#macro.reduce(($1, [name, macro]) => {
        const re = new RegExp(`@mixcode ${name}(\\?[^\\s]+)?`, "g");
        return $1.replace(re, (_$0: string, $1: string) => {
          const uri = createURI($1);
          const ctx = contexts.get(name);
          const result = macro.call(this.snippetContext, uri.params, s, ctx);
          if (!result) return "";
          const { code, context } =
            typeof result === "string"
              ? { code: result, context: null }
              : result;
          if (typeof code === "string") snippets.push(code);
          contexts.set(name, context ?? ctx);
          return "";
        });
      }, $1);
      return snippets.length === 0 ? `/**${$1}*/` : snippets.join("\n");
    });
    if (!s.hasChanged()) return;
    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    };
  }

  #watchers: Array<Watcher> = [];
  setupWatcher(
    emitUpdate?: (
      this: Watcher,
      path: string,
      type: "unlink" | "add" | "change",
    ) => void,
    watcher?: FSWatcher,
  ) {
    this.#watchers.forEach((w) => w.setup(emitUpdate, watcher));
  }
  setupViteServer(server: ViteDevServer) {
    this.setupWatcher(async function (this, path, type) {
      const result = await this.options.onUpdate?.(path, type);
      if (!result) return;
      const {
        hmrPayload = {
          type: "full-reload",
        },
        invalidateModules = [],
      } = result;
      const { moduleGraph } = server;
      invalidateModules.forEach((module) => {
        const mods = moduleGraph.getModulesByFile(module);
        if (!mods) return;
        mods.forEach((mod) => {
          moduleGraph.invalidateModule(mod, new Set());
        });
      });
      server.ws.send(hmrPayload);
    }, server.watcher);
  }

  #cacheStore?: ReturnType<typeof createCacheStore>;
  get cacheStore() {
    if (this.#cacheStore) return this.#cacheStore;
    this.#cacheStore = createCacheStore({
      root: this.options.root,
      cache: this.options.cache,
      dts: this.options.dts,
      snippets: this.snippets,
      snippetContext: this.snippetContext,
    });
    return this.#cacheStore;
  }
  async writeConfigFiles() {
    const store = await this.cacheStore;
    return store.writeConfigFiles();
  }
  #snippetVirtual(id: string) {
    const [, snippetType] = id.split("/");
    const snippet = this.snippets[snippetType] ?? {};
    const { suffix: suffixFn, ...virtual }: NonNullable<Snippet["virtual"]> =
      snippet.virtual ?? {
        load: () => {
          return {
            map: { mappings: "" as const },
            code: this.devMode
              ? `console.warn('[mixcode]', ${JSON.stringify(
                  id,
                )}, 'not found.');`
              : "",
          };
        },
      };

    // Modules will be imported by index.html in "serve" command, but not in "build" command.
    // Filter it by default to eliminate differences.
    const importer =
      typeof snippet.importer === "function"
        ? snippet.importer.call(this.snippetContext)
        : snippet.importer;
    const importerFilter = createFilter(
      importer?.include,
      importer?.exclude || [/\.html$/],
    );

    const suffix =
      typeof suffixFn === "string"
        ? suffixFn
        : suffixFn?.call(this.snippetContext);
    return {
      importerFilter,
      snippetType,
      suffix: suffix || ".ts",
      ...virtual,
    };
  }
  async #updateIdentifier(
    idWithScope: `${string}/${string}`,
    importer: string,
  ) {
    const store = await this.cacheStore;
    store.updateIdentifier(idWithScope, importer);
  }
  // virtual:mixcode/<scope>/<identifier>?params<suffix>
  resolveId(uri: URI, importer?: string) {
    const { importerFilter, snippetType, suffix } = this.#snippetVirtual(
      uri.pathname,
    );
    if (!snippetType) return;
    if (!importerFilter(importer)) return;
    const [prefix, , id = "index"] = uri.pathname.split("/");
    if (importer) {
      const fn = stripSuffix(id, suffix);
      this.#updateIdentifier(`${snippetType}/${fn}`, importer);
    }
    const href = `${uri.protocol}${prefix}/${snippetType}/${id}${uri.search}`;
    return href.endsWith(suffix) ? href : `${href}${suffix}`;
  }
  async #updateDts(id: string, text: string) {
    const store = await this.cacheStore;
    store.updateDts(id, text);
  }
  async load(id: string) {
    const { suffix, load, dts } = this.#snippetVirtual(id);
    if (!load) return;
    if (!id.endsWith(suffix)) return;
    const uri = createURI(stripSuffix(id, suffix));
    const [, , fn] = uri.pathname.split("/");
    const result = await load.call(this.snippetContext, fn, uri.params);
    if (!result) return;
    const dtsText = await dts?.call(this.snippetContext, fn);
    if (dtsText) {
      this.#updateDts(fn, dtsText);
    }
    return typeof result === "string"
      ? {
          map: { mappings: "" as const },
          code: result,
        }
      : result;
  }
  async updateCacheImports(importer: string) {
    const store = await this.cacheStore;
    store.updateImports(importer);
  }

  async initScript(blank = false) {
    if (blank || !this.devMode) {
      return {
        map: { mappings: "" as const },
        code: "export default ''",
      };
    }
    const store = await this.cacheStore;
    return {
      map: { mappings: "" as const },
      code: store.autoImportInitScript(),
    };
  }
}
