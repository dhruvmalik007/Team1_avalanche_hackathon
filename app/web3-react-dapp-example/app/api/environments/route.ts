import { NextResponse } from 'next/server';
import { listEnvironments } from '../_mockdb';
import type { NextRequest } from 'next/server';
import { RlHubInfraClient } from '@rlhub/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const envs = listEnvironments();
  return NextResponse.json(envs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = (body?.userId || req.headers.get('x-demo-user') || 'demo-user').toString();
    if (!body?.envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const client = new RlHubInfraClient();
    await client.saveEnvironmentForUser(userId, body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid body' }, { status: 400 });
  }
}
