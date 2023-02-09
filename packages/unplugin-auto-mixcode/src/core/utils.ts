import type { VitePlugin } from "unplugin";

import type { Snippet, UnwrapObjectHook } from "./types";

export const name = "unplugin-auto-mixcode";

type ConfigResolvedFn = UnwrapObjectHook<
  NonNullable<VitePlugin["configResolved"]>
>;

export function checkUnimportPlugn(config: Parameters<ConfigResolvedFn>[0]) {
  const plugin = config.plugins.find((p) =>
    ["unimport", "unplugin-auto-import"].includes(p.name),
  );
  if (!plugin) {
    console.warn(
      `[${name}] recommend to work with unimport/unplugin-auto-import`,
    );
  }
  return plugin;
}

export function checkReactPlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name.includes("vite:react"));
}

export function checkVuePlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) =>
    ["vite:vue", "vite-plugin-vue2"].includes(p.name),
  );
}

export function checkSolidPlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name.includes("solid"));
}

export function checkSveltePlugin(_config: Parameters<ConfigResolvedFn>[0]) {
  throw new Error("Method not implemented.");
}

/** e.g. /** @mixcode \<macro_name> *\/ */
export const macroRegExp = (name: string) =>
  new RegExp(`\\/\\*\\* @mixcode ${name} \\*\\/`, "g");

export const PREFIX_MIXCODE_SNIPPET = "~mixcode/";

export const createSnippetResolver = (snippets: Record<string, Snippet>) => {
  const list = Object.entries(snippets);
  return (name: string) => {
    const result = list.find(([, snippet]) =>
      snippet.resolve(name) ? snippet : undefined,
    );
    return result
      ? {
          name: "default",
          as: name,
          from: `${PREFIX_MIXCODE_SNIPPET}${result[0]}/${name}`,
        }
      : undefined;
  };
};
