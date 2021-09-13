import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_ACCOUNT_ASSETS } from '../../utils/mock'
import { MOCK_ADD_ASSET_SEARCH } from '../../utils/AddAssetSearchMock'

import AddAssetSearch from '@/components/AddAssetSearch.vue'

useDescribe('AddAssetSearch.vue', AddAssetSearch, () => {
  // TODO: Check this place, there are strange tests results
  const accountAssetsAddressTableMock = MOCK_ACCOUNT_ASSETS.reduce((param, item) => {
    param[item.address] = item
    return param
  }, {})
  const store = new Vuex.Store({
    getters: {
      assets: () => MOCK_ACCOUNT_ASSETS,
      accountAssets: () => MOCK_ACCOUNT_ASSETS,
      accountAssetsAddressTable: () => accountAssetsAddressTableMock
    }
  })
  MOCK_ADD_ASSET_SEARCH.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const wrapper = shallowMount(AddAssetSearch, {
      store,
      localVue,
      data () {
        return {
          loading: item.loading,
          search: item.search,
          selectedAsset: item.selectedAsset
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
