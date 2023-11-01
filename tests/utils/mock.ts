import { FPNumber, History, TransactionStatus, Operation, api } from '@sora-substrate/util';
import { KnownSymbols } from '@sora-substrate/util/build/assets/consts';

import { SoraNetwork, WalletPermissions, AppWallet } from '@/consts';

import type { PolkadotJsAccount, WhitelistIdsBySymbol } from '../../src/types/common';
import type { AccountAsset, Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

export const MOCK_NETWORK_FEE = api.NetworkFee;

export const MOCK_ACCOUNT_ASSETS: Array<AccountAsset> = [
  {
    address: '0x0200000000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.XOR,
    name: 'SORA',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '123400000000000000000',
      total: '123400000000000000000',
      free: '123400000000000000000',
      reserved: '0',
      frozen: '0',
      locked: '0',
      bonded: '0',
    },
  },
  {
    address: '0x0200040000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.VAL,
    name: 'SORA Validator Token',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '0',
      total: '0',
      free: '0',
      reserved: '0',
      frozen: '0',
      locked: '0',
      bonded: '0',
    },
  },
  {
    address: '0x0200050000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.PSWAP,
    name: 'Polkaswap',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '1000000000000',
      total: '1000000000000',
      free: '1000000000000',
      reserved: '0',
      frozen: '0',
      locked: '0',
      bonded: '0',
    },
  },
];

export const MOCK_ACCOUNT_ASSETS_NFT = [
  {
    address: '0x00df77c098d070e4097184755b4cf26fd7a19849d69f92345548e6bdb50cbc26',
    balance: {
      transferable: '1000000000000',
      total: '1000000000000',
      free: '1000000000000',
      reserved: '0',
      frozen: '0',
      locked: '0',
      bonded: '0',
    },
    content:
      'bafybeihexv4moultujlt4prmyzrufr4wpdnjom7qkpghwdl2sffoj4txem/VAL_cnUfVtQDZCkUngZ1Pudmb9qDTeHHAmuCm6vsHNzGNnMKg83x1%20(1).jpeg',
    decimals: FPNumber.DEFAULT_PRECISION,
    name: 'token',
    symbol: 'TOKEN',
    description: 'Amazing NFT token!',
  },
];

export const MOCK_ASSETS: Array<Asset> = [
  {
    address: '0x0212350000000000000000000000000000000000000000000000000000000000',
    symbol: 'TEST',
    name: 'Test Asset',
    decimals: FPNumber.DEFAULT_PRECISION,
  },
];

export const MOCK_HISTORY: Array<History> = [
  {
    id: '1',
    assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    txId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    status: TransactionStatus.Finalized,
    type: Operation.Transfer,
    startTime: 1605048643745,
    amount: '0.1',
    symbol: KnownSymbols.XOR,
    from: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    to: 'cnVFiwzF3WPtnTpPc726d77MHcHEqbo1qRs589B5HLcwP2nse',
    soraNetworkFee: '700000000000000',
  },
  {
    id: '2',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Error,
    errorMessage: 'Something went wrong',
    type: Operation.Swap,
    startTime: 1605048643745,
    amount: '0.1',
    amount2: '0.9',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    soraNetworkFee: '700000000000000',
  },
  {
    id: '3',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.AddLiquidity,
    startTime: 1605048643745,
    amount: '0.1',
    amount2: '0.9',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    soraNetworkFee: '700000000000000',
  },
  {
    id: '4',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.RemoveLiquidity,
    startTime: 1605048643745,
    amount: '100.123',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    soraNetworkFee: '700000000000000',
  },
  {
    id: '5',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.RegisterAsset,
    startTime: 1605048643745,
    symbol: 'TEST',
    from: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    soraNetworkFee: '700000000000000',
  },
  {
    id: '6',
    blockId: '0xf6792dc278d4f6251167e48c9fc1674c06df2cc27486ea63db48a989c90453d0',
    status: TransactionStatus.Finalized,
    type: Operation.SwapTransferBatch,
    startTime: 1605048643745,
    symbol: KnownSymbols.XOR,
    from: 'dfsakljfdlkjfhfkjladshslfjafds',
    soraNetworkFee: '140000000000000000',
    assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
    amount: '1.466564436348045197',
    payload: {
      adarFee: '0.003666411090870112',
      networkFee: '0.140000000000000000',
      blockNumber: 10502,
      actualFee: '1.469126400000000000',
      transfers: [
        {
          to: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.732178089913374904',
          assetId: '0x0200000000000000000000000000000000000000000000000000000000000000',
        },
        {
          to: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.732183187395366282',
          assetId: '0x0200000000000000000000000000000000000000000000000000000000000000',
        },
        {
          to: 'cnVFiwzF3WPtnTpPc726d77MHcHEqbo1qRs589B5HLcwP2nse',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.002203159039304011',
          assetId: '0x0200000000000000000000000000000000000000000000000000000000000000',
        },
        {
          to: 'cnV2xJFCvXN9fx3DHt9FJWovPkVVBu1vtuzmhr2QnedmZqQ6J',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.883650537081023890',
          assetId: '0x0200040000000000000000000000000000000000000000000000000000000000',
        },
        {
          to: 'cnV2xJFCvXN9fx3DHt9FJWovPkVVBu1vtuzmhr2QnedmZqQ6J',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.883650537081023891',
          assetId: '0x0200040000000000000000000000000000000000000000000000000000000000',
        },
        {
          to: 'cnVFiwzF3WPtnTpPc726d77MHcHEqbo1qRs589B5HLcwP2nse',
          from: 'dfsakljfdlkjfhfkjladshslfjafds',
          amount: '0.003666411090870112',
          assetId: '0x0200000000000000000000000000000000000000000000000000000000000000',
        },
      ],
      exchanges: [
        {
          dexId: '0',
          feeAmount: '0.004406318078608022',
          inputAmount: '0.734386346434670293',
          inputAssetId: '0x0200000000000000000000000000000000000000000000000000000000000000',
          outputAmount: '0.883650537081023891',
          outputAssetId: '0x0200040000000000000000000000000000000000000000000000000000000000',
          senderAddress: 'dfsakljfdlkjfhfkjladshslfjafds',
        },
      ],
      receivers: [
        {
          accountId: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
          asset: {
            name: 'SORA',
            symbol: 'XOR',
            decimals: 18,
            address: '0x0200000000000000000000000000000000000000000000000000000000000000',
          },
          amount: '0.732178089913374904',
          symbol: 'XOR',
        },
        {
          accountId: 'cnV2xJFCvXN9fx3DHt9FJWovPkVVBu1vtuzmhr2QnedmZqQ6J',
          asset: {
            name: 'SORA Validator Token',
            symbol: 'VAL',
            decimals: 18,
            address: '0x0200040000000000000000000000000000000000000000000000000000000000',
          },
          amount: '0.883650537081023890',
          symbol: 'VAL',
        },
      ],
    },
  },
];

export const MOCK_ACCOUNT_HISTORY = MOCK_HISTORY.reduce((result, item) => {
  if (!item.id) return result;
  return { ...result, [item.id]: item };
}, {});

export const MOCK_EXTERNAL_HISTORY = {
  '0x19cd61b49e9b3549a2718e1edae8828c7915a186b065044145a5e2e67d736069': {
    id: '0x19cd61b49e9b3549a2718e1edae8828c7915a186b065044145a5e2e67d736069',
    type: 'Transfer',
    txId: '0x19cd61b49e9b3549a2718e1edae8828c7915a186b065044145a5e2e67d736069',
    blockId: '0x405d48a0c9479dc9f7f1631078cd6edbb9993edc70ecf579560d54094ae406b0',
    blockHeight: '3489592',
    endTime: 1643294376000,
    startTime: 1643294376000,
    from: 'cnSddhDaRYhonByujX98GYrCgmHPUxmpnLg5mTKkHEYcrf3jB',
    soraNetworkFee: '700000000000000',
    status: 'finalized',
    assetAddress: '0x0200040000000000000000000000000000000000000000000000000000000000',
    symbol: 'VAL',
    to: 'cnW4qGRcbepL9bZRw7DS2RdYgRyiW2zsKoq1cdZVZQpRL2ftG',
    amount: '1.660532900136096932',
  },
  '0xc991cf9f6eb03b019f0f87ea59a9bc4c0d325ee53f63d86121eedebf09d2dcfc': {
    id: '0xc991cf9f6eb03b019f0f87ea59a9bc4c0d325ee53f63d86121eedebf09d2dcfc',
    type: 'Transfer',
    txId: '0xc991cf9f6eb03b019f0f87ea59a9bc4c0d325ee53f63d86121eedebf09d2dcfc',
    blockId: '0xd4b2a10b260789689e219fe7b1d50dd3460443801f14c287241a886c94955f30',
    blockHeight: '3489549',
    endTime: 1643294118000,
    startTime: 1643294118000,
    from: 'cnSddhDaRYhonByujX98GYrCgmHPUxmpnLg5mTKkHEYcrf3jB',
    soraNetworkFee: '700000000000000',
    status: 'finalized',
    assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
    symbol: 'XOR',
    to: 'cnW4qGRcbepL9bZRw7DS2RdYgRyiW2zsKoq1cdZVZQpRL2ftG',
    amount: '2.000000000000000000',
  },
  '0x39d9cd49d00fb4267e03c8c0355e4758546b0637845a05fac2ccce09eadfcda1': {
    id: '0x39d9cd49d00fb4267e03c8c0355e4758546b0637845a05fac2ccce09eadfcda1',
    type: 'Transfer',
    txId: '0x39d9cd49d00fb4267e03c8c0355e4758546b0637845a05fac2ccce09eadfcda1',
    blockId: '0xafd1838fed15589869e48a7bd97b41eb6fdf9881a3e131add95d4e554a33fb1b',
    blockHeight: '3489367',
    endTime: 1643293026000,
    startTime: 1643293026000,
    from: 'cnSddhDaRYhonByujX98GYrCgmHPUxmpnLg5mTKkHEYcrf3jB',
    soraNetworkFee: '700000000000000',
    status: 'finalized',
    assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
    symbol: 'XOR',
    to: 'cnW4qGRcbepL9bZRw7DS2RdYgRyiW2zsKoq1cdZVZQpRL2ftG',
    amount: '1.000000000000000000',
  },
  '0x4e3de4b012fe63e2fd8ec2ef096bf2def66d05cd0a81dbcb37a65d110e937ec3': {
    id: '0x4e3de4b012fe63e2fd8ec2ef096bf2def66d05cd0a81dbcb37a65d110e937ec3',
    type: 'Transfer',
    txId: '0x4e3de4b012fe63e2fd8ec2ef096bf2def66d05cd0a81dbcb37a65d110e937ec3',
    blockId: '0x7afd56cbf423c008d87930783389915fb19ae9eb8d5cf997e6a0efd4fa53ad72',
    blockHeight: '3489352',
    endTime: 1643292936000,
    startTime: 1643292936000,
    from: 'cnSddhDaRYhonByujX98GYrCgmHPUxmpnLg5mTKkHEYcrf3jB',
    soraNetworkFee: '700000000000000',
    status: 'finalized',
    assetAddress: '0x0200040000000000000000000000000000000000000000000000000000000000',
    symbol: 'VAL',
    to: 'cnW4qGRcbepL9bZRw7DS2RdYgRyiW2zsKoq1cdZVZQpRL2ftG',
    amount: '2.000000000000000000',
  },
};

export const MOCK_ACCOUNTS: any = [
  {
    address: 'dfsakljfdlkjfhfkjladshslfjafds',
    name: 'Mock Account',
    password: '123qwaszx',
  },
  {
    address: '5FbFx7AoLdnyMbKCbVZVZqXcZQkhy4HDKnerSW4oKeEQb6pL',
    name: 'Not SORA Account',
    password: '123qwaszx',
  },
];

export const MOCK_WHITE_LIST: Whitelist = {
  '0x0200000000000000000000000000000000000000000000000000000000000000': {
    name: 'SORA',
    symbol: 'XOR',
    decimals: 18,
    icon: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22' %3E%3Cpath fill='%23E3232C' d='M22,11c0,6.1-4.9,11-11,11S0,17.1,0,11S4.9,0,11,0S22,4.9,22,11z'/%3E%3Cpath fill='%23FFFFFF' d='M5.8,20.7c1.7-2.6,3.5-5.2,5.3-7.8l5.2,7.8c0.3-0.1,0.5-0.3,0.8-0.5s0.5-0.3,0.7-0.5 c-1.9-2.9-3.9-5.8-5.8-8.7h5.8V9.2H12V7.3h5.8V5.5H4.3v1.8h5.8v1.9H4.3V11h5.8l-5.8,8.7C4.5,19.9,4.7,20,5,20.2 C5.3,20.4,5.5,20.6,5.8,20.7z'/%3E%3C/svg%3E",
  },
};

export const MOCK_WHITELIST_IDS_BY_SYMBOL: WhitelistIdsBySymbol = {
  XOR: '0x0200000000000000000000000000000000000000000000000000000000000000',
};

export const MOCK_FIAT_PRICE_OBJECT: any = {
  '0x0200000000000000000000000000000000000000000000000000000000000000': '1230000000000000000',
};

export const MOCK_SORA_NETWORK = SoraNetwork.Dev;

export const MOCK_ACCOUNT: PolkadotJsAccount = {
  address: '',
  name: '',
  source: AppWallet.PolkadotJS,
};

export const MOCK_POLKADOTJS_ACCOUNTS: Array<PolkadotJsAccount> = [
  {
    address: 'cnV1qZzFyBzkXS4xfmEnXue4SPhAbFNqcvULKSdzkfPEEZsBe',
    name: 'Not SORA Account',
    source: AppWallet.PolkadotJS,
  },
  {
    address: 'cnVLhRTA8ap3XZTtzyn82dSBMoF8WHeCCcf6vbjxr6KxQqNhB',
    name: 'Fearless Mock Account',
    source: AppWallet.FearlessWallet,
  },
];

export const MOCK_WALLET_PERMISSIONS: WalletPermissions = {
  addAssets: true,
  addLiquidity: true,
  bridgeAssets: true,
  createAssets: true,
  sendAssets: true,
  swapAssets: true,
  showAssetDetails: true,
};
