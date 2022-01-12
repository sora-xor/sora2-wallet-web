import { api, connection } from '@sora-substrate/util';
import { NFTStorage, File } from 'nft.storage';
import { storage } from '../util/storage';

const nftClient = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBBMGJhMTc1ODJDNTQ2RTFlQTc1NmM4ODVEN2I1YTgzOTE5MTA5MDciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MTI2NDYwNDM5NywibmFtZSI6Im5mdC1zaG93Y2FzZSJ9.0UU4oT4lEyd1QnGnSKIPf8ROvOZoSqKuC_vv4v_Fwlc',
});

api.setStorage(storage);

export { connection, api, nftClient, File as ImageNFT };
