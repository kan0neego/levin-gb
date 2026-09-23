const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");

const withAliases = (config) => ({
  ...config,
  resolve: {
    ...(config.resolve || {}),
    alias: {
      ...(config.resolve?.alias || {}),
      "@": path.resolve(__dirname),
      "@lib": path.resolve(__dirname, "lib"),
      "@components": path.resolve(__dirname, "components"),
    },
  },
});

const isExperemintal = Array.isArray(defaultConfig);

module.exports = isExperemintal
  ? defaultConfig.map(withAliases)
  : withAliases(defaultConfig);
