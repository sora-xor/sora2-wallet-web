import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Vue, Component } from 'vue-property-decorator';

import { TranslationConsts, TranslationConsts } from '../../consts';

// enable dayjs plugin
dayjs.extend(localizedFormat);

@Component
export default class TranslationMixin extends Vue {
  /**
   * Contains wallet-specific words which shouldn't be translated.
   *
   * Will be extended in Polkaswap
   */
  readonly TranslationConsts = TranslationConsts;

  t(key: string, values?: any): string {
    return this.$root.$t(key, this.getValues(values)) as string;
  }

  tc(key: string, choice?: number, values?: any): string {
    return this.$root.$tc(key, choice, this.getValues(values));
  }

  te(key: string): boolean {
    return this.$root.$te(key);
  }

  formatDate(date: Nullable<number>, format = 'll LTS'): string {
    let locale = this.$i18n.locale.toLowerCase();
    // We have only dialect of hy lang
    switch (locale) {
      case 'hy':
        locale = 'hy-am';
        break;
    }
    return dayjs(date).locale(locale).format(format);
  }

  private getValues(values?: any): object {
    return { ...(values || {}), ...this.TranslationConsts };
  }
}
