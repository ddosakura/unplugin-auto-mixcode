import type { FilterPattern } from "@rollup/pluginutils";
import type MagicString from "magic-string";
import type { VitePlugin } from "unplugin";

export type UnwrapObjectHook<T> = T extends { handler: infer V } ? V : T;

type LoadFn = NonNullable<UnwrapObjectHook<VitePlugin["load"]>>;

type SourceDescription = Exclude<
  Awaited<ReturnType<LoadFn>>,
  void | null | undefined
>;

// TODO: get options/viteConfig in methods
export interface Snippet {
  suffix: string;
  resolve(name: string): boolean;
  load(id: string): SourceDescription | Promise<SourceDescription>;
  dts(id: string): string | Promise<string>;
  macro?(s: MagicString): void;
}

export type Framework = "react" | "vue" | "vue2";

export type FrameworkSnippet = Record<Framework, Snippet>;

export interface Preset {
  snippets?: Record<string, Snippet | FrameworkSnippet>;
}

export interface Options extends Preset {
  include?: FilterPattern;
  exclude?: FilterPattern;

  /** @defaultValue 'react' */
  framework?: Framework;

  presets?: Array<Preset>;
}

export interface ParsedOptions extends Required<Preset> {
  framework: Framework;
}
