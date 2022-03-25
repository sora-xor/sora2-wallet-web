export const HistoricalPriceQuery = `
query PoolXYKEntities (
  $orderBy: [PoolXykEntitiesOrderBy!] = UPDATED_DESC
  $assetId: String = ""
  $first: Int = null
)
{
  poolXYKEntities (
    orderBy: $orderBy,
    first: $first
  )
  {
    nodes {
      pools(
        filter: { targetAssetId: { equalTo: $assetId } }
      ) {
        nodes {
          priceUSD,
          updated
        }
      }
    }
  }
}
`;
