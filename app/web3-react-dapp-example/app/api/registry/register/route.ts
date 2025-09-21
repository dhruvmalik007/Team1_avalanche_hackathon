import { NextRequest, NextResponse } from 'next/server';
import { Address, Hex, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalanche } from 'viem/chains';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const abi = parseAbi([
  'function registerEnvironment(string envId, string repoUrl, string envPath, string commitHash, string metadataCID) external',
]);

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
    if (!rpcUrl) return NextResponse.json({ error: 'RPC URL not configured' }, { status: 500 });

    const address: Address | undefined = (registryAddress || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS) as Address | undefined;
    if (!address) return NextResponse.json({ error: 'Registry address missing' }, { status: 400 });

    const account = privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hex);
    const client = createWalletClient({ account, chain: avalanche, transport: http(rpcUrl) });

    const hash = await client.writeContract({
      address,
      abi,
      functionName: 'registerEnvironment',
      args: [envId, repoUrl, envPath, commitHash, metadataCID],
      chain: avalanche,
      account,
    });

    return NextResponse.json({ registryAddress: address, registerTxHash: hash });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
