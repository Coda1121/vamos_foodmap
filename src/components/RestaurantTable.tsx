'use client';

import { useState, useTransition } from 'react';
import type { Restaurant, Tag } from '@/lib/types';
import { deleteRestaurantAction, toggleHiddenAction } from '@/actions/restaurants';
import RestaurantForm from './RestaurantForm';

interface Props {
  restaurants: Restaurant[];
  tags: Tag[];
  onRefresh: () => void;
}

export default function RestaurantTable({ restaurants, tags, onRefresh }: Props) {
  const [editTarget, setEditTarget] = useState<Restaurant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Restaurant | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggleHidden(r: Restaurant) {
    startTransition(async () => {
      await toggleHiddenAction(r);
      onRefresh();
    });
  }

  function handleDelete(r: Restaurant) {
    startTransition(async () => {
      await deleteRestaurantAction(r.id);
      setConfirmDelete(null);
      onRefresh();
    });
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm">尚無店家，點擊「新增店家」開始建立</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs uppercase tracking-wider">店家名稱</th>
              <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">標籤</th>
              <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden lg:table-cell">地址</th>
              <th className="text-left py-3 px-4 font-semibold text-stone-500 text-xs uppercase tracking-wider">狀態</th>
              <th className="text-right py-3 px-4 font-semibold text-stone-500 text-xs uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {restaurants.map((r) => (
              <tr key={r.id} className={`hover:bg-stone-50/50 transition-colors ${r.hidden ? 'opacity-50' : ''}`}>
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-medium text-stone-900">{r.name}</p>
                    {r.note && <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[180px]">{r.note}</p>}
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-orange-50 text-[#ff792c]">{tag}</span>
                    ))}
                    {r.tags.length > 3 && <span className="text-xs text-stone-400">+{r.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden lg:table-cell text-stone-500 max-w-[200px] truncate">{r.address || '—'}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.hidden ? 'bg-stone-100 text-stone-400' : 'bg-green-50 text-green-600'}`}>
                    {r.hidden ? '隱藏' : '顯示中'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditTarget(r)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleToggleHidden(r)}
                      disabled={pending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${r.hidden ? 'bg-orange-50 text-[#ff792c] hover:bg-orange-100' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {r.hidden ? '取消隱藏' : '隱藏'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(r)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <RestaurantForm
          restaurant={editTarget}
          tags={tags}
          onClose={() => setEditTarget(null)}
          onSaved={onRefresh}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">確定刪除？</h3>
            <p className="text-sm text-stone-500 mb-6">「{confirmDelete.name}」將被永久刪除，此操作無法復原。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50">取消</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={pending} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {pending ? '刪除中…' : '確定刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
