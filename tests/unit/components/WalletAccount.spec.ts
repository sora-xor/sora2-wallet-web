import Vuex from 'vuex';
import { useDescribe, useShallowMount } from '../../utils';

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
    propsData: {
      showControls: true,
      polkadotAccount,
    },
    store: createStore(),
  };

  beforeEach(() => {
    wrapper = useShallowMount(WalletAccount, wrapperOptions);
  });

  it('should be rendered correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render account switch button when prop is true', () => {
    const switchBtn = wrapper.find('.account-switch');

    expect(switchBtn.exists()).toBeTrue();
  });

  it('should not render account switch button while false', () => {
    const wrapper = useShallowMount(WalletAccount, {
      ...wrapperOptions,
      propsData: {
        showControls: false,
        polkadotAccount,
      },
    });

    const switchBtn = wrapper.find('.account-switch');

    expect(switchBtn.exists()).toBeFalse();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('account should have name', () => {
    const div = wrapper.find('.account-credentials_name');

    expect(div.text()).toMatch(MOCK_ACCOUNT_POLKADOT.name);
  });

  it('account should have formatted address', () => {
    const div = wrapper.find('.account-credentials_address');

    expect(div.text()).toBe(MOCK_ADDRESS.formatted);
  });

  it('should use general account name and address', () => {
    const wrapper = useShallowMount(WalletAccount, {
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
