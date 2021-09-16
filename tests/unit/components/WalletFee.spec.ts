import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_WALLET_FEE } from '../../utils/WalletFeeMock'

import WalletFee from '@/components/WalletFee.vue'

useDescribe('WalletFee.vue', WalletFee, () => {
  const store = new Vuex.Store({
    getters: {
      fiatPriceAndApyObject: () => ({
        '0x0200000000000000000000000000000000000000000000000000000000000000': {
          price: '1230000000000000000'
        }
      })
    }
  })
  MOCK_WALLET_FEE.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      value: item.value
    }
    const wrapper = shallowMount(WalletFee, { localVue, store, propsData })
    expect(wrapper.element).toMatchSnapshot()
  }))
  it('Should not be rendered', () => {
    const propsData = {
      value: '123'
    }
    try {
      shallowMount(WalletFee, { localVue, store, propsData })
    } catch (error) {
      expect((error as Error).message).toBe('[WalletFee.vue]: property "value" should have FPNumber type')
    }
  })
})
