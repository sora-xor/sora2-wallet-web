import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_WALLET_FEE } from '../../utils/WalletFeeMock'

import WalletFee from '@/components/WalletFee.vue'

useDescribe('WalletFee.vue', WalletFee, () => {
  const store = new Vuex.Store({
    modules: {
      WalletFee: {
        getters: {
          whitelist: () => ([
            {
              symbol: 'XOR',
              name: 'SORA',
              address: '0x0200000000000000000000000000000000000000000000000000000000000000',
              decimals: 18,
              icon: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22' %3E%3Cpath fill='%23E3232C' d='M22,11c0,6.1-4.9,11-11,11S0,17.1,0,11S4.9,0,11,0S22,4.9,22,11z'/%3E%3Cpath fill='%23FFFFFF' d='M5.8,20.7c1.7-2.6,3.5-5.2,5.3-7.8l5.2,7.8c0.3-0.1,0.5-0.3,0.8-0.5s0.5-0.3,0.7-0.5 c-1.9-2.9-3.9-5.8-5.8-8.7h5.8V9.2H12V7.3h5.8V5.5H4.3v1.8h5.8v1.9H4.3V11h5.8l-5.8,8.7C4.5,19.9,4.7,20,5,20.2 C5.3,20.4,5.5,20.6,5.8,20.7z'/%3E%3C/svg%3E"
            }
          ])
        }
      }
    } as any
  })
  MOCK_WALLET_FEE.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      value: item.value
    }
    const wrapper = shallowMount(WalletFee, { localVue, store, propsData })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
