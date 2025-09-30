import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'node:path';

import pkg from './package.json';

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
  'vue-i18n': 'VueI18n',
  '@walletconnect/modal': 'modal',
  '@walletconnect/universal-provider': 'UniversalProvider',
  wonka: 'wonka',
};

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
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
];

export default defineConfig(({ command, mode }) => {
  const isTest = command === 'test' || mode === 'test' || process.env.VITEST === 'true';

  return {
    plugins: [vue()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
        ...(isTest
          ? [
              {
                find: /^@polkadot\/util$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/util/cjs/index.js'),
              },
              {
                find: /^@polkadot\/util-crypto$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/util-crypto/cjs/index.js'),
              },
              {
                find: /^@polkadot\/wasm-crypto$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/wasm-crypto/cjs/index.js'),
              },
              {
                find: /^@polkadot\/wasm-crypto-wasm$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/wasm-crypto-wasm/cjs/index.js'),
              },
              {
                find: /^@polkadot\/wasm-bridge$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/wasm-bridge/cjs/index.js'),
              },
              {
                find: /^@polkadot\/wasm-util$/,
                replacement: path.resolve(__dirname, 'node_modules/@polkadot/wasm-util/cjs/index.js'),
              },
              {
                find: /^@popperjs\/core$/,
                replacement: path.resolve(__dirname, 'tests/mocks/popper.ts'),
              },
            ]
          : []),
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "src/styles/_variables.scss";
            @import "src/styles/_layout.scss";
            @import "src/styles/_mixins.scss";
          `,
        },
      },
    },
    build: {
      outDir: 'lib',
      emptyOutDir: true,
      sourcemap: true,
      cssCodeSplit: false,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'SoraNeoWalletWeb',
        formats: ['es', 'umd'],
        fileName: (format) => (format === 'es' ? 'soraneo-wallet-web.esm.js' : 'soraneo-wallet-web.umd.js'),
      },
      rollupOptions: {
        external,
        output: {
          globals,
          exports: 'named',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css' || assetInfo.name?.endsWith('.css')) {
              return 'soraneo-wallet-web.css';
            }

            return 'assets/[name][extname]';
          },
        },
      },
    },
    server: {
      port: 8080,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],
      include: ['tests/unit/**/*.spec.ts'],
      server: {
        deps: {
          inline: ['@soramitsu-ui/ui', '@popperjs/core'],
        },
      },
      coverage: {
        provider: 'v8',
        reporter: ['lcov'],
        include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
        exclude: ['node_modules/', 'coverage/'],
      },
    },
  };
});
