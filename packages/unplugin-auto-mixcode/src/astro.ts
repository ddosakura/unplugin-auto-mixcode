import unplugin, { type Options, PLUGIN_NAME } from ".";

export default function (options: Options) {
  return {
    name: PLUGIN_NAME,
    hooks: {
      "astro:config:setup": async (astro: any) => {
        astro.config.vite.plugins ||= [];
        astro.config.vite.plugins.push(unplugin.vite(options));
      },
    },
  };
}
