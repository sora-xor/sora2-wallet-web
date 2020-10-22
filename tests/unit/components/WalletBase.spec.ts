import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletBase from '@/components/WalletBase.vue'
import { TranslationMock } from '../../utils'

const localVue = createLocalVue()

describe('WalletBase.vue', () => {
  beforeEach(() => {
    TranslationMock(WalletBase)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletBase, { localVue })
    expect(wrapper.element).toMatchSnapshot()
  })
})
