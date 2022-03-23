import Vuex from 'vuex';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ASSETS } from '../../utils/mock';
import { MOCK_ADD_ASSET_SEARCH } from '../../utils/AddAssetSearchMock';

import AddAssetSearch from '@/components/AddAssetSearch.vue';

import AssetList from '@/components/AssetList.vue';
import AssetListItem from '@/components/AssetListItem.vue';

const accountAssetsAddressTableMock = MOCK_ACCOUNT_ASSETS.reduce((param, item) => {
  param[item.address] = item;
  return param;
}, {});

const createStore = () =>
  new Vuex.Store({
    modules: {
      Account: {
        getters: {
          assets: () => MOCK_ASSETS,
          assetsLoading: () => false,
          accountAssets: () => MOCK_ACCOUNT_ASSETS,
          accountAssetsAddressTable: () => accountAssetsAddressTableMock,
        },
        actions: {
          getAssets: jest.fn(),
        },
      },
      Router: {
        actions: {
          navigate: jest.fn(),
        },
      },
    } as any,
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
            selectedAsset: item.selectedAsset,
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
