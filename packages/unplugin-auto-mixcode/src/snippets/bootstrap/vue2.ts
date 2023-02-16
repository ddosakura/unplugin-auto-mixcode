import { type Platform, getRouterPackage } from "@/snippets/shared";

import type { BootstrapOptions, RouterType } from "./common";

const storeCode = `
import { PiniaVuePlugin, createPinia } from "pinia";
Vue.use(PiniaVuePlugin);
const pinia = createPinia();
`;

const createRouter = (rawPlatform: Platform, routerType: RouterType) => {
  const platform = rawPlatform === "hippy" ? rawPlatform : "web";
  const mode =
    platform === "hippy"
      ? undefined
      : routerType === "browser"
      ? "history"
      : routerType === "memory"
      ? "abstract"
      : "hash";
  const pkg = getRouterPackage("vue", platform);
  return `
import VueRouter from "${pkg}";
Vue.use(VueRouter)
import routes from "~mixcode/pages";
const router = new VueRouter({
  ${mode ? `mode: "${mode}",` : ""}
  routes,
});
`;
};

const createApp = (options: BootstrapOptions, inject = "") => `
const app = new Vue({
  ${inject}
  ${options.store ? "pinia," : ""}
  ${options.router ? "router," : ""}
  render: (h) => h(App),
});
`;

export function bootstrapVue2(options: BootstrapOptions) {
  const bootstrapCode =
    options.platform === "hippy"
      ? createApp(
          options,
          `appName: "${options.name}", rootView: "#${options.root}",`,
        )
      : options.router
      ? `
${createApp(options)}
// router.onReady(() => app.$mount("#${options.root}"));
app.$mount("#${options.root}");
`
      : createApp(options, `el: "#${options.root}",`);
  return `
import Vue from "${options.platform === "hippy" ? "@hippy/vue" : "vue"}";
${options.router ? createRouter(options.platform, options.router) : ""}
${options.store ? storeCode : ""}
${bootstrapCode} 
`;
}
