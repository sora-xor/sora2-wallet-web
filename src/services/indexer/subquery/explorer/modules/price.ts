import { formatStringNumber } from '../../../../../util';
import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';
import { AssetSnapshotEntity, ConnectionQueryResponseData, SnapshotTypes } from '../../types';

import { SubqueryBaseModule } from './_base';

import type { SubqueryAssetEntity, SubqueryAssetEntityMutation, FiatPriceObject } from '../../types';

function parseFiatPrice(entity: SubqueryAssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

function parseFiatPriceUpdate(entity: SubqueryAssetEntityMutation): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.price_u_s_d);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export class SubqueryPriceModule extends SubqueryBaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntities(FiatPriceQuery, {}, parseFiatPrice);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    return this.root.createEntitySubscription(FiatPriceSubscription, {}, parseFiatPriceUpdate, handler, errorHandler);
  }

  /**
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = SnapshotTypes.DEFAULT,
    first?: number,
    after?: string
  ): Promise<Nullable<ConnectionQueryResponseData<AssetSnapshotEntity>>> {
    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const data = await this.root.fetchEntities(HistoricalPriceQuery, variables);

    return data;
  }
}