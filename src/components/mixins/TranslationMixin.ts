import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Vue, Component } from 'vue-property-decorator';

import { TranslationConsts } from '../../consts';

// enable dayjs plugin
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

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

  get dayjsLocale(): string {
    const locale = this.$i18n.locale.toLowerCase();
    // We have only dialect of hy lang
    switch (locale) {
      case 'hy':
        return 'hy-am';
      default:
        return locale;
    }
  }

  getRelativeTime(date: number): string {
    let startTime, endTime;
    const currentTime = Date.now();

    if (date < currentTime) {
      startTime = date;
      endTime = currentTime;
    } else {
      startTime = currentTime;
      endTime = date;
    }

    return startTime < endTime
      ? dayjs().to(dayjs(date).locale(this.dayjsLocale))
      : dayjs().from(dayjs(date).locale(this.dayjsLocale));
  }

  formatDate(date: Nullable<number>, format = 'll LTS'): string {
    return dayjs(date).locale(this.dayjsLocale).format(format);
  }

  private getValues(values?: any): object {
    return { ...(values || {}), ...this.TranslationConsts };
  }
}
