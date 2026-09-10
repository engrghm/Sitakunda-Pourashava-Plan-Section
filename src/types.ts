export interface LandOwner {
  id: string;
  name: string; // ভূমির মালিকের নাম *
  fatherOrHusbandName: string; // পিতা/স্বামীর নাম *
  permanentAddress: string; // স্থায়ী ঠিকানা *
  presentAddress: string; // বর্তমান ঠিকানা *
  sameAsPermanent?: boolean; // স্থায়ী ঠিকানা ও বর্তমান ঠিকানা একই
  nid?: string; // জাতীয় পরিচয়পত্র (NID) নম্বর * (১০ / ১৩ / ১৭ ডিজিট)
  email?: string; // ইমেইল ঠিকানা (ঐচ্ছিক)
  mobile?: string; // মোবাইল নম্বর (ঐচ্ছিক)
  ownershipShare?: string; // মালিকানার হিস্যা/অংশ
}

export interface ProposedConstruction {
  constructionType: string; // যেমন: বহুতল ভবন (Building) / সীমানা প্রাচীর / একতলা ভবন ইত্যাদি
  purpose: string; // নির্মাণের উদ্দেশ্য ও সংক্ষিপ্ত বিবরণ *
  floorsCount?: string; // প্রস্তাবিত তলার সংখ্যা (যেমন: ১, ২, ৩)
  buildingCategory?: 'residential' | 'commercial' | string; // ভবন/স্থাপনার শ্রেণী (আবাসিক / বাণিজ্যিক)
  estimatedAreaSqFt?: string; // প্রস্তাবিত আয়তন (বর্গফুট)
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  addressText?: string;
  pinnedOnMap?: boolean;
}

export interface LandSchedule {
  mouzaName: string; // দক্ষিণ টেরিয়াইল, শিবপুর, ইয়াকুব নগর, আমিরাবাদ, মহাদেবপুর, সীতাকুণ্ড, জঙ্গল সীতাকুণ্ড, জঙ্গল মহাদেবপুর
  jlNo: string; // 13, 19, 20, 25, 27, 28, 29, 30
  wardNo: string; // ১ নং ওয়ার্ড - ৯ নং ওয়ার্ড
  deedNo: string; // দলিল নং *
  deedDate: string; // দলিল রেজিস্ট্রি তারিখ *
  createdBsKhatianNo: string; // সৃজিত বি.এস খতিয়ান নং
  bsKhatianNo: string; // বি.এস খতিয়ান নং *
  bsDagNo: string; // বি.এস দাগ নং *
  rsKhatianNo?: string; // আর.এস খতিয়ান নং
  rsDagNo?: string; // আর.এস দাগ নং
  landArea: string; // জমির পরিমাণ (শতাংশ/ডেসিমেল) *
  landClass: string; // জমির শ্রেণি (নাল/ভিটি/বাস্তু/বাণিজ্যিক) *
  boundaryNorth: string; // উত্তর সীমানা
  boundarySouth: string; // দক্ষিণ সীমানা
  boundaryEast: string; // পূর্ব সীমানা
  boundaryWest: string; // পশ্চিম সীমানা
  geoCoordinates?: GeoCoordinates; // ভৌগোলিক স্থানাঙ্ক (ম্যাপ লোকেশন)
}

export interface SiteLocation {
  holdingOrPlotNo: string; // মৌজা ও হোল্ডিং নং / প্লট নং *
  roadOrArea: string; // রাস্তা / এলাকার নাম *
  wardNo: string; // ওয়ার্ড নং *
  landmark?: string; // নিকটবর্তী পরিচিত স্থান / ল্যান্ডমার্ক
  applicantName: string; // আবেদনকারীর নাম *
  applicantFatherHusband: string; // পিতা/স্বামীর নাম *
  applicantPermanentAddress: string; // স্থায়ী ঠিকানা * (Mandatory)
  applicantPresentAddress: string; // বর্তমান ঠিকানা *
  applicantMobile: string; // মোবাইল নম্বর *
  applicantNid: string; // জাতীয় পরিচয়পত্র (NID) *
  applicantEmail?: string; // ইমেইল
  geoCoordinates?: GeoCoordinates; // ভৌগোলিক স্থানাঙ্ক
}

export interface UploadedDocument {
  id: string;
  docType: string;
  docTitle: string;
  fileName: string;
  fileSize: number; // in bytes (max 2MB = 2097152 bytes)
  fileUrl?: string;
  uploadDate: string;
  isMandatory: boolean;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'investigating' | 'approved' | 'rejected';

export interface OfficerUser {
  username: string;
  role: 'admin' | 'super_admin' | 'draftsman' | 'assistant_engineer' | 'executive_engineer' | 'mayor';
  roleTitleBangla: string;
  title?: string;
  name: string;
  designation: string;
}

export interface DraftsmanReview {
  demarcationPdf?: { fileName: string; dataUrl: string; uploadedAt: string };
  reviewerName?: string;
  designation: string; // পৌরসভা নক্সাকার (সিভিল)
  reviewDate: string;
  remarks: string;
  isSiteInspected?: boolean;
  inspectionDate?: string;
  boundaryClearance?: 'clear' | 'disputed' | 'under_survey';
  fieldReportDetails?: string;
  geoCoordinates?: GeoCoordinates; // নক্সাকার কর্তৃক সরজমিন চিহ্নিত ভৌগোলিক স্থানাঙ্ক
}

export interface EngineerApproval {
  officerName?: string;
  designation: string; // সহকারী প্রকৌশলী / নির্বাহী প্রকৌশলী / পৌর কর্তৃপক্ষ
  approvalDate: string;
  approved: boolean;
  certificateNo?: string;
  memoNo?: string;
  finalRemarks?: string;
}

export interface NotificationPreferences {
  notifySms: boolean;
  notifyEmail: boolean;
}

export interface PaymentDetails {
  method: 'eps' | 'counter' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card';
  methodNameBangla: string;
  trxId?: string;
  accountNumber?: string;
  amount: number;
  paidAt?: string;
  status: 'paid' | 'pending' | 'unpaid';
  moneyReceiptNo?: string; // পৌরসভা ক্যাশ রশিদ নম্বর (ঐচ্ছিক)
  moneyReceiptDate?: string; // রশিদ জমার তারিখ
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'sms' | 'email' | 'both';
  recipientPhone?: string;
  recipientEmail?: string;
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'simulated';
}

export interface StatusHistoryItem {
  id: string;
  timestamp: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  statusTitle: string;
  updatedBy: string;
  designation: string;
  remarks?: string;
  actionType?: string; // 'status_change' | 'internal_note' | 'inspection_scheduled' | 'certificate_issued'
  inspectionDetails?: string;
  certificateNo?: string;
}

export interface ApplicationDraftData {
  lastSavedAt: string;
  currentStep?: number;
  constructionType: string;
  customConstructionType?: string;
  floorsCount?: string;
  buildingCategory?: 'residential' | 'commercial';
  purpose: string;
  estimatedAreaSqFt?: string;
  landOwners: LandOwner[];
  mouzaName: string;
  jlNo: string;
  scheduleWardNo: string;
  deedNo: string;
  deedDate: string;
  createdBsKhatianNo: string;
  bsKhatianNo: string;
  bsDagNo: string;
  rsKhatianNo: string;
  rsDagNo: string;
  landArea: string;
  landClass: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  holdingOrPlotNo: string;
  roadOrArea: string;
  siteWardNo: string;
  landmark: string;
  applicantSameAsFirstOwner: boolean;
  applicantPresentSameAsPermanent: boolean;
  applicantName: string;
  applicantFatherHusband: string;
  applicantPermanentAddress: string;
  applicantPresentAddress: string;
  applicantMobile: string;
  applicantNid: string;
  applicantEmail: string;
  notifySms: boolean;
  notifyEmail: boolean;
  uploadedDocs: { [key: string]: UploadedDocument };
  paymentDetails: PaymentDetails;
  declared: boolean;
}

export interface DemarcationApplication {
  id: string; // e.g. "SKM-DEM-2026-0841"
  formNo?: string; // e.g. "SKM-FORM-849201"
  createdAt: string;
  status: ApplicationStatus;
  proposedConstruction: ProposedConstruction;
  landOwners: LandOwner[];
  schedule: LandSchedule;
  siteLocation: SiteLocation;
  documents: UploadedDocument[];
  feeAmount: number; // 100 or 600
  feeStatus: 'unpaid' | 'paid'; // 'unpaid' = অপরিশোধিত, 'paid' = পরিশোধিত
  moneyReceiptNo?: string; // পৌরসভা ক্যাশ রশিদ নম্বর (ঐচ্ছিক)
  moneyReceiptDate?: string; // রশিদ জমার তারিখ
  paymentDetails?: PaymentDetails;
  draftsmanReview?: DraftsmanReview;
  engineerApproval?: EngineerApproval;
  declaredByApplicant?: boolean;
  declarationDate?: string;
  notificationPreferences?: NotificationPreferences;
  notificationLogs?: NotificationLog[];
  statusHistory?: StatusHistoryItem[];

  // Compatibility fields for legacy views and server
  applicantName?: string;
  applicantEmail?: string;
  applicantMobile?: string;
  mouzaName?: string;
  bsDagNo?: string;
  applicationDate?: string;
  adminRemarks?: string;
  formPrice?: number;
  proposedStructureType?: string;
  [key: string]: any;
}

export const VALID_MOUZAS = [
  { name: 'দক্ষিণ টেরিয়াইল', jlNo: '13' },
  { name: 'শিবপুর', jlNo: '19' },
  { name: 'ইয়াকুব নগর', jlNo: '20' },
  { name: 'আমিরাবাদ', jlNo: '25' },
  { name: 'মহাদেবপুর', jlNo: '27' },
  { name: 'সীতাকুণ্ড', jlNo: '28' },
  { name: 'জঙ্গল সীতাকুণ্ড', jlNo: '29' },
  { name: 'জঙ্গল মহাদেবপুর', jlNo: '30' },
] as const;

export const VALID_JL_NUMBERS = ['13', '19', '20', '25', '27', '28', '29', '30'] as const;

export const VALID_WARDS = [
  '১ নং ওয়ার্ড',
  '২ নং ওয়ার্ড',
  '৩ নং ওয়ার্ড',
  '৪ নং ওয়ার্ড',
  '৫ নং ওয়ার্ড',
  '৬ নং ওয়ার্ড',
  '৭ নং ওয়ার্ড',
  '৮ নং ওয়ার্ড',
  '৯ নং ওয়ার্ড',
] as const;

export const CONSTRUCTION_TYPES = [
  'বহুতল ভবন (Building)',
  'সীমানা প্রাচীর (Boundary Wall)',
  'আধাপাকা ভবন (Semi-Pucca Structure)',
  'একতলা ভবন (Single Story Building)',
  'বাণিজ্যিক মার্কেট / কমপ্লেক্স (Commercial Complex)',
  'শিল্প কারখানা / গুদাম ঘর (Industrial / Warehouse)',
  'সীমানা চিহ্নিতকরণ ও ডিমার্কেশন (Boundary Demarcation)',
  'অন্যান্য স্থাপনা নির্মাণ (Other Structure)',
] as const;

export const LAND_CLASSES = [
  'বাস্তু / ভিটি',
  'নাল',
  'বাণিজ্যিক',
  'চালা',
  'ডোবা / পুকুর',
  'বাগান',
  'অন্যান্য',
] as const;

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'status_change'
  | 'internal_note'
  | 'inspection_scheduled'
  | 'certificate_issued'
  | 'password_changed'
  | 'application_edited'
  | 'csv_exported'
  | 'bulk_print'
  | 'pdf_exported'
  | 'schedule1_applied'
  | 'schedule1_treasury_updated';

export interface BuildingConstructionApplication {
  id: string; // e.g. "SKM-BCA-2026-0912"
  formNo: string; // e.g. "SKM-SCH1-94821"
  createdAt: string;
  
  // Prerequisite Demarcation Verification
  demarcationAppId?: string; // e.g. "SKM-DEM-2026-0841"
  demarcationTrackingId?: string;
  demarcationFormNo?: string; // e.g. "SKM-FORM-849201"
  demarcationCertificateNo?: string; // e.g. "SKM/ENG/DEM/2026-0841"
  certificateIssueDate?: string;
  activityType: 'building' | 'pond' | 'hill_cutting' | 'demolition' | string;
  activityTypeTitle: string; // 'ইমারত নির্মাণ' / 'পুকুর খনন' / 'পাহাড় কর্তন বা ধ্বংস সাধন'

  // ১। আবেদনকারীগণের পূর্ণ নাম
  applicantName: string;
  applicantFatherHusband?: string;
  applicantDetails?: any;

  // ২। আবেদনকারীগণের পূর্ণ ঠিকানা
  applicantPresentAddress?: string; // (ক) বর্তমান/ডাকযোগাযোগের ঠিকানা
  applicantPermanentAddress?: string; // (খ) স্থায়ী ঠিকানা
  applicantPhone?: string;
  applicantMobile?: string;
  applicantNid?: string;
  applicantEmail?: string;

  // ৩। যে দাগের জমিতে ইমারত নির্মাণ/পুকুর খনন/পাহাড় কর্তন বা ধ্বংস সাধন করা হইবে উহার বিবরণ
  siteAreaName?: string; // (ক) সিটি কর্পোরেশন/পৌরসভা/গ্রাম/মহল্লা/উন্নয়নকৃত এলাকার নাম
  dagKhatianPlotNo?: string; // (খ) দাগ ও খতিয়ান নং (জরিপ মোতাবেক)/প্লট নং
  mouzaBlockSector?: string; // (গ) মৌজার নাম/ব্লক নং/সেক্টর নং
  wardNo?: string; // (ঘ) ওয়ার্ড নং (প্রযোজ্য ক্ষেত্রে)
  roadName?: string; // (ঙ) রাস্তার নাম
  sheetNo?: string; // (চ) সিট নং (প্রযোজ্য ক্ষেত্রে)
  applicantShare?: string; // (ছ) দাগে আবেদনকারী/আবেদনকারীগণের অংশের পরিমাণ
  landAcquisitionSource?: string; // (জ) কি সূত্রে সাইটের জমি অর্জন করিয়াছেন (মালিকানার প্রমানপত্র)

  // ৪। সাইটের বিবরণ
  siteAreaSize?: string; // (ক) সাইটের আয়তন (ক্ষেত্রফল)
  siteBoundaries?: { // (খ) সাইটের চৌহদ্দী (বাহুর পরিমাণ)
    north: string; // উত্তরে
    south: string; // দক্ষিণে
    east: string; // পূর্বে
    west: string; // পশ্চিমে
  };
  coveredArea?: { // (গ) ইমরাত দ্বারা সাইটের যে পরিমাণ স্থান আচ্ছাদিত হইবে তাহার বিশদ বিবরণ
    firstFloor: string; // ১ম তলা
    otherFloors: string; // অন্যান্য তলা
  };
  nearestRoad?: { // (ঘ) সাইটের নিকটস্থ রাস্তার বিবরণ
    name: string; // (১) নাম
    position: string; // (২) অবস্থান (কোনদিকে)
    distance: string; // (৩) দূরত্ব
    width: string; // (৪) বিস্তার
  };
  roadAccessWay?: string; // (ঙ) নিকটস্থ রাস্তা হইতে সাইটে যাতায়াতের উপায়
  setbacks?: { // (চ) সাইটের বিভিন্ন দিকে যে পরিমাণ স্থান উন্মুক্ত রাখা হইবে
    north: string; // উত্তর সীমানা হইতে
    south: string; // দক্ষিণ সীমানা হইতে
    east: string; // পূর্ব সীমানা হইতে
    west: string; // পশ্চিম সীমানা হইতে
  };

  // ৫। সাইটের পূর্ব নির্মিত কাঁচা/পাঁকা ইমারতের (যদি থাকে) বিবরণ
  existingStructureCountAndArea?: string; // (ক) পূর্ব নির্মিত ইমারতের সংখ্যা ও তদ্বারা বেষ্টিত স্থানের পরিমান
  demolitionRequiredDetails?: string; // (খ) প্রস্তাবিত ইমারত নির্মাণ অনুমোদিত হইলে কোন অংশ ভাঙ্গিতে হইবে কিনা এবং হইলে স্থানের পরিমাণ

  // ৬। এলাকার বিভিন্ন সেবা-সুযোগের বিবরণ
  utilities?: {
    electricity: boolean; // (ক) বিদ্যুৎ সরবরাহ লাইন আছে কিনা
    water: boolean; // (খ) পানি সরবরাহ লাইন আছে কিনা
    gas: boolean; // (গ) গ্যাস সরবরাহ লাইন আছে কিনা
    sewerage: boolean; // (ঘ) পয়ঃনিষ্কাশন লাইন আছে কিনা
    septicTank: boolean; // (ঙ) প্রস্তাবিত ইমারতের ক্ষেত্রে সেপ্টিক ট্যাংকের ব্যবস্থা আছে কিনা
  };

  // ৭। কাজ কখন শুরু হইবে
  workStartDate?: string;

  // ৮। প্রস্তাবিত ইমারত নির্মাণ/পুকুর খনন/পাহাড় কর্তন বা ধ্বংস সাধনের উদ্দেশ্য
  purpose?: string;

  // ৯। অথরাইজড অফিসারের নোটিশ
  priorNoticeIssued?: boolean;
  priorNoticeDetails?: string;

  // ১০। সেকশন ১২ এর অধীন মামলা
  legalCaseFiled?: boolean;
  legalCaseDetails?: string;

  // ১১। প্রস্তাবিত পুকুর খনন/পাহাড় কর্তন বা ধ্বংস সাধনের স্থান হইতে নিকটবর্তী দূরত্ব
  activityDistances?: {
    roadDistance: string; // (ক) রাস্তার দূরত্ব
    buildingDistance: string; // (খ) ইমারতের দূরত্ব
    drainDistance: string; // (গ) পয়ঃ নালার দূরত্ব
    electricLineDistance: string; // (ঘ) বিদ্যুৎ সরবরাহ লাইনের দূরত্ব
    gasLineDistance: string; // (ঙ) গ্যাস সরবরাহ লাইনের দূরত্ব
  };

  // ফি ও পেমেন্ট (১. আবেদন ফি ১০০০/- ফিক্সড; ২. ইমারত নির্মাণ ফি + ১৫% ভ্যাট = মোট চালান)
  applicationFeeAmount?: number; // ২। ইমারত নির্মাণ আবেদন ফি (ফিক্সড ১,০০০/- টাকা, ভ্যাট প্রযোজ্য নহে)
  applicationFeeStatus?: 'paid' | 'unpaid'; // আবেদন ফি জমার অবস্থা
  applicationFeeReceiptNo?: string; // আবেদন ফি ক্যাশ রসিদ নং / ট্রানজেকশন নং
  applicationFeeReceiptDate?: string; // আবেদন ফি জমার তারিখ
  applicationFeePaymentMethod?: string; // আবেদন ফি জমার মাধ্যম (ক্যাশ কাউন্টার / অনলাইন)

  // ৩। ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ
  buildingPermitFeeAmount?: number; // ইমারত নির্মাণ ফি (টাকা) - নক্সাকার কর্তৃক সম্পাদিত
  vatAmount?: number; // ১৫% সরকারি ভ্যাট (টাকা) - নক্সাকার কর্তৃক সম্পাদিত
  vatPercent?: number; // ভ্যাট শতকরা হার (ডিফল্ট ১৫%)
  feeAmount: number; // সর্বমোট ফি / চালান জমার পরিমাণ (টাকা) (ইমারত নির্মাণ ফি + ১৫% ভ্যাট)
  feeStatus: 'paid' | 'unpaid';
  paymentMethod: 'online' | 'counter_receipt' | 'bank_draft' | 'pay_order' | 'chalan' | string;
  paymentMethodTitle: string;
  bankName?: string;
  branchName?: string;
  chalanOrDraftNo?: string;
  chalanOrDraftDate?: string;
  trxId?: string;
  moneyReceiptNo?: string; // পৌরসভা ক্যাশ রসিদ নম্বর
  moneyReceiptDate?: string; // রসিদ জমার তারিখ
  treasuryCode?: string; // সরকারি ট্রেজারী কোড (যেমন ১-২০৩১-০০০০-২৬৮১)

  // ১৫% ভ্যাট আলাদা ট্রেজারী চালানে জমার অপশন
  hasSeparateVatChalan?: boolean; // ভ্যাটের চালান কি আলাদাভাবে দাখিল করা হয়েছে?
  vatChalanNo?: string; // পৃথক ভ্যাট ট্রেজারী চালান নম্বর
  vatChalanDate?: string; // ভ্যাট চালান জমার তারিখ
  vatBankName?: string; // ভ্যাট জমার ব্যাংক
  vatBranchName?: string; // ভ্যাট জমার শাখা
  vatEconomicCode?: string; // ভ্যাট ট্রেজারী কোড (যেমন ১-১১৩৩-০০১০-০৩১১)

  treasuryVerifiedBy?: string; // নক্সাকারের নাম ও আইডি
  treasuryVerifiedAt?: string; // নক্সাকার এন্ট্রির তারিখ/সময়
  attachedDrawingsDescription?: string;
  submittedDocuments?: {
    sevenCopiesDrawings?: boolean;
    soilTestOriginal?: boolean;
    engineerAffidavitStamp?: boolean;
    ownerAffidavitStamp?: boolean;
    loadBearingCertificate?: boolean;
    others?: boolean;
    othersDetails?: string;
  };

  // নক্সাকার কর্তৃক ২ দফা ডাটা আপডেট:
  // ১। ৭ কপি নকশার ফর্দ জমা দিয়েছে কি না
  sevenCopiesDrawingsSubmitted?: boolean;
  sevenCopiesSubmittedDate?: string;
  sevenCopiesDrawingsDetails?: string;

  // ২। ইমারত নির্মাণ ফি জমা করেছে কি না ও তার টোটাল বিবরণ (উপরে feeStatus, chalanOrDraftNo ইত্যাদির সাথে সংশ্লিষ্ট)
  feeSubmittedConfirmed?: boolean;

  declarationAccepted: boolean;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  architectName?: string;
  architectDesignation?: string;
  architectRegNo?: string;
  architectPhone?: string;
  siteDetails?: any;
  constructionDetails?: any;
  [key: string]: any;
}

export interface SystemAuditLogItem {
  id: string;
  timestamp: string;
  officerUsername: string;
  officerName: string;
  officerRole: string;
  officerDesignation: string;
  actionType: AuditActionType;
  actionTitle: string;
  targetId?: string; // Application ID or form number
  applicantName?: string;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface RoadCuttingApplication {
  id: string; // e.g. "SKM-RC-2026-0042"
  formNo?: string; // e.g. "SKM-RC-FORM-9012"
  createdAt: string;
  applicantName: string;
  applicantFatherHusband: string;
  applicantPhone: string;
  applicantNid?: string;
  applicantAddress: string;
  roadName: string;
  wardNo: string;
  mouzaName?: string;
  purpose: 'water_connection' | 'gas_connection' | 'drainage' | 'electricity' | 'telecom' | 'sewerage' | 'other' | string;
  purposeTitle: string;
  roadType: 'carpeting' | 'cc_rcc' | 'hbb' | 'earthen' | string;
  roadTypeTitle: string;
  cuttingLengthFt: number; // দৈর্ঘ্য (ফুট)
  cuttingWidthFt: number; // প্রস্থ (ফুট)
  cuttingDepthFt?: number; // গভীরতা (ফুট)
  totalAreaSqFt: number; // মোট ক্ষেত্রফল (বর্গফুট)
  ratePerSqFt: number; // প্রতি বর্গফুট পুনঃনির্মাণ ক্ষতিপূরণ ফি
  restorationFee: number; // রাস্তা পুনঃনির্মাণ ক্ষতিপূরণ ফি
  applicationFee: number; // আবেদন ফি (৳ ৫০০/-)
  totalAmount: number; // সর্বমোট ফি
  workDurationDays: number; // কাজের মেয়াদকাল (দিন)
  workStartDate: string;
  workEndDate: string;
  paymentMethod: 'counter_receipt' | 'online' | string;
  paymentMethodTitle: string;
  moneyReceiptNo?: string;
  moneyReceiptDate?: string;
  chalanOrDraftNo?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  permitNo?: string;
  permitIssueDate?: string;
  officerRemarks?: string;
  declarationAccepted: boolean;
}

export type LandApplication = DemarcationApplication;

export interface Address {
  villageOrRoad?: string;
  villageOrMahalla?: string;
  wardNo?: string;
  upOrPourashava?: string;
  thana?: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  [key: string]: any;
}

export interface Attachment {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  url?: string;
  [key: string]: any;
}

export interface DatabaseSchemaDetail {
  tableName: string;
  description: string;
  columns: any[];
}

