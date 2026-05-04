import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { getRestaurants } from '@/lib/sheets';
import { getTags } from '@/lib/sheets';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const ok = await verifySession();
  if (!ok) redirect('/admin');

  const [restaurants, tags] = await Promise.all([getRestaurants(), getTags()]);

  return <DashboardClient initialRestaurants={restaurants} initialTags={tags} />;
}
