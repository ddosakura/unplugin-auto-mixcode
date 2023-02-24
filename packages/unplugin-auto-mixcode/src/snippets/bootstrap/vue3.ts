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
  const creator = platform === "hippy"
    ? "createHippyRouter"
    : routerType === "browser"
    ? "createWebHistory"
    : routerType === "memory"
    ? "createMemoryHistory"
    : "createWebHashHistory";
  const pkg = getRouterPackage("vue", platform);
  return createBootstrapPlugin({
    imports:
      `import { createRouter, ${creator} as createHistory } from "${pkg}";`,
    scripts: `
import routes from "~mixcode/pages";
const router = createRouter({
  history: createHistory(),
  routes,
});
app.use(router);
`,
  });
};

// === store ===

const storePlugin = <BootstrapPlugin> {
  imports: `import { createPinia } from "pinia";`,
  scripts: "app.use(createPinia());",
};

// === platform & ssr ===

const createAppPlugin = (options: BootstrapOptions) => {
  const creator = options.platform === "web" && options.ssr
    ? "createSSRApp"
    : "createApp";
  const rootPropsCode = options.platform === "hippy"
    ? `{ appName: "${options.name}" }`
    : "{}";
  return createBootstrapPlugin({
    imports: `import { ${creator} as create } from "vue";`,
    scripts: () => ({
      script: `const app = create(App, ${rootPropsCode});`,
      // may change in ssr
      app: `app.mount("#${options.root}");`,
    }),
  });
};

const createStartPlugin = (options: BootstrapOptions) => {
  if (options.platform === "hippy") {
    return createBootstrapPlugin({
      scripts: (app) => `
app.$start().then(({ superProps, rootViewId }) => {
  ${options.router ? `router.push("/");` : ""}
  ${app}
})
`,
    });
  }
  return createBootstrapPlugin({
    scripts: (app) =>
      options.router
        ? `
router.isReady().then(() => {
  ${app}
});
`
        : app,
  });
};

// === bootstrap ===

export function bootstrapVue3(options: BootstrapOptions) {
  const { imports, scripts } = parseBootstrapPlugins([
    ...options.plugins.filter(({ enforce }) => enforce === "pre"),
    createAppPlugin(options),

    createRouterPlugin(options),
    options.store ? storePlugin : undefined,
    ...options.plugins.filter(({ enforce }) => typeof enforce === "undefined"),

    createStartPlugin(options),
    ...options.plugins.filter(({ enforce }) => enforce === "post"),
  ]);
  return [imports, scripts].join("\n");
}
