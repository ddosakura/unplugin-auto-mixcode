import type { Platform } from "@/snippets/shared";

export const getRouterType = (router?: string) => {
  if (typeof router === "undefined") return;
  return ["browser", "memory"].includes(router)
    ? (router as "browser" | "memory")
    : "hash";
};

export type RouterType = NonNullable<ReturnType<typeof getRouterType>>;

export interface BootstrapOptions {
  platform: Platform;
  router?: RouterType;

  /** web platform root elementId */
  root: string;
  /** for react-native/hippy's appName */
  name: string;
  /** optional react app container path */
  container?: string;
}
