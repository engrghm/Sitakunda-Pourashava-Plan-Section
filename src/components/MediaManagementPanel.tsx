import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Plus, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Play, 
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  FileImage,
  Film
} from 'lucide-react';
import { 
  MediaItem, 
  MediaType, 
  getStoredMediaItems, 
  saveMediaItem, 
  deleteMediaItem, 
  resetToDefaultMedia,
  extractYoutubeId 
} from '../utils/mediaGalleryStorage';

interface MediaManagementPanelProps {
  onMediaChanged?: () => void;
}

export const MediaManagementPanel: React.FC<MediaManagementPanelProps> = ({ onMediaChanged }) => {
  const [items, setItems] = useState<MediaItem[]>(getStoredMediaItems);
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('পৌর ভবন ও ক্যাম্পাস');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('১২ সেপ্টেম্বর, ২০২৬');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // File upload state
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lightbox preview for testing
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredMediaItems());
    };
    window.addEventListener('media-gallery-updated', handleUpdate);
    return () => window.removeEventListener('media-gallery-updated', handleUpdate);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'ছবির সাইজ ৮ মেগাবাইটের বেশি হতে পারবে না।' });
      return;
    }

    setIsProcessingUpload(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedFilePreview(dataUrl);
      setUrl(dataUrl);
      setIsProcessingUpload(false);
      setStatusMsg({ type: 'success', text: `ছবি সফলভাবে লোড হয়েছে: ${file.name}` });
    };
    reader.onerror = () => {
      setIsProcessingUpload(false);
      setStatusMsg({ type: 'error', text: 'ছবি রিড করতে ব্যর্থ হয়েছে।' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে মিডিয়ার শিরোনাম লিখুন।' });
      return;
    }

    const finalUrl = url.trim();
    if (!finalUrl) {
      setStatusMsg({ type: 'error', text: mediaType === 'photo' ? 'অনুগ্রহ করে ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন।' : 'অনুগ্রহ করে ভিডিওর ইউটিউব বা ভিডিও লিঙ্ক দিন।' });
      return;
    }

    const finalCategory = customCategory.trim() || category || 'পৌরসভা';
    const ytId = mediaType === 'video' ? extractYoutubeId(finalUrl) : null;
    const thumbUrl = mediaType === 'video'
      ? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/logo.png')
      : finalUrl;

    try {
      saveMediaItem({
        type: mediaType,
        title: title.trim(),
        category: finalCategory,
        date: date.trim() || '১২ সেপ্টেম্বর, ২০২৬',
        url: finalUrl,
        thumbnailUrl: thumbUrl,
        description: description.trim(),
        youtubeId: ytId || undefined,
        isFeatured,
      });

      // Reset form
      setTitle('');
      setUrl('');
      setUploadedFilePreview(null);
      setDescription('');
      setIsFeatured(false);
      setStatusMsg({ type: 'success', text: 'নতুন মিডিয়া আইটেম সফলভাবে গ্যালারিতে যুক্ত হয়েছে!' });
      onMediaChanged?.();
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg({ type: 'error', text: 'মিডিয়া সংরক্ষণে সমস্যা হয়েছে।' });
    }
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${itemTitle}" আইটেমটি গ্যালারি থেকে মুছে ফেলতে চান?`)) {
      deleteMediaItem(id);
      setStatusMsg({ type: 'success', text: 'আইটেমটি সফলভাবে মুছে ফেলা হয়েছে।' });
      onMediaChanged?.();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('আপনি কি গ্যালারি রিসেট করে ডিফল্ট নমুনা ছবি ও ভিডিও ফিরিয়ে আনতে চান?')) {
      resetToDefaultMedia();
      setStatusMsg({ type: 'success', text: 'ডিফল্ট মিডিয়া ডাটা রিস্টোর সম্পন্ন হয়েছে।' });
      onMediaChanged?.();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              গ্যালারি ও ভিডিও ব্যবস্থাপনা প্যানেল
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              নাগরিক পোর্টালে প্রদর্শনের জন্য নতুন ছবি আপলোড ও অফিসিয়াল ভিডিও লিংক যুক্ত করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="নমুনা ছবি ও ভিডিও রিস্টোর করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>নমুনা ডাটা রিস্টোর</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Form Card: Add New Media */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <h3 className="text-base font-bold text-slate-900">নতুন মিডিয়া (ছবি / ভিডিও) আপলোড ও সংযোজন</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media Type Selection */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">মিডিয়ার ধরণ:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMediaType('photo');
                  setUrl('');
                  setUploadedFilePreview(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaType === 'photo'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ছবি (Photo)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setUrl('');
                  setUploadedFilePreview(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>ভিডিও (Video)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                শিরোনাম / বিষয়বস্তু *
              </label>
              <input
                type="text"
                required
                placeholder={mediaType === 'photo' ? 'যেমন: সীতাকুণ্ড পৌরসভা কার্যালয় ভবন ও ক্যাম্পাস' : 'যেমন: সীতাকুণ্ড পৌর এলাকা ড্রোন ভিউ ভিডিও'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                ক্যাটেগরি *
              </label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="পৌর ভবন ও ক্যাম্পাস">পৌর ভবন ও ক্যাম্পাস</option>
                  <option value="নাগরিক সেবা">নাগরিক সেবা</option>
                  <option value="উন্নয়ন ও পরিবেশ">উন্নয়ন ও পরিবেশ</option>
                  <option value="নগর পরিকল্পনা">নগর পরিকল্পনা</option>
                  <option value="প্রাকৃতিক দৃশ্য">প্রাকৃতিক দৃশ্য</option>
                  <option value="অন্যান্য">অন্যান্য / নতুন লিখুন</option>
                </select>

                {category === 'অন্যান্য' && (
                  <input
                    type="text"
                    placeholder="ক্যাটেগরির নাম..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-36 px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                তারিখ / সময়কাল
              </label>
              <input
                type="text"
                placeholder="যেমন: ১২ সেপ্টেম্বর, ২০২৬"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Media URL / Source */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {mediaType === 'photo' ? 'ছবির ফাইল আপলোড অথবা ওয়েব লিংক' : 'ইউটিউব ভিডিও বা ডিরেক্ট ভিডিও লিঙ্ক *'}
              </label>

              {mediaType === 'photo' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl cursor-pointer text-xs font-bold transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{isProcessingUpload ? 'ছবি প্রসেস হচ্ছে...' : 'ছবি ফাইল পছন্দ করুন (Browse)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="বা ছবির URL পেস্ট করুন..."
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setUploadedFilePreview(e.target.value);
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {uploadedFilePreview && (
                    <div className="relative w-28 h-20 rounded-xl border border-emerald-300 overflow-hidden shadow-xs">
                      <img src={uploadedFilePreview} alt="প্রিভিউ" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5 font-bold">
                        নির্বাচিত ছবি
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    * ইউটিউব ভিডিও লিঙ্ক দিলে স্বয়ংক্রিয়ভাবে ভিডিও থাম্বনেইল তৈরি হয়ে যাবে।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              placeholder="মিডিয়ার প্রেক্ষাপট, স্থান বা অনুষ্ঠানের সংক্ষিপ্ত বিবরণ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Featured Checkbox & Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>বিশেষ ফিচার্ড মিডিয়া হিসেবে চিহ্নিত করুন</span>
              </span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>গ্যালারিতে যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Items Table / Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              বর্তমান গ্যালারি মিডিয়া তালিকা ({items.length} টি)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            ছবি: {items.filter(i => i.type === 'photo').length} টি &bull; ভিডিও: {items.filter(i => i.type === 'video').length} টি
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            বর্তমানে কোনো মিডিয়া আইটেম সংরক্ষিত নেই। উপরের ফরম থেকে নতুন ছবি বা ভিডিও যুক্ত করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const isVideo = item.type === 'video';
              const ytId = item.youtubeId || (isVideo ? extractYoutubeId(item.url) : null);
              const thumb = isVideo
                ? (item.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/logo.png'))
                : item.url;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Thumbnail */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.src = '/sitakunda-pourashava-bhaban.jpg'; }}
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                        isVideo ? 'bg-purple-700' : 'bg-emerald-700'
                      }`}>
                        {isVideo ? 'ভিডিও' : 'ছবি'}
                      </span>
                      {item.isFeatured && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-400 text-slate-950">
                          ফিচার্ড
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {item.date}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-4 text-white space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-emerald-400">{previewItem.category} &bull; {previewItem.date}</span>
              <button 
                type="button" 
                onClick={() => setPreviewItem(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold">{previewItem.title}</h4>
            <div className="rounded-xl overflow-hidden bg-black aspect-16/10 flex items-center justify-center">
              {previewItem.type === 'video' ? (
                previewItem.youtubeId || extractYoutubeId(previewItem.url) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${previewItem.youtubeId || extractYoutubeId(previewItem.url)}?autoplay=1`}
                    title={previewItem.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video src={previewItem.url} controls className="w-full h-full object-contain" />
                )
              ) : (
                <img src={previewItem.url} alt={previewItem.title} className="w-full h-full object-contain" />
              )}
            </div>
            {previewItem.description && (
              <p className="text-xs text-slate-300">{previewItem.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagementPanel;
