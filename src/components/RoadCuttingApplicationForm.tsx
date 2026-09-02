import React, { useState } from 'react';
import { 
  Construction, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Coins, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import { RoadCuttingApplication, VALID_WARDS } from '../types';
import { 
  toBanglaNumber, 
  saveRoadCuttingApplication, 
  generateRoadCuttingId, 
  generateRoadCuttingFormNo,
  formatBanglaDate 
} from '../utils/storage';
import { MunicipalityLogo } from './MunicipalityLogo';

interface RoadCuttingApplicationFormProps {
  onSubmitted: (app: RoadCuttingApplication) => void;
  onCancel?: () => void;
}

export const RoadCuttingApplicationForm: React.FC<RoadCuttingApplicationFormProps> = ({
  onSubmitted,
  onCancel,
}) => {
  // Form State
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantFatherHusband, setApplicantFatherHusband] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantNid, setApplicantNid] = useState<string>('');
  const [applicantAddress, setApplicantAddress] = useState<string>('');
  
  const [roadName, setRoadName] = useState<string>('');
  const [wardNo, setWardNo] = useState<string>('১ নং ওয়ার্ড');
  const [mouzaName, setMouzaName] = useState<string>('সীতাকুণ্ড');
  
  const [purpose, setPurpose] = useState<string>('water_connection');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [roadType, setRoadType] = useState<string>('carpeting');
  
  const [cuttingLengthFt, setCuttingLengthFt] = useState<string>('২০');
  const [cuttingWidthFt, setCuttingWidthFt] = useState<string>('২');
  const [cuttingDepthFt, setCuttingDepthFt] = useState<string>('৩');
  
  const [workDurationDays, setWorkDurationDays] = useState<string>('৩');
  const [workStartDate, setWorkStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [paymentMethod, setPaymentMethod] = useState<string>('counter_receipt');
  const [moneyReceiptNo, setMoneyReceiptNo] = useState<string>('');
  const [moneyReceiptDate, setMoneyReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fixed Application Form Price: ৳ 100/-
  const formFee = 100;

  // Convert string (Bengali or English digits) to number
  const parseBanglaOrEngNumber = (str: string): number => {
    if (!str) return 0;
    const banglaToEngMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    const engStr = str.replace(/[০-৯]/g, (d) => banglaToEngMap[d] || d);
    return parseFloat(engStr) || 0;
  };

  const lengthNum = parseBanglaOrEngNumber(cuttingLengthFt);
  const widthNum = parseBanglaOrEngNumber(cuttingWidthFt);
  const depthNum = parseBanglaOrEngNumber(cuttingDepthFt);
  const totalAreaSqFt = Math.round(lengthNum * widthNum * 100) / 100;

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'water_connection': return 'ওয়াসা / সুপেয় পানি সরবরাহ লাইন সংযোগ';
      case 'gas_connection': return 'গ্যাস সংযোগ পাইপলাইন';
      case 'drainage': return 'পয়ঃনিষ্কাশন / ড্রেন সংযোগ';
      case 'electricity': return 'ভূগর্ভস্থ বিদ্যুৎ ক্যাবল স্থাপন';
      case 'telecom': return 'টেলিযোগাযোগ ও ফাইবার অপটিক ক্যাবল';
      case 'sewerage': return 'সেপটিক ট্যাংক আউটলেট সংযোগ';
      default: return customPurpose || 'অন্যান্য উন্নয়নমূলক খনন কাজ';
    }
  };

  const getRoadTypeTitle = () => {
    switch (roadType) {
      case 'carpeting': return 'পাকা কার্পেটিং (BC) সড়ক';
      case 'cc': return 'সিসি (CC) কংক্রিট সড়ক';
      case 'rcc': return 'আরসিসি (RCC) ঢালাই সড়ক';
      case 'hbb': return 'এইচবিবি (HBB) / ব্রিক সলিং সড়ক';
      case 'wbm': return 'ডব্লিউবিএম (WBM) সড়ক';
      case 'earthen': return 'কাঁচা / মাটির সড়ক';
      case 'footpath': return 'ফুটপাত / পেভমেন্ট ব্লক';
      default: return 'পাকা কার্পেটিং সড়ক';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applicantName.trim()) {
      setErrorMsg('অনুগ্রহ করে আবেদনকারীর নাম প্রদান করুন।');
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.trim().length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!roadName.trim()) {
      setErrorMsg('যে রাস্তাটি কর্তন করা হইবে তার নাম ও অবস্থান লিখুন।');
      return;
    }
    if (lengthNum <= 0 || widthNum <= 0 || depthNum <= 0) {
      setErrorMsg('প্রস্তাবিত কর্তন পরিমাপ (দৈর্ঘ্য, প্রস্থ ও গভীরতা) অবশ্যই পূরণ করতে হবে।');
      return;
    }
    if (!declarationAccepted) {
      setErrorMsg('অনুগ্রহ করে অঙ্গীকারনামায় টিক দিয়ে সম্মতি প্রকাশ করুন।');
      return;
    }

    const calculatedEndDate = new Date(workStartDate);
    calculatedEndDate.setDate(calculatedEndDate.getDate() + (parseBanglaOrEngNumber(workDurationDays) || 3));
    const workEndDateStr = calculatedEndDate.toISOString().split('T')[0];

    const newApp: RoadCuttingApplication = {
      id: generateRoadCuttingId(),
      formNo: generateRoadCuttingFormNo(),
      createdAt: new Date().toISOString(),
      applicantName: applicantName.trim(),
      applicantFatherHusband: applicantFatherHusband.trim(),
      applicantPhone: applicantPhone.trim(),
      applicantNid: applicantNid.trim() || undefined,
      applicantAddress: applicantAddress.trim() || 'সীতাকুণ্ড, চট্টগ্রাম',
      roadName: roadName.trim(),
      wardNo,
      mouzaName,
      purpose,
      purposeTitle: getPurposeTitle(),
      roadType,
      roadTypeTitle: getRoadTypeTitle(),
      cuttingLengthFt: lengthNum,
      cuttingWidthFt: widthNum,
      cuttingDepthFt: depthNum,
      totalAreaSqFt,
      ratePerSqFt: 0,
      restorationFee: 0,
      applicationFee: formFee,
      totalAmount: formFee,
      workDurationDays: parseBanglaOrEngNumber(workDurationDays) || 3,
      workStartDate,
      workEndDate: workEndDateStr,
      paymentMethod,
      paymentMethodTitle: paymentMethod === 'counter_receipt' ? 'পৌর ক্যাশ রসিদ' : 'অনলাইন পেমেন্ট',
      moneyReceiptNo: moneyReceiptNo.trim() || undefined,
      moneyReceiptDate: moneyReceiptDate || undefined,
      status: 'submitted',
      declarationAccepted: true,
    };

    saveRoadCuttingApplication(newApp);
    onSubmitted(newApp);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <MunicipalityLogo size={220} />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Construction className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                প্রকৌশল বিভাগ • সীতাকুণ্ড পৌরসভা
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                আবেদন ফরম মূল্য: ৳ {toBanglaNumber(formFee)}/-
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              পৌর এলাকার রাস্তা কর্তনের অনুমতির আবেদন ফরম
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              পানি, গ্যাস, বিদ্যুৎ, ড্রেন ও অন্যান্য ভূগর্ভস্থ লাইন সংযোগের জন্য রাস্তা কর্তনের সরকারি অনুমতিপত্র
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm rounded-xl flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Applicant Details */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">১</span>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>আবেদনকারীর ব্যক্তিগত তথ্য</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আবেদনকারীর নাম <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ জাহিদুল ইসলাম"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পিতা / স্বামীর নাম <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: মরহুম আব্দুল করিম"
                value={applicantFatherHusband}
                onChange={(e) => setApplicantFatherHusband(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নম্বর <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="যেমন: 018XXXXXXXX"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                জাতীয় পরিচয়পত্র (NID) নম্বর
              </label>
              <input
                type="text"
                placeholder="১০ / ১৩ / ১৭ ডিজিটের NID"
                value={applicantNid}
                onChange={(e) => setApplicantNid(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আবেদনকারীর বর্তমান ও যোগাযোগের ঠিকানা <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="বাড়ি নং, হোল্ডিং নং, রোড, এলাকা, সীতাকুণ্ড পৌরসভা"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Road & Cutting Details */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">২</span>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>প্রস্তাবিত রাস্তা ও কর্তন পরিমাপের বিবরণ</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কর্তনযোগ্য রাস্তার নাম ও অবস্থান <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: কলেজ রোড, মহাদেবপুর, সীতাকুণ্ড"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ওয়ার্ড নং <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={wardNo}
                onChange={(e) => setWardNo(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-xs sm:text-sm font-semibold"
              >
                {VALID_WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                রাস্তা কর্তনের উদ্দেশ্য <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-xs sm:text-sm font-semibold"
              >
                <option value="water_connection">ওয়াসা / সুপেয় পানি সরবরাহ লাইন সংযোগ</option>
                <option value="gas_connection">গ্যাস সংযোগ পাইপলাইন</option>
                <option value="drainage">পয়ঃনিষ্কাশন / ড্রেন সংযোগ</option>
                <option value="electricity">ভূগর্ভস্থ বিদ্যুৎ ক্যাবল স্থাপন</option>
                <option value="telecom">টেলিযোগাযোগ ও ফাইবার অপটিক ক্যাবল</option>
                <option value="sewerage">সেপটিক ট্যাংক আউটলেট সংযোগ</option>
                <option value="other">অন্যান্য উন্নয়নমূলক খনন কাজ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সড়কের ধরন (Road Structure) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-xs sm:text-sm font-semibold"
              >
                <option value="carpeting">পাকা কার্পেটিং (BC) সড়ক</option>
                <option value="cc">সিসি (CC) কংক্রিট সড়ক</option>
                <option value="rcc">আরসিসি (RCC) ঢালাই সড়ক</option>
                <option value="hbb">এইচবিবি (HBB) / ব্রিক সলিং সড়ক</option>
                <option value="wbm">ডব্লিউবিএম (WBM) সড়ক</option>
                <option value="earthen">কাঁচা / মাটির সড়ক</option>
                <option value="footpath">ফুটপাত / পেভমেন্ট ব্লক</option>
              </select>
            </div>

            {purpose === 'other' && (
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অন্যান্য উদ্দেশ্যের সুনির্দিষ্ট বিবরণ
                </label>
                <input
                  type="text"
                  placeholder="খননের নির্দিষ্ট কারণ লিখুন..."
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Measurements: Strictly mandatory */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>প্রস্তাবিত কর্তন পরিমাপ (ফুট):</span>
                <span className="text-red-600 font-bold">* (বাধ্যতামূলক)</span>
              </h3>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                মোট কর্তন ক্ষেত্রফল: {toBanglaNumber(totalAreaSqFt)} বর্গফুট
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  দৈর্ঘ্য (ফুট) <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ ২০"
                  value={cuttingLengthFt}
                  onChange={(e) => setCuttingLengthFt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  প্রস্থ (ফুট) <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ ২"
                  value={cuttingWidthFt}
                  onChange={(e) => setCuttingWidthFt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  গভীরতা (ফুট) <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ ৩"
                  value={cuttingDepthFt}
                  onChange={(e) => setCuttingDepthFt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              * প্রস্তাবিত পরিমাপ: {toBanglaNumber(lengthNum)} ফুট দৈর্ঘ্য × {toBanglaNumber(widthNum)} ফুট প্রস্থ × {toBanglaNumber(depthNum)} ফুট গভীরতা
            </p>
          </div>

          {/* Work duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কাজ শুরুর সম্ভাব্য তারিখ <span className="text-red-600 font-bold">*</span></label>
              <input
                type="date"
                required
                value={workStartDate}
                onChange={(e) => setWorkStartDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কাজের মেয়াদকাল (দিন) <span className="text-red-600 font-bold">*</span></label>
              <input
                type="text"
                required
                placeholder="উদাঃ ৩"
                value={workDurationDays}
                onChange={(e) => setWorkDurationDays(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Method (পেমেন্ট মাধ্যম) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">৩</span>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>পেমেন্ট মাধ্যম (Payment Method)</span>
            </h2>
          </div>

          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600"></span>
                <strong className="text-sm sm:text-base text-emerald-950 font-bold">
                  পৌরসভা ক্যাশ কাউন্টার (Cash Counter)
                </strong>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                ✓ নির্ধারিত মাধ্যম
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              অনলাইনে আবেদন জমা দেওয়ার পর, প্রাপ্ত ট্র্যাকিং নম্বর নিয়ে সীতাকুণ্ড পৌরসভা কার্যালয়ের ক্যাশ কাউন্টারে সরাসরি ফি <strong>৳ ১০০/- (একশত টাকা)</strong> জমা দিয়ে অফিসিয়াল সিলযুক্ত রসিদ সংগ্রহ করুন।
            </p>
          </div>

          {/* Money Receipt Details Input */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              পৌরসভা ক্যাশ কাউন্টার মানি রশিদ বিবরণ প্রদান করুন:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  পৌরসভা ক্যাশ রশিদ নং (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="উদাঃ MR-2026-9841"
                  value={moneyReceiptNo}
                  onChange={(e) => setMoneyReceiptNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * অনলাইনে আবেদন দাখিলের পরও পৌরসভা ক্যাশ কাউন্টারে সরাসরি ফি জমা দিয়ে রশিদ সংগ্রহ করা যাবে।
                </p>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">রশিদ জমার তারিখ:</label>
                <input
                  type="date"
                  value={moneyReceiptDate}
                  onChange={(e) => setMoneyReceiptDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Declaration & Submit */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>অঙ্গীকারনামা:</span>
            </h4>
            
            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 bg-white p-4 rounded-xl border border-slate-200 divide-y divide-slate-100">
              <p className="pt-1 first:pt-0">
                ১. আমি অঙ্গীকার করিতেছি যে, নির্ধারিত সময়ের মধ্যে কাজ সমাপ্ত করিব এবং জনসাধারণের চলাচলে বিঘ্ন সৃষ্টি না করিয়া প্রয়োজনীয় সতর্কতামূলক সাইনবোর্ড ও লাল নিশানা স্থাপন করিব।
              </p>
              <p className="pt-2.5">
                ২. রাস্তা কর্তন ও পুনঃনির্মাণের জন্য সীতাকুণ্ড পৌরসভা / সরকার কর্তৃক সরেজমিন পরিদর্শন ও পরিমাপ অন্তে নির্ধারিত ক্ষতিপূরণ ফি সরকারি নিয়ম অনুযায়ী চালানের মাধ্যমে যথাসময়ে জমা দিতে বাধ্য থাকিব।
              </p>
              <p className="pt-2.5">
                ৩. রাস্তা খননকালে কোনো সরকারি/বেসরকারি ভূগর্ভস্থ লাইন ক্ষতিগ্রস্ত হইলে তাহার সম্পূর্ণ দায়-দায়িত্ব আমি বহন করিব।
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              required
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 mt-0.5 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              আমি উপরে বর্ণিত সকল শর্তাবলি ও সরকার কর্তৃক নির্ধারিত ফি জমাদানের বিষয়ে পূর্ণ সম্মতি জ্ঞাপন করিতেছি। <span className="text-red-600">*</span>
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>বাতিল</span>
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>রাস্তা কর্তনের আবেদন দাখিল করুন (ফি: ৳ {toBanglaNumber(formFee)}/-)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
