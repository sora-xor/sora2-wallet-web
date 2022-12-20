import { BaseModule } from './_base';

import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';

import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';

import { AssetSnapshotTypes } from '../../types';

import type { AssetEntity, FiatPriceObject } from '../../types';

export class PriceModule extends BaseModule {
  public parseFiatPrice(entity: AssetEntity): FiatPriceObject {
    console.log(this);
    const acc = {};
    const id = entity.id;
    const priceFPNumber = this.formatStringNumber(entity.priceUSD || entity.price_u_s_d);
    const isPriceFinity = priceFPNumber.isFinity();
    if (isPriceFinity) {
      acc[id] = priceFPNumber.toCodecString();
    }
    return acc;
  }

  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.fetchAndParseEntities(FiatPriceQuery, this.parseFiatPrice.bind(this));

    return result;
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const createSubscription = this.root.subscribe(FiatPriceSubscription, {});

    return createSubscription((payload) => {
      try {
        if (payload.data) {
          const entity = this.parseFiatPrice(payload.data.assets._entity);
          handler(entity);
        } else {
          errorHandler();
        }
      } catch (error) {
        errorHandler();
      }
    });
  }

  /**
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = AssetSnapshotTypes.DEFAULT,
    first?: number,
    after?: string
  ) {
    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const response = await this.fetchEntities(HistoricalPriceQuery, variables);

    return response;
  }
}
