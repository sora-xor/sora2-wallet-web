import { formatAccountAddress } from '../../../util';

import { WcProvider, type ChainId } from './base';

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { EngineTypes } from '@walletconnect/types';

// const PossibleChains = [
//   '0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5', // SORA
//   '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3', // Polkadot
//   '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c', // Acala
//   '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6', // Astar
//   '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe', // Kusama
//   '0x6bd89e052d67a45bb60a9a23e8581053d5e0d619f15cb9865946937e690c42d6', // Liberland
// ];

export class WcSubstrateProvider extends WcProvider {
  protected override getConnectParams(chains: string[], optionalChains: string[]): EngineTypes.ConnectParams {
    const methods = ['polkadot_signTransaction'];
    const events = ['accountsChanged'];

    const params: EngineTypes.ConnectParams = {};

    if (chains.length) {
      Object.assign(params, {
        requiredNamespaces: {
          polkadot: {
            methods,
            chains: chains.map((chainId) => this.getChainCaip13(chainId)),
            events,
          },
        },
      });
    }

    if (optionalChains.length) {
      Object.assign(params, {
        optionalNamespaces: {
          polkadot: {
            methods,
            chains: optionalChains.map((chainId) => this.getChainCaip13(chainId)),
            events,
          },
        },
      });
    }

    return params;
  }

  protected getChainCaip13(chainId: ChainId, namespace = 'polkadot'): string {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    return `${namespace}:${String(chainId).slice(2, 34)}`;
  }

  public getAccounts(): string[] {
    const session = this.getCurrentSession();

    // Get the accounts from the session for use in constructing transactions.
    const walletConnectAccount = Object.values(session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    // grab account addresses from CAIP account formatted accounts
    const accounts = walletConnectAccount.map((wcAccount) => {
      const address = wcAccount.split(':')[2];

      return formatAccountAddress(address, false);
    });

    const uniqueAccounts = [...new Set(accounts)];

    return uniqueAccounts;
  }

  public async signTransactionPayload(payload: SignerPayloadJSON): Promise<HexString> {
    try {
      const session = this.getCurrentSession();
      const chainId = this.getChainCaip13(this.chains[0]);

      const result = (await this.provider.client.request({
        chainId,
        topic: session.topic,
        request: {
          method: 'polkadot_signTransaction',
          params: {
            address: payload.address,
            transactionPayload: payload,
          },
        },
      })) as any;

      return result.signature as HexString;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
