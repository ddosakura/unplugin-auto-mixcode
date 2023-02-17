import type { ImportsMap } from "unplugin-auto-import/types";

// https://github.com/antfu/reactivue/blob/master/packages/reactivue/src/index.ts
export const reactivue = <ImportsMap> {
  reactivue: [
    "useSetup",
    "createSetup",

    // @vue/reactivity's export, but not in unimport's vue preset
    // effect,
    // enableTracking,
    // pauseTracking,
    // resetTracking,
    // stop,
    // track,
    // trigger,
    // ComputedGetter,
    // ComputedSetter,
    // DebuggerEvent,
    // DeepReadonly,
    // ITERATE_KEY,
    // ReactiveEffect,
    // ReactiveEffectOptions,
    // ReactiveFlags,
    // RefUnwrapBailTypes,
    // ToRefs,
    // TrackOpTypes,
    // TriggerOpTypes,
    // UnwrapRef,
    // WritableComputedOptions,
    // WritableComputedRef,

    // copy from https://github.com/unjs/unimport/blob/HEAD/src/presets/vue.ts

    // lifecycle
    // "onActivated",
    "onBeforeMount",
    "onBeforeUnmount",
    "onBeforeUpdate",
    // "onErrorCaptured",
    // "onDeactivated",
    "onMounted",
    // "onServerPrefetch",
    "onUnmounted",
    "onUpdated",

    // setup helpers
    // "useAttrs",
    // "useSlots",

    // reactivity,
    "computed",
    "customRef",
    "isReadonly",
    "isRef",
    "isProxy",
    "isReactive",
    "markRaw",
    "reactive",
    "readonly",
    "ref",
    "shallowReactive",
    "shallowReadonly",
    "shallowRef",
    "triggerRef",
    "toRaw",
    "toRef",
    "toRefs",
    "unref",
    "watch",
    "watchEffect",
    // "watchPostEffect",
    // "watchSyncEffect",

    // component
    "defineComponent",
    // "defineAsyncComponent",
    "getCurrentInstance",
    // "h",
    "inject",
    "nextTick",
    "provide",
    // "useCssModule",
    "createApp",

    // effect scope
    // "effectScope",
    // "EffectScope",
    // "getCurrentScope",
    // "onScopeDispose",

    // types
    ...[
      // "Component",
      // "ComponentPublicInstance",
      "ComputedRef",
      // "InjectionKey",
      // "PropType",
      "Ref",
    ].map((name) => ({ name, type: true })),
  ],
};
