import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import {
  type SnippetDialogOptions,
  type SnippetPagesOptions,
  snippetBootstrap,
  snippetDialog,
  snippetPages,
  snippetRun,
} from "@/snippets";

export const presetRecommend = ({
  dialog,
  pages,
}: Partial<{
  dialog: Partial<SnippetDialogOptions>;
  pages: Partial<SnippetPagesOptions>;
}> = {}): Preset => ({
  snippets: {
    bootstrap: snippetBootstrap,
    dialog: snippetDialog(dialog),
    pages: snippetPages(pages),
    run: snippetRun,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
});
