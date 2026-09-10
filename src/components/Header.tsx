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
  Settings,
  Clock
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { PortalConfig } from '../utils/portalConfig';

interface HeaderProps {
  activeTab: 'home' | 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin';
  setActiveTab: (tab: 'home' | 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
  isAdminLoggedIn: boolean;
  config: PortalConfig;
  onOpenCustomizer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  isAdminLoggedIn,
  config,
  onOpenCustomizer
}) => {
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
            {/* National Hotlines Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-800/70 px-2 py-0.5 rounded text-emerald-100 font-mono font-bold border border-emerald-700/60">
                জরুরি: ৩৩৩ / ৯৯৯
              </span>
            </div>

            <span className="hidden sm:inline-block text-emerald-600">|</span>

            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span className="font-mono font-bold">{config.helplinePhone}</span>
            </span>

            <span className="hidden sm:inline-block text-emerald-600">|</span>

            {/* Quick Website Customizer Trigger in Header */}
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/40 transition-all font-semibold cursor-pointer"
              title="ওয়েবসাইট কাস্টমাইজেশন ও সেটিংস প্যানেল"
            >
              <Settings className="w-3 h-3" />
              <span>কাস্টমাইজ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Brand + Nav */}
      <div className="glass-panel border-b border-slate-200/70 shadow-sm bg-white/95 backdrop-blur-md">
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

            {/* Navigation */}
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

              {/* Tab 1: Apply Demarcation */}
              <button
                id="nav-tab-apply"
                type="button"
                onClick={() => setActiveTab('apply')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
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

              {/* Tab 2: Track */}
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
                <span>২. ট্র্যাকিং</span>
                {activeTab === 'track' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              {/* Tab 3: Schedule-1 Building Approval */}
              <button
                id="nav-tab-schedule1"
                type="button"
                onClick={() => setActiveTab('schedule1')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
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

              {/* Tab 4: Road Cutting Approval */}
              <button
                id="nav-tab-roadcutting"
                type="button"
                onClick={() => setActiveTab('roadcutting')}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-250 cursor-pointer ${
                  activeTab === 'roadcutting'
                    ? 'bg-gradient-to-br from-yellow-600 to-amber-700 text-white shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-white hover:text-yellow-700 hover:shadow-sm'
                }`}
              >
                <Construction className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'roadcutting' ? 'text-white' : 'text-yellow-600'}`} />
                <span>৪. রাস্তা কর্তন অনুমোদন</span>
                {activeTab === 'roadcutting' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full border border-amber-300 animate-pulse"></span>
                )}
              </button>

              {/* Tab 5: Admin Login */}
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
