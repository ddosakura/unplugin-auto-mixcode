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

### Snippets

- [dialog](./packages/unplugin-auto-mixcode/src/snippets/dialog/README.md)

## Roadmap

- features
  - [ ] keep func for unimport/unplugin-auto-import (by
        https://github1s.com/unjs/unimport/blob/HEAD/src/extract.ts) &
        ~~dirsScan & writeDtsFile on build~~
  - [ ] get options/viteConfig in Snippet's methods
  - [ ] macro with params
  - [ ] use$
  - [ ] support unimport's addon
- snippets
  - [ ] pages (spa/mpa)
  - [ ] bootstrap `~mixcode/boot | ~mixcode/boot/index | ~mixcode/boot/?xxx`
  - [ ] layout
  - [ ] xstate
  - [ ] Design Patterns
  - [ ] query (swr/useReactQuery)
  - [ ] `@mixcode/run/...`
- packages
  - [ ] [glue-vanilla](http://vanilla-js.com/)
  - [ ] glue-vue
  - [ ] glue-vue2
  - [ ] glue-solid
  - [ ] glue-svelte
