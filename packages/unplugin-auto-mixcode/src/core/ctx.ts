import MagicString from "magic-string";

import type { BaseOptions, Options, Snippet } from "./types";
import { macroRegExp } from "./utils";

import { snippets } from "@/snippets";

export class Context {
  constructor(public options: Required<Omit<Options, keyof BaseOptions>>) {}

  /*
  async transform(code: string, id: string) {
    // await importsPromise;

    const s = new MagicString(code);

    // await unimport.injectImports(s, id);

    if (!s.hasChanged()) return;

    // writeConfigFilesThrottled();

    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    };
  }
  */

  async transform(code: string, id: string) {
    // TODO: handle sourcemap
    return Object.entries(snippets).reduce(async (p, [, { transform }]) => {
      const code = await p;
      const result = (await transform?.(code, id)) as string;
      return result ?? code;
    }, Promise.resolve(code));
  }
}
