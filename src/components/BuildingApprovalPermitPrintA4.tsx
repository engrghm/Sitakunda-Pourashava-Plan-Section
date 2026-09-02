import React from 'react';
import QRCode from 'react-qr-code';
import { Printer, X, ShieldCheck, CheckCircle2, FileDown, Building2 } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { BuildingConstructionApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface BuildingApprovalPermitPrintA4Props {
  application: BuildingConstructionApplication;
  onClose?: () => void;
}

export const BuildingApprovalPermitPrintA4: React.FC<BuildingApprovalPermitPrintA4Props> = ({
  application,
  onClose,
}) => {
  const [showToast, setShowToast] = React.useState(false);

  const handlePrint = () => {
    setShowToast(true);
    setTimeout(() => {
      window.print();
    }, 150);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/?track=${application.id}` : '';
  
  // Extract or fallback dynamic metadata
  const permitNo = (application as any).permitNo || `৬৩/২০২৬-২৭`;
  const memoNo = (application as any).memoNo || `সীঃপৌরঃ/প্রকৌঃ বিঃ/২০২৬/৭৬`;
  const permitDate = (application as any).permitIssueDate || application.createdAt || new Date().toISOString();
  
  // Floors and Use Type
  const floorsText = application.constructionDetails?.floorsCount || '৩ তলা';
  const useTypeText = application.constructionDetails?.useTypeTitle || (application.constructionDetails?.buildingUseType === 'commercial' ? 'বাণিজ্যিক' : 'আবাসিক');
  const coveredAreaSqM = application.constructionDetails?.totalCoveredAreaSqM || 345.99;
  const wardNo = application.siteDetails?.wardNo || '৭ নং ওয়ার্ড';
  const mouzaName = application.siteDetails?.mouzaName || 'আমিরাবাদ';
  const jlNo = application.siteDetails?.jlNo || '২৫';
  const rsKhatian = application.siteDetails?.rsKhatian || '২২৮';
  const rsDag = application.siteDetails?.rsDag || '১১৭৪';
  const bsKhatian = application.siteDetails?.bsKhatian || '২৭৪';
  const bsDag = application.siteDetails?.bsDag || '১৫৩৩';
  const deedNo = (application as any).deedNo || '৪১৪/২৩';
  const deedDate = (application as any).deedDate || '২৩/০১/২০২৪';

  const applicantName = application.applicantName || 'মোহাম্মদ সিরাজুল ইসলাম';
  const fatherName = application.applicantFatherHusband || 'নুরুল হক';
  const motherName = (application as any).applicantMotherName || 'মোসাম্মৎ নূর বাহার বেগম';
  const holdingNo = application.siteDetails?.holdingNo || '৫৮৮';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col items-center print:static print:bg-transparent print:overflow-visible print:p-0 print:m-0 print:block">
      {/* Toast Notification */}
      {showToast && (
        <div className="no-print fixed top-6 right-6 z-60 bg-emerald-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-start gap-3.5 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-emerald-700 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-white mb-0.5">অনুমতিপত্র PDF প্রস্তুত হচ্ছে</h4>
            <p className="text-emerald-100 text-xs leading-relaxed">
              প্রিন্ট ডায়ালগ থেকে Destination হিসেবে <strong>'Save as PDF'</strong> নির্বাচন করে ২ পাতার সরকারি অনুমতিপত্রটি ডাউনলোড করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar (hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-white rounded-2xl shadow-xl p-3.5 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 sticky top-2 z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm block">
              ইমারত নির্মাণের নকশার Lay-out Plan অনুমোদনের অনুমতিপত্র (Official Permit)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              সীতাকুণ্ড পৌরসভা কার্যালয় • সরকারি ২ পাতার মূল ফরম্যাট
            </span>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-mono font-bold border border-emerald-300">
            অনুমোদন নং: {permitNo}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF ডাউনলোড / প্রিন্ট করুন (২ পাতা A4)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Document Container */}
      <div className="w-full max-w-4xl space-y-8 print:space-y-0 print:w-full print:max-w-none">
        
        {/* =========================================================================
            PAGE 1: Header, Memo, Subject, Reference, Land Schedule, Conditions 1-10
            ========================================================================= */}
        <div className="bg-white text-slate-900 shadow-2xl print:shadow-none p-8 sm:p-12 md:p-14 font-serif text-[13px] sm:text-[14px] leading-relaxed mx-auto border border-slate-200 print:border-none print:p-8 min-h-[1050px] relative print:page-break-after-always flex flex-col justify-between">
          <div>
            {/* Top Official Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div className="w-20 h-20 shrink-0">
                <MunicipalityLogo size={75} />
              </div>

              <div className="text-center flex-1 px-4 space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">সীতাকুণ্ড পৌরসভা কার্যালয়</h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">সীতাকুণ্ড, চট্টগ্রাম।</p>
                <div className="pt-1">
                  <span className="text-sm sm:text-base font-black text-slate-900 inline-block px-3 py-0.5 border-b border-slate-900">
                    অনুমোদন নম্বর : {permitNo}
                  </span>
                </div>
              </div>

              {/* Mujib Centenary / Govt Emblem Badge */}
              <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-2 border-red-700 bg-red-50/50 flex flex-col items-center justify-center p-1 relative overflow-hidden shadow-2xs">
                  <div className="w-4 h-4 rounded-full bg-red-600 mb-0.5"></div>
                  <span className="text-[8px] font-black text-red-900 leading-tight">মুজিব শতবর্ষ</span>
                  <span className="text-[7px] font-bold text-green-800 font-mono">১০০</span>
                </div>
              </div>
            </div>

            {/* Memo No and Date Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-300">
              <div>
                <strong>স্মারক নং-</strong> {memoNo}
              </div>
              <div>
                <strong>তারিখঃ</strong> {formatBanglaDate(permitDate) || toBanglaNumber(permitDate)} খ্রিস্টাব্দ
              </div>
            </div>

            {/* Subject and Reference */}
            <div className="space-y-1.5 mb-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <strong className="shrink-0 text-slate-950">বিষয় :</strong>
                <p className="font-bold text-slate-950">
                  {floorsText} {useTypeText} ইমারত নির্মাণের নকশার Lay-out Plan অনুমোদনের অনুমতিপত্র।
                </p>
              </div>
              <div className="flex items-start gap-2">
                <strong className="shrink-0 text-slate-800">সূত্র :</strong>
                <p className="text-slate-800">তার দাখিলকৃত নকশা ও দলিলপত্র।</p>
              </div>
            </div>

            {/* Introductory Body Paragraph */}
            <p className="text-justify text-xs sm:text-sm leading-relaxed mb-4 text-slate-900">
              উপর্যুক্ত বিষয়ের প্রেক্ষিতে, দাখিলকৃত ইমারত নির্মাণের নকশা (Plan) মোতাবেক সীতাকুণ্ড পৌরসভাধীন <strong>{wardNo}</strong> এ অবস্থিত নিম্নবর্ণিত জমির তফসিল, পরিমাপ এবং আরোপিত শর্তাবলি অনুসরণ সাপেক্ষে সর্বমোট (সকল তলা) <strong>{toBanglaNumber(coveredAreaSqM)} বর্গ মিটার</strong> এরিয়ার <strong>{floorsText} {useTypeText} ইমারতের নকশার লেআউট প্ল্যান (Lay-out Plan)</strong> শর্ত সাপেক্ষে সীতাকুণ্ড পৌরসভার ইমারত/স্থাপনা নকশা অনুমোদন এবং ভবনের গুণগত মান নিশ্চিতকরণ কমিটির সুপারিশক্রমে অনুমোদন প্রদান করা হলো।
            </p>

            {/* Land Schedule Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm mb-4 space-y-1">
              <h4 className="font-bold text-slate-950 underline mb-1">জমির তফসিল :</h4>
              <p className="leading-relaxed text-slate-900">
                মৌজা- <strong>{mouzaName}</strong>, জে.এল. নং-<strong>{toBanglaNumber(jlNo)}</strong>, আর.এস. খতিয়ান নং-<strong>{toBanglaNumber(rsKhatian)}</strong>, আর.এস. দাগ নং-<strong>{toBanglaNumber(rsDag)}</strong>, বি.এস. খতিয়ান নং-<strong>{toBanglaNumber(bsKhatian)}</strong>, বি.এস. দাগ নং-<strong>{toBanglaNumber(bsDag)}</strong>, দলিল নং-<strong>{toBanglaNumber(deedNo)}</strong>, তারিখ: <strong>{toBanglaNumber(deedDate)}</strong> খ্রি., পৌরসভা ওয়ার্ড নং-<strong>{toBanglaNumber(wardNo)}</strong>।
              </p>
            </div>

            {/* Conditions 1 to 10 */}
            <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-justify text-slate-900">
              <h4 className="font-bold text-slate-950 text-sm underline mb-2">
                ইমারত নির্মাণের নকশার Layout Plan অনুমোদনের শর্তাবলী:
              </h4>

              <div className="space-y-2">
                <p>
                  <strong>১.</strong> মালিককে অবশ্যই তার নিজস্ব রেকর্ডভুক্ত জমিতে সার্বক্ষণিক সুপারভিশন প্রকৌশলীর (Supervision Engineer) তত্ত্বাবধানে ইমারত নির্মাণ করতে হবে।
                </p>
                <p>
                  <strong>২.</strong> মালিককে ইমারতের সামনে, পিছনে ও দুই পাশে বিধি মোতাবেক নির্ধারিত উন্মুক্ত স্থান বাধ্যতামূলকভাবে রাখতে হবে।
                </p>
                <p>
                  <strong>৩.</strong> মালিককে ইমারত নির্মাণের পূর্বে সুপারভিশন প্রকৌশলী নিয়োগ করে নির্ধারিত ফরমে পৌরসভাকে অবহিত করতে হবে এবং অনুমোদিত স্থাপত্য নকশা (Architectural Design), কাঠামোগত নকশা (Structural Design) ও অন্যান্য প্রাসঙ্গিক নিয়ম অনুসারে নির্মাণকাজ বাস্তবায়ন করতে হবে।
                </p>
                <p>
                  <strong>৪.</strong> জমির মালিকানা সংক্রান্ত জটিলতা বা আবেদনপত্রে প্রদত্ত তথ্য ভুল/ত্রুটিপূর্ণ প্রমাণিত হলে মালিকের অনুমোদন স্বয়ংক্রিয়ভাবে বাতিল বলে গণ্য হবে এবং মালিক সম্পূর্ণ দায়ী থাকবেন।
                </p>
                <p>
                  <strong>৫.</strong> মালিককে নির্মাণকাজ চলাকালীন অনুমোদিত নকশার কপি সাইটে সংরক্ষণ করতে হবে এবং সাইটে নির্মাণ সংক্রান্ত তথ্য উল্লেখপূর্বক সাইনবোর্ড দৃশ্যমান স্থানে স্থাপন করতে হবে।
                </p>
                <p>
                  <strong>৬.</strong> মালিক অনুমোদিত নকশার কোনো পরিবর্তন করতে পারবেন না। পরিবর্তনের প্রয়োজন হলে মালিককে পুনঃঅনুমোদন নিতে হবে।
                </p>
                <p>
                  <strong>৭.</strong> মালিককে ইমারত নির্মাণ আইন ১৯৫২, বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) ২০২০ ও ইমারত নির্মাণ বিধিমালা ১৯৯৬ অনুযায়ী নির্মাণকাজ পরিচালনা করতে হবে।
                </p>
                <p>
                  <strong>৮.</strong> স্ট্রাকচারাল ডিজাইনের ত্রুটি বা নিম্নমানের নির্মাণের জন্য পৌর কর্তৃপক্ষ দায়ী নয়। এজন্য সংশ্লিষ্ট প্রকৌশলী, সুপারভিশন প্রকৌশলী ও ইমারত মালিক সম্পূর্ণভাবে দায়ী থাকবেন।
                </p>
                <p>
                  <strong>৯.</strong> মালিককে ইমারতের লে-আউট (Layout) প্রদানের পূর্বে পৌরসভাকে অবহিত করতে হবে এবং প্যারাপেট ওয়াল পর্যন্ত নির্মাণকাজ সম্পন্ন হলে মালিক ও সুপারভিশন প্রকৌশলীর যৌথ স্বাক্ষরিত প্রতিবেদন পৌরসভায় দিতে হবে।
                </p>
                <p>
                  <strong>১০.</strong> প্রতিটি কাঠামোগত ঢালাইয়ের (Structural Casting) পর মালিক ও সুপারভিশন প্রকৌশলী যৌথভাবে স্বাক্ষরিত নির্ধারিত ফরমে প্রতিবেদন পৌরসভায় দাখিল করে পরবর্তী কাজের অনুমতি নিতে হবে। এই প্রতিবেদন দাখিল না করলে মালিক সম্পূর্ণ দায়ী থাকবেন।
                </p>
              </div>
            </div>
          </div>

          {/* Page 1 Footer Note */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>সীতাকুণ্ড পৌরসভা • ইমারত অনুমোদন অনুমতিপত্র</span>
            <span>পাতা - ০১</span>
          </div>
        </div>

        {/* =========================================================================
            PAGE 2: Conditions 11-20, Signatures, Recipient, and CC Copies
            ========================================================================= */}
        <div className="bg-white text-slate-900 shadow-2xl print:shadow-none p-8 sm:p-12 md:p-14 font-serif text-[13px] sm:text-[14px] leading-relaxed mx-auto border border-slate-200 print:border-none print:p-8 min-h-[1050px] relative flex flex-col justify-between">
          <div>
            {/* Top Page 2 Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-4 text-xs font-semibold text-slate-700">
              <span>স্মারক নং: {memoNo}</span>
              <span>অনুমোদন নম্বর: {permitNo}</span>
            </div>

            {/* Conditions 11 to 20 */}
            <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed text-justify text-slate-900 mb-8">
              <p>
                <strong>১১.</strong> সুপারভিশন প্রকৌশলী পরিবর্তন বা নতুন নিয়োগের ক্ষেত্রে মালিককে নির্ধারিত ফরমে পৌরসভাকে অবহিত করা বাধ্যতামূলক। পরিবর্তন বা নতুন নিয়োগ না হওয়া পর্যন্ত মালিকের নির্মাণকাজ বন্ধ থাকবে।
              </p>
              <p>
                <strong>১২.</strong> মালিককে নির্মাণকাজ চলাকালীন পার্শ্ববর্তী ইমারত, পথচারী ও জনসাধারণের চলাচলে কোনো অসুবিধা সৃষ্টি করা থেকে বিরত থাকতে হবে। মালিককে সর্বোচ্চ নিরাপত্তা ব্যবস্থা গ্রহণ করতে হবে, অন্যথায় যেকোনো দুর্ঘটনার সম্পূর্ণ দায়ভার ইমারত মালিকের উপর বর্তাবে।
              </p>
              <p>
                <strong>১৩.</strong> মালিককে বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) ২০২০ অনুসারে নিম্নলিখিত ইমারত সংক্রান্ত সেবা (Building Utilities) নিশ্চিত করতে হবে যথা— পানির সরবরাহ, পয়ঃনিষ্কাশন, ড্রেনেজ ব্যবস্থা, গ্যাস সংযোগ, বৈদ্যুতিক স্থাপনা, শীতাতপ নিয়ন্ত্রণ (যদি প্রযোজ্য হয়)।
              </p>
              <p>
                <strong>১৪.</strong> মালিককে নির্মাণকাজ সম্পন্ন হওয়ার ৩০ (ত্রিশ) দিনের মধ্যে নির্ধারিত ফরমে পৌরসভাকে অবহিত করে ইমারত ব্যবহার সনদ (Occupancy Certificate) গ্রহণ করতে হবে। এই সময়সীমা অতিক্রম করলে মালিক দায়ী থাকবেন।
              </p>
              <p>
                <strong>১৫.</strong> মালিককে ইমারত সম্পূর্ণ বা আংশিক নির্মাণের পর বসবাস বা ব্যবহারের জন্য ব্যবহার সনদপত্র (Occupancy Certificate) গ্রহণ করা বাধ্যতামূলক। মালিককে সনদপত্র আবেদনপত্রের সঙ্গে নিম্নলিখিত দলিল সংযুক্ত করতে হবে-সুপারভিশন প্রকৌশলী কর্তৃক প্রদত্ত সমাপ্ত প্রতিবেদন, অনুমোদিত নকশার ভিত্তিতে নির্মিত ইমারতের নকশা (As-Built Drawing), ইমারত সংক্রান্ত সকল সেবা নকশা (Utility Drawings), নির্মাণ সংক্রান্ত বিভিন্ন পরীক্ষার রিপোর্ট (যেমন— কংক্রিট, রড, মাটি পরীক্ষা ইত্যাদি)।
              </p>
              <p>
                <strong>১৬.</strong> মালিক অনুমোদিত নকশায় নির্ধারিত উদ্দেশ্য ছাড়া অন্য কাজে ইমারত ব্যবহার করতে পারবেন না। এই শর্ত লঙ্ঘন করলে মালিক সম্পূর্ণ দায়ী থাকবেন।
              </p>
              <p>
                <strong>১৭.</strong> মালিককে গাড়ি পার্কিং ব্যবস্থা বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) ও ইমারত নির্মাণ বিধিমালা, ১৯৯৬ অনুযায়ী প্রযোজ্য হারে নিশ্চিত করতে হবে।
              </p>
              <p>
                <strong>১৮.</strong> মালিকের অনুমোদনপত্রের মেয়াদ ৩ (তিন) বছর। নির্ধারিত সময়ের মধ্যে নির্মাণকাজ সম্পন্ন না হলে মালিককে পুনরায় অনুমোদন গ্রহণ করতে হবে।
              </p>
              <p>
                <strong>১৯.</strong> মালিক উপরোল্লিখিত কোনো শর্ত লঙ্ঘন করলে, অনুমোদিত নকশার বাইরে কাজ করলে, <strong>"ইমারত নির্মাণ আইন, ১৯৫২"</strong>, <strong>"ইমারত নির্মাণ বিধিমালা, ১৯৯৬"</strong> বা <strong>"স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯"</strong> লঙ্ঘন করলে, পৌর কর্তৃপক্ষ মালিকের অনুমোদনপত্র ও নকশা বাতিলের ক্ষমতা সংরক্ষণ করে এবং মালিকের বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণ করতে পারবে।
              </p>
              <p>
                <strong>২০.</strong> মালিক উপরোক্ত আইন লঙ্ঘন করলে যেকোনো দুর্ঘটনা, আইনি জটিলতা বা দায়দায়িত্ব সম্পূর্ণরূপে ইমারত মালিক বহন করবেন এবং মালিকের বিরুদ্ধে প্রচলিত আইন অনুযায়ী দেওয়ানি ও ফৌজদারি মামলা দায়ের করা যাবে।
              </p>
            </div>

            {/* Official Signatures and Recipient Block */}
            <div className="pt-8 grid grid-cols-2 gap-6 items-start mt-6">
              {/* Recipient (প্রাপক) */}
              <div className="text-xs sm:text-sm text-slate-900 space-y-1">
                <strong className="block font-bold text-sm underline mb-1">প্রাপক</strong>
                <p className="leading-relaxed">
                  <strong>{applicantName} গং</strong><br/>
                  পিতা: {fatherName}<br/>
                  মাতা: {motherName}<br/>
                  ঠিকানা: হোল্ডিং নং-{holdingNo}, {mouzaName}, সীতাকুণ্ড পৌরসভা, উপজেলা- সীতাকুণ্ড, জেলা- চট্টগ্রাম।
                </p>
                
                <div className="pt-3 flex items-center gap-3">
                  <div className="p-2 bg-white border-2 border-slate-400 rounded-lg shadow-xs shrink-0">
                    <QRCode value={trackingUrl || `SKM-PERMIT-${permitNo}`} size={84} level="H" className="w-20 h-20" />
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <span className="font-bold text-slate-800 block mb-0.5">ডিজিটাল ভেরিফিকেশন QR</span>
                    <span>স্ক্যান করে মূল অনুমতিপত্র ও অনুমোদিত নকশা যাচাই করুন</span>
                  </div>
                </div>
              </div>

              {/* Administrator Signature Seal */}
              <div className="text-right text-xs sm:text-sm text-slate-900 space-y-1 pl-4">
                <div className="inline-block text-center">
                  <div className="w-32 h-10 border-b border-dotted border-slate-600 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-950">(মোঃ ফখরুল ইসলাম)</p>
                  <p className="text-slate-800">উপজেলা নির্বাহী অফিসার</p>
                  <p className="text-slate-800">সীতাকুণ্ড, চট্টগ্রাম</p>
                  <p className="font-bold text-slate-900">ও</p>
                  <p className="font-bold text-slate-950">প্রশাসক</p>
                  <p className="text-slate-800">সীতাকুণ্ড পৌরসভা, চট্টগ্রাম।</p>
                </div>
              </div>
            </div>

            {/* Copies / Distribution (অনুলিপি: অবগতি ও কার্যার্থে-) */}
            <div className="mt-8 pt-4 border-t border-slate-300 text-xs sm:text-[13px] text-slate-800 space-y-1">
              <strong className="block font-bold text-slate-950 underline mb-1">অনুলিপি: অবগতি ও কার্যার্থে-</strong>
              <div className="grid grid-cols-1 gap-1">
                <p>১. নির্বাহী প্রকৌশলী/পৌর নির্বাহী কর্মকর্তা, সীতাকুণ্ড পৌরসভা, চট্টগ্রাম।</p>
                <p>২. হিসাব রক্ষণ কর্মকর্তা, সীতাকুণ্ড পৌরসভা, চট্টগ্রাম।</p>
                <p>৩. কর নির্ধারক, সীতাকুণ্ড পৌরসভা, চট্টগ্রাম।</p>
                <p>৪. সংরক্ষণ নথি।</p>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>সীতাকুণ্ড পৌরসভা • ইমারত অনুমোদন অনুমতিপত্র</span>
            <span>পাতা - ০২ (সমাপ্ত)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
