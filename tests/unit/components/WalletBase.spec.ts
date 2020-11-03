import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletBase from '@/components/WalletBase.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()

describe('WalletBase.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletBase)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletBase, { localVue })
    expect(wrapper.element).toMatchSnapshot()
  })
})
