import React from 'react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { formatBanglaDate } from '../utils/storage';

interface PrintWatermarkProps {
  customDate?: string;
  subText?: string;
}

export const PrintWatermark: React.FC<PrintWatermarkProps> = ({
  customDate,
  subText = 'অফিসিয়াল রেকর্ড ও নথি ব্যবস্থাপনা'
}) => {
  const currentDateStr = customDate || formatBanglaDate(new Date().toISOString());
  const currentYearEng = new Date().getFullYear();

  return (
    <div 
      className="officer-print-watermark select-none" 
      aria-hidden="true"
    >
      <div className="w-32 h-32 mb-3 opacity-90">
        <MunicipalityLogo className="w-full h-full" />
      </div>
      <div className="text-center font-bold text-slate-900 leading-tight">
        <div className="text-2xl tracking-wider font-extrabold uppercase">
          সীতাকুণ্ড পৌরসভা
        </div>
        <div className="text-base tracking-widest uppercase font-semibold text-slate-800 mt-0.5">
          SITAKUNDA MUNICIPALITY
        </div>
        <div className="text-xs text-slate-700 mt-1 font-medium">
          চট্টগ্রাম, বাংলাদেশ • {subText}
        </div>
        <div className="text-xs text-slate-900 mt-2 font-mono font-bold border-t border-b border-slate-700/40 py-0.5 px-3 inline-block">
          মুদ্রণের তারিখ: {currentDateStr} ({currentYearEng})
        </div>
      </div>
    </div>
  );
};
