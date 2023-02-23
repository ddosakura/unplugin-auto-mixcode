import type { SnippetDefinition } from "@/core/types";

export const snippetRun: SnippetDefinition = {
  /** @mixcodoe run?js=new+Date%28%29 */
  macro({ js }) {
    // https://esbuild.github.io/content-types/#direct-eval
    return js ? JSON.stringify((0, eval)(js)) : "";
  },
};
