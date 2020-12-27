import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletSend from '@/components/WalletSend.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      actions: {
        transfer: jest.fn()
      },
      getters: {
        account: () => ({ address: 'asdfsasda', name: 'mock', password: 'asdsdadds', isExternal: false })
      }
    },
    Router: {
      actions: {
        navigate: jest.fn()
      },
      getters: {
        currentRouteParams: () => (
          {
            asset: {
              symbol: 'XOR',
              address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
              balance: 12787.09,
              decimals: 18
            }
          }
        )
      }
    }
  } as any
})

describe('WalletSend.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletSend)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletSend, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
