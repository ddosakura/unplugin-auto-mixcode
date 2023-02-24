import type { FrameworkSnippet, Preset, SnippetDefinition } from "@/core/types";
import {
  snippetBlocks,
  snippetBootstrap,
  type SnippetBootstrapOptions,
  snippetDialog,
  type SnippetDialogOptions,
  snippetPages,
  type SnippetPagesOptions,
  snippetRun,
} from "@/snippets";

export interface PresetRecommendOptions {
  bootstrap: Partial<SnippetBootstrapOptions>;
  dialog: Partial<SnippetDialogOptions>;
  pages: Partial<SnippetPagesOptions>;
}

export const presetRecommend = ({
  bootstrap,
  dialog,
  pages,
}: Partial<PresetRecommendOptions> = {}): Preset => ({
  snippets: {
    blocks: snippetBlocks,
    bootstrap: snippetBootstrap(bootstrap),
    dialog: snippetDialog(dialog),
    pages: snippetPages(pages),
    run: snippetRun,
  } satisfies Record<string, SnippetDefinition | FrameworkSnippet>,
});

// export interface PresetRecommendReactOptions extends PresetRecommendOptions {}
export type PresetRecommendReactOptions = PresetRecommendOptions;

export const presetRecommendReact = ({
  ...options
}: Partial<PresetRecommendReactOptions> = {}): Preset => ({
  snippets: {
    ...presetRecommend(options).snippets,
  } satisfies Record<string, SnippetDefinition | FrameworkSnippet>,
});
