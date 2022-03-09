export const FiatPriceQuery = `
query PoolXYKEntities (
  $first: Int = 1,
  $orderBy: [PoolXykEntitiesOrderBy!] = UPDATED_DESC
  $filter: PoolXYKEntityFilter
  $poolsAfter: Cursor = ""
  $poolsFirst: Int = 100)
{
  poolXYKEntities (
    first: $first
    orderBy: $orderBy
    filter: $filter
  )
  {
    nodes {
      id
      pools (
        first: $poolsFirst
        after: $poolsAfter
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
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

export const poolXykEntityFilter = (poolXykEntityId?: string) => {
  if (!poolXykEntityId) return undefined;

  return {
    id: {
      equalTo: poolXykEntityId,
    },
  };
};
