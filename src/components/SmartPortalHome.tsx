import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Building2, 
  Construction, 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Building, 
  Award, 
  FileCheck, 
  MessageSquare, 
  Receipt, 
  Volume2, 
  VolumeX, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { PortalConfig } from '../utils/portalConfig';
import { MunicipalityLogo } from './MunicipalityLogo';
import { toBanglaNumber } from '../utils/storage';

interface SmartPortalHomeProps {
  config: PortalConfig;
  onNavigateTab: (tab: 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
  onSearchTracking: (trackId: string) => void;
  onOpenCustomizer: () => void;
}

export const SmartPortalHome: React.FC<SmartPortalHomeProps> = ({
  config,
  onNavigateTab,
  onSearchTracking,
  onOpenCustomizer,
}) => {
  const [quickTrackId, setQuickTrackId] = useState('');
  const [marqueePlaying, setMarqueePlaying] = useState(true);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<any | null>(null);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      onSearchTracking(quickTrackId.trim());
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in-up">
      
      {/* 1. Scrolling Announcements (Marquee) */}
      {config.enableMarquee && config.marqueeNotices.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-2 sm:p-2.5 shadow-md border border-emerald-500/30 flex items-center gap-3 overflow-hidden text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white rounded-xl font-bold shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>জরুরি সংবাদ</span>
          </div>

          <div 
            className="flex-1 overflow-hidden relative cursor-pointer"
            onMouseEnter={() => setMarqueePlaying(false)}
            onMouseLeave={() => setMarqueePlaying(true)}
            title="মাউস হোভার করলে স্ক্রোল থামবে"
          >
            <div className={`whitespace-nowrap inline-block ${marqueePlaying ? 'animate-marquee' : ''}`}>
              {config.marqueeNotices.map((notice, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 mr-10 text-emerald-100 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{notice}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMarqueePlaying(!marqueePlaying)}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title={marqueePlaying ? 'স্ক্রোল বন্ধ করুন' : 'স্ক্রোল চালু করুন'}
          >
            {marqueePlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-10 lg:p-12">
        {/* Background Decorative Rings & Watermark */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none select-none hidden lg:block">
          <MunicipalityLogo size={280} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{config.heroBadgeText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight text-white drop-shadow-sm">
            {config.heroHeadline}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {config.heroSubheadline}
          </p>

          {/* Instant Tracking Quick Search Box */}
          <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-xl space-y-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>আপনার দাখিলকৃত আবেদনের লাইভ স্ট্যাটাস জানতে ট্র্যাকিং আইডি লিখুন:</span>
            </span>
            <form onSubmit={handleQuickTrackSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="উদাঃ SKM-2026-XXXX অথবা আবেদনকারীর মোবাইল নম্বর"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 font-mono text-xs sm:text-sm font-bold border-2 border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>তাত্ক্ষণিক ট্র্যাকিং</span>
              </button>
            </form>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('apply')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>১. ডিমার্কেশন আবেদন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('schedule1')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg"
            >
              <Building2 className="w-4 h-4" />
              <span>৩. ইমারত অনুমোদন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('roadcutting')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-600 shadow-md transition-all cursor-pointer"
            >
              <Construction className="w-4 h-4 text-amber-400" />
              <span>৪. রাস্তা কর্তন অনুমোদন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core 4 Services Spotlight Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                পৌরসভার প্রধান ৪টি ডিজিটাল নাগরিক সেবা
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              স্বচ্ছতা, নির্ভুলতা ও দ্রুততম সময়ে সেবা নিশ্চিতকরণে প্রস্তুত ডিজিটাল সেবা ড্যাশবোর্ড
            </p>
          </div>

          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            সম্পূর্ণ ক্যাশলেস ও অনলাইন প্ল্যাটফর্ম
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Demarcation */}
          <div className="group bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-sm hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform"></div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                  ফি: ৳ ১০০/-
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  ১. ডিমার্কেশন ও মালিকানা
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  মৌজা নকশা, জে.এল. ও বি.এস খতিয়ান অনুযায়ী জমির সঠিক সীমানা নির্ধারণ ও সরজমিন তদন্ত।
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>নক্সাকারের সরজমিন তদন্ত ও পরিমাপ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>কিউআর কোডযুক্ত প্রত্যয়নপত্র ও ম্যাপ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>সময়সীমা: ৩-৭ কার্যদিবস</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('apply')}
              className="mt-5 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-lg"
            >
              <span>অনলাইনে আবেদন করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Tracking */}
          <div className="group bg-white rounded-2xl p-5 sm:p-6 border-2 border-teal-500/40 shadow-sm hover:shadow-xl hover:border-teal-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform"></div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-xs">
                  <Search className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-teal-700 text-white px-2.5 py-1 rounded-full shadow-xs">
                  সম্পূর্ণ ফ্রি
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  ২. আবেদন লাইভ ট্র্যাকিং
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  যেকোনো দাখিলকৃত আবেদনের বর্তমান ধাপ, নক্সাকার রিপোর্ট ও অনুমোদন তাৎক্ষণিক জানুন।
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>ট্র্যাকিং আইডি ও মোবাইল নম্বর সার্চ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>A4 ফরম ও প্রত্যয়নপত্র ডাউনলোড</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>২৪/৭ রিয়েল-টাইম ডাটা আপডেট</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('track')}
              className="mt-5 w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-lg"
            >
              <span>আবেদন স্ট্যাটাস দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3: Building Plan (Schedule-1) */}
          <div className="group bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-500/40 shadow-sm hover:shadow-xl hover:border-amber-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform"></div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                  ফি: ৳ ১,০০০/-
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  ৩. ইমারত অনুমোদন (তফসিল-১)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  ইমারত নির্মাণ বিধিমালা অনুযায়ী ভবনের প্ল্যান অনুমোদন, চালানের বিবরণ ও ১৫% সরকারি ভ্যাট।
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>তফসিল-১ অফিসিয়াল ফর্ম পূরণ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>নক্সাকার ও XEN অনুমোদন ও সিলযুক্ত A4 কপি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>সময়সীমা: ৭-১৫ কার্যদিবস</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('schedule1')}
              className="mt-5 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-lg"
            >
              <span>তফসিল-১ ফরম পূরণ করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 4: Road Cutting */}
          <div className="group bg-white rounded-2xl p-5 sm:p-6 border-2 border-yellow-500/40 shadow-sm hover:shadow-xl hover:border-yellow-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full pointer-events-none -z-0 group-hover:scale-110 transition-transform"></div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold shadow-xs">
                  <Construction className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-yellow-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                  ফি: ৳ ৩০০/-
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-yellow-800 transition-colors">
                  ৪. রাস্তা কর্তন অনুমোদন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  গ্যাস, পানি বা বিদ্যুৎ লাইন সংযোগের জন্য রাস্তা খনন অনুমতি ও ক্ষতিপূরণ পরিমাপ।
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>পৌর ক্যাশ কাউন্টার রসিদ (৳ ৩০০/-)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  <span>পরিমাপ ও মেরামত ক্ষতিপূরণ হিসাব</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>সময়সীমা: ৩-৫ কার্যদিবস</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('roadcutting')}
              className="mt-5 w-full py-2.5 px-4 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-lg"
            >
              <span>রাস্তা কর্তনের আবেদন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Municipal Services Directory (Smart e-Sheba inspired by smartpourashava.com) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <span>পৌরসভার অন্যান্য ডিজিটাল নাগরিক সেবাসমূহ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              স্মার্ট পৌরসভা ফ্রেমওয়ার্কের অন্তর্ভুক্ত সকল সেবা ও আবেদন প্রক্রিয়া
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.servicesList.map((srv) => (
            <div
              key={srv.id}
              onClick={() => {
                if (srv.serviceAction === 'apply') onNavigateTab('apply');
                else if (srv.serviceAction === 'track') onNavigateTab('track');
                else if (srv.serviceAction === 'schedule1') onNavigateTab('schedule1');
                else if (srv.serviceAction === 'roadcutting') onNavigateTab('roadcutting');
                else setSelectedServiceInfo(srv);
              }}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  {srv.badge && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                      {srv.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {srv.banglaTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    শাখা: {srv.category}
                  </span>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-emerald-800">
                  {srv.fee}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-emerald-700 font-semibold transition-colors">
                  <span>বিস্তারিত</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Leadership & Message Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Mayor / Administrator Speech Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <MunicipalityLogo size={40} />
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block">স্মার্ট সিটি ও ডিজিটাল গভর্নেন্স</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">{config.leaderTitle}</h3>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-400/40">
                সীতাকুণ্ড পৌরসভা
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/20 p-4 rounded-2xl border border-white/10">
              "{config.leaderMessage}"
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-emerald-400 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-md">
                <img
                  src={config.leaderImageUrl || '/logo.png'}
                  alt={config.leaderName}
                  className="w-full h-full object-contain"
                  onError={(e: any) => { e.target.src = '/logo.png'; }}
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{config.leaderName}</h4>
                <p className="text-xs text-emerald-300 font-medium">{config.leaderDesignation}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">সীতাকুণ্ড পৌরসভা কার্যালয়, চট্টগ্রাম</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Engineer / Official Note Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-slate-100 pb-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">{config.officerTitle}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {config.officerMessage}
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{config.officerName}</div>
              <div className="text-[11px] text-emerald-800 font-medium">{config.officerDesignation}</div>
              <div className="text-[10px] text-slate-500 font-mono">ইমেইল: {config.officialEmail}</div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigateTab('schedule1')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>ভবন নির্মাণ নীতিমালা ও নির্দেশিকা</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Live Municipal Statistics Counter */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">রিয়েল-টাইম ডাটা ট্র্যাকিং</span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            সীতাকুণ্ড পৌরসভার ডিজিটালাইজেশন অগ্রগতি
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {config.statistics.map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                {stat.label}
              </span>
              <span className="text-[11px] text-emerald-200 block">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Emergency Helpline Directory */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-600" />
              <span>জরুরি সেবা হটলাইন ও সার্বক্ষণিক হেল্পলাইন</span>
            </h2>
            <p className="text-xs text-slate-500">
              জরুরি মুহূর্তে যেকোনো সময় সরাসরি কল করে সেবা ও দিকনির্দেশনা গ্রহণ করুন
            </p>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            ২৪/৭ সার্বক্ষণিক চালু
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {config.emergencyNumbers.map((em, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 hover:bg-red-50/30 transition-all flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 flex-1">
                <h4 className="text-xs font-bold text-slate-900">{em.title}</h4>
                <a
                  href={`tel:${em.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-sm sm:text-base font-black text-red-700 font-mono block hover:underline"
                >
                  {em.phone}
                </a>
                <p className="text-[11px] text-slate-500 leading-snug">{em.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Info Modal (when clicking on informational e-services) */}
      {selectedServiceInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedServiceInfo.banglaTitle}</h3>
                  <span className="text-xs text-slate-500">{selectedServiceInfo.category}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedServiceInfo(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>{selectedServiceInfo.description}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">নির্ধারিত ফি:</span>
                  <strong className="text-emerald-900">{selectedServiceInfo.fee}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">সেবা নিষ্পত্তির সময়কাল:</span>
                  <strong className="text-slate-900">{selectedServiceInfo.duration}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রয়োজনীয় কাগজপত্র:</span>
                  <span className="text-slate-800 text-right">এনআইডি, হোল্ডিং নম্বর, মূল খতিয়ান বা ট্রেড সংশ্লিষ্ট প্রমাণক</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                💡 <strong>সহায়তা নির্দেশিকা:</strong> এই সেবা গ্রহণের জন্য সরাসরি সীতাকুণ্ড পৌরসভা কার্যালয়ের সংশ্লিষ্ট শাখায় প্রয়োজনীয় মূল কাগজপত্রসহ যোগাযোগ করার অনুরোধ করা যাচ্ছে। যেকোনো তথ্যের জন্য হেল্পলাইনে ({config.helplinePhone}) ফোন করুন।
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedServiceInfo(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Website Customization trigger for quick access */}
      <div className="text-center pt-2 pb-4">
        <button
          type="button"
          onClick={onOpenCustomizer}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-emerald-950 text-emerald-300 hover:text-white rounded-2xl text-xs font-bold border border-emerald-500/40 shadow-md transition-all cursor-pointer hover:shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ওয়েবসাইট কাস্টমাইজেশন ও সেটিংস প্যানেল চালু করুন (CMS Editor)</span>
        </button>
      </div>

    </div>
  );
};
