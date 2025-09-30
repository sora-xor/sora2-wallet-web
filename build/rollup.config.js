import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import scss from 'rollup-plugin-scss';
import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';
import path from 'node:path';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const globals = {
  '@polkadot/util': 'util$1',
  '@polkadot/util-crypto': 'utilCrypto',
  '@polkadot/vue-identicon': 'Identicon',
  '@sora-substrate/connection': 'connection',
  '@sora-substrate/math': 'math',
  '@sora-substrate/sdk': 'sdk',
  '@sora-substrate/sdk/build/assets': 'assets',
  '@sora-substrate/sdk/build/assets/consts': 'consts$1',
  '@sora-substrate/sdk/build/poolXyk/consts': 'consts$2',
  '@sora-substrate/sdk/build/rewards/consts': 'consts$2',
  '@sora-test/wallet-connect/dotsama/predefinedWallet/PolkadotLogo.svg': 'PolkadotLogo',
  '@sora-test/wallet-connect/dotsama/predefinedWallet/SubWalletLogo.svg': 'SubWalletLogo',
  '@sora-test/wallet-connect/dotsama/wallets': 'wallets',
  '@soramitsu-ui/ui': 'SoramitsuUI',
  '@urql/core': 'core',
  '@zxing/browser': 'browser',
  '@zxing/library': 'library',
  'base-64': 'base64',
  'crypto-js': 'CryptoJS',
  'crypto-random-string': 'cryptoRandomString',
  dayjs: 'dayjs',
  'dayjs/plugin/localizedFormat': 'localizedFormat',
  'direct-vuex': 'directVuex',
  'file-saver': 'fileSaver',
  'graphql-ws': 'graphqlWs',
  'is-electron': 'isElectron',
  'lodash/fp/debounce': 'debounce',
  'lodash/fp/findLast': 'findLast',
  'lodash/fp/getOr': 'getOr',
  'lodash/fp/isEmpty': 'isEmpty',
  'lodash/fp/isEqual': 'isEqual',
  'lodash/fp/omit': 'omit',
  maska: 'Maska',
  'nft.storage': 'nft_storage',
  rxjs: 'rxjs',
  'subscriptions-transport-ws': 'subscriptionsTransportWs',
  tslib: 'tslib',
  vue: 'Vue',
  'vue-class-component': 'vueClassComponent',
  'vue-plugin-load-script': 'vuePluginLoadScript',
  'vue-property-decorator': 'vuePropertyDecorator',
  'vue-virtual-scroller': 'vueVirtualScroller',
  vuedraggable: 'draggable',
  vuex: 'Vuex',
  '@walletconnect/modal': 'modal',
  '@walletconnect/universal-provider': 'UniversalProvider',
  wonka: 'wonka',
};

const scssAdditionalData = `
  @use "${path.resolve('src/styles/_variables.scss')}" as *;
  @use "${path.resolve('src/styles/_layout.scss')}" as *;
  @use "${path.resolve('src/styles/_mixins.scss')}" as *;
`;

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'SoraNeoWalletWeb',
      file: 'lib/soraneo-wallet-web.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      globals,
    },
    {
      name: 'SoraNeoWalletWebUmd',
      format: 'umd',
      file: 'lib/soraneo-wallet-web.umd.js',
      sourcemap: true,
      exports: 'named',
      globals,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    '@polkadot/api/types',
    '@polkadot/extension-inject/types',
    '@polkadot/keyring/types',
    '@polkadot/types/types',
    '@polkadot/util',
    '@polkadot/util-crypto',
    '@polkadot/wasm-crypto',
    '@polkadot/x-fetch',
    '@polkadot/x-ws',
    '@sora-substrate/connection',
    '@sora-substrate/math',
    '@sora-substrate/sdk/build/assets',
    '@sora-substrate/sdk/build/assets/consts',
    '@sora-substrate/sdk/build/assets/types',
    '@sora-substrate/sdk/build/poolXyk/consts',
    '@sora-substrate/sdk/build/poolXyk/types',
    '@sora-substrate/sdk/build/rewards/consts',
    '@sora-substrate/sdk/build/rewards/types',
    '@soramitsu-ui/ui',
    '@sora-test/wallet-connect/dotsama/wallets',
    '@sora-test/wallet-connect/dotsama/predefinedWallet/PolkadotLogo.svg',
    '@sora-test/wallet-connect/dotsama/predefinedWallet/SubWalletLogo.svg',
    '@sora-test/wallet-connect/types',
    'dayjs/plugin/localizedFormat',
    'lodash/fp/concat',
    'lodash/fp/debounce',
    'lodash/fp/findLast',
    'lodash/fp/flatMap',
    'lodash/fp/flow',
    'lodash/fp/fromPairs',
    'lodash/fp/getOr',
    'lodash/fp/isEmpty',
    'lodash/fp/isEqual',
    'lodash/fp/map',
    'lodash/fp/omit',
    'rxjs',
    'tslib',
    'vue',
    'wonka',
  ],
  plugins: [
    vue({
      css: true,
      runtimeCompiler: true,
      compileTemplate: true,
      preprocessStyles: true,
      preprocessCustomRequire: (id) => require(id),
      needMap: false,
      style: {
        preprocessOptions: {
          scss: {
            additionalData: (content, loaderContext) => {
              console.log('Preprocessing', loaderContext.id || 'unknown');
              return scssAdditionalData + content;
            },
            includePaths: ['src', 'src/styles'],
          },
        },
      },
    }),
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
      module: 'esnext',
      tsconfig: 'tsconfig.json',
      tsconfigOverride: { exclude: ['node_modules', 'tests'] },
    }),
    resolve({ extensions: ['.js', '.ts', '.vue', '.json'] }),
    commonjs(),
    scss({
      output: 'lib/soraneo-wallet-web.css',
      includePaths: ['src', 'src/styles'],
    }),
    image(),
    json(),
    terser({
      compress: true,
      mangle: true,
    }),
    copy({
      targets: [{ src: 'lib/src/*', dest: 'lib' }],
      hook: 'writeBundle',
      verbose: true,
    }),
    del({
      targets: [
        'lib/styles',
        'lib/node_modules',
        'lib/plugins',
        'lib/lang',
        'lib/SoraWallet.vue.d.ts',
        'lib/main.d.ts',
      ],
      hook: 'closeBundle',
      verbose: true,
    }),
  ],
};
