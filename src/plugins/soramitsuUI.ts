import Vue from 'vue'

import { Themes } from '@soramitsu/soramitsu-js-ui/src/utils/Theme'
import { DesignSystemTypes } from '@soramitsu/soramitsu-js-ui/src/utils/DesignSystem'
import { setTheme, setDesignSystem } from '@soramitsu/soramitsu-js-ui/src/utils'

import ElementUIPlugin, { Message, MessageBox, Notification } from '@soramitsu/soramitsu-js-ui/src/plugins/elementUI'
import SoramitsuUIStorePlugin from '@soramitsu/soramitsu-js-ui/src/plugins/soramitsuUIStore'

import SButton from '@soramitsu/soramitsu-js-ui/src/components/Button/SButton'
import SCard from '@soramitsu/soramitsu-js-ui/src/components/Card/SCard'
import SDesignSystemProvider from '@soramitsu/soramitsu-js-ui/src/components/DesignSystem/SDesignSystemProvider'
import SDivider from '@soramitsu/soramitsu-js-ui/src/components/Divider/SDivider'
import SDropdown from '@soramitsu/soramitsu-js-ui/src/components/Dropdown/SDropdown'
import SDropdownItem from '@soramitsu/soramitsu-js-ui/src/components/Dropdown/SDropdownItem'
import SIcon from '@soramitsu/soramitsu-js-ui/src/components/Icon/SIcon'
import SInput from '@soramitsu/soramitsu-js-ui/src/components/Input/SInput'
import SFloatInput from '@soramitsu/soramitsu-js-ui/src/components/Input/SFloatInput'
import SForm from '@soramitsu/soramitsu-js-ui/src/components/Form/SForm'
import SFormItem from '@soramitsu/soramitsu-js-ui/src/components/Form/SFormItem'
import SPagination from '@soramitsu/soramitsu-js-ui/src/components/Pagination'
import SSwitch from '@soramitsu/soramitsu-js-ui/src/components/Switch'
import STab from '@soramitsu/soramitsu-js-ui/src/components/Tab/STab'
import STabs from '@soramitsu/soramitsu-js-ui/src/components/Tab/STabs'
import STooltip from '@soramitsu/soramitsu-js-ui/src/components/Tooltip'

export function install (vue: typeof Vue, store) {
  vue.use(ElementUIPlugin)
  vue.use(SoramitsuUIStorePlugin, { store })
  vue.use(SButton)
  vue.use(SCard)
  vue.use(SDesignSystemProvider)
  vue.use(SDivider)
  vue.use(SDropdown)
  vue.use(SDropdownItem)
  vue.use(SIcon)
  vue.use(SInput)
  vue.use(SFloatInput)
  vue.use(SForm)
  vue.use(SFormItem)
  vue.use(SPagination)
  vue.use(SSwitch)
  vue.use(STab)
  vue.use(STabs)
  vue.use(STooltip)
  vue.prototype.$prompt = MessageBox.prompt
  vue.prototype.$alert = MessageBox.alert
  vue.prototype.$message = Message
  vue.prototype.$notify = ({ message, type }) => {
    Notification({
      message,
      title: '',
      duration: 4500, // If is will be changed you should change animation duration as well
      type,
      customClass: 'sora s-flex'
    })
    const el = document.createElement('div')
    el.className = 'loader'
    const elements = Array.from(document.getElementsByClassName('el-notification'))
    elements[elements.length - 1].appendChild(el)
  }

  setTheme(Themes.LIGHT)
  setDesignSystem(DesignSystemTypes.NEUMORPHIC)
}
