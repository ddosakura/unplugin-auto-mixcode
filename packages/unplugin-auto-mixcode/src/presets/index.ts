import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import { bootstrap, dialog, run } from "@/snippets";

export const presetRecommend: Preset = {
  snippets: {
    bootstrap,
    dialog,
    run,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
};
