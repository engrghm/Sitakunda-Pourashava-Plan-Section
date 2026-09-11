import React, { useState } from 'react';
import { 
  FileText, 
  Map, 
  FileSpreadsheet, 
  Download, 
  Eye, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ShieldCheck,
  FileCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  AlertCircle,
  Lock
} from 'lucide-react';
import { UploadedDocument } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { uploadDocumentToServer } from '../utils/apiStorage';

const DRAFTSMAN_DOC_TYPES = [
  { key: 'mouza_map_sketch', label: 'মৌজা ম্যাপ ও দাগ স্কেচ (Mouza Map & Plot Sketch)' },
  { key: 'field_inspection_report', label: 'সরজমিন পরিদর্শন ও পরিমাপ প্রতিবেদন (Field Inspection Report)' },
  { key: 'final_demarcation_drawing', label: 'সীমানা চিহ্নিতকরণ চূড়ান্ত নক্সা (Final Demarcation Drawing)' },
  { key: 'khatian_copy', label: 'খতিয়ান / পরচা কপি (Khatian / Porcha)' },
  { key: 'deed_copy', label: 'রেজিস্ট্রি দলিল কপি (Registered Deed)' },
  { key: 'tax_receipt', label: 'ভূমি উন্নয়ন কর দাখিলা (Holding / Land Tax Receipt)' },
  { key: 'nid_copy', label: 'জাতীয় পরিচয়পত্র (NID Card)' },
  { key: 'others', label: 'অন্যান্য অফিসিয়াল কাগজপত্র (Others)' },
  { key: 'custom', label: 'অন্যান্য / কাস্টম শিরোনাম...' },
];

interface DocumentAttachmentsViewerProps {
  documents: UploadedDocument[];
  applicantName: string;
  applicationId: string;
  allowManage?: boolean;
  hideViewAndDownload?: boolean;
  onUpdateDocuments?: (updatedDocs: UploadedDocument[]) => void;
}

export const DocumentAttachmentsViewer: React.FC<DocumentAttachmentsViewerProps> = ({
  documents,
  applicantName,
  applicationId,
  allowManage = false,
  hideViewAndDownload = false,
  onUpdateDocuments,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);

  // Add Document Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('mouza_map_sketch');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Document Modal State
  const [editingDoc, setEditingDoc] = useState<UploadedDocument | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDocType, setEditDocType] = useState<string>('mouza_map_sketch');
  const [editReplacementFile, setEditReplacementFile] = useState<File | null>(null);
  const [isEditUploading, setIsEditUploading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

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
    if (type.includes('report') || title.includes('প্রতিবেদন') || title.includes('পরিদর্শন')) {
      return {
        label: 'পরিদর্শন ও পরিমাপ প্রতিবেদন',
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: FileText,
      };
    }
    if (type.includes('other') || title.includes('অন্যান্য') || title.includes('Others')) {
      return {
        label: 'অন্যান্য কাগজপত্র (Others)',
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: FileText,
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
    if (doc.fileUrl) {
      if (doc.fileUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = doc.fileUrl;
        a.download = doc.fileName || `${doc.docTitle}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch as blob for reliable cross-browser file download
        fetch(doc.fileUrl)
          .then((res) => {
            if (!res.ok) throw new Error('Download failed');
            return res.blob();
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || `${doc.docTitle}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          })
          .catch(() => {
            const a = document.createElement('a');
            a.href = doc.fileUrl;
            a.download = doc.fileName || `${doc.docTitle}.pdf`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      }
    } else {
      const blob = new Blob([
        `সীতাকুণ্ড পৌরসভা - অনলাইন ডিমার্কেশন নথি\nআবেদন আইডি: ${applicationId}\nআবেদনকারী: ${applicantName}\nনথির নাম: ${doc.docTitle}\nফাইল: ${doc.fileName}\nতারিখ: ${doc.uploadDate}`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.txt') ? doc.fileName : `${doc.fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Add new document handler
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!newFile) {
      setUploadError('অনুগ্রহ করে একটি ফাইল (PDF বা ছবি) নির্বাচন করুন।');
      return;
    }

    if (newFile.size > 15 * 1024 * 1024) {
      setUploadError('ফাইলের সাইজ ১৫ MB-এর বেশি হতে পারবে না।');
      return;
    }

    const title = selectedDocType === 'custom' 
      ? customTitle.trim() || 'সংযুক্ত নথি' 
      : (DRAFTSMAN_DOC_TYPES.find(d => d.key === selectedDocType)?.label.split(' (')[0] || 'মৌজা ম্যাপ / নক্সা');

    setIsUploading(true);
    try {
      const uploadedRes = await uploadDocumentToServer(newFile, selectedDocType, title, false);
      const newDocItem: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        docType: selectedDocType,
        docTitle: title,
        fileName: uploadedRes.fileName || newFile.name,
        fileSize: uploadedRes.fileSize || newFile.size,
        fileUrl: uploadedRes.fileUrl,
        uploadDate: new Date().toISOString().split('T')[0],
        isMandatory: false,
      };

      const nextDocs = [...documents, newDocItem];
      onUpdateDocuments?.(nextDocs);

      setIsAddModalOpen(false);
      setNewFile(null);
      setCustomTitle('');
      setSelectedDocType('mouza_map_sketch');
    } catch (err: any) {
      setUploadError('ফাইল আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  // Start edit handler
  const handleStartEdit = (doc: UploadedDocument) => {
    setEditingDoc(doc);
    setEditTitle(doc.docTitle);
    setEditDocType(doc.docType);
    setEditReplacementFile(null);
    setEditError(null);
  };

  // Save edit handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setEditError(null);

    if (!editTitle.trim()) {
      setEditError('নথির শিরোনাম আবশ্যক।');
      return;
    }

    setIsEditUploading(true);
    try {
      let updatedFileUrl = editingDoc.fileUrl;
      let updatedFileName = editingDoc.fileName;
      let updatedFileSize = editingDoc.fileSize;

      if (editReplacementFile) {
        if (editReplacementFile.size > 15 * 1024 * 1024) {
          setEditError('ফাইলের সাইজ ১৫ MB-এর বেশি হতে পারবে না।');
          setIsEditUploading(false);
          return;
        }
        const uploaded = await uploadDocumentToServer(editReplacementFile, editDocType, editTitle, false);
        if (uploaded.fileUrl) {
          updatedFileUrl = uploaded.fileUrl;
          updatedFileName = uploaded.fileName || editReplacementFile.name;
          updatedFileSize = uploaded.fileSize || editReplacementFile.size;
        }
      }

      const updatedDoc: UploadedDocument = {
        ...editingDoc,
        docTitle: editTitle.trim(),
        docType: editDocType,
        fileName: updatedFileName,
        fileSize: updatedFileSize,
        fileUrl: updatedFileUrl,
      };

      const nextDocs = documents.map(d => d.id === editingDoc.id ? updatedDoc : d);
      onUpdateDocuments?.(nextDocs);
      setEditingDoc(null);
    } catch (err) {
      setEditError('নথি আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsEditUploading(false);
    }
  };

  // Delete document handler
  const handleDeleteDoc = (id: string) => {
    const target = documents.find(d => d.id === id);
    if (!target) return;
    const confirmed = window.confirm(`আপনি কি নিশ্চিতভাবে "${target.docTitle}" নথিটি মুছে ফেলতে চান?`);
    if (confirmed) {
      const nextDocs = documents.filter(d => d.id !== id);
      onUpdateDocuments?.(nextDocs);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Title and Add Button for Draftsman/Admin */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>সংযুক্ত নথিপত্র ও ম্যাপসমূহ ({toBanglaNumber(documents.length)} টি নথি)</span>
        </h4>

        <div className="flex items-center gap-2">
          {allowManage && (
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(true);
                setUploadError(null);
                setNewFile(null);
              }}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ নতুন নথিপত্র / ম্যাপ যোগ করুন</span>
            </button>
          )}

          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
            {allowManage ? (
              <span>নক্সাকার সম্পাদনাসক্ষম</span>
            ) : hideViewAndDownload ? (
              <>
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>দাপ্তরিকভাবে সুরক্ষাপ্রাপ্ত</span>
              </>
            ) : (
              <span>অফিসিয়াল যাচাইযোগ্য</span>
            )}
          </span>
        </div>
      </div>

      {/* Confidentiality Notice for Citizens / Tracking View */}
      {hideViewAndDownload && (
        <div className="p-3 bg-amber-50/90 border border-amber-200 text-amber-950 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-xs text-amber-950 block mb-0.5">
              সংযুক্ত নথিপত্র ও ম্যাপসমূহ দাপ্তরিকভাবে সুরক্ষাপ্রাপ্ত
            </span>
            নাগরিকের ব্যক্তিগত নথিপত্র ও জমির মালিকানার তথ্যের গোপনীয়তা ও সুরক্ষার্থে ট্র্যাকিং পোর্টালে সংযুক্ত ফাইলসমূহ সরাসরি প্রদর্শন (প্রিভিউ) বা ডাউনলোড উন্মুক্ত নয়। শুধুমাত্র দায়িত্বপ্রাপ্ত পৌর কর্মকর্তা যাচাই প্যানেল থেকে এগুলি পর্যালোচনা করতে পারবেন।
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="p-5 bg-white border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500 space-y-2">
          <p>এই আবেদনে কোনো অতিরিক্ত ফাইল বা নথিপত্র সংযুক্ত করা হয়নি।</p>
          {allowManage && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>এখানে প্রথম নথিপত্র বা ম্যাপ আপলোড করুন</span>
            </button>
          )}
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
                    {hideViewAndDownload ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200" title="দাপ্তরিক গোপনীয়তা রক্ষার্থে ট্র্যাকিং পেজে ফাইল প্রিভিউ বা ডাউনলোড উন্মুক্ত নয়">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>সংরক্ষিত ও সুরক্ষিত</span>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
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
                      </>
                    )}

                    {allowManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(doc)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors cursor-pointer"
                          title="সম্পাদনা করুন (নাম/ফাইল পরিবর্তন)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md border border-red-200 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Add New Document / Map */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in duration-150">
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-300" />
                <h3 className="text-sm font-bold text-white">নতুন নথিপত্র বা ম্যাপ আপলোড ও সংযুক্তি</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-5 space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  নথিপত্র বা ম্যাপের ধরন <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {DRAFTSMAN_DOC_TYPES.map((dt) => (
                    <option key={dt.key} value={dt.key}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDocType === 'custom' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    কাস্টম নথির নাম লিখুন <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="যেমন: সংশোধিত মৌজা ম্যাপের ডিজিটাল দাগ স্কেচ"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ফাইল নির্বাচন করুন (PDF, JPG, PNG, WEBP) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 hover:file:bg-emerald-800 file:text-white cursor-pointer border border-slate-300 rounded-lg p-1.5"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  প্রতিটি ফাইলের সর্বোচ্চ সাইজ ১৫ MB পর্যন্ত সমর্থিত
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>সংযুক্ত ও সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Existing Document / Replace File */}
      {editingDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">নথিপত্র বা ম্যাপ সম্পাদনা</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  নথির শিরোনাম / নাম <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  নথির ধরন নির্বাচন
                </label>
                <select
                  value={editDocType}
                  onChange={(e) => setEditDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                >
                  {DRAFTSMAN_DOC_TYPES.map((dt) => (
                    <option key={dt.key} value={dt.key}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 block">বর্তমান ফাইল:</span>
                <span className="font-mono text-slate-800 font-bold block truncate">{editingDoc.fileName}</span>
                <span className="text-[10px] text-slate-400 font-mono">সাইজ: {formatFileSize(editingDoc.fileSize)}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ফাইল প্রতিস্থাপন করুন (ঐচ্ছিক)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setEditReplacementFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 hover:file:bg-slate-800 file:text-white cursor-pointer border border-slate-300 rounded-lg p-1.5"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  নতুন ফাইল দিলে পূর্ববর্তী ফাইলটি প্রতিস্থাপিত হবে
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  disabled={isEditUploading}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isEditUploading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isEditUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>আপডেট সংরক্ষণ করুন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Quick Preview Modal */}
      {selectedDoc && !hideViewAndDownload && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
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

              {/* Visual Document Content / Real Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 min-h-[260px] flex items-center justify-center">
                {selectedDoc.fileUrl ? (
                  selectedDoc.fileUrl.startsWith('data:image/') || selectedDoc.fileName.match(/\.(jpg|jpeg|png|webp)$/i) || selectedDoc.fileUrl.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ? (
                    <div className="p-4 flex flex-col items-center justify-center">
                      <img
                        src={selectedDoc.fileUrl}
                        alt={selectedDoc.docTitle}
                        className="max-h-[420px] max-w-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[450px] flex flex-col">
                      <iframe
                        src={selectedDoc.fileUrl}
                        title={selectedDoc.docTitle}
                        className="w-full flex-1 border-0"
                      />
                      <div className="bg-slate-100 p-2 text-center text-xs border-t border-slate-200">
                        <a
                          href={selectedDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>পিডিএফ নতুন ট্যাবে বড় করে দেখুন</span>
                        </a>
                      </div>
                    </div>
                  )
                ) : selectedDoc.docTitle.includes('ম্যাপ') || selectedDoc.docTitle.includes('নক্সা') ? (
                  <div className="p-8 text-center space-y-3 w-full">
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
                  <div className="p-8 text-center space-y-3">
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
