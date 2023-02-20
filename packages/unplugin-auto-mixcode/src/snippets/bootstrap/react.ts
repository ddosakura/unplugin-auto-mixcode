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
    createRouterPlugin(options),
    createStorePlugin(options.store),
    ...createPlatformPlugin(options),
  ]);
  return `
import React from "react";
import { Suspense } from "react";
${imports}
${scripts}
`;
}
