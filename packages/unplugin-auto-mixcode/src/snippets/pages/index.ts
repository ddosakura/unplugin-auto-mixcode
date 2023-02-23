import { resolve } from "node:path";

import { slash } from "@antfu/utils";
import {
  PageContext,
  reactResolver,
  type ReactRoute,
  type ResolvedOptions,
  type UserOptions,
  vueResolver,
} from "vite-plugin-pages";

import type { Snippet, SnippetContext } from "@/core/types";
import { PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";
import { Watcher } from "@/core/watcher";
import { MIXCODE_BASIC_BLOCK_IDS } from "@/snippets/blocks";
import { getRouterPackage } from "@/snippets/shared";

// export interface SnippetPagesOptions extends UserOptions {}
export type SnippetPagesOptions = UserOptions;

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

const routeBlockQueryRE = /\?vue&type=route/;

// https://github.com/hannoeru/vite-plugin-pages/issues/116
// https://github1s.com/hannoeru/vite-plugin-pages/blob/HEAD/src/resolvers/react.ts
const PATH_LAYOUT_PATH = "_layout";
const isReactLayoutPath = (route: ReactRoute) =>
  route.path === PATH_LAYOUT_PATH;
const patchReactLayout = (routes: ReactRoute[]) => {
  routes.forEach((route) => {
    if (route.element || !route.children) return;
    const layout = route.children.find(isReactLayoutPath);
    if (!layout) return;
    route.element = layout.element;
    route.children = route.children.filter((r) => {
      if (isReactLayoutPath(r)) return false;
      if (r.children) {
        patchReactLayout(r.children);
      }
      return true;
    });
  });
  return routes;
};

export const snippetPages = (
  options: Partial<SnippetPagesOptions> = {},
): Snippet => {
  let pageContext: Promise<PageContext> | undefined = undefined;
  async function getPageContext(snippetContext: SnippetContext) {
    if (pageContext) return pageContext;
    pageContext = new Promise<PageContext>((r) => {
      const ctx = new PageContext(
        {
          onRoutesGenerated: snippetContext.framework === "react"
            ? patchReactLayout
            : undefined,
          resolver: {
            react: reactResolver,
            vue: vueResolver,
            vue2: vueResolver,
          }[snippetContext.framework](),
          ...options,
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
    dependencies: { blocks: { snippet: true } },
    createWatcher(this) {
      return new Watcher({
        match: async (path) => {
          const ctx = await getPageContext(this);
          return isTarget(path, ctx.options);
        },
        onUpdate: async (path, type) => {
          const ctx = await getPageContext(this);
          switch (type) {
            case "add": {
              const ctx = await getPageContext(this);
              const page = ctx.options.dirs.find((i) =>
                path.startsWith(slash(resolve(this.root, i.dir)))
              )!;
              await ctx.addPage(path, page);
              break;
            }
            case "unlink": {
              const ctx = await getPageContext(this);
              await ctx.removePage(path);
              break;
            }
            case "change": {
              const page = ctx.pageRouteMap.get(path);
              if (page) await ctx.options.resolver.hmr?.changed?.(ctx, path);
              break;
            }
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
      resolveId(id) {
        if (routeBlockQueryRE.test(id)) {
          return MIXCODE_BASIC_BLOCK_IDS.empty_object;
        }
      },
      async load(this) {
        const ctx = await getPageContext(this);
        return ctx.resolveRoutes();
      },
      dts(this) {
        const { framework } = this;
        return {
          react,
          vue,
          vue2,
        }[framework]();
      },
    },
  };
};

const react = () => {
  const pkg = getRouterPackage("react");
  return `{
  import type { RouteObject } from "${pkg}";
  const routes: RouteObject[];
  export default routes;
}`;
};

const vue = () => {
  const pkg = getRouterPackage("vue");
  return `{
  import type { RouteRecordRaw } from "${pkg}";
  const routes: RouteRecordRaw[];
  export default routes;
}`;
};

const vue2 = () => {
  const pkg = getRouterPackage("vue2");
  return `{
  import type { RouteConfig } from "${pkg}";
  const routes: RouteConfig[];
  export default routes;
}`;
};
