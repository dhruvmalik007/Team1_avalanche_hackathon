import { avalanche, avalancheFuji, type Chain } from 'viem/chains'
import artifact from '@prb/foundry-template/out/environment_receipt.sol/EnvRegistry.json'

export const envRegistryAbi = (artifact as any).abi as any[]

export function getChain(): Chain {
  const chainName = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase()
  const chainIdFromEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '')
  if (chainName === 'fuji' || chainName === 'avalanchefuji' || chainIdFromEnv === avalancheFuji.id) return avalancheFuji
  return avalanche
}

export function getRpcUrl(chain: Chain): string {
  return process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0]
}

export function getRegistryAddress(): `0x${string}` | undefined {
  return process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined
}
