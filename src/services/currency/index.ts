import { interval } from 'rxjs';

import { API_ENDPOINT } from '../../consts/currencies';
import store from '../../store';
import { Currency, type FiatExchangeRateObject } from '../../types/currency';

const exchangeRateUpdateInterval = interval(60_000);

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
    store.commit.wallet.settings.updateFiatExchangeRates({ [Currency.USD]: 1 });
    store.commit.wallet.settings.setFiatCurrency(Currency.USD);
  }
}
