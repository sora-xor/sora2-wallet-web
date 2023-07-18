import SoramitsuElements, { Message, MessageBox, Notification } from '@soramitsu/soramitsu-js-ui';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import ElPopover from 'element-ui/lib/popover';
import Vue, { VueConstructor } from 'vue';
import VueI18n from 'vue-i18n';
import { RecycleScroller } from 'vue-virtual-scroller';
import Vuex from 'vuex';

import i18n from '../../src/lang';

export const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

export const SoramitsuElementsImport = (vue: VueConstructor) => {
  vue.use(SoramitsuElements);
  vue.use(ElPopover);
  vue.component('RecycleScroller', RecycleScroller);
  vue.prototype.$prompt = MessageBox.prompt;
  vue.prototype.$alert = MessageBox.alert;
  vue.prototype.$message = Message;
  vue.prototype.$notify = Notification;
};

export const useDescribe = (name: string, component: VueConstructor<Vue>, fn: jest.EmptyFunction) =>
  describe(name, () => {
    beforeAll(() => {
      SoramitsuElementsImport(localVue);
    });
    fn();
  });

export const useShallowMount = (component: VueConstructor<Vue>, options = {}) => {
  return shallowMount(component, {
    localVue,
    i18n,
    ...options,
  });
};

export const useMount = (component: VueConstructor<Vue>, options = {}) => {
  return mount(component, {
    localVue,
    i18n,
    ...options,
  });
};

export const useVuex = (submodules = {}) => {
  const keys = Object.keys(submodules);
  const namespacedSubmodules = {};
  for (const key of keys) {
    namespacedSubmodules[key] = {
      namespaced: true,
      ...submodules[key],
    };
  }
  return new Vuex.Store({
    modules: {
      wallet: {
        namespaced: true,
        modules: namespacedSubmodules,
      },
    },
  });
};
