import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Clock, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { toBanglaNumber } from '../utils/storage';

interface FAQItem {
  id: string;
  category: 'fees' | 'timeline' | 'documents' | 'inspection' | 'general';
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'fees',
    question: 'ভূমির সীমানা নির্ধারণ (ডিমার্কেশন) আবেদনের মোট সরকারি ফি কত?',
    answer: 'সীতাকুণ্ড পৌরসভার নিয়ম অনুযায়ী ডিমার্কেশন ও সঠিকতা যাচাইয়ের জন্য সর্বমোট সরকারি ফি ৳৬০০.০০ (ছয়শত টাকা মাত্র)। এর মধ্যে সরকারি মূল ডিমার্কেশন ফি ৳৫০০ এবং সরজমিন নক্সাকার সাইট ইনস্পেকশন ও প্রশাসনিক ব্যয় ৳১০০ অন্তর্ভুক্ত। এছাড়া পৌরসভা কোনো অতিরিক্ত বা গোপন চার্জ গ্রহণ করে না।',
    highlights: ['সর্বমোট সরকারি ফি: ৳৬০০.০০', 'কোনো অতিরিক্ত হিডেন চার্জ নেই'],
  },
  {
    id: 'faq-2',
    category: 'fees',
    question: 'ফি কীভাবে এবং কোন কোন মাধ্যমে পরিশোধ করা যাবে?',
    answer: 'আবেদনকারী সরাসরি অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) অথবা যেকোনো ভিসা/মাস্টারকার্ড ব্যবহার করে ঘরে বসেই ফি পরিশোধ করতে পারেন। এছাড়াও সীতাকুণ্ড পৌরসভা কার্যালয়ের ক্যাশ কাউন্টারে সরাসরি ফি জমা দিয়ে প্রাপ্ত রশিদ নম্বর ফরমে উল্লেখ করে আবেদন সম্পন্ন করা যায়।',
    highlights: ['বিকাশ, নগদ, রকেট ও কার্ড পেমেন্ট সাপোর্ট', 'পৌরসভা ক্যাশ কাউন্টারেও জমার সুবিধা'],
  },
  {
    id: 'faq-3',
    category: 'timeline',
    question: 'আবেদন জমা দেওয়ার পর চূড়ান্ত প্রত্যয়নপত্র পেতে কতদিন সময় লাগে?',
    answer: 'অনলাইনে আবেদন দাখিলের পর সাধারণত ৭ থেকে ১০ কার্যদিবসের মধ্যে যাবতীয় কার্যক্রম (নথিপত্র যাচাই, সরজমিন পরিদর্শন ও প্রকৌশলী অনুমোদন) সম্পন্ন করে চূড়ান্ত ডিজিটাল প্রত্যয়নপত্র প্রদান করা হয়।',
    highlights: ['সাধারণ সময়সীমা: ৭ থেকে ১০ কার্যদিবস', 'প্রতিটি ধাপে SMS ও ইমেইল অ্যালার্ট'],
  },
  {
    id: 'faq-4',
    category: 'timeline',
    question: 'আবেদনের অগ্রগতির বিভিন্ন ধাপ কীভাবে পর্যবেক্ষণ করব?',
    answer: 'আবেদন সফল হলে স্ক্রিনে এবং SMS-এর মাধ্যমে একটি ইউনিক ট্র্যাকিং আইডি (যেমন: SKM-DEM-2026-0841) প্রদান করা হয়। আমাদের পোর্টালের "আবেদন ট্র্যাক" মেন্যুতে গিয়ে উক্ত ট্র্যাকিং আইডি অথবা আবেদনকারীর মোবাইল নম্বর দিয়ে তাৎক্ষণিক আবেদনের বর্তমান অবস্থান ও কর্মকর্তার মন্তব্য দেখা যাবে।',
    highlights: ['ট্র্যাকিং আইডি বা মোবাইল নম্বর দিয়ে সার্চ', 'রশিদের কিউআর কোড স্ক্যান করে সরাসরি ট্র্যাকিং'],
  },
  {
    id: 'faq-5',
    category: 'documents',
    question: 'ডিমার্কেশন আবেদনের জন্য কী কী কাগজপত্র আপলোড করতে হবে?',
    answer: 'আবেদনের জন্য নিম্নোক্ত নথিপত্র সংযুক্ত করা আবশ্যক:\n১. মূল মালিকানা দলিলের কপি (Deed)\n২. বি.এস বা সর্বশেষ নামজারি ও জমাভাগ খতিয়ান (Khatian)\n৩. হালনাগাদ ভূমি উন্নয়ন কর পরিশোধের দাখিলা ও ডিসিআর (DCR)\n৪. আবেদনকারী ও ভূমি মালিকের জাতীয় পরিচয়পত্র (NID)\n৫. জমির চতুঃসীমার হাত-নকশা বা লেআউট প্ল্যান (ঐচ্ছিক তবে সুপারিশকৃত)।',
    highlights: ['সর্বোচ্চ ফাইল সাইজ: ৫ মেগাবাইট (MB)', 'ফরম্যাট: PDF, JPG, PNG'],
  },
  {
    id: 'faq-6',
    category: 'documents',
    question: 'যদি মূল খতিয়ান না থাকে তবে কি নামজারি খতিয়ান দিয়ে আবেদন করা যাবে?',
    answer: 'হ্যাঁ, যদি মূল বি.এস খতিয়ান হস্তান্তরিত হয়ে থাকে, তবে সহকারী কমিশনার (ভূমি) কর্তৃক ইস্যুকৃত হালনাগাদ খারিজ/নামজারি খতিয়ান ও প্রস্তাবিত ডিসিআর দাখিল করে আবেদন করা যাবে।',
  },
  {
    id: 'faq-7',
    category: 'inspection',
    question: 'নক্সাকার (সিভিল) কখন এবং কীভাবে সরজমিন পরিদর্শন করবেন?',
    answer: 'কাগজপত্র প্রারম্ভিক যাচাই শেষে পৌরসভার দায়িত্বপ্রাপ্ত নক্সাকার আবেদনকারীকে মোবাইলে কল বা SMS দিয়ে পরিদর্শনের সুনির্দিষ্ট তারিখ ও সময় জানাবেন (সাধারণত ৩-৫ দিনের মধ্যে)। পরিদর্শনের দিন আবেদনকারী বা তার প্রতিনিধি এবং ক্ষেত্রবিশেষে সীমানার পার্শ্ববর্তী প্রতিবেশীদের উপস্থিতিতে মৌজা নকশা অনুযায়ী সীমানা পরিমাপ করা হয়।',
    highlights: ['আগে থেকেই পরিদর্শনের তারিখ ফোনে জানানো হবে', 'বি.এস মৌজা শিট অনুযায়ী বৈজ্ঞানিক পরিমাপ'],
  },
  {
    id: 'faq-8',
    category: 'general',
    question: 'ডিজিটাল ডিমার্কেশন প্রত্যয়নপত্রের বৈধতা কীভাবে যাচাই করা যায়?',
    answer: 'পৌরসভা থেকে ইস্যুকৃত প্রতিটি প্রত্যয়নপত্রে একটি ইউনিক ডিজিটাল কিউআর কোড এবং যাচাইকৃত সনদ নম্বর থাকে। যেকোনো স্মার্টফোন দিয়ে কিউআর কোড স্ক্যান করলে সরাসরি পৌরসভার সার্ভারে সনদের অফিসিয়াল বৈধতা প্রদর্শিত হবে। এটি ব্যাংক ঋণ, প্ল্যান অনুমোদন ও নামজারিতে গ্রহণযোগ্য।',
    highlights: ['কিউআর কোড ভিত্তিক শতভাগ সুরক্ষিত ও জালিয়াতিমুক্ত', 'ব্যাংক ও সরকারি দপ্তরে সরাসরি গ্রহণযোগ্য'],
  },
];

export const FAQs: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-3': true,
    'faq-5': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>সাধারণ জিজ্ঞাসা ও উত্তরসমূহ (FAQs)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          সচরাচর জিজ্ঞাসিত প্রশ্ন ও সমাধান
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          ডিমার্কেশন সরকারি ফি, প্রয়োজনীয় নথিপত্র, যাচাইকরণ সময়সীমা এবং পরিদর্শন সম্পর্কিত সাধারণ তথ্যাবলী
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="max-w-3xl mx-auto mb-8 space-y-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="আপনার প্রশ্ন অনুসন্ধান করুন (যেমন: ফি, কতদিন সময়, কী কী কাগজ)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs font-medium"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded cursor-pointer"
            >
              রিসেট
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[
            { id: 'all', label: 'সকল প্রশ্ন', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'fees', label: '💰 সরকারি ফি ও পেমেন্ট', icon: <Coins className="w-3.5 h-3.5" /> },
            { id: 'timeline', label: '⏱️ সময়সীমা ও ট্র্যাকিং', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'documents', label: '📋 প্রয়োজনীয় নথিপত্র', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'inspection', label: '📐 নক্সাকার পরিদর্শন', icon: <MapPin className="w-3.5 h-3.5" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="max-w-3xl mx-auto space-y-3.5">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds[faq.id];
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 cursor-pointer bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isExpanded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`p-1 rounded-full shrink-0 transition-transform ${
                      isExpanded
                        ? 'text-emerald-700 bg-emerald-50 rotate-180'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <p className="whitespace-pre-line text-slate-700 font-normal">
                      {faq.answer}
                    </p>

                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {faq.highlights.map((hl, hIdx) => (
                          <span
                            key={hIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{hl}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">কোনো প্রশ্ন পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 mt-1">
              আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সাধারণ জিজ্ঞাসা খুঁজে পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>

      {/* Footer Support Banner */}
      <div className="max-w-3xl mx-auto mt-8 p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 bg-emerald-800 rounded-xl shrink-0">
            <PhoneCall className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              আপনার প্রশ্নের উত্তর পাননি?
            </h4>
            <p className="text-xs text-emerald-200 mt-0.5">
              সরাসরি সীতাকুণ্ড পৌরসভা হেল্পডেস্কে কল করুন অথবা ভার্চুয়াল এআই চ্যাটে প্রশ্ন করুন।
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs bg-emerald-800/80 px-3.5 py-2 rounded-xl border border-emerald-500/40 font-mono font-bold text-emerald-100">
            01819-847291
          </span>
        </div>
      </div>
    </div>
  );
};
