import { AES, enc } from 'crypto-js'

const key = 'U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy'

export const encrypt = (message: string) => AES.encrypt(message, key).toString()

export const decrypt = (message: string) => AES.decrypt(message, key).toString(enc.Utf8)

export const copyToClipboard = async (text: string) => {
  try {
    return navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Could not copy text: ', err)
  }
}

export const formatDate = (date: number) => new Date(date).toLocaleString()
