export const FiatPriceQuery = `
query PoolXYKEntities (
  $first: Int = 1,
  $orderBy: [PoolXykEntitiesOrderBy!] = UPDATED_DESC)
{
  poolXYKEntities (
    first: $first
    orderBy: $orderBy
  )
  {
    nodes {
      pools {
        edges {
          node {
            targetAssetId,
            priceUSD,
            strategicBonusApy
          }
        }
      }
    }
  }
}
`;
