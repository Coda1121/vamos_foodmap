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

const inputCls = 'px-4 py-2 rounded-xl border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#ff792c]/40 focus:border-[#ff792c]/60 text-sm transition-all';
const inputStyle = { background: 'rgba(255,255,255,0.06)' };

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
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-white/45 mb-1.5">標籤名稱</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="新增標籤"
            className={`${inputCls} w-44`}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/45 mb-1.5">分類</label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as TagCategory)}
            className={inputCls}
            style={inputStyle}
          >
            {categories.map((c) => (
              <option key={c} value={c} style={{ background: '#1a0800' }}>{TAG_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pending || !newLabel.trim()}
          className="px-5 py-2 rounded-xl bg-[#ff792c] text-white text-sm font-semibold hover:bg-[#e8681e] transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20">
          新增
        </button>
      </form>

      {/* Tag list by category */}
      <div className="space-y-5">
        {categories.map((cat) => {
          const catTags = tags.filter((t) => t.category === cat);
          return (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2">
                {TAG_CATEGORY_LABELS[cat]}
              </p>
              {catTags.length === 0 ? (
                <p className="text-sm text-white/25 italic">（尚無標籤）</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {catTags.map((tag) => (
                    <div key={tag.tag_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/70 text-sm group transition-colors hover:border-white/20"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      {editTarget?.tag_id === tag.tag_id ? (
                        <>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag)}
                            className="w-28 bg-transparent text-sm text-white outline-none border-b border-white/30"
                          />
                          <button onClick={() => handleUpdate(tag)} className="text-[#ff792c] text-xs font-semibold hover:text-[#ff9a5c]">✓</button>
                          <button onClick={() => setEditTarget(null)} className="text-white/35 text-xs hover:text-white/60">✕</button>
                        </>
                      ) : (
                        <>
                          <span>{tag.label}</span>
                          <span className="text-xs text-white/30">({usageCount(tag.label)})</span>
                          <button
                            onClick={() => { setEditTarget(tag); setEditLabel(tag.label); }}
                            className="hidden group-hover:inline text-white/30 hover:text-white/60 transition-colors ml-1"
                            title="重新命名"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(tag)}
                            className="hidden group-hover:inline text-white/20 hover:text-red-400 transition-colors"
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

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 max-w-sm w-full" style={{ background: 'rgba(20,8,0,0.88)' }}>
            <h3 className="font-serif font-bold text-lg text-white mb-2">確定刪除標籤？</h3>
            <p className="text-sm text-white/50 mb-2">
              標籤「{confirmDelete.label}」目前被 <strong className="text-white/70">{usageCount(confirmDelete.label)} 間店家</strong>使用。
            </p>
            <p className="text-sm text-white/35 mb-6">刪除後，這些店家的該標籤將會移除。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-white/60 hover:bg-white/8 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}>取消</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={pending}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors">
                {pending ? '刪除中…' : '確定刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
