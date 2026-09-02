import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Copy, 
  Printer, 
  Search, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  ArrowRight,
  ShieldAlert,
  Download,
  Sparkles,
  Star
} from 'lucide-react';
import { DemarcationApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { ApplicationQRCodeCard } from './ApplicationQRCodeCard';

interface ApplicationSuccessViewProps {
  application: DemarcationApplication;
  onGoToTracking: (id: string) => void;
  onViewPrintA4: (app: DemarcationApplication) => void;
  onApplyAnother: () => void;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute rounded-sm pointer-events-none" style={style}></div>
);

export const ApplicationSuccessView: React.FC<ApplicationSuccessViewProps> = ({
  application,
  onGoToTracking,
  onViewPrintA4,
  onApplyAnother,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = ['#059669', '#10b981', '#34d399', '#d97706', '#fbbf24', '#6366f1', '#ec4899'];
  const particles = Array.from({ length: 18 }, (_, i) => ({
    color: confettiColors[i % confettiColors.length],
    left: `${5 + i * 5.2}%`,
    delay: `${(i * 0.15).toFixed(2)}s`,
    size: 6 + (i % 4) * 2,
  }));

  const handleCopyId = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectPrint = () => {
    onViewPrintA4(application);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-scale">
      {/* Success Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-200/80 overflow-hidden text-center relative">
        {/* Confetti overlay */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {particles.map((p, i) => (
              <ConfettiParticle
                key={i}
                style={{
                  backgroundColor: p.color,
                  left: p.left,
                  top: '-10px',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animation: `confettiFall ${1.5 + (i % 3) * 0.5}s ease-in ${p.delay} forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-gradient-shift"></div>

        <div className="p-6 sm:p-10 relative">
          {/* Animated success icon with ripple rings */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="success-celebration-ring w-20 h-20" style={{ animationDelay: '0s' }}></div>
            <div className="success-celebration-ring w-20 h-20" style={{ animationDelay: '0.7s' }}></div>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-in border-4 border-white">
              <CheckCircle className="w-11 h-11" />
            </div>
          </div>

          {/* Stars decoration */}
          <div className="flex justify-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 text-amber-400 fill-amber-400 stagger-${i + 1} animate-fade-in-scale`} />
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 mb-2">
            আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto mb-2">
            সীতাকুণ্ড পৌরসভা কার্যালয়ের প্রকৌশল বিভাগে আপনার ভূমির ডিমার্কেশন ও মালিকানা সঠিকতা যাচাইয়ের আবেদন নিবন্ধিত হয়েছে।
          </p>

          {/* Tracking ID Box */}
          <div className="mt-6 max-w-lg mx-auto tracking-id-card rounded-2xl p-5 sm:p-6">
            <div className="text-xs sm:text-sm font-semibold text-emerald-700 mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              আবেদন ট্র্যাকিং আইডি
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-wider my-2 font-mono select-all py-1">
              {application.id}
            </div>
            <div className="text-xs text-slate-500 font-normal mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              দাখিলের তারিখ: {formatBanglaDate(application.createdAt)}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                id="btn-print-a4-success"
                onClick={handleDirectPrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>আবেদনপত্র প্রিন্ট (A4)</span>
              </button>
              <button
                id="btn-copy-id-success"
                onClick={handleCopyId}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm font-bold text-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border ${
                  copied
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400 hover:text-emerald-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'কপি হয়েছে ✓' : 'আইডি কপি করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info + QR Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Application summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 animate-fade-in-up stagger-2 feature-card">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            আবেদনের সারসংক্ষেপ
          </h2>
          <dl className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <dt className="font-medium text-slate-700 min-w-[90px]">আবেদনকারী:</dt>
              <dd className="truncate">{application.siteLocation.applicantName}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <dt className="font-medium text-slate-700 min-w-[90px]">মৌজা:</dt>
              <dd className="truncate">{application.schedule.mouza}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <dt className="font-medium text-slate-700 min-w-[90px]">দাখিলের তারিখ:</dt>
              <dd>{formatBanglaDate(application.createdAt)}</dd>
            </div>
          </dl>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900 mt-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>আবেদন ফি পৌরসভার ক্যাশ কাউন্টারে <strong className="font-bold">৳১০০/-</strong> প্রদান নিশ্চিত করুন।</p>
          </div>
        </div>

        {/* QR card */}
        <div className="animate-fade-in-up stagger-3">
          <ApplicationQRCodeCard application={application} />
        </div>
      </div>

      {/* Navigation CTA buttons */}
      <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up stagger-4">
        <button
          id="btn-goto-tracking"
          onClick={() => onGoToTracking(application.id)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          <span>আবেদনের অবস্থা দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-apply-another"
          onClick={onApplyAnother}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 hover:border-emerald-400 hover:text-emerald-800 text-slate-700 font-bold text-sm rounded-xl shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <FileText className="w-4 h-4" />
          <span>নতুন আবেদন করুন</span>
        </button>
      </div>
    </div>
  );
};