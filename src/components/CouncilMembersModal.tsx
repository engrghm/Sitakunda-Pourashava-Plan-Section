import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ExternalLink,
  Search,
  UserCheck,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { CouncilMember, CouncilCategory, COUNCIL_CATEGORIES_META } from '../utils/portalConfig';

interface CouncilMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CouncilCategory | null;
  members: CouncilMember[];
  isAdminLoggedIn: boolean;
  onOpenAdminPanel?: () => void;
}

export const CouncilMembersModal: React.FC<CouncilMembersModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  members,
  isAdminLoggedIn,
  onOpenAdminPanel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CouncilCategory>(
    initialCategory || 'administrator'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Update selectedCategory when initialCategory prop changes
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  if (!isOpen) return null;

  const currentCategoryMeta = COUNCIL_CATEGORIES_META.find(c => c.category === selectedCategory) || COUNCIL_CATEGORIES_META[0];

  const filteredMembers = members
    .filter(m => m.category === selectedCategory)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between border-b border-emerald-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  বর্তমান পরিষদ ও কর্মকর্তা প্রোফাইল
                </h3>
                <span className="bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  সীতাকুণ্ড পৌরসভা
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                জনপ্রতিনিধি, নির্বাহী কর্মকর্তা ও কর্মচারীবৃন্দের তথ্য ও যোগাযোগ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && onOpenAdminPanel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>প্রোফাইল সম্পাদনা</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="bg-emerald-950 px-4 sm:px-6 py-2.5 border-b border-emerald-800/80 shrink-0 overflow-x-auto flex items-center gap-2 scrollbar-thin">
          {COUNCIL_CATEGORIES_META.map((cat) => {
            const count = members.filter(m => m.category === cat.category).length;
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.category);
                  setSearchQuery('');
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/50'
                    : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border border-emerald-700/50'
                }`}
              >
                <span>› {cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/20 text-emerald-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Description & Search Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              {currentCategoryMeta.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentCategoryMeta.description}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Members Grid / List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-50/50 to-white">
          {filteredMembers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">কোন প্রোফাইল পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'অনুসন্ধান ফিল্টারে অন্য কোনো নাম লিখে চেষ্টা করুন' : 'অ্যাডমিন প্যানেল থেকে প্রোফাইল যোগ করুন'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${
              selectedCategory === 'administrator' || selectedCategory === 'executive_officer'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header with Avatar & Badge */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-600/30 group-hover:border-emerald-600 transition-colors shadow-sm"
                            onError={(e) => {
                              // fallback on load error
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 border-2 border-emerald-600/30 flex items-center justify-center text-emerald-800 font-bold text-xl">
                            {member.name.slice(0, 2)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] shadow">
                          <UserCheck className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                          {member.wardOrDepartment || currentCategoryMeta.shortLabel}
                        </span>
                        <h5 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                          {member.name}
                        </h5>
                        <p className="text-xs font-medium text-emerald-700 mt-0.5">
                          {member.designation}
                        </p>
                        {member.joiningDate && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>দায়িত্ব গ্রহণ: {member.joiningDate}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio or Speech */}
                    {member.bioOrSpeech && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs leading-relaxed italic line-clamp-3">
                        "{member.bioOrSpeech}"
                      </div>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 hover:text-emerald-700 font-mono transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Phone className="w-3 h-3" />
                        </div>
                        <span className="truncate">{member.phone}</span>
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 hover:text-teal-700 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                          <Mail className="w-3 h-3" />
                        </div>
                        <span className="truncate font-mono text-[11px]">{member.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>সীতাকুণ্ড পৌরসভা তথ্য বাতায়ন &bull; এই তথ্যসমূহ সম্মানিত নাগরিকদের অবগতির জন্য সার্বক্ষণিক হালনাগাদ করা হয়</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
