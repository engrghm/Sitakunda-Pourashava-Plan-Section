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
  const [selectedDocId, setSelectedDocId] = useState<LegalDocId>(defaultDoc);

  // Sync when defaultDoc prop changes
  React.useEffect(() => {
    setSelectedDocId(defaultDoc);
  }, [defaultDoc]);

  // Listen to dynamic updates when officer uploads/modifies gazette PDFs
  React.useEffect(() => {
    const handleUpdate = () => {
      setDocs(getEnrichedLegalDocuments());
    };
    window.addEventListener('legal-documents-updated', handleUpdate);
    return () => window.removeEventListener('legal-documents-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const currentDoc =
    docs.find((d) => d.id === selectedDocId) ||
    docs[0];

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
          {docs.map((doc, idx) => {
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
