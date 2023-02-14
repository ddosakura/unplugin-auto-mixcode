import type { BootstrapOptions } from "./common";

export function bootstrapVue3(options: BootstrapOptions) {
  return `
import { createApp } from "vue";
const app = createApp(App);

// app.use(router);

app.mount("#${options.root}");
`;
}
