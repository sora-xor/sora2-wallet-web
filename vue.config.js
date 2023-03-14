const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = defineConfig({
  configureWebpack: (config) => {
    config.plugins.push(new NodePolyfillPlugin(), new Dotenv());
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/_variables.scss";
          @import "@/styles/_layout.scss";
          @import "@/styles/_mixins.scss";
        `,
      },
    },
  },
  runtimeCompiler: true,
});
