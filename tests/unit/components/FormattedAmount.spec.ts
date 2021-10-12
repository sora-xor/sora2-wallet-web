import omit from 'lodash/fp/omit';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue } from '../../utils';
import { MOCK_FORMATTED_AMOUNT } from '../../utils/FormattedAmountMock';

import FormattedAmount from '@/components/FormattedAmount.vue';

useDescribe('FormattedAmount.vue', FormattedAmount, () => {
  const createStore = (shouldBalanceBeHidden = false) =>
    new Vuex.Store({
      getters: {
        shouldBalanceBeHidden: () => shouldBalanceBeHidden,
      },
    });

  MOCK_FORMATTED_AMOUNT.map((item) => {
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = shallowMount(FormattedAmount, { localVue, store: createStore(), propsData });
      expect(wrapper.element).toMatchSnapshot();
    });
    it(`[${item.title}; hide balances button was clicked]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = shallowMount(FormattedAmount, { localVue, store: createStore(true), propsData });
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
