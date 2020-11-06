import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletCreation from '@/components/WalletCreation.vue'
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

describe('WalletCreation.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletCreation)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletCreation, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
