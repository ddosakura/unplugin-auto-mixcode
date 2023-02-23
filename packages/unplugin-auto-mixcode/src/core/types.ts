import type { Arrayable, Awaitable } from "@antfu/utils";
import type { FilterPattern } from "@rollup/pluginutils";
import type MagicString from "magic-string";
import type { VitePlugin } from "unplugin";
import type { Logger } from "vite";

import type { Watcher } from "./watcher";

export type UnwrapObjectHook<T> = T extends { handler: infer V } ? V : T;

type LoadFn = NonNullable<UnwrapObjectHook<VitePlugin["load"]>>;

type SourceDescription = Exclude<
  Awaited<ReturnType<LoadFn>>,
  void | null | undefined
>;

export type SnippetDependencies = Arrayable<
  string | Record<string, { optional?: true; snippet?: true; msg?: string }>
>;

export interface SnippetContext {
  readonly root: string;
  readonly logger?: Logger;
  readonly framework: Framework;
}

interface ImporterPattern {
  include?: FilterPattern;
  exclude?: FilterPattern;
}

interface BaseSnippetVirtualModuleLoader {
  /** for createSnippetResolver used by unplugin-auto-import */
  resolve?(name: string): boolean;
  /**
   * for build tool to match other plugin
   *
   * @defaultValue '.ts'
   */
  suffix?: string | ((this: SnippetContext) => string | undefined);
}

export interface SnippetVirtualModuleLoader
  extends BaseSnippetVirtualModuleLoader {
  /** to hijack modules */
  resolveId?(
    this: SnippetContext,
    id: string,
    importer: string | undefined,
    options: {
      isEntry: boolean;
    },
  ): Awaitable<string | undefined | void>;
  /** virtual module loader */
  load(
    this: SnippetContext,
    id: string,
    params: Record<string, string | undefined>,
  ): Awaitable<SourceDescription | undefined>;
  /** virtual module's dts */
  dts?(this: SnippetContext, id: string): Awaitable<string | undefined>;
}

export interface SnippetVirtualModule {
  resolveId?(
    this: SnippetContext,
    importer: string | undefined,
    options: {
      isEntry: boolean;
    },
  ): Awaitable<string | undefined | void>;
  load(
    this: SnippetContext,
    params: Record<string, string | undefined>,
  ): Awaitable<SourceDescription | undefined>;
  dts?(this: SnippetContext): Awaitable<string | undefined>;
}

export interface SnippetVirtualModuleSwitcher
  extends BaseSnippetVirtualModuleLoader {
  /** @defaultValue 'default' */
  defaultModuleId?: string;
  modules: Record<
    string,
    string | SnippetVirtualModule | SnippetVirtualModule["load"]
  >;
}

export interface SnippetMacro<T> {
  scan?(this: SnippetContext, s: MagicString): undefined | T;
  transform?(
    this: SnippetContext,
    params: Record<string, string | undefined>,
    s: MagicString,
    context?: T,
  ): void | undefined | string | { code: string; context?: T };
}

/**
 * whole process:
 *
 * 1. transform virtual module api by macro
 *  `e.g. useXxxDialog`
 * 2. resolve virtual module by unimport/unplugin-auto-import
 *  `e.g. import useXxxDialog from 'virtual:mixcode/dialog/useXxxDialog'`
 * 3. load virtual module with dts
 *
 * or
 *
 * 1. import virtual module by macro
 *  `e.g. import 'virtual:mixcode/...'`
 * 2. load virtual module
 */
export interface SnippetDefinition<T = any> {
  dependencies?: SnippetDependencies;
  importer?:
    | ImporterPattern
    | ((this: SnippetContext) => ImporterPattern | undefined);
  virtual?:
    | SnippetVirtualModuleLoader
    | SnippetVirtualModuleLoader["load"]
    | SnippetVirtualModuleSwitcher;
  macro?: SnippetMacro<T> | SnippetMacro<T>["transform"];
  createWatcher?(this: SnippetContext): Watcher;
}

export interface Snippet<T = any> {
  dependencies?: SnippetDependencies;
  importer?: (this: SnippetContext) => ImporterPattern | undefined;
  virtual?: SnippetVirtualModuleLoader;
  macro?: SnippetMacro<T>;
  createWatcher?(this: SnippetContext): Watcher;
}

export type Framework = "react" | "vue" | "vue2";

export type FrameworkSnippet = Partial<Record<Framework, SnippetDefinition>>;

export interface Preset {
  snippets?: Record<string, SnippetDefinition | FrameworkSnippet>;
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
