import { getRouterPackage } from "@/snippets/shared";

import {
  type BootstrapOptions,
  type BootstrapPlugin,
  createBootstrapPlugin,
  parseBootstrapPlugins,
} from "./common";

// === router ===

const createRouterPlugin = ({
  platform: rawPlatform,
  router: routerType,
}: BootstrapOptions) => {
  if (!routerType) return;
  const platform = rawPlatform === "hippy" ? rawPlatform : "web";
  const mode = platform === "hippy"
    ? undefined
    : routerType === "browser"
    ? "history"
    : routerType === "memory"
    ? "abstract"
    : "hash";
  const pkg = getRouterPackage("vue", platform);
  return createBootstrapPlugin({
    imports: `
import VueRouter from "${pkg}";
Vue.use(VueRouter);
import routes from "~mixcode/pages";
`,
    scripts: `
const router = new VueRouter({
  ${mode ? `mode: "${mode}",` : ""}
  routes,
});
`,
  });
};

// === store ===

const storePlugin = <BootstrapPlugin> {
  imports: `
import { PiniaVuePlugin, createPinia } from "pinia";
Vue.use(PiniaVuePlugin);
`,
  scripts: "const pinia = createPinia();",
};

// === platform & ssr ===

const createApp = (options: BootstrapOptions, inject = "") => `
const app = new Vue({
  ${inject}
  ${options.store ? "pinia," : ""}
  ${options.router ? "router," : ""}
  render: (h) => h(App),
});
`;

const createPlatformPlugin = (options: BootstrapOptions) => {
  if (options.platform === "hippy") {
    return createApp(
      options,
      `appName: "${options.name}", rootView: "#${options.root}",`,
    );
  }
  return options.router
    ? `
${createApp(options)}
// router.onReady(() => app.$mount("#${options.root}"));
app.$mount("#${options.root}");
`
    : createApp(options, `el: "#${options.root}",`);
};

// === bootstrap ===

export function bootstrapVue2(options: BootstrapOptions) {
  console.log("options", options);
  const { imports, scripts } = parseBootstrapPlugins([
    createRouterPlugin(options),
    options.store ? storePlugin : undefined,
    createPlatformPlugin(options),
  ]);

  return `
import Vue from "${options.platform === "hippy" ? "@hippy/vue" : "vue"}";
${imports}
${scripts}
`;
}
