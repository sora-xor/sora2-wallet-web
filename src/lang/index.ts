import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './en';

Vue.use(VueI18n);

const messages = {
  en,
};

const i18n = new VueI18n({
  locale: 'en',
  messages,
  silentTranslationWarn: process.env.NODE_ENV === 'production',
});

export default i18n;
