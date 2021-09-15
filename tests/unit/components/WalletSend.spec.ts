import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_ACCOUNT_ASSETS, MOCK_WHITE_LIST, MOCK_ACCOUNTS, MOCK_NETWORK_FEE, MOCK_FIAT_PRICE_AND_APY_OBJECT } from '../../utils/mock'
import { MOCK_WALLET_SEND } from '../../utils/WalletSendMock'

import WalletSend from '@/components/WalletSend.vue'

useDescribe('WalletSend.vue', WalletSend, () => {
  const store = new Vuex.Store({
    getters: {
      currentRouteParams: () => ({ id: '1', asset: MOCK_ACCOUNT_ASSETS[0] }),
      accountAssets: () => MOCK_ACCOUNT_ASSETS,
      account: () => MOCK_ACCOUNTS[0],
      whitelist: () => MOCK_WHITE_LIST,
      networkFees: () => MOCK_NETWORK_FEE,
      fiatPriceAndApyObject: () => MOCK_FIAT_PRICE_AND_APY_OBJECT
    },
    actions: {
      setAttribute: jest.fn()
    }
  })
  MOCK_WALLET_SEND.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const wrapper = shallowMount(WalletSend, {
      localVue,
      store,
      data () {
        return {
          step: item.step,
          address: item.address,
          amount: item.amount
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
