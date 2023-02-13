import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import {
  type SnippetDialogOptions,
  snippetBootstrap,
  snippetDialog,
  snippetRun,
} from "@/snippets";

export const presetRecommend = ({
  dialog,
}: Partial<{
  dialog: Partial<SnippetDialogOptions>;
}> = {}): Preset => ({
  snippets: {
    bootstrap: snippetBootstrap,
    dialog: snippetDialog(dialog),
    run: snippetRun,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
});
