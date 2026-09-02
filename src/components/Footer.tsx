import React from 'react';
import { Building2, PhoneCall, Mail, MapPin, ShieldCheck, ArrowUp, Globe, Award } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="no-print relative mt-16 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"></div>

      {/* Main footer body */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-slate-300">
        {/* Geometric dot overlay */}
        <div className="absolute inset-0 hero-dot-overlay opacity-30 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Col 1 — Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-md ring-2 ring-emerald-500/30 animate-float-gently">
                  <MunicipalityLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">সীতাকুণ্ড পৌরসভা কার্যালয়</h3>
                  <span className="text-xs text-emerald-400">সীতাকুণ্ড, চট্টগ্রাম</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                নাগরিক সেবা সহজীকরণ ও ডিজিটাল ভূমির ডিমার্কেশন যাচাই প্রক্রিয়ার মাধ্যমে ভূমির সঠিক সীমানা ও মালিকানা নিশ্চিতকরণে সীতাকুণ্ড পৌরসভার অনলাইন উদ্যোগ।
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/40 text-[11px] text-emerald-300">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>স্থাপিত: ১৯৯৮ ইং | গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
              </div>
            </div>

            {/* Col 2 — Contact */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                প্রকৌশল বিভাগ ও যোগাযোগ
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5 group">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">সীতাকুণ্ড পৌরসভা কার্যালয়, সীতাকুণ্ড, চট্টগ্রাম</span>
                </li>
                <li className="flex items-center gap-2.5 group">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">মোবাইলঃ ০১৬১৩-৬২৩২৭৬ (01613-623276)</span>
                </li>
                <li className="flex items-center gap-2.5 group">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">টেলিফোনঃ ০৩০২৮-৫৬০৪৪</span>
                </li>
                <li className="flex items-center gap-2.5 group">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">ae.sitakundapourashava@yahoo.com</span>
                </li>
                <li className="flex items-center gap-2.5 group">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:text-emerald-300 transition-colors" />
                  <span className="group-hover:text-white transition-colors">ই-সেবা পোর্টাল — সীতাকুণ্ড পৌরসভা</span>
                </li>
              </ul>
            </div>

            {/* Col 3 — System */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                সরকারি ই-সেবা প্ল্যাটফর্ম
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                এই পোর্টালটি <strong className="text-emerald-300">প্রকৌশল বিভাগ, সীতাকুণ্ড পৌরসভা</strong> কর্তৃক পরিচালিত। সকল তথ্য গোপনীয় ও সরকারি নিরাপত্তা নীতিমালা অনুযায়ী সংরক্ষিত।
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>নিরাপদ ডেটা</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-emerald-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>অনলাইন সেবা</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} সীতাকুণ্ড পৌরসভা কার্যালয়। সর্বস্বত্ব সংরক্ষিত।
            </div>
            <div className="text-slate-600 text-center">
              ডিজিটাল গভর্নেন্স ও ল্যান্ড ডিমার্কেশন ট্র্যাকিং সিস্টেম
            </div>
            <button
              onClick={scrollToTop}
              title="উপরে যান"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-300 hover:text-white transition-all duration-200 border border-emerald-700/40 text-[11px] font-medium cursor-pointer"
            >
              <ArrowUp className="w-3 h-3" />
              উপরে যান
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};