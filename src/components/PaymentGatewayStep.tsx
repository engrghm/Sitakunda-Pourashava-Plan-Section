import React from 'react';
import {
  Building,
  CheckCircle2,
  ShieldCheck,
  Info,
  Receipt,
  Clock,
  Landmark,
  BadgeCheck
} from 'lucide-react';
import { PaymentDetails } from '../types';
import { toBanglaNumber } from '../utils/storage';

interface PaymentGatewayStepProps {
  applicantMobile?: string;
  applicantName?: string;
  paymentDetails: PaymentDetails;
  onPaymentChange: (details: PaymentDetails) => void;
}

export const PaymentGatewayStep: React.FC<PaymentGatewayStepProps> = ({
  applicantMobile = '',
  applicantName = '',
  paymentDetails,
  onPaymentChange,
}) => {
  const TOTAL_FEE = 100;

  // Always ensure counter method
  React.useEffect(() => {
    if (paymentDetails.method !== 'counter') {
      onPaymentChange({
        method: 'counter',
        methodNameBangla: 'পৌরসভা ক্যাশ কাউন্টার (অফলাইন)',
        amount: TOTAL_FEE,
        status: 'unpaid',
      });
    }
  }, []);

  return (
    <div className="space-y-5">

      {/* Fee Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 shadow-lg border border-emerald-900/60">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-[11px] font-semibold border border-emerald-700/60">
              <ShieldCheck className="w-3 h-3" />
              <span>সীতাকুণ্ড পৌরসভা — রাজস্ব ও ফি কালেকশন শাখা</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
              ভূমির ডিমার্কেশন আবেদন সরকারি ফি
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              আবেদন ফরম দাখিলের জন্য নির্ধারিত সরকারি ফি। আবেদন জমার পর পৌরসভার ক্যাশ কাউন্টারে পরিশোধ করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center shrink-0 min-w-[120px]">
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium uppercase tracking-wider">সরকারি ফি</span>
            <div className="text-3xl font-extrabold text-amber-300 font-mono leading-none">
              ৳{toBanglaNumber(TOTAL_FEE)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">একশত টাকা মাত্র</span>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="relative mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 text-xs border border-white/10">
            <span className="text-slate-300 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              ডিমার্কেশন আবেদন ফরম মূল্য
            </span>
            <strong className="text-amber-300 font-mono">৳ ১০০/- (একশত টাকা)</strong>
          </div>
        </div>
      </div>

      {/* Payment Method Card - Only Cash Counter */}
      <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/60 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-700/10 border-b border-emerald-200/60">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">পেমেন্ট মাধ্যম</span>
          <span className="text-[11px] bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-bold">
            ✓ নির্ধারিত মাধ্যম
          </span>
        </div>

        <div className="p-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Landmark className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-bold text-base text-slate-900">পৌরসভা ক্যাশ কাউন্টার</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                Cash Counter
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              অনলাইনে আবেদন জমা দেওয়ার পর, প্রাপ্ত <strong>ট্র্যাকিং নম্বর</strong> নিয়ে সীতাকুণ্ড পৌরসভা কার্যালয়ের ক্যাশ কাউন্টারে সরাসরি ফি{' '}
              <strong className="text-emerald-800">৳ {toBanglaNumber(TOTAL_FEE)}/-</strong> জমা দিয়ে অফিসিয়াল সিলযুক্ত রসিদ সংগ্রহ করুন।
            </p>
          </div>
          <div className="shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="border-t border-emerald-200/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-emerald-50/30">
          <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-medium">
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>ফি স্থিতি: <strong>{paymentDetails.moneyReceiptNo?.trim() ? 'পরিশোধিত (ক্যাশ রশিদ সংযুক্ত)' : 'অপরিশোধিত (কাউন্টারে প্রদেয়)'}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <Clock className="w-3 h-3" />
            <span>{paymentDetails.moneyReceiptNo?.trim() ? 'রশিদ নম্বর দাখিলকৃত' : 'আবেদনের পরে পরিশোধ করুন'}</span>
          </div>
        </div>
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
              value={paymentDetails.moneyReceiptNo || ''}
              onChange={(e) => {
                const val = e.target.value;
                onPaymentChange({
                  ...paymentDetails,
                  moneyReceiptNo: val,
                  status: val.trim() ? 'paid' : 'unpaid',
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              * অনলাইনে আবেদন দাখিলের পরও পৌরসভা ক্যাশ কাউন্টারে সরাসরি ফি জমা দিয়ে রশিদ সংগ্রহ করা যাবে।
            </p>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">রশিদ জমার তারিখ:</label>
            <input
              type="date"
              value={paymentDetails.moneyReceiptDate || ''}
              onChange={(e) =>
                onPaymentChange({
                  ...paymentDetails,
                  moneyReceiptDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
            />
          </div>
        </div>
      </div>

      {/* Treasury / Bank Draft Official Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-amber-950 text-sm">
            অফিসিয়াল ট্রেজারী চালান ও ব্যাংক ড্রাফট সংক্রান্ত নির্দেশনা:
          </span>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            গ্রাহক নিজে পৌরসভার ক্যাশ রশিদ মারফত ফি জমা প্রদান করবেন। <strong>ট্রেজারী চালান / ব্যাংক ড্রাফট / পে-অর্ডারের বিবরণ ও সরকারি হিসাব কোড</strong> নক্সাকার (সিভিল) তার অফিসিয়াল আইডি হতে যাচাইপূর্বক সিস্টেমে ইনপুট প্রদান করবেন।
          </p>
        </div>
      </div>

      {/* Submission Steps Instructions */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <span className="font-bold text-slate-800 block">ফি পরিশোধের ধাপসমূহ:</span>
          <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
            <li>অনলাইন ফরম পূরণ করে <strong>আবেদনপত্র জমা দিন</strong></li>
            <li>ট্র্যাকিং আইডি ও প্রিন্ট কপি সংগ্রহ করুন</li>
            <li>পৌরসভার ক্যাশ কাউন্টারে ফি পরিশোধ করুন (কার্যদিবস: রবি–বৃহস্পতি, সকাল ৯:০০ – বিকাল ৩:৩০)</li>
            <li>অফিসিয়াল সিলযুক্ত রসিদ সংগ্রহ করুন ও সংরক্ষণ করুন</li>
          </ol>
        </div>
      </div>

    </div>
  );
};
