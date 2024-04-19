import WalletAssetsHeadline from '@/components/WalletAssetsHeadline.vue';
import { DaiCurrency } from '@/consts/currencies';

import { useDescribe, useShallowMount, useMount, useVuex } from '../../utils';

const createStore = (currency = DaiCurrency, exchangeRate = 1) =>
  useVuex({
    settings: {
      state: () => ({
        filters: {
          option: 'All',
          verifiedOnly: false,
          zeroBalance: false,
        },
        currency: currency.key,
        fiatExchangeRateObject: { [currency.key]: exchangeRate },
      }),
      getters: {
        currencySymbol: () => currency.symbol,
        exchangeRate: () => exchangeRate,
      },
      mutations: {
        setFilterOptions: jest.fn(),
      },
    },
  });

useDescribe('WalletAssetsHeadline.vue', WalletAssetsHeadline, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletAssetsHeadline, { store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('shows proper amount when assetsFiatAmount is passed', () => {
    const wrapper = useMount(WalletAssetsHeadline, {
      store: createStore(),
      propsData: {
        assetsFiatAmount: '100',
      },
    });

    const amount = wrapper.find('.formatted-amount__integer');

    expect(amount.text()).toEqual('100');
  });
});
