import omit from 'lodash/fp/omit';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_HISTORY_PAGINATION } from '../../utils/HistoryPaginationMock';

import HistoryPagination from '@/components/HistoryPagination.vue';

useDescribe('HistoryPagination.vue', HistoryPagination, () => {
  MOCK_HISTORY_PAGINATION.map((item) => {
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = omit(['title'], item);
      const wrapper = useShallowMount(HistoryPagination, { propsData });
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
