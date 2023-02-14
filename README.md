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

import { presetRecommend } from "@mixcode/unplugin-auto-mixcode";
import AutoMixcode from "@mixcode/unplugin-auto-mixcode/vite";

const mixcode = AutoMixcode({
  presets: [presetRecommend],
});

export default defineConfig({
  plugins: [
    AutoImport({
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

- [bootstrap](./packages/unplugin-auto-mixcode/src/snippets/bootstrap/README.md)
  - [ ] router
    - [x] react
    - [ ] vue
      - https://router.vuejs.org/zh/guide/essentials/history-mode.html
    - [ ] vue2
  - [ ] store
- [dialog](./packages/unplugin-auto-mixcode/src/snippets/dialog/README.md)
  - [ ] impl vue/useXxxDialog by https://vueuse.org/core/useConfirmDialog/
- [pages](./packages/unplugin-auto-mixcode/src/snippets/pages/README.md)
  - [ ] test webpack
  - [ ] spa
    - [ ] vue2
    - [ ] routeBlockQueryRE by resolveId
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
  - [ ] query (swr/useReactQuery)
  - [ ] layout
  - [ ] Design Patterns
  - [ ] polyfill
- packages
  - [ ] [glue-vanilla](http://vanilla-js.com/)
  - [ ] glue-vue
  - [ ] glue-vue2
  - [ ] glue-solid
  - [ ] glue-svelte
