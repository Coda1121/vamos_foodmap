'use server';

import { revalidatePath } from 'next/cache';
import {
  getRestaurants,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  ensureSheetsExist,
} from '@/lib/sheets';
import { verifySession } from '@/lib/auth';
import type { Restaurant } from '@/lib/types';

async function requireAuth() {
  const ok = await verifySession();
  if (!ok) throw new Error('Unauthorized');
}

export async function fetchRestaurantsAction() {
  const restaurants = await getRestaurants();
  return restaurants;
}

export async function fetchPublicRestaurantsAction() {
  try {
    const restaurants = await getRestaurants();
    return restaurants.filter((r) => !r.hidden);
  } catch {
    return [];
  }
}


export async function addRestaurantAction(
  data: Omit<Restaurant, 'id' | 'created_at'>
) {
  await requireAuth();
  const restaurant = await addRestaurant(data);
  revalidatePath('/admin/dashboard');
  return restaurant;
}

export async function updateRestaurantAction(restaurant: Restaurant) {
  await requireAuth();
  await updateRestaurant(restaurant);
  revalidatePath('/admin/dashboard');
}

export async function deleteRestaurantAction(id: string) {
  await requireAuth();
  await deleteRestaurant(id);
  revalidatePath('/admin/dashboard');
}

export async function toggleHiddenAction(restaurant: Restaurant) {
  await requireAuth();
  await updateRestaurant({ ...restaurant, hidden: !restaurant.hidden });
  revalidatePath('/admin/dashboard');
}

export async function initSheetsAction() {
  await requireAuth();
  await ensureSheetsExist();
  revalidatePath('/admin/dashboard');
}
