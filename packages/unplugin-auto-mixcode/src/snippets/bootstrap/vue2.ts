import type { BootstrapOptions } from "./common";

export function bootstrapVue2(options: BootstrapOptions) {
  return `
import Vue from 'vue';

new Vue({
  // router,
  // store,
  render: h => h(App),
}).$mount('#${options.root}');
`;
}

/*
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

new Vue({
  el: '#app',
  // other options...
  // ...
  // note the same `pinia` instance can be used across multiple Vue apps on
  // the same page
  pinia,
})
*/
