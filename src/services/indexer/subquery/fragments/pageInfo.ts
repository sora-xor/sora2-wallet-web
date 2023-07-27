import { gql } from '@urql/core';

import type { SubqueryPageInfo } from '../types';

export const PageInfoFragment = gql<SubqueryPageInfo>`
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;
