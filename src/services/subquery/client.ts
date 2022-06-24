import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import type { Client } from '@urql/core';

export type { Client } from '@urql/core';

export const createSubqueryClient = (url: string): Client => {
  const wsUrl = url.replace(/^http/, 'ws');

  const wsClient = new SubscriptionClient(wsUrl, { reconnect: true });

  const client = createClient({
    url,
    exchanges: [
      ...defaultExchanges,
      subscriptionExchange({
        forwardSubscription: (operation) => wsClient.request(operation),
      }),
    ],
  });

  return client;
};
