import Vue from 'vue'
import SoramitsuElements, {
  setTheme,
  setDesignSystem,
  Themes,
  DesignSystemTypes,
  Components,
  Message,
  MessageBox,
  Notification
} from '@soramitsu/soramitsu-js-ui'

const components = [
  Components.SButton,
  Components.SCard,
  Components.SDesignSystemProvider,
  Components.SDivider,
  Components.SDropdown,
  Components.SDropdownItem,
  Components.SIcon,
  Components.SInput,
  Components.SFloatInput,
  Components.SForm,
  Components.SFormItem,
  Components.SPagination,
  Components.SSwitch,
  Components.STabs,
  Components.STab,
  Components.STooltip
]

// Don't need default library directives
const directives = []

export function install (store) {
  Vue.use(SoramitsuElements, { store, components, directives })
  setTheme(Themes.LIGHT)
  setDesignSystem(DesignSystemTypes.NEUMORPHIC)
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$message = Message
  Vue.prototype.$notify = ({ message, type }) => {
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
}
