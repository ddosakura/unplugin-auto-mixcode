import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import { bootstrap, dialog } from "@/snippets";

export const presetRecommend: Preset = {
  snippets: {
    bootstrap,
    dialog,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
};
