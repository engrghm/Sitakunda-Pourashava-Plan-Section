import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  FileText, 
  Calendar, 
  Search, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Tag,
  AlertCircle
} from 'lucide-react';
import { NoticeItem, NoticeCategory, NOTICE_CATEGORIES_META } from '../utils/portalConfig';
import { toBanglaNumber } from '../utils/storage';

interface NoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: NoticeCategory | null;
  notices: NoticeItem[];
}

export const NoticesModal: React.FC<NoticesModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  notices = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>(
    initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoticeForDetail, setSelectedNoticeForDetail] = useState<NoticeItem | null>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const filteredNotices = notices
    .filter(n => selectedCategory === 'all' || n.category === selectedCategory)
    .filter(n => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        (n.memoNo && n.memoNo.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const getCategoryBadge = (cat: NoticeCategory) => {
    switch (cat) {
      case 'office_order':
        return { label: 'অফিস আদেশ', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'tender':
        return { label: 'টেন্ডার নোটিশ', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'সাধারণ নোটিশ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  নোটিশ বোর্ড ও দাপ্তরিক আদেশ
                </h3>
                <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40">
                  সীতাকুণ্ড পৌরসভা
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                নাগরিক নোটিশ, প্রশাসনিক অফিস আদেশ এবং উন্নয়ন কাজের উন্মুক্ত দরপত্র
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Selector Pills */}
        <div className="bg-emerald-950 px-4 sm:px-6 py-2.5 border-b border-emerald-800/80 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50'
            }`}
          >
            <span>সকল নোটিশ</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-emerald-200">
              {notices.length}
            </span>
          </button>

          {NOTICE_CATEGORIES_META.map((meta) => {
            const count = notices.filter(n => n.category === meta.category).length;
            const isSelected = selectedCategory === meta.category;
            return (
              <button
                key={meta.category}
                type="button"
                onClick={() => setSelectedCategory(meta.category)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50'
                }`}
              >
                <span>› {meta.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-emerald-200">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নোটিশের শিরোনাম বা স্মারক নম্বর খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            মোট প্রদর্শিত: {toBanglaNumber(filteredNotices.length)} টি নোটিশ
          </span>
        </div>

        {/* Notices List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredNotices.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">কোনো নোটিশ পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">অন্য কোনো ক্যাটাগরি বা শব্দ দিয়ে অনুসন্ধান করুন</p>
            </div>
          ) : (
            filteredNotices.map((notice, idx) => {
              const badge = getCategoryBadge(notice.category);
              return (
                <div
                  key={notice.id || idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {notice.memoNo && (
                        <span className="text-[11px] font-mono text-slate-500">
                          স্মারক: {notice.memoNo}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>প্রকাশ: {notice.publishDate}</span>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {notice.title}
                    </h4>

                    {notice.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notice.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedNoticeForDetail(notice)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>সীতাকুণ্ড পৌরসভা ডিজিটাল নোটিশ বোর্ড</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {/* Notice Detail Single View Modal */}
      {selectedNoticeForDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 inline-block ${getCategoryBadge(selectedNoticeForDetail.category).color}`}>
                  {getCategoryBadge(selectedNoticeForDetail.category).label}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedNoticeForDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForDetail(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono py-1 border-b border-slate-100">
              {selectedNoticeForDetail.memoNo && <span>স্মারক নং: {selectedNoticeForDetail.memoNo}</span>}
              <span>প্রকাশের তারিখ: {selectedNoticeForDetail.publishDate}</span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 py-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
              {selectedNoticeForDetail.description || 'বিস্তারিত বিবরণ সংযুক্ত ফাইলে উল্লেখ রয়েছে।'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNoticeForDetail(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
