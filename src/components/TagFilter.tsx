'use client';

import { TAG_CATEGORY_LABELS, type Tag, type TagCategory } from '@/lib/types';

interface Props {
  tags: Tag[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function TagFilter({ tags, selected, onChange }: Props) {
  const categories = Object.keys(TAG_CATEGORY_LABELS) as TagCategory[];

  function toggle(label: string) {
    if (selected.includes(label)) {
      onChange(selected.filter((s) => s !== label));
    } else {
      onChange([...selected, label]);
    }
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catTags = tags.filter((t) => t.category === cat);
        if (catTags.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
              {TAG_CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-wrap gap-2">
              {catTags.map((tag) => {
                const active = selected.includes(tag.label);
                return (
                  <button
                    key={tag.tag_id}
                    onClick={() => toggle(tag.label)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-[#ff792c] text-white shadow-sm shadow-orange-500/30'
                        : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/18 hover:text-white'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
