import { environments as items } from '@/lib/environments';
import EnvironmentsSearchClient from '@/components/environments/EnvironmentsSearchClient';

export default async function EnvironmentsHub() {
  return <EnvironmentsSearchClient items={items} />;
}
