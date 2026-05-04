import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import AdminLoginForm from './LoginForm';

export default async function AdminPage() {
  const ok = await verifySession();
  if (ok) redirect('/admin/dashboard');
  return <AdminLoginForm />;
}
