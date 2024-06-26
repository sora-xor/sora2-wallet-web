import type { WcSubstrateProvider } from '../provider/substrate';
import type { Signer, SignerPayloadJSON, SignerResult } from '@polkadot/types/types';

export default class WcSigner implements Signer {
  private wcProvider!: WcSubstrateProvider;
  /** need by WC spec */
  private txId = 0;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
  }

  /** Signs an extrinsic payload from a serialized form */
  async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const signature = await this.wcProvider.signTransactionPayload(payload);

    return {
      id: this.txId++,
      signature,
    };
  }
}
