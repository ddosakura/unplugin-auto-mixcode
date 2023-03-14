# unplugin-auto-mixcode

Enhanced plug-in based in `unimport/unplugin-auto-import`, with opinionated
programming paradigm.

Inspired by:

- https://github.com/unjs/unplugin
- https://github.com/unjs/unimport
- https://github.com/antfu/unplugin-auto-import
- https://github.com/antfu/unplugin-vue-components
- https://github.com/hannoeru/vite-plugin-pages
- https://vue-macros.sxzz.moe/

## QuickStart

```ts
// vite.config.ts

import {
  mixcodeImports,
  presetRecommend,
} from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  presets: [presetRecommend],
});

export default defineConfig({
  plugins: [
    AutoImport({
      imports: mixcodeImports(["reactivue"]),
      resolvers: [mixcode.resolver],
    }),
    mixcode,
  ],
});
```

**tips: Don't use `tsc`/`vue-tsc` before `vite build`, if `auto-imports.d.ts` or
`auto-mixcode.d.ts` isn't committed into git.**

- [Opt-out Auto Import](https://github.com/unjs/unimport#opt-out-auto-import)

### Snippets (with Snippet's Roadmap)

> _universal_: can be used anywhere
>
> _compatible_: can be used in a similar ways in different frameworks
>
> _react|vue_: can be used in a similar way in these frameworks

- [blocks _universal_](./packages/unplugin-auto-mixcode/src/snippets/blocks/README.md)
- [bootstrap _compatible_](./packages/unplugin-auto-mixcode/src/snippets/bootstrap/README.md)
  - [ ] ssr (need re-sort import code to export a `createApp` func)
    - https://cn.vitejs.dev/guide/ssr.html
    - https://vite-plugin-ssr.com/routing
    - [ ] react
    - [ ] vue
    - [ ] vue2
      - https://v2.ssr.vuejs.org/zh/guide/
- [dialog _react|vue|vue2_](./packages/unplugin-auto-mixcode/src/snippets/dialog/README.md)
- [i18n _compatible_](./packages/unplugin-auto-mixcode/src/snippets/i18n/README.md)
- [pages _compatible_](./packages/unplugin-auto-mixcode/src/snippets/pages/README.md)
  - **Webpack's hmr is unavailable.**
  - [ ] spa
    - [x] react
    - [x] vue
    - [x] vue2
    - [ ] solid
    - [ ] svelte
  - [ ] mpa
- [run _universal_](./packages/unplugin-auto-mixcode/src/snippets/run/README.md)

## Roadmap

- features
  - [ ] support unimport's addon
- snippets
  - state manager
    - https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems
    - [ ] immer
    - [ ] xstate
    - [ ] rxjs
  - [ ] query
    - swr
    - TanStack Query (React Query)
    - https://redux-toolkit.js.org/rtk-query/overview
    - Apollo Client
    - tRPC
    - Relay
  - [ ] data_visualization
    > https://2022.stateofjs.com/zh-Hans/other-tools/#data_visualization
  - [ ] layout
  - [ ] Design Patterns
  - [ ] fp
    - https://ramdajs.com/
    - https://github.com/lodash/lodash/wiki/FP-Guide
  - https://github.com/colinhacks/zod
  - https://github.com/stdlib-js/stdlib
  - [ ] polyfill
  - check other lib in unimport/unplugin-auto-import's preset
  - [ ] redux **list from `@/features/counter/counterSlice` like router**
  - [ ] pinia
    > `useCounterStore = $defineStore(() => {` =>
    > `useCounterStore = defineStore("counter", () => {`
  - [ ] Web Worker
    > https://github.com/BuilderIO/partytown
- framework packages
  - https://github.com/BuilderIO/mitosis
  - [ ] [glue-vanilla](http://vanilla-js.com/)
  - [ ] glue-preact
  - [ ] glue-vue
  - [ ] glue-vue2
  - [ ] glue-solid
  - [ ] glue-svelte
  - [ ] [glue-qwik](https://qwik.builder.io/)
