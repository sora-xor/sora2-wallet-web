import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNTS, MOCK_ASSETS_TABLE, MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';

import type { HistoryItem } from '@sora-substrate/sdk';

vi.mock('@/api', () => ({
  api: {
    mst: {
      isMST: vi.fn(() => false),
      calculateFinalProofSize: vi.fn().mockResolvedValue({ finalProofSize: { toNumber: () => 0 } }),
      getPrevoiusAccount: vi.fn(() => 'exampleAddress'),
      approveMultisigExtrinsic: vi.fn().mockResolvedValue(true),
    },
    formatAddress: vi.fn(() => 'exampleAddress'),
    getAccountPair: vi.fn(() => ({ meta: { name: 'TestAccount' } })),
    assets: {
      getAccountAsset: vi.fn().mockResolvedValue({ balance: { free: '0' } }),
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
        navigate: vi.fn(),
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
        setTxDetailsId: vi.fn(),
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
