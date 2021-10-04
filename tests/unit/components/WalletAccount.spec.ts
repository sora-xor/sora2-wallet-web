import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import { useDescribe, localVue } from '../../utils';

import WalletAccount from '@/components/WalletAccount.vue';
import { MOCK_ACCOUNT, MOCK_ACCOUNT_POLKADOT, MOCK_ADDRESS } from '../../utils/WalletAccountMock';

const createStore = () =>
  new Vuex.Store({
    getters: {
      account: () => ({
        name: MOCK_ACCOUNT.name,
        address: MOCK_ACCOUNT.address,
        isExternal: MOCK_ACCOUNT.isExternal,
      }),
    },
  });

const mockFormattedSoraAddress = jest.fn().mockReturnValue(MOCK_ADDRESS.formattedSora);

jest.mock('../../../src/util', () => {
  const originalModule = jest.requireActual('../../../src/util');

  return {
    ...originalModule,
    formatSoraAddress: () => mockFormattedSoraAddress(),
  };
});

useDescribe('WalletAccount.vue', WalletAccount, () => {
  let wrapper;
  const polkadotAccount = MOCK_ACCOUNT_POLKADOT;
  const wrapperOptions = {
    localVue,
    propsData: {
      showControls: true,
      polkadotAccount,
    },
    store: createStore(),
  };

  beforeEach(() => {
    wrapper = shallowMount(WalletAccount, wrapperOptions);
  });

  it('should be rendered correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('when showControls prop is passed', () => {
    it('should render account switch button while true', () => {
      const switchBtn = wrapper.find('.account-switch');

      expect(switchBtn.exists()).toBe(true);
    });

    it('should not render account switch button while false', () => {
      const wrapper = shallowMount(WalletAccount, {
        ...wrapperOptions,
        propsData: {
          showControls: false,
          polkadotAccount,
        },
      });

      const switchBtn = wrapper.find('.account-switch');

      expect(switchBtn.exists()).toBe(false);
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('when polkadotAccount prop is passed', () => {
    it('account should have name', () => {
      const div = wrapper.find('.account-credentials_name');

      expect(div.text()).toMatch(MOCK_ACCOUNT_POLKADOT.name);
    });

    it('account should have formatted address', () => {
      const div = wrapper.find('.account-credentials_address');

      expect(div.text()).toBe(MOCK_ADDRESS.formatted);
    });
  });

  describe('when polkadotAccount prop is not passed', () => {
    it('should use general account name and address', () => {
      const wrapper = shallowMount(WalletAccount, {
        ...wrapperOptions,
        propsData: {
          showControls: true,
          polkadotAccount: null,
        },
      });

      const divName = wrapper.find('.account-credentials_name');
      const divAddressText = wrapper.find('.account-credentials_address').text();
      const startLine = divAddressText.substring(0, 12);
      const endLine = divAddressText.substring(15);
      const accountGetter = wrapper.vm.$store.getters.account;

      expect(accountGetter.name).toBe(divName.text());
      expect(accountGetter.address).toStartWith(startLine);
      expect(accountGetter.address).toEndWith(endLine);
    });
  });
});
