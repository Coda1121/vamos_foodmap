'use client';

import { useMemo } from 'react';
import { type Restaurant } from '@/lib/types';

interface Props {
  restaurant: Restaurant;
  onReroll: () => void;
  isRerolling?: boolean;
  resetMessage?: string;
}

const CONFETTI_COLORS = ['#ff792c', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d', '#c77dff', '#ffb347', '#2ec4b6'];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${(i / 36) * 100 + (Math.sin(i * 2.5) * 8)}%`,
      delay: `${(i % 6) * 0.07}s`,
      duration: `${0.75 + (i % 4) * 0.2}s`,
      width: `${6 + (i % 3) * 4}px`,
      height: `${8 + (i % 5) * 3}px`,
      isCircle: i % 3 === 0,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.width,
            height: p.isCircle ? p.width : p.height,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function ResultCard({ restaurant, onReroll, isRerolling, resetMessage }: Props) {
  return (
    <div className="animate-result-pop relative backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 p-8 max-w-md w-full mx-auto overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <Confetti />

      {resetMessage && (
        <div className="relative mb-4 text-center text-sm text-[#ff792c] bg-orange-500/15 border border-orange-500/20 rounded-xl px-4 py-2">
          {resetMessage}
        </div>
      )}

      <div className="relative mb-6">
        <h2 className="font-serif text-3xl font-bold text-white leading-tight">
          {restaurant.name}
        </h2>
        {restaurant.note && (
          <p className="mt-2 text-white/55 text-sm leading-relaxed">{restaurant.note}</p>
        )}
      </div>

      {restaurant.tags.length > 0 && (
        <div className="relative flex flex-wrap gap-2 mb-5">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-[#ff9a5c] border border-orange-500/25"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {restaurant.address && (
        <div className="relative flex items-start gap-2 text-white/50 text-sm mb-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{restaurant.address}</span>
        </div>
      )}

      {restaurant.google_maps_url && (
        <a
          href={restaurant.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-1.5 text-sm text-[#ff792c] hover:text-[#ff9a5c] hover:underline mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          在 Google Maps 查看
        </a>
      )}

      <button
        onClick={onReroll}
        disabled={isRerolling}
        className="relative w-full py-3 rounded-2xl border border-white/15 text-white font-semibold text-sm tracking-wide hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        再抽一次
      </button>
    </div>
  );
}
