import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import SettingsNetworks from '@/components/SettingsNetworks.vue'
import { DEFAULT_NETWORKS } from '@/store/Settings'
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
      getters: {
        availableNetworks: () => DEFAULT_NETWORKS
      },
      actions: {
        addNetwork: jest.fn()
      }
    }
  } as any
})

describe('SettingsNetworks.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(SettingsNetworks)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(SettingsNetworks, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
