import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import AddTokenCustom from '@/components/AddTokenCustom.vue'
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
        searchToken: jest.fn(),
        addToken: jest.fn()
      }
    }
  } as any
})

describe('AddTokenCustom.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(AddTokenCustom)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(AddTokenCustom, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
