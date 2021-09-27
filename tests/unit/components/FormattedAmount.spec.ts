import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue } from '../../utils';
import { MOCK_FORMATTED_AMOUNT } from '../../utils/FormattedAmountMock';

import FormattedAmount from '@/components/FormattedAmount.vue';

useDescribe('FormattedAmount.vue', FormattedAmount, () => {
  MOCK_FORMATTED_AMOUNT.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = {
        value: item.value,
        fontSizeRate: item.fontSizeRate,
        fontWeightRate: item.fontWeightRate,
        assetSymbol: item.assetSymbol,
        symbolAsDecimal: item.symbolAsDecimal,
        isFiatValue: item.isFiatValue,
        integerOnly: item.integerOnly,
        withLeftShift: item.withLeftShift,
      };
      const wrapper = shallowMount(FormattedAmount, { localVue, propsData });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
