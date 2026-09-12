import { savePortalConfigToApi, fetchPortalConfigFromApi } from './apiStorage';

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  category: string;
  date: string;
  url: string; // Image dataUrl/URL or Video embed/URL
  thumbnailUrl?: string;
  description?: string;
  youtubeId?: string;
  isFeatured?: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'sitakunda_media_gallery_v1';
export const MEDIA_SETTINGS_KEY = 'media_gallery';

let memoryMediaCache: MediaItem[] | null = null;

// Helper to extract YouTube video ID from various URL formats
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
};

// Initial default seed items showcasing Sitakunda Pourashava
export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'MEDIA-001',
    type: 'photo',
    title: 'সীতাকুণ্ড পৌরসভা কার্যালয় ভবন ও প্রশাসনিক ক্যাম্পাস',
    category: 'পৌর ভবন ও ক্যাম্পাস',
    date: '১২ সেপ্টেম্বর, ২০২৬',
    url: '/sitakunda-pourashava-bhaban.jpg',
    thumbnailUrl: '/sitakunda-pourashava-bhaban.jpg',
    description: 'সীতাকুণ্ড পৌরসভার মূল প্রশাসনিক কার্যালয় ভবন ও আধুনিক চত্বর, স্থাপিত ১৯৯৮ খ্রিঃ।',
    isFeatured: true,
    createdAt: '2026-09-12T00:00:00.000Z',
  },
  {
    id: 'MEDIA-002',
    type: 'video',
    title: 'সীতাকুণ্ড ডিজিটাল পৌরসভা ও স্মার্ট সিটি উদ্যোগ পরিচিতি',
    category: 'নগর পরিকল্পনা',
    date: '০৮ সেপ্টেম্বর, ২০২৬',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    description: 'সীতাকুণ্ড পৌরসভার ডিজিটাল নাগরিক সেবা, ভূমি ডিমার্কেশন যাচাই ও স্মার্ট সিটি উন্নয়ন কার্যক্রম।',
    isFeatured: true,
    createdAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'MEDIA-003',
    type: 'photo',
    title: 'পৌরসভা চত্বরে ডলফিন স্মৃতিস্মারক ও সবুজ উদ্যান',
    category: 'পৌর ভবন ও ক্যাম্পাস',
    date: '০৫ সেপ্টেম্বর, ২০২৬',
    url: '/sitakunda-pourashava-bhaban.jpg',
    thumbnailUrl: '/sitakunda-pourashava-bhaban.jpg',
    description: 'সীতাকুণ্ড পৌরসভা কার্যালয়ের সামনের নান্দনিক ডলফিন ফোয়ারা ও নয়নাভিরাম বৃক্ষশোভিত চত্বর।',
    isFeatured: false,
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'MEDIA-004',
    type: 'video',
    title: 'সীতাকুণ্ড পৌর এলাকার ড্রোন ভিউ ও প্রাকৃতিক ভূপ্রকৃতি',
    category: 'প্রাকৃতিক দৃশ্য',
    date: '০১ সেপ্টেম্বর, ২০২৬',
    url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    youtubeId: 'ysz5S6PUM-U',
    thumbnailUrl: 'https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg',
    description: 'পাহাড় ও সমুদ্রের মিলনস্থল ঐতিহ্যবাহী সীতাকুণ্ড পৌর এলাকার পাখির চোখে নয়নাভিরাম ড্রোন চিত্র।',
    isFeatured: false,
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'MEDIA-005',
    type: 'photo',
    title: 'ডিজিটাল নাগরিক সেবা কেন্দ্র ও ওয়ান-স্টপ কাউন্টার',
    category: 'নাগরিক সেবা',
    date: '২৫ আগস্ট, ২০২৬',
    url: '/logo.png',
    thumbnailUrl: '/logo.png',
    description: 'সীতাকুণ্ড পৌরসভার নাগরিকদের দ্রুত ও স্বাচ্ছন্দ্যে সনদ এবং সেবা প্রদানের ডিজিটাল হেল্পডেস্ক।',
    isFeatured: false,
    createdAt: '2026-08-25T14:30:00.000Z',
  },
];

export const getStoredMediaItems = (): MediaItem[] => {
  if (memoryMediaCache && Array.isArray(memoryMediaCache) && memoryMediaCache.length > 0) {
    return memoryMediaCache;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryMediaCache = DEFAULT_MEDIA_ITEMS;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ITEMS));
      } catch {}
      return DEFAULT_MEDIA_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryMediaCache = parsed;
      return parsed;
    }
  } catch {}

  memoryMediaCache = DEFAULT_MEDIA_ITEMS;
  return DEFAULT_MEDIA_ITEMS;
};

/**
 * Save updated media list to memory, localStorage, dispatch update event, and sync with database
 */
export const persistMediaItems = (items: MediaItem[]): boolean => {
  memoryMediaCache = items;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[MediaStorage] LocalStorage quota warning, stripping large embedded images:', err);
    try {
      const lightweightItems = items.map((it) => {
        if (it.url && it.url.startsWith('data:') && it.url.length > 50000) {
          return {
            ...it,
            url: it.thumbnailUrl && !it.thumbnailUrl.startsWith('data:') ? it.thumbnailUrl : '/sitakunda-pourashava-bhaban.jpg',
            thumbnailUrl: '/sitakunda-pourashava-bhaban.jpg'
          };
        }
        return it;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightItems));
    } catch {
      // Memory cache is already updated, UI continues smoothly
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: items }));
  } catch (evErr) {
    console.warn('[MediaStorage] dispatchEvent error:', evErr);
  }

  // Background sync with Hostinger MySQL / server API
  savePortalConfigToApi(items, MEDIA_SETTINGS_KEY).catch((err) => {
    console.warn('[Hostinger Media Sync] Save warning:', err);
  });

  return true;
};

/**
 * Direct async persistence to guarantee database update confirmation
 */
export const persistMediaItemsAsync = async (items: MediaItem[]): Promise<boolean> => {
  persistMediaItems(items);
  try {
    return await savePortalConfigToApi(items, MEDIA_SETTINGS_KEY);
  } catch (err) {
    console.warn('[MediaStorage] persistMediaItemsAsync API warning:', err);
    return false;
  }
};

export const saveMediaItem = (item: Omit<MediaItem, 'id' | 'createdAt'>): { newItem: MediaItem; allItems: MediaItem[] } => {
  const current = getStoredMediaItems();
  const newItem: MediaItem = {
    ...item,
    id: `MEDIA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current.filter((i) => i.id !== newItem.id)];
  persistMediaItems(updated);
  return { newItem, allItems: updated };
};

export const updateMediaItem = (updatedItem: MediaItem): MediaItem[] => {
  const current = getStoredMediaItems();
  const updated = current.map((item) => (item.id === updatedItem.id ? updatedItem : item));
  persistMediaItems(updated);
  return updated;
};

export const deleteMediaItem = (id: string): MediaItem[] => {
  const current = getStoredMediaItems();
  const updated = current.filter((item) => item.id !== id);
  persistMediaItems(updated);
  return updated;
};

export const resetToDefaultMedia = (): MediaItem[] => {
  persistMediaItems(DEFAULT_MEDIA_ITEMS);
  return DEFAULT_MEDIA_ITEMS;
};

/**
 * Synchronize media gallery items with Hostinger MySQL server / local settings API
 */
export async function syncMediaGalleryWithHostinger(): Promise<MediaItem[] | null> {
  try {
    const remote = await fetchPortalConfigFromApi<MediaItem[]>(MEDIA_SETTINGS_KEY);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      memoryMediaCache = remote;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: remote }));
      } catch {}
      return remote;
    }
  } catch (err) {
    console.warn('[Hostinger Media Gallery Sync] Error:', err);
  }
  return null;
}
