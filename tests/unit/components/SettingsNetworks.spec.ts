import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import SettingsNetworks from '@/components/SettingsNetworks.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'
import { MOCK_NETWORKS } from '../../utils/mock'

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
        availableNetworks: () => MOCK_NETWORKS
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
