import unplugin, { type Options } from ".";

export default function (options: Options) {
  options.exclude = options.exclude ||
    [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/];
  return unplugin.vite(options);
}
