const path = require("path");
const { override, addLessLoader, addWebpackModuleRule } = require("customize-cra");

// Function to override process environment
const overrideProcessEnv = () => (config) => {
  config.resolve.modules = [
    path.join(__dirname, "src"),
  ].concat(config.resolve.modules);
  return config;
};

// Export the overridden configuration
module.exports = override(
  // Add LESS loader with your custom settings
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@primary-color": "#11489F",
    },
  }),
  // Override process environment
  overrideProcessEnv({
    VERSION: JSON.stringify(require("./package.json").version),
  }),
  // Add SVG loader to handle namespace errors
  addWebpackModuleRule({
    test: /\.svg$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          throwIfNamespace: false,
        },
      },
    ],
  })
);
