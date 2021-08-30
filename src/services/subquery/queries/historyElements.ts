export const HistoryElementsQuery = `
query HistoryElements (
  $address: String = "",
  $first: Int = 5,
  $after: Cursor  = "",
  $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC)
{
  historyElements (
    first: $first
    after: $after
    orderBy: $orderBy
    filter: {
      or: [
        {
          address: {
            equalTo: $address
          }
        }
        {
          transfer: {
            contains: {
              to: $address
            }
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
