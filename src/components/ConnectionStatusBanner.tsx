import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ConnectionStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justReconnected) {
    return null;
  }

  if (justReconnected) {
    return (
      <div 
        id="network-reconnected-banner" 
        className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all sticky top-0 z-50 animate-in fade-in"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
        <span>ইন্টারনেট সংযোগ পুনঃস্থাপিত হয়েছে। ভূমির ডিমার্কেশন ডাটা পুনরায় সিঙ্ক হচ্ছে।</span>
      </div>
    );
  }

  return (
    <div 
      id="network-offline-banner" 
      className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-md flex items-center justify-between gap-3 sticky top-0 z-50 animate-in slide-in-from-top"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1 bg-amber-700/80 rounded-md shrink-0">
          <WifiOff className="w-4 h-4 text-amber-100" />
        </div>
        <div>
          <span className="font-bold">ইন্টারনেট সংযোগ বিচ্ছিন্ন (Offline Mode): </span>
          <span>ভূমির ডিমার্কেশন ও সরজমিন তদন্ত তথ্য সময় সংবেদনশীল। অনুগ্রহ করে আপনার নেটওয়ার্ক সংযোগ পরীক্ষা করুন।</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (navigator.onLine) {
            setIsOnline(true);
            setJustReconnected(true);
          }
        }}
        className="shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>রিফ্রেশ</span>
      </button>
    </div>
  );
};
