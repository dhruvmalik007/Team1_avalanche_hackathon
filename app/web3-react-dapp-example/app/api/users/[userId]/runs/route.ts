import { NextRequest, NextResponse } from 'next/server';
import { RlHubInfraClient } from '@rlhub/api-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || '50') || 50;
  const client = new RlHubInfraClient();
  const data = await client.listUserRuns(params.userId, limit);
  return NextResponse.json(data);
}
