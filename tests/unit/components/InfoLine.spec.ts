import omit from 'lodash/fp/omit';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue, i18n } from '../../utils';
import { MOCK_INFO_LINE } from '../../utils/InfoLineMock';

import InfoLine from '@/components/InfoLine.vue';

useDescribe('InfoLine.vue', InfoLine, () => {
  const store = new Vuex.Store({
    getters: {
      shouldBalanceBeHidden: () => true,
    },
  });

  MOCK_INFO_LINE.map((item) =>
    it(`[${item.title}${
      item.valueCanBeHidden ? '; hide balances button was clicked' : ''
    }]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = shallowMount(InfoLine, {
        localVue,
        i18n,
        store,
        propsData,
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
