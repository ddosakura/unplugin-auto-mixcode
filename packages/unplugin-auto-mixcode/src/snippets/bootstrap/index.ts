import type { Framework, Snippet } from "@/core/types";

export const bootstrap: Snippet = {
  // support to import from .html
  importer: { exclude: [] },

  // `~mixcode/bootstrap(/<framework>)?`
  virtual: {
    suffix: ".tsx",
    load(
      this,
      rawFramework,
      { unocss, import: importScript, app, root = "root" },
    ) {
      const framework =
        rawFramework === "index" ? this.framework : (rawFramework as Framework);
      const appPath = app ?? DEFAULT_APP_PATH[framework];
      if (!appPath) {
        return `console.warn('[mixcode] unknown framework ${framework}');`;
      }

      const options: BootstrapOptions = { root };
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

const DEFAULT_APP_PATH = {
  react: "/src/App",
  vue: "/src/App.vue",
  vue2: "/src/App.vue",
} satisfies Record<Framework, string>;

interface BootstrapOptions {
  root: string;
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

ReactDOM.createRoot(document.getElementById("${options.root}") as HTMLElement).render(
  <React.StrictMode>
    <App />
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
