import { createClient, defaultExchanges, subscriptionExchange } from '@urql/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import type { Client } from '@urql/core';

export type { Client, OperationResult, TypedDocumentNode, AnyVariables } from '@urql/core';
export type { ResultOf } from '@graphql-typed-document-node/core';

// https://github.com/apollographql/subscriptions-transport-ws/blob/51270cc7dbaf09c7b9aa67368f1de58148c7d334/README.md#constructorurl-options-websocketimpl
const createSubscriptionClient = (url: string) => {
  const wsUrl = url.replace(/^http/, 'ws');

  return new SubscriptionClient(wsUrl, {
    minTimeout: 6000, // the minimum amount of time the client should wait for a connection to be made (default 1000 ms)
    lazy: true, // connects only when first subscription created, and delay the socket initialization
    reconnect: true, // automatic reconnect in case of connection error
    reconnectionAttempts: 25,
  });
};

// https://formidable.com/open-source/urql/docs/advanced/subscriptions/#setting-up-subscriptions-transport-ws
const createSubscriptionExchange = (subscriptionClient: SubscriptionClient) => {
  return subscriptionExchange({
    forwardSubscription: (operation) => subscriptionClient.request(operation),
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
