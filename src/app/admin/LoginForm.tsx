'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    startTransition(async () => {
      const result = await loginAction(form);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            回首頁
          </Link>
          <h1 className="font-serif text-3xl font-bold text-stone-900">管理後台</h1>
          <p className="text-stone-500 mt-2 text-sm">請輸入管理員密碼</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">密碼</label>
              <input
                type="password"
                name="password"
                autoFocus
                autoComplete="current-password"
                placeholder="輸入管理員密碼"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/30 focus:border-[#ff792c] text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-2xl bg-[#ff792c] text-white font-semibold text-sm tracking-wide hover:bg-[#e8681e] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {pending ? '驗證中…' : '登入'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
