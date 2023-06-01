import TokenLogo from '@/components/TokenLogo.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT_ASSETS_NFT, MOCK_WHITE_LIST, MOCK_WHITELIST_IDS_BY_SYMBOL } from '../../utils/mock';

// TODO: [RUSTEM]: please add more test cases for 1) symbol prop, 2) token prop, 3) whitelisted 4) non-whitelisted

const createStore = () =>
  useVuex({
    account: {
      getters: {
        whitelist: () => MOCK_WHITE_LIST,
        whitelistIdsBySymbol: () => MOCK_WHITELIST_IDS_BY_SYMBOL,
      },
    },
  });

useDescribe('TokenLogo.vue', TokenLogo, () => {
  it('should render nft-token-logo when asset.content exists', () => {
    const wrapper = useShallowMount(TokenLogo, {
      store: createStore(),
      propsData: {
        token: MOCK_ACCOUNT_ASSETS_NFT[0],
      },
    });
    const nftComponent = wrapper.find('.asset-logo-nft');

    expect(nftComponent.exists()).toBeTrue();
  });
});
