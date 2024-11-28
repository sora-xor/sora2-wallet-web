// IMPORTANT!
// Add import url to rollup.external !

import SButton from '@soramitsu-ui/ui-vue2/lib/components/Button/SButton';
import SCard from '@soramitsu-ui/ui-vue2/lib/components/Card/SCard';
import SDatePicker from '@soramitsu-ui/ui-vue2/lib/components/DatePicker/SDatePicker';
import SDesignSystemProvider from '@soramitsu-ui/ui-vue2/lib/components/DesignSystem/SDesignSystemProvider';
import SDialog from '@soramitsu-ui/ui-vue2/lib/components/Dialog';
import SDivider from '@soramitsu-ui/ui-vue2/lib/components/Divider/SDivider';
import SDropdown from '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdown';
import SDropdownItem from '@soramitsu-ui/ui-vue2/lib/components/Dropdown/SDropdownItem';
import SForm from '@soramitsu-ui/ui-vue2/lib/components/Form/SForm';
import SFormItem from '@soramitsu-ui/ui-vue2/lib/components/Form/SFormItem';
import SIcon from '@soramitsu-ui/ui-vue2/lib/components/Icon/SIcon';
import SImage from '@soramitsu-ui/ui-vue2/lib/components/Image/SImage';
import SFloatInput from '@soramitsu-ui/ui-vue2/lib/components/Input/SFloatInput';
import SInput from '@soramitsu-ui/ui-vue2/lib/components/Input/SInput';
import SPagination from '@soramitsu-ui/ui-vue2/lib/components/Pagination';
import SRadio from '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadio';
import SRadioGroup from '@soramitsu-ui/ui-vue2/lib/components/Radio/SRadioGroup';
import SScrollbar from '@soramitsu-ui/ui-vue2/lib/components/Scrollbar';
import SOption from '@soramitsu-ui/ui-vue2/lib/components/Select/SOption';
import SSelect from '@soramitsu-ui/ui-vue2/lib/components/Select/SSelect';
import SSwitch from '@soramitsu-ui/ui-vue2/lib/components/Switch';
import STab from '@soramitsu-ui/ui-vue2/lib/components/Tab/STab';
import STabs from '@soramitsu-ui/ui-vue2/lib/components/Tab/STabs';
import STooltip from '@soramitsu-ui/ui-vue2/lib/components/Tooltip';
import { Button } from '@soramitsu-ui/ui-vue2/lib/directives';
import ElementUIPlugin, { Message, MessageBox, Notification } from '@soramitsu-ui/ui-vue2/lib/plugins/elementUI';
import SoramitsuUIStorePlugin from '@soramitsu-ui/ui-vue2/lib/plugins/soramitsuUIStore';
import DesignSystem from '@soramitsu-ui/ui-vue2/lib/types/DesignSystem';
import Directives from '@soramitsu-ui/ui-vue2/lib/types/directives';
import { setTheme, setDesignSystem } from '@soramitsu-ui/ui-vue2/lib/utils';
import ElPopover from 'element-ui/lib/popover';
import Vue from 'vue';

export function install(vue: typeof Vue, store) {
  vue.use(ElPopover);
  vue.use(ElementUIPlugin);
  vue.use(SoramitsuUIStorePlugin, { store });
  vue.directive(Directives.Button, Button);
  vue.use(SButton);
  vue.use(SCard);
  vue.use(SDatePicker);
  vue.use(SDesignSystemProvider);
  vue.use(SDialog);
  vue.use(SDivider);
  vue.use(SDropdown);
  vue.use(SDropdownItem);
  vue.use(SIcon);
  vue.use(SInput);
  vue.use(SImage);
  vue.use(SFloatInput);
  vue.use(SForm);
  vue.use(SFormItem);
  vue.use(SOption);
  vue.use(SPagination);
  vue.use(SRadio);
  vue.use(SRadioGroup);
  vue.use(SScrollbar);
  vue.use(SSelect);
  vue.use(SSwitch);
  vue.use(STab);
  vue.use(STabs);
  vue.use(STooltip);
  vue.prototype.$prompt = MessageBox.prompt;
  vue.prototype.$alert = MessageBox.alert;
  vue.prototype.$message = Message;
  vue.prototype.$notify = ({ message, type }) => {
    Notification({
      message,
      title: '',
      duration: 4500, // If is will be changed you should change animation duration as well
      type,
      customClass: 'sora s-flex',
    });
    const el = document.createElement('div');
    el.className = 'loader';
    const elements = Array.from(document.getElementsByClassName('el-notification'));
    elements[elements.length - 1].appendChild(el);
  };

  setTheme();
  setDesignSystem(DesignSystem.NEUMORPHIC);
}
