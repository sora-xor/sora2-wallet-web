import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletAccount from '@/components/WalletAccount.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      actions: {
        logout: jest.fn()
      },
      getters: {
        account: () => ({
          address: 'dfsakljfdlkjfhfkjladshslfjafds',
          name: 'Mock',
          password: '123qwaszx'
        })
      }
    },
    Router: {
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('WalletAccount.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletAccount)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletAccount, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
