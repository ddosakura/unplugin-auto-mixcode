# Bootstrap Snippet

## QuickStart

```html
<script type="module" src="~mixcode/bootstrap"></script>
```

### Params

- unocss: **enable unocss** e.g. `~mixcode/bootstrap?unocss`
- import: **import a style/script** e.g.
  `~mixcode/bootstrap?import=/src/index.css`
- app: **entry of app** e.g. `~mixcode/bootstrap?app=/src/App.vue`
- router: **browser/memory/hash router** `~mixcode/bootstrap?router=browser`
- store: **enable store** e.g. `~mixcode/bootstrap?store`
- ~~ssr: **enable ssr** e.g. `~mixcode/bootstrap?ssr`~~
- root: **web platform root elementId** e.g. `~mixcode/bootstrap?root=app`
- name: **react-native/hippy's appName** e.g. `~mixcode/bootstrap?name=demo`
- container: **optional react app container component path** e.g.
  `~mixcode/bootstrap?container=/src/Container`

## About Store

### React

> It is recommended to use [Jotai](https://github.com/pmndrs/jotai) directly.

- Recoil
- Pinia: by [reactivue](https://github.com/antfu/reactivue)
- ~~Redux: need `snippet/redux` to optimize~~
- ~~Mobx~~

### Vue

> use [Pinia](https://github.com/vuejs/pinia).
