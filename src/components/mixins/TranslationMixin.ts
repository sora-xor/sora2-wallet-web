import { Vue, Component } from 'vue-property-decorator';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// enable dayjs plugin
dayjs.extend(localizedFormat);

@Component
export default class TranslationMixin extends Vue {
  t(key: string, values?: any): string {
    return this.$root.$t(key, values) as string;
  }

  tc(key: string, choice?: number, values?: any): string {
    return this.$root.$tc(key, choice, values);
  }

  te(key: string): boolean {
    return this.$root.$te(key);
  }

  formatDate(date: Nullable<number>, format = 'll LTS'): string {
    return dayjs(date).locale(this.$i18n.locale).format(format);
  }
}
