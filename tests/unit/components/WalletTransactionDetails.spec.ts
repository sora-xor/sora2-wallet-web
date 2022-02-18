import Vuex from 'vuex';
import type { History } from '@sora-substrate/util';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';

import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue';

const createStore = (tx: History) =>
  new Vuex.Store({
    modules: {
      Account: {
        getters: {
          selectedTransaction: () => tx,
          accountAssets: () => MOCK_ACCOUNT_ASSETS,
        },
        actions: {
          getTransactionDetails: jest.fn(),
          getAccountHistory: jest.fn(),
        },
      },
      Router: {
        getters: {
          currentRouteParams: () => ({ id: '1', asset: MOCK_ACCOUNT_ASSETS[0] }),
        },
        actions: {
          navigate: jest.fn(),
        },
      },
    } as any,
  });

useDescribe('WalletTransactionDetails.vue', WalletTransactionDetails, () => {
  MOCK_HISTORY.map((item) =>
    it(`[${item.type}, ${item.status}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(WalletTransactionDetails, { store: createStore(item) });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
