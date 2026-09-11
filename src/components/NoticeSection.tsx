import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const NoticeSection: React.FC = () => {
  return (
    <section
      aria-labelledby="notice-heading"
      className="relative overflow-hidden animate-fade-in-down mb-6"
    >
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-l-2xl"></div>
        <div className="flex items-start gap-3 px-5 py-3.5 pl-6">
          <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 shadow-xs mt-0.5">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-heartbeat" />
          </div>
          <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-normal">
            <strong id="notice-heading" className="font-bold text-amber-900 block mb-1">
              জরুরী দৃষ্টিআকর্ষণ:
            </strong>
            <ol className="list-decimal ml-4 space-y-1">
              <li>আবেদন ফর্মটি সীতাকুণ্ড পৌরসভা কার্যালয় কর্তৃক নির্ধারিত সীমানা প্রাচীর/ভবন নির্মাণ সংক্রান্ত মালিকানা সঠিকতা যাচাইয়ের জন্য ব্যবহৃত হয়।</li>
              <li>ভূমির ডিমার্কেশন যাচাইয়ের পর ডিমার্কেশন প্রত্যয়নপত্র প্রাপ্তি সাপেক্ষে ইমারত নির্মাণ অনুমোদনের আবেদন করতে পারবেন।</li>
              <li>সম্পূর্ণ ফরমটি বাংলায় পূরণ করার জন্য অনুরোধ করা যাচ্ছে।</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};