import type { Platform } from "@/snippets/shared";
import { type Arrayable, toArray } from "@antfu/utils";

export const getRouterType = (router?: string) => {
  if (typeof router === "undefined") return;
  return (router as RouterType) || "hash";
};

export type RouterType = "browser" | "memory" | "hash";

type ReactStoreType = "recoil" | "pinia";

type VueStoreType = "pinia";

export interface BootstrapOptions {
  platform: Platform;
  router?: RouterType;
  store?: ReactStoreType | VueStoreType;
  ssr: boolean;

  /** web platform root elementId */
  root: string;
  /** for react-native/hippy's appName */
  name: string;
  /**
   * optional react app container component path, can get initial props in some case
   *
   * @link https://hippyjs.org/#/hippy-react/introduction?id=%e5%88%9d%e5%a7%8b%e5%8c%96
   */
  container?: string;
}

interface CommonPlugin {
  imports: Arrayable<string>;
  scripts: Arrayable<
    string | ((app: string) => string | { script: string; app?: string })
  >;
}

export type BootstrapPlugin = Partial<CommonPlugin> | string;

export const createBootstrapPlugin = (
  scripts: BootstrapPlugin = "",
): Partial<CommonPlugin> => typeof scripts === "string" ? { scripts } : scripts;

export const parseBootstrapPlugins = (
  rawPlugins: Arrayable<BootstrapPlugin | undefined>,
  rawApp = "App",
) => {
  const plugins = toArray(rawPlugins)
    .filter(Boolean)
    .map((plugin) => createBootstrapPlugin(plugin));
  const imports = plugins
    .flatMap((plugin) => toArray(plugin.imports ?? []))
    .join("\n");
  let app = rawApp;
  const scripts = plugins
    .flatMap((plugin) => toArray(plugin.scripts ?? []))
    .map((script) => {
      if (typeof script === "string") return script;
      const result = script(app);
      if (typeof result === "string") return result;
      if (result.app) app = result.app;
      return result.script;
    })
    .join("\n");
  return {
    imports,
    scripts,
    app,
  };
};
