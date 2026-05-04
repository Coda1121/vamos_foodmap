'use server';

import { revalidatePath } from 'next/cache';
import { getTags, addTag, updateTag, deleteTag } from '@/lib/sheets';
import { verifySession } from '@/lib/auth';
import type { Tag } from '@/lib/types';

async function requireAuth() {
  const ok = await verifySession();
  if (!ok) throw new Error('Unauthorized');
}

export async function fetchTagsAction() {
  try {
    return await getTags();
  } catch {
    return [];
  }
}

export async function addTagAction(data: Omit<Tag, 'tag_id'>) {
  await requireAuth();
  const tag = await addTag(data);
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  return tag;
}

export async function updateTagAction(tag: Tag) {
  await requireAuth();
  await updateTag(tag);
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
}

export async function deleteTagAction(tag_id: string) {
  await requireAuth();
  await deleteTag(tag_id);
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
}
