module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/styles/_variables.scss";
          @import "@/styles/_layout.scss";
          @import "@/styles/_mixins.scss";
        `
      }
    }
  },
  runtimeCompiler: true
}
