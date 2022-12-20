import { BaseModule } from './_base';

import { ApyQuery } from '../../queries/fiatPriceAndApy';

import { PoolsApySubscription } from '../../subscriptions/fiatPriceAndApy';

import type { PoolXYKEntity, PoolApyObject } from '../../types';

export class PoolModule extends BaseModule {
  public parseApy(entity: PoolXYKEntity): PoolApyObject {
    const acc = {};
    const id = entity.id;
    const strategicBonusApyFPNumber = this.formatStringNumber(entity.strategicBonusApy || entity.strategic_bonus_apy);
    const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
    if (isStrategicBonusApyFinity) {
      acc[id] = strategicBonusApyFPNumber.toCodecString();
    }
    return acc;
  }

  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.fetchAndParseEntities(ApyQuery, this.parseApy.bind(this));

    return result;
  }

  public createPoolsApySubscription(handler: (entity: PoolApyObject) => void, errorHandler: () => void): VoidFunction {
    const createSubscription = this.root.subscribe(PoolsApySubscription, {});

    return createSubscription((payload) => {
      try {
        if (payload.data) {
          const entity = this.parseApy(payload.data.poolXYKs._entity);
          handler(entity);
        } else {
          errorHandler();
        }
      } catch (error) {
        errorHandler();
      }
    });
  }
}
