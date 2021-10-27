import { shallowMount } from '@vue/test-utils';

import WalletActivity from '@/components/WalletActivity.vue';
import { useDescribe, localVue } from '../../utils';

useDescribe('WalletActivity.vue', WalletActivity, () => {
  it('should be rendered correctly', () => {
    const wrapper = shallowMount(WalletActivity, { localVue });

    expect(wrapper.element).toMatchSnapshot();
  });
});
