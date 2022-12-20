import { FPNumber } from '@sora-substrate/math';

import { ApyQuery } from '../../queries/fiatPriceAndApy';

import type SubqueryExplorer from '../index';
import type { PoolXYKEntity, PoolApyObject } from '../../types';

const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

export class PoolModule {
  private readonly root!: SubqueryExplorer;

  constructor(root: SubqueryExplorer) {
    this.root = root;
  }

  /**
   * Fetch apy from poolXYKs
   * @param after cursor of last element
   */
  public async fetchApy(
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: PoolXYKEntity[] }>> {
    try {
      const params = { after };

      const response = await this.root.request(ApyQuery, params);

      if (!response || !response.poolXYKs) return null;

      const {
        pageInfo: { hasNextPage, endCursor },
        nodes,
      } = response.poolXYKs;

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      return null;
    }
  }

  public parseApy(entity: PoolXYKEntity): PoolApyObject {
    const acc = {};
    const id = entity.id;
    const strategicBonusApyFPNumber = format(entity.strategicBonusApy || entity.strategic_bonus_apy);
    const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
    if (isStrategicBonusApyFinity) {
      acc[id] = strategicBonusApyFPNumber.toCodecString();
    }
    return acc;
  }
}
