import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue } from '../../utils';
import { MOCK_CREATE_TOKEN } from '../../utils/CreateTokenMock';

import CreateToken from '@/components/CreateToken.vue';
import { MOCK_NETWORK_FEES } from '../../utils/NetworkFeesMock';

const createStore = () =>
  new Vuex.Store({
    modules: {
      Settings: {
        getters: {
          networkFees: () => MOCK_NETWORK_FEES,
        },
      },
      Router: {
        actions: {
          navigate: jest.fn(),
        },
      },
    } as any,
  });

useDescribe('CreateToken.vue', CreateToken, () => {
  MOCK_CREATE_TOKEN.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const wrapper = shallowMount(CreateToken, {
        localVue,
        store: createStore(),
        data: () => {
          return {
            step: item.step,
            tokenSymbol: item.tokenSymbol,
            tokenName: item.tokenName,
            tokenSupply: item.tokenSupply,
            extensibleSupply: item.extensibleSupply,
          };
        },
        computed: {
          hasEnoughXor: () => item.hasEnoughXor,
        },
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
});
