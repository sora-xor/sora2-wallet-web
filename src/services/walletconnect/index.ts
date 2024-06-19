import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';

import type { WithConnectionApi } from '@sora-substrate/util';
import type { SessionTypes } from '@walletconnect/types';

// await signClient.emit({
//   topic,
//   event: {
//     name: 'accountsChanged',
//     data: ['AZBEwbZhYeiofodZnM2iAoshP3pXRPNSJEKFqEPDmvv1mY7']
//   },
//   chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
// })

class WalletConnectSubstrateProvider {
  protected projectId!: string;
  protected api!: WithConnectionApi;

  private ready = false;

  public provider!: UniversalProvider;
  public modal!: WalletConnectModal;
  public session!: SessionTypes.Struct | undefined;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  public setApi(api: WithConnectionApi): void {
    this.api = api;
    console.info(`[${this.constructor.name}] Api injected`);
  }

  async init(): Promise<void> {
    if (this.ready) return;

    if (!this.projectId) throw new Error(`[${this.constructor.name}]: Project ID is required`);

    // Instantiate a universal provider using the projectId created for your app.
    this.provider = await UniversalProvider.init({
      projectId: this.projectId,
      relayUrl: 'wss://relay.walletconnect.com',
    });

    // Create a standalone modal using your dapps WalletConnect projectId.
    this.modal = new WalletConnectModal({
      projectId: this.projectId,
    });

    this.ready = true;
  }

  /**
   * On user action (e.g. user clicks connect for WalletConnect),
   * call the connect method on the providers sign client passing in preferred params.
   */
  async connect(): Promise<void> {
    try {
      // already connected
      if (this.session) return;

      if (!this.api) throw new Error(`[${this.constructor.name}] Api is not injected`);

      const params = this.getChainParamsFromApi(this.api);
      const { uri, approval } = await this.provider.client.connect(params);

      // Open the modal prompting the user to scan the QR code with their wallet app.
      // if there is a URI from the client connect step open the modal
      if (uri) {
        this.modal.openModal({ uri });
      }

      // await session approval from the wallet app
      this.session = await approval();
    } catch (error) {
      console.error(error);
      this.session = undefined;
      throw error;
    } finally {
      this.modal.closeModal();
    }
  }

  async auth(): Promise<void> {
    await this.init();
    await this.connect();
  }

  protected getChainParamsFromApi(api: WithConnectionApi) {
    const chainId = api.api.genesisHash.toString();
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    const chainCaip13 = `polkadot:${chainId.slice(2, 34)}`;

    const params = {
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

  getAccounts(): string[] {
    if (!this.session) return [];

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

export const wcSubProvider = new WalletConnectSubstrateProvider(WALLET_CONNECT_PROJECT_ID);
