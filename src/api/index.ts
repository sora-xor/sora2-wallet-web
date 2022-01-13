import { api, connection } from '@sora-substrate/util';
import { NFTStorage, File } from 'nft.storage';
import { storage, nftStorageApiKey } from '../util/storage';

const nftClient = new NFTStorage({
  token: nftStorageApiKey,
});

api.setStorage(storage);

export { connection, api, nftClient, File as ImageNFT };
