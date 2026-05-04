import { google } from 'googleapis';
import { Restaurant, Tag, DEFAULT_TAGS } from './types';
import { v4 as uuidv4 } from 'uuid';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

// ─── Restaurants ────────────────────────────────────────────────────────────

const RESTAURANT_HEADERS = [
  'id', 'name', 'note', 'tags', 'address', 'google_maps_url', 'hidden', 'created_at',
];

function rowToRestaurant(row: string[]): Restaurant {
  return {
    id: row[0] ?? '',
    name: row[1] ?? '',
    note: row[2] ?? '',
    tags: row[3] ? row[3].split(',').map((t) => t.trim()).filter(Boolean) : [],
    address: row[4] ?? '',
    google_maps_url: row[5] ?? '',
    hidden: row[6]?.toUpperCase() === 'TRUE',
    created_at: row[7] ?? new Date().toISOString(),
  };
}

function restaurantToRow(r: Restaurant): string[] {
  return [
    r.id,
    r.name,
    r.note,
    r.tags.join(','),
    r.address,
    r.google_maps_url,
    r.hidden ? 'TRUE' : 'FALSE',
    r.created_at,
  ];
}

export async function getRestaurants(): Promise<Restaurant[]> {
  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'restaurants!A2:H',
  });
  const rows = res.data.values ?? [];
  return rows.filter((r) => r[0]).map((r) => rowToRestaurant(r as string[]));
}

export async function addRestaurant(data: Omit<Restaurant, 'id' | 'created_at'>): Promise<Restaurant> {
  const sheets = getSheetsClient();
  const restaurant: Restaurant = {
    ...data,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'restaurants!A:H',
    valueInputOption: 'RAW',
    requestBody: { values: [restaurantToRow(restaurant)] },
  });
  return restaurant;
}

export async function updateRestaurant(restaurant: Restaurant): Promise<void> {
  const sheets = getSheetsClient();
  const all = await getRestaurants();
  const idx = all.findIndex((r) => r.id === restaurant.id);
  if (idx === -1) throw new Error('Restaurant not found');
  const rowNum = idx + 2; // +1 for header, +1 for 1-indexed
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `restaurants!A${rowNum}:H${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [restaurantToRow(restaurant)] },
  });
}

export async function deleteRestaurant(id: string): Promise<void> {
  const sheets = getSheetsClient();
  const all = await getRestaurants();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Restaurant not found');
  const rowNum = idx + 2;

  // Get spreadsheet to find sheet ID
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === 'restaurants');
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNum - 1,
              endIndex: rowNum,
            },
          },
        },
      ],
    },
  });
}

// ─── Tags ────────────────────────────────────────────────────────────────────

const TAG_HEADERS = ['tag_id', 'label', 'category'];

function rowToTag(row: string[]): Tag {
  return {
    tag_id: row[0] ?? '',
    label: row[1] ?? '',
    category: (row[2] as Tag['category']) ?? 'cuisine',
  };
}

function tagToRow(t: Tag): string[] {
  return [t.tag_id, t.label, t.category];
}

export async function getTags(): Promise<Tag[]> {
  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) return [];
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'tags!A2:C',
  });
  const rows = res.data.values ?? [];
  return rows.filter((r) => r[0]).map((r) => rowToTag(r as string[]));
}

export async function addTag(data: Omit<Tag, 'tag_id'>): Promise<Tag> {
  const sheets = getSheetsClient();
  const tag: Tag = { ...data, tag_id: uuidv4() };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'tags!A:C',
    valueInputOption: 'RAW',
    requestBody: { values: [tagToRow(tag)] },
  });
  return tag;
}

export async function updateTag(tag: Tag): Promise<void> {
  const sheets = getSheetsClient();
  const all = await getTags();
  const idx = all.findIndex((t) => t.tag_id === tag.tag_id);
  if (idx === -1) throw new Error('Tag not found');
  const rowNum = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `tags!A${rowNum}:C${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [tagToRow(tag)] },
  });
}

export async function deleteTag(tag_id: string): Promise<void> {
  const sheets = getSheetsClient();
  const all = await getTags();
  const idx = all.findIndex((t) => t.tag_id === tag_id);
  if (idx === -1) throw new Error('Tag not found');
  const rowNum = idx + 2;

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === 'tags');
  const sheetId = sheet?.properties?.sheetId ?? 1;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNum - 1,
              endIndex: rowNum,
            },
          },
        },
      ],
    },
  });
}

// ─── Init sheets ─────────────────────────────────────────────────────────────

export async function ensureSheetsExist(): Promise<void> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingTitles = meta.data.sheets?.map((s) => s.properties?.title) ?? [];

  const requests: object[] = [];

  if (!existingTitles.includes('restaurants')) {
    requests.push({ addSheet: { properties: { title: 'restaurants' } } });
  }
  if (!existingTitles.includes('tags')) {
    requests.push({ addSheet: { properties: { title: 'tags' } } });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });
  }

  // Ensure headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'restaurants!A1:H1',
    valueInputOption: 'RAW',
    requestBody: { values: [RESTAURANT_HEADERS] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'tags!A1:C1',
    valueInputOption: 'RAW',
    requestBody: { values: [TAG_HEADERS] },
  });

  // Seed default tags if empty
  const existingTags = await getTags();
  if (existingTags.length === 0) {
    for (const t of DEFAULT_TAGS) {
      await addTag(t);
    }
  }
}
