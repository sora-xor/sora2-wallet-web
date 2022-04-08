import omit from 'lodash/fp/omit';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_CREATE_TOKEN } from '../../utils/CreateTokenMock';

import CreateToken from '@/components/CreateToken.vue';

const createStore = () =>
  useVuex({
    router: {
      mutations: {
        navigate: jest.fn(),
      },
    },
  });

useDescribe('CreateToken.vue', CreateToken, () => {
  MOCK_CREATE_TOKEN.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const data = omit(['title'], item);
      const wrapper = useShallowMount(CreateToken, {
        store: createStore(),
        data: () => data,
        computed: {
          hasEnoughXor: () => item.hasEnoughXor,
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
