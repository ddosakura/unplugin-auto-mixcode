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
    const snippets = parseSnippets(framework, this.options.snippets);
    this.#snippets = snippets;
    this.#resolver = createSnippetResolver(snippets);
    this.#macro = Object.values(snippets)
      .map(({ macro }) => macro!)
      .filter(Boolean);
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
}
