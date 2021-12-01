import Vue, { VueConstructor } from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import SoramitsuElements, { Message, MessageBox, Notification } from '@soramitsu/soramitsu-js-ui';

import { messages } from '../../src/lang';

export const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  messages,
});

export const SoramitsuElementsImport = (vue: VueConstructor) => {
  vue.use(SoramitsuElements);
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
