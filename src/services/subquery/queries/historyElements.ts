export const HistoryElementsQuery = `
query HistoryElements (
  $address: String = "",
  $first: Int = null,
  $last: Int = null,
  $after: Cursor  = "",
  $before: Cursor  = "",
  $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC)
{
  historyElements (
    first: $first
    last: $last
    before: $before
    after: $after
    orderBy: $orderBy
    filter: {
      and: [
        {
          address: {
            equalTo: $address
          }
        }
        {
          method: {
            in: ["swap", "transfer", "depositLiquidity", "withdrawLiquidity"]
          }
        }
      ]
    }
  )
  {
    totalCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
    edges {
      cursor 
      node {
        id
        blockHeight
        module
        method
        address
        networkFee
        success
        timestamp
        swap
        transfer
        irohaMigration
        liquidityOperation
      }
    }
  }
}
`
