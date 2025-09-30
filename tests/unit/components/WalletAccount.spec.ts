import AccountCard from '@/components/Account/AccountCard.vue';
import WalletAccount from '@/components/Account/WalletAccount.vue';
import FormattedAddress from '@/components/shared/FormattedAddress.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT, MOCK_ACCOUNT_POLKADOT, MOCK_ADDRESS } from '../../utils/WalletAccountMock';

const createStore = () =>
  useVuex({
    account: {
      state: () => ({
        account: MOCK_ACCOUNT,
        name: MOCK_ACCOUNT.name,
        address: MOCK_ACCOUNT.address,
        source: MOCK_ACCOUNT.source,
      }),
      getters: {
        account: () => MOCK_ACCOUNT,
      },
    },
  });

const mockFormattedSoraAddress = vi.fn().mockReturnValue(MOCK_ADDRESS.formattedSora);

vi.mock('../../../src/util', async () => {
  const originalModule = await vi.importActual<typeof import('../../../src/util')>('../../../src/util');

  return {
    ...originalModule,
    formatAccountAddress: () => mockFormattedSoraAddress(),
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
    mockFormattedSoraAddress.mockClear();
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

  it('should use general account name and address', async () => {
    mockFormattedSoraAddress.mockClear();

    const wrapper = useShallowMount(WalletAccount, {
      ...wrapperOptions,
      propsData: {
        polkadotAccount: null,
      },
    });

    await wrapper.vm.$nextTick();

    const accountGetter = wrapper.vm.$store.getters['wallet/account/account'];

    expect(accountGetter).toEqual(MOCK_ACCOUNT);

    const nameNode = wrapper.find('.account-credentials_name');
    expect(nameNode.text()).toBe('<unknown>');

    const formattedAddress = wrapper.findComponent(FormattedAddress);
    expect(formattedAddress.props('value')).toBe('');

    expect(mockFormattedSoraAddress).not.toHaveBeenCalled();
  });
});
