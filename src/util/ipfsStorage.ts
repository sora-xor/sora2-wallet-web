enum IpfsProviders {
  Pinata = 'pinata',
  Dweb = 'dweb',
  NFTStorage = 'nftstorage',
  Default = 'ipfs.io',
}

type IpfsProvider = {
  type: IpfsProviders;
  fn: (link: string) => string;
};

export class IpfsStorage {
  private static readonly IPFS_PREFIX = 'https://ipfs.io/ipfs/';
  private static readonly PINATA_PREFIX = 'https://gateway.pinata.cloud/ipfs/';
  private static readonly DWEB_SUFFIX = '.ipfs.dweb.link/';
  private static readonly NFTSTORAGE_SUFFIX = '.ipfs.nftstorage.link/';

  private static readonly UCAN_TOKEN_HOST_PROVIDER = 'https://ucan.polkaswap2.io/ucan.json';

  private static readonly Providers: IpfsProvider[] = [
    { type: IpfsProviders.Pinata, fn: IpfsStorage.getPinataUrl },
    { type: IpfsProviders.Dweb, fn: IpfsStorage.getDwebUrl },
    { type: IpfsProviders.NFTStorage, fn: IpfsStorage.getNftstorageUrl },
    { type: IpfsProviders.Default, fn: IpfsStorage.getIpfsUrl },
  ];

  static async getUcanTokens(): Promise<Record<string, string>> {
    const response = await fetch(IpfsStorage.UCAN_TOKEN_HOST_PROVIDER, { cache: 'no-cache' });
    return response.json();
  }

  static async requestImage(link: string): Promise<{ image: string; link: string } | null> {
    for (const { fn } of IpfsStorage.Providers) {
      try {
        const path = fn(link);
        const response = await fetch(path);
        if (response.ok) {
          const blob = await response.blob();
          return { image: URL.createObjectURL(blob), link: path };
        }
      } catch (error) {
        // do nothing
        // console.error(`IPFS: Failed to download "${link}" using "${type}"`, error);
      }
    }
    return null;
  }

  private static getIpfsUrl(link: string): string {
    return IpfsStorage.IPFS_PREFIX + link;
  }

  /** Alternative url if `getIpfsUrl` does't work */
  private static getNftstorageUrl(link: string): string {
    const [path, name] = link.split('/');
    return `https://${path}${IpfsStorage.NFTSTORAGE_SUFFIX}${name}`;
  }

  /** Alternative url if `getIpfsUrl` does't work */
  private static getDwebUrl(link: string): string {
    const [path, name] = link.split('/');
    return `https://${path}${IpfsStorage.DWEB_SUFFIX}${name}`;
  }

  /** Alternative url if `getIpfsUrl` does't work */
  private static getPinataUrl(link: string): string {
    return IpfsStorage.PINATA_PREFIX + link;
  }

  static getStorageHostname(link: string): string {
    if (!link) return '';
    return new URL(link).hostname;
  }

  static getIpfsPath(url: string): string {
    const path = new URL(url).pathname;
    // TODO: !!! provider
    return path.replace(/\/ipfs\//, '');
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result !== null) resolve(reader.result.toString() || '');
      };
      reader.onerror = (e) => reject(e);
    });
  }

  static fileToBuffer(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
    });
  }
}
