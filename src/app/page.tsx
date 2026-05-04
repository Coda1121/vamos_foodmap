'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Restaurant, Tag } from '@/lib/types';
import { fetchPublicRestaurantsAction } from '@/actions/restaurants';
import { fetchTagsAction } from '@/actions/tags';
import TagFilter from '@/components/TagFilter';
import SpinWheel from '@/components/SpinWheel';
import ResultCard from '@/components/ResultCard';

const STORAGE_KEY = 'foodmap_drawn_today';
const MAX_WHEEL_NAMES = 20;

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getDrawnToday(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as { date: string; ids: string[] };
    if (data.date !== getTodayKey()) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return data.ids;
  } catch {
    return [];
  }
}

function addDrawnToday(id: string) {
  const existing = getDrawnToday();
  if (!existing.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), ids: [...existing, id] }));
  }
}

function clearDrawnToday() {
  localStorage.removeItem(STORAGE_KEY);
}

function buildWheelSample(pool: Restaurant[]): Restaurant[] {
  if (pool.length <= MAX_WHEEL_NAMES) return pool;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, MAX_WHEEL_NAMES);
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Restaurant | null>(null);
  const [resetMessage, setResetMessage] = useState('');
  const [wheelSample, setWheelSample] = useState<Restaurant[]>([]);

  useEffect(() => {
    Promise.all([fetchPublicRestaurantsAction(), fetchTagsAction()])
      .then(([rs, ts]) => {
        setRestaurants(rs);
        setTags(ts);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    if (selected.length === 0) return true;
    return selected.every((s) => r.tags.includes(s));
  });

  useEffect(() => {
    if (result) return;
    const drawn = getDrawnToday();
    const pool = filtered.filter((r) => !drawn.includes(r.id));
    const source = pool.length > 0 ? pool : filtered;
    setWheelSample(buildWheelSample(source));
  }, [filtered.map((r) => r.id).join(','), selected.join(','), result]);

  function handleWheelResult(index: number) {
    const drawn = getDrawnToday();
    let pool = filtered.filter((r) => !drawn.includes(r.id));
    let isReset = false;

    if (pool.length === 0) {
      clearDrawnToday();
      pool = filtered;
      isReset = true;
    }

    const landedName = wheelSample[index]?.name;
    const byName = landedName ? pool.find((r) => r.name === landedName) : undefined;
    const pick = byName ?? pool[Math.floor(Math.random() * pool.length)];

    addDrawnToday(pick.id);
    setResetMessage(isReset ? '今天的店都抽過了，重新來過！' : '');
    setResult(pick);
  }

  function handleReroll() {
    setResult(null);
    setResetMessage('');
    const drawn = getDrawnToday();
    const pool = filtered.filter((r) => !drawn.includes(r.id));
    const source = pool.length > 0 ? pool : filtered;
    setWheelSample(buildWheelSample(source));
  }

  const tooFew = filtered.length < 2;

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 bg-stone-50/80 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-serif font-bold text-lg text-stone-900 tracking-tight">今天吃什麼？</h1>
          <Link
            href="/admin"
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="管理後台"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#ff792c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">資料庫還是空的</h2>
            <p className="text-stone-500 mb-6">先到管理頁新增幾間店家，就能開始抽籤囉！</p>
            <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ff792c] text-white font-semibold text-sm hover:bg-[#e8681e] transition-colors">
              前往新增店家
            </Link>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <h2 className="font-serif font-bold text-stone-900 mb-4 text-lg">篩選條件</h2>
              {tags.length > 0 ? (
                <TagFilter tags={tags} selected={selected} onChange={setSelected} />
              ) : (
                <p className="text-sm text-stone-400">尚未設定任何標籤</p>
              )}
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="mt-4 text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2">
                  清除所有篩選
                </button>
              )}
            </section>

            {!result && (
              <section className="flex flex-col items-center gap-4">
                {tooFew ? (
                  <div className="w-full bg-amber-50 border border-amber-100 rounded-3xl p-8 text-center">
                    <p className="text-amber-700 font-medium">篩選條件太嚴格，請放寬條件</p>
                    <p className="text-amber-500 text-sm mt-1">目前符合條件的店家不足 2 間</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-stone-400">符合條件 {filtered.length} 間店家</p>
                    <SpinWheel names={wheelSample.map((r) => r.name)} onResult={handleWheelResult} />
                  </>
                )}
              </section>
            )}

            {result && (
              <section className="flex justify-center">
                <ResultCard
                  restaurant={result}
                  onReroll={handleReroll}
                  resetMessage={resetMessage}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
