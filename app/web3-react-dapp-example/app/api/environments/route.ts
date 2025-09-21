import { NextResponse } from 'next/server';
import { listEnvironments } from '../_mockdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const envs = listEnvironments();
  return NextResponse.json(envs);
}
