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

import pkg from '../package.json';

const globals = {
  '@polkadot/util': 'util$1',
  '@polkadot/util-crypto': 'utilCrypto',
  '@polkadot/vue-identicon': 'Identicon',
  '@sora-substrate/connection': 'connection',
  '@sora-substrate/math': 'math',
  '@sora-substrate/util': 'util',
  '@sora-substrate/util/build/assets': 'assets',
  '@sora-substrate/util/build/assets/consts': 'consts$1',
  '@sora-substrate/util/build/poolXyk/consts': 'consts$2',
  '@sora-substrate/util/build/rewards/consts': 'consts$2',
  '@sora-test/wallet-connect/dotsama/predefinedWallet/PolkadotLogo.svg': 'PolkadotLogo',
  '@sora-test/wallet-connect/dotsama/predefinedWallet/SubWalletLogo.svg': 'SubWalletLogo',
  '@soramitsu-ui/ui-vue2/lib/components/Button/SButton': 'SButton',
  '@soramitsu-ui/ui-vue2/lib/components/Card/SCard': 'SCard',
  '@soramitsu-ui/ui-vue2/lib/components/DesignSystem/SDesignSystemProvider': 'SDesignSystemProvider',
  '@soramitsu-ui/ui-vue2/lib/components/Dialog': 'SDialog',
  '@soramitsu-ui/ui-vue2/lib/components/Divider/SDivider': 'SDivider',
  '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdown': 'SDropdown',
  '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdownItem': 'SDropdownItem',
  '@soramitsu-ui/ui-vue2/lib/components/Form/SForm': 'SForm',
  '@soramitsu-ui/ui-vue2/lib/components/Form/SFormItem': 'SFormItem',
  '@soramitsu-ui/ui-vue2/lib/components/Icon/SIcon': 'SIcon',
  '@soramitsu-ui/ui-vue2/lib/components/Image/SImage': 'SImage',
  '@soramitsu-ui/ui-vue2/lib/components/Input/SFloatInput': 'SFloatInput',
  '@soramitsu-ui/ui-vue2/lib/components/Input/SInput': 'SInput',
  '@soramitsu-ui/ui-vue2/lib/components/Pagination': 'SPagination',
  '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadio': 'SRadio',
  '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadioGroup': 'SRadioGroup',
  '@soramitsu-ui/ui-vue2/lib/components/Scrollbar': 'SScrollbar',
  '@soramitsu-ui/ui-vue2/lib/components/Select/SOption': 'SOption',
  '@soramitsu-ui/ui-vue2/lib/components/Select/SSelect': 'SSelect',
  '@soramitsu-ui/ui-vue2/lib/components/Switch': 'SSwitch',
  '@soramitsu-ui/ui-vue2/lib/components/Tab/STab': 'STab',
  '@soramitsu-ui/ui-vue2/lib/components/Tab/STabs': 'STabs',
  '@soramitsu-ui/ui-vue2/lib/components/Tooltip': 'STooltip',
  '@soramitsu-ui/ui-vue2/lib/directives': 'directives',
  '@soramitsu-ui/ui-vue2/lib/plugins/elementUI': 'ElementUIPlugin',
  '@soramitsu-ui/ui-vue2/lib/plugins/soramitsuUIStore': 'SoramitsuUIStorePlugin',
  '@soramitsu-ui/ui-vue2/lib/types/DesignSystem': 'DesignSystem',
  '@soramitsu-ui/ui-vue2/lib/types/Theme': 'Theme',
  '@soramitsu-ui/ui-vue2/lib/types/directives': 'Directives',
  '@soramitsu-ui/ui-vue2/lib/utils': 'utils',
  '@sora-test/wallet-connect/dotsama/wallets': 'wallets',
  '@urql/core': 'core',
  '@zxing/browser': 'browser',
  '@zxing/library': 'library',
  'base-64': 'base64',
  'crypto-js': 'CryptoJS',
  'crypto-random-string': 'cryptoRandomString',
  dayjs: 'dayjs',
  'dayjs/plugin/localizedFormat': 'localizedFormat',
  'direct-vuex': 'directVuex',
  'element-ui/lib/popover': 'ElPopover',
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
  wonka: 'wonka',
};

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
    '@sora-substrate/util/build/assets',
    '@sora-substrate/util/build/assets/consts',
    '@sora-substrate/util/build/assets/types',
    '@sora-substrate/util/build/poolXyk/consts',
    '@sora-substrate/util/build/poolXyk/types',
    '@sora-substrate/util/build/rewards/consts',
    '@sora-substrate/util/build/rewards/types',
    '@soramitsu-ui/ui-vue2/lib/components/Button/SButton',
    '@soramitsu-ui/ui-vue2/lib/components/Card/SCard',
    '@soramitsu-ui/ui-vue2/lib/components/DesignSystem/SDesignSystemProvider',
    '@soramitsu-ui/ui-vue2/lib/components/Dialog',
    '@soramitsu-ui/ui-vue2/lib/components/Divider/SDivider',
    '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdown',
    '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdown/SDropdown.vue',
    '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdownItem',
    '@soramitsu-ui/ui-vue2/lib/components/Form/SForm',
    '@soramitsu-ui/ui-vue2/lib/components/Form/SFormItem',
    '@soramitsu-ui/ui-vue2/lib/components/Icon/SIcon',
    '@soramitsu-ui/ui-vue2/lib/components/Image/SImage',
    '@soramitsu-ui/ui-vue2/lib/components/Input/SFloatInput',
    '@soramitsu-ui/ui-vue2/lib/components/Input/SInput',
    '@soramitsu-ui/ui-vue2/lib/components/Pagination',
    '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadio',
    '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadioGroup',
    '@soramitsu-ui/ui-vue2/lib/components/Scrollbar',
    '@soramitsu-ui/ui-vue2/lib/components/Select/SOption',
    '@soramitsu-ui/ui-vue2/lib/components/Select/SSelect',
    '@soramitsu-ui/ui-vue2/lib/components/Switch',
    '@soramitsu-ui/ui-vue2/lib/components/Tab/STab',
    '@soramitsu-ui/ui-vue2/lib/components/Tab/STabs',
    '@soramitsu-ui/ui-vue2/lib/components/Tooltip',
    '@soramitsu-ui/ui-vue2/lib/directives',
    '@soramitsu-ui/ui-vue2/lib/plugins/elementUI',
    '@soramitsu-ui/ui-vue2/lib/plugins/soramitsuUIStore',
    '@soramitsu-ui/ui-vue2/lib/types/DesignSystem',
    '@soramitsu-ui/ui-vue2/lib/types/Theme',
    '@soramitsu-ui/ui-vue2/lib/types/directives',
    '@soramitsu-ui/ui-vue2/lib/utils',
    '@soramitsu-ui/ui-vue2/lib/utils/DesignSystem',
    '@soramitsu-ui/ui-vue2/lib/utils/Theme',
    '@sora-test/wallet-connect/dotsama/wallets',
    '@sora-test/wallet-connect/dotsama/predefinedWallet/PolkadotLogo.svg',
    '@sora-test/wallet-connect/dotsama/predefinedWallet/SubWalletLogo.svg',
    '@sora-test/wallet-connect/types',
    'dayjs/plugin/localizedFormat',
    'element-ui/lib/popover',
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
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
      module: 'esnext',

      tsconfig: 'tsconfig.json',
      tsconfigOverride: { exclude: ['node_modules', 'tests'] },
    }),
    resolve(),
    commonjs(),
    vue({
      css: true,
      runtimeCompiler: true,
      compileTemplate: true,
      needMap: false, // fix for https://github.com/vuejs/rollup-plugin-vue/issues/238
      data: {
        scss: `
          @import "src/styles/_variables.scss";
          @import "src/styles/_layout.scss";
          @import "src/styles/_mixins.scss";
        `,
      },
    }),
    scss({
      output: 'lib/soraneo-wallet-web.css',
    }),
    image(),
    json(),
    terser({
      compress: true,
      mangle: true,
    }),
    copy({
      // TODO: we should find out how to solve an issue with @sora-substrate/util
      // For now build operation can be done like:
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
