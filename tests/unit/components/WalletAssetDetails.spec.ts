import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletAssetDetails from '@/components/WalletAssetDetails.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      getters: {
        selectedAssetDetails: () => ([
          {
            operation: 'SWAP',
            fromAmount: 100,
            toSymbol: 'KSM',
            toAmount: 24390.1239,
            status: 'IN_PROGRESS',
            date: 1605048643745
          }
        ])
      },
      actions: {
        getAssetDetails: jest.fn()
      }
    },
    Router: {
      getters: {
        currentRouteParams: () => ({ symbol: 'XOR' })
      },
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('WalletAssetDetails.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletAssetDetails)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletAssetDetails, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
