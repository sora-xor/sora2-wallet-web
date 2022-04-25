import { useDescribe, useShallowMount, useVuex } from '../../utils';
import TokenLogo from '@/components/TokenLogo.vue';
import { MOCK_ACCOUNT_ASSETS, MOCK_ACCOUNT_ASSETS_NFT } from '../../utils/mock';

const createStore = (mutations) =>
  useVuex({
    router: {
      mutations,
    },
  });

useDescribe('TokenLogo.vue', TokenLogo, () => {
  it('should render nft-token-logo when asset.content exists', () => {
    const wrapper = useShallowMount(TokenLogo, {
      propsData: {
        token: MOCK_ACCOUNT_ASSETS_NFT[0],
      },
    });
    const nftComponent = wrapper.find('.asset-logo-nft');

    expect(nftComponent.exists()).toBeTrue();
  });

  it('should call navigate() mutation when prop is passed and logo is clicked', () => {
    const mutations = {
      navigate: jest.fn(),
    };

    const wrapper = useShallowMount(TokenLogo, {
      store: createStore(mutations),
      propsData: {
        token: MOCK_ACCOUNT_ASSETS[0],
        withClickableLogo: true,
      },
    });

    const element = wrapper.find('.asset-logo');

    element.trigger('click');

    expect(mutations.navigate).toHaveBeenCalled();
  });
});
