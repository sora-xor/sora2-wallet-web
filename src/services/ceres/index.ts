import isEmpty from 'lodash/fp/isEmpty';
import { interval } from 'rxjs';
import { FPNumber } from '@sora-substrate/util';
import { DAI } from '@sora-substrate/util/build/assets/consts';

import type { FiatPriceObject } from '../subquery/types';

const ceresUpdateInterval = interval(60_000);

export class CeresApiService {
  public static async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    try {
      const cerestokenApi = await fetch('https://cerestoken.io/api/pairs', { cache: 'no-store' });
      const data = await cerestokenApi.json();
      const cerestokenApiObj = (data as Array<any>).reduce<FiatPriceObject>((acc, item) => {
        if (+item.price) {
          acc[item.asset_id] = new FPNumber(item.price).toCodecString();
        }
        return acc;
      }, {});
      if (isEmpty(cerestokenApiObj)) {
        return null;
      }
      if (!cerestokenApiObj[DAI.address]) {
        cerestokenApiObj[DAI.address] = FPNumber.ONE.toCodecString();
      }
      return cerestokenApiObj;
    } catch (error) {
      console.warn('CERES API not available!', error);
      return null;
    }
  }

  public static createFiatPriceSubscription(
    handler: (entity?: FiatPriceObject) => void,
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
