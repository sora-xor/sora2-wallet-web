import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import AddAsset from '@/components/AddAsset.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Router: {
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('AddAsset.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(AddAsset)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(AddAsset, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
