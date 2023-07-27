import { formatStringNumber } from '../../../../../util';
import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';
import { AssetSnapshotEntity, ConnectionQueryResponseData, SnapshotTypes } from '../../types';

import { BaseModule } from './_base';

import type { SubsquidAssetEntity, FiatPriceObject } from '../../types';

function parseFiatPrice(entity: SubsquidAssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export class SubsquidPriceModule extends BaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntitiesConnection(FiatPriceQuery, {}, parseFiatPrice);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    return this.root.createEntitySubscription(FiatPriceSubscription, {}, parseFiatPrice, handler, errorHandler);
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
    after?: string | null
  ): Promise<Nullable<ConnectionQueryResponseData<AssetSnapshotEntity>>> {
    if (after === '') {
      after = null;
    }

    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const data = await this.root.fetchEntitiesConnection(HistoricalPriceQuery, variables);

    if (data) {
      return {
        ...data,
        edges: data.edges.map((edge) => {
          return {
            ...edge,
            node: {
              ...edge.node,
              assetId: edge.node.asset.id,
            },
          };
        }),
      };
    }

    return data;
  }
}
