import { resolve } from "node:path";

import { slash } from "@antfu/utils";
import {
  PageContext,
  type ResolvedOptions,
  type UserOptions,
  reactResolver,
  vueResolver,
} from "vite-plugin-pages";

import type { Snippet, SnippetContext } from "@/core/types";
import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";
import { Watcher } from "@/core/watcher";

import { getReactRouter } from "./utils";

export interface SnippetPagesOptions extends UserOptions {}

function isPagesDir(path: string, options: ResolvedOptions) {
  for (const page of options.dirs) {
    const dirPath = slash(resolve(options.root, page.dir));
    if (path.startsWith(dirPath)) return true;
  }
  return false;
}

function isTarget(path: string, options: ResolvedOptions) {
  return isPagesDir(path, options) && options.extensionsRE.test(path);
}

export const snippetPages = (
  options: Partial<SnippetPagesOptions> = {},
): Snippet => {
  let pageContext: Promise<PageContext> | undefined = undefined;
  async function getPageContext(snippetContext: SnippetContext) {
    if (pageContext) return pageContext;
    pageContext = new Promise<PageContext>((r) => {
      const ctx = new PageContext(
        {
          ...options,
          resolver: {
            react: reactResolver,
            vue: vueResolver,
            vue2: vueResolver,
          }[snippetContext.framework](),
        },
        snippetContext.root,
      );
      if (snippetContext.logger) {
        ctx.setLogger(snippetContext.logger);
      }
      ctx.searchGlob().then(() => r(ctx));
    });
    return pageContext;
  }
  return {
    createWatcher(this) {
      return new Watcher({
        resource: {
          add: async (path) => {
            const ctx = await getPageContext(this);
            const page = ctx.options.dirs.find((i) =>
              path.startsWith(slash(resolve(this.root, i.dir))),
            )!;
            return ctx.addPage(path, page);
          },
          del: async (path) => {
            const ctx = await getPageContext(this);
            return ctx.removePage(path);
          },
        },
        match: async (path) => {
          const ctx = await getPageContext(this);
          return isTarget(path, ctx.options);
        },
        onUpdate: async (path, type) => {
          const ctx = await getPageContext(this);
          if (type === "change") {
            const page = ctx.pageRouteMap.get(path);
            if (page) await ctx.options.resolver.hmr?.changed?.(ctx, path);
            return;
          }
          return {
            invalidateModules: [
              `${PREFIX_MIXCODE_VIRTUAL_MODULE}pages/index.ts`,
            ],
          };
        },
      });
    },
    // `~mixcode/pages`
    virtual: {
      async load(this) {
        const ctx = await getPageContext(this);
        return ctx.resolveRoutes();
      },
      dts(this) {
        const { framework } = this;
        return {
          react,
          vue,
          vue2: vue,
        }[framework]();
      },
    },
  };
};

const react = () => {
  return `{
  import type { RouteObject } from "${getReactRouter()}";
  const routes: RouteObject[];
  export default routes;
}`;
};

const vue = () => {
  return `{
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}`;
};
