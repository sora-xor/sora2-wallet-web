import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_CREATE_TOKEN } from '../../utils/CreateTokenMock'

import CreateToken from '@/components/CreateToken.vue'

useDescribe('CreateToken.vue', CreateToken, () => {
  MOCK_CREATE_TOKEN.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const wrapper = shallowMount(CreateToken, {
      localVue,
      data () {
        return {
          step: item.step,
          tokenSymbol: item.tokenSymbol,
          tokenName: item.tokenName,
          tokenSupply: item.tokenSupply,
          extensibleSupply: item.extensibleSupply,
          hasEnoughXor: item.hasEnoughXor
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
