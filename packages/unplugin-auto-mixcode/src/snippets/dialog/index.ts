import type { FrameworkSnippet } from "@/core/types";

import react from "./react";

/** ~mixcode/dialog/useXxxDialog */
export const dialog: FrameworkSnippet = {
  react,
  // TODO: impl vue/useXxxDialog
  vue: react,
  vue2: react,
};
