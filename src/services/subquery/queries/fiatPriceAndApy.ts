export const FiatPriceQuery = `
query PoolXYKEntities (
  $last: Int = 1)
{
  poolXYKEntities (
    last: $last
  )
  {
    nodes {
      pools {
        edges {
          node {
            targetAssetId,
            baseAssetReserves,
            targetAssetReserves,
            priceUSD,
            apy
          }
        }
      }
    }
  }
}
`
