import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletSettings from '@/components/WalletSettings.vue'
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

describe('WalletSettings.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletSettings)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletSettings, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
