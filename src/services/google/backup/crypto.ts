import { stringToU8a, u8aConcat, u8aToHex, hexToU8a, u8aFixLength, u8aToString } from '@polkadot/util';
import {
  naclEncrypt,
  naclDecrypt,
  scryptEncode,
  scryptToU8a,
  scryptFromU8a,
  mnemonicToMiniSecret,
} from '@polkadot/util-crypto';
import { SCRYPT_LENGTH, NONCE_LENGTH } from '@polkadot/util-crypto/json/constants';

const encrypt = (data: Uint8Array, passphrase: string): Uint8Array => {
  const encoded = data;
  const { params, password, salt } = scryptEncode(passphrase);
  const { encrypted, nonce } = naclEncrypt(encoded, password.subarray(0, 32));

  return u8aConcat(scryptToU8a(salt, params), nonce, encrypted);
};

const decrypt = (encrypted: Uint8Array, passphrase: string): Uint8Array => {
  const { params, salt } = scryptFromU8a(encrypted);
  const password = scryptEncode(passphrase, salt, params).password;
  encrypted = encrypted.subarray(SCRYPT_LENGTH);
  const encoded = naclDecrypt(
    encrypted.subarray(NONCE_LENGTH),
    encrypted.subarray(0, NONCE_LENGTH),
    u8aFixLength(password, 256, true)
  );
  if (!encoded) {
    throw new Error('Unable to decode using the supplied passphrase');
  }

  return encoded;
};

export const encryptToHex = (message: string, passphrase: string): string => {
  const messageBytes = stringToU8a(message);
  const encrypted = encrypt(messageBytes, passphrase);

  return u8aToHex(encrypted);
};

export const decryptFromHex = (encryptedMessage: string, passphrase: string): string => {
  const encryptedMessageBytes = hexToU8a(encryptedMessage);
  const decrypted = decrypt(encryptedMessageBytes, passphrase);

  return u8aToString(decrypted);
};

export const generateSeed = (mnemonic: string) => {
  return u8aToHex(mnemonicToMiniSecret(mnemonic));
};
