import { formatAccountAddress } from '../../../util';

import { WcProvider, type ChainId } from './base';

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { EngineTypes } from '@walletconnect/types';

const namespace = 'polkadot';

const methods = ['polkadot_signTransaction'];

const events = ['accountsChanged'];

export class WcSubProvider extends WcProvider {
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
          },
        },
      });
    }

    return params;
  }

  protected override formatChainId(chainId: ChainId): string {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    return `${namespace}:${String(chainId).slice(2, 34)}`;
  }

  public override getAccounts(): string[] {
    const accounts = super.getAccounts();
    const uniqueAccounts = [...new Set(accounts.map((acc) => formatAccountAddress(acc, false)))];

    return uniqueAccounts;
  }

  public override async signTransaction(payload: SignerPayloadJSON): Promise<HexString> {
    try {
      const params = {
        method: 'polkadot_signTransaction',
        params: {
          address: payload.address,
          transactionPayload: payload,
        },
      };

      const result = await this.request<{ signature: HexString }>(params);

      return result.signature;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

// const PossibleChains = [
//   '0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5', // SORA
//   '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3', // Polkadot
//   '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c', // Acala
//   '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6', // Astar
//   '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe', // Kusama
//   '0x6bd89e052d67a45bb60a9a23e8581053d5e0d619f15cb9865946937e690c42d6', // Liberland
// ];
