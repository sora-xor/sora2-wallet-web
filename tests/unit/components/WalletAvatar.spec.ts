import { shallowMount } from '@vue/test-utils'
import Identicon from '@polkadot/vue-identicon'

import { useDescribe, localVue } from '../../utils'
import { MOCK_WALLET_AVATAR } from '../../utils/WalletAvatarMock'

import WalletAvatar from '@/components/WalletAvatar.vue'

useDescribe('WalletAvatar.vue', WalletAvatar, () => {
  MOCK_WALLET_AVATAR.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const propsData = {
      size: item.size,
      theme: item.theme,
      address: item.address
    }
    const wrapper = shallowMount(WalletAvatar, {
      localVue,
      propsData,
      stubs: {
        Identicon: Identicon
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
