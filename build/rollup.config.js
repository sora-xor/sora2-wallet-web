import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import pkg from '../package.json'
import scss from 'rollup-plugin-scss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import del from 'rollup-plugin-delete'
import copy from 'rollup-plugin-copy'
import json from 'rollup-plugin-json'

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'SoraNeoWalletWeb',
      file: 'lib/soraneo-wallet-web.esm.js',
      format: 'esm',
      sourcemap: true
    }, {
      name: 'SoraNeoWalletWebUmd',
      format: 'umd',
      file: 'lib/soraneo-wallet-web.umd.js',
      sourcemap: true
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    'tslib',
    'vue'
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
      module: 'esnext',

      tsconfig: 'tsconfig.json',
      tsconfigOverride: { exclude: ['node_modules', 'tests'] }
    }),
    commonjs(),
    vue({
      css: true,
      compileTemplate: true,
      needMap: false, // fix for https://github.com/vuejs/rollup-plugin-vue/issues/238
      data: {
        scss: `
          @import "../styles/_variables.scss";
          @import "../styles/_layout.scss";
          @import "../styles/_mixins.scss";
          @import "../styles/_typography.scss";
        `
      }
    }),
    scss(),
    resolve(),
    // TODO: it is used to fix:
    // Error: Unexpected token (Note that you need @rollup/plugin-json to import JSON files)
    // node_modules/elliptic/package.json
    json(),
    terser(),
    copy({
      // TODO: we should find out how to solve an issue with @sora-substrate/util
      // For now build operation can be done like:
      targets: [
        { src: 'lib/src/*', dest: 'lib' }
      ],
      hook: 'renderChunk'
    }),
    del({
      targets: [
        // 'lib/src', Cannot be removed due to issue above
        'lib/styles',
        'lib/node_modules',
        'lib/plugins',
        'lib/lang',
        'lib/SoraNeoWallet.vue.d.ts',
        'lib/main.d.ts',
        'lib/soraneo-wallet-web.esm.css'
      ],
      hook: 'writeBundle'
    })
  ]
}
