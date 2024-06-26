import omit from 'lodash/fp/omit';

import FormattedAmount from '@/components/FormattedAmount.vue';
import { DaiCurrency } from '@/consts/currencies';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_FORMATTED_AMOUNT } from '../../utils/FormattedAmountMock';

const createStore = (shouldBalanceBeHidden = false, currency = DaiCurrency, exchangeRate = 1) =>
  useVuex({
    settings: {
      state: () => ({
        shouldBalanceBeHidden,
        currency: currency.key,
        fiatExchangeRateObject: { [currency.key]: exchangeRate },
      }),
      getters: {
        currencySymbol: () => currency.symbol,
        exchangeRate: () => exchangeRate,
        xorRate: () => 1,
      },
    },
  });

useDescribe('FormattedAmount.vue', FormattedAmount, () => {
  MOCK_FORMATTED_AMOUNT.forEach((item) => {
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = useShallowMount(FormattedAmount, { store: createStore(), propsData });
      expect(wrapper.element).toMatchSnapshot();
    });
    it(`[${item.title}; hide balances button was clicked]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = useShallowMount(FormattedAmount, { store: createStore(true), propsData });
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
