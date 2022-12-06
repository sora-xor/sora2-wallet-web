import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ASSETS, MOCK_WHITE_LIST } from '../../utils/mock';
import { MOCK_ADD_ASSET_SEARCH } from '../../utils/AddAssetSearchMock';

import AddAssetSearch from '@/components/AddAsset/AddAssetTokenTab.vue';

import AssetList from '@/components/AssetList.vue';
import AssetListItem from '@/components/AssetListItem.vue';

const accountAssetsAddressTableMock = MOCK_ACCOUNT_ASSETS.reduce((param, item) => {
  param[item.address] = item;
  return param;
}, {});

const createStore = () =>
  useVuex({
    account: {
      state: () => ({
        assets: MOCK_ASSETS,
        accountAssets: MOCK_ACCOUNT_ASSETS,
      }),
      getters: {
        accountAssetsAddressTable: () => accountAssetsAddressTableMock,
        whitelist: () => MOCK_WHITE_LIST,
      },
    },
    router: {
      mutations: {
        navigate: jest.fn(),
      },
    },
  });

useDescribe('AddAssetSearch.vue', AddAssetSearch, () => {
  MOCK_ADD_ASSET_SEARCH.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(AddAssetSearch, {
        store: createStore(),
        data: () => {
          return {
            loading: item.loading,
            search: item.search,
          };
        },
        stubs: {
          AssetList,
          AssetListItem,
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
