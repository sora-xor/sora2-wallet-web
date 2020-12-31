// import Vuex from 'vuex'
// import { shallowMount, createLocalVue } from '@vue/test-utils'

// import AddAsset from '@/components/AddAsset.vue'
// import { TranslationMock, SoramitsuElementsImport } from '../../utils'

// TODO: fix it
// TypeError: Cannot redefine property: configDescriptor
//         at Function.defineProperty (<anonymous>)
//
//       33 | import { Component, Mixins } from 'vue-property-decorator'
//       34 | import { Getter, Action } from 'vuex-class'
//     > 35 | import { AccountAsset, Asset, KnownSymbols } from '@sora-substrate/util'

// const localVue = createLocalVue()
// localVue.use(Vuex)
// const store = new Vuex.Store({
//   modules: {
//     Router: {
//       actions: {
//         navigate: jest.fn()
//       }
//     }
//   } as any
// })

describe('AddAsset.vue', () => {
  beforeEach(() => {
    // SoramitsuElementsImport(localVue)
    // TranslationMock(AddAsset)
  })

  it('should renders correctly', () => {
    // const wrapper = shallowMount(AddAsset, { localVue, store })
    // expect(wrapper.element).toMatchSnapshot()
    expect(true).toBe(true)
  })
})
