import { Operation } from '@sora-substrate/util'

export const MOCK_NETWORK_FEES = {
  [Operation.AddLiquidity]: '0',
  [Operation.CreatePair]: '0',
  [Operation.EthBridgeIncoming]: '0',
  [Operation.EthBridgeOutgoing]: '0',
  [Operation.RegisterAsset]: '0',
  [Operation.RemoveLiquidity]: '0',
  [Operation.Swap]: '0',
  [Operation.SwapAndSend]: '0',
  [Operation.Transfer]: '0',
  [Operation.ClaimVestedRewards]: '0',
  [Operation.ClaimLiquidityProvisionRewards]: '0',
  [Operation.ClaimExternalRewards]: '0'
}
