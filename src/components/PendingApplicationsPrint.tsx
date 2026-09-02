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

interface PendingApplicationsPrintProps {
  applications: DemarcationApplication[];
  onClose: () => void;
}

export const PendingApplicationsPrint: React.FC<PendingApplicationsPrintProps> = ({
  applications,
  onClose,
}) => {
  // Only filter pending applications
  const pendingApps = applications.filter((a) => a.status === 'pending');

  const handlePrint = () => {
    window.print();
  };

  const printTimestamp = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0">
      {/* Top Action Bar - Hidden in print mode */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            নির্বাহী প্রকৌশলী (XEN) এর অপেক্ষমান (Pending) আবেদনসমূহের একক PDF সামারি রিপোর্ট ({toBanglaNumber(pendingApps.length)} টি)
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>অপেক্ষমান আবেদন PDF রিপোর্ট প্রিন্ট করুন (A4)</span>
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
            </div>
          </div>
          <div className="inline-block bg-amber-100 text-amber-950 font-bold px-4 py-1 rounded-full text-xs sm:text-sm border border-amber-300 mt-1">
            অপেক্ষমান (Pending) ডিমার্কেশন আবেদনসমূহের সমন্বিত প্রতিবেদন
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600 mt-2 px-2">
            <span>প্রতিবেদন প্রস্তুতকরণ সময়: {printTimestamp}</span>
            <span>মোট অপেক্ষমান আবেদন: <strong className="text-amber-900 font-bold">{toBanglaNumber(pendingApps.length)} টি</strong></span>
          </div>
        </div>

        {/* Summary Table */}
        {pendingApps.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            বর্তমানে কোনো অপেক্ষমান (Pending) আবেদন নেই। সকল আবেদনের তদন্ত বা নিষ্পত্তি সম্পন্ন হয়েছে।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                  <th className="p-2 border border-slate-300 font-bold text-center w-10">ক্র.নং</th>
                  <th className="p-2 border border-slate-300 font-bold">ফরম ও ট্র্যাকিং আইডি</th>
                  <th className="p-2 border border-slate-300 font-bold">আবেদনকারী ও মোবাইল</th>
                  <th className="p-2 border border-slate-300 font-bold">মৌজা ও জে.এল</th>
                  <th className="p-2 border border-slate-300 font-bold">ওয়ার্ড</th>
                  <th className="p-2 border border-slate-300 font-bold">খতিয়ান ও দাগ নং</th>
                  <th className="p-2 border border-slate-300 font-bold">জমির পরিমাণ</th>
                  <th className="p-2 border border-slate-300 font-bold">ফি স্থিতি</th>
                  <th className="p-2 border border-slate-300 font-bold">আবেদনের তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((app, index) => (
                  <tr key={app.id} className={index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {toBanglaNumber(index + 1)}
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{app.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{app.formNo || '—'}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold text-slate-900">{app.siteLocation.applicantName}</div>
                      <div className="text-[11px] text-slate-600 font-mono">{app.siteLocation.applicantMobile}</div>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div>{app.schedule.mouzaName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">জে.এল #{toBanglaNumber(app.schedule.jlNo)}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                      {toBanglaNumber(app.schedule.wardNo)}
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div>বি.এস খতিয়ান: <span className="font-bold font-mono">{toBanglaNumber(app.schedule.bsKhatianNo)}</span></div>
                      <div>বি.এস দাগ: <span className="font-bold font-mono">{toBanglaNumber(app.schedule.bsDagNo)}</span></div>
                    </td>
                    <td className="p-2 border border-slate-300 font-mono">
                      {toBanglaNumber(app.schedule.landArea)} শতক
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      {app.feeStatus === 'paid' ? (
                        <span className="text-emerald-700 font-bold text-[11px]">পরিশোধিত</span>
                      ) : (
                        <span className="text-amber-800 font-bold text-[11px]">অপরিশোধিত</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 font-mono text-[11px]">
                      {formatBanglaDate(app.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Footer / Signature Area */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              নক্সাকার (সিভিল)
            </p>
            <p className="text-[11px] text-slate-500">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              নির্বাহী প্রকৌশলী (XEN)
            </p>
            <p className="text-[11px] text-slate-500">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              প্রশাসক / মেয়র
            </p>
            <p className="text-[11px] text-slate-500">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম</p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2">
          সীতাকুণ্ড পৌরসভা ডিজিটাল ভূমি ডিমার্কেশন ব্যবস্থাপনা সিস্টেম | সিস্টেম জেনারেটেড সারসংক্ষেপ রিপোর্ট
        </div>
      </div>
    </div>
  );
};
