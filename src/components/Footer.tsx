import React from 'react';
import { 
  Building2, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ArrowUp, 
  Globe, 
  Award,
  ExternalLink
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { PortalConfig } from '../utils/portalConfig';

interface FooterProps {
  config: PortalConfig;
  onOpenCustomizer: () => void;
  onNavigateTab: (tab: 'home' | 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenCustomizer, onNavigateTab }) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="no-print relative mt-10 sm:mt-12 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700"></div>

      {/* Main footer body */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-slate-300">
        {/* Geometric dot overlay */}
        <div className="absolute inset-0 hero-dot-overlay opacity-30 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">

            {/* Col 1 — Brand */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-md ring-2 ring-emerald-500/30">
                  <MunicipalityLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">{config.municipalityName}</h3>
                  <span className="text-xs text-emerald-400">{config.subDistrict}, {config.district}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                নাগরিক সেবা সহজীকরণ ও স্বচ্ছ ডিজিটাল ভূমির ডিমার্কেশন, ইমারত নির্মাণ অনুমোদন এবং রাস্তা কর্তন অনুমতি প্রক্রিয়ায় সীতাকুণ্ড পৌরসভার স্মার্ট ই-সেবা পোর্টাল।
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/40 text-[11px] text-emerald-300">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>প্রতিষ্ঠাকাল: {config.establishedYear} ইং &bull; স্থানীয় সরকার বিভাগ</span>
              </div>
            </div>

            {/* Col 2 — Quick Links to 4 Core Services */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ডিজিটাল নাগরিক সেবাসমূহ</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('apply')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <span>ভূমি ডিমার্কেশন ও মালিকানা যাচাই</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('track')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <span>কিউআর কোড লাইভ আবেদন ট্র্যাকিং</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('schedule1')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <span>ইমারত নির্মাণ অনুমোদন (তফসিল-১)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('roadcutting')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <span>রাস্তা কর্তন ও মেরামত অনুমোদন</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('admin')}
                    className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <span>কর্মকর্তা ও কর্মচারী দাপ্তরিক লগইন</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 — Contact & Office Hours */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>যোগাযোগ ও অফিস সূচি</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{config.physicalAddress}</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>টেলিফোন: <strong className="font-mono text-white">{config.helplinePhone}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>হটলাইন: <strong className="font-mono text-white">{config.hotlineMobile}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[11px]">{config.officialEmail}</span>
                </li>
                <li className="text-[11px] text-emerald-300 pt-1">
                  অফিস: {config.officeHours}
                </li>
              </ul>
            </div>

            {/* Col 4 — National Portals & Site Customization */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>জাতীয় গুরুত্বপূর্ণ লিংকসমূহ</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {config.importantLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} {config.municipalityName}। সর্বস্বত্ব সংরক্ষিত।
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-[11px]">
                স্মার্ট পৌরসভা ডিজিটাল প্ল্যাটফর্ম
              </span>
              <button
                type="button"
                onClick={scrollToTop}
                className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
                title="পৃষ্ঠার শীর্ষে যান"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};