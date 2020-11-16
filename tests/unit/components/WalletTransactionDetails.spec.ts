import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      getters: {
        selectedTransaction: () => ({
          id: 1,
          hash: '5HVmWWpBi69cmmDf4RlKaSqWxxJ2pveRnfozNg5K',
          status: 'SUCCESS',
          date: 1605048643745,
          amount: 23.34,
          symbol: 'XOR',
          fee: 0.23,
          from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K',
          to: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
          history: [{ id: 1, state: 'CREATED', amount: 23.34, fee: 0.23, date: 1605048643745, status: 'SUCCESS' }]
        })
      },
      actions: {
        getTransactionDetails: jest.fn()
      }
    },
    Router: {
      getters: {
        currentRouteParams: () => ({ id: 1 })
      },
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

describe('WalletTransactionDetails.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletTransactionDetails)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletTransactionDetails, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
