import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';

import type { EngineTypes, SessionTypes, PairingTypes } from '@walletconnect/types';

export type ChainId = string | number;

export type RequestArguments = {
  method: string;
  params: any;
};

export class WcProvider {
  /** WalletConnect app projectId */
  public static projectId = '';
  /** Chains genesis hashes: `api.genesisHash.toString()` */
  protected chains!: ChainId[];
  protected optionalChains!: ChainId[];

  public provider!: InstanceType<typeof UniversalProvider>;
  public modal!: WalletConnectModal;
  public session!: SessionTypes.Struct | undefined;

  protected connecting = false;

  protected database = 'wc2';
  protected table = 'keyvaluestorage';

  constructor(chains: ChainId[], optionalChains: ChainId[] = []) {
    this.chains = chains;
    this.optionalChains = optionalChains;
  }

  get chainId(): ChainId {
    return this.chains[0];
  }

  get ready(): boolean {
    return !!this.provider && !!this.modal;
  }

  public async init(): Promise<void> {
    if (this.ready) return;

    const projectId = WcProvider.projectId;

    if (!projectId) throw new Error(`[${this.constructor.name}]: projectId is required`);

    // Instantiate a universal provider using the projectId created for your app.
    console.log(this.table);
    this.provider = await UniversalProvider.init({
      projectId,
      relayUrl: 'wss://relay.walletconnect.com',
      storageOptions: {
        database: this.database,
        table: this.table,
      },
    });

    // Create a standalone modal using your dapps WalletConnect projectId.
    this.modal = new WalletConnectModal({
      projectId,
    });
  }

  /**
   * On user action (e.g. user clicks connect for WalletConnect),
   * call the connect method on the providers sign client passing in preferred params.
   */
  public async connect(): Promise<void> {
    try {
      // Not works for now
      // await this.restoreSession();

      // already connected
      if (this.session || this.connecting) {
        return;
      }

      const params = this.getConnectParams(this.chains, this.optionalChains);

      this.connecting = true;

      const { uri, approval } = await this.provider.client.connect(params);

      // Open the modal prompting the user to scan the QR code with their wallet app.
      // if there is a URI from the client connect step open the modal
      if (uri) {
        await this.modal.openModal({ uri });
      }

      // eslint-disable-next-line
      await new Promise<void>(async (resolve, reject) => {
        const unsub = this.modal.subscribeModal((state) => {
          if (!state.open && !this.session) {
            unsub();
            this.provider.abortPairingAttempt();
            reject(new Error('Connection request reset. Please try again.'));
          }
        });

        try {
          // await session approval from the wallet app
          this.session = await approval();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      const disconnectCb = ({ topic }) => {
        if (this.session?.topic === topic) {
          this.session = undefined;
          this.provider.off('session_delete', disconnectCb);
        }
      };

      // Subscribe to session delete
      this.provider.on('session_delete', disconnectCb);
    } catch (error) {
      this.provider.logger.error(error);
      throw error;
    } finally {
      this.modal.closeModal();
      this.connecting = false;
    }
  }

  public disconnect(): void {
    this.disconnectSession(this.session);
    this.session = undefined;
  }

  protected getCurrentSession(): SessionTypes.Struct {
    if (!this.session) {
      throw new Error(`[${this.constructor.name}] Session is not estabilished`);
    }
    return this.session;
  }

  protected getActivePairings(): PairingTypes.Struct[] {
    const pairings = this.provider.client.core.pairing.getPairings();

    const activePairings = pairings.filter((pairing) => pairing.active);

    return activePairings;
  }

  /** Restore active session with connected wallet  */
  protected async restoreSession(): Promise<void> {
    try {
      const activePairings = this.getActivePairings();
      const activePairing = activePairings[0];

      if (activePairing) {
        const pairingTopic = activePairing.topic;
        console.info(`[${this.constructor.name}]: active pairing topic found: "${pairingTopic}"`);
        this.session = await this.provider.pair(pairingTopic);
      }
    } catch {
      this.disconnect();
    }
  }

  /** Delete pending & active sessions */
  protected async cleanupSessions(): Promise<void> {
    await this.provider.cleanupPendingPairings({ deletePairings: true });

    this.getActivePairings().forEach((activePairing) => {
      this.disconnectSession(activePairing);
    });
  }

  /** Delete session from dApp and connected wallet */
  protected disconnectSession(session?: PairingTypes.Struct | SessionTypes.Struct): void {
    if (!session) return;

    try {
      this.provider.client.disconnect({
        topic: session.topic,
        reason: {
          code: 6000, // https://specs.walletconnect.com/2.0/specs/clients/sign/error-codes#reason
          message: 'Disconnected by dApp',
        },
      });
    } catch {}
  }

  public async enable(): Promise<void> {
    await this.init();
    await this.connect();
  }

  protected getConnectParams(chains: ChainId[], optionalChains: ChainId[]): EngineTypes.ConnectParams {
    console.info(`[${this.constructor.name}] "getConnectParams" is not implemented`);
    return {};
  }

  protected formatChainId(chainId: ChainId): string {
    console.info(`[${this.constructor.name}] "formatChainId" is not implemented`);
    return '';
  }

  public getAccounts(): string[] {
    const session = this.getCurrentSession();

    // Get the accounts from the session for use in constructing transactions.
    const walletConnectAccount = Object.values(session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    // grab account addresses from CAIP account formatted accounts
    return walletConnectAccount.map((wcAccount) => {
      const address = wcAccount.split(':')[2];

      return address;
    });
  }

  public async request<T = unknown>(request: RequestArguments, expiry?: number): Promise<T> {
    const session = this.getCurrentSession();
    const chainId = this.formatChainId(this.chainId);

    const params: EngineTypes.RequestParams = {
      chainId,
      topic: session.topic,
      request,
      expiry,
    };

    try {
      return await this.provider.client.request(params);
    } catch (error) {
      this.provider.logger.error(error);
      throw error;
    }
  }

  public async signTransaction(payload: any): Promise<any> {
    console.info(`[${this.constructor.name}] "signTransaction" is not implemented`);
    return '';
  }
}