import type { FrameworkSnippet, Preset, Snippet } from "@/core/types";
import {
  snippetBlocks,
  snippetBootstrap,
  snippetDialog,
  type SnippetDialogOptions,
  snippetPages,
  type SnippetPagesOptions,
  snippetRun,
} from "@/snippets";

export interface PresetRecommendOptions {
  dialog: Partial<SnippetDialogOptions>;
  pages: Partial<SnippetPagesOptions>;
}

export const presetRecommend = ({
  dialog,
  pages,
}: Partial<PresetRecommendOptions> = {}): Preset => ({
  snippets: {
    blocks: snippetBlocks,
    bootstrap: snippetBootstrap,
    dialog: snippetDialog(dialog),
    pages: snippetPages(pages),
    run: snippetRun,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
});

// export interface PresetRecommendReactOptions extends PresetRecommendOptions {}
export type PresetRecommendReactOptions = PresetRecommendOptions;

export const presetRecommendReact = ({
  ...options
}: Partial<PresetRecommendReactOptions> = {}): Preset => ({
  snippets: {
    ...presetRecommend(options).snippets,
  } satisfies Record<string, Snippet | FrameworkSnippet>,
});
