export const HistoryElementsQuery = `
query HistoryElements (
  $first: Int = null,
  $last: Int = null,
  $after: Cursor = "",
  $before: Cursor = "",
  $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC,
  $filter: HistoryElementFilter)
{
  historyElements (
    first: $first
    last: $last
    before: $before
    after: $after
    orderBy: $orderBy
    filter: $filter
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

const createAsssetFilters = (assetAddress: string): Array<any> =>
  ['swap', 'transfer', 'liquidityOperation'].reduce<any[]>((result, method) => {
    const attributes = method === 'transfer' ? ['assetId'] : ['baseAssetId', 'targetAssetId']
    attributes.forEach(attr => {
      result.push({
        [method]: {
          contains: {
            [attr]: assetAddress
          }
        }
      })
    })
    return result
  }, [])

const createQueryFilters = (query: string): Array<any> => {
  const isAssetAddress = (query: string) => query.startsWith('0x') && query.length === 66
  const isAccountAddress = (query: string) => query.startsWith('cn') && query.length === 49

  const queryFilters: any = []

  if (isAccountAddress(query)) {
    queryFilters.push(
      {
        transfer: {
          contains: {
            from: query
          }
        }
      },
      {
        transfer: {
          contains: {
            to: query
          }
        }
      }
    )
  }

  if (isAssetAddress(query)) {
    queryFilters.push(...createAsssetFilters(query))
  }

  return queryFilters
}

export const historyElementsFilter = (address: string, { assetAddress = '', query = '' }): any => {
  const filter: any = {
    and: [
      {
        address: {
          equalTo: address
        }
      },
      {
        method: {
          in: ['swap', 'transfer', 'depositLiquidity', 'withdrawLiquidity']
        }
      }
    ]
  }

  if (assetAddress) {
    filter.and.push({
      or: createAsssetFilters(assetAddress)
    })
  }

  if (query) {
    filter.and.push({
      or: createQueryFilters(query)
    })
  }

  return filter
}
