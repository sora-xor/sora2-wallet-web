import Vue from 'vue';

// IMPORTANT!
// Add import url to rollup.external !
import DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';
import { setTheme, setDesignSystem } from '@soramitsu/soramitsu-js-ui/lib/utils';

import ElementUIPlugin, { Message, MessageBox, Notification } from '@soramitsu/soramitsu-js-ui/lib/plugins/elementUI';
import SoramitsuUIStorePlugin from '@soramitsu/soramitsu-js-ui/lib/plugins/soramitsuUIStore';

import SButton from '@soramitsu/soramitsu-js-ui/lib/components/Button/SButton';
import SCard from '@soramitsu/soramitsu-js-ui/lib/components/Card/SCard';
import SDesignSystemProvider from '@soramitsu/soramitsu-js-ui/lib/components/DesignSystem/SDesignSystemProvider';
import SDialog from '@soramitsu/soramitsu-js-ui/lib/components/Dialog';
import SDivider from '@soramitsu/soramitsu-js-ui/lib/components/Divider/SDivider';
import SDropdown from '@soramitsu/soramitsu-js-ui/lib/components/Dropdown/SDropdown';
import SDropdownItem from '@soramitsu/soramitsu-js-ui/lib/components/Dropdown/SDropdownItem';
import SIcon from '@soramitsu/soramitsu-js-ui/lib/components/Icon/SIcon';
import SInput from '@soramitsu/soramitsu-js-ui/lib/components/Input/SInput';
import SImage from '@soramitsu/soramitsu-js-ui/lib/components/Image/SImage';
import SFloatInput from '@soramitsu/soramitsu-js-ui/lib/components/Input/SFloatInput';
import SForm from '@soramitsu/soramitsu-js-ui/lib/components/Form/SForm';
import SFormItem from '@soramitsu/soramitsu-js-ui/lib/components/Form/SFormItem';
import SPagination from '@soramitsu/soramitsu-js-ui/lib/components/Pagination';
import SRadio from '@soramitsu/soramitsu-js-ui/lib/components/Radio/SRadio';
import SRadioGroup from '@soramitsu/soramitsu-js-ui/lib/components/Radio/SRadioGroup';
import SScrollbar from '@soramitsu/soramitsu-js-ui/lib/components/Scrollbar';
import SSwitch from '@soramitsu/soramitsu-js-ui/lib/components/Switch';
import STab from '@soramitsu/soramitsu-js-ui/lib/components/Tab/STab';
import STabs from '@soramitsu/soramitsu-js-ui/lib/components/Tab/STabs';
import STooltip from '@soramitsu/soramitsu-js-ui/lib/components/Tooltip';

export function install(vue: typeof Vue, store) {
  vue.use(ElementUIPlugin);
  vue.use(SoramitsuUIStorePlugin, { store });
  vue.use(SButton);
  vue.use(SCard);
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
  vue.use(SPagination);
  vue.use(SRadio);
  vue.use(SRadioGroup);
  vue.use(SScrollbar);
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
