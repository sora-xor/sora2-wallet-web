import WalletAssetsHeadline from '@/components/WalletAssetsHeadline.vue';
import { useDescribe, useShallowMount, useVuex } from '../../utils';

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
});
