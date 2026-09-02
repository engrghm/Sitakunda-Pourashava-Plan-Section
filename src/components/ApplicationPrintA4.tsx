import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Printer, X, Download, Building2, CheckCircle2, ShieldCheck, FileDown, Check } from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { DemarcationApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface ApplicationPrintA4Props {
  application: DemarcationApplication;
  onClose?: () => void;
}

export const ApplicationPrintA4: React.FC<ApplicationPrintA4Props> = ({ application, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Trigger high-quality native print dialog optimized for Save as PDF
  const handlePrint = () => {
    setIsExporting(true);
    setShowToast(true);

    // Give browser a frame to prepare render styles
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 150);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?track=${application.id}`
    : `https://sitakunda-pourashava.gov.bd/?track=${application.id}`;

  const siteLoc = application.siteLocation || {
    applicantName: application.applicantName || 'নাগরিক',
    applicantFatherHusband: 'তথ্য নেই',
    applicantPermanentAddress: 'সীতাকুণ্ড পৌরসভা',
    applicantPresentAddress: 'সীতাকুণ্ড পৌরসভা',
    applicantMobile: application.applicantMobile || 'তথ্য নেই',
    applicantNid: application.applicantNid || 'তথ্য নেই',
    holdingOrPlotNo: 'প্রযোজ্য নয়',
    roadOrArea: 'সীতাকুণ্ড',
    wardNo: '০১',
    landmark: 'সীতাকুণ্ড বাজার'
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
    rsKhatianNo: '১৫০',
    rsDagNo: '৭৫০',
    boundaryNorth: 'বসতবাড়ি',
    boundarySouth: 'রাস্তা',
    boundaryEast: 'সীমানা প্রাচীর',
    boundaryWest: 'খালি জায়গা'
  } as any;

  const proposed = application.proposedConstruction || {
    constructionType: application.proposedStructureType || 'আবাসিক ভবন নির্মাণ ও সীমানা নির্ধারণ',
    purpose: 'নিজস্ব ক্রয়কৃত ভূমির চতুর্দিকে সীমানা নির্ধারণ ও পৌর ডিমার্কেশন প্রত্যয়ন প্রাপ্তির আবেদন।',
    floorsCount: 'প্রযোজ্য নয়',
    estimatedAreaSqFt: '১০০০'
  } as any;

  const landOwners = (application.landOwners && application.landOwners.length > 0)
    ? application.landOwners
    : [{
        id: 'owner-1',
        name: siteLoc.applicantName || application.applicantName || 'নাগরিক',
        fatherOrHusbandName: siteLoc.applicantFatherHusband || 'তথ্য নেই',
        nid: siteLoc.applicantNid || '',
        email: application.applicantEmail || '',
        permanentAddress: siteLoc.applicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা',
        presentAddress: siteLoc.applicantPresentAddress || 'সীতাকুণ্ড পৌরসভা',
      }];

  const documents = (application.documents && application.documents.length > 0)
    ? application.documents
    : [
        { id: 'doc-1', docTitle: 'খতিয়ান / পর্চার স্ক্যান কপি' },
        { id: 'doc-2', docTitle: 'জাতীয় পরিচয়পত্র (NID)' },
        { id: 'doc-3', docTitle: 'হালনাগাদ দাখিলা / কর রশিদ' },
        { id: 'doc-4', docTitle: 'সাইট ম্যাপ / অবস্থান নকশা' }
      ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col items-center print:static print:bg-transparent print:overflow-visible print:p-0 print:m-0 print:block">
      {/* Toast Notification */}
      {showToast && (
        <div className="no-print fixed top-6 right-6 z-60 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-start gap-3.5 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-emerald-700 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-white mb-0.5">PDF ফাইল প্রস্তুত করা হচ্ছে</h4>
            <p className="text-emerald-100 text-xs leading-relaxed">
              ব্রাউজারের প্রিন্ট ডায়ালগ থেকে Destination হিসেবে <strong>'Save as PDF'</strong> নির্বাচন করে আপনার কম্পিউটারে সংরক্ষণ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar (hidden on print) */}
      <div className="no-print w-full max-w-4xl bg-white rounded-2xl shadow-xl p-3.5 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 sticky top-2 z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
          <div>
            <span className="font-bold text-slate-800 text-sm block">
              আবেদনপত্র অফিসিয়াল প্রতিলিপি (A4 Official Document Layout)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              ব্রাউজার প্রিন্ট ডায়ালগ থেকে 'Save as PDF' অপশন নির্বাচন করে হাই-কোয়ালিটি PDF সংরক্ষণ করুন
            </span>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md font-mono font-bold border border-emerald-300">
            {application.id}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Primary High-Quality PDF Export / Print Trigger */}
          <button
            onClick={handlePrint}
            title="ব্রাউজারের প্রিন্ট ও PDF এক্সপোর্ট উইন্ডো চালু করুন"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF ডাউনলোড / প্রিন্ট করুন (A4)</span>
          </button>

          <button
            onClick={handlePrint}
            title="সরাসরি প্রিন্টারে প্রিন্ট কমান্ড পাঠান"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>প্রিন্ট</span>
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
              <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                টেলিফোনঃ ০৩০২৮-৫৬০৪৪, ফ্যাক্সঃ ০৩০২৮-৫৬০৪৪ | E-mail: ae.sitakundapourashava@yahoo.com
              </div>
              <div className="inline-block mt-1.5 px-3 py-1 bg-slate-100 border border-slate-400 rounded-md text-xs sm:text-sm font-bold text-slate-900">
                ভূমির সীমানা নির্ধারণ (ডিমার্কেশন) ও মালিকানা সঠিকতা যাচাইয়ের আবেদনপত্র
              </div>
            </div>

            <div className="w-24 text-right text-[11px] text-slate-700">
              <div className="border border-slate-400 p-1 rounded-sm text-center bg-slate-50">
                <span className="block text-[9px] text-slate-500 font-sans">FORM NO</span>
                <span className="font-bold font-mono text-xs text-slate-900">
                  {application.formNo || `SKM-FORM-${application.id.replace(/\D/g, '').slice(-6) || '849201'}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 pt-2 px-1">
            <div>
              <strong>আবেদন ট্র্যাকিং আইডি: </strong>
              <span className="font-mono font-bold text-sm text-slate-950">{application.id}</span>
            </div>
            <div>
              <strong>দাখিলের তারিখ: </strong>
              <span>{formatBanglaDate(application.createdAt)}</span>
            </div>
            <div>
              <strong>আবেদন ফি: </strong>
              <span>১০০/- ({application.feeStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'})</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION ১: প্রস্তাবিত নির্মাণ ও উদ্দেশ্য
            ========================================================================= */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 border-l-4 border-slate-800 mb-2">
            ১। প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose)
          </h2>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr>
                <td className="w-1/4 p-2 bg-slate-50 border border-slate-300 font-bold">প্রস্তাবিত নির্মাণের ধরণ:</td>
                <td className="w-3/4 p-2 border border-slate-300 font-semibold">{proposed.constructionType}</td>
              </tr>
              {proposed.buildingCategory && (
                <tr>
                  <td className="p-2 bg-slate-50 border border-slate-300 font-bold">ভবন/স্থাপনার শ্রেণী:</td>
                  <td className="p-2 border border-slate-300 font-medium text-emerald-900">{proposed.buildingCategory}</td>
                </tr>
              )}
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">নির্মাণের উদ্দেশ্য ও বিবরণ:</td>
                <td className="p-2 border border-slate-300">{proposed.purpose}</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">প্রস্তাবিত তলার সংখ্যা:</td>
                <td className="p-2 border border-slate-300">{proposed.floorsCount || 'প্রযোজ্য নয়'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            SECTION ২: ভূমির মালিকদের তথ্য (সকল মালিকের তালিকা)
            ========================================================================= */}
        <div className="mb-5">
          <div className="flex justify-between items-center bg-slate-100 px-3 py-1 border-l-4 border-slate-800 mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              ২। ভূমির মালিকের তথ্য (Land Owner Information)
            </h2>
            <span className="text-[11px] font-bold text-slate-700">
              মোট মালিক: {toBanglaNumber(landOwners.length)} জন
            </span>
          </div>

          <div className="space-y-2">
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900">
                  <th className="p-1.5 border border-slate-300 w-10 text-center">ক্রমিক</th>
                  <th className="p-1.5 border border-slate-300 text-left">ভূমির মালিকের নাম ও পিতা/স্বামী</th>
                  <th className="p-1.5 border border-slate-300 text-left">জাতীয় পরিচয়পত্র (NID) ও ইমেইল</th>
                  <th className="p-1.5 border border-slate-300 text-left">স্থায়ী ঠিকানা</th>
                  <th className="p-1.5 border border-slate-300 text-left">বর্তমান ঠিকানা</th>
                </tr>
              </thead>
              <tbody>
                {landOwners.map((owner: any, idx: number) => (
                  <tr key={owner.id || idx}>
                    <td className="p-2 border border-slate-300 text-center font-bold">
                      {toBanglaNumber(idx + 1)}
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="font-bold text-slate-900">{owner.name}</div>
                      <div className="text-[11px] text-slate-600">পিতা/স্বামী: {owner.fatherOrHusbandName}</div>
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      <div><span className="font-bold">NID:</span> {owner.nid ? toBanglaNumber(owner.nid) : 'তথ্য নেই'}</div>
                      {owner.email && <div className="text-slate-600">{owner.email}</div>}
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      {owner.permanentAddress}
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      {owner.presentAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            SECTION ৩: ভূমির বিবরণ (তফসিল)
            ========================================================================= */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 border-l-4 border-slate-800 mb-2">
            ৩। ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land]
          </h2>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">মৌজার নাম:</td>
                <td className="p-2 border border-slate-300 font-bold text-slate-900 w-1/4">
                  {schedule.mouzaName}
                </td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">জে.এল. নং (J.L. No):</td>
                <td className="p-2 border border-slate-300 font-bold text-slate-900 w-1/4">
                  {toBanglaNumber(schedule.jlNo || '')} ({schedule.jlNo || ''})
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">পৌর ওয়ার্ড নং:</td>
                <td className="p-2 border border-slate-300">{schedule.wardNo || siteLoc.wardNo || '০১'}</td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">জমির পরিমাণ ও শ্রেণি:</td>
                <td className="p-2 border border-slate-300">
                  {schedule.landArea || 'তথ্য নেই'} ({schedule.landClass || 'বাস্তু'})
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">দলিল নং:</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-950">
                  {schedule.deedNo || 'প্রযোজ্য নয়'}
                </td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">দলিল রেজিস্ট্রি তারিখ:</td>
                <td className="p-2 border border-slate-300 font-bold text-emerald-950">
                  {schedule.deedDate || 'তথ্য নেই'}
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">সৃজিত বি.এস খতিয়ান নং:</td>
                <td className="p-2 border border-slate-300 font-bold text-blue-950">
                  {schedule.createdBsKhatianNo || 'প্রযোজ্য নয়'}
                </td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">বি.এস খতিয়ান ও দাগ:</td>
                <td className="p-2 border border-slate-300 font-bold text-blue-950">
                  খতিয়ান: {toBanglaNumber(schedule.bsKhatianNo || '')} | দাগ: {toBanglaNumber(schedule.bsDagNo || '')}
                </td>
              </tr>
              {(schedule.rsKhatianNo || schedule.rsDagNo) && (
                <tr>
                  <td className="p-2 bg-slate-50 border border-slate-300 font-bold">আর.এস খতিয়ান নং:</td>
                  <td className="p-2 border border-slate-300">{toBanglaNumber(schedule.rsKhatianNo || 'প্রযোজ্য নয়')}</td>
                  <td className="p-2 bg-slate-50 border border-slate-300 font-bold">আর.এস দাগ নং:</td>
                  <td className="p-2 border border-slate-300">{toBanglaNumber(schedule.rsDagNo || 'প্রযোজ্য নয়')}</td>
                </tr>
              )}
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">চতুর্সীমা (চৌহদ্দি):</td>
                <td colSpan={3} className="p-2 border border-slate-300 text-[11px]">
                  <strong>উত্তর:</strong> {schedule.boundaryNorth || 'বসতবাড়ি'} | <strong>দক্ষিণ:</strong> {schedule.boundarySouth || 'রাস্তা'} | <strong>পূর্ব:</strong> {schedule.boundaryEast || 'সীমানা দেওয়াল'} | <strong>পশ্চিম:</strong> {schedule.boundaryWest || 'খালি জমি'}
                </td>
              </tr>
              {(application.draftsmanReview?.geoCoordinates || schedule.geoCoordinates) && (
                <tr>
                  <td className="p-2 bg-slate-50 border border-slate-300 font-bold">ভৌগোলিক স্থানাঙ্ক (GPS Location):</td>
                  <td colSpan={3} className="p-2 border border-slate-300 text-[11px] text-emerald-950">
                    <span className="font-mono font-bold">
                      Lat: {(application.draftsmanReview?.geoCoordinates || schedule.geoCoordinates)?.latitude.toFixed(6)}, 
                      Lng: {(application.draftsmanReview?.geoCoordinates || schedule.geoCoordinates)?.longitude.toFixed(6)}
                    </span>
                    <span className="text-slate-600 ml-2">(নক্সাকার কর্তৃক সরজমিন জিপিএস ম্যাপিং দ্বারা হালনাগাদকৃত)</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            SECTION ৪: প্রস্তাবিত সাইটের ঠিকানা ও আবেদনকারীর যোগাযোগ
            ========================================================================= */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 border-l-4 border-slate-800 mb-2">
            ৪। প্রস্তাবিত সাইটের ঠিকানা ও আবেদনকারীর তথ্য
          </h2>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">মৌজা ও হোল্ডিং/প্লট নং:</td>
                <td className="p-2 border border-slate-300 w-1/4">{siteLoc.holdingOrPlotNo || 'প্রযোজ্য নয়'}</td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">রাস্তা / এলাকার নাম:</td>
                <td className="p-2 border border-slate-300 w-1/4">{siteLoc.roadOrArea || 'সীতাকুণ্ড'} (ওয়ার্ড-{siteLoc.wardNo || '০১'})</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">নিকটবর্তী পরিচিত স্থান:</td>
                <td colSpan={3} className="p-2 border border-slate-300">{siteLoc.landmark || 'প্রযোজ্য নয়'}</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">আবেদনকারীর নাম:</td>
                <td className="p-2 border border-slate-300 font-bold text-slate-900">{siteLoc.applicantName || application.applicantName || 'নাগরিক'}</td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">পিতা/স্বামীর নাম:</td>
                <td className="p-2 border border-slate-300">{siteLoc.applicantFatherHusband || 'তথ্য নেই'}</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">স্থায়ী ঠিকানা:</td>
                <td colSpan={3} className="p-2 border border-slate-300 text-[11px]">
                  {siteLoc.applicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম'}
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">মোবাইল নম্বর:</td>
                <td className="p-2 border border-slate-300 font-bold">{siteLoc.applicantMobile || application.applicantMobile || 'তথ্য নেই'}</td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold">জাতীয় পরিচয়পত্র (NID):</td>
                <td className="p-2 border border-slate-300 font-mono">{siteLoc.applicantNid || application.applicantNid || 'তথ্য নেই'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            SECTION ৫: সংযুক্ত কাগজপত্রের তালিকা ও সরকারি ফি
            ========================================================================= */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 border-l-4 border-slate-800 mb-2">
            ৫। সংযুক্ত কাগজপত্রের তালিকা ও সরকারি ফি বিবরণ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
            {documents.map((doc: any, idx: number) => (
              <div key={doc.id || idx} className="p-2 bg-slate-50 border border-slate-300 rounded flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{doc.docTitle || doc.title || doc.name || 'সংযুক্তি'}</span>
              </div>
            ))}
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">সরকারি আবেদন ফরম ফি:</td>
                <td className="p-2 border border-slate-300 font-bold text-slate-900 w-1/4">
                  ৳ {toBanglaNumber(application.feeAmount || 100)}/- (একশত টাকা)
                </td>
                <td className="p-2 bg-slate-50 border border-slate-300 font-bold w-1/4">ফি পরিশোধের স্থিতি:</td>
                <td className="p-2 border border-slate-300 font-bold w-1/4">
                  {application.moneyReceiptNo ? (
                    <span className="text-emerald-800 font-bold">
                      পরিশোধিত (পৌর ক্যাশ রশিদ নং: {application.moneyReceiptNo}{application.moneyReceiptDate ? ` - ${formatBanglaDate(application.moneyReceiptDate)}` : ''})
                    </span>
                  ) : application.feeStatus === 'paid' ? (
                    <span className="text-emerald-800 font-bold">
                      পরিশোধিত ({application.paymentDetails?.methodNameBangla || 'ডিজিটাল'}) {application.paymentDetails?.trxId ? `- TrxID: ${application.paymentDetails.trxId}` : ''}
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold">
                      অপরিশোধিত (পৌরসভা ক্যাশ কাউন্টারে প্রদেয়)
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            SECTION ৬: আবেদনকারীর অঙ্গীকার ও স্বাক্ষর
            ========================================================================= */}
        <div className="mb-6 pt-2 border-t border-slate-300 text-xs">
          <p className="italic text-slate-700 leading-relaxed mb-6">
            "আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত সকল তথ্য ও দাখিলকৃত কাগজপত্র সম্পূর্ণ সত্য ও সঠিক। ভূমির সীমানা বা মালিকানা সংক্রান্ত কোনো বিরোধ সৃষ্টি হলে পৌরসভা কর্তৃক গৃহীত সিদ্ধান্ত মানিয়া লইতে বাধ্য থাকিব।"
          </p>
          <div className="flex justify-between items-end pt-4">
            <div className="text-center">
              <div className="w-44 border-b border-dotted border-slate-600 mb-1"></div>
              <span className="text-[11px] text-slate-600">দাখিলের তারিখ: {formatBanglaDate(application.createdAt)}</span>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-800 mb-1"></div>
              <span className="font-bold text-slate-900 text-xs block">{application.siteLocation.applicantName}</span>
              <span className="text-[10px] text-slate-600">আবেদনকারীর স্বাক্ষর ও মোবাইল নং</span>
            </div>
          </div>
        </div>

        {/* QR Code Tracking Verification Block */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border-2 border-slate-400 rounded-lg shadow-xs shrink-0">
              <QRCode
                value={trackingUrl}
                size={80}
                level="H"
                className="text-slate-900 w-20 h-20"
              />
            </div>
            <div className="text-left text-[10px] text-slate-600 leading-tight">
              <span className="font-bold text-slate-800 block mb-0.5">অনলাইন যাচাই (QR Code Scan)</span>
              কিউআর কোড স্ক্যান করে সীতাকুণ্ড পৌরসভার ই-সেবা পোর্টাল হতে<br/>
              আবেদনের বর্তমান স্থিতি ও সঠিকতা যাচাই করা যাবে।
            </div>
          </div>
          <div className="text-right text-[9px] text-slate-500 max-w-[200px]">
            <span>প্রিন্ট কাল: {formatBanglaDate(new Date().toISOString())}</span>
            <span className="block mt-0.5">সিস্টেম: সীতাকুণ্ড পৌরসভা ভূমি ডিমার্কেশন পোর্টাল</span>
          </div>
        </div>

      </div>
    </div>
  );
};
