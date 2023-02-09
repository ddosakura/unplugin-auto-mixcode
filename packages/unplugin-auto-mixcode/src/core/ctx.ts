import MagicString from "magic-string";

import type { Framework, ParsedOptions, Snippet } from "./types";
import {
  type SnippetResolver,
  createSnippetResolver,
  parseSnippets,
} from "./utils";

export class Context {
  constructor(private options: ParsedOptions) {
    this.setFramework(options.framework);
  }
  setFramework(framework: Framework) {
    this.options.framework = framework;
    this.#snippets = parseSnippets(framework, this.options.snippets);
    this.#resolver = createSnippetResolver(this.#snippets);
  }

  #snippets: Record<string, Snippet> = {};
  get snippets() {
    return this.#snippets;
  }
  #resolver?: SnippetResolver;
  resolver(name: string) {
    return this.#resolver?.(name);
  }

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
    return Object.entries(this.snippets).reduce(
      async (p, [, { transform }]) => {
        const code = await p;
        const result = (await transform?.(code, id)) as string;
        return result ?? code;
      },
      Promise.resolve(code),
    );
  }
}
