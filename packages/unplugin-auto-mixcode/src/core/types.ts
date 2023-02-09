import type { FilterPattern } from "@rollup/pluginutils";
import type { VitePlugin } from "unplugin";

export interface BaseOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
}

export interface Options extends BaseOptions {
  /** @defaultValue 'react' */
  framework?: "react" | "vue";
}

export type UnwrapObjectHook<T> = T extends { handler: infer V } ? V : T;

type LoadFn = NonNullable<UnwrapObjectHook<VitePlugin["load"]>>;

type TransformFn = NonNullable<UnwrapObjectHook<VitePlugin["transform"]>>;

type SourceDescription = Exclude<
  Awaited<ReturnType<LoadFn>>,
  void | null | undefined
>;

export interface Snippet {
  suffix: string;
  resolve(name: string): boolean;
  load(id: string): SourceDescription | Promise<SourceDescription>;
  dts(id: string): string | Promise<string>;
  transform?(code: string, id: string): ReturnType<TransformFn>;
}
