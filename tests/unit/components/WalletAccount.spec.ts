import AccountCard from '@/components/Account/AccountCard.vue';
import WalletAccount from '@/components/Account/WalletAccount.vue';
import FormattedAddress from '@/components/shared/FormattedAddress.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT, MOCK_ACCOUNT_POLKADOT, MOCK_ADDRESS } from '../../utils/WalletAccountMock';

const createStore = () =>
  useVuex({
    account: {
      state: () => ({
        name: MOCK_ACCOUNT.name,
        address: MOCK_ACCOUNT.address,
        source: MOCK_ACCOUNT.source,
      }),
      getters: {
        account: () => MOCK_ACCOUNT,
      },
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
      polkadotAccount,
    },
    store: createStore(),
    stubs: {
      AccountCard,
      FormattedAddress,
    },
  };

  beforeEach(() => {
    wrapper = useShallowMount(WalletAccount, wrapperOptions);
  });

  it('should be rendered correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('account should have name', () => {
    const div = wrapper.find('.account-credentials_name');

    expect(div.text()).toMatch(MOCK_ACCOUNT_POLKADOT.name);
  });

  // [TODO] Fix it
  // it('account should have formatted address', () => {
  //   const div = wrapper.find('.account-credentials_address');

  //   expect(div.text()).toBe('cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo...TvL6UHcHDCvo');
  // });

  it('should use general account name and address', () => {
    const wrapper = useShallowMount(WalletAccount, {
      ...wrapperOptions,
      propsData: {
        polkadotAccount: null,
      },
    });

    const divName = wrapper.find('.account-credentials_name');
    const divAddressText = wrapper.find('.formatted-address .address').text();
    const startLine = divAddressText.substring(0, 12);
    const endLine = divAddressText.substring(15);
    const accountGetter = wrapper.vm.$store.getters['wallet/account/account'];

    expect(accountGetter.name).toBe(divName.text());
    expect(accountGetter.address).toStartWith(startLine);
    // [TODO]: Fix it
    expect(accountGetter.address).toEndWith('BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo');
  });
});
