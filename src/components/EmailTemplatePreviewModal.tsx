import React, { useState } from 'react';
import { 
  Mail, 
  X, 
  Send, 
  Check, 
  Copy, 
  Smartphone, 
  Globe, 
  Building, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { EmailTemplate } from '../utils/notificationService';
import { MunicipalityLogo } from './MunicipalityLogo';

interface EmailTemplatePreviewModalProps {
  template: EmailTemplate;
  onClose: () => void;
  onSendEmail?: () => void;
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  template,
  onClose,
  onSendEmail,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setSentSuccess(true);
    onSendEmail?.();
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                স্বয়ংক্রিয় নোটিফিকেশন ও অফিসিয়াল ইমেইল টেমপ্লেট
              </h3>
              <p className="text-xs text-emerald-200">
                আবেদনকারী: {template.recipientName} ({template.recipientEmail})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & View Switcher Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">বিষয়:</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">{template.subject}</span>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('html')}
              className={`px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                viewMode === 'html' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              এইচটিএমএল ভিউ (HTML)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                viewMode === 'text' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              প্লেইন টেক্সট (SMS / Plain)
            </button>
          </div>
        </div>

        {/* Body View */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100">
          {sentSuccess ? (
            <div className="py-12 text-center space-y-3 bg-white rounded-xl p-6 border border-emerald-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-emerald-950">
                ইমেইল সফলভাবে প্রেরণ করা হয়েছে!
              </h4>
              <p className="text-xs text-slate-600">
                আবেদনকারীর ইনবক্সে ({template.recipientEmail}) অফিসিয়াল ডিমার্কেশন স্ট্যাটাস নোটিফিকেশন ডেলিভার্ড হয়েছে।
              </p>
            </div>
          ) : viewMode === 'html' ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <div
                className="email-render-preview"
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
              />
            </div>
          ) : (
            <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl whitespace-pre-wrap leading-relaxed shadow-inner">
              {template.plainText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'অনুলিপি সম্পন্ন!' : 'বার্তা কপি করুন'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handleSimulateSend}
              disabled={sentSuccess}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ইমেইল পাঠান (Send Alert)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
