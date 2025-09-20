import { createWalletClient, createPublicClient, custom, Hex, Address, parseAbi } from 'viem';
import {avalanche} from 'viem/chains';
// Minimal ABI for EnvRegistry
export const envRegistryAbi = parseAbi([
  'function registerEnvironment(string envId, string repoUrl, string envPath, string commitHash, string metadataCID) external',
  'event EnvironmentRegistered(string envId, string repoUrl, string envPath, string commitHash, string metadataCID, address owner)',
  'event RunSubmitted(string envId, string runId, address runner, uint256 score, bytes32 artifactsHash, bytes32 configHash, address verifier)'
]);

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
};

export type DeployAndRegisterResult = {
  registryAddress: Address;
  deployTxHash?: Hex;
  registerTxHash: Hex;
  registerBlockNumber: bigint;
};

export async function deployAndRegister(args: DeployAndRegisterArgs): Promise<DeployAndRegisterResult> {
  const { account, envId, repoUrl, envPath, commitHash, metadataCID } = args;
  const ethereum = (globalThis as any).ethereum;
  if (!ethereum) throw new Error('Wallet provider not found');

  const wallet = createWalletClient({ transport: custom(ethereum) });
  const publicClient = createPublicClient({ transport: custom(ethereum) });

  // Determine account if not provided
  let from: Address | undefined = account;
  if (!from) {
    try {
      const addrs = await wallet.getAddresses();
      if (addrs && addrs.length > 0) from = addrs[0] as Address;
    } catch {
      // ignore
    }
  }
  if (!from) throw new Error('Unable to determine wallet account');

  // If bytecode provided, deploy a fresh EnvRegistry. Otherwise use predeployed address.
  const preDeployed = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Address | undefined;

  let registryAddress: Address;
  let deployTxHash: Hex | undefined;

  if (envRegistryBytecode && envRegistryBytecode.length > 2) {
    deployTxHash = await wallet.deployContract({
      abi: envRegistryAbi,
      bytecode: envRegistryBytecode,
      account: from,
      chain: avalanche,
      // No constructor args in current contract
    });
    // wait for deployment receipt
    const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployTxHash });
    if (deployReceipt.contractAddress == null) throw new Error('No contractAddress in deploy receipt');
    registryAddress = deployReceipt.contractAddress as Address;
  } else if (preDeployed) {
    registryAddress = preDeployed;
  } else {
    throw new Error('Missing NEXT_PUBLIC_REGISTRY_BYTECODE or NEXT_PUBLIC_REGISTRY_ADDRESS');
  }

  // Call registerEnvironment
  const registerHash = await wallet.writeContract({
    abi: envRegistryAbi,
    address: registryAddress,
    functionName: 'registerEnvironment',
    account: from,
    args: [envId, repoUrl, envPath, commitHash, metadataCID],
    chain: avalanche,
  });
  const registerReceipt = await publicClient.waitForTransactionReceipt({ hash: registerHash });

  return {
    registryAddress,
    deployTxHash,
    registerTxHash: registerHash,
    registerBlockNumber: registerReceipt.blockNumber,
  };
}
