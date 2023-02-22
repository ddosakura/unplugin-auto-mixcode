import type MagicString from "magic-string";

import type { Snippet } from "@/core/types";
import { getPkgVersion, PREFIX_MIXCODE_VIRTUAL_MODULE } from "@/core/utils";

import {
  DEFAULT_SUFFIX,
  INJECTED_DIALOG,
  PREFIX,
  PREFIX4RE,
  type SnippetDialogOptions,
} from "./common";

const RE_OPEN_FUNC = "([a-zA-Z_]\\w*)";

function firstInject(s: MagicString, suffix: string) {
  let counter = 0;
  const dialogs = new Map<string, string>();
  s.replace(
    new RegExp(`${RE_OPEN_FUNC} = ${PREFIX4RE}([A-Z]\\w*)${suffix}\\(`, "g"),
    (_$0, $1, $3) => {
      const index = counter++;
      const dialog = `${INJECTED_DIALOG}${index}`;
      const componentName = `${$3}${suffix}`;
      dialogs.set(dialog, componentName);
      return `[{
        teleportProps: ${dialog}_teleportProps,
        transitionProps: ${dialog}_transitionProps,
        bindProps: ${dialog}_bindProps,
      }, ${$1}] = ${PREFIX}${componentName}(`;
    },
  );
  return dialogs;
}

const MODULE_USE_URI = `${PREFIX_MIXCODE_VIRTUAL_MODULE}dialog/use`;

export default ({
  suffix = DEFAULT_SUFFIX,
}: Partial<SnippetDialogOptions>): Snippet => ({
  // ~mixcode/dialog/use$XxxDialog
  virtual: {
    resolve(name) {
      return new RegExp(`${PREFIX4RE}([A-Z]\\w*)${suffix}`).test(name);
    },
    load(id) {
      if (id === "use") return MODULE_USE_SOURCE;
      return `export { default } from "${MODULE_USE_URI}.ts";`;
    },
    dts(id) {
      if (id === "use") return MODULE_USE_DTS;
      const componentName = id.replace(PREFIX, "");
      const isVue2 = this.framework === "vue2";
      return dts(componentName, isVue2);
    },
  },
  /** <!-- @mixcode dialog --> */
  macro(this, _params, s, context?: boolean) {
    if (context) return;
    const dialogs = Array.from(firstInject(s, suffix).entries());
    if (dialogs.length === 0) return;
    const isVue2 = this.framework === "vue2";
    const templates = dialogs
      .map(([ctx, cname]) => tpl(cname, ctx, isVue2))
      .join("");
    return {
      code: templates,
      context: true,
    };
  },
});

const tpl = (componentName: string, ctx: string, isVue2: boolean) => {
  const dialog =
    `<${componentName} v-if="${ctx}_bindProps" v-bind="${ctx}_bindProps" />`;
  return isVue2 ? dialog : `
<Teleport v-bind="${ctx}_teleportProps">
  <Transition v-bind="${ctx}_transitionProps">
    ${dialog}
  </Transition>
</Teleport>
`;
};

// vs https://vueuse.org/core/useConfirmDialog/
const MODULE_USE_SOURCE = `
export default function(teleportProps = {}, transitionProps = {}) {
  const bindProps = ref();
  const open = (props) =>
    new Promise((resolve, reject) => {
      bindProps.value = {
        ...props,
        onResolve(value) {
          bindProps.value = undefined;
          resolve(value);
        },
        onReject(reason) {
          bindProps.value = undefined;
          reject(reason);
        },
      };
    });
  return [{ teleportProps, transitionProps, bindProps }, open];
}
`;

const MODULE_USE_DTS = `{
  export type ComponentProps<T> =
    & Record<string, unknown>
    & (
      T extends new (...args: any) => { $props: infer Props } ? Props
        : T extends (props: infer Props, ...args: any) => any ? Props
        : T extends (...args: any) => { props: infer Props } ? Props
        : T extends new (...args: any) => any ? {}
        : T extends (...args: any) => any ? {}
        : T // IntrinsicElement
    );
}`;

const dts = async (componentName: string, isVue2: boolean) => {
  if (isVue2) {
    const version = getPkgVersion("vue", "2.7");
    const MODULE_VUE_GLOBAL = (await version).startsWith("2.7")
      ? "vue"
      : "@vue/runtime-dom";
    return `{
  // https://marketplace.visualstudio.com/items?itemName=Vue.volar
  import type { GlobalComponents } from "${MODULE_VUE_GLOBAL}";
  import type { ComponentProps } from "${MODULE_USE_URI}";
  type Props = Omit<
    ComponentProps<GlobalComponents["${componentName}"]>,
    "class" | "style" | "key" | "ref" | "ref_for" | "ref_key" | \`on\${string}\`
  >;
  export default function (): (props: Props) => Promise<Props | undefined>
}`;
  }
  return `{
  import type { MaybeRef } from "@vueuse/core";
  import type { TeleportProps, TransitionProps } from "vue";
  import type { GlobalComponents } from "@vue/runtime-core";
  import type { ComponentProps } from "${MODULE_USE_URI}";
  type Props = Omit<
    ComponentProps<GlobalComponents["${componentName}"]>,
    "class" | "style" | "key" | "ref" | "ref_for" | "ref_key" | \`on\${string}\`
  >;
  export default function (
    teleportProps: MaybeRef<Partial<TeleportProps>> = {},
    transitionProps: MaybeRef<TransitionProps> = {},
  ): (props: Props) => Promise<Props | undefined>
}`;
};
