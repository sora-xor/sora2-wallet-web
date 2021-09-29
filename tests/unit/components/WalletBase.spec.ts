import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue } from '../../utils';

import WalletBase from '@/components/WalletBase.vue';

useDescribe('WalletBase.vue', WalletBase, () => {
  it('should be rendered correctly', () => {
    const wrapper = shallowMount(WalletBase, { localVue });
    expect(wrapper.element).toMatchSnapshot();
  });
});
