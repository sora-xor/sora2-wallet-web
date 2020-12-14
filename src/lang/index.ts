import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { storage } from '../util/storage'
import { Languages } from '../consts'
import en from './en'

Vue.use(VueI18n)

const messages = {
  en
}

const i18n = new VueI18n({
  locale: storage.get('locale') || Languages.EN,
  messages
})

export default i18n
