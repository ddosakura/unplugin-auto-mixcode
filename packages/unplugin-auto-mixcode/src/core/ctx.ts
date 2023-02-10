import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";

import { createCacheStore } from "./cache";
import type { Framework, ParsedOptions, Snippet } from "./types";
import {
  type SnippetResolver,
  type URI,
  createSnippetResolver,
  createURI,
  parseSnippets,
  stripSuffix,
} from "./utils";

export class Context {
  constructor(private options: ParsedOptions, public devMode = false) {
    this.setFramework(options.framework);
  }
  setFramework(framework: Framework) {
    this.options.framework = framework;
    const snippets = parseSnippets(framework, this.options.snippets);
    this.#snippets = snippets;
    this.#resolver = createSnippetResolver(snippets);
    this.#macro = Object.values(snippets)
      .map(({ macro }) => macro!)
      .filter(Boolean);
  }
  setRoot(root: string) {
    this.options.root = root;
  }

  #snippets: Record<string, Snippet> = {};
  get snippets() {
    return this.#snippets;
  }

  #resolver?: SnippetResolver;
  resolver(name: string) {
    return this.#resolver?.(name);
  }

  #macro: Array<(s: MagicString) => void> = [];
  async transform(code: string, id: string) {
    const s = new MagicString(code);
    this.#macro.forEach((macro) => macro(s));
    if (!s.hasChanged()) return;
    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    };
  }

  #cacheStore?: ReturnType<typeof createCacheStore>;
  get cacheStore() {
    if (this.#cacheStore) return this.#cacheStore;
    this.#cacheStore = createCacheStore({
      root: this.options.root,
      cache: this.options.cache,
      dts: this.options.dts,
      snippets: this.snippets,
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
    const virtual: NonNullable<Snippet["virtual"]> = snippet.virtual ?? {
      load: () => {
        return {
          map: { mappings: "" as const },
          code: this.devMode
            ? `console.warn('[mixcode]', ${JSON.stringify(id)}, 'not found.');`
            : "",
        };
      },
    };

    // Modules will be imported by index.html in "serve" command, but not in "build" command.
    // Filter it by default to eliminate differences.
    const importerFilter = createFilter(
      snippet.importer?.include,
      snippet.importer?.exclude || [/\.html$/],
    );

    return {
      importerFilter,
      snippetType,
      suffix: virtual.suffix || ".ts",
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
    const result = await load(fn, uri.params);
    if (!result) return;
    const dtsText = await dts?.(fn);
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
