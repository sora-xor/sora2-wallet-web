import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import AddTokenSearch from '@/components/AddTokenSearch.vue'
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
        tokens: () => [{ name: 'Sora', symbol: 'XOR', address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984' }]
      },
      actions: {
        getTokens: jest.fn(),
        addToken: jest.fn()
      }
    }
  } as any
})

describe('AddTokenSearch.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(AddTokenSearch)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(AddTokenSearch, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
