'use client';

import { useState, useTransition } from 'react';
import type { Restaurant, Tag, TagCategory } from '@/lib/types';
import { TAG_CATEGORY_LABELS } from '@/lib/types';
import { addRestaurantAction, updateRestaurantAction } from '@/actions/restaurants';

interface Props {
  restaurant?: Restaurant;
  tags: Tag[];
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: Omit<Restaurant, 'id' | 'created_at'> = {
  name: '',
  note: '',
  tags: [],
  address: '',
  google_maps_url: '',
  hidden: false,
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/40 focus:border-[#ff792c]/60 text-sm transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.06)' };

export default function RestaurantForm({ restaurant, tags, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Omit<Restaurant, 'id' | 'created_at'>>(
    restaurant
      ? { name: restaurant.name, note: restaurant.note, tags: restaurant.tags, address: restaurant.address, google_maps_url: restaurant.google_maps_url, hidden: restaurant.hidden }
      : EMPTY
  );
  const [urlError, setUrlError] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const categories = Object.keys(TAG_CATEGORY_LABELS) as TagCategory[];

  function toggleTag(label: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(label) ? f.tags.filter((t) => t !== label) : [...f.tags, label],
    }));
  }

  function validateUrl(url: string) {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) return '請輸入有效的網址（http/https）';
      return '';
    } catch {
      return '請輸入有效的網址格式';
    }
  }

  function handleUrlChange(value: string) {
    setForm((f) => ({ ...f, google_maps_url: value }));
    setUrlError(validateUrl(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('店家名稱為必填'); return; }
    const ue = validateUrl(form.google_maps_url);
    if (ue) { setUrlError(ue); return; }
    setError('');

    startTransition(async () => {
      try {
        if (restaurant) {
          await updateRestaurantAction({ ...restaurant, ...form });
        } else {
          await addRestaurantAction(form);
        }
        onSaved();
        onClose();
      } catch {
        setError('儲存失敗，請稍後再試');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(20,8,0,0.88)' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 rounded-t-3xl backdrop-blur-xl" style={{ background: 'rgba(20,8,0,0.92)' }}>
          <h2 className="font-serif text-xl font-bold text-white">
            {restaurant ? '編輯店家' : '新增店家'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 店家名稱 */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              店家名稱 <span className="text-[#ff792c]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例：老王鹹水雞"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">備註</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="例：週一公休、需要預約"
              rows={2}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
          </div>

          {/* 標籤 */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">標籤</label>
            <div className="space-y-3">
              {categories.map((cat) => {
                const catTags = tags.filter((t) => t.category === cat);
                if (catTags.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs text-white/35 mb-1.5">{TAG_CATEGORY_LABELS[cat]}</p>
                    <div className="flex flex-wrap gap-2">
                      {catTags.map((tag) => {
                        const active = form.tags.includes(tag.label);
                        return (
                          <label key={tag.tag_id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${active ? 'bg-[#ff792c] text-white shadow-sm shadow-orange-500/30' : 'border border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
                            style={!active ? { background: 'rgba(255,255,255,0.06)' } : {}}>
                            <input type="checkbox" checked={active} onChange={() => toggleTag(tag.label)} className="sr-only" />
                            {tag.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">地址</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="例：台北市中山區...路..."
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {/* Google Maps */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Google Maps 網址</label>
            <input
              type="text"
              value={form.google_maps_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://maps.google.com/..."
              className={`${inputCls} ${urlError ? 'border-red-500/40 focus:ring-red-500/30 focus:border-red-500/60' : ''}`}
              style={inputStyle}
            />
            {urlError && <p className="mt-1 text-xs text-red-400">{urlError}</p>}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              取消
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[#ff792c] text-white text-sm font-semibold hover:bg-[#e8681e] transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20">
              {pending ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
