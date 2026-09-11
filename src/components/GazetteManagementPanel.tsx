import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Trash2, 
  RotateCcw, 
  Eye, 
  X, 
  AlertCircle, 
  Scale, 
  Check, 
  Clock, 
  HardDrive,
  Info,
  ShieldCheck,
  Search,
  Building2
} from 'lucide-react';
import { 
  LegalDocId, 
  LegalDocumentItem, 
  getLegalDocuments, 
  uploadGazettePdf, 
  resetLegalDocument,
  DEFAULT_LEGAL_DOCUMENTS
} from '../utils/legalDocuments';
import { getLegalDocIcon } from './BuildingLegalDocumentsModal';
import { toBanglaNumber, getOfficerSession } from '../utils/storage';

interface GazetteManagementPanelProps {
  onSuccessNotification?: (msg: string) => void;
}

export const GazetteManagementPanel: React.FC<GazetteManagementPanelProps> = ({
  onSuccessNotification
}) => {
  const [documents, setDocuments] = useState<LegalDocumentItem[]>(() => getLegalDocuments());
  const [uploadingDocId, setUploadingDocId] = useState<LegalDocId | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LegalDocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Hidden file input refs
  const fileInputRefs = useRef<{ [key in LegalDocId]?: HTMLInputElement | null }>({});

  const reloadDocuments = () => {
    setDocuments(getLegalDocuments());
  };

  useEffect(() => {
    const handleUpdate = () => {
      reloadDocuments();
    };
    window.addEventListener('legal-documents-updated', handleUpdate);
    return () => window.removeEventListener('legal-documents-updated', handleUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    if (onSuccessNotification) onSuccessNotification(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  // Handle direct file upload for a specific gazette
  const handleFileChange = async (docId: LegalDocId, file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('অনুগ্রহ করে শুধুমাত্র বৈধ PDF ফাইল আপলোড করুন।');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showError('ফাইলের সাইজ ২৫ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }

    const session = getOfficerSession();
    const officerName = session?.name || session?.username || 'পৌর কর্মকর্তা';

    setUploadingDocId(docId);
    try {
      const result = await uploadGazettePdf(docId, file, officerName);
      if (result.success) {
        showNotification(`গেজেট PDF সফলভাবে আপলোড ও সংরক্ষণ করা হয়েছে: "${file.name}"`);
        reloadDocuments();
      } else {
        showError(result.error || 'ফাইল আপলোড ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      showError(err.message || 'আপলোডে অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setUploadingDocId(null);
      if (fileInputRefs.current[docId]) {
        fileInputRefs.current[docId]!.value = '';
      }
    }
  };

  // Handle document reset to default
  const handleReset = (docId: LegalDocId, title: string) => {
    if (!window.confirm(`আপনি কি "${title}" এর আপলোডকৃত কাস্টম PDF মুছে ফেলে মূল সিস্টেমে ফিরতে চান?`)) {
      return;
    }
    resetLegalDocument(docId);
    reloadDocuments();
    showNotification(`"${title}" এর কাস্টম PDF সফলভাবে মুছে ডিফল্ট লিংকে ফিরিয়ে দেওয়া হয়েছে।`);
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.year.includes(q) ||
      doc.description.toLowerCase().includes(q)
    );
  });

  const customUploadsCount = documents.filter((d) => d.isCustom).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast notifications */}
      {successToast && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 hover:bg-emerald-800 text-emerald-300 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="bg-red-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-red-500/40 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="p-1 hover:bg-red-800 text-red-300 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>ইমারত নির্মাণ সংক্রান্ত আইন ও সরকারি বিধিমালা লাইব্রেরি ব্যবস্থাপনা</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              ১০টি অফিসিয়াল গেজেট ও আইন PDF আপলোড প্যানেল
            </h2>

            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
              নাগরিকগণ ইমারত নির্মাণ অনুমোদন আবেদন (তফসিল-১) ফরম পূরণের সময় যে ১০টি সরকারি গেজেট ও আইন দেখেন এবং ডাউনলোড করেন, সেগুলোর মূল সরকারি PDF ফাইল সরাসরি এখান থেকে আপলোড ও পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[120px]">
              <span className="text-xs text-emerald-200 block font-semibold">লাইভ PDF সংযুক্ত</span>
              <span className="text-2xl font-black text-amber-300 font-mono">
                {toBanglaNumber(customUploadsCount)} / {toBanglaNumber(documents.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (documents.length > 0) setPreviewDoc(documents[0]);
              }}
              className="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>লাইব্রেরি প্রিভিউ দেখুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Instructions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="গেজেট বা আইনের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 self-stretch sm:self-auto justify-end">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>অনুমোদিত ফরম্যাট: <strong>PDF</strong> (সর্বোচ্চ ২৫ মেগাবাইট)</span>
        </div>
      </div>

      {/* 10 Gazettes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredDocs.map((doc, idx) => {
          const Icon = getLegalDocIcon(doc.id);
          const isUploading = uploadingDocId === doc.id;
          const isCustomActive = !!doc.isCustom;

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                isCustomActive 
                  ? 'border-emerald-400/80 ring-1 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Top Row: Meta Badge, Year, and Status */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${doc.badgeColor}`}>
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      সাল: {doc.year}
                    </span>
                  </div>

                  {isCustomActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>লাইভ PDF সংযুক্ত</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full shrink-0">
                      <span>ডিফল্ট লিঙ্ক</span>
                    </span>
                  )}
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {toBanglaNumber(idx + 1)}। {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>

                {/* File Status Box */}
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>বর্তমান ফাইল:</span>
                    </span>
                    <strong className="font-mono text-emerald-950 truncate max-w-[220px]" title={doc.fileName}>
                      {doc.fileName}
                    </strong>
                  </div>

                  {doc.fileSize && (
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>সাইজ:</span>
                      <span className="font-mono">{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}

                  {doc.uploadedAt && (
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>আপলোড তারিখ:</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[doc.id] = el;
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(doc.id, file);
                  }}
                />

                {/* Upload Button */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRefs.current[doc.id]?.click()}
                  className="flex-1 py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="নতুন PDF ফাইল নির্বাচন করুন"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{isCustomActive ? 'PDF পরিবর্তন করুন' : 'PDF আপলোড করুন'}</span>
                    </>
                  )}
                </button>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                  title="PDF প্রিভিউ দেখুন"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>প্রিভিউ</span>
                </button>

                {/* Direct Download Button */}
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  className="py-2.5 px-3 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-300"
                  title="ফাইল ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                {/* Reset to Default Button */}
                {isCustomActive && (
                  <button
                    type="button"
                    onClick={() => handleReset(doc.id, doc.title)}
                    className="py-2.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200"
                    title="কাস্টম PDF মুছে ডিফল্টে ফিরে যান"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Live PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between gap-4 border-b border-emerald-800/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    গেজেট PDF প্রিভিউ ভিউয়ার
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                    {previewDoc.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.fileName}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড</span>
                </a>

                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>নতুন ট্যাবে</span>
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {documents.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setPreviewDoc(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    previewDoc.id === d.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {toBanglaNumber(idx + 1)}। {d.title}
                </button>
              ))}
            </div>

            {/* Embedded Iframe Body */}
            <div className="flex-1 w-full min-h-[500px] bg-slate-200 relative">
              <iframe
                src={`${previewDoc.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[500px] border-none"
                title={previewDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
