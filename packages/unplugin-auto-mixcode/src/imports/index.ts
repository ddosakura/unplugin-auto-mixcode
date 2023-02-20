import { type Arrayable, toArray } from "@antfu/utils";
import type { ImportsMap, ResolverResult } from "unplugin-auto-import/types";

import { reactivue } from "./reactivue";

const imports = {
  reactivue,
} satisfies Record<string, ImportsMap>;

export const mixcodeImports = (presets: Arrayable<keyof typeof imports>) =>
  toArray(presets).map((name) => imports[name]).filter(Boolean);

export type { ResolverResult };
