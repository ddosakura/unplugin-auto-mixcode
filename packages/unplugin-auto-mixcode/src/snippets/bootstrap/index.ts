import type { Framework, Snippet } from "@/core/types";

import { getReactRouter } from "@/snippets/pages/utils";

export const snippetBootstrap: Snippet = {
  dependencies: {
    "vite-plugin-pages": { optional: true },
    pages: { optional: true, snippet: true },
  },
  // support to import from .html
  importer: { exclude: [] },

  // `~mixcode/bootstrap(/<framework>)?`
  virtual: {
    suffix(this) {
      return ["react"].includes(this.framework) ? ".tsx" : ".ts";
    },
    load(
      this,
      rawFramework,
      { unocss, import: importScript, app, root = "root", router },
    ) {
      const framework =
        rawFramework === "index" ? this.framework : (rawFramework as Framework);
      const appPath = app ?? DEFAULT_APP_PATH[framework];
      if (!appPath) {
        return `console.warn('[mixcode] unknown framework ${framework}');`;
      }

      const options: BootstrapOptions = { root, router: getRouterType(router) };
      return `
import "~mixcode";

${typeof unocss === "undefined" ? "" : 'import "uno.css";'}
${typeof importScript === "undefined" ? "" : `import "${importScript}";`}

import App from "${appPath}";

${FRAMEWORK_BOOTSTRAP[framework](options)}
`;
    },
  },
};

const getRouterType = (router?: string) => {
  if (typeof router === "undefined") return;
  return ["browser"].includes(router) ? (router as "browser") : "hash";
};

type RouterType = NonNullable<ReturnType<typeof getRouterType>>;

const DEFAULT_APP_PATH = {
  react: "/src/App",
  vue: "/src/App.vue",
  vue2: "/src/App.vue",
} satisfies Record<Framework, string>;

interface BootstrapOptions {
  root: string;
  router?: RouterType;
}

const FRAMEWORK_BOOTSTRAP = {
  react: bootstrapReact,
  vue: bootstrapVue3,
  vue2: bootstrapVue2,
} satisfies Record<Framework, (options: BootstrapOptions) => string>;

function bootstrapReact(options: BootstrapOptions) {
  return `
import React from "react";
import ReactDOM from "react-dom/client";

${
  options.router
    ? `
import { Suspense } from "react";
import { ${
        options.router === "hash" ? "HashRouter" : "BrowserRouter"
      } as Router, useRoutes } from "${getReactRouter()}";
import routes from "~mixcode/pages";
console.log("[debug routes]", { routes })

const Pages = () => {
  return (
    <Suspense fallback={<App />}>
      {useRoutes(routes)}
    </Suspense>
  );
};
`
    : ""
}

ReactDOM.createRoot(document.getElementById("${options.root}") as HTMLElement).render(
  <React.StrictMode>
    ${options.router ? "<Router><Pages /></Router>" : "<App />"}
  </React.StrictMode>,
);
`;
}

function bootstrapVue3(options: BootstrapOptions) {
  return `
import { createApp } from "vue";
const app = createApp(App);

// app.use(router);

app.mount("#${options.root}");
`;
}

function bootstrapVue2(options: BootstrapOptions) {
  return `
import Vue from 'vue';

new Vue({
  // router,
  // store,
  render: h => h(App),
}).$mount('#${options.root}');
`;
}
