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
  AlertTriangle,
  Activity,
  Bell,
  Download,
  Tag
} from 'lucide-react';
import { PortalConfig, CouncilCategory, COUNCIL_CATEGORIES_META, NoticeCategory, NOTICE_CATEGORIES_META } from '../utils/portalConfig';
import { MunicipalityLogo } from './MunicipalityLogo';
import { 
  toBanglaNumber, 
  formatBanglaDate,
  getStoredApplications, 
  getBuildingApplications,
  getRoadCuttingApplications 
} from '../utils/storage';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface SmartPortalHomeProps {
  config: PortalConfig;
  onNavigateTab: (tab: 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
  onSearchTracking: (trackId: string) => void;
  onOpenCustomizer: () => void;
  onOpenCouncilCategory?: (category: CouncilCategory) => void;
  onOpenNoticeCategory?: (category: NoticeCategory) => void;
}

export const SmartPortalHome: React.FC<SmartPortalHomeProps> = ({
  config,
  onNavigateTab,
  onSearchTracking,
  onOpenCustomizer,
  onOpenCouncilCategory,
  onOpenNoticeCategory,
}) => {
  const [quickTrackId, setQuickTrackId] = useState('');
  const [marqueePlaying, setMarqueePlaying] = useState(true);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<any | null>(null);
  const [isBuildingPhotoModalOpen, setIsBuildingPhotoModalOpen] = useState(false);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      onSearchTracking(quickTrackId.trim());
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      
      {/* 1 & 2. Scrolling Announcements (Marquee) + Hero Section closely attached */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* 1. Scrolling Announcements (Marquee) */}
        {config.enableMarquee && config.marqueeNotices.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-2 sm:p-2.5 shadow-md border border-emerald-500/30 flex items-center gap-3 overflow-hidden text-xs sm:text-sm">
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
          </div>
        )}

        {/* 2. Hero Section: Split Layout with Municipal Complex Photo & Official Logo */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white p-6 sm:p-8 lg:p-10">
          {/* Background Decorative Rings */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column (7 cols): Headlines, Instant Tracking & Action Buttons */}
            <div className="lg:col-span-7 space-y-5">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{config.heroBadgeText}</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight sm:leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {config.heroHeadline}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-emerald-100/95 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
                {config.heroSubheadline}
              </p>

              {/* Instant Tracking Quick Search Box */}
              <div className="bg-black/40 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-emerald-400/40 shadow-xl space-y-2">
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5 drop-shadow-xs">
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
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span>তাত্ক্ষণিক ট্র্যাকিং</span>
                  </button>
                </form>
              </div>

              {/* Quick Action Navigation Buttons */}
              <div className="pt-1 flex flex-wrap gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('apply')}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  <span>ডিমার্কেশন আবেদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('schedule1')}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4" />
                  <span>ইমারত অনুমোদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('roadcutting')}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-600 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Construction className="w-4 h-4 text-amber-400" />
                  <span>রাস্তা কর্তন অনুমোদন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column (5 cols): Stunning Pourashava Bhaban & Logo Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1000} scale={1.02} transitionSpeed={1200} className="w-full max-w-md lg:max-w-none">
                <div 
                  onClick={() => setIsBuildingPhotoModalOpen(true)}
                  className="group relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-400/50 bg-slate-950 cursor-pointer ring-4 ring-emerald-500/20 hover:ring-emerald-400/50 transition-all duration-500"
                  title="সীতাকুণ্ড পৌরসভা কার্যালয় ভবন ও মনোগ্রাম বড় করে দেখতে ক্লিক করুন"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 w-full overflow-hidden bg-slate-900">
                    <img
                      src="/sitakunda-pourashava-bhaban.jpg"
                      alt="সীতাকুণ্ড পৌরসভা কার্যালয় ভবন ও লোগো"
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                      loading="eager"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04281f] via-slate-950/20 to-black/30 pointer-events-none group-hover:via-slate-950/10 transition-colors"></div>

                    {/* Top Floating Badge Bar */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {/* Logo + Municipality Name Badge */}
                      <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-400/40 shadow-lg">
                        <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-xs overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-emerald-500/40">
                          <img src="/logo.png" alt="লোগো" className="w-full h-full object-contain" />
                        </div>
                        <div className="leading-tight">
                          <span className="text-[11px] font-black text-white block">সীতাকুণ্ড পৌরসভা</span>
                          <span className="text-[9px] text-emerald-300 font-medium block">সীতাকুণ্ড, চট্টগ্রাম</span>
                        </div>
                      </div>

                      {/* Active Status Pill */}
                      <span className="inline-flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-400/40 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>কার্যালয় ভবন</span>
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 tracking-tight group-hover:text-emerald-300 transition-colors">
                          <Building className="w-4 h-4 text-emerald-400" />
                          <span>সীতাকুণ্ড পৌরসভা কার্যালয়</span>
                        </h3>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          স্থাপিত: ১৯৯৮ খ্রিঃ
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/85 line-clamp-1 font-normal">
                        নাগরিক সেবা ও ডিজিটাল প্ল্যাটফর্ম পরিচালনা কেন্দ্র
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10">
                        <span className="text-emerald-400 font-semibold">সীতাকুণ্ড, চট্টগ্রাম</span>
                        <span className="inline-flex items-center gap-1 text-white font-bold group-hover:text-amber-300 transition-colors">
                          <span>বড় করে দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </div>
          </div>
        </section>
      </div>

      {/* 2.8 Leadership & Message Section — Prominent Administrator Speech & Face View (স্মার্ট সিটি ও ডিজিটাল গভর্নেন্স) */}
      <section>
        {/* Mayor / Administrator Speech Card — Full Width */}
        <div className="bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-500/40 relative overflow-hidden">
          {/* Subtle Background Watermark */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-8 translate-y-8">
            <MunicipalityLogo size={260} />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Header bar of the card */}
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3.5">
              <div className="flex items-center gap-3">
                <MunicipalityLogo size={42} />
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block tracking-wide">স্মার্ট সিটি ও ডিজিটাল গভর্নেন্স</span>
                  <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">{config.leaderTitle || 'প্রশাসকের বার্তা'}</h3>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3.5 py-1 rounded-full border border-emerald-400/40 font-bold">
                সীতাকুণ্ড পৌরসভা
              </span>
            </div>

            {/* Main content: Large Face Photo + Official Speech */}
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center md:items-start">
              {/* Prominent High-Visibility Official Photo Box */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="w-36 h-44 sm:w-48 sm:h-56 lg:w-52 lg:h-60 rounded-3xl bg-slate-800/90 border-3 border-emerald-400 overflow-hidden shadow-2xl ring-4 ring-emerald-500/25 flex items-center justify-center group">
                  <img
                    src={config.leaderImageUrl || '/logo.png'}
                    alt={config.leaderName}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => { e.target.src = '/logo.png'; }}
                  />
                </div>
                <div className="mt-2.5 text-center">
                  <span className="inline-block bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold px-4 py-1 rounded-full border border-emerald-400/50 shadow-md">
                    প্রশাসক
                  </span>
                </div>
              </div>

              {/* Official Statement & Designation Box */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="relative">
                  <span className="text-emerald-500/30 text-5xl sm:text-6xl font-serif absolute -top-4 -left-3 select-none pointer-events-none">“</span>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic bg-black/30 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-inner relative z-10 font-normal">
                    "{config.leaderMessage}"
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">{config.leaderName}</h4>
                  <p className="text-sm sm:text-base text-emerald-300 font-semibold">{config.leaderDesignation}</p>
                  <p className="text-xs text-slate-400">সীতাকুণ্ড পৌরসভা কার্যালয়, চট্টগ্রাম</p>
                  
                  <div className="inline-flex items-center gap-2 mt-2 bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs text-emerald-200 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.9 Current Council & Officers Showcase Section (বর্তমান পরিষদ ও কর্মকর্তা পরিচিতি) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                বর্তমান পরিষদ ও কর্মকর্তা পরিচিতি
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              সীতাকুণ্ড পৌরসভার সম্মানিত প্রশাসক, মেয়র প্যানেল, কাউন্সিলরবৃন্দ ও দায়িত্বপ্রাপ্ত কর্মকর্তাদের তালিকা
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenCouncilCategory?.('administrator')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>সকল প্রোফাইল দেখুন</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {COUNCIL_CATEGORIES_META.filter(cat => cat.category !== 'executive_officer').map((cat) => {
            const memberCount = (config.councilMembers || []).filter(m => m.category === cat.category).length;
            return (
              <button
                key={cat.category}
                type="button"
                onClick={() => onOpenCouncilCategory?.(cat.category)}
                className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center font-bold text-sm mb-2.5 transition-colors">
                    <span className="text-lg leading-none">›</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {cat.label}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{memberCount} জন</span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                    দেখুন &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Core Services Spotlight Grid */}
      <section id="services-section" className="space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                পৌরসভার বর্তমান ডিজিটাল নাগরিক সেবা
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              স্বচ্ছতা, নির্ভুলতা ও দ্রুততম সময়ে সেবা নিশ্চিতকরণে প্রস্তুত ডিজিটাল সেবা ড্যাশবোর্ড
            </p>
          </div>

          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            অনলাইন প্ল্যাটফর্ম
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Card 1: Demarcation */}
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} scale={1.02} transitionSpeed={1500} className="h-full">
            <div className="h-full group bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-emerald-500/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(5,150,105,0.15)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none -z-0 group-hover:scale-125 transition-transform duration-500 ease-out"></div>
              
              <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/25">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full shadow-2xs border border-emerald-300/80">
                    ফি: ৳ ১০০/-
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    ডিমার্কেশন ও মালিকানা
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    মৌজা নকশা, জে.এল. ও বি.এস খতিয়ান অনুযায়ী জমির সঠিক সীমানা নির্ধারণ ও সরজমিন তদন্ত।
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>পৌর কর্তৃপক্ষের সরজমিন তদন্ত ও পরিমাপ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>কিউআর কোডযুক্ত প্রত্যয়নপত্র ও ম্যাপ</span>
                  </div>
                </div>
              </div>

              <div style={{ transform: 'translateZ(40px)' }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab('apply')}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>অনলাইনে আবেদন করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </Tilt>

          {/* Card 2: Tracking */}
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} scale={1.02} transitionSpeed={1500} className="h-full">
            <div className="h-full group bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-teal-500/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(13,148,136,0.15)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-bl-full pointer-events-none -z-0 group-hover:scale-125 transition-transform duration-500 ease-out"></div>

              <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-teal-700/25">
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black bg-teal-100 text-teal-900 px-3 py-1.5 rounded-full shadow-2xs border border-teal-300/80">
                    সম্পূর্ণ ফ্রি
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-800 transition-colors">
                    আবেদন লাইভ ট্র্যাকিং
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    যেকোনো দাখিলকৃত আবেদনের বর্তমান ধাপ, রিপোর্ট ও অনুমোদন তাৎক্ষণিক জানুন।
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>ট্র্যাকিং আইডি ও মোবাইল নম্বর সার্চ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>A4 ফরম ও প্রত্যয়নপত্র ডাউনলোড</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>২৪/৭ রিয়েল-টাইম ডাটা আপডেট</span>
                  </div>
                </div>
              </div>

              <div style={{ transform: 'translateZ(40px)' }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab('track')}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>আবেদন স্ট্যাটাস দেখুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </Tilt>

          {/* Card 3: Building Plan */}
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} scale={1.02} transitionSpeed={1500} className="h-full">
            <div className="h-full group bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-amber-500/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(217,119,6,0.15)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-bl-full pointer-events-none -z-0 group-hover:scale-125 transition-transform duration-500 ease-out"></div>

              <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-amber-700/25">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full shadow-2xs border border-amber-300/80">
                    ফি: ৳ ১,০০০/-
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                    ইমারত অনুমোদন (তফসিল-১)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    ইমারত নির্মাণ বিধিমালা অনুযায়ী ভবনের প্ল্যান অনুমোদন, চালানের বিবরণ ও ১৫% সরকারি ভ্যাট।
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>তফসিল-১ অফিসিয়াল ফর্ম পূরণ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অনলাইন ব্যাংক চালান ট্র্যাকিং</span>
                  </div>
                </div>
              </div>

              <div style={{ transform: 'translateZ(40px)' }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab('schedule1')}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-emerald-800 hover:from-amber-500 hover:to-emerald-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>তফসিল-১ ফরম পূরণ করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </Tilt>

          {/* Card 4: Road Cutting */}
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} scale={1.02} transitionSpeed={1500} className="h-full">
            <div className="h-full group bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-emerald-600/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(5,150,105,0.15)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-600/10 rounded-bl-full pointer-events-none -z-0 group-hover:scale-125 transition-transform duration-500 ease-out"></div>

              <div className="space-y-4 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-700 to-slate-800 text-white flex items-center justify-center shadow-md shadow-emerald-800/25">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full shadow-2xs border border-emerald-300/80">
                    ফি: ৳ ৩০০/-
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    রাস্তা কর্তন ও মেরামত
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    গ্যাস, বিদ্যুৎ, ওয়াসা বা ড্রেন সংযোগের জন্য পৌর রাস্তা খনন ও ক্ষতিপূরণ অনুমোদন।
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>রাস্তা কর্তন ক্ষতিপূরণ এসেসমেন্ট</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>অনুমোদন পত্র ও ব্যাংক চালান ট্র্যাকিং</span>
                  </div>
                </div>
              </div>

              <div style={{ transform: 'translateZ(40px)' }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab('roadcutting')}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-slate-800 hover:from-emerald-600 hover:to-slate-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-slate-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>অনুমোদন আবেদন করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </Tilt>
        </div>
      </section>

      {/* 4. Other Municipal Citizen Services Highlights (Under Maintenance) */}
      <section className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                পৌরসভার অন্যান্য ডিজিটাল নাগরিক সেবাসমূহ
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              স্মার্ট পৌরসভা ফ্রেমওয়ার্কের অন্তর্ভুক্ত সকল সেবা ও আবেদন প্রক্রিয়া
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            নির্মাণাধীন
          </span>
        </div>

        {/* Under Maintenance Notice */}
        <div className="relative">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-amber-800">আন্ডার মেইন্টেন্যান্স</h3>
            <p className="text-sm text-amber-700 max-w-md mx-auto leading-relaxed">
              অন্যান্য ডিজিটাল নাগরিক সেবাগুলি বর্তমানে নির্মাণাধীন (আন্ডার মেইন্টেন্যান্স) রয়েছে। শীঘ্রই চালু হবে।
            </p>
            <p className="text-xs text-amber-600 font-mono font-bold">Coming Soon — নির্মাণাধীন</p>
          </div>
        </div>

        <div className="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                    {srv.banglaTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
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


      {/* 5.6 Notice & Tender Board Showcase Section (সর্বশেষ নোটিশ, অফিস আদেশ ও ই-দরপত্র) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                সর্বশেষ নোটিশ, অফিস আদেশ ও ই-দরপত্র
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              সীতাকুণ্ড পৌরসভার প্রশাসনিক বিজ্ঞপ্তি, অফিস আদেশ এবং দরপত্র সংক্রান্ত সর্বশেষ তথ্যাবলী
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenNoticeCategory?.('notice')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>সকল নোটিশ দেখুন</span>
            </button>
          </div>
        </div>

        {(!config.noticesList || config.noticesList.length === 0) ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
            আপাতত কোনো প্রকাশিত নোটিশ বা দরপত্র নেই।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.noticesList.slice(0, 6).map((notice) => {
              const meta = NOTICE_CATEGORIES_META.find(c => c.category === notice.category) || {
                label: 'নোটিশ',
                color: 'bg-emerald-50 text-emerald-800 border-emerald-300'
              };

              return (
                <div
                  key={notice.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatBanglaDate(notice.publishDate)}
                      </span>
                    </div>

                    {notice.memoNo && (
                      <div className="text-[11px] text-slate-500 font-mono line-clamp-1">
                        স্মারক: {notice.memoNo}
                      </div>
                    )}

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                      {notice.title}
                    </h4>

                    {notice.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
                        {notice.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {notice.fileUrl ? (
                      <a
                        href={notice.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{notice.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) || notice.fileUrl.startsWith('data:image/') ? 'ছবি দেখুন' : 'কপি দেখুন'}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">সংযুক্তি নেই</span>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenNoticeCategory?.(notice.category)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Live Municipal Statistics Counter — Dynamic counts from real applications */}
      {(() => {
        const demarcationApps = getStoredApplications();
        const buildingApps = getBuildingApplications();
        const roadCuttingApps = getRoadCuttingApplications();
        const totalApps = demarcationApps.length + buildingApps.length + roadCuttingApps.length;
        const approvedApps = [
          ...demarcationApps.filter(a => a.status === 'approved'),
          ...buildingApps.filter((a: any) => a.status === 'approved'),
          ...roadCuttingApps.filter((a: any) => a.status === 'approved')
        ].length;
        const pendingApps = [
          ...demarcationApps.filter(a => a.status === 'pending'),
          ...buildingApps.filter((a: any) => a.status === 'submitted' || a.status === 'pending'),
          ...roadCuttingApps.filter((a: any) => a.status === 'pending')
        ].length;
        const inProgressApps = totalApps - approvedApps - pendingApps;
        return (
          <section className="bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/40">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">রিয়েল-টাইম ডাটা ট্র্যাকিং</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                সীতাকুণ্ড পৌরসভার ডিজিটালাইজেশন অগ্রগতি
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">{toBanglaNumber(totalApps)}</span>
                <span className="text-xs sm:text-sm font-bold text-white block">মোট আবেদন</span>
                <span className="text-[11px] text-emerald-200 block">সকল সেবা মিলিয়ে</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">{toBanglaNumber(approvedApps)}</span>
                <span className="text-xs sm:text-sm font-bold text-white block">অনুমোদিত</span>
                <span className="text-[11px] text-emerald-200 block">সম্পন্ন সেবা</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">{toBanglaNumber(pendingApps)}</span>
                <span className="text-xs sm:text-sm font-bold text-white block">অপেক্ষমান</span>
                <span className="text-[11px] text-emerald-200 block">প্রক্রিয়াধীন</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">{toBanglaNumber(inProgressApps > 0 ? inProgressApps : 0)}</span>
                <span className="text-xs sm:text-sm font-bold text-white block">তদন্তাধীন</span>
                <span className="text-[11px] text-emerald-200 block">সরজমিন তদন্ত</span>
              </div>
            </div>
          </section>
        );
      })()}

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

      {/* Building & Logo High-Resolution Lightbox Modal */}
      {isBuildingPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setIsBuildingPhotoModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/50 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shrink-0 shadow-md ring-2 ring-emerald-400">
                  <img src="/logo.png" alt="সীতাকুণ্ড পৌরসভা লোগো" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">সীতাকুণ্ড পৌরসভা কার্যালয় ভবন ও ক্যাম্পাস</h4>
                  <p className="text-xs text-emerald-300">সীতাকুণ্ড, চট্টগ্রাম &bull; স্থাপিত : ১৯৯৮ খ্রিঃ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBuildingPhotoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer text-sm font-bold shadow-md"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-1 sm:p-2">
              <img
                src="/sitakunda-pourashava-bhaban.jpg"
                alt="সীতাকুণ্ড পৌরসভা কার্যালয় ভবন"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-3 sm:p-4 bg-slate-950 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>নাগরিক সেবা ও তথ্য প্রযুক্তি পরিচালনা কেন্দ্র &bull; সীতাকুণ্ড পৌরসভা</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBuildingPhotoModalOpen(false)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
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
