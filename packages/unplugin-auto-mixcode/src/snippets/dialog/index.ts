import type { FrameworkSnippet } from "@/core/types";

import type { SnippetDialogOptions } from "./common";
import react from "./react";

export type { SnippetDialogOptions } from "./common";

export const snippetDialog = (
  options: Partial<SnippetDialogOptions> = {},
): FrameworkSnippet => ({
  react: react(options),
});
