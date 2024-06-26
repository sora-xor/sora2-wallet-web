import FormattedAmountWithFiatValue from '@/components/FormattedAmountWithFiatValue.vue';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_FORMATTED_AMOUNT_WITH_FIAT_VALUE } from '../../utils/FormattedAmountWithFiatValueMock';

useDescribe('FormattedAmountWithFiatValue.vue', FormattedAmountWithFiatValue, () => {
  MOCK_FORMATTED_AMOUNT_WITH_FIAT_VALUE.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = {
        valueClass: item.valueClass,
        value: item.value,
        fontSizeRate: item.fontSizeRate,
        fontWeightRate: item.fontWeightRate,
        assetSymbol: item.assetSymbol,
        symbolAsDecimal: item.symbolAsDecimal,
        hasFiatValue: item.hasFiatValue,
        fiatValue: item.fiatValue,
        fiatFormatAsValue: item.fiatFormatAsValue,
        fiatFontSizeRate: item.fiatFontSizeRate,
        fiatFontWeightRate: item.fiatFontWeightRate,
        withLeftShift: item.withLeftShift,
        valueCanBeHidden: item.valueCanBeHidden,
      };
      const wrapper = useShallowMount(FormattedAmountWithFiatValue, {
        propsData,
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
