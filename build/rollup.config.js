import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import pkg from '../package.json'
import scss from 'rollup-plugin-scss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import del from 'rollup-plugin-delete'

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
    terser(),
    del({
      targets: [
        'lib/styles/index.d.ts',
        'lib/soraneo-wallet-web.esm.css',
        'lib/src',
        'lib/styles',
        'lib/node_modules',
        'lib/plugins',
        'lib/lang',
        'lib/SoraNeoWallet.vue.d.ts',
        'lib/main.d.ts'
      ],
      hook: 'writeBundle'
    })
  ]
}
