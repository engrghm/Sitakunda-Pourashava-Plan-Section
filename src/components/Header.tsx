import React from 'react';
import { 
  Home,
  FileText, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  Building2, 
  MapPin, 
  Sparkles, 
  Globe, 
  Construction,
  Clock,
  ChevronDown,
  Users,
  Bell
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { PortalConfig, CouncilCategory, NoticeCategory } from '../utils/portalConfig';

interface HeaderProps {
  activeTab: 'home' | 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin';
  setActiveTab: (tab: 'home' | 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
  isAdminLoggedIn: boolean;
  config: PortalConfig;
  onOpenCustomizer: () => void;
  onSelectCouncilCategory?: (category: CouncilCategory) => void;
  onSelectNoticeCategory?: (category: NoticeCategory) => void;
  onOpenProjects?: () => void;
  onOpenComplaints?: () => void;
  onOpenOthers?: () => void;
  onOpenCitizenServiceInfo?: (service: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  isAdminLoggedIn,
  config,
  onOpenCustomizer,
  onSelectCouncilCategory,
  onSelectNoticeCategory,
  onOpenProjects,
  onOpenComplaints,
  onOpenOthers
}) => {
  const [councilDropdownOpen, setCouncilDropdownOpen] = React.useState(false);
  const [noticeDropdownOpen, setNoticeDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const noticeDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCouncilDropdownOpen(false);
      }
      if (noticeDropdownRef.current && !noticeDropdownRef.current.contains(e.target as Node)) {
        setNoticeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const banglaDateToday = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="no-print sticky top-0 z-40 transition-all">
      {/* Top Govt Ribbon Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-emerald-800/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-red-300"></span>
            </span>
            <span className="font-semibold tracking-wide text-emerald-50">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </span>
            <span className="hidden sm:inline text-emerald-400/70">|</span>
            <span className="hidden sm:inline text-emerald-200/80 font-medium">স্থানীয় সরকার বিভাগ</span>
            <span className="hidden md:inline text-emerald-400/70">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-200/80">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{banglaDateToday}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-emerald-200/90 text-[10px] sm:text-xs flex-wrap justify-center">

            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span className="font-mono font-bold">{config.helplinePhone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Brand + Nav */}
      <div className="glass-panel border-b border-slate-200/50 shadow-[0_4px_30px_rgb(0,0,0,0.1)] bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">

            {/* Brand / Logo */}
            <button
              type="button"
              className="flex items-center gap-3 sm:gap-4 group cursor-pointer text-left"
              onClick={() => setActiveTab('home')}
            >
              {/* Logo seal with glow ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse-glow" style={{ margin: '-4px' }}></div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md overflow-hidden bg-white ring-2 ring-emerald-600/25 group-hover:ring-emerald-500/60 group-hover:scale-105 transition-all duration-300">
                  <MunicipalityLogo className="w-full h-full" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                    {config.municipalityName}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm badge-glow">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>স্মার্ট পৌরসভা</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">
                  {config.subDistrict}, {config.district} &bull; {config.municipalityTagline}
                </p>
              </div>
            </button>

            {/* Smart Digital Portal Main Navigation Bar */}
            <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 shadow-inner">
              {/* Tab 0: Home */}
              <button
                id="nav-tab-home"
                type="button"
                onClick={() => setActiveTab('home')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                }`}
              >
                <Home className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'home' ? 'text-white' : 'text-emerald-600'}`} />
                <span>হোম</span>
              </button>

              {/* Council Dropdown (বর্তমান পরিষদ ▾) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-dropdown-council"
                  type="button"
                  onClick={() => setCouncilDropdownOpen(!councilDropdownOpen)}
                  className={`relative flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                    councilDropdownOpen
                      ? 'bg-emerald-800 text-white shadow-md'
                      : 'text-slate-700 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                  }`}
                  aria-expanded={councilDropdownOpen}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>বর্তমান পরিষদ</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${councilDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Menu - Styled exactly like the screenshot */}
                {councilDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-emerald-600/20 py-1.5 z-50 animate-fade-in text-slate-800">
                    <div className="px-3 py-1.5 border-b border-slate-100 bg-emerald-50/60 rounded-t-lg">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        সীতাকুণ্ড পৌর পরিষদ ও প্রশাসন
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCouncilDropdownOpen(false);
                        onSelectCouncilCategory?.('administrator');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>প্রশাসকের প্রোফাইল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCouncilDropdownOpen(false);
                        onSelectCouncilCategory?.('panel_mayor');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>প্যানেল মেয়র প্রোফাইল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCouncilDropdownOpen(false);
                        onSelectCouncilCategory?.('councillor');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>ওয়ার্ড কাউন্সিলর প্রোফাইল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCouncilDropdownOpen(false);
                        onSelectCouncilCategory?.('staff');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>কর্মকর্তা ও কর্মচারীবৃন্দ প্রোফাইল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCouncilDropdownOpen(false);
                        onSelectCouncilCategory?.('entrepreneur');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>উদ্যোক্তা ও অন্যান্য</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notice Dropdown (নোটিশ ▾) */}
              <div className="relative" ref={noticeDropdownRef}>
                <button
                  id="nav-dropdown-notice"
                  type="button"
                  onClick={() => setNoticeDropdownOpen(!noticeDropdownOpen)}
                  className={`relative flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                    noticeDropdownOpen
                      ? 'bg-emerald-800 text-white shadow-md'
                      : 'text-slate-700 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                  }`}
                  aria-expanded={noticeDropdownOpen}
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>নোটিশ</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${noticeDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Menu - Styled exactly like the screenshot */}
                {noticeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-emerald-600/20 py-1.5 z-50 animate-fade-in text-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeDropdownOpen(false);
                        onSelectNoticeCategory?.('notice');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>নোটিশ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNoticeDropdownOpen(false);
                        onSelectNoticeCategory?.('office_order');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>অফিস আদেশ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNoticeDropdownOpen(false);
                        onSelectNoticeCategory?.('tender');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="text-emerald-700 font-bold text-sm">›</span>
                      <span>টেন্ডার নোটিশ</span>
                    </button>
                  </div>
                )}
              </div>


              {/* ট্র্যাকিং (Tracking - without serial number) */}
              <button
                id="nav-tab-track"
                type="button"
                onClick={() => setActiveTab('track')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-gradient-to-br from-teal-600 to-cyan-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-teal-800 hover:shadow-sm'
                }`}
              >
                <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'track' ? 'text-white' : 'text-teal-600'}`} />
                <span>ট্র্যাকিং</span>
                {activeTab === 'track' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              {/* দাপ্তরিক লগইন (Admin Login - without serial number) */}
              <button
                id="nav-tab-admin"
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'admin' ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>দাপ্তরিক লগইন</span>
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
