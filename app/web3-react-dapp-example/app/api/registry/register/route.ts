import { NextRequest, NextResponse } from 'next/server';
import { Address, Hex, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { envRegistryAbi } from '../../../../lib/contract';
import { getChain, getRpcUrl } from '../../../../lib/contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { envId, repoUrl = '', envPath = '', commitHash = '', metadataCID = '', registryAddress } = body || {};
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const key = process.env.NEXT_PRIVATE_DEPLOYER_KEY || process.env.DEPLOYER_KEY;
    if (!key) return NextResponse.json({ error: 'Server deployer key not configured' }, { status: 500 });

    const rpcUrl = process.env.NEXT_PRIVATE_RPC_URL || process.env.RPC_URL;

    const address: Address | undefined = (registryAddress || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS) as Address | undefined;
    if (!address) return NextResponse.json({ error: 'Registry address missing' }, { status: 400 });

    const chain = getChain();

    const account = privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hex);
    const resolvedRpc = rpcUrl || getRpcUrl(chain);
    const client = createWalletClient({ account, chain, transport: http(resolvedRpc) });

    const hash = await client.writeContract({
      address,
      abi: envRegistryAbi as any,
      functionName: 'registerEnvironment',
      args: [envId, repoUrl, envPath, commitHash, metadataCID],
      chain,
      account,
    });

    return NextResponse.json({ registryAddress: address, registerTxHash: hash });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
