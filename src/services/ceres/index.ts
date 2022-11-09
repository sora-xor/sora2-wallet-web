import isEmpty from 'lodash/fp/isEmpty';
import { FPNumber } from '@sora-substrate/util';
import { interval } from 'rxjs';

import type { FiatPriceAndApyObject } from '../subquery/types';

const ceresUpdateInterval = interval(30_000);

export class CeresApiService {
  public static async getFiatPriceObject(): Promise<Nullable<FiatPriceAndApyObject>> {
    try {
      const cerestokenApi = await fetch('https://cerestoken.io/api/pairs');
      const data = await cerestokenApi.json();
      const cerestokenApiObj = (data as Array<any>).reduce<FiatPriceAndApyObject>((acc, item) => {
        if (+item.price) {
          acc[item.asset_id] = {
            price: new FPNumber(item.price).toCodecString(),
          };
        }
        return acc;
      }, {});
      if (isEmpty(cerestokenApiObj)) {
        return null;
      }
      return cerestokenApiObj;
    } catch (error) {
      console.warn('CERES API not available!', error);
      return null;
    }
  }

  public static createFiatPriceSubscription(
    handler: (entity?: FiatPriceAndApyObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const { unsubscribe } = ceresUpdateInterval.subscribe(async () => {
      const data = await CeresApiService.getFiatPriceObject();
      if (!data) {
        errorHandler();
      } else {
        handler(data);
      }
    });

    return unsubscribe;
  }
}
