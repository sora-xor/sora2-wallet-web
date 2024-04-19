import { Notification } from '@soramitsu-ui/ui-vue2/lib/plugins/elementUI';
import { timer } from 'rxjs';

import { API_ENDPOINT } from '../../consts/currencies';
import store from '../../store';
import { Currency, type FiatExchangeRateObject } from '../../types/currency';

const exchangeRateUpdateInterval = timer(0, 60_000);

export class CurrencyExchangeRateService {
  public static readonly apiEndpoint = API_ENDPOINT;

  public static async getExchangeRateObject(): Promise<Nullable<FiatExchangeRateObject>> {
    try {
      const exchangeRatesApi = await fetch(CurrencyExchangeRateService.apiEndpoint, { cache: 'no-store' });
      const data = await exchangeRatesApi.json();
      return data?.dai;
    } catch (error) {
      this.resetData(error as Error);
      return null;
    }
  }

  public static createExchangeRatesSubscription(
    handler: (entity?: FiatExchangeRateObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const subscription = exchangeRateUpdateInterval.subscribe(async () => {
      const data = await CurrencyExchangeRateService.getExchangeRateObject();
      if (!data) {
        this.resetData();
        errorHandler();
      } else {
        handler(data);
      }
    });

    return () => {
      console.info(`[Exchange rate API] Currency rates unsubscribe.`);
      subscription.unsubscribe();
    };
  }

  static resetData(error?: Error): void {
    console.warn('[Exchange rate API] not available. Now using default option', error);
    Notification({
      message: 'Switched to DAI fiat pricing.',
      type: 'error',
      duration: 4500,
      customClass: 'sora s-flex',
    });
    store.commit.wallet.settings.updateFiatExchangeRates({ [Currency.DAI]: 1 });
    store.commit.wallet.settings.setFiatCurrency(Currency.DAI);
  }
}
