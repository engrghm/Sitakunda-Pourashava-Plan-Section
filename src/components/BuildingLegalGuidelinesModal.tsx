import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Building2, 
  Calculator, 
  Flame, 
  TreePine, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { toBanglaNumber } from '../utils/storage';

interface BuildingLegalGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculatedFee?: (fee: number, sqMeters: number) => void;
}

export const BuildingLegalGuidelinesModal: React.FC<BuildingLegalGuidelinesModalProps> = ({
  isOpen,
  onClose,
  onSelectCalculatedFee,
}) => {
  const [activeTab, setActiveTab] = useState<'rules96' | 'schedule2' | 'acts52_09' | 'env_fire'>('rules96');
  const [calcSqMeters, setCalcSqMeters] = useState<string>('200');
  const [buildingType, setBuildingType] = useState<'residential' | 'non_residential' | 'semi_pucca' | 'katcha'>('residential');

  if (!isOpen) return null;

  // Schedule-2 Rate Table
  const schedule2Rates = [
    { min: 0, max: 50, label: '৫০ বর্গমিটার পর্যন্ত', fee: 100 },
    { min: 51, max: 100, label: '৫১ হতে ১০০ বর্গমিটার পর্যন্ত', fee: 200 },
    { min: 101, max: 200, label: '১০১ হতে ২০০ বর্গমিটার পর্যন্ত', fee: 300 },
    { min: 201, max: 300, label: '২০১ হতে ৩০০ বর্গমিটার পর্যন্ত', fee: 400 },
    { min: 301, max: 500, label: '৩০১ হতে ৫০০ বর্গমিটার পর্যন্ত', fee: 750 },
    { min: 501, max: 1000, label: '৫০১ হতে ১,০০০ বর্গমিটার পর্যন্ত', fee: 2100 },
    { min: 1001, max: 1500, label: '১,০০১ হতে ১,৫০০ বর্গমিটার পর্যন্ত', fee: 4500 },
    { min: 1501, max: 2000, label: '১,৫০১ হতে ২,০০০ বর্গমিটার পর্যন্ত', fee: 6300 },
    { min: 2001, max: 3000, label: '২,০০১ হতে ৩,০০০ বর্গমিটার পর্যন্ত', fee: 15000 },
    { min: 3001, max: 4000, label: '৩,০০১ হতে ৪,০০০ বর্গমিটার পর্যন্ত', fee: 24000 },
    { min: 4001, max: 5000, label: '৪,০০১ হতে ৫,০০০ বর্গমিটার পর্যন্ত', fee: 36000 },
    { min: 5001, max: 10000, label: '৫,০০১ হতে ১০,০০০ বর্গমিটার পর্যন্ত', fee: 48000 },
    { min: 10001, max: 15000, label: '১০,০০১ হতে ১৫,০০০ বর্গমিটার পর্যন্ত', fee: 60000 },
    { min: 15001, max: 30000, label: '১৫,০০১ হতে ৩০,০০০ বর্গমিটার পর্যন্ত', fee: 75000 },
    { min: 30001, max: 40000, label: '২০,০০১ হতে ৪০,০০০ বর্গমিটার পর্যন্ত', fee: 120000 },
    { min: 40001, max: Infinity, label: '৩০,০০০ বর্গমিটার এর অধিক', fee: 210000 },
  ];

  const calculateFee = (sqM: number, type: string) => {
    let baseFee = 100;
    for (const tier of schedule2Rates) {
      if (sqM <= tier.max) {
        baseFee = tier.fee;
        break;
      }
    }

    if (type === 'non_residential') {
      return Math.max(1000, baseFee);
    } else if (type === 'semi_pucca') {
      return Math.max(100, Math.round(baseFee * 0.5));
    } else if (type === 'katcha') {
      return Math.max(60, Math.round(baseFee * 0.25));
    }
    return baseFee;
  };

  const parsedSqM = parseFloat(calcSqMeters) || 0;
  const calculatedResultFee = calculateFee(parsedSqM, buildingType);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ইমারত নির্মাণ আইন ও বিধিমালা রেফারেন্স গাইড</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  অফিসিয়াল গ্যাজেট নির্দেশিকা
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ইমারত নির্মাণ বিধিমালা ১৯৯৬, আইন ১৯৫২, পৌরসভা আইন ২০০৯ ও ফায়ার সেফটি বিধিমালা
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('rules96')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rules96'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ইমারত নির্মাণ বিধিমালা, ১৯৯৬</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule2')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schedule2'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>তফসিল-২ ফি সারণী ও ক্যালকুলেটর</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acts52_09')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'acts52_09'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>আইন ১৯৫২ ও পৌরসভা আইন ২০০৯</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('env_fire')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'env_fire'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>জলাধার ২০০০ ও ফায়ার সেফটি ২০০৩</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* TAB 1: Building Construction Rules 1996 */}
          {activeTab === 'rules96' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
                <h3 className="font-bold text-teal-950 text-sm flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>ইমারত নির্মাণ বিধিমালা, ১৯৯৬ এর প্রধান বিধিসমূহ ও শর্তাবলী:</span>
                </h3>
                <p className="text-xs text-teal-900 leading-relaxed">
                  সীতাকুণ্ড পৌরসভা এলাকায় যেকোনো নতুন ভবন নির্মাণ, বর্ধিতকরণ বা রূপান্তরে গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক গেজেট প্রজ্ঞাপিত ইমারত নির্মাণ বিধিমালা ১৯৯৬ অক্ষরে অক্ষরে প্রতিপালন করা বাধ্যতামূলক।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Rule 5 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ৫: ৭ ফর্দ নকশার অপরিহার্য বিবরণ</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ১:২০০ স্কেলে সাইট লে-আউট প্ল্যান, সি.এস/আর.এস দাগ নির্দেশক সাইট প্ল্যান, ১:৫০ বা ১:১০০ স্কেলে ফ্লোর প্ল্যান, এলিভেশন ও সেকশনসহ মোট ৭ ফর্দ নকশা দাখিল করিতে হইবে।
                  </p>
                </div>

                {/* Rule 6 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ৬: নকশা প্রণয়নকারীর যোগ্যতা</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ৪ তলা পর্যন্ত আবাসিক: ডিপ্লোমা/স্নাতক স্থপতি বা প্রকৌশলী বা সার্টিফিকেটপ্রাপ্ত নকশাকার। ৫ তলা বা ততোধিক তলা এবং অন্যান্য ভবন: শুধুমাত্র স্নাতক স্থপতি।
                  </p>
                </div>

                {/* Rule 8 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ৮: সাইট সংলগ্ন রাস্তা ও দূরত্ব</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    সাইট সংলগ্ন রাস্তা অন্যূন ৩.৬৫ মিটার (ব্যক্তিমালিকানাধীন হলে ৩.০০ মিটার) প্রশস্ত হতে হবে। রাস্তার কেন্দ্র হতে ন্যূনতম ৪.৫ মিটার অথবা সাইট সীমানা হতে ১.৫ মিটার দূরে ভবন নির্মাণ করতে হবে।
                  </p>
                </div>

                {/* Rule 12 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ১২: ইমারতের উচ্চতা ও রাস্তা প্রশস্ততা</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ইমারতের সর্বোচ্চ উচ্চতা সম্মুখবর্তী রাস্তার প্রস্থ এবং উন্মুক্ত স্থানের যোগফলের দ্বিগুণের অধিক হইবে না। ২৩.০০ মিটার বা ততোধিক প্রশস্ত রাস্তায় উচ্চতার উন্মুক্ত সীমা প্রযোজ্য।
                  </p>
                </div>

                {/* Rule 13 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ১৩: গাড়ি পার্কিং ব্যবস্থা</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    আবাসিক ভবনে প্রতি ৩০০ বর্গমিটারে ২৩ বর্গমিটার এবং বাণিজ্যিক ভবনে প্রতি ২০০ বর্গমিটারে ২৩ বর্গমিটার পার্কিং স্পেস বাধ্যতামূলক। পার্কিং র‍্যাম্পের ঢাল অনূর্ধ্ব ১:৮ হতে হবে।
                  </p>
                </div>

                {/* Rule 25 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-teal-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>বিধি ২৫: ৭ বা ততোধিক তলা ভবনের বিশেষ শর্ত</span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ৭ তলা বা তদূর্ধ্ব ভবনে সার্বক্ষণিক লিফট (Elevator), জরুরি ব্যাকআপ জেনারেটর এবং ফায়ার সার্ভিস ও সিভিল ডিফেন্স অনুমোদিত অগ্নি নির্বাপণ ব্যবস্থা অপরিহার্য।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Schedule 2 Fee Table & Live Calculator */}
          {activeTab === 'schedule2' && (
            <div className="space-y-4">
              {/* Live Calculator Widget */}
              <div className="p-4 bg-teal-50 border border-teal-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-teal-950 text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-700" />
                    <span>তফসিল-২ অনুযায়ী সরকারি ফি ক্যালকুলেটর (বিধি ৪)</span>
                  </h3>
                  <span className="text-xs bg-teal-200/80 text-teal-900 px-2.5 py-0.5 rounded-full font-bold">
                    স্বয়ংক্রিয় হিসাব
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোট বেষ্টিত এলাকার আয়তন (বর্গমিটার):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={calcSqMeters}
                      onChange={(e) => setCalcSqMeters(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-teal-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      ≈ {toBanglaNumber(Math.round(parsedSqM * 10.7639))} বর্গফুট
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ইমারতের শ্রেণী ও ব্যবহারের ধরন:
                    </label>
                    <select
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="residential">আবাসিক পাকা ইমারত (১০০% হার)</option>
                      <option value="non_residential">অনাবাসিক / বাণিজ্যিক (ন্যূনতম ১,০০০/-)</option>
                      <option value="semi_pucca">আধাপাকা ইমারত (অর্ধেক হার, নূন্যতম ১০০/-)</option>
                      <option value="katcha">কাঁচা ইমারত (এক-চতুর্থাংশ হার, নূন্যতম ৬০/-)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-white border border-teal-300 rounded-xl text-center flex flex-col items-center justify-center">
                    <span className="text-[11px] text-slate-500 font-semibold">প্রদেয় সরকারি ফি (তফসিল-২)</span>
                    <span className="text-xl font-black text-teal-950">
                      ৳ {toBanglaNumber(calculatedResultFee)}/-
                    </span>
                    {onSelectCalculatedFee && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCalculatedFee(calculatedResultFee, parsedSqM);
                          onClose();
                        }}
                        className="mt-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        এই ফি ফরমে বসান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Official Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">ইমারতের মোট বেষ্টিত এলাকার আয়তন</th>
                      <th className="p-2.5 text-right">দেয় ফি (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {schedule2Rates.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-800 font-medium">{tier.label}</td>
                        <td className="p-2 text-right font-mono font-bold text-teal-950">
                          ৳ {toBanglaNumber(tier.fee)}/-
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Building Act 1952 & Local Govt 2009 */}
          {activeTab === 'acts52_09' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-teal-700" />
                  <span>ইমারত নির্মাণ আইন, ১৯৫২ (Building Construction Act, 1952)</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>
                    <strong>ধারা ৩:</strong> অনুমোদিত কর্তৃপক্ষের লিখিত অনুমতি ব্যতীত কোনো ইমারত নির্মাণ, পুনর্নির্মাণ বা পরিবর্তন সম্পূর্ণ নিষিদ্ধ। অনুমোদনের মেয়াদ ৩ বছর পর্যন্ত বলবৎ থাকিবে।
                  </p>
                  <p>
                    <strong>ধারা ৩ক:</strong> অনুমোদিত নকশাবহির্ভূত অন্য কোনো উদ্দেশ্যে ভবনের ভূমি বা স্পেস ব্যবহার করা যাইবে না।
                  </p>
                  <p>
                    <strong>ধারা ৩খ:</strong> অননুমোদিত নির্মাণ বা শর্ত লঙ্ঘনের ক্ষেত্রে কারণ দর্শানো নোটিশ ও অপসারণ/ভেঙে ফেলার নির্দেশ জারি করা হইবে।
                  </p>
                  <p>
                    <strong>ধারা ১২:</strong> আইন ও বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) লঙ্ঘনে অনূর্ধ্ব <strong>৭ বছর পর্যন্ত কারাদণ্ড</strong> বা অনূন <strong>৫০,০০০/- টাকা অর্থদণ্ড</strong> বা উভয় দণ্ডে দণ্ডিত করার বিধান রহিয়াছে।
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  <span>স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯ (Local Government Act, 2009)</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>
                    <strong>ধারা ৩৫ (ইমারত নির্মাণ ও পুনর্নির্মাণ):</strong> পৌরসভা কর্তৃক সাইট ও নকশা অনুমোদিত না হওয়া পর্যন্ত কোনো ব্যক্তি নির্মাণ কাজ শুরু করতে পারিবে না।
                  </p>
                  <p>
                    <strong>ধারা ৩৬ (ইমারত সমাপন প্রতিবেদন):</strong> নির্মাণ সমাপ্তির ৩০ দিনের মধ্যে পৌরসভায় সমাপ্তি প্রতিবেদন দাখিল করতে হবে।
                  </p>
                  <p>
                    <strong>ধারা ৩৭ ও ১০৮:</strong> বিপজ্জনক ও অনুমোদনহীন ইমারতের ক্ষেত্রে পৌরসভা নিজ উদ্যোগে অপসারণপূর্বক সমুদয় ব্যয় ও জরিমানা মালিকের নিকট হতে আদায় করতে পারিবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Environment, Open Space & Fire Safety */}
          {activeTab === 'env_fire' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <TreePine className="w-4 h-4 text-emerald-700" />
                  <span>খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান এবং প্রাকৃতিক জলাধার সংরক্ষণ আইন, ২০০০</span>
                </h4>
                <div className="space-y-1.5 text-xs text-emerald-950">
                  <p>
                    <strong>ধারা ৫:</strong> মাস্টার প্ল্যান বা পৌর এলাকায় চিহ্নিত খেলার মাঠ, উন্মুক্ত স্থান, পার্ক ও প্রাকৃতিক জলাধার (পুকুর/দীঘি/খাল) ভরাট করা বা অন্য কোনো কাঠামো নির্মাণের জন্য শ্রেণি পরিবর্তন সম্পূর্ণ নিষিদ্ধ ও দণ্ডনীয় অপরাধ।
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-700" />
                  <span>অগ্নি প্রতিরোধ ও নির্বাপণ আইন, ২০০৩</span>
                </h4>
                <div className="space-y-1.5 text-xs text-amber-950">
                  <p>
                    <strong>ধারা ৭:</strong> বহুতল (৭ তলা বা তদূর্ধ্ব) কিংবা বাণিজ্যিক ভবনের ক্ষেত্রে ফায়ার সার্ভিস ও সিভিল ডিফেন্স অধিদপ্তরের পূর্বানুমোদন ও অনাপত্তিপত্র (NOC) ব্যতিরেকে পৌরসভার নকশা অনুমোদন কার্যকর হইবে না।
                  </p>
                  <p>
                    <strong>ধারা ৮:</strong> বিদ্যমান ভবনে পর্যাপ্ত অগ্নিনির্বাপক ব্যবস্থা, জরুরি বহির্গমন সিঁড়ি ও ফায়ার হাইড্রেন্ট সংরক্ষণ বাধ্যতামূলক।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * সীতাকুণ্ড পৌরসভা প্রকৌশল বিভাগ কর্তৃক বিধিমালা ১৯৯৬ ও আইন ২০০৯ মোতাবেক প্রযোজ্য।
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
