import React from 'react';
import QRCode from 'react-qr-code';
import { Printer, X, ShieldCheck, CheckCircle2, FileDown, Building2 } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { DemarcationApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface DemarcationCertificatePrintProps {
  application: DemarcationApplication;
  onClose?: () => void;
  onApplySchedule1?: (app: DemarcationApplication) => void;
}

export const DemarcationCertificatePrint: React.FC<DemarcationCertificatePrintProps> = ({
  application,
  onClose,
  onApplySchedule1,
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

  const trackingUrl = `${window.location.origin}/?track=${application.id}`;
  const certNo = application.engineerApproval?.certificateNo || `SKM/ENGG/DEM/${new Date().getFullYear()}/0${application.id.slice(-3)}`;
  const approvalDate = application.engineerApproval?.approvalDate || application.createdAt;

  const siteLoc = application.siteLocation || {
    applicantName: application.applicantName || 'নাগরিক',
    applicantFatherHusband: 'তথ্য নেই',
    applicantPermanentAddress: 'সীতাকুণ্ড পৌরসভা',
    applicantPresentAddress: 'সীতাকুণ্ড পৌরসভা',
  } as any;

  const schedule = application.schedule || {
    mouzaName: application.mouzaName || 'সীতাকুণ্ড',
    jlNo: '০২',
    wardNo: '০১',
    landArea: '৫ শতাংশ',
    landClass: 'বাস্তু',
    deedNo: '৪১২/২০২৩',
    deedDate: '১০/০১/২০২৩',
    createdBsKhatianNo: 'খতিয়ান-৩৪০',
    bsKhatianNo: '৩৪০',
    bsDagNo: application.bsDagNo || '১২৮০',
    boundaryNorth: 'বসতবাড়ি',
    boundarySouth: 'রাস্তা',
    boundaryEast: 'সীমানা প্রাচীর',
    boundaryWest: 'খালি জায়গা'
  } as any;

  const proposed = application.proposedConstruction || {
    constructionType: application.proposedStructureType || 'ইমারত নির্মাণ ও সীমানা নির্ধারণ',
  } as any;

  const landOwners = (application.landOwners && application.landOwners.length > 0)
    ? application.landOwners
    : [{
        id: 'owner-1',
        name: siteLoc.applicantName || application.applicantName || 'নাগরিক',
        fatherOrHusbandName: siteLoc.applicantFatherHusband || 'তথ্য নেই',
        permanentAddress: siteLoc.applicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
      }];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col items-center print:static print:bg-transparent print:overflow-visible print:p-0 print:m-0 print:block">
      {/* Toast Notification */}
      {showToast && (
        <div className="no-print fixed top-6 right-6 z-60 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-start gap-3.5 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-emerald-700 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-white mb-0.5">প্রত্যয়নপত্র PDF প্রস্তুত হচ্ছে</h4>
            <p className="text-emerald-100 text-xs leading-relaxed">
              প্রিন্ট ডায়ালগ থেকে Destination হিসেবে <strong>'Save as PDF'</strong> নির্বাচন করে ডিজিটাল প্রত্যয়নপত্রটি ডাউনলোড করুন।
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
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm block">
              সীমানা নির্ধারণ ও সঠিকতা যাচাই প্রত্যয়নপত্র (Official Certificate)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              ব্রাউজার প্রিন্ট ডায়ালগে 'Save as PDF' অপশন নির্বাচন করে PDF ফাইল সেভ করুন
            </span>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-mono font-bold border border-emerald-300">
            {certNo}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onApplySchedule1 && (
            <button
              onClick={() => {
                if (onClose) onClose();
                onApplySchedule1(application);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
              title="তফসিল-১ (ইমারত নির্মাণ অনুমোদন) আবেদন করুন"
            >
              <Building2 className="w-4 h-4" />
              <span>ইমারত নির্মাণ অনুমোদন আবেদন</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF ডাউনলোড / প্রিন্ট করুন (A4)</span>
          </button>

          {application.draftsmanReview?.demarcationPdf && (
            <a
              href={application.draftsmanReview.demarcationPdf.dataUrl}
              download={application.draftsmanReview.demarcationPdf.fileName}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>ডিমার্কেশন PDF ডাউনলোড</span>
            </a>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>বন্ধ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Layout */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg p-8 sm:p-12 text-slate-900 font-kalpurush border-8 border-double border-emerald-800 print-card relative print:border-8 print:border-double print:border-emerald-800 print:shadow-none print:p-6 print:m-0 print:max-w-none print:w-full">
        {/* Official Centered Watermark (পৌরসভা জলছাপ) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-88 h-88 object-contain opacity-[0.09] filter contrast-125"
          />
        </div>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-emerald-800 pb-4 mb-6 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="w-16 h-16 shrink-0 flex flex-col items-center justify-center bg-white rounded-full">
              <MunicipalityLogo className="w-full h-full" />
            </div>

            <div className="text-center flex-1 px-2">
              <div className="text-sm font-bold text-slate-700">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight my-1">
                সীতাকুণ্ড পৌরসভা কার্যালয়
              </h1>
              <div className="text-sm font-semibold text-slate-800">
                সীতাকুণ্ড, চট্টগ্রাম | প্রকৌশল বিভাগ
              </div>
              <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                টেলিফোনঃ ০৩০২৮-৫৬০৪৪, ফ্যাক্সঃ ০৩০২৮-৫৬০৪৪ | E-mail: ae.sitakundapourashava@yahoo.com
              </div>
            </div>

            <div className="w-16 h-16 rounded-full border-2 border-emerald-700 flex flex-col items-center justify-center p-1 text-[9px] font-bold text-emerald-900 bg-emerald-50">
              <span className="text-[8px] text-slate-600">বাংলাদেশ</span>
              <span className="font-extrabold">ই-সেবা</span>
            </div>
          </div>

          <div className="mt-4 inline-block px-6 py-1.5 bg-emerald-800 text-white rounded-md text-base sm:text-lg font-bold tracking-wide">
            ভূমির সীমানা নির্ধারণ (ডিমার্কেশন) ও মালিকানা সঠিকতা প্রত্যয়নপত্র
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 pt-3 px-2">
            <div>
              <strong>সনদ নং: </strong>
              <span className="font-mono font-bold text-emerald-900">{certNo}</span>
            </div>
            <div>
              <strong>ইস্যুর তারিখ: </strong>
              <span>{formatBanglaDate(approvalDate)}</span>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-justify mb-8">
          <p>
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, সীতাকুণ্ড পৌরসভার প্রকৌশল বিভাগ-এর অধীন আবেদন ট্র্যাকিং আইডি <strong>{application.id}</strong> মূলে আবেদনকারী <strong>{siteLoc.applicantName || application.applicantName || 'নাগরিক'}</strong> কর্তৃক দাখিলকৃত প্রস্তাবিত <strong>{proposed.constructionType}</strong> সংক্রান্ত ভূমির ডিমার্কেশন ও সীমানা যাচাইয়ের আবেদন সরজমিনে তদন্ত সম্পন্ন করা হয়েছে।
          </p>

          {/* Owners details */}
          <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-lg text-xs sm:text-sm my-3">
            <div className="font-bold text-slate-900 mb-1.5">ভূমির বৈধ মালিকগণের বিবরণ:</div>
            <ol className="list-decimal list-inside space-y-1">
              {landOwners.map((owner: any, idx: number) => (
                <li key={owner.id || idx}>
                  <strong>{owner.name}</strong>, পিতা/স্বামী: {owner.fatherOrHusbandName}, ঠিকানা: {owner.permanentAddress}
                </li>
              ))}
            </ol>
          </div>

          {/* Land Schedule */}
          <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-lg text-xs sm:text-sm my-3">
            <div className="font-bold text-slate-900 mb-1.5">তফসিলভুক্ত ভূমির বিবরণ:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><strong>মৌজা:</strong> {schedule.mouzaName}</div>
              <div><strong>জে.এল. নং:</strong> {toBanglaNumber(schedule.jlNo || '')}</div>
              <div><strong>ওয়ার্ড নং:</strong> {schedule.wardNo || siteLoc.wardNo || '০১'}</div>
              <div><strong>জমির পরিমাণ:</strong> {schedule.landArea || 'তথ্য নেই'}</div>
              <div><strong>দলিল নং:</strong> {schedule.deedNo || 'প্রযোজ্য নয়'}</div>
              <div><strong>রেজিস্ট্রি তারিখ:</strong> {schedule.deedDate || 'তথ্য নেই'}</div>
              <div><strong>সৃজিত বি.এস খতিয়ান:</strong> {schedule.createdBsKhatianNo || 'প্রযোজ্য নয়'}</div>
              <div><strong>বি.এস খতিয়ান ও দাগ:</strong> খতিয়ান-{toBanglaNumber(schedule.bsKhatianNo || '')}, দাগ-{toBanglaNumber(schedule.bsDagNo || '')}</div>
            </div>
            <div className="mt-2 text-xs border-t border-slate-200 pt-1.5">
              <strong>চতুর্সীমা: </strong>
              উত্তর: {schedule.boundaryNorth || 'বসতবাড়ি'} | দক্ষিণ: {schedule.boundarySouth || 'রাস্তা'} | পূর্ব: {schedule.boundaryEast || 'সীমানা দেওয়াল'} | পশ্চিম: {schedule.boundaryWest || 'খালি জমি'}
            </div>
          </div>

          <p>
            সীতাকুণ্ড পৌরসভার নক্সাকার (সিভিল) কর্তৃক সরজমিনে রেকর্ডীয় মৌজা ম্যাপ এবং দাগ অনুযায়ী প্রস্তাবিত ভূমির চতুর্দিকের সীমানা পরিমাপ ও ডিমার্কেশন নিশ্চিত করা হয়েছে। এতে পৌর বিধিমালা অনুযায়ী রাস্তা ও ড্রেনের প্রয়োজনীয় সীমানা বজায় রেখে সীমানা চিহ্নিত করা হয়েছে এবং কোনো বিরোধ পরিলক্ষিত হয়নি।
          </p>

          <p className="font-semibold text-emerald-950">
            অতএব, উল্লিখিত ভূমিতে বিধি মোতাবেক প্রস্তাবিত {proposed.constructionType} কার্যক্রমের জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।
          </p>
        </div>

        {/* Official Online Verification System Notice */}
        <div className="pt-6 border-t border-slate-300">
          <div className="text-center py-2.5 px-4 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950 text-xs sm:text-sm font-semibold">
            * এটি সিস্টেম জেনারেটেড অনলাইন ডিজিটাল প্রত্যয়নপত্র বিধায় এতে কোনো ধরনের ম্যানুয়াল বা হাতে স্বাক্ষরের প্রয়োজন নেই।
          </div>
        </div>

        {/* Certificate Footer Stamp Note & QR Code */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-slate-400 rounded-lg shadow-xs shrink-0">
              <QRCode
                value={trackingUrl}
                size={88}
                level="H"
                className="text-slate-900 w-22 h-22"
              />
            </div>
            <div className="text-left text-[10px] text-slate-600 leading-tight">
              <span className="font-bold text-slate-800 block mb-0.5">অনলাইন যাচাই (QR Code Scan)</span>
              * এই প্রত্যয়নপত্রটি ডিজিটাল গভর্নেন্স স্ট্যান্ডার্ড অনুযায়ী প্রস্তুতকৃত।<br/>
              কিউআর কোড স্ক্যান করে সীতাকুণ্ড পৌরসভার ই-সেবা পোর্টাল হতে এর সঠিকতা যাচাই করা যাবে।
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500 max-w-[200px]">
            <span>প্রস্তুতকাল: {formatBanglaDate(new Date().toISOString())}</span>
            <span className="block mt-0.5">সিস্টেম: সীতাকুণ্ড পৌরসভা ভূমি ডিমার্কেশন পোর্টাল</span>
          </div>
        </div>
      </div>
    </div>
  );
};
