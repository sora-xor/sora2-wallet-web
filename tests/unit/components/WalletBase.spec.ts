import Vuex from 'vuex';
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

import { useDescribe, useMount } from '../../utils';
import WalletBase from '@/components/WalletBase.vue';
// TODO: [vuex]
const createStore = () =>
  new Vuex.Store({
    getters: {
      libraryTheme: () => Theme.DARK,
    },
  });

const mount = (propsData) => useMount(WalletBase, { store: createStore(), propsData });

useDescribe('WalletBase.vue', WalletBase, () => {
  it('should be rendered correctly', () => {
    const wrapper = mount(null);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render tooltip icon when passed as prop', () => {
    const wrapper = mount({ tooltip: 'Test tooltip' });
    const tooltip = wrapper.find('.base-title_tooltip');

    expect(tooltip.exists()).toBeTrue();
  });

  it('should render go-back button icon when passed as prop', () => {
    const wrapper = mount({ showBack: true });
    const backBtn = wrapper.find('.base-title_back');

    expect(backBtn.exists()).toBeTrue();
  });

  it('should render close button icon when passed as prop', () => {
    const wrapper = mount({ showClose: true });
    const closeBtn = wrapper.find('.base-title_close');

    expect(closeBtn.exists()).toBeTrue();
  });

  it('should render action button icon when passed as prop', () => {
    const wrapper = mount({ showAction: true });
    const actionBtn = wrapper.find('.base-title_action');

    expect(actionBtn.exists()).toBeTrue();
  });
});
