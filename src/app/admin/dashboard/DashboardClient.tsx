'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { Restaurant, Tag } from '@/lib/types';
import { fetchRestaurantsAction } from '@/actions/restaurants';
import { fetchTagsAction } from '@/actions/tags';
import { logoutAction } from '@/actions/auth';
import RestaurantTable from '@/components/RestaurantTable';
import RestaurantForm from '@/components/RestaurantForm';
import TagManager from '@/components/TagManager';

interface Props {
  initialRestaurants: Restaurant[];
  initialTags: Tag[];
}

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

export default function DashboardClient({ initialRestaurants, initialTags }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [tab, setTab] = useState<'restaurants' | 'tags'>('restaurants');
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [refreshing, startRefresh] = useTransition();

  function refresh() {
    startRefresh(async () => {
      const [rs, ts] = await Promise.all([fetchRestaurantsAction(), fetchTagsAction()]);
      setRestaurants(rs);
      setTags(ts);
      setLastSync(new Date());
    });
  }

  function formatSyncTime(d: Date) {
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const visibleCount = restaurants.filter((r) => !r.hidden).length;

  return (
    <main className="relative min-h-screen" style={{ zIndex: 1 }}>
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors" title="回首頁">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-serif font-bold text-white">店家管理</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
              <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
              <span>上次同步 {formatSyncTime(lastSync)}</span>
            </div>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新整理
            </button>
            <form action={logoutAction}>
              <button type="submit" className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                登出
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-6 py-8 space-y-6" style={{ zIndex: 2 }}>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '總店家數', value: restaurants.length, color: 'text-white' },
            { label: '轉盤中', value: visibleCount, color: 'text-[#ff792c]' },
            { label: '標籤數', value: tags.length, color: 'text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-3xl font-bold font-serif ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs card */}
        <div className="backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setTab('restaurants')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'restaurants' ? 'text-[#ff792c] border-b-2 border-[#ff792c]' : 'text-white/45 hover:text-white/80'}`}
            >
              店家列表
            </button>
            <button
              onClick={() => setTab('tags')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'tags' ? 'text-[#ff792c] border-b-2 border-[#ff792c]' : 'text-white/45 hover:text-white/80'}`}
            >
              標籤管理
            </button>
          </div>

          <div className="p-6">
            {tab === 'restaurants' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-white/45">共 {restaurants.length} 筆，{visibleCount} 筆顯示中</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff792c] text-white text-sm font-semibold hover:bg-[#e8681e] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    新增店家
                  </button>
                </div>
                <RestaurantTable restaurants={restaurants} tags={tags} onRefresh={refresh} />
              </>
            )}

            {tab === 'tags' && (
              <TagManager tags={tags} restaurants={restaurants} onRefresh={refresh} />
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <RestaurantForm
          tags={tags}
          onClose={() => setShowAddForm(false)}
          onSaved={refresh}
        />
      )}
    </main>
  );
}
