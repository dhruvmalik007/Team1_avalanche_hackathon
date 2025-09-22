import { createWalletClient, createPublicClient, custom, Hex, Address, http } from 'viem';
import { avalanche, avalancheFuji } from 'viem/chains';
import { envRegistryAbi as compiledAbi } from './contract';
import { getRegistryAddress } from './contract';
// Minimal ABI for EnvRegistry
export const envRegistryAbi = compiledAbi as any[];

// Optional bytecode taken from forge build, provided via env
export const envRegistryBytecode = (process.env.NEXT_PUBLIC_REGISTRY_BYTECODE || '').trim() as Hex;

export type DeployAndRegisterArgs = {
  chainId?: number;
  account?: Address;
  envId: string;
  repoUrl: string;
  envPath: string;
  commitHash: string;
  metadataCID: string;
  // Optional EIP-1193 provider from Privy or other wallet SDKs
  provider?: any;
};

export type DeployAndRegisterResult = {
  registryAddress: Address;
  deployTxHash?: Hex;
  registerTxHash: Hex;
  registerBlockNumber: bigint;
};

export async function deployAndRegister(args: DeployAndRegisterArgs): Promise<DeployAndRegisterResult> {
  const { account, envId, repoUrl, envPath, commitHash, metadataCID, provider } = args;
  const ethereum = provider || (globalThis as any).ethereum;
  if (!ethereum) throw new Error('Wallet provider not found. Connect a wallet or enable the server signer flow.');

  // Resolve chain (default: Avalanche mainnet; allow Fuji via env)
  const chainName = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase();
  const chainIdFromEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '');
  const chain = chainName === 'fuji' || chainName === 'avalanchefuji' || chainIdFromEnv === avalancheFuji.id ? avalancheFuji : avalanche;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0];

  const wallet = createWalletClient({ transport: custom(ethereum), chain });
  const publicClient = createPublicClient({ transport: http(rpcUrl), chain });

  // Determine account if not provided
  let from: Address | undefined = account;
  if (!from) {
    try {
      if (typeof ethereum.request === 'function') {
        try { await (ethereum as any).request({ method: 'eth_requestAccounts' }); } catch {}
      }
      const addrs = await wallet.getAddresses();
      if (addrs && addrs.length > 0) from = addrs[0] as Address;
    } catch {
      // ignore
    }
  }
  if (!from) throw new Error('Unable to determine wallet account');

  // Ensure correct chain (Avalanche C-Chain or Fuji)
  try {
    // Some providers require explicit account request first
    if (typeof ethereum.request === 'function') {
      try { await (ethereum as any).request({ method: 'eth_requestAccounts' }); } catch {}
    }
    const targetHex = '0x' + chain.id.toString(16);
    if (typeof (wallet as any).switchChain === 'function') {
      await (wallet as any).switchChain({ id: chain.id });
    } else if (typeof ethereum.request === 'function') {
      try {
        await (ethereum as any).request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
      } catch (err: any) {
        // 4902 = Unrecognized chain -> try add
        if (err && (err.code === 4902 || err?.message?.includes('Unrecognized'))) {
          const isFuji = chain.id === avalancheFuji.id;
          await (ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetHex,
              chainName: isFuji ? 'Avalanche Fuji C-Chain' : 'Avalanche C-Chain',
              nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: isFuji ? ['https://testnet.snowtrace.io/'] : ['https://snowtrace.io/'],
            }],
          });
        }
      }
    }
  } catch (e) {
    // Non-fatal; continue and let tx fail if on wrong chain
  }

  // If bytecode provided, deploy a fresh EnvRegistry. Otherwise use predeployed address.
  const preDeployed = getRegistryAddress() as Address | undefined;

  let registryAddress: Address;
  let deployTxHash: Hex | undefined;

  if (envRegistryBytecode && envRegistryBytecode.length > 2) {
    const deployHash = await wallet.deployContract({
      abi: envRegistryAbi,
      bytecode: envRegistryBytecode,
      account: from!,
      chain: avalancheFuji,
      args: [
        
      ]
    });
    deployTxHash = deployHash;
    // wait for deployment receipt
    const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
    if (deployReceipt.contractAddress == null) throw new Error('No contractAddress in deploy receipt');
    registryAddress = deployReceipt.contractAddress as Address;
  } else if (preDeployed) {
    registryAddress = preDeployed;
  } else {
    throw new Error('Missing NEXT_PUBLIC_REGISTRY_BYTECODE or NEXT_PUBLIC_REGISTRY_ADDRESS. Either set a predeployed registry address or provide bytecode to deploy. Alternatively, set NEXT_PUBLIC_USE_SERVER_SIGNER=1 to use the server route.');
  }

  // Call registerEnvironment
  const registerHash = await wallet.writeContract({
    abi: envRegistryAbi,
    address: registryAddress,
    functionName: 'registerEnvironment',
    account: from,
    args: [envId, repoUrl, envPath, commitHash, metadataCID],
    chain,
  });
  const registerReceipt = await publicClient.waitForTransactionReceipt({ hash: registerHash });

  return {
    registryAddress,
    deployTxHash,
    registerTxHash: registerHash,
    registerBlockNumber: registerReceipt.blockNumber,
  };
}
