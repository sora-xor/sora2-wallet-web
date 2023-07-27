import { formatStringNumber } from '../../../../util';
import { ApyQuery } from '../../queries/fiatPriceAndApy';
import { PoolsApySubscription } from '../../subscriptions/fiatPriceAndApy';

import { BaseModule } from './_base';

import type { PoolXYKEntity, PoolApyObject } from '../../types';

function parseApy(entity: PoolXYKEntity): PoolApyObject {
  const acc = {};
  const id = entity.id;
  const strategicBonusApyFPNumber = formatStringNumber(entity.strategicBonusApy);
  const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
  if (isStrategicBonusApyFinity) {
    acc[id] = strategicBonusApyFPNumber.toCodecString();
  }
  return acc;
}

export class PoolModule extends BaseModule {
  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.root.fetchAllEntitiesConnection(ApyQuery, {}, parseApy);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createPoolsApySubscription(handler: (entity: PoolApyObject) => void, errorHandler: () => void): VoidFunction {
    return this.root.createEntitySubscription(PoolsApySubscription, {}, parseApy, handler, errorHandler);
  }
}
