import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import SettingsLanguage from '@/components/SettingsLanguage.vue'
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
    Settings: {
      state: {
        locales: ['en', 'ru'],
        locale: 'en'
      },
      actions: {
        setLocale: jest.fn()
      }
    }
  } as any
})

describe('SettingsLanguage.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(SettingsLanguage)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(SettingsLanguage, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
