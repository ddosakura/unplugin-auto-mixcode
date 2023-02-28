import type { Framework, SnippetDefinition } from "@/core/types";
import { getPlatform } from "@/snippets/shared";

import {
  type BootstrapOptions,
  getRouterType,
  type UserPlugin,
} from "./common";
import { bootstrapReact } from "./react";
import { bootstrapVue2 } from "./vue2";
import { bootstrapVue3 } from "./vue3";

const FRAMEWORK_BOOTSTRAP = {
  react: bootstrapReact,
  vue: bootstrapVue3,
  vue2: bootstrapVue2,
} satisfies Record<Framework, (options: BootstrapOptions) => string>;

const DEFAULT_APP_PATH = {
  react: "/src/App",
  vue: "/src/App.vue",
  vue2: "/src/App.vue",
} satisfies Record<Framework, string>;

const DEFAULT_STORE = {
  react: undefined,
  vue: "pinia",
  vue2: "pinia",
} satisfies Record<Framework, BootstrapOptions["store"]>;

export interface SnippetBootstrapOptions {
  plugins: UserPlugin[];
}

export const snippetBootstrap = (
  { plugins = [] }: Partial<SnippetBootstrapOptions> = {},
): SnippetDefinition => ({
  dependencies: {
    // "vite-plugin-pages": { optional: true },
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
      {
        unocss,
        import: importScript,
        app,
        router,
        store,
        i18n,
        ssr,
        root = "root",
        name = "MixcodeApp",
        container,
      },
    ) {
      const framework = rawFramework === "index"
        ? this.framework
        : (rawFramework as Framework);
      const appPath = app ?? DEFAULT_APP_PATH[framework];
      if (!appPath) {
        return `console.warn('[mixcode] unknown framework ${framework}');`;
      }

      const options: BootstrapOptions = {
        plugins: [
          ...plugins,
          { enforce: "pre", imports: `import App from "${appPath}";` },
        ],
        platform: getPlatform(framework),
        router: getRouterType(router),
        store: store === "" ? DEFAULT_STORE[framework] : (store as undefined),
        i18n,
        ssr: typeof ssr !== "undefined",
        root,
        name,
        container,
      };
      return `
import "~mixcode";
${typeof unocss === "undefined" ? "" : 'import "uno.css";'}
${typeof importScript === "undefined" ? "" : `import "${importScript}";`}
${FRAMEWORK_BOOTSTRAP[framework](options)}
`;
    },
  },
});
