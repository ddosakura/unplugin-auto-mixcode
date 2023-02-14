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
