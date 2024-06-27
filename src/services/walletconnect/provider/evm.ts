import { WcProvider, type ChainId } from './base';

import type { EngineTypes } from '@walletconnect/types';

const namespace = 'eip155';

const methods = [
  'personal_sign',
  'eth_sendTransaction',
  'eth_accounts',
  'eth_requestAccounts',
  'eth_call',
  'eth_getBalance',
  'eth_sendRawTransaction',
  'eth_sign',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_registerOnboarding',
  'wallet_watchAsset',
  'wallet_scanQRCode',
  'wallet_sendCalls',
  'wallet_getCapabilities',
  'wallet_getCallsStatus',
  'wallet_showCallsStatus',
  'eth_chainId',
  'eth_blockNumber',
  'eth_gasPrice',
];

const events = ['accountsChanged', 'chainChanged', 'message', 'disconnect', 'connect'];

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
