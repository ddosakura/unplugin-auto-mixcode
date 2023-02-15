import type { Platform } from "@/snippets/shared";

export const getRouterType = (router?: string) => {
  if (typeof router === "undefined") return;
  return (router as RouterType) || "hash";
};

export type RouterType = "browser" | "memory" | "hash";

export interface BootstrapOptions {
  platform: Platform;
  router?: RouterType;
  store: boolean;
  ssr: boolean;

  /** web platform root elementId */
  root: string;
  /** for react-native/hippy's appName */
  name: string;
  /**
   * optional react app container path, can get initial props in some case
   *
   * @link https://hippyjs.org/#/hippy-react/introduction?id=%e5%88%9d%e5%a7%8b%e5%8c%96
   **/
  container?: string;
}
