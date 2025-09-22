import { NextRequest, NextResponse } from 'next/server';
import type { SubmitRunRequest } from '@rlhub/api-types';
import { RlHubInfraClient } from '@rlhub/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitRunRequest & { userId?: string };
    const userId = body.userId || req.headers.get('x-demo-user') || 'demo-user';

    const client = new RlHubInfraClient();
    const resp = await client.submitRun({ ...body, userId });
    return NextResponse.json(resp, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid body' }, { status: 400 });
  }
}
