'use client';

import { type Restaurant } from '@/lib/types';

interface Props {
  restaurant: Restaurant;
  onReroll: () => void;
  isRerolling?: boolean;
  resetMessage?: string;
}

export default function ResultCard({ restaurant, onReroll, isRerolling, resetMessage }: Props) {
  return (
    <div className="animate-fade-up bg-white rounded-3xl shadow-xl border border-stone-100 p-8 max-w-md w-full mx-auto">
      {resetMessage && (
        <div className="mb-4 text-center text-sm text-[#ff792c] bg-orange-50 rounded-xl px-4 py-2">
          {resetMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
          {restaurant.name}
        </h2>
        {restaurant.note && (
          <p className="mt-2 text-stone-500 text-sm leading-relaxed">{restaurant.note}</p>
        )}
      </div>

      {restaurant.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-[#ff792c] border border-orange-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {restaurant.address && (
        <div className="flex items-start gap-2 text-stone-500 text-sm mb-3">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="inline-flex items-center gap-1.5 text-sm text-[#ff792c] hover:underline mb-6"
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
        className="w-full py-3 rounded-2xl bg-stone-900 text-white font-semibold text-sm tracking-wide hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        再抽一次
      </button>
    </div>
  );
}
