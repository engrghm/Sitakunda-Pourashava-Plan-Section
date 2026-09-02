import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  User, 
  FileText,
  Calendar,
  Clock,
  Compass
} from 'lucide-react';
import { DemarcationApplication } from '../types';
import { MunicipalityLogo } from './MunicipalityLogo';
import { ApplicationQRCodeCard } from './ApplicationQRCodeCard';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface BulkApplicationsMergedPrintProps {
  applications: DemarcationApplication[];
  onClose: () => void;
}

export const BulkApplicationsMergedPrint: React.FC<BulkApplicationsMergedPrintProps> = ({
  applications,
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
    }, 5000);
  };

  const currentDateFormatted = formatBanglaDate(new Date().toISOString());

  const handleExportCSV = () => {
    const headers = [
      'ফরম নং',
      'ট্র্যাকিং আইডি',
      'দাখিলের তারিখ',
      'আবেদনকারী',
      'মোবাইল নম্বর',
      'মৌজা এলাকা',
      'জে.এল. নং',
      'ওয়ার্ড নং',
      'বি.এস খতিয়ান',
      'বি.এস দাগ',
      'জমির পরিমাণ',
      'জমির শ্রেণি',
      'ফি স্ট্যাটাস',
      'আবেদনের অবস্থা',
      'নক্সাকার মন্তব্য',
      'অনুমোদন মেমো নং',
    ];

    const rows = applications.map((app) => [
      `"${app.formNo || 'SKM-FORM-' + app.id.slice(-6)}"`,
      `"${app.id}"`,
      `"${app.createdAt}"`,
      `"${app.siteLocation.applicantName}"`,
      `"${app.siteLocation.applicantMobile}"`,
      `"${app.schedule.mouzaName}"`,
      `"${app.schedule.jlNo}"`,
      `"${app.schedule.wardNo}"`,
      `"${app.schedule.bsKhatianNo}"`,
      `"${app.schedule.bsDagNo}"`,
      `"${app.schedule.landArea}"`,
      `"${app.schedule.landClass}"`,
      `"${app.feeStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}"`,
      `"${app.status === 'approved' ? 'অনুমোদিত' : app.status === 'investigating' ? 'তদন্তাধীন' : app.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}"`,
      `"${(app.draftsmanReview?.remarks || '').replace(/"/g, '""')}"`,
      `"${app.engineerApproval?.memoNo || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sitakunda_bulk_selected_${applications.length}_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0">
      {/* Top Action Bar - Hidden in print */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            নির্বাচিত আবেদনের সমন্বিত বাল্ক PDF প্রিন্ট ও এক্সপোর্ট ({toBanglaNumber(applications.length)} টি আবেদন)
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>সকল নির্বাচিত আবেদন Merged PDF ডাউনলোড / প্রিন্ট করুন</span>
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
            <div className="font-bold text-white">বাল্ক PDF প্রিন্ট ও মার্জ প্রস্তুত হচ্ছে</div>
            <div className="text-slate-300">প্রিন্টার ডায়ালগে 'Save as PDF' নির্বাচন করলে {toBanglaNumber(applications.length)}টি আবেদনের একক মার্জড PDF ফাইল সংরক্ষিত হবে।</div>
          </div>
        </div>
      )}

      {/* Documents Container */}
      <div className="max-w-4xl mx-auto my-4 sm:my-8 space-y-8 print:space-y-0 print:m-0 print:max-w-full">
        {applications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
            কোনো আবেদন নির্বাচন করা হয়নি। অনুগ্রহ করে ড্যাশবোর্ড থেকে আবেদনসমূহ টিক দিয়ে নির্বাচন করুন।
          </div>
        ) : (
          applications.map((app, index) => (
            <div 
              key={app.id} 
              className={`bg-white p-6 sm:p-10 shadow-2xl rounded-xl border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-4 print:max-w-full relative print-card ${
                index > 0 ? 'print-page-break' : ''
              }`}
            >
              {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
                <img
                  src="/logo.png"
                  alt=""
                  className="w-80 h-80 object-contain opacity-[0.08] filter contrast-125"
                />
              </div>

              {/* Page Number Indicator */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-3 relative z-10">
                <span className="font-semibold text-emerald-800">
                  সীতাকুণ্ড পৌরসভা • বাল্ক ডিমার্কেশন রেজিস্টার ফাইল
                </span>
                <span className="font-mono font-bold">
                  আবেদন নং {toBanglaNumber(index + 1)} / {toBanglaNumber(applications.length)} | আইডি: {app.id}
                </span>
              </div>

              {/* Municipality Header */}
              <div className="text-center pb-3 border-b-2 border-slate-900 mb-4 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                  <MunicipalityLogo size={46} />
                  <div className="text-center">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                      সীতাকুণ্ড পৌরসভা কার্যালয়
                    </h1>
                    <p className="text-xs font-semibold text-slate-800">
                      সীতাকুণ্ড, চট্টগ্রাম • প্রকৌশল শাখা
                    </p>
                  </div>
                </div>

                <div className="inline-block bg-slate-900 text-white px-4 py-1 rounded text-xs font-bold mt-1">
                  ভূমি সীমানা নির্ধারণ ও মালিকানা প্রত্যয়ন আবেদনপত্র (কপি)
                </div>
              </div>

              {/* Application Core Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-lg p-2.5 mb-4 text-xs relative z-10">
                <div>
                  <span className="text-slate-500 block text-[10px]">ট্র্যাকিং আইডি:</span>
                  <span className="font-mono font-bold text-slate-900">{app.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ফরম নং:</span>
                  <span className="font-mono font-bold text-emerald-800">{app.formNo || `SKM-FORM-${app.id.slice(-6)}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">দাখিলের তারিখ:</span>
                  <span className="font-bold text-slate-900">{formatBanglaDate(app.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">বর্তমান স্ট্যাটাস:</span>
                  <span className="font-bold text-slate-900">
                    {app.status === 'approved' ? 'অনুমোদিত ও প্রত্যয়িত' : app.status === 'investigating' ? 'তদন্তাধীন' : app.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}
                  </span>
                </div>
              </div>

              {/* Applicant & Construction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs relative z-10">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>আবেদনকারীর তথ্য</span>
                  </h4>
                  <div className="space-y-0.5 text-slate-800">
                    <div><span className="text-slate-500">নাম:</span> <strong>{app.siteLocation.applicantName}</strong></div>
                    <div><span className="text-slate-500">পিতা/স্বামী:</span> {app.siteLocation.applicantFatherHusband}</div>
                    <div><span className="text-slate-500">মোবাইল:</span> <span className="font-mono font-bold">{app.siteLocation.applicantMobile}</span></div>
                    <div><span className="text-slate-500">এনআইডি:</span> <span className="font-mono">{app.siteLocation.applicantNid}</span></div>
                    <div><span className="text-slate-500">স্থায়ী ঠিকানা:</span> {app.siteLocation.applicantPermanentAddress}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>প্রস্তাবিত নির্মাণ ও মালিকানা</span>
                  </h4>
                  <div className="space-y-0.5 text-slate-800">
                    <div><span className="text-slate-500">নির্মাণের ধরন:</span> <strong>{app.proposedConstruction?.constructionType || 'ভবন নির্মাণ'}</strong></div>
                    <div><span className="text-slate-500">তলার সংখ্যা:</span> {app.proposedConstruction?.floorsCount || 'প্রযোজ্য নয়'}</div>
                    <div><span className="text-slate-500">উদ্দেশ্য:</span> {app.proposedConstruction?.purpose || 'সীমানা নির্ধারণ'}</div>
                    <div><span className="text-slate-500">মোট মালিক:</span> {toBanglaNumber(app.landOwners?.length || 0)} জন ({(app.landOwners || []).map(o => o.name).join(', ')})</div>
                  </div>
                </div>
              </div>

              {/* Land Schedule Table */}
              <div className="border border-slate-300 rounded-lg p-3 mb-4 bg-white relative z-10 text-xs">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>জমির তফসিল ও চতুর্দিকস্থ সীমানা</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <div><span className="text-slate-500 block text-[10px]">মৌজা:</span> <strong>{app.schedule.mouzaName} (জে.এল. {toBanglaNumber(app.schedule.jlNo)})</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">ওয়ার্ড নং:</span> <strong>{app.schedule.wardNo}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">বি.এস খতিয়ান ও দাগ:</span> <strong>খতিয়ান-{toBanglaNumber(app.schedule.bsKhatianNo)}, দাগ-{toBanglaNumber(app.schedule.bsDagNo)}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">জমির পরিমাণ ও শ্রেণি:</span> <strong>{app.schedule.landArea} ({app.schedule.landClass})</strong></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-200 text-[11px]">
                  <div><span className="text-slate-500">উত্তর:</span> {app.schedule.boundaryNorth || '-'}</div>
                  <div><span className="text-slate-500">দক্ষিণ:</span> {app.schedule.boundarySouth || '-'}</div>
                  <div><span className="text-slate-500">পূর্ব:</span> {app.schedule.boundaryEast || '-'}</div>
                  <div><span className="text-slate-500">পশ্চিম:</span> {app.schedule.boundaryWest || '-'}</div>
                </div>
              </div>

              {/* Official Review & Remarks */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 text-xs relative z-10">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>পৌরসভা নক্সাকার ও প্রকৌশল মূল্যায়ন প্রতিবেদন</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    ফি স্ট্যাটাস: {app.feeStatus === 'paid' ? 'পরিশোধিত (১০০/- টাকা)' : 'অপরিশোধিত'}
                  </span>
                </div>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  {app.draftsmanReview?.remarks || 'মৌজা নকশা ও খতিয়ান অনুযায়ী প্রাথমিক যাচাই সম্পন্ন হয়েছে।'}
                </p>
                {app.engineerApproval?.memoNo && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-emerald-950 font-bold">
                    স্মারক নং: {app.engineerApproval.memoNo} | প্রত্যয়ন সনদ নং: {app.engineerApproval.certificateNo || 'অনুমোদিত'}
                  </div>
                )}
              </div>

              {/* Signatures & QR Block */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-xs text-center relative z-10">
                <div>
                  <div className="h-10 flex items-end justify-center border-b border-slate-400 mb-1">
                    <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর)</span>
                  </div>
                  <span className="font-bold text-slate-900 block text-[11px]">আবেদনকারী</span>
                </div>

                <div>
                  <div className="h-10 flex items-end justify-center border-b border-slate-400 mb-1">
                    <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর ও সিল)</span>
                  </div>
                  <span className="font-bold text-slate-900 block text-[11px]">নক্সাকার (সিভিল)</span>
                </div>

                <div>
                  <div className="h-10 flex items-end justify-center border-b border-slate-400 mb-1">
                    <span className="text-[10px] text-slate-400 italic">(অনুমোদন ও সিল)</span>
                  </div>
                  <span className="font-bold text-slate-900 block text-[11px]">নির্বাহী প্রকৌশলী</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
