import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletActivity from '@/components/WalletActivity.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    Account: {
      getters: {
        activity: () => ([
          {
            operation: 'SWAP',
            fromSymbol: 'XOR',
            fromAmount: 100,
            toSymbol: 'KSM',
            toAmount: 24390.1239,
            status: 'IN_PROGRESS',
            date: 1605048643745
          }
        ])
      },
      actions: {
        getAccountActivity: jest.fn()
      }
    }
  } as any
})

describe('WalletActivity.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletActivity)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletActivity, { localVue, store })
    expect(wrapper.element).toMatchSnapshot()
  })
})
