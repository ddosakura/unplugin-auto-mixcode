import type { VitePlugin } from "unplugin";

import unplugin, { type Options, type SnippetResolver } from ".";

export default unplugin.vite as (
  options?: Options | undefined,
) => VitePlugin & { resolver: SnippetResolver };
