import { avalanche, avalancheFuji, type Chain } from 'viem/chains'
// Minimal ABI required by the dapp. Avoids requiring Foundry-built artifacts at deploy time.
// If you later want the full ABI, you can swap this back to a JSON import from the contracts package.
export const envRegistryAbi = [
  {
    type: 'function',
    name: 'registerEnvironment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'envId', type: 'string' },
      { name: 'repoUrl', type: 'string' },
      { name: 'envPath', type: 'string' },
      { name: 'commitHash', type: 'string' },
      { name: 'metadataCID', type: 'string' }
    ],
    outputs: []
  }
] as const satisfies any[]

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
