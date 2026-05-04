'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';

/* ── Same animated blob background as the main page ── */
const BLOB_BASE: React.CSSProperties = {
  position: 'fixed',
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 0,
  filter: 'blur(100px)',
  willChange: 'transform',
};

function AnimatedBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#0f0700' }}>
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
    </div>
  );
}

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
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6" style={{ zIndex: 1 }}>
      <AnimatedBackground />

      <div className="relative w-full max-w-sm" style={{ zIndex: 2 }}>
        {/* Back link */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            回首頁
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white">管理後台</h1>
          <p className="text-white/45 mt-2 text-sm">請輸入管理員密碼</p>
        </div>

        {/* Card */}
        <div
          className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">密碼</label>
              <input
                type="password"
                name="password"
                autoFocus
                autoComplete="current-password"
                placeholder="輸入管理員密碼"
                className="w-full px-4 py-3 rounded-xl border border-white/12 bg-white/6 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/40 focus:border-[#ff792c]/60 text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm rounded-xl px-4 py-2.5 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-2xl bg-[#ff792c] text-white font-semibold text-sm tracking-wide hover:bg-[#e8681e] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {pending ? '驗證中…' : '登入'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
