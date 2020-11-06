import { shallowMount, createLocalVue } from '@vue/test-utils'

import WalletConnection from '@/components/WalletConnection.vue'
import { TranslationMock, SoramitsuElementsImport } from '../../utils'

const localVue = createLocalVue()

describe('WalletConnection.vue', () => {
  beforeEach(() => {
    SoramitsuElementsImport(localVue)
    TranslationMock(WalletConnection)
  })

  it('should renders correctly', () => {
    const wrapper = shallowMount(WalletConnection, { localVue })
    expect(wrapper.element).toMatchSnapshot()
  })
})
