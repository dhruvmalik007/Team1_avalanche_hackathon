import { getRunSSR } from '@/lib/server/runs';
import RunDetailsClient from '@/components/run/RunDetailsClient';

export default async function RunDetailsPage({ params }: { params: { runId: string } }) {
  const initial = await getRunSSR(params.runId);
  return <RunDetailsClient runId={params.runId} initial={initial} />;
}