import Vuex from 'vuex';
import { mount } from '@vue/test-utils';
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

import { useDescribe, localVue } from '../../utils';
import WalletBase from '@/components/WalletBase.vue';

const createStore = () =>
  new Vuex.Store({
    getters: {
      libraryTheme: () => Theme.DARK,
    },
  });

const useMount = (propsData) => mount(WalletBase, { localVue, store: createStore(), propsData });

useDescribe('WalletBase.vue', WalletBase, () => {
  it('should be rendered correctly', () => {
    const wrapper = useMount(null);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render tooltip icon when passed as prop', () => {
    const wrapper = useMount({ tooltip: 'Test tooltip' });
    const tooltip = wrapper.find('.base-title_tooltip');

    expect(tooltip.exists()).toBeTrue();
  });

  it('should render go-back button icon when passed as prop', () => {
    const wrapper = useMount({ showBack: true });
    const backBtn = wrapper.find('.base-title_back');

    expect(backBtn.exists()).toBeTrue();
  });

  it('should render close button icon when passed as prop', () => {
    const wrapper = useMount({ showClose: true });
    const closeBtn = wrapper.find('.base-title_close');

    expect(closeBtn.exists()).toBeTrue();
  });

  it('should render action button icon when passed as prop', () => {
    const wrapper = useMount({ showAction: true });
    const actionBtn = wrapper.find('.base-title_action');

    expect(actionBtn.exists()).toBeTrue();
  });
});
