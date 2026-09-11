import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  Search, 
  FileText, 
  Calendar, 
  Save, 
  X, 
  RotateCcw,
  Tag,
  Paperclip,
  Upload,
  ExternalLink
} from 'lucide-react';
import { 
  NoticeItem, 
  NoticeCategory, 
  NOTICE_CATEGORIES_META, 
  DEFAULT_PORTAL_CONFIG,
  getPortalConfig, 
  savePortalConfig 
} from '../utils/portalConfig';
import { getOfficerSession } from '../utils/storage';
import { uploadFileToServer, savePortalConfigToApi } from '../utils/apiStorage';

interface NoticeManagementPanelProps {
  onSuccessNotification?: (msg: string) => void;
}

export const NoticeManagementPanel: React.FC<NoticeManagementPanelProps> = ({
  onSuccessNotification
}) => {
  const [config, setConfig] = useState(() => getPortalConfig());
  const [notices, setNotices] = useState<NoticeItem[]>(config.noticesList || []);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<NoticeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Form Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  const [formData, setFormData] = useState<Partial<NoticeItem>>({
    category: 'notice',
    title: '',
    memoNo: '',
    publishDate: new Date().toISOString().split('T')[0],
    description: '',
    fileUrl: '',
    isImportant: false
  });
  const [pdfUploading, setPdfUploading] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('অনুগ্রহ করে শুধুমাত্র PDF ফাইল আপলোড করুন');
      e.target.value = '';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('ফাইলের সাইজ ১৫ MB এর বেশি হতে পারবে না');
      e.target.value = '';
      return;
    }

    setPdfUploading(true);
    try {
      const res = await uploadFileToServer(file);
      if (res && res.fileUrl) {
        setFormData(prev => ({ ...prev, fileUrl: res.fileUrl }));
      } else {
        // Fallback to FileReader DataURL
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setFormData(prev => ({ ...prev, fileUrl: reader.result as string }));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Resilient fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, fileUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setPdfUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenAddModal = (cat?: NoticeCategory) => {
    setEditingNotice(null);
    setFormData({
      category: cat || (selectedCategoryFilter !== 'all' ? selectedCategoryFilter : 'notice'),
      title: '',
      memoNo: `সীকপ/বিজ্ঞপ্তি/${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      publishDate: new Date().toISOString().split('T')[0],
      description: '',
      fileUrl: '',
      isImportant: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setFormData({ ...notice });
    setIsFormModalOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const session = getOfficerSession();
    if (!session?.username) {
      alert('অননুমোদিত চেষ্টা! নোটিশ বা টেন্ডার তৈরি/সম্পাদনা করতে অফিসিয়াল কর্মকর্তা আইডিতে লগইন করা আবশ্যক।');
      return;
    }

    if (!formData.title?.trim()) {
      alert('অনুগ্রহ করে নোটিশের শিরোনাম লিখুন');
      return;
    }

    let updatedList: NoticeItem[];
    if (editingNotice) {
      updatedList = notices.map(n => n.id === editingNotice.id ? ({
        ...n,
        ...formData,
        title: formData.title!.trim(),
        memoNo: formData.memoNo?.trim() || '',
        description: formData.description?.trim() || '',
      } as NoticeItem) : n);
    } else {
      const newNotice: NoticeItem = {
        id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: (formData.category as NoticeCategory) || 'notice',
        title: formData.title!.trim(),
        memoNo: formData.memoNo?.trim() || '',
        publishDate: formData.publishDate || new Date().toISOString().split('T')[0],
        description: formData.description?.trim() || '',
        fileUrl: formData.fileUrl || '',
        isImportant: Boolean(formData.isImportant)
      };
      updatedList = [newNotice, ...notices];
    }

    setNotices(updatedList);
    saveUpdatedNotices(updatedList);
    setIsFormModalOpen(false);
    setEditingNotice(null);
  };

  const handleDeleteNotice = (id: string, title: string) => {
    const session = getOfficerSession();
    if (!session?.username) {
      alert('অননুমোদিত চেষ্টা! নোটিশ মুছে ফেলতে অফিসিয়াল কর্মকর্তা আইডিতে লগইন করা আবশ্যক।');
      return;
    }

    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" নোটিশটি মুছে ফেলতে চান?`)) {
      const updatedList = notices.filter(n => n.id !== id);
      setNotices(updatedList);
      saveUpdatedNotices(updatedList);
    }
  };

  const handleResetToDefaults = () => {
    const session = getOfficerSession();
    if (!session?.username) {
      alert('অননুমোদিত চেষ্টা! নোটিশ রিস্টোর করতে অফিসিয়াল কর্মকর্তা আইডিতে লগইন করা আবশ্যক।');
      return;
    }

    if (window.confirm('আপনি কি সকল নোটিশ ডিফল্ট তালিকায় পুনরুদ্ধার করতে চান?')) {
      const defaultList = [...(DEFAULT_PORTAL_CONFIG.noticesList || [])];
      setNotices(defaultList);
      saveUpdatedNotices(defaultList);
      if (onSuccessNotification) {
        onSuccessNotification('ডিফল্ট নোটিশসমূহ সফলভাবে রিস্টোর করা হয়েছে');
      }
    }
  };

  const saveUpdatedNotices = async (newNotices: NoticeItem[]) => {
    const currentConf = getPortalConfig();
    const updatedConf = {
      ...currentConf,
      noticesList: newNotices
    };
    savePortalConfig(updatedConf);
    setConfig(updatedConf);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    const apiSuccess = await savePortalConfigToApi(updatedConf);
    if (onSuccessNotification) {
      if (apiSuccess) {
        onSuccessNotification('নোটিশ সংক্রান্ত পরিবর্তন সার্ভার ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        onSuccessNotification('নোটিশ সংক্রান্ত পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে');
      }
    }
  };

  const filteredNotices = notices
    .filter(n => selectedCategoryFilter === 'all' || n.category === selectedCategoryFilter)
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-300" />
            <h3 className="text-lg font-bold">নোটিশ, অফিস আদেশ ও টেন্ডার বিজ্ঞপ্তি ব্যবস্থাপনা</h3>
            {isSaved && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> সংরক্ষিত
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            পৌরসভার সাধারণ নোটিশ, প্রশাসনিক অফিস আদেশ এবং ই-দরপত্র (টেন্ডার) প্রকাশ ও সম্পাদনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন নোটিশ যোগ করুন</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="ডিফল্ট নোটিশে ফিরিয়ে নিন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিস্টোর</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            সকল বিভাগ ({notices.length})
          </button>
          {NOTICE_CATEGORIES_META.map(c => {
            const count = notices.filter(n => n.category === c.category).length;
            const isSelected = selectedCategoryFilter === c.category;
            return (
              <button
                key={c.category}
                type="button"
                onClick={() => setSelectedCategoryFilter(c.category)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {c.shortLabel} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিশ খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Notices Table / List */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {filteredNotices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">কোনো নোটিশ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">উপরে "নতুন নোটিশ যোগ করুন" বাটনে ক্লিক করে নোটিশ প্রকাশ করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((notice) => {
              const meta = NOTICE_CATEGORIES_META.find(c => c.category === notice.category);
              return (
                <div
                  key={notice.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {meta?.label || notice.category}
                      </span>
                      {notice.memoNo && (
                        <span className="text-xs font-mono text-slate-500">
                          স্মারক: {notice.memoNo}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>প্রকাশ: {notice.publishDate}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {notice.title}
                    </h4>

                    {notice.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notice.description}
                      </p>
                    )}

                    {notice.fileUrl && (
                      <a
                        href={notice.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 transition-colors mt-2"
                        download
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>PDF ডাউনলোড</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(notice)}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id, notice.title)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h4 className="text-base font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-300" />
                {editingNotice ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ যোগ করুন'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্যাটাগরি / ধরন *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  {NOTICE_CATEGORIES_META.map(c => (
                    <option key={c.category} value={c.category}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নোটিশের শিরোনাম *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: পৌর হোল্ডিং কর পরিশোধ সংক্রান্ত জরুরি বিজ্ঞপ্তি..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্মারক নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.memoNo || ''}
                    onChange={(e) => setFormData({ ...formData, memoNo: e.target.value })}
                    placeholder="সীকপ/প্রশা/২০২৬-..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রকাশের তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate || ''}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নোটিশের সংক্ষিপ্ত বিবরণ / মূল বিষয়বস্তু
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="বিজ্ঞপ্তির মূল বিষয় বা বিস্তারিত তথ্যাদি লিখুন..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-y"
                />
              </div>

              {/* PDF File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5 text-emerald-600" /> PDF সংযুক্ত ফাইল (সর্বোচ্চ ১৫ MB)</span>
                </label>
                {formData.fileUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-800 font-medium flex-1 truncate">পিডিএফ সফলভাবে সংযুক্ত হয়েছে ✓</span>
                    <button
                      type="button"
                      onClick={() => window.open(formData.fileUrl, '_blank')}
                      className="text-xs bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300 px-2 py-1 rounded font-semibold cursor-pointer"
                    >
                      প্রিভিউ
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fileUrl: '' }))}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="পিডিএফ সরান"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full px-3 py-3 text-xs border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="sr-only"
                    />
                    {pdfUploading ? (
                      <span className="text-slate-500 flex items-center gap-2">
                        <Upload className="w-4 h-4 animate-bounce text-emerald-600" />
                        লোড হচ্ছে...
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        PDF ফাইল বেছুন বা এখানে ড্র্যাগ করুন
                      </span>
                    )}
                  </label>
                )}
                {/* Also allow URL input */}
                <div className="mt-2">
                  <input
                    type="url"
                    value={formData.fileUrl?.startsWith('data:') ? '' : (formData.fileUrl || '')}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="অথবা PDF URL লিঙ্ক পেস্ট করুন (https://...)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 bg-slate-50"
                  />
                </div>
              </div>

              {/* Mark as Important Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notice-is-important"
                  checked={formData.isImportant || false}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="notice-is-important" className="text-xs font-medium text-slate-700 cursor-pointer">
                  গুরুত্বপূর্ণ নোটিশ হিসেবে চিহ্নিত করুন (শীর্ষে পিন থাকবে)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNotice ? 'আপডেট সংরক্ষণ করুন' : 'নোটিশ প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
