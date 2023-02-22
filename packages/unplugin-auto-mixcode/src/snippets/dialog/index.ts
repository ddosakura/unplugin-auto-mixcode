import type { FrameworkSnippet } from "@/core/types";

import type { SnippetDialogOptions } from "./common";
import react from "./react";
import vue from "./vue";

export type { SnippetDialogOptions } from "./common";

export const snippetDialog = (
  options: Partial<SnippetDialogOptions> = {},
): FrameworkSnippet => ({
  react: react(options),
  vue: vue(options),
  vue2: vue(options),
});
