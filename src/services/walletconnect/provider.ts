import { WalletConnectModal } from '@walletconnect/modal';
import UniversalProvider from '@walletconnect/universal-provider';

import { formatAccountAddress } from '../../util';

import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { EngineTypes, SessionTypes, PairingTypes } from '@walletconnect/types';

// SORA mainnet chainId by default
const ChainId = '0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5';
const OptionalChains = [
  '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3', // Polkadot
  '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c', // Acala
  '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6', // Astar
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe', // Kusama
  '0x6bd89e052d67a45bb60a9a23e8581053d5e0d619f15cb9865946937e690c42d6', // Liberland
];

export class WcSubstrateProvider {
  /** WalletConnect app projectId */
  public static projectId = '';
  /** Chain genesis hash: `api.genesisHash.toString()` */
  protected chainId!: string;
  protected optionalChainIds!: string[];

  public provider!: UniversalProvider;
  public modal!: WalletConnectModal;
  public session!: SessionTypes.Struct | undefined;

  constructor(chainId = ChainId, optionalChainIds = OptionalChains) {
    this.chainId = chainId;
    this.optionalChainIds = optionalChainIds;
  }

  get ready(): boolean {
    return !!this.provider && !!this.modal;
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
      if (this.session) {
        return;
      } else {
        this.cleanupSessions();
      }

      if (!this.chainId) throw new Error(`[${this.constructor.name}] chainId is not defined`);

      const params = this.getConnectParams(this.chainId, this.optionalChainIds);

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
              reject(new Error('Cancelled'));
            }
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

      // Subscribe to session delete
      this.provider.on('session_delete', this.disconnect.bind(this));
    } catch (error) {
      this.provider.abortPairingAttempt();
      this.disconnect();
      throw error;
    } finally {
      this.modal.closeModal();
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
        this.session = await this.provider.connect({
          pairingTopic,
        });
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
          code: 0,
          message: 'Disconnected by dApp',
        },
      });
    } catch {}
  }

  public async enable(): Promise<void> {
    await this.init();
    await this.connect();
  }

  protected getConnectParams(chainId: string, optionalChainIds: string[]): EngineTypes.ConnectParams {
    const methods = ['polkadot_signTransaction'];
    const events = ['accountsChanged'];

    const params: EngineTypes.ConnectParams = {
      requiredNamespaces: {
        polkadot: {
          methods,
          chains: [this.getChainCaip13(chainId)],
          events,
        },
      },
    };

    if (optionalChainIds.length) {
      Object.assign(params, {
        optionalNamespaces: {
          polkadot: {
            methods,
            chains: optionalChainIds.map((chainId) => this.getChainCaip13(chainId)),
            events,
          },
        },
      });
    }

    return params;
  }

  protected getChainCaip13(chainId: string): string {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
    return `polkadot:${chainId.slice(2, 34)}`;
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
      const chainId = this.getChainCaip13(this.chainId);

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
