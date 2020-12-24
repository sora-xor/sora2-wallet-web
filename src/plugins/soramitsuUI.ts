import Vue from 'vue'
import SoramitsuElements, { Message, MessageBox, Notification, setTheme } from '@soramitsu/soramitsu-js-ui'
import '@soramitsu/soramitsu-js-ui/lib/styles'

import store from '../store'

Vue.use(SoramitsuElements, { store })

setTheme('light')
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$message = Message
Vue.prototype.$notify = Notification
