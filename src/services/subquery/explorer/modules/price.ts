import { BaseModule } from './_base';

import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';

import { AssetSnapshotTypes } from '../../types';

import { formatStringNumber } from '../../../../util';

import type { AssetEntity, FiatPriceObject } from '../../types';

function parseFiatPrice(entity: AssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD || entity.price_u_s_d);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export class PriceModule extends BaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    return await this.fetchAndParseEntities(parseFiatPrice, FiatPriceQuery);
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    return this.createEntitySubscription(FiatPriceSubscription, {}, parseFiatPrice, handler, errorHandler);
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
