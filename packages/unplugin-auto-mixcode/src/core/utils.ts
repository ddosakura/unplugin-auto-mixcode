import {
  mkdir,
  readFile as rawReadFile,
  writeFile as rawWriteFile,
} from "node:fs/promises";
import { dirname } from "node:path";

import { getPackageInfo, isPackageExists } from "local-pkg";
import MagicString from "magic-string";
import type { VitePlugin } from "unplugin";

import type { ResolverResult } from "@/imports";

import type {
  Framework,
  FrameworkSnippet,
  Preset,
  Snippet,
  SnippetDefinition,
  SnippetVirtualModuleLoader,
  UnwrapObjectHook,
} from "./types";

export const PLUGIN_NAME = "unplugin-auto-mixcode";

export const warn = (...args: any[]) =>
  console.warn(`[${PLUGIN_NAME}]`, ...args);

type ConfigResolvedFn = UnwrapObjectHook<
  NonNullable<VitePlugin["configResolved"]>
>;

export function checkUnimportPlugn(config: Parameters<ConfigResolvedFn>[0]) {
  const plugin = config.plugins.find((p) =>
    ["unimport", "unplugin-auto-import"].includes(p.name)
  );
  if (!plugin) {
    warn("recommend to work with unimport/unplugin-auto-import");
  }
  return plugin;
}

export function checkReactPlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name.includes("vite:react"));
}

export function checkVuePlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) =>
    ["vite:vue", "unplugin-vue"].includes(p.name)
  );
}

export function checkVue2Plugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) =>
    [
      // 2.7
      // https://github.com/vitejs/vite-plugin-vue2
      "vite:vue2",
      // <= 2.6
      // https://github.com/underfin/vite-plugin-vue2
      "vite-plugin-vue2",
    ].includes(p.name)
  );
}

export function checkSolidPlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name.includes("solid"));
}

export function checkSveltePlugin(_config: Parameters<ConfigResolvedFn>[0]) {
  throw new Error("Method not implemented.");
}

export const normalizeStringOption = (
  value: boolean | string,
  defaultValue: string,
) => (value === true ? defaultValue : value);

export const isFrameworkSnippet = (snippet: any): snippet is FrameworkSnippet =>
  snippet.react ||
  snippet.vue ||
  snippet.vue2 ||
  snippet.solid ||
  snippet.svelte;

const getSnippets = (
  snippet: SnippetDefinition | FrameworkSnippet,
  framework: Framework,
): SnippetDefinition | undefined =>
  isFrameworkSnippet(snippet) ? snippet[framework] : snippet;

export const parseSnippets = (
  framework: Framework,
  snippets: Record<string, SnippetDefinition | FrameworkSnippet> = {},
): Record<string, Snippet> => {
  const entries = Object.entries(snippets)
    .map(([name, snippet]) => {
      const s = getSnippets(snippet, framework);
      return s
        ? ([name, fromSnippetDefinition(s)] as const)
        : (undefined as unknown as [string, Snippet]);
    })
    .filter(Boolean);
  return Object.fromEntries(entries);
};

export const PREFIX_MIXCODE_VIRTUAL_MODULE = "virtual:mixcode/";

export const snippetsFromPreset = (presets: Array<Preset> = []) =>
  presets.reduce(
    (pre, preset) => ({ ...pre, ...preset.snippets }),
    {} as NonNullable<Preset["snippets"]>,
  );

export const createSnippetResolver = (snippets: Record<string, Snippet>) => {
  const list = Object.entries(snippets);
  return (name: string): ResolverResult | undefined => {
    const result = list.find(([, snippet]) =>
      snippet.virtual?.resolve?.(name) ? snippet : undefined
    );
    return result
      ? {
        name: "default",
        as: name,
        from: `${PREFIX_MIXCODE_VIRTUAL_MODULE}${result[0]}/${name}`,
      }
      : undefined;
  };
};

export type SnippetResolver = ReturnType<typeof createSnippetResolver>;

export async function writeFile(filePath: string, content: string) {
  await mkdir(dirname(filePath), { recursive: true });
  return await rawWriteFile(filePath, content, "utf-8");
}

export async function readFile(filePath: string) {
  try {
    return await rawReadFile(filePath, "utf-8");
  } catch {}
}

export const stringify = (
  value: any,
  replacer = (_key: string, value: any) => {
    if (value instanceof Map) {
      return {
        instanceof: "Map",
        // value: Object.fromEntries(Array.from(value.entries())),
        value: Array.from(value.entries()).sort(([a], [b]) => (a > b ? 1 : -1)),
      };
    }
    if (value instanceof Set) {
      return {
        instanceof: "Set",
        value: Array.from(value.values()),
      };
    }
    return value;
  },
  space?: string | number,
) => JSON.stringify(value, replacer, space);

export const parse = (
  text: string,
  reviver = (_key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (value.instanceof === "Map") {
        // return new Map(Object.entries(value.value));
        return new Map(value.value);
      }
      if (value.instanceof === "Set") {
        return new Set(value.value);
      }
    }
    return value;
  },
) => JSON.parse(text, reviver);

export async function readJSONFile<T>(filePath: string) {
  try {
    const text = await readFile(filePath);
    if (!text) return;
    return parse(text) as T;
  } catch {}
}

export const createURI = (uri: string) => {
  const url = new URL(uri, "http://localhost");
  return {
    get protocol() {
      return url.protocol;
    },
    get pathname() {
      return url.pathname;
    },
    get search() {
      return url.search;
    },
    get params() {
      return Object.fromEntries(url.searchParams.entries());
    },
  };
};

export type URI = ReturnType<typeof createURI>;

export function stripSuffix(name: string, suffix: string): string {
  if (suffix.length >= name.length) {
    return name;
  }

  const lenDiff = name.length - suffix.length;

  for (let i = suffix.length - 1; i >= 0; --i) {
    if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
      return name;
    }
  }

  return name.slice(0, -suffix.length);
}

export const byMagicString = (str: string) => {
  const s = new MagicString(str);
  return {
    code: s.toString(),
    map: s.generateMap(),
  };
};

export async function getPkgVersion(
  pkgName: string,
  defaultVersion: string,
): Promise<string> {
  try {
    const isExist = isPackageExists(pkgName);
    if (isExist) {
      const pkg = await getPackageInfo(pkgName);
      return pkg?.version ?? defaultVersion;
    } else {
      return defaultVersion;
    }
  } catch (err) {
    console.error(err);
    return defaultVersion;
  }
}

const isSnippetVirtualModuleLoader = (
  v: any,
): v is SnippetVirtualModuleLoader => v.load;

function fromSnippetDefinition<T>({
  dependencies,
  importer,
  virtual,
  macro,
  createWatcher,
}: SnippetDefinition<T>): Snippet<T> {
  return {
    dependencies,
    importer(this) {
      if (typeof importer !== "function") return importer;
      return importer.call(this);
    },
    virtual: typeof virtual === "function" ? { load: virtual } : (() => {
      if (!virtual) return;
      if (isSnippetVirtualModuleLoader(virtual)) return virtual;
      const { resolve, suffix, defaultModuleId = "default", modules } = virtual;
      const getModule = (id: string) => modules[id] ?? modules[defaultModuleId];
      return {
        resolve,
        suffix,
        resolveId(this, id, importer, options) {
          const vm = getModule(id);
          if (typeof vm !== "object") return;
          return vm.resolveId?.call(this, importer, options);
        },
        load(this, id, params) {
          const vm = getModule(id);
          if (typeof vm === "string") return vm;
          if (typeof vm === "function") return vm.call(this, params);
          return vm.load?.call(this, params);
        },
        dts(this, id) {
          const vm = getModule(id);
          if (typeof vm !== "object") return;
          return vm.dts?.call(this);
        },
      };
    })(),
    macro: typeof macro === "function" ? { transform: macro } : macro,
    createWatcher,
  };
}
