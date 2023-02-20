/* eslint-disable */

const AutoImport = require("unplugin-auto-import/webpack");

const { presetRecommend } = require("@mixcode/unplugin-auto-mixcode");
const { default: AutoMixcode } = require(
  "@mixcode/unplugin-auto-mixcode/webpack",
);

module.exports = {
  webpack: {
    // https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
    configure: (webpackConfig) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => {
          return constructor && constructor.name === "ModuleScopePlugin";
        },
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      return webpackConfig;
    },
    plugins: {
      add: [
        AutoMixcode({
          dts: false,
          cache: false,
          presets: [presetRecommend()],
        }),
        AutoImport({
          dts: false,
        }),
      ],
    },
  },
};
