export const ChartsFiatPriceQuery = `
query PoolXYKEntities (
  $first: Int = 100
  $filter: PoolXYKEntityFilter
)
{
  poolXYKEntities (
    first: $first
    filter: $filter
  )
  {
    nodes {
      id
      pools {
        nodes {
          targetAssetId,
          priceUSD,
          strategicBonusApy
        }
      }
    }
  }
}
`;

export const chartsPoolXykEntityFilter = (poolXykEntityId?: string, assetId?: string) => {
  if (!poolXykEntityId || !assetId) return undefined;

  return {
    id: {
      equalTo: poolXykEntityId,
    },
    targetAssetId: {
      equalTo: assetId,
    },
  };
};
