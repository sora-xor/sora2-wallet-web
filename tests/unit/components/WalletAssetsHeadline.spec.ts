import WalletAssetsHeadline from '@/components/WalletAssetsHeadline.vue';

import { useDescribe, useShallowMount, useMount, useVuex } from '../../utils';

const createStore = () =>
  useVuex({
    settings: {
      state: () => ({
        filters: {
          option: 'All',
          verifiedOnly: false,
          zeroBalance: false,
        },
      }),
      mutations: {
        setFilterOptions: jest.fn(),
      },
    },
  });

useDescribe('WalletAssetsHeadline.vue', WalletAssetsHeadline, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletAssetsHeadline, { store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('shows proper amount when assetsFiatAmount is passed', () => {
    const wrapper = useMount(WalletAssetsHeadline, {
      store: createStore(),
      propsData: {
        assetsFiatAmount: '100',
      },
    });

    const amount = wrapper.find('.formatted-amount__integer');

    expect(amount.text()).toEqual('100');
  });
});
