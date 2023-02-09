import { mkdir, writeFile as rawWriteFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { VitePlugin } from "unplugin";

import type {
  Framework,
  FrameworkSnippet,
  Preset,
  Snippet,
  UnwrapObjectHook,
} from "./types";

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
  return config.plugins.find((p) => p.name === "vite:vue");
}

export function checkVue2Plugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name === "vite-plugin-vue2");
}

export function checkSolidPlugin(config: Parameters<ConfigResolvedFn>[0]) {
  return config.plugins.find((p) => p.name.includes("solid"));
}

export function checkSveltePlugin(_config: Parameters<ConfigResolvedFn>[0]) {
  throw new Error("Method not implemented.");
}

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isFrameworkSnippet = (snippet: any): snippet is FrameworkSnippet =>
  !snippet.load;

const getSnippets = (
  snippet: Snippet | FrameworkSnippet,
  framework: Framework,
): Snippet => (isFrameworkSnippet(snippet) ? snippet[framework] : snippet);

export const parseSnippets = (
  framework: Framework,
  snippets: Record<string, Snippet | FrameworkSnippet> = {},
): Record<string, Snippet> => {
  const entries = Object.entries(snippets).map(
    ([name, snippet]) => [name, getSnippets(snippet, framework)] as const,
  );
  return Object.fromEntries(entries);
};

/** e.g. /** @mixcode \<macro_name> *\/ */
export const macroRegExp = (name: string) =>
  new RegExp(`\\/\\*\\* @mixcode ${name} \\*\\/`, "g");

export const PREFIX_MIXCODE_SNIPPET = "~mixcode/";

export const snippetsFromPreset = (presets: Array<Preset> = []) =>
  presets.reduce(
    (pre, preset) => ({ ...pre, ...preset.snippets }),
    {} as NonNullable<Preset["snippets"]>,
  );

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

export type SnippetResolver = ReturnType<typeof createSnippetResolver>;

export async function writeFile(filePath: string, content: string) {
  await mkdir(dirname(filePath), { recursive: true });
  return await rawWriteFile(filePath, content, "utf-8");
}
