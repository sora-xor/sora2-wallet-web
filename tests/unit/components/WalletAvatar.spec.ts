import Identicon from '@polkadot/vue-identicon';

import WalletAvatar from '@/components/Account/WalletAvatar.vue';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_WALLET_AVATAR } from '../../utils/WalletAvatarMock';

useDescribe('WalletAvatar.vue', WalletAvatar, () => {
  MOCK_WALLET_AVATAR.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = {
        size: item.size,
        theme: item.theme,
        address: item.address,
      };
      const wrapper = useShallowMount(WalletAvatar, {
        propsData,
        stubs: {
          Identicon: Identicon,
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
