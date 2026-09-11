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

// Helper to extract YouTube video ID from various URL formats
export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ITEMS));
      return DEFAULT_MEDIA_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_MEDIA_ITEMS;
  } catch {
    return DEFAULT_MEDIA_ITEMS;
  }
};

export const saveMediaItem = (item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem => {
  const current = getStoredMediaItems();
  const newItem: MediaItem = {
    ...item,
    id: `MEDIA-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: updated }));
  return newItem;
};

export const updateMediaItem = (updatedItem: MediaItem): void => {
  const current = getStoredMediaItems();
  const updated = current.map(item => item.id === updatedItem.id ? updatedItem : item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: updated }));
};

export const deleteMediaItem = (id: string): void => {
  const current = getStoredMediaItems();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: updated }));
};

export const resetToDefaultMedia = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ITEMS));
  window.dispatchEvent(new CustomEvent('media-gallery-updated', { detail: DEFAULT_MEDIA_ITEMS }));
};
