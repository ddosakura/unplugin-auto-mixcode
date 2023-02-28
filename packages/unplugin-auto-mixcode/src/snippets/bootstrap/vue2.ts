import { isPackageExists } from "local-pkg";

import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";
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

// === i18n ===

const i18nPlugin = <BootstrapPlugin> {
  imports: `
import { createI18n } from 'vue-i18n-bridge'
import i18nOptions from "${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/vue";
`,
  scripts: `
Vue.use(VueI18n, { bridge: true });
const i18n = createI18n(i18nOptions, VueI18n);
Vue.use(i18n);
`,
};

/** @link https://github.com/i18next/i18next-vue/tree/vue-2 */
const i18nextPlugin = <BootstrapPlugin> {
  imports: `
import i18next from "i18next";
import I18NextVue from "i18next-vue";
import "${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/i18next";
`,
  scripts: `Vue.use(I18NextVue, { i18next });`,
};

const createI18nPlugin = (options: BootstrapOptions) => {
  if (typeof options.i18n === "undefined") return;
  if (isPackageExists("vue-i18n-bridge")) return i18nPlugin;
  return i18nextPlugin;
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
  const { imports, scripts } = parseBootstrapPlugins([
    ...options.plugins.filter(({ enforce }) => enforce === "pre"),
    `import Vue from "${options.platform === "hippy" ? "@hippy/vue" : "vue"}";`,
    // for vue 2.6
    isPackageExists("@vue/composition-api")
      ? {
        imports: `import VueCompositionAPI from "@vue/composition-api";`,
        scripts: `Vue.use(VueCompositionAPI);`,
      }
      : undefined,

    createRouterPlugin(options),
    options.store ? storePlugin : undefined,
    createI18nPlugin(options),
    ...options.plugins.filter(({ enforce }) => typeof enforce === "undefined"),

    createPlatformPlugin(options),
    ...options.plugins.filter(({ enforce }) => enforce === "post"),
  ]);
  return [imports, scripts].join("\n");
}
