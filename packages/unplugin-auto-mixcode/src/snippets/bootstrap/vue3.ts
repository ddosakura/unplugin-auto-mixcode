import { type Platform, getRouterPackage } from "@/snippets/shared";

import type { BootstrapOptions, RouterType } from "./common";

const storeCode = `
import { createPinia } from "pinia";
app.use(createPinia());
`;

const createRouter = (rawPlatform: Platform, routerType: RouterType) => {
  const platform = rawPlatform === "hippy" ? rawPlatform : "web";
  const creator =
    platform === "hippy"
      ? "createHippyRouter"
      : routerType === "browser"
      ? "createWebHistory"
      : routerType === "memory"
      ? "createMemoryHistory"
      : "createWebHashHistory";
  const pkg = getRouterPackage("vue", platform);
  return `
import { createRouter, ${creator} as createHistory } from "${pkg}";

import routes from "~mixcode/pages";
const router = createRouter({
  history: createHistory(),
  routes,
});

app.use(router);
`;
};

export function bootstrapVue3(options: BootstrapOptions) {
  const mountCode = `app.mount("#${options.root}");`;
  const bootstrapCode =
    options.platform === "hippy"
      ? `
app.$start().then(({ superProps, rootViewId }) => {
  ${options.router ? `router.push("/");` : ""}
  ${mountCode}
})
`
      : options.router
      ? `
router.isReady().then(() => {
  ${mountCode}
});
`
      : mountCode;

  const creator =
    options.platform === "web" && options.ssr ? "createSSRApp" : "createApp";
  const rootPropsCode =
    options.platform === "hippy" ? `{ appName: "${options.name}" }` : "{}";
  return `
import { ${creator} as create } from "vue";
const app = create(App, ${rootPropsCode});
${options.store ? storeCode : ""}
${options.router ? createRouter(options.platform, options.router) : ""}
${bootstrapCode}
`;
}
