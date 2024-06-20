import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';

import type { SessionTypes, EngineTypes } from '@walletconnect/types';

// await signClient.emit({
//   topic,
//   event: {
//     name: 'accountsChanged',
//     data: ['AZBEwbZhYeiofodZnM2iAoshP3pXRPNSJEKFqEPDmvv1mY7']
//   },
//   chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
// })

export class WcSubstrateProvider {
  /** WalletConnect app projectId */
  public static projectId = '';
  /** Chain genesis hash: `api.genesisHash.toString()` */
  protected chainId!: string;

  private ready = false;

  public provider!: UniversalProvider;
  public modal!: WalletConnectModal;
  public session!: SessionTypes.Struct | undefined;

  constructor(chainId: string) {
    this.chainId = chainId;
  }

  public async init(): Promise<void> {
    if (this.ready) return;

    if (!WcSubstrateProvider.projectId) throw new Error(`[${this.constructor.name}]: projectId is required`);

    // Instantiate a universal provider using the projectId created for your app.
    this.provider = await UniversalProvider.init({
      projectId: WcSubstrateProvider.projectId,
      relayUrl: 'wss://relay.walletconnect.com',
    });

    // Create a standalone modal using your dapps WalletConnect projectId.
    this.modal = new WalletConnectModal({
      projectId: WcSubstrateProvider.projectId,
    });

    this.ready = true;
  }

  /**
   * On user action (e.g. user clicks connect for WalletConnect),
   * call the connect method on the providers sign client passing in preferred params.
   */
  public async connect(): Promise<void> {
    try {
      // already connected
      if (this.session) return;

      if (!this.chainId) throw new Error(`[${this.constructor.name}] chainId is not defined`);

      const params = WcSubstrateProvider.getChainParams(this.chainId);

      const { uri, approval } = await this.provider.client.connect(params);

      // Open the modal prompting the user to scan the QR code with their wallet app.
      // if there is a URI from the client connect step open the modal
      if (uri) {
        this.modal.openModal({ uri });
      }
      // eslint-disable-next-line
      await new Promise<void>(async (resolve, reject) => {
        const unsub = this.modal.subscribeModal((state) => {
          if (!state.open) {
            unsub();
            if (!this.session) {
              reject(new Error('Cancelled by user'));
            }
          }
        });
        // await session approval from the wallet app
        this.session = await approval();

        resolve();
      });

      // Subscribe to session delete
      this.provider.on('session_delete', this.disconnect.bind(this));
    } catch (error) {
      console.error(error);
      this.disconnect();
      throw error;
    } finally {
      this.modal.closeModal();
    }
  }

  public disconnect(): void {
    if (this.session) {
      const topic = this.session.topic;

      try {
        this.provider.client.disconnect({
          topic,
          reason: {
            code: 0,
            message: 'Disconnected by dApp',
          },
        });
      } catch {}
    }

    this.resetSession();
  }

  protected resetSession(): void {
    this.session = undefined;
  }

  public async enable(): Promise<void> {
    await this.init();
    await this.connect();
  }

  public static getChainParams(chainId: string): EngineTypes.ConnectParams {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    const chainCaip13 = `polkadot:${chainId.slice(2, 34)}`;

    const params: EngineTypes.ConnectParams = {
      requiredNamespaces: {
        polkadot: {
          methods: ['polkadot_signTransaction'],
          chains: [chainCaip13],
          events: ['accountsChanged'],
        },
      },
    };

    return params;
  }

  public getAccounts(): string[] {
    if (!this.session) {
      console.info(`[${this.constructor.name}] Session is not estabilished`);
      return [];
    }

    // Get the accounts from the session for use in constructing transactions.
    const walletConnectAccount = Object.values(this.session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    // grab account addresses from CAIP account formatted accounts
    const accounts = walletConnectAccount.map((wcAccount) => {
      return wcAccount.split(':')[2];
    });

    return accounts;
  }
}
