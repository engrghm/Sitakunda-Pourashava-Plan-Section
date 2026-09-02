import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Compass
} from 'lucide-react';
import { DemarcationApplication } from '../types';
import { MunicipalityLogo } from './MunicipalityLogo';
import { ApplicationQRCodeCard } from './ApplicationQRCodeCard';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface FieldInspectionSchedulePrintProps {
  application: DemarcationApplication;
  onClose: () => void;
}

export const FieldInspectionSchedulePrint: React.FC<FieldInspectionSchedulePrintProps> = ({
  application,
  onClose,
}) => {
  const [showToast, setShowToast] = useState(false);

  const handlePrint = () => {
    setShowToast(true);
    setTimeout(() => {
      window.print();
    }, 300);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  const currentDateFormatted = formatBanglaDate(new Date().toISOString());
  const inspectionDate = application.draftsmanReview?.inspectionDate 
    ? formatBanglaDate(application.draftsmanReview.inspectionDate) 
    : formatBanglaDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString());

  const memoNo = application.engineerApproval?.memoNo || 
    `সীতাপৌ/প্রকৌ/পরিদর্শন/${toBanglaNumber(new Date().getFullYear())}/${toBanglaNumber(application.id.replace(/\D/g, '').slice(-4) || '1042')}`;

  const assignedOfficer = application.draftsmanReview?.reviewerName || 'মো. রফিকুল ইসলাম (নক্সাকার - সিভিল)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0">
      {/* Top Action Bar - Hidden during print */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            সরজমিন সীমানা নির্ধারণ ও তদন্ত পরিদর্শন শিডিউল আদেশপত্র (Field Inspection Schedule)
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>পরিদর্শন শিডিউল প্রিন্ট / PDF সংরক্ষণ করুন</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 text-emerald-100 border border-emerald-500/50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-top-4 print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">প্রিন্ট ও PDF প্রস্তুত হচ্ছে</div>
            <div className="text-slate-300">প্রিন্ট ডায়ালগ থেকে 'Save as PDF' নির্বাচন করে ফাইল সংরক্ষণ করতে পারেন।</div>
          </div>
        </div>
      )}

      {/* Printable Official Sheet */}
      <div className="max-w-4xl mx-auto my-4 sm:my-8 bg-white p-6 sm:p-10 shadow-2xl rounded-xl border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-4 print:max-w-full relative print-card">
        {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-80 h-80 object-contain opacity-[0.08] filter contrast-125"
          />
        </div>

        {/* Municipality Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-5 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <MunicipalityLogo size={60} />
            <div className="text-center">
              <h3 className="text-xs font-semibold text-slate-700 tracking-wider">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
              </h3>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                সীতাকুণ্ড পৌরসভা কার্যালয়
              </h1>
              <p className="text-xs font-semibold text-slate-800">
                সীতাকুণ্ড, চট্টগ্রাম • প্রকৌশল শাখা
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                ইমেইল: info@sitakundamunicipality.gov.bd • হেল্পলাইন: ০১৮১৯-XXXXXX
              </p>
            </div>
          </div>

          <div className="mt-3 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-md shadow-xs">
            <span className="text-sm font-bold tracking-wide">
              সরজমিন সীমানা নির্ধারণ ও তদন্ত পরিদর্শন শিডিউল আদেশপত্র
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 mt-3 px-2 font-mono">
            <span>স্মারক নং: <strong className="text-slate-900">{memoNo}</strong></span>
            <span>ইস্যুর তারিখ: <strong className="text-slate-900">{currentDateFormatted}</strong></span>
          </div>
        </div>

        {/* Notice Subject & Reference */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-5 text-xs text-slate-800 space-y-1 relative z-10">
          <div>
            <strong>বিষয়:</strong> সীতাকুণ্ড পৌরসভার <strong>{application.schedule.wardNo}</strong>-এর <strong>{application.schedule.mouzaName}</strong> মৌজার <strong>বি.এস দাগ নং {toBanglaNumber(application.schedule.bsDagNo)}</strong> এ প্রস্তাবিত <strong>{application.proposedConstruction.constructionType}</strong> এর সীমানা চিহ্নিতকরণার্থে সরজমিন পরিদর্শন ও তদন্ত সংক্রান্ত।
          </div>
          <div>
            <strong>সূত্র:</strong> আবেদন ট্র্যাকিং আইডি: <span className="font-mono font-bold">{application.id}</span> | আবেদন দাখিলের তারিখ: {formatBanglaDate(application.createdAt)}
          </div>
        </div>

        {/* Inspection Schedule Highlights Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/90 border-2 border-emerald-600 rounded-xl p-4 mb-5 text-xs relative z-10">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-emerald-900 font-semibold block">নির্ধারিত পরিদর্শনের তারিখ:</span>
              <span className="font-bold text-slate-900 text-sm">{inspectionDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-emerald-900 font-semibold block">নির্ধারিত সময়:</span>
              <span className="font-bold text-slate-900 text-sm">সকাল ১০:৩০ ঘটিকা</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-emerald-900 font-semibold block">দায়িত্বপ্রাপ্ত কর্মকর্তা:</span>
              <span className="font-bold text-slate-900 text-sm">{assignedOfficer}</span>
            </div>
          </div>
        </div>

        {/* Applicant and Land Location Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs relative z-10">
          {/* Applicant Info */}
          <div className="border border-slate-300 rounded-lg p-3.5 bg-white">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>আবেদনকারী ও মালিকানার বিবরণ</span>
            </h4>
            <div className="space-y-1 text-slate-800">
              <div><span className="text-slate-600">মূল আবেদনকারী:</span> <strong>{application.siteLocation?.applicantName || application.applicantName || 'নাগরিক'}</strong></div>
              <div><span className="text-slate-600">পিতা/স্বামীর নাম:</span> {application.siteLocation?.applicantFatherHusband || 'তথ্য নেই'}</div>
              <div><span className="text-slate-600">মোবাইল নম্বর:</span> <span className="font-mono font-bold text-emerald-900">{application.siteLocation?.applicantMobile || application.applicantMobile || 'তথ্য নেই'}</span></div>
              <div><span className="text-slate-600">জাতীয় পরিচয়পত্র (NID):</span> <span className="font-mono">{application.siteLocation?.applicantNid || application.applicantNid || 'তথ্য নেই'}</span></div>
              <div><span className="text-slate-600">স্থায়ী ঠিকানা:</span> {application.siteLocation?.applicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা'}</div>
              <div><span className="text-slate-600">মোট ভূমির মালিক:</span> {toBanglaNumber(application.landOwners?.length || 1)} জন ({(application.landOwners || []).map(o => o.name).join(', ') || application.applicantName || 'নাগরিক'})</div>
            </div>
          </div>

          {/* Land Schedule */}
          <div className="border border-slate-300 rounded-lg p-3.5 bg-white">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>জমির তফসিল ও অবস্থান</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-800">
              <div><span className="text-slate-600">মৌজা:</span> <strong>{application.schedule?.mouzaName || application.mouzaName || 'সীতাকুণ্ড'}</strong></div>
              <div><span className="text-slate-600">জে.এল. নং:</span> {toBanglaNumber(application.schedule?.jlNo || '')}</div>
              <div><span className="text-slate-600">পৌর ওয়ার্ড নং:</span> {application.schedule?.wardNo || '০১'}</div>
              <div><span className="text-slate-600">জমির শ্রেণি:</span> {application.schedule?.landClass || 'বাস্তু'}</div>
              <div><span className="text-slate-600">বি.এস খতিয়ান:</span> <strong className="text-emerald-900">{toBanglaNumber(application.schedule?.bsKhatianNo || '')}</strong></div>
              <div><span className="text-slate-600">বি.এস দাগ নং:</span> <strong className="text-emerald-900">{toBanglaNumber(application.schedule?.bsDagNo || application.bsDagNo || '')}</strong></div>
              {application.schedule.createdBsKhatianNo && (
                <div className="col-span-2"><span className="text-slate-600">সৃজিত বি.এস খতিয়ান:</span> {application.schedule.createdBsKhatianNo}</div>
              )}
              <div><span className="text-slate-600">জমির পরিমাণ:</span> <strong>{application.schedule.landArea}</strong></div>
              <div><span className="text-slate-600">দলিল নং:</span> {application.schedule.deedNo}</div>
            </div>
          </div>
        </div>

        {/* Four Boundaries (চৌহদ্দি) Table */}
        <div className="border border-slate-300 rounded-lg p-3 mb-5 bg-white relative z-10">
          <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>জমির চতুর্দিকস্থ সীমানা ও চৌহদ্দি (Four Boundaries)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 font-semibold block text-[11px]">উত্তর সীমানা (North):</span>
              <span className="font-bold text-slate-900">{application.schedule.boundaryNorth || 'বি.এস দাগ সংলগ্ন'}</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 font-semibold block text-[11px]">দক্ষিণ সীমানা (South):</span>
              <span className="font-bold text-slate-900">{application.schedule.boundarySouth || 'রাস্তা / দাগ সংলগ্ন'}</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 font-semibold block text-[11px]">পূর্ব সীমানা (East):</span>
              <span className="font-bold text-slate-900">{application.schedule.boundaryEast || 'বি.এস দাগ সংলগ্ন'}</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 font-semibold block text-[11px]">পশ্চিম সীমানা (West):</span>
              <span className="font-bold text-slate-900">{application.schedule.boundaryWest || 'বি.এস দাগ সংলগ্ন'}</span>
            </div>
          </div>
        </div>

        {/* Mandatory Instructions & Check Items for Field Inspection */}
        <div className="border border-slate-300 rounded-lg p-3.5 mb-5 bg-slate-50/70 text-xs relative z-10">
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>সরজমিন পরিদর্শনে উপস্থিত কর্মকর্তা ও আবেদনকারীর করণীয় নির্দেশাবলী:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed text-[11px]">
            <li>নির্ধারিত তারিখে আবেদনকারী বা তার ক্ষমতাপ্রাপ্ত প্রতিনিধির মূল মালিকানা দলিল, খতিয়ান ও নকশার কপিসহ উপস্থিত থাকা বাধ্যতামূলক।</li>
            <li>জমির উত্তর, দক্ষিণ, পূর্ব ও পশ্চিম পার্শ্বের সীমানা অংশীদার / প্রতিবেশীদের উক্ত সময়ে উপস্থিত থাকার জন্য অনুরোধ করা যাচ্ছে।</li>
            <li>দায়িত্বপ্রাপ্ত নক্সাকার (সিভিল) মৌজা শিট অনুযায়ী ফিতা/চেইন দিয়ে দাগের চতুর্দিক পরিমাপ করবেন এবং জিপিএস রিডিং লিপিবদ্ধ করবেন।</li>
            <li>সরজমিনে কোনো বিরোধ বা সরকারি/পৌরসভা খাস খাস জমি অন্তর্ভুক্ত আছে কিনা তা পুঙ্খানুপুঙ্খ যাচাই করে স্কেচ ম্যাপ তৈরি করতে হবে।</li>
          </ol>
        </div>

        {/* Adjacent Landowners & Witnesses Signatures Table */}
        <div className="border border-slate-300 rounded-lg p-3 mb-6 bg-white relative z-10">
          <h4 className="font-bold text-slate-900 text-xs mb-2">
            সরজমিনে উপস্থিত পার্শ্ববর্তী সীমানা অংশীদার / স্বাক্ষীদের উপস্থিতি ও স্বাক্ষর তালিকা:
          </h4>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="border border-slate-300 p-1.5 text-center w-8">ক্র.</th>
                <th className="border border-slate-300 p-1.5 text-left">নাম ও পিতার নাম</th>
                <th className="border border-slate-300 p-1.5 text-left">সংলগ্ন বি.এস দাগ নং</th>
                <th className="border border-slate-300 p-1.5 text-left">মোবাইল নম্বর</th>
                <th className="border border-slate-300 p-1.5 text-center w-28">স্বাক্ষর / টিপসহি</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((num) => (
                <tr key={num} className="h-7">
                  <td className="border border-slate-300 p-1 text-center font-bold">{toBanglaNumber(num)}</td>
                  <td className="border border-slate-300 p-1"></td>
                  <td className="border border-slate-300 p-1"></td>
                  <td className="border border-slate-300 p-1"></td>
                  <td className="border border-slate-300 p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Authority Signatures Block */}
        <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-4 text-xs text-center relative z-10">
          <div>
            <div className="h-12 flex items-end justify-center border-b border-slate-400 mb-1">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর)</span>
            </div>
            <span className="font-bold text-slate-900 block">আবেদনকারী / ভূমির মালিক</span>
            <span className="text-[10px] text-slate-600 block">{application.siteLocation.applicantName}</span>
          </div>

          <div>
            <div className="h-12 flex items-end justify-center border-b border-slate-400 mb-1">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর ও তারিখ)</span>
            </div>
            <span className="font-bold text-slate-900 block">দায়িত্বপ্রাপ্ত নক্সাকার (সিভিল)</span>
            <span className="text-[10px] text-slate-600 block">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</span>
          </div>

          <div>
            <div className="h-12 flex items-end justify-center border-b border-slate-400 mb-1">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর ও অফিসিয়াল সিল)</span>
            </div>
            <span className="font-bold text-slate-900 block">নির্বাহী প্রকৌশলী / সহকারী প্রকৌশলী</span>
            <span className="text-[10px] text-slate-600 block">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</span>
          </div>
        </div>

        {/* QR Verification & System Note Footer */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
          <div>
            * এই আদেশপত্রটি পৌরসভা কার্যালয় কর্তৃক স্বয়ংক্রিয়ভাবে ডিজিটালি প্রস্তুতকৃত।
          </div>
          <div className="font-mono">
            Security ID: {application.id}-{toBanglaNumber(new Date().getFullYear())}
          </div>
        </div>
      </div>
    </div>
  );
};
