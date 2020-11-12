import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletHistory from '@/components/WalletHistory.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()

describe('WalletBase.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletHistory)
  })

  it('should renders correctly', () => {
    const propsData = {
      history: [
        {
          operation: 'SWAP',
          fromSymbol: 'XOR',
          fromAmount: 100,
          toSymbol: 'KSM',
          toAmount: 24390.1239,
          status: 'IN_PROGRESS',
          date: 1605048643745
        }
      ]
    }
    const wrapper = shallowMount(WalletHistory, { localVue, propsData })
    expect(wrapper.element).toMatchSnapshot()
  })
})
