import type { Snippet } from "@/core/types";

export const snippetPolyfill: Snippet = {
  virtual: {
    resolveId(id, importer, options) {
      console.log("[debug snippetPolyfill]", { id, importer, options });
      return;
    },
    load() {
      return "";
    },
  },
};
