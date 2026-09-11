import React, { useState, useEffect } from 'react';
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
  Building2,
  Search,
  Printer,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';
import { toBanglaNumber } from '../utils/storage';
import {
  LegalDocId,
  LegalDocumentItem as BaseLegalDocumentItem,
  getLegalDocuments,
  DEFAULT_LEGAL_DOCUMENTS
} from '../utils/legalDocuments';

export type { LegalDocId };

export const getLegalDocIcon = (id: LegalDocId) => {
  switch (id) {
    case 'rules1996': return BookOpen;
    case 'act1952': return Scale;
    case 'pourashava2009': return Landmark;
    case 'openspace2000': return Trees;
    case 'fire2003': return Flame;
    case 'envAct1995': return Leaf;
    case 'envRules2023': return Trees;
    case 'highwayAct2021': return Milestone;
    case 'bnbc2020Part1':
    case 'bnbc2020Part2':
    default: return Building2;
  }
};

export interface LegalDocumentItem extends BaseLegalDocumentItem {
  icon: React.ComponentType<{ className?: string }>;
}

export const getEnrichedLegalDocuments = (): LegalDocumentItem[] => {
  return getLegalDocuments().map((doc) => ({
    ...doc,
    icon: getLegalDocIcon(doc.id),
  }));
};

export const OFFICIAL_LEGAL_DOCUMENTS: LegalDocumentItem[] = getEnrichedLegalDocuments();

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
  const [docs, setDocs] = useState<LegalDocumentItem[]>(() => getEnrichedLegalDocuments());
  const [selectedDocId, setSelectedDocId] = useState<LegalDocId>((defaultDoc as LegalDocId) || 'rules1996');
  const [viewMode, setViewMode] = useState<'reader' | 'pdf'>('reader');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync when defaultDoc prop changes
  useEffect(() => {
    setSelectedDocId((defaultDoc as LegalDocId) || 'rules1996');
  }, [defaultDoc]);

  // Listen to dynamic updates when officer uploads/modifies gazette PDFs
  useEffect(() => {
    const handleUpdate = () => {
      setDocs(getEnrichedLegalDocuments());
    };
    window.addEventListener('legal-documents-updated', handleUpdate);
    return () => window.removeEventListener('legal-documents-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const currentDocIndex = docs.findIndex((d) => d.id === selectedDocId);
  const currentDoc = currentDocIndex >= 0 ? docs[currentDocIndex] : docs[0];

  const handlePrevDoc = () => {
    const prevIdx = (currentDocIndex - 1 + docs.length) % docs.length;
    setSelectedDocId(docs[prevIdx].id);
    setSearchQuery('');
  };

  const handleNextDoc = () => {
    const nextIdx = (currentDocIndex + 1) % docs.length;
    setSelectedDocId(docs[nextIdx].id);
    setSearchQuery('');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSections = (currentDoc.sections || []).filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden relative print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between gap-4 border-b border-emerald-800/40 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  অফিসিয়াল গেজেট ও আইন লাইব্রেরি
                </span>
                <span className="text-[11px] text-slate-300">
                  সীতাকুণ্ড পৌরসভা কার্যালয়, চট্টগ্রাম
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentDoc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentDoc.fileUrl ? (
              <>
                <a
                  href={currentDoc.fileUrl}
                  download={currentDoc.fileName}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  title="মূল গেজেট PDF ফাইল ডাউনলোড করুন"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF ডাউনলোড</span>
                </a>

                <a
                  href={currentDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
                  title="নতুন ট্যাবে PDF খুলুন"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden md:inline">নতুন ট্যাবে</span>
                </a>
              </>
            ) : currentDoc.officialUrl ? (
              <a
                href={currentDoc.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
                title="সরকারি BDLaws পোর্টালে দেখুন"
              >
                <span>BDLaws পোর্টাল</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}

            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 10 Documents Horizontal Tab Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none print:hidden">
          {docs.map((doc, idx) => {
            const Icon = doc.icon;
            const isSelected = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Subheader: View Mode Switcher & Quick Navigation */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setViewMode('reader')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>আইন ও ধারাসমূহ (Interactive Reader)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>মূল গেজেট PDF ভিউয়ার</span>
            </button>
          </div>

          {/* Prev / Next Document Quick Nav & BDLaws Link */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentDoc.officialUrl && (
              <a
                href={currentDoc.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-colors"
                title="বাংলাদেশ সরকারের অফিশিয়াল আইন পোর্টালে দেখুন"
              >
                <span>সরকারি BDLaws লিংক</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={handlePrevDoc}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 cursor-pointer"
              title="পূর্ববর্তী আইন"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-500 font-mono px-1">
              {toBanglaNumber(currentDocIndex + 1)}/{toBanglaNumber(docs.length)}
            </span>

            <button
              type="button"
              onClick={handleNextDoc}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 cursor-pointer"
              title="পরবর্তী আইন"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* VIEW MODE 1: INTERACTIVE READER */}
          {viewMode === 'reader' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Document Overview Banner Card */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentDoc.badgeColor}`}>
                        {currentDoc.category}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">সাল: {currentDoc.year}</span>
                      {currentDoc.gazetteNo && (
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          {currentDoc.gazetteNo}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                      {currentDoc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('pdf')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>PDF ফাইলে দেখুন</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {currentDoc.description}
                </p>

                {currentDoc.authority && (
                  <p className="text-xs text-slate-500 font-medium">
                    কর্তৃপক্ষ: <span className="text-slate-800 font-bold">{currentDoc.authority}</span>
                  </p>
                )}
              </div>

              {/* Key Highlights Card */}
              {currentDoc.keyHighlights && currentDoc.keyHighlights.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>সীতাকুণ্ড পৌরসভায় প্রয়োগযোগ্য প্রধান নির্দেশিকা ও সারসংক্ষেপ:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-900">
                    {currentDoc.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section Search Bar */}
              <div className="relative print:hidden">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`${currentDoc.title}-এর ধারা বা বিষয় অনুসন্ধান করুন...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Sections List */}
              <div className="space-y-3">
                {filteredSections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <h5 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>{sec.title}</span>
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}

                {filteredSections.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    "{searchQuery}" এর সাথে সম্পর্কিত কোনো ধারা পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: EMBEDDED PDF VIEWER */}
          {viewMode === 'pdf' && (
            <div className="w-full h-full flex flex-col space-y-3">
              {currentDoc.fileUrl ? (
                <>
                  {/* PDF Control Status Bar */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {currentDoc.fileName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ডিজিটাল গেজেট PDF সংযুক্ত</span>
                          </span>
                          {currentDoc.fileSize && (
                            <span>• {Math.round(currentDoc.fileSize / 1024)} KB</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={currentDoc.fileUrl}
                        download={currentDoc.fileName}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>ডাউনলোড করুন</span>
                      </a>

                      <a
                        href={currentDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>নতুন ট্যাবে খুলুন</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF iframe with object fallback */}
                  <div className="w-full h-[600px] bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner relative flex flex-col">
                    <object
                      data={`${currentDoc.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      type="application/pdf"
                      className="w-full h-full min-h-[580px]"
                    >
                      <iframe
                        src={`${currentDoc.fileUrl}#toolbar=1&navpanes=0`}
                        className="w-full h-full min-h-[580px] border-none"
                        title={currentDoc.title}
                      >
                        <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center space-y-4">
                          <AlertCircle className="w-10 h-10 text-amber-600" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">PDF সরাসরি প্রিভিউ করা যায়নি</h4>
                            <p className="text-xs text-slate-600 mt-1">
                              নিচের বোতাম দিয়ে ফাইলটি সরাসরি ডাউনলোড বা নতুন ট্যাবে দেখতে পারেন।
                            </p>
                          </div>
                          <a
                            href={currentDoc.fileUrl}
                            download={currentDoc.fileName}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                          >
                            PDF ফাইল ডাউনলোড করুন
                          </a>
                        </div>
                      </iframe>
                    </object>
                  </div>
                </>
              ) : (
                <div className="w-full min-h-[420px] bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">
                      এই গেজেটের কোনো স্ক্যানড PDF ফাইল এখনও আপলোড করা হয়নি
                    </h4>
                    <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                      পৌরসভা কর্তৃপক্ষ সরকারি গেজেট ফাইল আপলোড করলে তা সরাসরি এখানে দেখা ও ডাউনলোড করা যাবে। আপনি পাশের <strong>"আইন ও ধারাসমূহ"</strong> ট্যাবে সম্পূর্ণ বাংলায় সকল ধারা পড়তে পারেন।
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('reader')}
                      className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>আইন ও ধারাসমূহ পড়ুন</span>
                    </button>
                    {currentDoc.officialUrl && (
                      <a
                        href={currentDoc.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
                      >
                        <span>সরকারি BDLaws পোর্টালে দেখুন</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              সীতাকুণ্ড পৌরসভা ইমারত নির্মাণ অনুমোদন সেল কর্তৃক বিধিমালা ১৯৯৬ ও আইন ২০০৯ মোতাবেক প্রযোজ্য।
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
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
    </div>
  );
};
