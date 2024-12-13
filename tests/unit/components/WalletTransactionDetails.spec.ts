import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNTS, MOCK_ASSETS_TABLE, MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';

import type { HistoryItem } from '@sora-substrate/sdk';

jest.mock('@/api', () => ({
  api: {
    mst: {
      isMST: jest.fn(() => false),
      calculateFinalProofSize: jest.fn().mockResolvedValue({ finalProofSize: { toNumber: () => 0 } }),
      getPrevoiusAccount: jest.fn(() => 'exampleAddress'),
      approveMultisigExtrinsic: jest.fn().mockResolvedValue(true),
    },
    formatAddress: jest.fn(() => 'exampleAddress'),
    getAccountPair: jest.fn(() => ({ meta: { name: 'TestAccount' } })),
    assets: {
      getAccountAsset: jest.fn().mockResolvedValue({ balance: { free: '0' } }),
    },
  },
}));

const createStore = (tx: HistoryItem) =>
  useVuex({
    router: {
      state: () => ({
        currentRouteParams: { id: '1', asset: MOCK_ACCOUNT_ASSETS[0] },
      }),
      mutations: {
        navigate: jest.fn(),
      },
    },
    account: {
      state: () => ({
        accountAssets: MOCK_ACCOUNT_ASSETS,
      }),
      getters: {
        account: () => MOCK_ACCOUNTS[0],
        assetsDataTable: () => MOCK_ASSETS_TABLE,
      },
    },
    transactions: {
      getters: {
        selectedTx: () => tx,
      },
      mutations: {
        setTxDetailsId: jest.fn(),
      },
    },
  });

useDescribe('WalletTransactionDetails.vue', WalletTransactionDetails, () => {
  MOCK_HISTORY.map((item) =>
    it(`[${item.type}, ${item.status}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(WalletTransactionDetails, { store: createStore(item) });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
