import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  X, 
  Scale, 
  Landmark, 
  Trees, 
  Flame, 
  ExternalLink, 
  FileText,
  AlertCircle,
  Leaf,
  Milestone,
  Building2
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { toBanglaNumber } from '../utils/storage';

export type LegalDocId = 
  | 'rules1996' 
  | 'act1952' 
  | 'pourashava2009' 
  | 'openspace2000' 
  | 'fire2003'
  | 'envAct1995'
  | 'envRules2023'
  | 'highwayAct2021'
  | 'bnbc2020Part1'
  | 'bnbc2020Part2';

export interface LegalDocumentItem {
  id: LegalDocId;
  title: string;
  category: string;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

export const OFFICIAL_LEGAL_DOCUMENTS: LegalDocumentItem[] = [
  {
    id: 'rules1996',
    title: 'ইমারত নির্মাণ বিধিমালা, ১৯৯৬',
    category: 'গেজেট বিধিমালা',
    year: '১৯৯৬',
    description: 'বিধি ১-৩০, নকশা প্রণয়নকারীর যোগ্যতা, উন্মুক্ত স্থান (সেটব্যাক) ও তফসিল-২ সরকারি ফি তালিকা।',
    fileUrl: '/documents/building-construction-rules-1996.pdf',
    fileName: 'ইমারত_নির্মাণ_বিধিমালা_১৯৯৬.pdf',
    icon: BookOpen,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'act1952',
    title: 'ইমারত নির্মাণ আইন, ১৯৫২',
    category: 'মূল আইন',
    year: '১৯৫২',
    description: 'ধারা ১-২০, ৩ বৎসরের অনুমোদন মেয়াদ, অননুমোদিত নির্মাণ অপসারণ ও দণ্ডাদেশ সংক্রান্ত বিধানাবলী।',
    fileUrl: '/documents/building-construction-act-1952.pdf',
    fileName: 'ইমারত_নির্মাণ_আইন_১৯৫২.pdf',
    icon: Scale,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'pourashava2009',
    title: 'স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯',
    category: 'পৌরসভা আইন',
    year: '২০০৯',
    description: 'পৌর এলাকায় ইমারত ও ভূমি নিয়ন্ত্রণ, মহাপরিকল্পনা, ২য় তফসিল ৩৫-৩৭ এবং ৩য় ও ৪র্থ তফসিল।',
    fileUrl: '/documents/local-government-pourashava-act-2009.pdf',
    fileName: 'স্থানীয়_সরকার_পৌরসভা_আইন_২০০৯.pdf',
    icon: Landmark,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'openspace2000',
    title: 'উন্মুক্ত স্থান ও জলাধার সংরক্ষণ আইন, ২০০০',
    category: 'পরিবেশ ও জলাধার',
    year: '২০০০',
    description: 'পৌর এলাকার খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান ও প্রাকৃতিক জলাধারের শ্রেণী পরিবর্তন সংক্রান্ত বাধা-নিষেধ।',
    fileUrl: '/documents/open-space-waterbody-act-2000.pdf',
    fileName: 'উন্মুক্ত_স্থান_ও_জলাধার_সংরক্ষণ_আইন_২০০০.pdf',
    icon: Trees,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'fire2003',
    title: 'অগ্নি প্রতিরোধ ও নির্বাপণ আইন, ২০০৩',
    category: 'অগ্নি নিরাপত্তা ও NOC',
    year: '২০০৩',
    description: 'বহুতল (৭+ তলা) ও বাণিজ্যিক ভবনের ফায়ার সার্ভিস ছাড়পত্র (NOC) ও জীবন-সম্পদ নিরাপত্তা বিধান।',
    fileUrl: '/documents/fire-prevention-extinguishment-act-2003.pdf',
    fileName: 'অগ্নি_প্রতিরোধ_ও_নির্বাপণ_আইন_২০০৩.pdf',
    icon: Flame,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'envAct1995',
    title: 'বাংলাদেশ পরিবেশ সংরক্ষণ আইন, ১৯৯৫',
    category: 'পরিবেশ আইন',
    year: '১৯৯৫',
    description: 'পরিবেশ সংরক্ষণ, পরিবেশগত মান উন্নয়ন, দূষণ নিয়ন্ত্রণ ও পরিবেশগত ছাড়পত্র (ECC) সংক্রান্ত আইন।',
    fileUrl: '/documents/bangladesh-environment-conservation-act-1995.pdf',
    fileName: 'বাংলাদেশ_পরিবেশ_সংরক্ষণ_আইন_১৯৯৫.pdf',
    icon: Leaf,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'envRules2023',
    title: 'পরিবেশ সংরক্ষণ বিধিমালা, ২০২৩',
    category: 'পরিবেশ বিধিমালা',
    year: '২০২৩',
    description: 'ইমারত, শিল্প ও উন্নয়ন প্রকল্পের পরিবেশগত অবস্থান ছাড়পত্র, পরিবেশগত প্রভাব নিরূপণ (EIA) ও বর্জ্য ব্যবস্থাপনা।',
    fileUrl: '/documents/environment-conservation-rules-2023.pdf',
    fileName: 'পরিবেশ_সংরক্ষণ_বিধিমালা_২০২৩.pdf',
    icon: Trees,
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    id: 'highwayAct2021',
    title: 'মহাসড়ক আইন, ২০২১',
    category: 'মহাসড়ক ও সড়ক আইন',
    year: '২০২১',
    description: 'জাতীয়, আঞ্চলিক ও জেলা মহাসড়ক সংরক্ষণ, রাইট অব ওয়ে (ROW), সড়কের উভয়পাশে নির্মাণ সীমানা ও নিয়ন্ত্রণ।',
    fileUrl: '/documents/highway-act-2021.pdf',
    fileName: 'মহাসড়ক_আইন_২০২১.pdf',
    icon: Milestone,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'bnbc2020Part1',
    title: 'BNBC 2020 (Part - 01)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-১): সাধারণ ভবন নিয়ন্ত্রণ, প্রশাসনিক বিধান ও সাধারণ নির্দেশিকা।',
    fileUrl: '/documents/bnbc-2020-part-01.pdf',
    fileName: 'BNBC_2020_Part_01.pdf',
    icon: Building2,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'bnbc2020Part2',
    title: 'BNBC 2020 (Part - 02)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-২): স্ট্রাকচারাল ডিজাইন, লোড ও সিসমিক ডিজাইন, অগ্নি নিরাপত্তা।',
    fileUrl: '/documents/bnbc-2020-part-02.pdf',
    fileName: 'BNBC_2020_Part_02.pdf',
    icon: Building2,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
];

interface BuildingLegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoc?: LegalDocId;
}

export const BuildingLegalDocumentsModal: React.FC<BuildingLegalDocumentsModalProps> = ({
  isOpen,
  onClose,
  defaultDoc = 'rules1996',
}) => {
  const [selectedDocId, setSelectedDocId] = useState<LegalDocId>(defaultDoc);

  // Keep selectedDocId synced when defaultDoc changes
  React.useEffect(() => {
    setSelectedDocId(defaultDoc);
  }, [defaultDoc]);

  if (!isOpen) return null;

  const currentDoc =
    OFFICIAL_LEGAL_DOCUMENTS.find((d) => d.id === selectedDocId) ||
    OFFICIAL_LEGAL_DOCUMENTS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between gap-4 border-b border-emerald-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  অফিসিয়াল গেজেট ও আইন PDF লাইব্রেরি
                </span>
                <span className="text-[11px] text-slate-300">
                  সীতাকুণ্ড পৌরসভা
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentDoc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentDoc.fileUrl}
              download={currentDoc.fileName}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF ডাউনলোড</span>
            </a>

            <a
              href={currentDoc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>নতুন ট্যাবে দেখুন</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {OFFICIAL_LEGAL_DOCUMENTS.map((doc, idx) => {
            const Icon = doc.icon;
            const isSelected = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{toBanglaNumber(idx + 1)}। {doc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: PDF Viewer / Host Download Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full h-full bg-white rounded-2xl border border-slate-300 shadow-xs flex flex-col overflow-hidden">
            {/* Document Header Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentDoc.badgeColor}`}>
                    {currentDoc.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">সাল: {currentDoc.year}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  {currentDoc.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentDoc.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentDoc.fileUrl}
                  download={currentDoc.fileName}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড করুন</span>
                </a>
                <a
                  href={currentDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>পূর্ণ স্ক্রিন</span>
                </a>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full min-h-[500px] bg-slate-200 relative">
              <iframe
                src={`${currentDoc.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[500px] border-none"
                title={currentDoc.title}
              />
              
              {/* Fallback Message for when the PDF is yet to be placed in hosting */}
              <div className="p-4 bg-amber-50/90 border-t border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    হোস্টিং এ <strong>{currentDoc.fileUrl}</strong> ফাইলে আপনার মূল PDF আপলোড করলেই তা স্বয়ংক্রিয়ভাবে এখানে প্রদর্শিত ও ডাউনলোড হবে।
                  </span>
                </div>
                <a
                  href={currentDoc.fileUrl}
                  download={currentDoc.fileName}
                  className="underline font-bold text-amber-950 shrink-0"
                >
                  সরাসরি ডাউনলোড লিঙ্ক
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
