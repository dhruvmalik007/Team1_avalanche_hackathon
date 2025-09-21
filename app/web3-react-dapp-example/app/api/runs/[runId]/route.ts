import { NextResponse } from 'next/server';
import { getRun } from '../../../_mockdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { runId: string } }) {
  const r = getRun(params.runId);
  if (!r) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  const { _createdAtMs: _m, ...pub } = r as any;
  return NextResponse.json(pub);
}
