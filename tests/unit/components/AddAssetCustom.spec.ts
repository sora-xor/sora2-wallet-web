import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import AddAssetCustom from '@/components/AddAssetCustom.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Router: {
      actions: {
        navigate: jest.fn()
      }
    },
    Account: {
      getters: {
        accountAssets: () => [{ symbol: 'XOR', address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984', balance: '0.123', decimals: 18 }]
      },
      actions: {
        searchAsset: jest.fn(),
        addAsset: jest.fn()
      }
    }
  } as any
})

describe('AddAssetCustom.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(AddAssetCustom)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(AddAssetCustom, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
