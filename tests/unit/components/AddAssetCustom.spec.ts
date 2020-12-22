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
