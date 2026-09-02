import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  X, 
  ScanLine, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  FileImage,
  Zap,
  Sparkles
} from 'lucide-react';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (trackingId: string) => void;
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'file'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Play pleasant success sound using Web Audio API
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio not permitted or not supported
    }
  };

  // Helper to extract clean tracking ID from scanned text or URL
  const extractTrackingId = (rawText: string): string => {
    const clean = rawText.trim();
    // Case 1: Direct ID e.g. SKM-DEM-2026-0841
    if (clean.startsWith('SKM-DEM-') || clean.startsWith('SKM-FORM-')) {
      return clean;
    }
    // Case 2: URL containing query param ?track=... or ?id=...
    try {
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        const url = new URL(clean);
        const track = url.searchParams.get('track') || url.searchParams.get('id') || url.searchParams.get('appId') || url.searchParams.get('applicationId');
        if (track) return track;
      }
    } catch {
      // ignore
    }

    // Match regex for SKM-DEM-YYYY-XXXX pattern
    const match = clean.match(/SKM-DEM-\d{4}-\d+/i);
    if (match) {
      return match[0].toUpperCase();
    }

    return clean;
  };

  const handleDecodedText = (text: string) => {
    const trackingId = extractTrackingId(text);
    if (!trackingId) return;

    playScanBeep();
    setScannedResult(trackingId);
    stopCamera();

    setTimeout(() => {
      onScanSuccess(trackingId);
      onClose();
    }, 600);
  };

  // Camera start & frame scanning loop
  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('আপনার ব্রাউজার বা ডিভাইসে ক্যামেরা সাপোর্ট পাওয়া যায়নি। অনুগ্রহ করে ফাইল আপলোড বা সরাসরি আইডি লিখুন।');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const errorMsg = (err as Error)?.name === 'NotAllowedError'
        ? 'ক্যামেরা ব্যবহারের অনুমতি (Permission) প্রদান করা হয়নি। ব্রাউজার সেটিংসে ক্যামেরা এলাও করুন অথবা রশিদ ছবি আপলোড করুন।'
        : 'ক্যামেরা চালু করতে সমস্যা হয়েছে। অন্য অ্যাপ্লিকেশন ক্যামেরা ব্যবহার করছে কি না যাচাই করুন।';
      setCameraError(errorMsg);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleDecodedText(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(tickScan);
  };

  // Process uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setFileError('ইমেজ প্রসেসিং ব্যর্থ হয়েছে।');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleDecodedText(code.data);
        } else {
          setFileError('ছবিটিতে কোনো স্পষ্ট কিউআর কোড (QR Code) শনাক্ত করা যায়নি। অনুগ্রহ করে পরিষ্কার ও সোজা ছবি দিন।');
        }
      };
      img.onerror = () => {
        setFileError('ছবিটি লোড করতে সমস্যা হয়েছে।');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <ScanLine className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">কিউআর কোড স্ক্যানার (QR Scanner)</h3>
              <p className="text-xs text-emerald-200">রশিদ বা প্রত্যয়নপত্রের কিউআর স্ক্যান করুন</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Camera vs File Upload */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveMode('camera');
              setFileError(null);
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>লাইভ ক্যামেরা স্ক্যান</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('file');
              stopCamera();
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'file'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>রশিদ ছবি আপলোড</span>
          </button>
        </div>

        {/* Scanner Content Body */}
        <div className="p-4 sm:p-5 flex flex-col items-center">
          
          {/* Mode 1: Live Camera Viewfinder */}
          {activeMode === 'camera' && (
            <div className="w-full flex flex-col items-center">
              {cameraError ? (
                <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">{cameraError}</p>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>পুনরায় চেষ্টা করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMode('file')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ছবি আপলোড করুন</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square max-w-[280px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-800">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Target frame overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                    <div className="w-full h-full border-2 border-emerald-400/80 rounded-xl relative">
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm"></div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm"></div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-sm"></div>

                      {/* Moving laser animation line */}
                      {isScanning && !scannedResult && (
                        <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"
                             style={{
                               animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                             }}>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Success Overlay */}
                  {scannedResult && (
                    <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center text-white animate-in fade-in duration-150">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                      <span className="text-xs text-emerald-200">কিউআর কোড পাওয়া গেছে!</span>
                      <span className="font-mono font-bold text-sm bg-emerald-800 px-3 py-1 rounded-md mt-1 border border-emerald-500">
                        {scannedResult}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 text-center mt-3">
                ক্যামেরাটির সামনে আবেদনপত্র বা প্রত্যয়নপত্রের কিউআর কোডটি সোজাভাবে ধরুন।
              </p>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {activeMode === 'file' && (
            <div className="w-full flex flex-col items-center">
              <label className="w-full aspect-4/3 max-w-[280px] border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="p-3 bg-white group-hover:bg-emerald-100 rounded-full shadow-xs mb-2 transition-colors">
                  <FileImage className="w-7 h-7 text-slate-500 group-hover:text-emerald-700" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                  রশিদের ছবি বা স্ক্রিনশট নির্বাচন করুন
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PNG, JPG বা JPEG ফাইল ক্লিক অথবা ড্র্যাগ করুন
                </span>
              </label>

              {fileError && (
                <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-800">{fileError}</span>
                </div>
              )}

              {scannedResult && (
                <div className="w-full mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-semibold">কিউআর কোড শনাক্ত হয়েছে</div>
                      <div className="font-mono font-bold text-xs">{scannedResult}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Sample IDs */}
          <div className="w-full mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                দ্রুত টেস্ট ট্র্যাকিং আইডি
              </span>
              <span className="text-[10px] text-slate-600 font-medium">ক্লিক করে যাচাই করুন</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['SKM-DEM-2026-0841', 'SKM-DEM-2026-0792', 'SKM-DEM-2026-0684'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleDecodedText(id)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-mono font-semibold rounded-lg border border-slate-200 transition-colors text-center cursor-pointer truncate"
                  title={id}
                >
                  {id.replace('SKM-DEM-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
