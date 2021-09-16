import { shallowMount } from '@vue/test-utils'

import { useDescribe, localVue } from '../../utils'
import { MOCK_ADD_ASSET_CUSTOM } from '../../utils/AddAssetCustomMock'

import AddAssetCustom from '@/components/AddAssetCustom.vue'

useDescribe('AddAssetCustom.vue', AddAssetCustom, () => {
  MOCK_ADD_ASSET_CUSTOM.map(item => it(`[${item.title}]: should be rendered correctly`, () => {
    const wrapper = shallowMount(AddAssetCustom, {
      localVue,
      data: () => {
        return {
          address: item.address,
          selectedAsset: item.selectedAsset,
          alreadyAttached: item.alreadyAttached
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  }))
})
