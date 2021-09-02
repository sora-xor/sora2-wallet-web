import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_INFO_LINE } from '../../utils/InfoLineMock'

import InfoLine from '@/components/InfoLine.vue'
import FormattedAmount from '@/components/FormattedAmount.vue'

useDescribe('InfoLine.vue', InfoLine, () => {
  MOCK_INFO_LINE.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      label: item.label,
      labelTooltip: item.labelTooltip,
      value: item.value,
      assetSymbol: item.assetSymbol,
      isFormatted: item.isFormatted,
      fiatValue: item.fiatValue
    }
    const wrapper = shallowMount(InfoLine, {
      localVue,
      propsData,
      stubs: {
        FormattedAmount: FormattedAmount
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
