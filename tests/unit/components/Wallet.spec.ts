import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import Wallet from '@/components/Wallet.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'
import { WalletTabs } from '@/consts'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      getters: {
        account: () => ({
          address: 'dfsakljfdlkjfhfkjladshslfjafds',
          name: 'Mock',
          password: '123qwaszx'
        }),
        activity: () => ({})
      },
      actions: {
        getAccountActivity: jest.fn()
      }
    },
    Router: {
      getters: {
        currentRouteParams: () => ({
          currentTab: WalletTabs.Assets
        })
      },
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('Wallet.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(Wallet)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(Wallet, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
    expect(true).toBe(true)
  })
})
