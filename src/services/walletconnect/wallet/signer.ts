import type { WcSubstrateProvider } from '../provider';
import type { Signer, SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';

export default class WcSigner implements Signer {
  private wcProvider!: WcSubstrateProvider;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
  }

  /** Signs an extrinsic payload from a serialized form */
  async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    console.log('signPayload', payload);

    throw new Error('signPayload is not implemented');

    // return {
    //   id: 0,
    //   signature: '0x',
    // }
  }

  /** Signs a raw payload, only the bytes data as supplied */
  async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    console.log('signRaw', raw);

    throw new Error('signRaw is not implemented');

    // return {
    //   id: 0,
    //   signature: '0x',
    // }
  }
}
