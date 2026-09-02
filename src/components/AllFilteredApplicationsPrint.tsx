import React from 'react';
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { DemarcationApplication } from '../types';
import { MunicipalityLogo } from './MunicipalityLogo';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface AllFilteredApplicationsPrintProps {
  applications: DemarcationApplication[];
  filterSummary: {
    searchQuery: string;
    mouza: string;
    ward: string;
    status: string;
  };
  onClose: () => void;
  onExportCSV: () => void;
}

export const AllFilteredApplicationsPrint: React.FC<AllFilteredApplicationsPrintProps> = ({
  applications,
  filterSummary,
  onClose,
  onExportCSV,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const investigatingCount = applications.filter((a) => a.status === 'investigating').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const printTimestamp = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-emerald-800 font-bold text-xs">অনুমোদিত (Approved)</span>;
      case 'investigating':
        return <span className="text-blue-800 font-bold text-xs">তদন্তাধীন (Investigating)</span>;
      case 'rejected':
        return <span className="text-red-700 font-bold text-xs">বাতিল (Rejected)</span>;
      default:
        return <span className="text-amber-800 font-bold text-xs">অপেক্ষমান (Pending)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0">
      {/* Top Action Bar - Hidden in print mode */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            ফিল্টারকৃত আবেদনসমূহের প্রিন্ট ও সারসংক্ষেপ রেজিস্টার ({toBanglaNumber(totalCount)} টি আবেদন)
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV/Excel ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF সংরক্ষণ করুন (A4)</span>
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

      {/* Printable Sheet Container */}
      <div className="max-w-5xl mx-auto my-4 sm:my-8 bg-white p-6 sm:p-10 shadow-2xl rounded-xl border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-4 print:max-w-full relative print-card">
        {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-80 h-80 object-contain opacity-[0.08] filter contrast-125"
          />
        </div>

        {/* Municipality Header */}
        <div className="text-center pb-4 border-b-2 border-slate-800 mb-6 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <MunicipalityLogo size={52} />
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                সীতাকুণ্ড পৌরসভা কার্যালয়
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                সীতাকুণ্ড, চট্টগ্রাম | প্রকৌশল শাখা
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                ওয়েবসাইট: sitakundamunicipality.gov.bd
              </p>
            </div>
          </div>

          <div className="mt-3 inline-block bg-slate-100 border border-slate-300 px-4 py-1 rounded-md">
            <span className="text-sm font-bold text-slate-900">
              ভূমি সীমানা নির্ধারণ ও মালিকানা প্রত্যয়ন আবেদনের সার্বিক সারসংক্ষেপ রেজিস্টার
            </span>
          </div>
        </div>

        {/* Filter Summary & Generation Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-6 print:bg-white print:border-slate-300">
          <div>
            <span className="text-slate-500 block">মুদ্রণের তারিখ ও সময়:</span>
            <span className="font-bold text-slate-800">{printTimestamp}</span>
          </div>
          <div>
            <span className="text-slate-500 block">ফিল্টার মানদণ্ড:</span>
            <span className="font-bold text-slate-800">
              মৌজা: {filterSummary.mouza === 'all' ? 'সকল' : filterSummary.mouza} | ওয়ার্ড: {filterSummary.ward === 'all' ? 'সকল' : filterSummary.ward}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">আবেদন স্ট্যাটাস ফিল্টার:</span>
            <span className="font-bold text-slate-800">
              {filterSummary.status === 'all' ? 'সকল অবস্থা' : filterSummary.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">মোট তালিকাভুক্ত আবেদন:</span>
            <span className="font-bold text-emerald-800 text-sm">
              {toBanglaNumber(totalCount)} টি (অনুমোদিত: {toBanglaNumber(approvedCount)}, তদন্তাধীন: {toBanglaNumber(investigatingCount)}, অপেক্ষমান: {toBanglaNumber(pendingCount)})
            </span>
          </div>
        </div>

        {/* Applications Master Table */}
        {applications.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm">
            বর্তমান ফিল্টারে প্রদর্শনের মতো কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-[11px] leading-tight">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                  <th className="border border-slate-300 p-2 text-center w-8">ক্র.</th>
                  <th className="border border-slate-300 p-2 text-left">আইডি ও ফরম নং</th>
                  <th className="border border-slate-300 p-2 text-left">আবেদনকারী ও মোবাইল</th>
                  <th className="border border-slate-300 p-2 text-left">মৌজা ও জে.এল.</th>
                  <th className="border border-slate-300 p-2 text-left">খতিয়ান ও দাগ</th>
                  <th className="border border-slate-300 p-2 text-left">জমির পরিমাণ ও শ্রেণী</th>
                  <th className="border border-slate-300 p-2 text-left">নির্মাণের ধরন</th>
                  <th className="border border-slate-300 p-2 text-center">ফি</th>
                  <th className="border border-slate-300 p-2 text-center">বর্তমান অবস্থা</th>
                  <th className="border border-slate-300 p-2 text-left">কর্মকর্তার মন্তব্য / মেমো</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50 even:bg-slate-50/40">
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {toBanglaNumber(index + 1)}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono">
                      <span className="font-bold text-slate-900 block">{app.id}</span>
                      <span className="text-[10px] text-slate-500 block">{app.formNo || '-'}</span>
                      <span className="text-[10px] text-slate-400 block">{formatBanglaDate(app.createdAt)}</span>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-bold text-slate-900 block">{app.siteLocation.applicantName}</span>
                      <span className="text-[10px] text-slate-600 block">পিতা/স্বামী: {app.siteLocation.applicantFatherHusband}</span>
                      <span className="text-[10px] text-slate-700 font-mono block">মোবাইল: {app.siteLocation.applicantMobile}</span>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-bold text-slate-800 block">{app.schedule.mouzaName}</span>
                      <span className="text-[10px] text-slate-600 block">জে.এল: {toBanglaNumber(app.schedule.jlNo)}</span>
                      <span className="text-[10px] text-slate-600 block">{app.schedule.wardNo}</span>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="block font-medium">বি.এস খতিয়ান: {toBanglaNumber(app.schedule.bsKhatianNo)}</span>
                      <span className="block font-bold text-slate-900">বি.এস দাগ: {toBanglaNumber(app.schedule.bsDagNo)}</span>
                      {app.schedule.createdBsKhatianNo && (
                        <span className="text-[10px] text-blue-700 block">সৃজিত: {app.schedule.createdBsKhatianNo}</span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-bold text-slate-900 block">{app.schedule.landArea}</span>
                      <span className="text-[10px] text-slate-600 block">{app.schedule.landClass}</span>
                    </td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-medium text-slate-800 block">{app.proposedConstruction.constructionType}</span>
                      <span className="text-[10px] text-slate-500 block">{app.proposedConstruction.floorsCount}</span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        app.feeStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.feeStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="border border-slate-300 p-2 max-w-[200px]">
                      {app.engineerApproval?.memoNo ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-800 block">মেমো: {app.engineerApproval.memoNo}</span>
                          <span className="text-[10px] text-slate-600 block line-clamp-2">{app.engineerApproval.finalRemarks}</span>
                        </div>
                      ) : app.draftsmanReview?.remarks ? (
                        <span className="text-[10px] text-slate-700 block line-clamp-2">{app.draftsmanReview.remarks}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">কোনো মন্তব্য লিপিবদ্ধ নেই</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Verification Signatures Block */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="text-center">
            <div className="w-36 sm:w-44 mx-auto border-b border-slate-400 mb-1.5 h-10 flex items-end justify-center">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর)</span>
            </div>
            <span className="font-bold text-slate-900 block">প্রতিবেদন প্রস্তুতকারী / নক্সাকার (সিভিল)</span>
            <span className="text-[11px] text-slate-600 block">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</span>
          </div>

          <div className="text-center">
            <div className="w-36 sm:w-44 mx-auto border-b border-slate-400 mb-1.5 h-10 flex items-end justify-center">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর ও সিল)</span>
            </div>
            <span className="font-bold text-slate-900 block">নির্বাহী প্রকৌশলী</span>
            <span className="text-[11px] text-slate-600 block">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</span>
          </div>

          <div className="text-center">
            <div className="w-36 sm:w-44 mx-auto border-b border-slate-400 mb-1.5 h-10 flex items-end justify-center">
              <span className="text-[10px] text-slate-400 italic">(স্বাক্ষর ও সিল)</span>
            </div>
            <span className="font-bold text-slate-900 block">প্রশাসক / মেয়র (অনুমোদনকারী)</span>
            <span className="text-[11px] text-slate-600 block">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</span>
          </div>
        </div>

        {/* System Stamp Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
          * এই রেজিস্টার প্রতিবেদনটি সীতাকুণ্ড পৌরসভার অনলাইন ডিমার্কেশন ম্যানেজমেন্ট সিস্টেম থেকে তৈরি করা হয়েছে।
        </div>
      </div>
    </div>
  );
};
