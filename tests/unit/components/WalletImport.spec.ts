import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletImport from '@/components/WalletImport.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      actions: {
        login: jest.fn(),
        importPolkadotJs: jest.fn(),
        getPolkadotJsAccounts: jest.fn(),
        getAddress: jest.fn()
      }
    },
    Router: {
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('WalletImport.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletImport)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletImport, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
