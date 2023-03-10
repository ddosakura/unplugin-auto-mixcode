import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";
import { getRouterPackage, type Platform } from "@/snippets/shared";

import {
  type BootstrapOptions,
  type BootstrapPlugin,
  createBootstrapPlugin,
  parseBootstrapPlugins,
  type RouterType,
} from "./common";

// === router ===

const byRouterComponent = (platform: Platform, routerType: RouterType) => {
  const component = platform === "native"
    ? "NativeRouter"
    : platform === "hippy"
    ? "MemoryRouter"
    : routerType === "browser"
    ? "BrowserRouter"
    : routerType === "memory"
    ? "MemoryRouter"
    : "HashRouter";
  const pkg = getRouterPackage("react", platform);
  return createBootstrapPlugin({
    imports: `
import { ${component} as Router, useRoutes } from "${pkg}";
import routes from "~mixcode/pages";
`,
    scripts: (app) => ({
      app: "Pages",
      script: `
const Routes = () => <Suspense fallback={<${app} />}>
  {useRoutes(routes)}
</Suspense>
const Pages = () => <Router>
  <Routes />
</Router>
`,
    }),
  });
};

const byRouterCreator = (platform: Platform, routerType: RouterType) => {
  const creator = platform === "native"
    ? "createNativeRouter"
    : platform === "hippy"
    ? "createMemoryRouter"
    : routerType === "browser"
    ? "createBrowserRouter"
    : routerType === "memory"
    ? "createMemoryRouter"
    : "createHashRouter";
  const pkg = getRouterPackage("react", platform);
  return createBootstrapPlugin({
    imports: `
import { ${creator} as createRouter, RouterProvider } from "${pkg}";
import routes from "~mixcode/pages";
`,
    scripts: (app) => ({
      app: "Pages",
      script: `
const router = createRouter(routes);
const Pages = () => <Suspense fallback={<${app} />}>
  <RouterProvider router={router} />
</Suspense>
`,
    }),
  });
};

/** @link https://reactrouter.com/en/main/routers/picking-a-router */
function createRouterPlugin({
  platform,
  router: routerType,
}: BootstrapOptions) {
  if (!routerType) return;
  return platform === "native"
    ? byRouterComponent(platform, routerType)
    : byRouterCreator(platform, routerType);
}

// === store ===

const recoilPlugin = createBootstrapPlugin({
  imports: `import { RecoilRoot } from "recoil";`,
  scripts: (app) => ({
    app: "RecoilApp",
    script: `const RecoilApp = () => <RecoilRoot><${app} /></RecoilRoot>`,
  }),
});

/**
 * not recommended
 *
 * @link https://github.com/antfu/reactivue/pull/46
 */
const piniaPlugin = createBootstrapPlugin({
  imports: `
import { createPinia } from "pinia";
import { createApp as createReactivueApp } from "reactivue";
`,
  scripts: "createReactivueApp().use(createPinia());",
});

const storePlugins = {
  recoilPlugin,
  piniaPlugin,
} as Record<`${string}Plugin`, BootstrapPlugin>;

const createStorePlugin = (store: BootstrapOptions["store"]) =>
  storePlugins[`${store}Plugin`];

// === i18n ===

/** @link https://github.com/i18next/react-i18next */
const i18nextPlugin = <BootstrapPlugin> {
  imports: `import "${PREFIX_MIXCODE_VIRTUAL_MODULE}i18n/i18next";`,
};

const createI18nPlugin = (options: BootstrapOptions) => {
  if (typeof options.i18n === "undefined") return;
  return i18nextPlugin;
};

// === platform & ssr ===

const platformReactNative = (name: string) => (app: string) =>
  `AppRegistry.registerComponent("${name}", () => ${app});`;

const platformHippy = (name: string) => (app: string) => `
new Hippy({
  appName: "${name}",
  entryPage: ${app},
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();
`;

const platformReactDom = (root: string) => (app: string) => `
ReactDOM.createRoot(document.getElementById("${root}") as HTMLElement).render(
  <React.StrictMode>
    <${app} />
  </React.StrictMode>,
);
`;

const createPlatformPlugin = (options: BootstrapOptions) => {
  const containerPlugin = options.container
    ? createBootstrapPlugin({
      imports: `import Container from "${options.container}";`,
      scripts: (app) => ({
        app: "AppWithContainer",
        script: `
const AppWithContainer = (props) => <Container {...props}>
  <${app} />
</Container>
`,
      }),
    })
    : undefined;
  const platformPlugin = options.platform === "native"
    ? createBootstrapPlugin({
      imports: `import { AppRegistry } from "react-native";`,
      scripts: platformReactNative(options.name),
    })
    : options.platform === "hippy"
    ? createBootstrapPlugin({
      imports: `import { Hippy } from '@hippy/react';`,
      scripts: platformHippy(options.name),
    })
    : createBootstrapPlugin({
      imports: `import ReactDOM from "react-dom/client";`,
      scripts: platformReactDom(options.root),
    });
  return [containerPlugin, platformPlugin];
};

// === bootstrap ===

export function bootstrapReact(options: BootstrapOptions) {
  const { imports, scripts } = parseBootstrapPlugins([
    ...options.plugins.filter(({ enforce }) => enforce === "pre"),
    `import React from "react";\nimport { Suspense } from "react";`,

    createRouterPlugin(options),
    createStorePlugin(options.store),
    createI18nPlugin(options),
    ...options.plugins.filter(({ enforce }) => typeof enforce === "undefined"),

    ...createPlatformPlugin(options),
    ...options.plugins.filter(({ enforce }) => enforce === "post"),
  ]);
  return [imports, scripts].join("\n");
}
