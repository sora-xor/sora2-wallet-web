import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ASSETS } from '../../utils/mock';
import { MOCK_ADD_ASSET_SEARCH } from '../../utils/AddAssetSearchMock';

import AddAssetSearch from '@/components/AddAssetSearch.vue';

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
      const wrapper = shallowMount(AddAssetSearch, {
        store: createStore(),
        localVue,
        data: () => {
          return {
            loading: item.loading,
            search: item.search,
            selectedAsset: item.selectedAsset,
          };
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
