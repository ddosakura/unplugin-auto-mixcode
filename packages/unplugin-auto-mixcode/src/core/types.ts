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

export interface Snippet {
  importer?: {
    include?: FilterPattern;
    exclude?: FilterPattern;
  };
  virtual?: {
    resolve?(name: string): boolean;
    /** @defaultValue '.ts' */
    suffix?: string;
    load(
      id: string,
      params: Record<string, string>,
    ): Awaitable<SourceDescription | undefined>;
    dts?(id: string): Awaitable<string>;
  };
  macro?<T>(
    params: Record<string, string>,
    s: MagicString,
    context?: T,
  ): string | { code: string; context: T };
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

  /** @default './mixcode.json' */
  cache?: boolean | string;

  /** @default './auto-mixcode.d.ts' */
  dts?: boolean | string;

  /** @defaultValue 'react' */
  framework?: Framework;

  presets?: Array<Preset>;
}

export interface ParsedOptions extends Required<Preset> {
  root: string;
  cache: string | false;
  dts: string | false;
  framework: Framework;
}
