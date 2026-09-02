import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, ExternalLink, RefreshCw } from 'lucide-react';

interface QRCodeDisplayProps {
  trackingId: string;
  size?: number;
  showDownload?: boolean;
}

export default function QRCodeDisplay({ trackingId, size = 180, showDownload = true }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Generate dynamic tracking link
  const getTrackingUrl = () => {
    try {
      const origin = window.location.origin || 'https://sitakundapourashava.gov.bd';
      const pathname = window.location.pathname || '/';
      return `${origin}${pathname}?id=${encodeURIComponent(trackingId.trim())}`;
    } catch (e) {
      return `https://sitakundapourashava.gov.bd?id=${encodeURIComponent(trackingId.trim())}`;
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    
    const qrUrl = getTrackingUrl();
    
    QRCode.toDataURL(qrUrl, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a', // deep slate (slate-900)
        light: '#ffffff', // pure white
      },
    })
      .then((url) => {
        setDataUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error('QR code generation failed:', err);
        setError('QR কোড তৈরি করা যায়নি');
        setLoading(false);
      });
  }, [trackingId, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Sitakunda_Land_Verification_QR_${trackingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs max-w-xs mx-auto">
      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider no-print">
        <QrCode className="w-4 h-4 text-orange-500" />
        <span>মোবাইল স্ক্যান কিউআর কোড</span>
      </div>

      <div className="relative border-4 border-emerald-800 bg-white p-2 rounded shadow-sm w-fit print:border-slate-400">
        {/* Decorative Orange Corners - hidden on print */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-orange-500 rounded-sm no-print"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-sm no-print"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-orange-500 rounded-sm no-print"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-sm no-print"></div>

        {loading ? (
          <div 
            style={{ width: size, height: size }} 
            className="flex items-center justify-center bg-slate-100"
          >
            <RefreshCw className="w-6 h-6 text-emerald-800 animate-spin" />
          </div>
        ) : error ? (
          <div 
            style={{ width: size, height: size }} 
            className="flex items-center justify-center bg-red-50 text-[10px] text-red-600 font-bold p-2 text-center"
          >
            {error}
          </div>
        ) : (
          <img 
            src={dataUrl} 
            alt={`QR Code for Tracking ${trackingId}`} 
            style={{ width: size, height: size }}
            className="block h-[140px] w-[140px]"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="text-center no-print">
        <p className="text-[10px] text-slate-500 leading-tight">
          যেকোনো স্মার্টফোনের ক্যামেরা দিয়ে বা স্ক্যানার অ্যাপ দিয়ে স্ক্যান করুন 
        </p>
        <span className="text-[10px] font-mono font-semibold text-emerald-800 mt-1 block select-all bg-emerald-50/60 border border-emerald-200/50 px-1.5 py-0.5 rounded truncate max-w-[190px] mx-auto">
          {trackingId}
        </span>
      </div>

      {showDownload && !loading && !error && (
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-1 text-[11px] bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded uppercase tracking-wider transition-colors border-b-2 border-orange-500 cursor-pointer shadow-2xs w-full no-print"
        >
          <Download className="w-3.5 h-3.5" />
          <span>কোড ডাউনলোড করুন</span>
        </button>
      )}
    </div>
  );
}
