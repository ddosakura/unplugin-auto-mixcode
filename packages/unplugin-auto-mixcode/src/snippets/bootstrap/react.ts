import { getReactRouter } from "@/snippets/pages/utils";

import type { BootstrapOptions, RouterType } from "./common";

export const byRouterComponent = (routerType: RouterType) => {
  const platform = getReactRouter();
  const component =
    platform === "react-router-native"
      ? "NativeRouter"
      : routerType === "hash"
      ? "HashRouter"
      : "BrowserRouter";
  return `
import { Suspense } from "react";
import { ${component} as Router, useRoutes } from "${platform}";

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

/** @link https://reactrouter.com/en/main/routers/picking-a-router */
export const byRouterCreator = (routerType: RouterType) => {
  const platform = getReactRouter();
  const creator =
    routerType === "hash" ? "createHashRouter" : "createBrowserRouter";
  return `
import { Suspense } from "react";
import { ${creator} as createRouter, RouterProvider } from "${platform}";

import routes from "~mixcode/pages";
console.log("[debug routes]", { routes })

const router = createRouter(routes);
const Pages = () => <Suspense fallback={<App />}>
  <RouterProvider router={router} />
</Suspense>
`;
};

export function bootstrapReact(options: BootstrapOptions) {
  return `
import React from "react";
import ReactDOM from "react-dom/client";

${options.router ? byRouterCreator(options.router) : ""}

ReactDOM.createRoot(document.getElementById("${options.root}") as HTMLElement).render(
  <React.StrictMode>
    ${options.router ? "<Pages />" : "<App />"}
  </React.StrictMode>,
);
`;
}
