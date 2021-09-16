import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import { History } from '@sora-substrate/util'

import { useDescribe, localVue } from '../../utils'
import { MOCK_ACCOUNT_ASSETS, MOCK_HISTORY, MOCK_SORA_NETWORK } from '../../utils/mock'

import WalletTransactionDetails from '@/components/WalletTransactionDetails.vue'

const createStore = (tx: History) => new Vuex.Store({
  modules: {
    Settings: {
      getters: {
        soraNetwork: () => MOCK_SORA_NETWORK
      }
    },
    Account: {
      getters: {
        selectedTransaction: () => tx,
        accountAssets: () => MOCK_ACCOUNT_ASSETS
      },
      actions: {
        getTransactionDetails: jest.fn(),
        getAccountActivity: jest.fn()
      }
    },
    Router: {
      getters: {
        currentRouteParams: () => ({ id: '1', asset: MOCK_ACCOUNT_ASSETS[0] })
      },
      actions: {
        navigate: jest.fn()
      }
    }
  } as any
})

useDescribe('WalletTransactionDetails.vue', WalletTransactionDetails, () => {
  MOCK_HISTORY.map(item => it(`[${item.type}, ${item.status}]: should be rendered correctly`, () => {
    const formattedAddressLength = 24
    const ellipsisLength = 3
    const wrapper = shallowMount(WalletTransactionDetails, { localVue, store: createStore(item) })
    const txLink = wrapper.find('.transaction .s-input-container .transaction-link').element as HTMLAnchorElement
    const txInputValue = wrapper.find('.transaction .s-input-container s-input-stub').props().value as string
    const hasTxId = !!item.txId

    expect(wrapper.element).toMatchSnapshot()
    expect(txLink.href).toContain(hasTxId ? `/transaction/${item.txId}` : `/block/${item.blockId}`)
    expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength)
  }))
})
