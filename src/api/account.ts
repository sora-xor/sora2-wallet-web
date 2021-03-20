import { api } from '../api'

export const checkValidSeed = (seed: string) => {
  try {
    return !!api.checkSeed(seed).address
  } catch (error) {
    return false
  }
}
