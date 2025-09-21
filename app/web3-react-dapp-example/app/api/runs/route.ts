import { NextRequest, NextResponse } from 'next/server';
import { createRun } from '../_mockdb';
import type { SubmitRunRequest } from '@rlhub/api-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitRunRequest & { userId?: string };
    const userId = body.userId || req.headers.get('x-demo-user') || 'demo-user';
    const resp = createRun(userId, body);
    return NextResponse.json(resp, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid body' }, { status: 400 });
  }
}
