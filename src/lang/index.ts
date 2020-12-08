import Vue from 'vue'
import VueI18n from 'vue-i18n'
import * as storage from '../util/storage'

import en from './en'
import { Languages } from '@/consts'

Vue.use(VueI18n)

const messages = {
  en
}

const i18n = new VueI18n({
  locale: storage.getItem('locale') || Languages.EN,
  messages
})

export default i18n
