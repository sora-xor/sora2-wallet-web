// import type { AxiosResponse } from 'axios';
// import type { KeyringPair$Json } from '@polkadot/keyring/types';

// interface IGDriveFile {
//   id: string;
//   address: string;
//   name: string;
// }

// interface FileData extends IGDriveFile {
//   active: boolean;
//   password: string;
//   isError: boolean;
//   isLoading: boolean;
//   isComplete: boolean;
//   ethWalletID: string;
//   description: string;
//   json: KeyringPair$Json;
//   ethJson: KeyringPair$Json;
// }

// type FilesState = Partial<FileData>;

// interface FilesResponse {
//   id: string;
//   name: string;
//   description: string;
// }

// interface IGetFilesResponse {
//   files: FilesResponse[];
//   incompleteSearch: boolean;
//   kind: 'drive#fileList';
// }

// interface CreateFileProp {
//   json: string;
//   options: {
//     name: string;
//     address: string;
//   };
// }

// interface ICreateFile {
//   json: string;
//   options: { name: string; address: string; password?: string };
//   token: string;
// }

// interface IGetFileMetaResponse {
//   description: string;
// }

// interface VerifyTokenResponse {
//   issued_to: string;
//   audience: string;
//   scope: string;
//   expires_in: number;
//   access_type: 'online' | 'offline';
// }

// type GoogleResponse<T> = Promise<AxiosResponse<T>>;

// interface GoogleAuthTypes {
//   type: 'main' | 'export';
//   wallet?: string;
// }

// type GoogleAuthRequest = {
//   type: GoogleAuthTypes;
//   wallet: string;
// };

// export {
//   IGetFilesResponse,
//   VerifyTokenResponse,
//   IGetFileMetaResponse,
//   GoogleAuthTypes,
//   ICreateFile,
//   FilesState,
//   IGDriveFile,
//   GoogleResponse,
//   FilesResponse,
//   CreateFileProp,
//   GoogleAuthRequest,
// };
