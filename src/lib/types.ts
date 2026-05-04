export interface Restaurant {
  id: string;
  name: string;
  note: string;
  tags: string[];
  address: string;
  google_maps_url: string;
  hidden: boolean;
  created_at: string;
}

export interface Tag {
  tag_id: string;
  label: string;
  category: 'meal_time' | 'price' | 'cuisine' | 'other';
}

export type TagCategory = 'meal_time' | 'price' | 'cuisine' | 'other';

export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  meal_time: '用餐時段',
  price: '價位',
  cuisine: '料理類型',
  other: '其他',
};

export const DEFAULT_TAGS: Omit<Tag, 'tag_id'>[] = [
  { label: '適合早餐', category: 'meal_time' },
  { label: '適合午餐', category: 'meal_time' },
  { label: '適合晚餐', category: 'meal_time' },
  { label: '價位低（百元以內）', category: 'price' },
  { label: '價位中（101–200 元）', category: 'price' },
  { label: '價位高（201 元以上）', category: 'price' },
  { label: '台式', category: 'cuisine' },
  { label: '日式', category: 'cuisine' },
  { label: '義大利麵', category: 'cuisine' },
];
