import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_HISTORY } from '../../utils/mock'

import Wallet from '@/components/Wallet.vue'
import { WalletTabs } from '@/consts'

const createStore = (currentTab: WalletTabs) => new Vuex.Store({
  modules: {
    Account: {
      getters: {
        account: () => ({
          address: 'dfsakljfdlkjfhfkjladshslfjafds',
          name: 'Mock',
          password: '123qwaszx'
        }),
        activity: () => MOCK_HISTORY
      },
      actions: {
        getAccountActivity: jest.fn()
      }
    },
    Router: {
      getters: {
        currentRouteParams: () => ({
          currentTab
        })
      },
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

useDescribe('Wallet.vue', Wallet, () => {
  Object.values(WalletTabs).map(item => it(`[WalletTabs.${item}]: should be rendered correctly`, () => {
    const wrapper = shallowMount(Wallet, { localVue, store: createStore(item) })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
