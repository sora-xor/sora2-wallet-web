import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { createClient as createWSClient } from 'graphql-ws';

import type { Client } from '@urql/core';

export type { Client, OperationResult, TypedDocumentNode, AnyVariables } from '@urql/core';

const createSubscriptionClient = (url: string) => {
  const wsUrl = url.replace(/^http/, 'ws');

  return createWSClient({
    url: wsUrl,
    lazy: true,
    retryAttempts: 25,
  });
};

const createSubscriptionExchange = (subscriptionClient: ReturnType<typeof createWSClient>) => {
  return subscriptionExchange({
    forwardSubscription: (operation) => {
      return {
        subscribe: (sink) => {
          const dispose = subscriptionClient.subscribe(operation, sink);
          return {
            unsubscribe: dispose,
          };
        },
      };
    },
  });
};

export const createExplorerClient = (url: string, subscriptions = false): Client => {
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
