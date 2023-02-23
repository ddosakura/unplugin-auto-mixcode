import type MagicString from "magic-string";

import type { Snippet } from "@/core/types";

import {
  DEFAULT_SUFFIX,
  INJECTED_DIALOG,
  PREFIX,
  PREFIX4RE,
  type SnippetDialogOptions,
} from "./common";

//                                   | scope    |
const RE_OPEN_FUNC = "([a-zA-Z_]\\w*)(\\$[0-9]+)?";

function firstInject(s: MagicString, suffix: string) {
  let counter = 0;
  const scopes: Record<string, Set<string>> = {};
  s.replace(
    new RegExp(`${RE_OPEN_FUNC} = ${PREFIX4RE}([A-Z]\\w*)${suffix}\\(`, "g"),
    (_$0, $1, $scope, $3) => {
      const index = counter++;
      const s = $scope ? $scope.slice(1) : "_";
      if (!scopes[s]) scopes[s] = new Set();
      const dialog = `${INJECTED_DIALOG}${index}`;
      scopes[s].add(`typeof ${dialog} === 'undefined' ? null : ${dialog}`);
      const fn = `${$1}${$scope ? $scope : ""}`;
      return `[${dialog}, ${fn}] = ${PREFIX}${$3}${suffix}(`;
    },
  );
  if (counter === 0) return;
  return scopes;
}

export default ({
  suffix = DEFAULT_SUFFIX,
}: Partial<SnippetDialogOptions>): Snippet => ({
  // ~mixcode/dialog/use$XxxDialog
  virtual: {
    suffix: ".tsx",
    resolve(name) {
      return new RegExp(`${PREFIX4RE}([A-Z]\\w*)${suffix}`).test(name);
    },
    load(id) {
      const componentName = id.replace(PREFIX, "");
      return tplSource(componentName);
    },
    dts(id) {
      const componentName = id.replace(PREFIX, "");
      return tplDts(componentName);
    },
  },
  /** @mixcode dialog */
  macro: {
    scan(s) {
      return firstInject(s, suffix);
    },
    transform(params, _s, scopes?: ReturnType<typeof firstInject>) {
      if (!scopes) return;
      const entries = Object.entries(scopes);
      const keys = Object.keys(params);
      const sets = keys.length === 0
        ? entries
        : entries.filter(([key]) => key === "_" || keys.includes(key));
      const dialogs = sets.flatMap(([, s]) => Array.from(s.values()));
      const code = `${dialogs.join("}{")}`;
      return {
        code,
        context: scopes,
      };
    },
  },
});

const tplSource = (componentName: string) => `
import { usePromisifyDialog } from "@mixcode/glue-react";
export default function(props) {
  return usePromisifyDialog(${componentName}, props);
}
`;

const tplDts = (componentName: string) =>
  `{
  import { OpenPromisifyDialog, TeleportProps } from "@mixcode/glue-react";
  export default function (
    teleportProps?: TeleportProps,
  ): OpenPromisifyDialog<typeof ${componentName}>;
}`;
