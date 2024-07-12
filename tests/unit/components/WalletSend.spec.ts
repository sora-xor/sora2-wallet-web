import WalletSend from '@/components/WalletSend.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import {
  MOCK_ACCOUNT_ASSETS,
  MOCK_ACCOUNTS,
  MOCK_NETWORK_FEE,
  MOCK_FIAT_PRICE_OBJECT,
  MOCK_POLKADOTJS_ACCOUNTS,
} from '../../utils/mock';
import { MOCK_WALLET_SEND } from '../../utils/WalletSendMock';

const createStore = () =>
  useVuex({
    settings: {
      state: () => ({
        networkFees: MOCK_NETWORK_FEE,
      }),
    },
    router: {
      state: () => ({
        previousRoute: '',
        previousRouteParams: {},
        currentRouteParams: { id: '1', asset: MOCK_ACCOUNT_ASSETS[0] },
      }),
      mutations: {
        navigate: jest.fn(),
      },
    },
    account: {
      state: () => ({
        accountAssets: MOCK_ACCOUNT_ASSETS,
        fiatPriceObject: MOCK_FIAT_PRICE_OBJECT,
        polkadotJsAccounts: MOCK_POLKADOTJS_ACCOUNTS,
        book: {},
      }),
      getters: {
        account: () => MOCK_ACCOUNTS[0],
      },
      actions: {
        transfer: jest.fn(),
      },
    },
  });

jest.mock('../../../src/util', () => {
  const originalModule = jest.requireActual('../../../src/util');

  return {
    ...originalModule,
    validateAddress: (value) => true,
    formatAccountAddress: (value) => value,
  };
});

useDescribe('WalletSend.vue', WalletSend, () => {
  const store = createStore();

  MOCK_WALLET_SEND.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(WalletSend, {
        store,
        data: () => ({
          step: item.step,
          address: item.address,
          amount: item.amount,
        }),
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
