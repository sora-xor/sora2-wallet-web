import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue, i18n } from '../../utils';
import { MOCK_ADD_ASSET } from '../../utils/AddAssetMock';

import AddAsset from '@/components/AddAsset.vue';

useDescribe('AddAsset.vue', AddAsset, () => {
  MOCK_ADD_ASSET.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = shallowMount(AddAsset, {
        localVue,
        i18n,
        data: () => {
          return {
            currentTab: item.currentTab,
          };
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
