export const getRouterType = (router?: string) => {
  if (typeof router === "undefined") return;
  return ["browser"].includes(router) ? (router as "browser") : "hash";
};

export type RouterType = NonNullable<ReturnType<typeof getRouterType>>;

export interface BootstrapOptions {
  root: string;
  router?: RouterType;
}
