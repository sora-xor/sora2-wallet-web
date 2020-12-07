import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import SettingsNetworks from '@/components/SettingsNetworks.vue'
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
        availableNetworks: () => ([
          {
            id: 1,
            name: 'Main Ethereum Network',
            address: 'https://api.infura.io/v1/jsonrpc/mainnet',
            explorer: 'https://etherscan.io',
            editable: false
          }
        ])
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
