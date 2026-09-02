import React from 'react';
import QRCode from 'react-qr-code';
import { Printer, X, FileDown, Construction, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { RoadCuttingApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface RoadCuttingApplicationPrintA4Props {
  application: RoadCuttingApplication;
  onClose?: () => void;
}

export const RoadCuttingApplicationPrintA4: React.FC<RoadCuttingApplicationPrintA4Props> = ({
  application,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?track=${application.id}`
    : `https://sitakunda-pourashava.gov.bd/?track=${application.id}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col items-center print:static print:bg-transparent print:overflow-visible print:p-0 print:m-0 print:block">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-white rounded-2xl shadow-xl p-3.5 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 sticky top-2 z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <Construction className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm block">
              রাস্তা কর্তনের অনুমতির আবেদনপত্র (A4 Official Document Layout)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              ব্রাউজারের প্রিন্ট ডায়ালগ থেকে 'Save as PDF' অপশন নির্বাচন করে সংরক্ষণ করুন
            </span>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md font-mono font-bold border border-amber-300">
            {application.id}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF ডাউনলোড / প্রিন্ট করুন (A4)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>বন্ধ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Official A4 Page Document Container */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg p-6 sm:p-10 text-slate-900 font-kalpurush border border-slate-300 print-card relative print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
        {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-80 h-80 object-contain opacity-[0.085] filter contrast-125"
          />
        </div>

        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-5 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="w-16 h-16 shrink-0 flex flex-col items-center justify-center bg-white rounded-full">
              <MunicipalityLogo className="w-full h-full" />
            </div>

            <div className="text-center flex-1 px-2">
              <div className="text-xs sm:text-sm font-bold text-slate-700">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight my-0.5">
                সীতাকুণ্ড পৌরসভা কার্যালয়
              </h1>
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                সীতাকুণ্ড, চট্টগ্রাম | প্রকৌশল বিভাগ
              </div>
            </div>

            <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-white p-1.5 border-2 border-slate-400 rounded-lg">
              <QRCode value={trackingUrl} size={80} level="H" style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="mt-2 inline-block bg-slate-100 border border-slate-400 px-4 py-1 rounded">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              পৌর এলাকার রাস্তা কর্তনের অনুমতির আবেদন ফরম
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 mt-2 px-1 font-mono">
            <span>ট্র্যাকিং আইডি: <strong className="text-slate-950 font-bold">{application.id}</strong></span>
            <span>ফরম নং: <strong className="text-slate-950">{application.formNo || 'SKM-RC-8041'}</strong></span>
            <span>তারিখ: <strong className="text-slate-950">{formatBanglaDate(application.createdAt)}</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs sm:text-sm relative z-10">
          {/* Section 1: Applicant Details */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
              ১। আবেদনকারীর বিবরণ:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>নাম:</strong> {application.applicantName}</div>
              <div><strong>পিতা/স্বামী:</strong> {application.applicantFatherHusband}</div>
              <div><strong>মোবাইল নম্বর:</strong> {toBanglaNumber(application.applicantPhone)}</div>
              <div><strong>এনআইডি (NID):</strong> {application.applicantNid ? toBanglaNumber(application.applicantNid) : 'প্রযোজ্য নহে'}</div>
              <div className="col-span-2"><strong>ঠিকানা:</strong> {application.applicantAddress}</div>
            </div>
          </div>

          {/* Section 2: Road & Cutting Specifications */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
              ২। প্রস্তাবিত রাস্তা ও কর্তন পরিমাপের বিবরণ:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>রাস্তার নাম ও অবস্থান:</strong> {application.roadName}</div>
              <div><strong>ওয়ার্ড নং:</strong> {application.wardNo}</div>
              <div className="col-span-2"><strong>কর্তনের উদ্দেশ্য:</strong> {application.purposeTitle}</div>
              <div className="col-span-2"><strong>সড়কের ধরন:</strong> {application.roadTypeTitle}</div>
              <div><strong>দৈর্ঘ্য (ফুট):</strong> {toBanglaNumber(application.cuttingLengthFt)} ফুট</div>
              <div><strong>প্রস্থ (ফুট):</strong> {toBanglaNumber(application.cuttingWidthFt)} ফুট</div>
              <div><strong>গভীরতা (ফুট):</strong> {application.cuttingDepthFt ? toBanglaNumber(application.cuttingDepthFt) + ' ফুট' : '৩ ফুট'}</div>
              <div><strong>মোট কর্তন ক্ষেত্রফল:</strong> {toBanglaNumber(application.totalAreaSqFt)} বর্গফুট</div>
              <div><strong>কাজের মেয়াদকাল:</strong> {toBanglaNumber(application.workDurationDays)} দিন</div>
              <div><strong>শুরুর সম্ভাব্য তারিখ:</strong> {formatBanglaDate(application.workStartDate)}</div>
            </div>
          </div>

          {/* Section 3: Fees */}
          <div className="border border-slate-300 rounded-lg p-3 bg-emerald-50/40">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
              ৩। আবেদন ফরম ফি বিবরণ:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>আবেদন ফরমের মূল্য:</strong> ৳ {toBanglaNumber(application.applicationFee || 100)}/- (একশত টাকা)</div>
              <div>
                <strong>পরিশোধ স্ট্যাটাস:</strong>{' '}
                {application.moneyReceiptNo ? (
                  <strong className="text-emerald-800 font-bold">
                    পরিশোধিত (পৌর ক্যাশ রশিদ নং: {application.moneyReceiptNo}{application.moneyReceiptDate ? ` - ${formatBanglaDate(application.moneyReceiptDate)}` : ''})
                  </strong>
                ) : (
                  <strong className="text-emerald-800 font-bold">পরিশোধিত (পৌর ক্যাশ কাউন্টার)</strong>
                )}
              </div>
              <div className="col-span-2 text-[11px] text-slate-600">
                * সীতাকুণ্ড পৌরসভা / প্রকৌশল বিভাগ কর্তৃক সরেজমিন পরিদর্শন ও পরিমাপ অন্তে নির্ধারিত রাস্তা পুনঃনির্মাণ ক্ষতিপূরণ ফি ট্রেজারী চালানের মাধ্যমে যথাসময়ে আদায়যোগ্য।
              </div>
            </div>
          </div>

          {/* Section 4: Official Declaration (অঙ্গীকারনামা) */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 text-xs">
              ৪। আবেদনকারীর অঙ্গীকারনামা:
            </h3>
            <div className="space-y-1 text-[11px] text-slate-800 leading-relaxed text-justify">
              <p>১. আমি অঙ্গীকার করিতেছি যে, নির্ধারিত সময়ের মধ্যে কাজ সমাপ্ত করিব এবং জনসাধারণের চলাচলে বিঘ্ন সৃষ্টি না করিয়া প্রয়োজনীয় সতর্কতামূলক সাইনবোর্ড ও লাল নিশানা স্থাপন করিব।</p>
              <p>২. রাস্তা কর্তন ও পুনঃনির্মাণের জন্য সীতাকুণ্ড পৌরসভা / সরকার কর্তৃক সরেজমিন পরিদর্শন ও পরিমাপ অন্তে নির্ধারিত ক্ষতিপূরণ ফি সরকারি নিয়ম অনুযায়ী চালানের মাধ্যমে যথাসময়ে জমা দিতে বাধ্য থাকিব।</p>
              <p>৩. রাস্তা খননকালে কোনো সরকারি/বেসরকারি ভূগর্ভস্থ লাইন ক্ষতিগ্রস্ত হইলে তাহার সম্পূর্ণ দায়-দায়িত্ব আমি বহন করিব।</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                আবেদনকারীর স্বাক্ষর
              </div>
              <div className="text-[10px] text-slate-500">{application.applicantName}</div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                নক্সাকার / উপ-সহকারী প্রকৌশলী
              </div>
              <div className="text-[10px] text-slate-500">সীতাকুণ্ড পৌরসভা</div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                সহকারী / নির্বাহী প্রকৌশলী
              </div>
              <div className="text-[10px] text-slate-500">সীতাকুণ্ড পৌরসভা</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
