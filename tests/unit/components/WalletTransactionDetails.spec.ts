import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNTS, MOCK_ASSETS_TABLE, MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';

import type { HistoryItem } from '@sora-substrate/sdk';

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
