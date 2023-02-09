import type { Awaitable } from "@antfu/utils";
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
  load(id: string): Awaitable<SourceDescription>;
  dts(id: string): Awaitable<string>;
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

  root?: string;

  /** @default './auto-mixcode.d.ts' */
  dts?: boolean | string;

  /** @defaultValue 'react' */
  framework?: Framework;

  presets?: Array<Preset>;
}

export interface ParsedOptions extends Required<Preset> {
  root: string;
  dts: string;
  framework: Framework;
}
