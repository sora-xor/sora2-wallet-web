import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import SettingsAbout from '@/components/SettingsAbout.vue'
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

describe('SettingsAbout.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(SettingsAbout)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(SettingsAbout, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
