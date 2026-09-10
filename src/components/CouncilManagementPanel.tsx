import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  RotateCcw, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertCircle,
  Save,
  X,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import { 
  CouncilMember, 
  CouncilCategory, 
  COUNCIL_CATEGORIES_META, 
  DEFAULT_PORTAL_CONFIG,
  getPortalConfig,
  savePortalConfig
} from '../utils/portalConfig';

interface CouncilManagementPanelProps {
  onSuccessNotification?: (msg: string) => void;
}

export const CouncilManagementPanel: React.FC<CouncilManagementPanelProps> = ({
  onSuccessNotification
}) => {
  const [config, setConfig] = useState(() => getPortalConfig());
  const [members, setMembers] = useState<CouncilMember[]>(config.councilMembers || []);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CouncilCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Form Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(null);

  const [formData, setFormData] = useState<Partial<CouncilMember>>({
    category: 'administrator',
    name: '',
    designation: '',
    wardOrDepartment: '',
    phone: '',
    email: '',
    imageUrl: '',
    bioOrSpeech: '',
    joiningDate: '',
    displayOrder: 1
  });

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ২ মেগাবাইট হতে হবে');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = (cat?: CouncilCategory) => {
    setEditingMember(null);
    setFormData({
      category: cat || (selectedCategoryFilter !== 'all' ? selectedCategoryFilter : 'administrator'),
      name: '',
      designation: '',
      wardOrDepartment: '',
      phone: '',
      email: '',
      imageUrl: '',
      bioOrSpeech: '',
      joiningDate: '',
      displayOrder: (members.length + 1)
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (member: CouncilMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsFormModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.designation?.trim()) {
      alert('অনুগ্রহ করে নাম এবং পদবি পূরণ করুন');
      return;
    }

    let updatedList: CouncilMember[];
    if (editingMember) {
      // update
      updatedList = members.map(m => m.id === editingMember.id ? ({
        ...m,
        ...formData,
        name: formData.name!.trim(),
        designation: formData.designation!.trim(),
        displayOrder: Number(formData.displayOrder) || 1
      } as CouncilMember) : m);
    } else {
      // create
      const newMember: CouncilMember = {
        id: `council-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: (formData.category as CouncilCategory) || 'administrator',
        name: formData.name!.trim(),
        designation: formData.designation!.trim(),
        wardOrDepartment: formData.wardOrDepartment || '',
        phone: formData.phone || '',
        email: formData.email || '',
        imageUrl: formData.imageUrl || '',
        bioOrSpeech: formData.bioOrSpeech || '',
        joiningDate: formData.joiningDate || '',
        displayOrder: Number(formData.displayOrder) || (members.length + 1)
      };
      updatedList = [...members, newMember];
    }

    setMembers(updatedList);
    saveUpdatedMembers(updatedList);
    setIsFormModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${name}"-এর প্রোফাইল মুছে ফেলতে চান?`)) {
      const updatedList = members.filter(m => m.id !== id);
      setMembers(updatedList);
      saveUpdatedMembers(updatedList);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('আপনি কি সকল পরিষদ ও কর্মকর্তা প্রোফাইল প্রাথমিক ডিফল্ট তালিকায় ফিরিয়ে নিতে চান? বর্তমান সকল কাস্টম পরিবর্তন মুছে যাবে।')) {
      const defaultList = [...DEFAULT_PORTAL_CONFIG.councilMembers];
      setMembers(defaultList);
      saveUpdatedMembers(defaultList);
      if (onSuccessNotification) {
        onSuccessNotification('ডিফল্ট পরিষদ ও কর্মকর্তা তথ্য সফলভাবে পুনরুদ্ধার করা হয়েছে');
      }
    }
  };

  const saveUpdatedMembers = (newMembers: CouncilMember[]) => {
    const currentConf = getPortalConfig();
    const updatedConf = {
      ...currentConf,
      councilMembers: newMembers
    };
    savePortalConfig(updatedConf);
    setConfig(updatedConf);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onSuccessNotification) {
      onSuccessNotification('বর্তমান পরিষদ তথ্য সফলভাবে সংরক্ষিত হয়েছে');
    }
  };

  const filteredMembers = members
    .filter(m => selectedCategoryFilter === 'all' || m.category === selectedCategoryFilter)
    .filter(m => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.wardOrDepartment && m.wardOrDepartment.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q))
      );
    })
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-300" />
            <h3 className="text-lg font-bold">বর্তমান পরিষদ ও কর্মকর্তা প্রোফাইল ব্যবস্থাপনা</h3>
            {isSaved && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                <Check className="w-3 h-3" /> সংরক্ষিত
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            ওয়েবসাইটে প্রদর্শিত সকল প্রশাসক, প্যানেল মেয়র, কাউন্সিলর, কর্মকর্তা ও কর্মচারীদের প্রোফাইল কাস্টমাইজ করুন
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রোফাইল যোগ করুন</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="ডিফল্ট ডাটাতে রিস্টোর করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিস্টোর</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Category Pills */}
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
            সকল বিভাগ ({members.length})
          </button>
          {COUNCIL_CATEGORIES_META.map(c => {
            const count = members.filter(m => m.category === c.category).length;
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

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-600">কোনো প্রোফাইল পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">
              উপরে "নতুন প্রোফাইল যোগ করুন" বাটনে ক্লিক করে প্রোফাইল যুক্ত করুন
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const catMeta = COUNCIL_CATEGORIES_META.find(c => c.category === member.category);
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category tag and Action buttons */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {catMeta?.shortLabel || member.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(member)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="flex items-start gap-3">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {member.name.slice(0, 2)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-700 truncate mt-0.5">
                          {member.designation}
                        </p>
                        {member.wardOrDepartment && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {member.wardOrDepartment}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio snippet */}
                    {member.bioOrSpeech && (
                      <p className="text-xs text-slate-500 italic mt-3 bg-slate-50 p-2 rounded-lg line-clamp-2">
                        "{member.bioOrSpeech}"
                      </p>
                    )}
                  </div>

                  {/* Contact Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-slate-700">{member.phone || 'ফোন নেই'}</span>
                    <span className="text-[10px] text-slate-400 font-bold">ক্রম: #{member.displayOrder || 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Top */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h4 className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-300" />
                {editingMember ? 'প্রোফাইল সম্পাদনা করুন' : 'নতুন প্রোফাইল যোগ করুন'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveMember} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিভাগ / ক্যাটাগরি *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CouncilCategory })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  {COUNCIL_CATEGORIES_META.map(c => (
                    <option key={c.category} value={c.category}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name and Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নাম *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: জনাব মোহাম্মদ রফিকুল ইসলাম"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পদবি *
                  </label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="যেমন: কাউন্সিলর, ০১ নং ওয়ার্ড"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Ward or Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ওয়ার্ড / শাখা / বিভাগ
                  </label>
                  <input
                    type="text"
                    value={formData.wardOrDepartment || ''}
                    onChange={(e) => setFormData({ ...formData, wardOrDepartment: e.target.value })}
                    placeholder="যেমন: ০১ নং ওয়ার্ড অথবা প্রকৌশল শাখা"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    দায়িত্ব গ্রহণ / যোগদানের তারিখ
                  </label>
                  <input
                    type="text"
                    value={formData.joiningDate || ''}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    placeholder="যেমন: জানুয়ারি ২০২১"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Contact (Phone & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@sitakundapourashava.gov.bd"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Picture Upload / Image URL & Display Order */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  কর্মকর্তা / কাউন্সিলরের ছবি (Picture)
                </label>
                
                <div className="flex items-center gap-4">
                  {formData.imageUrl ? (
                    <div className="relative shrink-0">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-600 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow"
                        title="ছবি মুছে ফেলুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-60" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                        <span>কম্পিউটার/মোবাইল থেকে ছবি আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">(সর্বোচ্চ ২ MB)</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="অথবা সরাসরি ছবির লিঙ্ক/URL পেস্ট করুন..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    তালিকায় প্রদর্শনের ক্রম (Display Order):
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder ?? 1}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-24 px-3 py-1 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Bio / Message / Speech */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বক্তব্য / সংক্ষিপ্ত পরিচিতি (ঐচ্ছিক)
                </label>
                <textarea
                  value={formData.bioOrSpeech || ''}
                  onChange={(e) => setFormData({ ...formData, bioOrSpeech: e.target.value })}
                  rows={3}
                  placeholder="পৌর নাগরিকদের উদ্দেশ্যে বার্তা অথবা সংক্ষিপ্ত পরিচিতি..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
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
                  <span>{editingMember ? 'আপডেট সংরক্ষণ করুন' : 'প্রোফাইল যোগ করুন'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
