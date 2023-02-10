import type { FrameworkSnippet } from "@/core/types";

import react from "./react";

/** ~mixcode/dialog/useXxxDialog */
export const dialog: FrameworkSnippet = {
  react,
  // TODO: impl vue/useXxxDialog by https://vueuse.org/core/useConfirmDialog/
  vue: react,
  vue2: react,
};
