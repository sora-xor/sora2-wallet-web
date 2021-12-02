export const FiatPriceQuery = `
query PoolXYKEntities (
  $first: Int = 1)
{
  poolXYKEntities (
    first: $first
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
