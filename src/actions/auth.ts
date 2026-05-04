'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  if (password === process.env.ADMIN_PASSWORD) {
    await createSession();
    redirect('/admin/dashboard');
  }
  return { error: '密碼錯誤，請再試一次' };
}

export async function logoutAction() {
  await deleteSession();
  redirect('/admin');
}
