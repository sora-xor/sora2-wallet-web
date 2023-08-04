export enum BackupAccountType {
  PASSHRASE = 'passphrase',
  JSON = 'json',
  SEED = 'seed',
}

export type Json = {
  substrateJson: Nullable<string>;
  ethJson: Nullable<string>;
};

export type Seed = {
  substrateSeed: Nullable<string>;
  ethSeed: Nullable<string>;
};

export type DecryptedBackupAccount = {
  name: string;
  address: string;
  mnemonicPhrase: Nullable<string>;
  cryptoType: string;
  substrateDerivationPath: Nullable<string>;
  ethDerivationPath: Nullable<string>;
  backupAccountType: BackupAccountType[];
  seed: Nullable<Seed>;
  json: Nullable<Json>;
};

export type EncryptedBackupAccount = {
  name: string;
  address: string;
  encryptedMnemonicPhrase: Nullable<string>;
  encryptedEthDerivationPath: Nullable<string>;
  encryptedSubstrateDerivationPath: Nullable<string>;
  cryptoType: string;
  backupAccountType: BackupAccountType[];
  encryptedSeed: Nullable<Seed>;
  json: Nullable<Json>;
};
