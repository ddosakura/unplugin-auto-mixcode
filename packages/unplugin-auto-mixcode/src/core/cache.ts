import { join, relative, resolve } from "node:path";

import { throttle } from "@antfu/utils";

import type { Snippet, SnippetContext } from "./types";
import {
  PREFIX_MIXCODE_VIRTUAL_MODULE,
  readFile,
  readJSONFile,
  stringify,
  writeFile,
} from "./utils";

type SourceFile = string;
type IdentifierWithScope = `${string}/${string}`;

export interface CacheObject {
  imports: Map<SourceFile, Set<IdentifierWithScope>>;
}

const scanCacheImport = async (
  cacheObject: CacheObject,
  root: string,
  importer: string,
) => {
  const { imports } = cacheObject;
  const source = await readFile(join(root, importer));
  if (!source) {
    imports.delete(importer);
    return;
  }
  const tokens = imports.get(importer);
  if (!tokens) return;
  Array.from(tokens.values()).forEach((token) => {
    const id = token.split("/").at(1);
    if (id && source.includes(id)) return;
    // TODO: Handles the removal of the virtual module cache imported by the macro
    tokens.delete(token);
  });
  if (tokens.size === 0) {
    imports.delete(importer);
  }
};

const scanCacheImports = async (cacheObject: CacheObject, root: string) => {
  const { imports } = cacheObject;
  const ps = Array.from(imports.keys()).map((path) =>
    scanCacheImport(cacheObject, root, path)
  );
  await Promise.all(ps);
};

const getIdentifiers = (cacheObject: CacheObject) => {
  const { imports } = cacheObject;
  const values = Array.from(imports.values()).flatMap((tokens) =>
    Array.from(tokens.values())
  );
  return Array.from(new Set(values).values()).map(
    (token) => token.split("/") as [string, string],
  );
};

const dtsFileFromCache = (dtsCache = new Map<string, string>()) => {
  const code = Array.from(dtsCache.entries())
    // sort by id without scope
    .sort(([a], [b]) => a > b ? 1 : -1)
    .map(([, dts]) => dts)
    .join("");
  return `/* eslint-disable */\n// Generated by 'unplugin-auto-mixcode'\n${code}`;
};

export interface CreateCacheStoreOptions {
  root: string;
  cache: string | false;
  dts: string | false;
  snippets: Record<string, Snippet>;
  snippetContext: SnippetContext;
}

export const createCacheStore = async (options: CreateCacheStoreOptions) => {
  const { root, snippets } = options;
  const cachePath = options.cache ? resolve(root, options.cache) : false;
  const dts = options.dts ? resolve(root, options.dts) : false;

  const cache = cachePath
    ? await readJSONFile<CacheObject>(cachePath)
    : undefined;
  const cacheObject: CacheObject = cache ?? { imports: new Map() };
  if (!cacheObject.imports) {
    cacheObject.imports = new Map();
  }
  await scanCacheImports(cacheObject, root);

  const dtsCache = new Map<string, string>();
  const identifiers = getIdentifiers(cacheObject);
  const ps = identifiers.map(async ([scope, id]) => {
    const dts = snippets[scope]?.virtual?.dts;
    const text = await dts?.call(options.snippetContext, id);
    if (text) dtsCache.set(id, text);
  });
  await Promise.all(ps);

  let lastCacheText: string | undefined;
  let lastDtsText: string | undefined;
  const writeConfigFiles = () =>
    Promise.all([
      (async () => {
        if (!cachePath) return;
        const text = stringify(cacheObject, undefined, 2);
        if (lastCacheText === text) return;
        lastCacheText = text;
        await writeFile(cachePath, `${text}\n`);
      })(),
      (async () => {
        if (!dts) return;
        const text = dtsFileFromCache(dtsCache);
        if (lastDtsText === text) return;
        lastDtsText = text;
        await writeFile(dts, text);
      })(),
    ]);
  const writeConfigFilesThrottled = throttle(500, writeConfigFiles, {
    noLeading: false,
  });

  writeConfigFilesThrottled();

  const getIdSet = (importer: string) => {
    if (importer.startsWith(PREFIX_MIXCODE_VIRTUAL_MODULE)) return;
    const { imports } = cacheObject;
    const s = imports.get(importer);
    if (s) return s;
    const newSet = new Set<IdentifierWithScope>();
    imports.set(importer, newSet);
    return newSet;
  };
  const updateIdentifier = (
    idWithScope: IdentifierWithScope,
    importer: string,
  ) => {
    const s = getIdSet(relative(root, importer));
    if (!s) return;
    s.add(idWithScope);
    writeConfigFilesThrottled();
  };

  const updateDts = (id: string, text: string) => {
    dtsCache.set(id, text);
    writeConfigFilesThrottled();
  };

  const updateImports = async (importer: string) => {
    await scanCacheImport(cacheObject, root, relative(root, importer));
    // TODO: remove needless dts
    writeConfigFilesThrottled();
  };

  const autoImportInitScript = () =>
    Array.from(dtsCache.keys())
      .map((token) => `typeof ${token};`)
      .join("\n");

  return {
    writeConfigFiles,
    updateIdentifier,
    updateDts,
    updateImports,
    autoImportInitScript,
  };
};
