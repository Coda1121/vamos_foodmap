'use client';

import { useState, useTransition } from 'react';
import type { Tag, TagCategory } from '@/lib/types';
import { TAG_CATEGORY_LABELS } from '@/lib/types';
import { addTagAction, updateTagAction, deleteTagAction } from '@/actions/tags';

interface Props {
  tags: Tag[];
  restaurants: { tags: string[] }[];
  onRefresh: () => void;
}

export default function TagManager({ tags, restaurants, onRefresh }: Props) {
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<TagCategory>('cuisine');
  const [editTarget, setEditTarget] = useState<Tag | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Tag | null>(null);
  const [pending, startTransition] = useTransition();

  const categories = Object.keys(TAG_CATEGORY_LABELS) as TagCategory[];

  function usageCount(label: string) {
    return restaurants.filter((r) => r.tags.includes(label)).length;
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    startTransition(async () => {
      await addTagAction({ label: newLabel.trim(), category: newCategory });
      setNewLabel('');
      onRefresh();
    });
  }

  function handleUpdate(tag: Tag) {
    if (!editLabel.trim()) return;
    startTransition(async () => {
      await updateTagAction({ ...tag, label: editLabel.trim() });
      setEditTarget(null);
      onRefresh();
    });
  }

  function handleDelete(tag: Tag) {
    startTransition(async () => {
      await deleteTagAction(tag.tag_id);
      setConfirmDelete(null);
      onRefresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5">標籤名稱</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="新增標籤"
            className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/30 focus:border-[#ff792c] text-sm w-44"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5">分類</label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as TagCategory)}
            className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/30 focus:border-[#ff792c] text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{TAG_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pending || !newLabel.trim()} className="px-5 py-2 rounded-xl bg-[#ff792c] text-white text-sm font-semibold hover:bg-[#e8681e] transition-colors disabled:opacity-50">
          新增
        </button>
      </form>

      <div className="space-y-5">
        {categories.map((cat) => {
          const catTags = tags.filter((t) => t.category === cat);
          return (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                {TAG_CATEGORY_LABELS[cat]}
              </p>
              {catTags.length === 0 ? (
                <p className="text-sm text-stone-300 italic">（尚無標籤）</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {catTags.map((tag) => (
                    <div key={tag.tag_id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm group">
                      {editTarget?.tag_id === tag.tag_id ? (
                        <>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag)}
                            className="w-28 bg-transparent text-sm outline-none border-b border-stone-400"
                          />
                          <button onClick={() => handleUpdate(tag)} className="text-[#ff792c] text-xs font-semibold">✓</button>
                          <button onClick={() => setEditTarget(null)} className="text-stone-400 text-xs">✕</button>
                        </>
                      ) : (
                        <>
                          <span>{tag.label}</span>
                          <span className="text-xs text-stone-400">({usageCount(tag.label)})</span>
                          <button
                            onClick={() => { setEditTarget(tag); setEditLabel(tag.label); }}
                            className="hidden group-hover:inline text-stone-400 hover:text-stone-600 transition-colors ml-1"
                            title="重新命名"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(tag)}
                            className="hidden group-hover:inline text-stone-300 hover:text-red-400 transition-colors"
                            title="刪除"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">確定刪除標籤？</h3>
            <p className="text-sm text-stone-500 mb-2">
              標籤「{confirmDelete.label}」目前被 <strong>{usageCount(confirmDelete.label)} 間店家</strong>使用。
            </p>
            <p className="text-sm text-stone-400 mb-6">刪除後，這些店家的該標籤將會移除。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">取消</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={pending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {pending ? '刪除中…' : '確定刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
