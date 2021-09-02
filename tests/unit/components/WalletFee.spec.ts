import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_WHITE_LIST } from '../../utils/mock'
import { MOCK_WALLET_FEE } from '../../utils/WalletFeeMock'

import WalletFee from '@/components/WalletFee.vue'

useDescribe('WalletFee.vue', WalletFee, () => {
  const store = new Vuex.Store({
    getters: {
      whitelist: () => MOCK_WHITE_LIST
    }
  })
  MOCK_WALLET_FEE.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      value: item.value
    }
    const wrapper = shallowMount(WalletFee, {
      localVue,
      store,
      propsData
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
