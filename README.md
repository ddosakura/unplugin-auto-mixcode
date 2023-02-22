# unplugin-auto-mixcode

Enhanced plug-in based in `unimport/unplugin-auto-import`, with opinionated
programming paradigm.

- https://github.com/unjs/unplugin
- https://github.com/unjs/unimport
- https://github.com/antfu/unplugin-auto-import
- https://github.com/antfu/unplugin-vue-components
- https://github.com/hannoeru/vite-plugin-pages

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

- [blocks](./packages/unplugin-auto-mixcode/src/snippets/blocks/README.md)
- [bootstrap](./packages/unplugin-auto-mixcode/src/snippets/bootstrap/README.md)
  - [ ] ssr (need re-sort import code to export a `createApp` func)
    - https://cn.vitejs.dev/guide/ssr.html
    - https://vite-plugin-ssr.com/routing
    - [ ] react
    - [ ] vue
    - [ ] vue2
      - https://v2.ssr.vuejs.org/zh/guide/
- [dialog](./packages/unplugin-auto-mixcode/src/snippets/dialog/README.md)
- [pages](./packages/unplugin-auto-mixcode/src/snippets/pages/README.md)
  - **Webpack's hmr is unavailable.**
  - [ ] spa
    - [x] react
    - [x] vue
    - [x] vue2
    - [ ] solid
    - [ ] svelte
  - [ ] mpa
- [run](./packages/unplugin-auto-mixcode/src/snippets/run/README.md)

## Roadmap

- features
  - [ ] support unimport's addon
- snippets
  - [ ] immer
  - [ ] xstate
  - [ ] rxjs
    - https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#rxjs
  - [ ] query
    > (swr/useReactQuery or https://redux-toolkit.js.org/rtk-query/overview)
  - [ ] layout
  - [ ] Design Patterns
  - [ ] polyfill
  - check other lib in unimport/unplugin-auto-import's preset
  - [ ] redux **list from `@/features/counter/counterSlice` like router**
  - [ ] pinia
    > `useCounterStore = $defineStore(() => {` =>
    > `useCounterStore = defineStore("counter", () => {`
- packages
  - [ ] [glue-vanilla](http://vanilla-js.com/)
  - [ ] glue-preact
  - [ ] glue-vue
  - [ ] glue-vue2
  - [ ] glue-solid
  - [ ] glue-svelte
