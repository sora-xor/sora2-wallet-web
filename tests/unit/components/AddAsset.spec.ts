import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_ADD_ASSET } from '../../utils/AddAssetMock';

import AddAsset from '@/components/AddAsset/AddAsset.vue';

useDescribe('AddAsset.vue', AddAsset, () => {
  MOCK_ADD_ASSET.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(AddAsset, {
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
