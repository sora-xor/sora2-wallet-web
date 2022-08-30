import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import type { Client } from '@urql/core';

export type { Client, OperationResult, TypedDocumentNode } from '@urql/core';

export type { ResultOf } from '@graphql-typed-document-node/core';

const createSubscriptionClient = (url: string) => {
  const wsUrl = url.replace(/^http/, 'ws');

  return new SubscriptionClient(wsUrl, {
    minTimeout: 6000, // the minimum amount of time the client should wait for a connection to be made (default 1000 ms)
    lazy: true, // connects only when first subscription created, and delay the socket initialization
    reconnect: true, // automatic reconnect in case of connection error
  });
};

const createSubscriptionExchange = (subscriptionClient) => {
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
    requestPolicy: 'network-only',
  });

  return client;
};
