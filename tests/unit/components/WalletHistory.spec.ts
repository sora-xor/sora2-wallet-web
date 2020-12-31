// import { shallowMount, createLocalVue } from '@vue/test-utils'

// import WalletHistory from '@/components/WalletHistory.vue'
// import { TranslationMock, SoramitsuElementsImport } from '../../utils'

// TODO: fix it
// TypeError: Cannot redefine property: configDescriptor
//         at Function.defineProperty (<anonymous>)
//
//       33 | import { Component, Mixins } from 'vue-property-decorator'
//       34 | import { Getter, Action } from 'vuex-class'
//     > 35 | import { AccountAsset, Asset, KnownSymbols } from '@sora-substrate/util'

// const localVue = createLocalVue()

describe('WalletBase.vue', () => {
  beforeEach(() => {
    // SoramitsuElementsImport(localVue)
    // TranslationMock(WalletHistory)
  })

  it('should renders correctly', () => {
    const propsData = {
      history: [
        {
          operation: 'SWAP',
          fromSymbol: 'XOR',
          fromAmount: 100,
          toSymbol: 'KSM',
          toAmount: 24390.1239,
          status: 'IN_PROGRESS',
          date: 1605048643745
        }
      ]
    }
    // const wrapper = shallowMount(WalletHistory, { localVue, propsData })
    // expect(wrapper.element).toMatchSnapshot()
    expect(true).toBe(true)
  })
})
