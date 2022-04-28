import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ACCOUNTS, MOCK_NETWORK_FEE, MOCK_FIAT_PRICE_AND_APY_OBJECT } from '../../utils/mock';
import { MOCK_WALLET_SEND } from '../../utils/WalletSendMock';

import WalletSend from '@/components/WalletSend.vue';

const createStore = () =>
  useVuex({
    settings: {
      state: () => ({
        networkFees: MOCK_NETWORK_FEE,
      }),
    },
    router: {
      state: () => ({
        currentRouteParams: { id: '1', asset: MOCK_ACCOUNT_ASSETS[0] },
      }),
    },
    account: {
      state: () => ({
        accountAssets: MOCK_ACCOUNT_ASSETS,
        fiatPriceAndApyObject: MOCK_FIAT_PRICE_AND_APY_OBJECT,
      }),
      getters: {
        account: () => MOCK_ACCOUNTS[0],
      },
    },
  });

useDescribe('WalletSend.vue', WalletSend, () => {
  const store = createStore();

  MOCK_WALLET_SEND.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(WalletSend, {
        store,
        data: () => {
          return {
            step: item.step,
            address: item.address,
            amount: item.amount,
          };
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
