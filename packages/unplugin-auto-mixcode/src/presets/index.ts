import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import { dialog } from "@/snippets";

export const presetRecommend: Preset = {
  snippets: {
    dialog,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
};
