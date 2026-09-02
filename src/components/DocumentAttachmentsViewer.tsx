import React, { useState } from 'react';
import { 
  FileText, 
  Map, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ZoomIn, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { UploadedDocument } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface DocumentAttachmentsViewerProps {
  documents: UploadedDocument[];
  applicantName: string;
  applicationId: string;
}

export const DocumentAttachmentsViewer: React.FC<DocumentAttachmentsViewerProps> = ({
  documents,
  applicantName,
  applicationId,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);

  const getDocTypeBadge = (type: string, title: string) => {
    if (type.includes('map') || title.includes('ম্যাপ') || title.includes('নক্সা')) {
      return {
        label: 'মৌজা ম্যাপ / নক্সা',
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: Map,
      };
    }
    if (type.includes('deed') || title.includes('দলিল')) {
      return {
        label: 'মালিকানা দলিল',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: FileText,
      };
    }
    if (type.includes('khatian') || title.includes('খতিয়ান') || title.includes('পরচা')) {
      return {
        label: 'খতিয়ান / পরচা',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: FileSpreadsheet,
      };
    }
    if (type.includes('tax') || title.includes('দাখিলা') || title.includes('কর')) {
      return {
        label: 'ভূমি কর দাখিলা',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: FileCheck,
      };
    }
    return {
      label: 'সংযুক্ত নথি',
      bg: 'bg-slate-50 text-slate-800 border-slate-200',
      icon: FileText,
    };
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'অজ্ঞাত সাইজ';
    if (bytes < 1024 * 1024) {
      return `${toBanglaNumber(Math.round(bytes / 1024))} KB`;
    }
    return `${toBanglaNumber((bytes / (1024 * 1024)).toFixed(2))} MB`;
  };

  const handleDownload = (doc: UploadedDocument) => {
    // If real file URL or data URL exists, trigger download; otherwise simulate download with text report
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName;
      a.click();
    } else {
      const blob = new Blob([
        `সীতাকুণ্ড পৌরসভা - অনলাইন ডিমার্কেশন নথি\nআবেদন আইডি: ${applicationId}\nআবেদনকারী: ${applicantName}\nনথির নাম: ${doc.docTitle}\nফাইল: ${doc.fileName}\nতারিখ: ${doc.uploadDate}`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.txt') ? doc.fileName : `${doc.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>সংযুক্ত নথিপত্র ও ম্যাপসমূহ ({toBanglaNumber(documents.length)} টি নথি)</span>
        </h4>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
          অফিসিয়াল যাচাইযোগ্য
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
          এই আবেদনে কোনো অতিরিক্ত ফাইল বা নথিপত্র সংযুক্ত করা হয়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {documents.map((doc) => {
            const badge = getDocTypeBadge(doc.docType, doc.docTitle);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={doc.id}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1" title={doc.docTitle}>
                    {doc.docTitle}
                  </h5>
                  <p className="text-[11px] text-slate-500 font-mono truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 text-[10px]">
                    {formatBanglaDate(doc.uploadDate || '2026-08-25')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>প্রিভিউ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                      title="ডাউনলোড করুন"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Quick Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedDoc.docTitle}</h3>
                  <span className="text-[11px] text-slate-300 font-mono">{selectedDoc.fileName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">আবেদন আইডি:</span>
                    <span className="font-bold text-slate-800">{applicationId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">আবেদনকারীর নাম:</span>
                    <span className="font-bold text-slate-800">{applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ফাইলের ধরন ও সাইজ:</span>
                    <span className="font-bold text-slate-800">{formatFileSize(selectedDoc.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">আপলোডের তারিখ:</span>
                    <span className="font-bold text-slate-800">{formatBanglaDate(selectedDoc.uploadDate)}</span>
                  </div>
                </div>
              </div>

              {/* Visual Simulated Document Content / Image View */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
                {selectedDoc.docTitle.includes('ম্যাপ') || selectedDoc.docTitle.includes('নক্সা') ? (
                  <div className="space-y-3 w-full">
                    <div className="w-full h-44 bg-emerald-950/5 rounded-lg border border-emerald-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <Map className="w-12 h-12 text-emerald-700 mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        সীতাকুণ্ড পৌরসভা মৌজা ম্যাপ ও দাগ স্কেচ প্রিভিউ
                      </span>
                      <span className="text-[11px] text-slate-500">
                        দাগ নং ও চতুর্সীমা সার্ভেয়ার কর্তৃক ডিজিটাল পরিমাপ অনুযায়ী চিহ্নিত
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{selectedDoc.docTitle}</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        নথিটি পৌরসভা সিস্টেমে সংরক্ষিত এবং নক্সাকার ও সহকারী প্রকৌশলী কর্তৃক যাচাইকৃত।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ডিজিটাল সিস্টেমে সংগৃহীত ও সুরক্ষিত</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedDoc)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
