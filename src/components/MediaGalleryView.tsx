import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Play, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Download, 
  Eye, 
  Film,
  Building,
  ArrowLeft
} from 'lucide-react';
import { 
  MediaItem, 
  MediaType, 
  getStoredMediaItems,
  syncMediaGalleryWithHostinger,
  extractYoutubeId
} from '../utils/mediaGalleryStorage';

interface MediaGalleryViewProps {
  onBackToHome?: () => void;
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({ onBackToHome }) => {
  const [items, setItems] = useState<MediaItem[]>(getStoredMediaItems);
  const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [activePhoto, setActivePhoto] = useState<MediaItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  useEffect(() => {
    syncMediaGalleryWithHostinger()
      .then((remote) => {
        if (remote !== null && Array.isArray(remote)) {
          setItems(remote);
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      setItems(getStoredMediaItems());
    };
    window.addEventListener('media-gallery-updated', handleUpdate);
    return () => window.removeEventListener('media-gallery-updated', handleUpdate);
  }, []);

  // Unique categories
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  // Filtered items
  const filteredItems = items.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const photoCount = items.filter(i => i.type === 'photo').length;
  const videoCount = items.filter(i => i.type === 'video').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up pb-12">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-500/40 bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white p-6 sm:p-8 lg:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/40 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>সীতাকুণ্ড পৌরসভা ডিজিটাল আর্কাইভ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              মিডিয়া, ছবি ও ভিডিও গ্যালারি
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              সীতাকুণ্ড পৌরসভার প্রশাসনিক ভবন, উন্নয়নমূলক কর্মকাণ্ড, নাগরিক সেবা, প্রাকৃতিক সৌন্দর্য ও অফিসিয়াল ভিডিও প্রতিবেদন।
            </p>
          </div>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল হোমে ফিরুন</span>
            </button>
          )}
        </div>

        {/* Filter and Stats Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Type Tabs */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>সকল মিডিয়া ({items.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('photo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'photo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ছবি ({photoCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'video'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>ভিডিও ({videoCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <input
              type="text"
              placeholder="শিরোনাম বা ক্যাটেগরি খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-emerald-200/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>ক্যাটেগরি:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'সবগুলো' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার অনুসন্ধান বা নির্বাচিত ক্যাটেগরির সাথে মিল রেখে কোনো ছবি বা ভিডিও পাওয়া যায়নি।
          </p>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            সকল ফিল্টার ক্লিয়ার করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => {
            const isVideo = item.type === 'video';
            const ytId = item.youtubeId || (isVideo ? extractYoutubeId(item.url) : null);
            const thumb = isVideo
              ? (item.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/logo.png'))
              : item.url;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Media Preview Container */}
                <div 
                  className="relative aspect-16/10 bg-slate-900 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (isVideo) setActiveVideo(item);
                    else setActivePhoto(item);
                  }}
                >
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    onError={(e: any) => { e.target.src = '/sitakunda-pourashava-bhaban.jpg'; }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Type Badge Top Left */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md backdrop-blur-md ${
                      isVideo 
                        ? 'bg-purple-900/90 text-purple-200 border border-purple-400/40'
                        : 'bg-emerald-950/90 text-emerald-200 border border-emerald-400/40'
                    }`}>
                      {isVideo ? <Video className="w-3 h-3 text-purple-300" /> : <Camera className="w-3 h-3 text-emerald-300" />}
                      <span>{isVideo ? 'ভিডিও' : 'ছবি'}</span>
                    </span>

                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>বিশেষ</span>
                      </span>
                    )}
                  </div>

                  {/* Play Button for Video */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-13 h-13 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-purple-500 transition-all ring-4 ring-white/30">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Zoom Icon for Photo */}
                  {!isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg ring-2 ring-white/40">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Date & Category on bottom of image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">
                      {item.category || 'পৌরসভা'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-200 font-medium">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{item.date}</span>
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 
                      onClick={() => {
                        if (isVideo) setActiveVideo(item);
                        else setActivePhoto(item);
                      }}
                      className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">
                      সীতাকুণ্ড পৌরসভা
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isVideo) setActiveVideo(item);
                        else setActivePhoto(item);
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                        isVideo
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {isVideo ? (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>ভিডিও দেখুন</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>বড় করে দেখুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/50 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                  {activePhoto.category} &bull; {activePhoto.date}
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">{activePhoto.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer font-bold shadow-md"
              >
                ✕
              </button>
            </div>

            {/* Photo */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-1 sm:p-2">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-950 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 shrink-0">
              <p className="text-xs text-slate-300 max-w-xl">
                {activePhoto.description || 'সীতাকুণ্ড পৌরসভা কার্যালয় ও নাগরিক সেবা ডিজিটাল পোর্টাল'}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.url}
                  download={activePhoto.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Lightbox Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/50 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>{activeVideo.category} &bull; {activeVideo.date}</span>
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">{activeVideo.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer font-bold shadow-md"
              >
                ✕
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-16/9 bg-black w-full overflow-hidden">
              {activeVideo.youtubeId || extractYoutubeId(activeVideo.url) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId || extractYoutubeId(activeVideo.url)}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  আপনার ব্রাউজারে ভিডিও প্লেয়ার সমর্থিত নয়।
                </video>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-950 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 shrink-0">
              <p className="text-xs text-slate-300 max-w-xl">
                {activeVideo.description || 'সীতাকুণ্ড পৌরসভা কার্যালয় ও নাগরিক সেবা ডিজিটাল ভিডিও'}
              </p>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGalleryView;
