import type { FrameworkSnippet } from "@/core/types";

import react from "./react";

/** ~mixcode/bootstrap(/\<framework>)? */
export const bootstrap: FrameworkSnippet = {
  react,
  // TODO: impl vue's bootstrap
  vue: react,
  vue2: react,
};
