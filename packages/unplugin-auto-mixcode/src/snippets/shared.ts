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
    web: "",
    hippy: "",
  },
  vue2: {
    web: "",
    hippy: "",
  },
} satisfies Record<Framework, Partial<Record<Platform, string>>>;
