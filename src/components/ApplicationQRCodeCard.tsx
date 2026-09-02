import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Copy, Check, ExternalLink, Download, Sparkles, Smartphone } from 'lucide-react';

interface ApplicationQRCodeCardProps {
  applicationId: string;
  applicantName?: string;
  compact?: boolean;
  className?: string;
  onNavigateToTracking?: (id: string) => void;
}

export const ApplicationQRCodeCard: React.FC<ApplicationQRCodeCardProps> = ({
  applicationId,
  applicantName,
  compact = false,
  className = '',
  onNavigateToTracking,
}) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Dynamic tracking URL for scanning
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?track=${encodeURIComponent(applicationId)}`
    : `https://sitakunda-pourashava.gov.bd/?track=${applicationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // High-res export
    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 500, 500);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Sitakunda_${applicationId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDirectClick = () => {
    if (onNavigateToTracking) {
      onNavigateToTracking(applicationId);
    } else {
      window.location.href = trackingUrl;
    }
  };

  if (compact) {
    return (
      <div className={`bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 ${className}`}>
        <div ref={qrRef} className="p-2 bg-white border-2 border-emerald-500/40 rounded-xl shrink-0 shadow-xs">
          <QRCode
            value={trackingUrl}
            size={84}
            level="H"
            className="w-20 h-20"
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>মোবাইল কিউআর স্ক্যান</span>
          </div>
          <p className="text-[11px] text-slate-600 truncate mt-0.5 font-mono font-semibold">
            {applicationId}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopyLink}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'লিংক'}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleDownloadQR}
              className="text-xs text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-linear-to-br from-emerald-50/90 via-slate-50 to-blue-50/70 rounded-2xl border-2 border-emerald-300/80 p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
        {/* QR Code Canvas Box */}
        <div className="relative group shrink-0">
          <div
            ref={qrRef}
            className="p-3.5 bg-white border-2 border-emerald-500 rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-105"
          >
            <QRCode
              value={trackingUrl}
              size={176}
              level="H"
              className="w-40 h-40 sm:w-44 sm:h-44 text-slate-900"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-700 text-white p-1.5 rounded-full shadow-md">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        {/* Info and Actions */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>ডিজিটাল কিউআর কোড ভেরিফিকেশন (QR Code Scanner)</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            মোবাইলে ক্যামেরা বা QR স্ক্যানার দিয়ে স্ক্যান করুন
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            যেকোনো স্মার্টফোনের ক্যামেরা দিয়ে এই কিউআর কোডটি স্ক্যান করলে সরাসরি সীতাকুণ্ড পৌরসভার পোর্টালে এই আবেদনটির (<span className="font-mono font-bold text-emerald-800">{applicationId}</span>) বর্তমান অগ্রগতি ও অনুমোদন স্ট্যাটাস দেখা যাবে।
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 text-xs font-semibold rounded-lg border border-slate-300 hover:border-emerald-400 shadow-2xs transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">লিংক কপি সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>ট্র্যাকিং লিংক কপি করুন</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>কিউআর ইমেজ ডাউনলোড (PNG)</span>
            </button>

            <button
              onClick={handleDirectClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ট্র্যাকিং পেজ ওপেন করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
