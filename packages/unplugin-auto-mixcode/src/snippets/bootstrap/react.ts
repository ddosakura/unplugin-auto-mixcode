import { type Platform, ROUTER_PACKAGES } from "@/snippets/shared";

import type { BootstrapOptions, RouterType } from "./common";

const byRouterComponent = (platform: Platform, routerType: RouterType) => {
  const component =
    platform === "native"
      ? "NativeRouter"
      : platform === "hippy"
      ? "MemoryRouter"
      : routerType === "hash"
      ? "HashRouter"
      : routerType === "memory"
      ? "MemoryRouter"
      : "BrowserRouter";
  return `
import { ${component} as Router, useRoutes } from "${ROUTER_PACKAGES["react"][platform]}";

import routes from "~mixcode/pages";
console.log("[debug routes]", { routes })

const Routes = () => <Suspense fallback={<App />}>
  {useRoutes(routes)}
</Suspense>
const Pages = () => <Router>
  <Routes />
</Router>
`;
};

const byRouterCreator = (platform: Platform, routerType: RouterType) => {
  const creator =
    platform === "native"
      ? "createNativeRouter"
      : platform === "hippy"
      ? "createMemoryRouter"
      : routerType === "hash"
      ? "createHashRouter"
      : routerType === "memory"
      ? "createMemoryRouter"
      : "createBrowserRouter";
  return `
import { ${creator} as createRouter, RouterProvider } from "${ROUTER_PACKAGES["react"][platform]}";

import routes from "~mixcode/pages";
console.log("[debug routes]", { routes })

const router = createRouter(routes);
const Pages = () => <Suspense fallback={<App />}>
  <RouterProvider router={router} />
</Suspense>
`;
};

/** @link https://reactrouter.com/en/main/routers/picking-a-router */
function createRouter(platform: Platform, routerType: RouterType) {
  return platform === "native"
    ? byRouterComponent(platform, routerType)
    : byRouterCreator(platform, routerType);
}

export function bootstrapReact(options: BootstrapOptions) {
  const containerCode = options.container
    ? `
import Container from "${options.container}";
const AppWithContainer = (props) => <Container {...props}>
  <${options.router ? "Pages" : "App"} />
</Container>
`
    : "";
  const app = options.container
    ? "AppWithContainer"
    : options.router
    ? "Pages"
    : "App";

  const bootstrapCode =
    options.platform === "native"
      ? `
import { AppRegistry } from "react-native";
AppRegistry.registerComponent("${options.name}", () => ${app});
`
      : options.platform === "hippy"
      ? `
import { Hippy } from '@hippy/react';
new Hippy({
  appName: "${options.name}",
  entryPage: ${app},
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();
`
      : `
import ReactDOM from "react-dom/client";
ReactDOM.createRoot(document.getElementById("${options.root}") as HTMLElement).render(
  <React.StrictMode>
    <${app} />
  </React.StrictMode>,
);
`;

  return `
import React from "react";
${options.router ? `import { Suspense } from "react";` : ""}
${options.router ? createRouter(options.platform, options.router) : ""}
${containerCode}
${bootstrapCode}
`;
}
