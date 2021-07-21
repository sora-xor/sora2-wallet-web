import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import FiatValue from '@/components/FiatValue.vue'

useDescribe('FiatValue.vue', FiatValue, () => {
  it('should be rendered correctly', () => {
    const propsData = {
      value: '1234.5678',
      withDecimals: true
    }
    const wrapper = shallowMount(FiatValue, { localVue, propsData })
    expect(wrapper.element).toMatchSnapshot()
  })
})
