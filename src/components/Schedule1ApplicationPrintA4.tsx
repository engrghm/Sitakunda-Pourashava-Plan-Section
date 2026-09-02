import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { BuildingConstructionApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { Printer, Download, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';

interface Schedule1ApplicationPrintA4Props {
  application: BuildingConstructionApplication;
  onClose: () => void;
}

export const Schedule1ApplicationPrintA4: React.FC<Schedule1ApplicationPrintA4Props> = ({
  application,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Top Floating Action Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-100">
              তফসিল - ১ আবেদন পত্র (A4 অফিসিয়াল প্রিন্ট ভিউ)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF সংরক্ষণ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            Official Printable Statutory A4 Sheet (Schedule - 1)
            ========================================================================= */}
        <div
          ref={printRef}
          className="p-6 sm:p-10 bg-white text-slate-900 font-kalpurush text-xs sm:text-sm leading-relaxed relative print-card"
          style={{ minHeight: '1120px' }}
        >
          {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
            <img
              src="/logo.png"
              alt=""
              className="w-80 h-80 object-contain opacity-[0.085] filter contrast-125"
            />
          </div>

          {/* Government / Municipality Letterhead */}
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-4 relative z-10">
            <div className="flex justify-center items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300">
                <MunicipalityLogo className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  সীতাকুণ্ড পৌরসভা কার্যালয়
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  সীতাকুণ্ড, চট্টগ্রাম • প্রকৌশল শাখা
                </p>
              </div>
            </div>
            
            <div className="mt-2 inline-block bg-slate-100 px-4 py-1 rounded border border-slate-300">
              <span className="text-xs font-bold text-slate-800">
                তফসিল - ১ [বিধি ২ এর দফা (চ) দ্রষ্টব্য]
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 max-w-2xl mx-auto">
              Building Construction Act, 1952 (E. B. Act II of 1953) এর Section 3 এবং 3c এর অধীন ইমারত নির্মাণ অনুমোদনের জন্য আবেদন পত্রের ফরম।
            </h2>
          </div>

          {/* Form Meta and Linked Demarcation Certificate Info */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">আবেদন ট্র্যাকিং আইডি:</span>
              <strong className="font-mono text-emerald-900">{application.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">তফসিল-১ ফরম নং:</span>
              <strong className="font-mono text-slate-900">{application.formNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">সংযুক্ত ডিমার্কেশন প্রত্যয়নপত্র নং:</span>
              <strong className="font-mono text-emerald-800">{application.demarcationCertificateNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">আবেদনের তারিখ:</span>
              <strong>{formatBanglaDate(application.createdAt)}</strong>
            </div>
          </div>

          {/* Prerequisite Clearance Note */}
          <div className="mb-3 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between text-[11px] text-emerald-950">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                সীতাকুণ্ড পৌরসভা সীমানা নির্ধারণ ও প্রত্যয়নকৃত মূল আবেদন আইডি: <strong>{application.demarcationAppId}</strong> (ফরম নং: {application.demarcationFormNo})
              </span>
            </span>
            <span className="font-bold text-emerald-800">
              ফি: ১,০০০/- (পরিশোধিত)
            </span>
          </div>

          {/* Statutory 11 Points Form Content */}
          <div className="space-y-3">
            {/* ১। আবেদনকারীর পূর্ণ নাম */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">১।</span>
              <div className="flex-1">
                <span className="font-bold text-slate-800">আবেদনকারী/আবেদনকারীগণের পূর্ণ নাম:</span>{' '}
                <span className="text-slate-900 font-semibold">{application.applicantName}</span>
                {application.applicantFatherHusband && (
                  <span className="text-slate-700 ml-2">(পিতা/স্বামী: {application.applicantFatherHusband})</span>
                )}
              </div>
            </div>

            {/* ২। আবেদনকারীর পূর্ণ ঠিকানা */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">২।</span>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-800 block">আবেদনকারী/আবেদনকারীগণের পূর্ণ ঠিকানা:</span>
                <div className="pl-3">
                  <span className="font-semibold text-slate-800">(ক) বর্তমান/ডাকযোগাযোগের ঠিকানা:</span>{' '}
                  <span className="text-slate-900">{application.applicantPresentAddress}</span>
                </div>
                <div className="pl-3">
                  <span className="font-semibold text-slate-800">(খ) স্থায়ী ঠিকানা:</span>{' '}
                  <span className="text-slate-900">{application.applicantPermanentAddress}</span>
                </div>
                <div className="pl-3 text-[11px] text-slate-600">
                  ফোন/মোবাইল নং: <span className="font-mono font-semibold">{toBanglaNumber(application.applicantPhone)}</span>
                  {application.applicantNid && (
                    <span className="ml-4">জাতীয় পরিচয়পত্র (NID): <span className="font-mono font-semibold">{toBanglaNumber(application.applicantNid)}</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* ৩। যে দাগের জমিতে ইমারত নির্মাণ/পুকুর খনন/পাহাড় কর্তন করা হইবে */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">৩।</span>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-800 block">
                  যে দাগের জমিতে {application.activityTypeTitle || 'ইমারত নির্মাণ/পুকুর খনন/পাহাড় কর্তন বা ধ্বংস সাধন'} করা হইবে উহার বিবরণ:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-3 text-[11px] sm:text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">(ক) পৌরসভা/গ্রাম/মহল্লা/এলাকা:</span>{' '}
                    <span>{application.siteAreaName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(খ) দাগ ও খতিয়ান নং/প্লট নং:</span>{' '}
                    <span className="font-semibold">{application.dagKhatianPlotNo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(গ) মৌজার নাম/ব্লক/সেক্টর:</span>{' '}
                    <span>{application.mouzaBlockSector}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(ঘ) ওয়ার্ড নং:</span>{' '}
                    <span>{application.wardNo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(ঙ) রাস্তার নাম:</span>{' '}
                    <span>{application.roadName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(চ) সিট নং (প্রযোজ্য ক্ষেত্রে):</span>{' '}
                    <span>{application.sheetNo || '০১ নং সিট'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-700">(ছ) দাগে আবেদনকারীগণের অংশের পরিমাণ:</span>{' '}
                    <span className="font-semibold">{application.applicantShare}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-700">(জ) কি সূত্রে সাইটের জমি অর্জন করিয়াছেন:</span>{' '}
                    <span>{application.landAcquisitionSource}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ৪। সাইটের বিবরণ */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">৪।</span>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-slate-800 block">সাইটের বিবরণ:</span>
                <div className="pl-3 space-y-1 text-[11px] sm:text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">(ক) সাইটের আয়তন (ক্ষেত্রফল):</span>{' '}
                    <span className="font-semibold">{application.siteAreaSize}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(খ) সাইটের চৌহদ্দী (বাহুর পরিমাণ):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pl-3 mt-0.5">
                      <span>• উত্তরে: {application.siteBoundaries?.north || 'ন/এ'}</span>
                      <span>• দক্ষিণে: {application.siteBoundaries?.south || 'ন/এ'}</span>
                      <span>• পূর্বে: {application.siteBoundaries?.east || 'ন/এ'}</span>
                      <span>• পশ্চিমে: {application.siteBoundaries?.west || 'ন/এ'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(গ) ইমারত দ্বারা সাইটের যে পরিমাণ স্থান আচ্ছাদিত হইবে:</span>
                    <div className="pl-3">
                      <span>১ম তলা: {application.coveredArea?.firstFloor || '—'}</span> |{' '}
                      <span>অন্যান্য তলা: {application.coveredArea?.otherFloors || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(ঘ) সাইটের নিকটস্থ রাস্তার বিবরণ:</span>
                    <div className="pl-3">
                      (১) নাম: {application.nearestRoad?.name || '—'} |{' '}
                      (২) অবস্থান: {application.nearestRoad?.position || '—'} |{' '}
                      (৩) দূরত্ব: {application.nearestRoad?.distance || '—'} |{' '}
                      (৪) বিস্তার: {application.nearestRoad?.width || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(ঙ) নিকটস্থ রাস্তা হইতে সাইটে যাতায়াতের উপায়:</span>{' '}
                    <span>{application.roadAccessWay || '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">(চ) সাইটের বিভিন্ন দিকে যে পরিমাণ স্থান উন্মুক্ত রাখা হইবে:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pl-3 mt-0.5">
                      <span>• উত্তর সীমানা হইতে: {application.setbacks?.north || '—'}</span>
                      <span>• দক্ষিণ সীমানা হইতে: {application.setbacks?.south || '—'}</span>
                      <span>• পূর্ব সীমানা হইতে: {application.setbacks?.east || '—'}</span>
                      <span>• পশ্চিম সীমানা হইতে: {application.setbacks?.west || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ৫। সাইটের পূর্ব নির্মিত কাঁচা/পাকা ইমারতের বিবরণ */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">৫।</span>
              <div className="flex-1 space-y-0.5 text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 block">সাইটের পূর্ব নির্মিত কাঁচা/পাঁকা ইমারতের (যদি থাকে) বিবরণ:</span>
                <div className="pl-3">
                  <span className="font-semibold text-slate-700">(ক) পূর্ব নির্মিত ইমারতের সংখ্যা ও তদ্বারা বেষ্টিত স্থানের পরিমাণ:</span>{' '}
                  <span>{application.existingStructureCountAndArea || 'কোন পূর্ব নির্মিত ইমারত নাই (খালি জমি)'}</span>
                </div>
                <div className="pl-3">
                  <span className="font-semibold text-slate-700">(খ) প্রস্তাবিত ইমারত নির্মাণ অনুমোদিত হইলে কোন অংশ ভাঙ্গিতে হইবে কিনা:</span>{' '}
                  <span>{application.demolitionRequiredDetails || 'না, কোনো অংশ ভাঙ্গার প্রয়োজন নাই'}</span>
                </div>
              </div>
            </div>

            {/* ৬। এলাকার বিভিন্ন সেবা-সুযোগের বিবরণ */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-900 shrink-0 w-6">৬।</span>
              <div className="flex-1 text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 block">এলাকার বিভিন্ন সেবা-সুযোগের বিবরণ:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 pl-3 mt-0.5">
                  <span>(ক) বিদ্যুৎ সরবরাহ: <strong>{application.utilities?.electricity ? 'আছে [✓]' : 'নাই [×]'}</strong></span>
                  <span>(খ) পানি সরবরাহ: <strong>{application.utilities?.water ? 'আছে [✓]' : 'নাই [×]'}</strong></span>
                  <span>(গ) গ্যাস সরবরাহ: <strong>{application.utilities?.gas ? 'আছে [✓]' : 'নাই [×]'}</strong></span>
                  <span>(ঘ) পয়ঃনিষ্কাশন লাইন: <strong>{application.utilities?.sewerage ? 'আছে [✓]' : 'নাই [×]'}</strong></span>
                  <span className="sm:col-span-2">(ঙ) প্রস্তাবিত ইমারতে সেপ্টিক ট্যাংক ব্যবস্থা: <strong>{application.utilities?.septicTank ? 'আছে [✓]' : 'নাই [×]'}</strong></span>
                </div>
              </div>
            </div>

            {/* ৭, ৮, ৯, ১০, ১১ সংক্ষেপণ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs pt-1">
              <div className="flex gap-1.5">
                <span className="font-bold text-slate-900">৭।</span>
                <div>
                  <span className="font-bold text-slate-800">কাজের সম্ভাব্য শুরুর তারিখ:</span>{' '}
                  <span>{application.workStartDate}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="font-bold text-slate-900">৮।</span>
                <div>
                  <span className="font-bold text-slate-800">উদ্দেশ্য:</span>{' '}
                  <span>{application.purpose}</span>
                </div>
              </div>
              <div className="flex gap-1.5 sm:col-span-2">
                <span className="font-bold text-slate-900">৯।</span>
                <div>
                  <span className="font-bold text-slate-800">Building Construction Act এর অধীন পূর্বে নোটিশ জারী হইয়াছে কিনা:</span>{' '}
                  <span>{application.priorNoticeIssued ? `হ্যাঁ (${application.priorNoticeDetails || ''})` : 'না, নোটিশ জারী হয় নাই।'}</span>
                </div>
              </div>
              <div className="flex gap-1.5 sm:col-span-2">
                <span className="font-bold text-slate-900">১০।</span>
                <div>
                  <span className="font-bold text-slate-800">Section 12 এর অধীন কোনো মামলা দায়ের করা হইয়াছে কিনা:</span>{' '}
                  <span>{application.legalCaseFiled ? `হ্যাঁ (${application.legalCaseDetails || ''})` : 'না, কোনো মামলা নাই।'}</span>
                </div>
              </div>
              <div className="flex gap-1.5 sm:col-span-2">
                <span className="font-bold text-slate-900">১১।</span>
                <div>
                  <span className="font-bold text-slate-800">প্রস্তাবিত সাইট হইতে নিকটবর্তী দূরত্বসমূহ:</span>{' '}
                  <span className="text-[11px]">
                    রাস্তা: {application.activityDistances?.roadDistance || '—'} |{' '}
                    ইমারত: {application.activityDistances?.buildingDistance || '—'} |{' '}
                    পয়ঃনালা: {application.activityDistances?.drainDistance || '—'} |{' '}
                    বিদ্যুৎ লাইন: {application.activityDistances?.electricLineDistance || '—'} |{' '}
                    গ্যাস লাইন: {application.activityDistances?.gasLineDistance || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* বিধিসম্মত ঘোষণা ও অঙ্গীকারনামা */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded text-[11px] text-justify leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">বিধিসম্মত ঘোষণা:</span>
              আমি ইমারত নির্মাণ অনুমোদনের জন্য প্রয়োজনীয় নকশার ফর্দ এবং <strong>১,০০০/- (এক হাজার)</strong> টাকা ফি {application.paymentMethodTitle || 'পৌরসভা ক্যাশ কাউন্টার রসিদ'} {application.moneyReceiptNo ? `(রসিদ নং: ${application.moneyReceiptNo})` : application.chalanOrDraftNo ? `(চালান নং: ${application.chalanOrDraftNo})` : application.trxId ? `(আইডি নং: ${application.trxId})` : ''} এর মাধ্যমে যথাযথ কর্তৃপক্ষের নিকট জমা দিয়া ঘোষণা করিতেছি যে, সংযুক্ত নকশা ইমারত নির্মাণ বিধিমালা, ১৯৯৬ মোতাবেক প্রণীত এবং এই আবেদনপত্রে বর্ণিত তথ্য ও সংযুক্ত নকশার সমস্ত বিবরণ সত্য।
            </div>

            {/* অফিস ব্যবহারের জন্য (ট্রেজারী চালান / হিসাব ভাউচার পোস্টিং তথ্য) */}
            {application.chalanOrDraftNo && (
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-300 rounded text-[11px] space-y-1">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                  <span className="font-bold text-amber-950">অফিসিয়াল ট্রেজারী চালান / ব্যাংক ড্রাফট পোস্টিং তথ্য (নক্সাকার / প্রকৌশল শাখা):</span>
                  <span className="font-mono text-emerald-800 font-bold">ফি: ১,০০০/- টাকা (জমা নিশ্চিত)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-800 pt-1">
                  <div>
                    <p>সরকারি হিসাব কোড: <strong className="font-mono">{application.treasuryCode || '১-২০৩১-০০০০-২৬৮১'}</strong></p>
                    <p>ইনস্ট্রুমেন্ট নং: <strong className="font-mono">{application.chalanOrDraftNo}</strong> ({application.paymentMethodTitle || 'ট্রেজারী চালান'})</p>
                  </div>
                  <div>
                    <p>ব্যাংক ও শাখা: <strong>{application.bankName || 'সোনালী ব্যাংক পিএলসি'}, {application.branchName || 'সীতাকুণ্ড শাখা'}</strong></p>
                    <p>জমার তারিখ: <strong className="font-mono">{application.chalanOrDraftDate || formatBanglaDate(application.createdAt)}</strong></p>
                  </div>
                </div>
                {application.treasuryVerifiedBy && (
                  <p className="text-[10px] text-slate-600 border-t border-amber-200 pt-1">
                    যাচাই ও পোস্টিং প্রদানকারী: {application.treasuryVerifiedBy}
                  </p>
                )}
              </div>
            )}

            {/* Signature Area & Verification QR */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white border-2 border-slate-400 rounded-lg shadow-2xs shrink-0">
                    <QRCode
                      value={typeof window !== 'undefined' ? `${window.location.origin}/?track=${application.id}` : application.id}
                      size={80}
                      level="H"
                      className="w-20 h-20"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block">অনলাইন যাচাই (QR Code)</span>
                    <p className="text-[10px] text-slate-600">আবেদনের তারিখ: {formatBanglaDate(application.createdAt)}</p>
                    <p className="text-[10px] text-slate-600">মোবাইল: {toBanglaNumber(application.applicantPhone)}</p>
                    <div className="pt-1">
                      <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-mono">
                        ডিজিটালভাবে দাখিলকৃত [Verifiable]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-slate-400 mb-1.5 h-10 flex items-end justify-center">
                  <span className="text-[11px] font-semibold text-slate-700">{application.applicantName}</span>
                </div>
                <span className="font-bold text-slate-900">আবেদনকারীর স্বাক্ষর</span>
                <span className="text-[11px] text-slate-600">পূর্ণ নাম: {application.applicantName}</span>
              </div>
            </div>

            {/* Office Endorsement Section */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 flex justify-between items-center">
              <span>সীতাকুণ্ড পৌরসভা ই-সেবা পোর্টাল • জেনারেটেড ট্র্যাকিং আইডি: {application.id}</span>
              <span>Building Construction Act, 1952 Compliant Schedule-1 Form</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
