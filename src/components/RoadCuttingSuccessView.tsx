import React from 'react';
import QRCode from 'react-qr-code';
import { 
  CheckCircle2, 
  Printer, 
  Search, 
  Construction, 
  MapPin, 
  Calendar, 
  Coins, 
  ArrowLeft,
  Share2,
  FileCheck2
} from 'lucide-react';
import { RoadCuttingApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface RoadCuttingSuccessViewProps {
  application: RoadCuttingApplication;
  onPrintA4: () => void;
  onTrack: (id: string) => void;
  onNewApplication: () => void;
}

export const RoadCuttingSuccessView: React.FC<RoadCuttingSuccessViewProps> = ({
  application,
  onPrintA4,
  onTrack,
  onNewApplication,
}) => {
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?track=${application.id}`
    : `https://sitakunda-pourashava.gov.bd/?track=${application.id}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Success Celebration Header */}
      <div className="bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-white text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          সফলভাবে আবেদন দাখিল হয়েছে
        </span>
        <h1 className="text-xl sm:text-2xl font-black">
          রাস্তা খনন / কর্তন অনুমোদনের আবেদন সম্পন্ন হয়েছে
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-lg mx-auto">
          আপনার আবেদনটি সীতাকুণ্ড পৌরসভার প্রকৌশল বিভাগে পর্যালোচনার জন্য গৃহীত হয়েছে।
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-amber-900 block">ট্র্যাকিং আইডি (Tracking ID):</span>
            <span className="text-2xl font-mono font-black text-amber-950 block mt-0.5">
              {application.id}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ফরম নং: {application.formNo} | তারিখ: {formatBanglaDate(application.createdAt)}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border-2 border-amber-400 shrink-0 shadow-md">
            <QRCode value={trackingUrl} size={110} level="H" className="w-24 h-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-xs">আবেদনকারী:</span>
            <strong className="text-slate-900 block mt-0.5">{application.applicantName}</strong>
            <span className="text-slate-600 text-xs font-mono">{toBanglaNumber(application.applicantPhone)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-xs">রাস্তার নাম ও অবস্থান:</span>
            <strong className="text-slate-900 block mt-0.5">{application.roadName}</strong>
            <span className="text-slate-600 text-xs">{application.wardNo}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-xs">কর্তনের উদ্দেশ্য ও পরিমাপ:</span>
            <strong className="text-slate-900 block mt-0.5">{application.purposeTitle}</strong>
            <span className="text-slate-600 text-xs">
              {toBanglaNumber(application.cuttingLengthFt)} × {toBanglaNumber(application.cuttingWidthFt)} = {toBanglaNumber(application.totalAreaSqFt)} বর্গফুট
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-xs">মোট সরকারি ফি:</span>
            <strong className="text-emerald-800 text-base block mt-0.5 font-bold">
              ৳ {toBanglaNumber(application.totalAmount)}/- (পরিশোধিত)
            </strong>
            <span className="text-slate-500 text-xs">পদ্ধতি: {application.paymentMethodTitle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onNewApplication}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>নতুন আবেদন করুন</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onPrintA4}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-200" />
              <span>আবেদনপত্র প্রিন্ট / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => onTrack(application.id)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>স্ট্যাটাস ট্র্যাক করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
