import { 
  DemarcationApplication, 
  BuildingConstructionApplication, 
  RoadCuttingApplication 
} from '../types';
import { toBanglaNumber, formatBanglaDate } from './storage';

export type CsvModuleType = 'demarcation' | 'schedule1' | 'roadcutting';

export interface CsvColumnDefinition {
  key: string;
  label: string;
  category: 'applicant' | 'land_schedule' | 'construction' | 'approval_fees' | 'other';
  defaultSelected: boolean;
  getValue: (item: any) => string | number;
}

// =========================================================================
// 1. সীমানা নির্ধারণ ও ডিমার্কেশন প্রত্যয়ন ফরম (Demarcation Columns)
// =========================================================================
export const DEMARCATION_CSV_COLUMNS: CsvColumnDefinition[] = [
  {
    key: 'id',
    label: 'আবেদন ট্র্যাকিং আইডি',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.id || '',
  },
  {
    key: 'formNo',
    label: 'ফরম নম্বর',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.formNo || '',
  },
  {
    key: 'createdAt',
    label: 'আবেদনের তারিখ',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => formatBanglaDate(app.createdAt) || app.createdAt || '',
  },
  {
    key: 'applicantName',
    label: 'মূল আবেদনকারীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantName || (app as any).applicantName || '',
  },
  {
    key: 'applicantFatherHusband',
    label: 'পিতা/স্বামীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantFatherHusband || '',
  },
  {
    key: 'applicantMobile',
    label: 'মোবাইল নম্বর',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantMobile || (app as any).applicantMobile || '',
  },
  {
    key: 'applicantNid',
    label: 'জাতীয় পরিচয়পত্র (NID)',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantNid || (app as any).applicantNid || '',
  },
  {
    key: 'applicantPermanentAddress',
    label: 'স্থায়ী ঠিকানা',
    category: 'applicant',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantPermanentAddress || '',
  },
  {
    key: 'applicantPresentAddress',
    label: 'বর্তমান ঠিকানা',
    category: 'applicant',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.siteLocation?.applicantPresentAddress || '',
  },
  {
    key: 'holdingOrPlotNo',
    label: 'মৌজা ও হোল্ডিং/প্লট নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.holdingOrPlotNo || '',
  },
  {
    key: 'roadOrArea',
    label: 'রাস্তা / এলাকার নাম',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.siteLocation?.roadOrArea || '',
  },
  {
    key: 'wardNo',
    label: 'পৌর ওয়ার্ড নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.wardNo || app.siteLocation?.wardNo || '',
  },
  {
    key: 'mouzaName',
    label: 'মৌজার নাম',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.mouzaName || (app as any).mouzaName || '',
  },
  {
    key: 'jlNo',
    label: 'জে.এল. নং (J.L. No)',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.jlNo || '',
  },
  {
    key: 'bsKhatianNo',
    label: 'বি.এস খতিয়ান নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.bsKhatianNo || '',
  },
  {
    key: 'bsDagNo',
    label: 'বি.এস দাগ নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.bsDagNo || (app as any).bsDagNo || '',
  },
  {
    key: 'createdBsKhatianNo',
    label: 'সৃজিত বি.এস খতিয়ান নং',
    category: 'land_schedule',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.schedule?.createdBsKhatianNo || 'প্রযোজ্য নয়',
  },
  {
    key: 'rsKhatianNo',
    label: 'আর.এস খতিয়ান নং',
    category: 'land_schedule',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.schedule?.rsKhatianNo || '',
  },
  {
    key: 'rsDagNo',
    label: 'আর.এস দাগ নং',
    category: 'land_schedule',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.schedule?.rsDagNo || '',
  },
  {
    key: 'deedNo',
    label: 'দলিল নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.deedNo || '',
  },
  {
    key: 'deedDate',
    label: 'দলিল রেজিস্ট্রি তারিখ',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.deedDate || '',
  },
  {
    key: 'landArea',
    label: 'জমির পরিমাণ',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.landArea || '',
  },
  {
    key: 'landClass',
    label: 'জমির শ্রেণি',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.schedule?.landClass || '',
  },
  {
    key: 'boundaries',
    label: 'চৌহদ্দি (উ:দ:পূ:প)',
    category: 'land_schedule',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => {
      const s = app.schedule;
      if (!s) return '';
      return `উত্তর: ${s.boundaryNorth || '-'}, দক্ষিণ: ${s.boundarySouth || '-'}, পূর্ব: ${s.boundaryEast || '-'}, পশ্চিম: ${s.boundaryWest || '-'}`;
    },
  },
  {
    key: 'landOwners',
    label: 'ভূমির সকল মালিকগণের নাম ও তথ্য',
    category: 'applicant',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => {
      if (!app.landOwners || app.landOwners.length === 0) return app.siteLocation?.applicantName || '';
      return app.landOwners.map((o, idx) => `${idx + 1}. ${o.name} (পিতা/স্বামী: ${o.fatherOrHusbandName || '-'}, ঠিকানা: ${o.permanentAddress || '-'})`).join('; ');
    },
  },
  {
    key: 'constructionType',
    label: 'প্রস্তাবিত নির্মাণের ধরন',
    category: 'construction',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.proposedConstruction?.constructionType || (app as any).proposedStructureType || '',
  },
  {
    key: 'constructionPurpose',
    label: 'নির্মাণের উদ্দেশ্য',
    category: 'construction',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.proposedConstruction?.purpose || '',
  },
  {
    key: 'floorsCount',
    label: 'প্রস্তাবিত তলার সংখ্যা',
    category: 'construction',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.proposedConstruction?.floorsCount || '',
  },
  {
    key: 'applicationFee',
    label: 'সরকারি ফরম ফি (টাকা)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.applicationFee || 500,
  },
  {
    key: 'paymentMethod',
    label: 'পেমেন্ট মেথড / মাধ্যম',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.paymentMethod === 'counter_receipt' ? 'পৌর ক্যাশ রসিদ' : 'অনলাইন পেমেন্ট',
  },
  {
    key: 'moneyReceiptNo',
    label: 'পৌর ক্যাশ রশিদ নং',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => (app as any).moneyReceiptNo || '',
  },
  {
    key: 'moneyReceiptDate',
    label: 'রশিদ জমার তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => (app as any).moneyReceiptDate || '',
  },
  {
    key: 'status',
    label: 'আবেদনের বর্তমান অবস্থা (Status)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => {
      switch (app.status) {
        case 'pending': return 'অপেক্ষমান (Pending)';
        case 'under_review': return 'তদন্ত ও পরিদর্শনে (Under Review)';
        case 'investigating': return 'তদন্তাধীন (Investigating)';
        case 'approved': return 'অনুমোদিত / প্রত্যয়নপত্র প্রস্তুত (Approved)';
        case 'rejected': return 'বাতিল (Rejected)';
        default: return app.status || '';
      }
    },
  },
  {
    key: 'certificateNo',
    label: 'ডিমার্কেশন প্রত্যয়নপত্র নং',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (app: DemarcationApplication) => app.engineerApproval?.certificateNo || '',
  },
  {
    key: 'approvalDate',
    label: 'প্রত্যয়নপত্র ইস্যুর তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.engineerApproval?.approvalDate ? formatBanglaDate(app.engineerApproval.approvalDate) : '',
  },
  {
    key: 'draftsmanRemarks',
    label: 'নক্সাকার সরজমিন মন্তব্য',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (app: DemarcationApplication) => app.draftsmanReview?.remarks || '',
  },
];

// =========================================================================
// 2. ইমারত নির্মাণ অনুমোদন ফরম তফসিল-১ (Schedule-1 Columns)
// =========================================================================
export const SCHEDULE1_CSV_COLUMNS: CsvColumnDefinition[] = [
  {
    key: 'id',
    label: 'তফসিল-১ ট্র্যাকিং আইডি',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.id || '',
  },
  {
    key: 'formNo',
    label: 'তফসিল-১ ফরম নং',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.formNo || '',
  },
  {
    key: 'createdAt',
    label: 'দাখিলের তারিখ',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => formatBanglaDate(bApp.createdAt) || bApp.createdAt || '',
  },
  {
    key: 'demarcationTrackingId',
    label: 'সংযুক্ত ডিমার্কেশন ট্র্যাকিং আইডি',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.demarcationTrackingId || bApp.demarcationAppId || '',
  },
  {
    key: 'demarcationCertificateNo',
    label: 'সংযুক্ত ডিমার্কেশন সনদ নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.demarcationCertificateNo || '',
  },
  {
    key: 'applicantName',
    label: 'আবেদনকারীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantName || bApp.applicantDetails?.name || '',
  },
  {
    key: 'applicantFatherHusband',
    label: 'পিতা/স্বামীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantFatherHusband || bApp.applicantDetails?.fatherHusbandName || '',
  },
  {
    key: 'applicantMobile',
    label: 'মোবাইল নম্বর',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantMobile || bApp.applicantPhone || bApp.applicantDetails?.mobile || '',
  },
  {
    key: 'applicantNid',
    label: 'জাতীয় পরিচয়পত্র (NID)',
    category: 'applicant',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantNid || '',
  },
  {
    key: 'applicantPermanentAddress',
    label: 'স্থায়ী ঠিকানা',
    category: 'applicant',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantPermanentAddress || '',
  },
  {
    key: 'applicantPresentAddress',
    label: 'বর্তমান/যোগাযোগের ঠিকানা',
    category: 'applicant',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.applicantPresentAddress || '',
  },
  {
    key: 'mouzaName',
    label: 'মৌজার নাম',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.siteDetails?.mouzaName || bApp.mouzaBlockSector || bApp.plotDetails?.mouza || '',
  },
  {
    key: 'wardNo',
    label: 'পৌর ওয়ার্ড নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.siteDetails?.wardNo || bApp.wardNo || bApp.plotDetails?.wardNo || '',
  },
  {
    key: 'dagNo',
    label: 'দাগ নং (বি.এস/আর.এস)',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.siteDetails?.bsDag || bApp.dagKhatianPlotNo || bApp.plotDetails?.dagNo || '',
  },
  {
    key: 'khatianNo',
    label: 'খতিয়ান নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.siteDetails?.bsKhatian || bApp.plotDetails?.khatianNo || '',
  },
  {
    key: 'landArea',
    label: 'জমির পরিমাণ',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.siteAreaSize || bApp.plotDetails?.landArea || '',
  },
  {
    key: 'totalCoveredAreaSqM',
    label: 'মোট আচ্ছাদিত এরিয়া (বর্গমিটার)',
    category: 'construction',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.constructionDetails?.totalCoveredAreaSqM ? `${bApp.constructionDetails.totalCoveredAreaSqM} বর্গমিটার` : (bApp.coveredArea?.firstFloor || ''),
  },
  {
    key: 'floorsCount',
    label: 'প্রস্তাবিত তলার সংখ্যা',
    category: 'construction',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.constructionDetails?.floorsCount || bApp.floorsCount || '৩ তলা',
  },
  {
    key: 'buildingUsage',
    label: 'ব্যবহারের উদ্দেশ্য (আবাসিক/বাণিজ্যিক)',
    category: 'construction',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.constructionDetails?.buildingCategory === 'commercial' ? 'বাণিজ্যিক' : 'আবাসিক',
  },
  {
    key: 'sevenCopiesSubmitted',
    label: '৭ কপি নকশার ফর্দ জমা অবস্থা',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.sevenCopiesDrawingsSubmitted !== false ? 'জমা হয়েছে' : 'বাকি',
  },
  {
    key: 'sevenCopiesDate',
    label: 'নকশার ফর্দ জমার তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.sevenCopiesSubmittedDate || '',
  },
  {
    key: 'feeAmount',
    label: 'ইমারত অনুমোদন ফি (টাকা)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.feeAmount || 1000,
  },
  {
    key: 'treasuryCode',
    label: 'ট্রেজারী চালান কোড',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.treasuryCode || '১-২০৩১-০০০০-২৬৮১',
  },
  {
    key: 'chalanOrDraftNo',
    label: 'চালান / রসিদ নং',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => bApp.chalanOrDraftNo || bApp.moneyReceiptNo || '',
  },
  {
    key: 'chalanOrDraftDate',
    label: 'চালান জমা দেওয়ার তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.chalanOrDraftDate || bApp.moneyReceiptDate || '',
  },
  {
    key: 'architectName',
    label: 'প্রকৌশলী / স্থপতির নাম',
    category: 'construction',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.architectName || '',
  },
  {
    key: 'architectRegNo',
    label: 'স্থপতির আইইবি/আইএবি রেজি. নং',
    category: 'construction',
    defaultSelected: false,
    getValue: (bApp: BuildingConstructionApplication) => bApp.architectRegNo || '',
  },
  {
    key: 'status',
    label: 'আবেদনের অবস্থা (Status)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (bApp: BuildingConstructionApplication) => {
      switch (bApp.status) {
        case 'submitted': return 'দাখিলকৃত / অপেক্ষমান';
        case 'under_review': return 'নক্সা ও ফি যাচাইাধীন';
        case 'approved': return 'অনুমোদিত (Approved)';
        case 'rejected': return 'বাতিল (Rejected)';
        default: return bApp.status || '';
      }
    },
  },
];

// =========================================================================
// 3. রাস্তা কর্তন অনুমোদন ফরম (Road Cutting Columns)
// =========================================================================
export const ROADCUTTING_CSV_COLUMNS: CsvColumnDefinition[] = [
  {
    key: 'id',
    label: 'রাস্তা কর্তন ট্র্যাকিং আইডি',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.id || '',
  },
  {
    key: 'formNo',
    label: 'ফরম নং',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.formNo || '',
  },
  {
    key: 'createdAt',
    label: 'আবেদনের তারিখ',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => formatBanglaDate(rcApp.createdAt) || rcApp.createdAt || '',
  },
  {
    key: 'applicantName',
    label: 'আবেদনকারীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicantName || '',
  },
  {
    key: 'applicantFatherHusband',
    label: 'পিতা/স্বামীর নাম',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicantFatherHusband || '',
  },
  {
    key: 'applicantPhone',
    label: 'মোবাইল নম্বর',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicantPhone || '',
  },
  {
    key: 'applicantNid',
    label: 'জাতীয় পরিচয়পত্র (NID)',
    category: 'applicant',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicantNid || '',
  },
  {
    key: 'applicantAddress',
    label: 'যোগাযোগ ঠিকানা',
    category: 'applicant',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicantAddress || '',
  },
  {
    key: 'roadName',
    label: 'রাস্তার নাম ও অবস্থান',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.roadName || '',
  },
  {
    key: 'wardNo',
    label: 'পৌর ওয়ার্ড নং',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.wardNo || '',
  },
  {
    key: 'mouzaName',
    label: 'মৌজার নাম',
    category: 'land_schedule',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.mouzaName || '',
  },
  {
    key: 'roadTypeTitle',
    label: 'রাস্তার ধরন (কার্পেটিং/সিসি/এইচবিবি)',
    category: 'land_schedule',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.roadTypeTitle || rcApp.roadType || '',
  },
  {
    key: 'purposeTitle',
    label: 'কর্তনের উদ্দেশ্য',
    category: 'construction',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.purposeTitle || rcApp.purpose || '',
  },
  {
    key: 'cuttingLengthFt',
    label: 'কর্তনের দৈর্ঘ্য (ফুট)',
    category: 'construction',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.cuttingLengthFt || 0,
  },
  {
    key: 'cuttingWidthFt',
    label: 'কর্তনের প্রস্থ (ফুট)',
    category: 'construction',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.cuttingWidthFt || 0,
  },
  {
    key: 'cuttingDepthFt',
    label: 'কর্তনের গভীরতা (ফুট)',
    category: 'construction',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.cuttingDepthFt || 0,
  },
  {
    key: 'totalAreaSqFt',
    label: 'মোট আয়তন (বর্গফুট)',
    category: 'construction',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.totalAreaSqFt || ((rcApp.cuttingLengthFt || 0) * (rcApp.cuttingWidthFt || 0)),
  },
  {
    key: 'workDurationDays',
    label: 'কাজের সময়কাল (দিন)',
    category: 'construction',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.workDurationDays || 3,
  },
  {
    key: 'workStartDate',
    label: 'কাজ শুরুর তারিখ',
    category: 'construction',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.workStartDate || '',
  },
  {
    key: 'applicationFee',
    label: 'আবেদন ফরম ফি (টাকা)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.applicationFee || 100,
  },
  {
    key: 'paymentMethodTitle',
    label: 'পেমেন্ট মাধ্যম',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.paymentMethodTitle || 'পৌর ক্যাশ রসিদ',
  },
  {
    key: 'moneyReceiptNo',
    label: 'পৌর ক্যাশ রশিদ নং',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.moneyReceiptNo || '',
  },
  {
    key: 'moneyReceiptDate',
    label: 'রশিদ জমার তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.moneyReceiptDate || '',
  },
  {
    key: 'estimatedDamageFee',
    label: 'ধার্যকৃত ক্ষতিপূরণ ফি (টাকা)',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => (rcApp as any).estimatedDamageFee || 0,
  },
  {
    key: 'permitNo',
    label: 'অনুমতিপত্র নম্বর',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.permitNo || '',
  },
  {
    key: 'permitIssueDate',
    label: 'অনুমতিপত্র ইস্যুর তারিখ',
    category: 'approval_fees',
    defaultSelected: false,
    getValue: (rcApp: RoadCuttingApplication) => rcApp.permitIssueDate ? formatBanglaDate(rcApp.permitIssueDate) : '',
  },
  {
    key: 'status',
    label: 'আবেদনের অবস্থা (Status)',
    category: 'approval_fees',
    defaultSelected: true,
    getValue: (rcApp: RoadCuttingApplication) => {
      switch (rcApp.status) {
        case 'submitted': return 'দাখিলকৃত / অপেক্ষমান';
        case 'under_review': return 'তদন্ত ও পরিদর্শনে';
        case 'approved': return 'অনুমোদিত (Approved)';
        case 'rejected': return 'বাতিল (Rejected)';
        default: return rcApp.status || '';
      }
    },
  },
];

// Helper to get columns by module type
export function getColumnsForModule(moduleType: CsvModuleType): CsvColumnDefinition[] {
  switch (moduleType) {
    case 'demarcation':
      return DEMARCATION_CSV_COLUMNS;
    case 'schedule1':
      return SCHEDULE1_CSV_COLUMNS;
    case 'roadcutting':
      return ROADCUTTING_CSV_COLUMNS;
  }
}

// Escape cell value for standard CSV format
function escapeCsvCell(value: any, delimiter: string = ','): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  // If contains delimiter, double quote, or newline -> enclose in quotes and double internal quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export interface CsvFilterOptions {
  scope: 'all' | 'filtered' | 'selected';
  selectedIds?: string[];
  statusFilter?: string;
  wardFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  delimiter?: ',' | ';' | '\t';
  includeBanglaNumbers?: boolean;
}

// Generate CSV string from items and selected columns
export function generateCsvContent(
  items: any[],
  columns: CsvColumnDefinition[],
  selectedKeys: string[],
  delimiter: string = ','
): string {
  const activeCols = columns.filter((col) => selectedKeys.includes(col.key));
  
  if (activeCols.length === 0) {
    throw new Error('অনুগ্রহ করে অন্তত একটি কলাম নির্বাচন করুন');
  }

  // 1. Header row
  const headerRow = activeCols.map((col) => escapeCsvCell(col.label, delimiter)).join(delimiter);

  // 2. Data rows
  const dataRows = items.map((item) => {
    return activeCols
      .map((col) => {
        try {
          const val = col.getValue(item);
          return escapeCsvCell(val, delimiter);
        } catch {
          return '""';
        }
      })
      .join(delimiter);
  });

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

// Trigger browser download of CSV file
export function downloadCsvFile(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
