import { Vue, Options } from 'vue-property-decorator';

import { translationUtils } from '@/composables/useTranslation';

import { TranslationConsts } from '../../consts';

@Options({})
export default class TranslationMixin extends Vue {
  private translationApi = translationUtils();

  /**
   * Contains wallet-specific words which shouldn't be translated.
   *
   * Will be extended in Polkaswap
   */
  readonly TranslationConsts = TranslationConsts;

  t(key: string, values?: Record<string, unknown>): string {
    return this.translationApi.t(key, values);
  }

  tc(key: string, choice?: number, values?: Record<string, unknown>): string {
    return this.translationApi.tc(key, choice, values);
  }

  te(key: string): boolean {
    return this.translationApi.te(key);
  }

  get dayjsLocale(): string {
    return this.translationApi.getDayjsLocale();
  }

  formatDate(date: Nullable<number>, format = 'll LTS'): string {
    return this.translationApi.formatDate(date, format);
  }
}
