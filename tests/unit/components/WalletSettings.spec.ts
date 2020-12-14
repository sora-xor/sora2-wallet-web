import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletSettings from '@/components/WalletSettings.vue'
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
    Account: {
      actions: {
        logout: jest.fn()
      }
    },
    Settings: {
      getters: {
        activeNetwork: () => MOCK_NETWORKS[0],
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
        setActiveNetwork: jest.fn()
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
