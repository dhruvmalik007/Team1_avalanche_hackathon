import { NextResponse } from 'next/server';
import { RlHubInfraClient } from '@rlhub/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { runId: string } }) {
  const client = new RlHubInfraClient();
  const r = await client.getRun(params.runId);
  if (!r) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  return NextResponse.json(r);
}
