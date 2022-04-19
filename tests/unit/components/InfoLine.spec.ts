import omit from 'lodash/fp/omit';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_INFO_LINE } from '../../utils/InfoLineMock';

import InfoLine from '@/components/InfoLine.vue';

const createStore = (shouldBalanceBeHidden = true) =>
  useVuex({
    settings: {
      state: () => ({
        shouldBalanceBeHidden,
      }),
    },
  });

useDescribe('InfoLine.vue', InfoLine, () => {
  const store = createStore();

  MOCK_INFO_LINE.map((item) =>
    it(`[${item.title}${
      item.valueCanBeHidden ? '; hide balances button was clicked' : ''
    }]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = useShallowMount(InfoLine, {
        store,
        propsData,
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
