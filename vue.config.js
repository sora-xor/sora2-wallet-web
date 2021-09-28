const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  configureWebpack: (config) => {
    config.plugins.push(new NodePolyfillPlugin());
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/styles/_variables.scss";
          @import "@/styles/_layout.scss";
          @import "@/styles/_mixins.scss";
        `,
      },
    },
  },
  runtimeCompiler: true,
};
