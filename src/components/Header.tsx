import React from 'react';
import { FileText, Search, ShieldCheck, PhoneCall, Building2, MapPin, Sparkles, Globe, Construction } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';

interface HeaderProps {
  activeTab: 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin';
  setActiveTab: (tab: 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isAdminLoggedIn }) => {
  return (
    <header className="no-print sticky top-0 z-40 transition-all">
      {/* Top Govt Ribbon Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-emerald-800/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-red-300"></span>
            </span>
            <span className="font-semibold tracking-wide text-emerald-50">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </span>
            <span className="hidden sm:inline text-emerald-400/70">|</span>
            <span className="hidden sm:inline text-emerald-200/80 font-medium">স্থানীয় সরকার বিভাগ</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200/90">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>সীতাকুণ্ড, চট্টগ্রাম</span>
            </span>
            <span className="hidden md:inline-block text-emerald-600">|</span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>০৩০২৮-৫৬০৪৪</span>
            </span>
            <span className="hidden md:inline-block text-emerald-600">|</span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">ই-সেবা পোর্টাল</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Brand + Nav */}
      <div className="glass-panel border-b border-slate-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">

            {/* Brand / Logo */}
            <button
              type="button"
              className="flex items-center gap-3 sm:gap-4 group cursor-pointer text-left"
              onClick={() => setActiveTab('apply')}
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
                    সীতাকুণ্ড পৌরসভা কার্যালয়
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm badge-glow">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>ই-সেবা</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">
                  সীতাকুণ্ড, চট্টগ্রাম &bull; প্রকৌশল বিভাগ &bull; ভূমি ডিমার্কেশন পোর্টাল
                </p>
              </div>
            </button>

            {/* Navigation */}
            <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shadow-inner">
              <button
                id="nav-tab-apply"
                type="button"
                onClick={() => setActiveTab('apply')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-250 cursor-pointer ${
                  activeTab === 'apply'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'apply' ? 'text-white' : 'text-emerald-600'}`} />
                <span>১. ডিমার্কেশন ও মালিকানা</span>
                {activeTab === 'apply' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              <button
                id="nav-tab-track"
                type="button"
                onClick={() => setActiveTab('track')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-250 cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                }`}
              >
                <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'track' ? 'text-white' : 'text-emerald-600'}`} />
                <span>২. ট্র্যাকিং</span>
                {activeTab === 'track' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              <button
                id="nav-tab-schedule1"
                type="button"
                onClick={() => setActiveTab('schedule1')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-250 cursor-pointer ${
                  activeTab === 'schedule1'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-amber-700 hover:shadow-sm'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'schedule1' ? 'text-white' : 'text-amber-500'}`} />
                <span>৩. ইমারত অনুমোদন</span>
                {activeTab === 'schedule1' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full border border-amber-300 animate-pulse"></span>
                )}
              </button>

              <button
                id="nav-tab-roadcutting"
                type="button"
                onClick={() => setActiveTab('roadcutting')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-250 cursor-pointer ${
                  activeTab === 'roadcutting'
                    ? 'bg-gradient-to-br from-amber-600 to-yellow-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-amber-800 hover:shadow-sm'
                }`}
              >
                <Construction className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'roadcutting' ? 'text-white' : 'text-amber-600'}`} />
                <span>৪. রাস্তা কর্তন অনুমোদন</span>
                {activeTab === 'roadcutting' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full border border-amber-300 animate-pulse"></span>
                )}
              </button>

              <button
                id="nav-tab-admin"
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-250 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'admin' ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>৫. দাপ্তরিক লগইন</span>
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

