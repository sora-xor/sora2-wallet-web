import { Operation, HistoryItem } from '@sora-substrate/sdk';

import WalletAdarTxDetails from '@/components/WalletAdarTxDetails.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNTS, MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';

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
      },
    },
  });

useDescribe('WalletAdarTxDetails.vue', WalletAdarTxDetails, () => {
  MOCK_HISTORY.filter((item) => item.type === Operation.SwapTransferBatch).map((item) => [
    it(`[${item.type}, ${item.status}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(WalletAdarTxDetails, {
        store: createStore(item),
        propsData: { transaction: item },
      });
      expect(wrapper.element).toMatchSnapshot();
    }),
  ]);
});
