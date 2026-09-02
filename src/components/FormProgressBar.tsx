import React from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Check, 
  Sparkles,
  Receipt
} from 'lucide-react';
import { toBanglaNumber } from '../utils/storage';

export interface FormStep {
  id: number;
  sectionId: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ElementType;
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    sectionId: 'step-1',
    title: 'প্রস্তাবিত নির্মাণ',
    shortTitle: 'নির্মাণ বিবরণ',
    description: 'ভবন/স্থাপনার ধরন ও উদ্দেশ্য',
    icon: Building2,
  },
  {
    id: 2,
    sectionId: 'step-2',
    title: 'মালিকের তথ্য',
    shortTitle: 'মালিকানা',
    description: 'ভূমির মালিকগণের এনআইডি ও ঠিকানা',
    icon: Users,
  },
  {
    id: 3,
    sectionId: 'step-3',
    title: 'ভূমির তফসিল',
    shortTitle: 'তফসিল ও সীমানা',
    description: 'মৌজা, খতিয়ান, দাগ ও চতুঃসীমা',
    icon: MapPin,
  },
  {
    id: 4,
    sectionId: 'step-4',
    title: 'সাইট ও আবেদনকারী',
    shortTitle: 'আবেদনকারী',
    description: 'হোল্ডিং, রাস্তা ও যোগাযোগের বিবরণ',
    icon: FileText,
  },
  {
    id: 5,
    sectionId: 'step-5',
    title: 'কাগজপত্র ও ম্যাপ',
    shortTitle: 'সংযুক্তি',
    description: 'দলিল, খতিয়ান, কর রশিদ ও নক্সা',
    icon: Upload,
  },
  {
    id: 6,
    sectionId: 'step-6',
    title: 'সরকারি ফি পরিশোধ',
    shortTitle: 'ফি পেমেন্ট',
    description: 'পৌরসভা ক্যাশ কাউন্টারে জমা (১০০/-)',
    icon: Receipt,
  },
  {
    id: 7,
    sectionId: 'step-7',
    title: 'ঘোষণা ও দাখিল',
    shortTitle: 'চূড়ান্ত দাখিল',
    description: 'অঙ্গীকারনামা ও আবেদন জমা',
    icon: CheckCircle2,
  },
];

interface FormProgressBarProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number, sectionId: string) => void;
}

export const FormProgressBar: React.FC<FormProgressBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const progressPercent = Math.round(((completedSteps.length) / FORM_STEPS.length) * 100);
  const activeStepObj = FORM_STEPS.find((s) => s.id === currentStep) || FORM_STEPS[0];

  return (
    <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-200/80 p-3.5 sm:p-5 sticky top-20 z-20 backdrop-blur-md transition-all">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white font-bold text-xs shadow-xs">
            {toBanglaNumber(currentStep)}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700">
                ধাপ {toBanglaNumber(currentStep)} এর {toBanglaNumber(FORM_STEPS.length)}:
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {activeStepObj.title}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline-block">
              {activeStepObj.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 block">
              অগ্রগতি: {toBanglaNumber(progressPercent)}%
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {toBanglaNumber(completedSteps.length)}/{toBanglaNumber(FORM_STEPS.length)} ধাপ পূর্ণ
            </span>
          </div>
          <div className="w-20 sm:w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full relative"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            >
              <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Track & Steps Grid with Interactive Buttons */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {FORM_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;

          return (
            <button
              key={step.id}
              type="button"
              id={`step-tab-${step.id}`}
              onClick={() => onStepClick(step.id, step.sectionId)}
              className={`group flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600 shadow-xs scale-102'
                  : isCompleted
                  ? 'bg-slate-50 hover:bg-emerald-50/60 text-slate-700 hover:scale-101'
                  : 'bg-transparent hover:bg-slate-50 text-slate-400'
              }`}
            >
              {/* Step Circle Icon */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold mb-1 shadow-xs ${
                  isActive
                    ? 'bg-emerald-800 text-white ring-3 ring-emerald-300/80 ring-offset-1 scale-105'
                    : isCompleted
                    ? 'bg-emerald-600 text-white group-hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3] animate-fade-in-scale" />
                ) : (
                  <span>{toBanglaNumber(step.id)}</span>
                )}
              </div>

              {/* Title & Badge */}
              <span className={`text-[10px] sm:text-xs font-bold truncate max-w-full block leading-tight ${
                isActive ? 'text-emerald-950 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {step.shortTitle}
              </span>

              {/* Active Indicator Pin */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressBar;
