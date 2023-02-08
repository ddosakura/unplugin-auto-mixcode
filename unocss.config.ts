import {
  presetIcons,
  presetUno,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import type { VitePluginConfig } from "unocss/vite";

// https://github.com/microsoft/TypeScript/issues/42873
export default <VitePluginConfig>{
  presets: [presetIcons(), presetUno()],
  transformers: [
    transformerCompileClass(),
    transformerDirectives(),
    transformerVariantGroup(),
  ],
};
