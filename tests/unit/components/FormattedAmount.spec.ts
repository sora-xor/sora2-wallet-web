import omit from 'lodash/fp/omit';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_FORMATTED_AMOUNT } from '../../utils/FormattedAmountMock';

import FormattedAmount from '@/components/FormattedAmount.vue';

const createStore = (shouldBalanceBeHidden = false) =>
  useVuex({
    settings: {
      state: () => ({
        shouldBalanceBeHidden,
      }),
    },
  });

useDescribe('FormattedAmount.vue', FormattedAmount, () => {
  MOCK_FORMATTED_AMOUNT.map((item) => {
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
