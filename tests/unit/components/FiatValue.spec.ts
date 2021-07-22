import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_FIAT_VALUES } from '../../utils/mock'

import FiatValue from '@/components/FiatValue.vue'

useDescribe('FiatValue.vue', FiatValue, () => {
  MOCK_FIAT_VALUES.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      value: item.value,
      withDecimals: item.withDecimals,
      withLeftShift: item.withLeftShift
    }
    const wrapper = shallowMount(FiatValue, { localVue, propsData })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
