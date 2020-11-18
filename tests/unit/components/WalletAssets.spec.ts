import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletAssets from '@/components/WalletAssets.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      getters: {
        assets: () => ([
          {
            name: 'Sora',
            symbol: 'XOR',
            address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
            amount: 12787.09,
            usdAmount: 6345.23
          }
        ])
      },
      actions: {
        getAccountAssets: jest.fn()
      }
    },
    Router: {
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('WalletAssets.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletAssets)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletAssets, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
