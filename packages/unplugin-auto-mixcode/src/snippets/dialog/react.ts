import type { Snippet } from "@/core/types";
import { macroRegExp } from "@/core/utils";

import { IINJECTED_MIXCODE_DIALOG } from "./common";

export default <Snippet>{
  suffix: ".tsx",
  resolve(name) {
    return /use([A-Z]\w*)Dialog/.test(name);
  },
  load(id) {
    const componentName = id.replace("use", "");
    return `
import { usePromisifyDialog } from "@mixcode/glue-react";
export default function(props) {
return usePromisifyDialog(${componentName}, props);
}`;
  },
  dts(id) {
    const componentName = id.replace("use", "");
    return `
declare module "~mixcode/dialog/${id}" {
import { OpenPromisifyDialog, TeleportProps } from "@mixcode/glue-react";
export default function (
  teleportProps?: TeleportProps,
): OpenPromisifyDialog<typeof ${componentName}>;
}`;
  },
  transform(code) {
    // TODO: handle sourcemap by MagicString
    let counter = 0;
    const injected = code.replace(
      new RegExp("([a-zA-Z_]\\w*) = use([A-Z]\\w*)Dialog\\(", "g"),
      (_$0, $1, $2) =>
        `[${IINJECTED_MIXCODE_DIALOG}${counter++}, ${$1}] = use${$2}Dialog(`,
    );
    if (counter === 0) return;
    const dialogs = Array.from({ length: counter })
      .map((_, index) => {
        const dialog = `${IINJECTED_MIXCODE_DIALOG}${index}`;
        return `typeof ${dialog} === 'undefined' ? null : ${dialog}`;
      })
      .join("}{");
    return injected.replace(macroRegExp("dialog"), `${dialogs}`);
  },
};
