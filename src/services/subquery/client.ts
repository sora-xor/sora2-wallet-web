import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import type { Client } from '@urql/core';

export type { Client } from '@urql/core';

const createSubscriptionClient = (url: string): SubscriptionClient => {
  const wsUrl = url.replace(/^http/, 'ws');

  return new SubscriptionClient(wsUrl, { reconnect: true });
};

const createSubscriptionExchange = (subscriptionClient: SubscriptionClient) => {
  return subscriptionExchange({
    forwardSubscription: (operation) => subscriptionClient.request(operation),
  });
};

export const createSubqueryClient = (url: string, subscriptions = false): Client => {
  const exchanges = [...defaultExchanges];

  if (subscriptions) {
    const subscriptionClient = createSubscriptionClient(url);
    const subscriptionExchange = createSubscriptionExchange(subscriptionClient);
    exchanges.push(subscriptionExchange);
  }

  const client = createClient({
    url,
    exchanges,
  });

  return client;
};
