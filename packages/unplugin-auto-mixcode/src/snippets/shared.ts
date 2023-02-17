import { isPackageExists } from "local-pkg";

import type { Framework } from "@/core/types";

export type Platform = "web" | "native" | "hippy";

export const getPlatform = (framework: Framework): Platform => {
  switch (framework) {
    case "react": {
      return isPackageExists("react-native")
        ? "native"
        : isPackageExists("@hippy/react")
        ? "hippy"
        : "web";
    }
    case "vue": {
      return isPackageExists("@hippy/vue-next") ? "hippy" : "web";
    }
    case "vue2": {
      return isPackageExists("@hippy/vue") ? "hippy" : "web";
    }
  }
};

export const ROUTER_PACKAGES = {
  react: {
    web: "react-router-dom",
    native: "react-router-native",
    hippy: "react-router-dom",
  },
  vue: {
    web: "vue-router", // v4
    hippy: "@hippy/vue-router-next-history",
  },
  vue2: {
    web: "vue-router", // v3
    hippy: "@hippy/vue-router",
  },
} satisfies Record<Framework, Partial<Record<Platform, string>>>;

export const getRouterPackage = (
  framework: Framework,
  platform = getPlatform(framework),
) =>
  ROUTER_PACKAGES[framework][platform as "web"] ??
    ROUTER_PACKAGES[framework]["web"];
