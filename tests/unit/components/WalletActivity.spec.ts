import WalletActivity from '@/components/WalletActivity.vue';
import { useDescribe, useShallowMount } from '../../utils';

useDescribe('WalletActivity.vue', WalletActivity, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletActivity);

    expect(wrapper.element).toMatchSnapshot();
  });
});
