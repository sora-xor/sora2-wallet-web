import { WcProvider, type ChainId } from './base';

import type { EngineTypes } from '@walletconnect/types';

const namespace = 'eip155';

const methods = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_accounts',
  'eth_requestAccounts',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_watchAsset',
];

const events = ['chainChanged', 'accountsChanged', 'disconnect', 'connect'];

export class WcEvmProvider extends WcProvider {
  protected override table = namespace;

  protected override getConnectParams(requiredChains: ChainId[], optionalChains: ChainId[]): EngineTypes.ConnectParams {
    const params: EngineTypes.ConnectParams = {};

    if (requiredChains.length) {
      const chains = requiredChains.map((chainId) => this.formatChainId(chainId));
      Object.assign(params, {
        requiredNamespaces: {
          [namespace]: {
            methods,
            chains,
            events,
            rpcMap: this.getRpcMap(requiredChains),
          },
        },
      });
    }

    if (optionalChains.length) {
      const chains = optionalChains.map((chainId) => this.formatChainId(chainId));
      Object.assign(params, {
        optionalNamespaces: {
          [namespace]: {
            methods,
            chains,
            events,
            rpcMap: this.getRpcMap(optionalChains),
          },
        },
      });
    }

    return params;
  }

  protected override formatChainId(chainId: ChainId): string {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    return `${namespace}:${chainId}`;
  }

  protected getRpcMap(chainIds: ChainId[]): Record<number, string> {
    return chainIds.reduce((acc, chainId) => {
      const key = Number(chainId);
      const id = this.formatChainId(chainId);
      acc[key] = `https://rpc.walletconnect.com?chainId=${id}&projectId=${WcProvider.projectId}`;
      return acc;
    }, {});
  }
}
