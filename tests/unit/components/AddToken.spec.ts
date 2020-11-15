import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import AddToken from '@/components/AddToken.vue'
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

describe('AddToken.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(AddToken)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(AddToken, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
