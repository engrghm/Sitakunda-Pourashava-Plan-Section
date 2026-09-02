import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  MapPin, 
  Upload, 
  CheckSquare, 
  Plus, 
  Trash2, 
  AlertCircle, 
  FileText, 
  CheckCircle,
  CheckCircle2,
  FileCheck2,
  ChevronDown,
  X,
  Bell,
  Smartphone,
  Mail,
  ShieldCheck,
  Save,
  BookmarkCheck,
  History,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { FormProgressBar } from './FormProgressBar';
import { PaymentGatewayStep } from './PaymentGatewayStep';
import { 
  DemarcationApplication, 
  LandOwner, 
  VALID_MOUZAS, 
  VALID_JL_NUMBERS, 
  VALID_WARDS, 
  CONSTRUCTION_TYPES, 
  LAND_CLASSES,
  UploadedDocument,
  StatusHistoryItem,
  PaymentDetails,
  ApplicationDraftData
} from '../types';
import { 
  generateTrackingId, 
  generateFormNumber, 
  saveApplication, 
  toBanglaNumber,
  saveDraft,
  getSavedDraft,
  clearSavedDraft,
  hasSavedDraft,
  formatBanglaDate
} from '../utils/storage';
import { sendAutomatedStatusAlert } from '../utils/notificationService';

interface NewApplicationFormProps {
  onApplicationSubmitted: (app: DemarcationApplication) => void;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/[০-৯]/g, (d) => banglaDigits.indexOf(d).toString());
};

interface DocumentConfig {
  key: string;
  title: string;
  isMandatory: boolean;
  errorKey?: string;
  accept?: string;
}

const REQUIRED_DOCUMENTS_LIST: DocumentConfig[] = [
  {
    key: 'nid_passport',
    title: 'জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন সনদ/পাসপোর্টের ফটোকপি',
    isMandatory: true,
    errorKey: 'doc_nid_passport',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'photo',
    title: 'ছবি (পাসপোর্ট সাইজ)',
    isMandatory: true,
    errorKey: 'doc_photo',
    accept: '.jpg,.jpeg,.png',
  },
  {
    key: 'created_bs_khatian',
    title: 'সৃজিত বি.এস খতিয়ান এর ফটোকপি',
    isMandatory: true,
    errorKey: 'doc_created_bs_khatian',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'deed',
    title: 'খরিদা/হেবা/দানপত্র/বণ্টননামা দলিল (রেজিস্ট্রিকৃত) এর ফটোকপি',
    isMandatory: true,
    errorKey: 'doc_deed',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'tax_receipt',
    title: 'হাল সনের ভূমি উন্নয়ন কর (খাজনা) দাখিলা',
    isMandatory: true,
    errorKey: 'doc_tax_receipt',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'holding_tax',
    title: 'হোল্ডিং কর পরিশোধের হালনাগাদ রশিদের ফটোকপি',
    isMandatory: true,
    errorKey: 'doc_holding_tax',
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'rs_khatian',
    title: 'আর.এস খতিয়ান এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'bs_khatian',
    title: 'বি.এস খতিয়ান এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'mouza_map',
    title: 'মৌজা ম্যাপ এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'warishan',
    title: 'ওয়ারিশান সনদপত্র এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'noc',
    title: 'অনাপত্তি পত্র (দাগের অন্যান্য মালিকগণের) এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'it_return',
    title: 'আয়কর ই-রিটার্ন সার্টিফিকেট',
    isMandatory: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
];

export const NewApplicationForm: React.FC<NewApplicationFormProps> = ({ onApplicationSubmitted }) => {
  // 1. Proposed Construction
  const [constructionType, setConstructionType] = useState<string>(CONSTRUCTION_TYPES[0]);
  const [customConstructionType, setCustomConstructionType] = useState<string>('');
  const [floorsCount, setFloorsCount] = useState<string>('১');
  const [buildingCategory, setBuildingCategory] = useState<'residential' | 'commercial'>('residential');
  const [purpose, setPurpose] = useState<string>('');
  const [estimatedAreaSqFt, setEstimatedAreaSqFt] = useState<string>('');

  const isFloorCountApplicable =
    !constructionType.includes('সীমানা প্রাচীর') &&
    !constructionType.includes('আধাপাকা') &&
    !constructionType.includes('একতলা') &&
    !constructionType.includes('সীমানা চিহ্নিতকরণ');

  // 2. Land Owners (1 to 100)
  const [landOwners, setLandOwners] = useState<LandOwner[]>([
    {
      id: 'owner-1',
      name: '',
      fatherOrHusbandName: '',
      nid: '',
      email: '',
      permanentAddress: '',
      presentAddress: '',
      sameAsPermanent: false,
    },
  ]);

  // 3. Land Schedule (তফসিল)
  const [mouzaName, setMouzaName] = useState<string>(VALID_MOUZAS[0].name);
  const [jlNo, setJlNo] = useState<string>(VALID_MOUZAS[0].jlNo);
  const [scheduleWardNo, setScheduleWardNo] = useState<string>(VALID_WARDS[0]);
  const [deedNo, setDeedNo] = useState<string>('');
  const [deedDate, setDeedDate] = useState<string>('');
  const [createdBsKhatianNo, setCreatedBsKhatianNo] = useState<string>('');
  const [bsKhatianNo, setBsKhatianNo] = useState<string>('');
  const [bsDagNo, setBsDagNo] = useState<string>('');
  const [rsKhatianNo, setRsKhatianNo] = useState<string>('');
  const [rsDagNo, setRsDagNo] = useState<string>('');
  const [landArea, setLandArea] = useState<string>('');
  const [landClass, setLandClass] = useState<string>(LAND_CLASSES[0]);
  const [boundaryNorth, setBoundaryNorth] = useState<string>('');
  const [boundarySouth, setBoundarySouth] = useState<string>('');
  const [boundaryEast, setBoundaryEast] = useState<string>('');
  const [boundaryWest, setBoundaryWest] = useState<string>('');

  // 4. Site Address & Applicant Info
  const [holdingOrPlotNo, setHoldingOrPlotNo] = useState<string>('');
  const [roadOrArea, setRoadOrArea] = useState<string>('');
  const [siteWardNo, setSiteWardNo] = useState<string>(VALID_WARDS[0]);
  const [landmark, setLandmark] = useState<string>('');
  const [applicantSameAsFirstOwner, setApplicantSameAsFirstOwner] = useState<boolean>(false);
  const [applicantPresentSameAsPermanent, setApplicantPresentSameAsPermanent] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantFatherHusband, setApplicantFatherHusband] = useState<string>('');
  const [applicantPermanentAddress, setApplicantPermanentAddress] = useState<string>('');
  const [applicantPresentAddress, setApplicantPresentAddress] = useState<string>('');
  const [applicantMobile, setApplicantMobile] = useState<string>('');
  const [applicantNid, setApplicantNid] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');

  // Notification Preferences (SMS & Email alerts)
  const [notifySms, setNotifySms] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);

  // 5. Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: UploadedDocument }>({});
  const [fileError, setFileError] = useState<string | null>(null);

  // 6. Payment Details (Mock Payment Gateway - Cash Counter)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'counter',
    methodNameBangla: 'পৌরসভা ক্যাশ কাউন্টার (অফলাইন)',
    amount: 100,
    status: 'unpaid',
  });

  // 7. Declaration
  const [declared, setDeclared] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Draft Management State
  const [draftNotice, setDraftNotice] = useState<ApplicationDraftData | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const isInitialMount = useRef<boolean>(true);

  // Check for saved draft on initial mount
  useEffect(() => {
    const existingDraft = getSavedDraft();
    if (existingDraft && existingDraft.applicantName) {
      setDraftNotice(existingDraft);
    }
  }, []);

  // Construct draft object from current state
  const getCurrentDraftData = (): ApplicationDraftData => {
    return {
      lastSavedAt: new Date().toISOString(),
      constructionType,
      customConstructionType,
      floorsCount,
      buildingCategory,
      purpose,
      estimatedAreaSqFt,
      landOwners,
      mouzaName,
      jlNo,
      scheduleWardNo,
      deedNo,
      deedDate,
      createdBsKhatianNo,
      bsKhatianNo,
      bsDagNo,
      rsKhatianNo,
      rsDagNo,
      landArea,
      landClass,
      boundaryNorth,
      boundarySouth,
      boundaryEast,
      boundaryWest,
      holdingOrPlotNo,
      roadOrArea,
      siteWardNo,
      landmark,
      applicantSameAsFirstOwner,
      applicantPresentSameAsPermanent,
      applicantName,
      applicantFatherHusband,
      applicantPermanentAddress,
      applicantPresentAddress,
      applicantMobile,
      applicantNid,
      applicantEmail,
      notifySms,
      notifyEmail,
      uploadedDocs,
      paymentDetails,
      declared,
      currentStep,
    };
  };

  // Restore saved draft into state
  const handleRestoreDraft = () => {
    if (!draftNotice) return;
    try {
      if (draftNotice.constructionType) setConstructionType(draftNotice.constructionType);
      if (draftNotice.customConstructionType !== undefined) setCustomConstructionType(draftNotice.customConstructionType);
      if (draftNotice.floorsCount) setFloorsCount(draftNotice.floorsCount);
      if (draftNotice.buildingCategory) setBuildingCategory(draftNotice.buildingCategory);
      if (draftNotice.purpose !== undefined) setPurpose(draftNotice.purpose);
      if (draftNotice.estimatedAreaSqFt !== undefined) setEstimatedAreaSqFt(draftNotice.estimatedAreaSqFt);
      if (draftNotice.landOwners && draftNotice.landOwners.length > 0) setLandOwners(draftNotice.landOwners);
      if (draftNotice.mouzaName) setMouzaName(draftNotice.mouzaName);
      if (draftNotice.jlNo) setJlNo(draftNotice.jlNo);
      if (draftNotice.scheduleWardNo) setScheduleWardNo(draftNotice.scheduleWardNo);
      if (draftNotice.deedNo !== undefined) setDeedNo(draftNotice.deedNo);
      if (draftNotice.deedDate !== undefined) setDeedDate(draftNotice.deedDate);
      if (draftNotice.createdBsKhatianNo !== undefined) setCreatedBsKhatianNo(draftNotice.createdBsKhatianNo);
      if (draftNotice.bsKhatianNo !== undefined) setBsKhatianNo(draftNotice.bsKhatianNo);
      if (draftNotice.bsDagNo !== undefined) setBsDagNo(draftNotice.bsDagNo);
      if (draftNotice.rsKhatianNo !== undefined) setRsKhatianNo(draftNotice.rsKhatianNo);
      if (draftNotice.rsDagNo !== undefined) setRsDagNo(draftNotice.rsDagNo);
      if (draftNotice.landArea !== undefined) setLandArea(draftNotice.landArea);
      if (draftNotice.landClass) setLandClass(draftNotice.landClass);
      if (draftNotice.boundaryNorth !== undefined) setBoundaryNorth(draftNotice.boundaryNorth);
      if (draftNotice.boundarySouth !== undefined) setBoundarySouth(draftNotice.boundarySouth);
      if (draftNotice.boundaryEast !== undefined) setBoundaryEast(draftNotice.boundaryEast);
      if (draftNotice.boundaryWest !== undefined) setBoundaryWest(draftNotice.boundaryWest);
      if (draftNotice.holdingOrPlotNo !== undefined) setHoldingOrPlotNo(draftNotice.holdingOrPlotNo);
      if (draftNotice.roadOrArea !== undefined) setRoadOrArea(draftNotice.roadOrArea);
      if (draftNotice.siteWardNo) setSiteWardNo(draftNotice.siteWardNo);
      if (draftNotice.landmark !== undefined) setLandmark(draftNotice.landmark);
      if (draftNotice.applicantSameAsFirstOwner !== undefined) setApplicantSameAsFirstOwner(draftNotice.applicantSameAsFirstOwner);
      if (draftNotice.applicantPresentSameAsPermanent !== undefined) setApplicantPresentSameAsPermanent(draftNotice.applicantPresentSameAsPermanent);
      if (draftNotice.applicantName !== undefined) setApplicantName(draftNotice.applicantName);
      if (draftNotice.applicantFatherHusband !== undefined) setApplicantFatherHusband(draftNotice.applicantFatherHusband);
      if (draftNotice.applicantPermanentAddress !== undefined) setApplicantPermanentAddress(draftNotice.applicantPermanentAddress);
      if (draftNotice.applicantPresentAddress !== undefined) setApplicantPresentAddress(draftNotice.applicantPresentAddress);
      if (draftNotice.applicantMobile !== undefined) setApplicantMobile(draftNotice.applicantMobile);
      if (draftNotice.applicantNid !== undefined) setApplicantNid(draftNotice.applicantNid);
      if (draftNotice.applicantEmail !== undefined) setApplicantEmail(draftNotice.applicantEmail);
      if (draftNotice.notifySms !== undefined) setNotifySms(draftNotice.notifySms);
      if (draftNotice.notifyEmail !== undefined) setNotifyEmail(draftNotice.notifyEmail);
      if (draftNotice.uploadedDocs) setUploadedDocs(draftNotice.uploadedDocs);
      if (draftNotice.paymentDetails) setPaymentDetails(draftNotice.paymentDetails);
      if (draftNotice.declared !== undefined) setDeclared(draftNotice.declared);
      if (draftNotice.currentStep) setCurrentStep(draftNotice.currentStep);

      setDraftNotice(null);
      setSaveSuccessMsg('পূর্বে সংরক্ষিত খসড়া সফলভাবে ফর্মে লোড করা হয়েছে!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error restoring draft:', err);
    }
  };

  // Discard saved draft
  const handleDiscardDraft = () => {
    clearSavedDraft();
    setDraftNotice(null);
  };

  // Manual save draft handler
  const handleManualSave = () => {
    const draft = getCurrentDraftData();
    const success = saveDraft(draft);
    if (success) {
      const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      setSaveSuccessMsg(`আবেদনের খসড়া সফলভাবে ডিভাইসে সংরক্ষিত হয়েছে (${toBanglaNumber(timeStr)})। ব্রাউজার রিফ্রেশ হলেও তথ্য হারাবে না।`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }
  };

  // Auto-save draft on changes (debounced by 1500ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-save if at least one meaningful field is entered
    if (!applicantName && !applicantMobile && !deedNo && !bsDagNo) {
      return;
    }

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      const draft = getCurrentDraftData();
      saveDraft(draft);
      setIsAutoSaving(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    constructionType,
    customConstructionType,
    floorsCount,
    buildingCategory,
    purpose,
    estimatedAreaSqFt,
    landOwners,
    mouzaName,
    jlNo,
    scheduleWardNo,
    deedNo,
    deedDate,
    createdBsKhatianNo,
    bsKhatianNo,
    bsDagNo,
    rsKhatianNo,
    rsDagNo,
    landArea,
    landClass,
    boundaryNorth,
    boundarySouth,
    boundaryEast,
    boundaryWest,
    holdingOrPlotNo,
    roadOrArea,
    siteWardNo,
    landmark,
    applicantSameAsFirstOwner,
    applicantPresentSameAsPermanent,
    applicantName,
    applicantFatherHusband,
    applicantPermanentAddress,
    applicantPresentAddress,
    applicantMobile,
    applicantNid,
    applicantEmail,
    notifySms,
    notifyEmail,
  ]);

  // Step Navigation & Completion tracking for FormProgressBar (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const isStep1Done = Boolean(constructionType);
  const isStep2Done =
    landOwners.length > 0 &&
    landOwners.every(
      (o) => o.name.trim() && o.fatherOrHusbandName.trim() && o.permanentAddress.trim()
    );
  const isStep3Done = Boolean(
    mouzaName && deedNo.trim() && deedDate.trim() && bsKhatianNo.trim() && bsDagNo.trim() && landArea.trim()
  );
  const isStep4Done = Boolean(
    applicantName.trim() && applicantMobile.trim() && (applicantNid.trim() || applicantFatherHusband.trim())
  );
  const mandatoryDocKeys = REQUIRED_DOCUMENTS_LIST.filter((d) => d.isMandatory).map((d) => d.key);
  const isStep5Done = mandatoryDocKeys.every((k) => Boolean(uploadedDocs[k]));
  const isStep6Done = paymentDetails.status === 'paid' || paymentDetails.method === 'counter';
  const isStep7Done = declared;

  const completedSteps = [
    ...(isStep1Done ? [1] : []),
    ...(isStep2Done ? [2] : []),
    ...(isStep3Done ? [3] : []),
    ...(isStep4Done ? [4] : []),
    ...(isStep5Done ? [5] : []),
    ...(isStep6Done ? [6] : []),
    ...(isStep7Done ? [7] : []),
  ];

  const handleStepClick = (stepId: number, sectionId: string) => {
    setCurrentStep(stepId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Mouza Change (Auto-sync JL No)
  const handleMouzaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setMouzaName(selected);
    const matched = VALID_MOUZAS.find((m) => m.name === selected);
    if (matched) {
      setJlNo(matched.jlNo);
    }
  };

  // Add Land Owner (Max 100)
  const handleAddOwner = () => {
    if (landOwners.length >= 100) {
      alert('সর্বোচ্চ ১০০ জন পর্যন্ত মালিকের তথ্য সংযোজন করা যাবে।');
      return;
    }
    const newOwner: LandOwner = {
      id: `owner-${Date.now()}-${landOwners.length + 1}`,
      name: '',
      fatherOrHusbandName: '',
      nid: '',
      email: '',
      permanentAddress: '',
      presentAddress: '',
      sameAsPermanent: false,
    };
    setLandOwners([...landOwners, newOwner]);
  };

  // Remove Land Owner (Min 1)
  const handleRemoveOwner = (indexToRemove: number) => {
    if (landOwners.length <= 1) {
      alert('কমপক্ষে ১ জন মালিকের তথ্য থাকা আবশ্যক।');
      return;
    }
    setLandOwners(landOwners.filter((_, idx) => idx !== indexToRemove));
  };

  // Update Land Owner
  const handleOwnerChange = (index: number, field: keyof LandOwner, value: any) => {
    const updated = [...landOwners];
    const current = updated[index];

    let newOwner = { ...current };

    if (field === 'sameAsPermanent') {
      const isSame = Boolean(value);
      newOwner = {
        ...current,
        sameAsPermanent: isSame,
        presentAddress: isSame ? current.permanentAddress : current.presentAddress,
      };
    } else if (field === 'permanentAddress') {
      newOwner = {
        ...current,
        permanentAddress: value,
        presentAddress: current.sameAsPermanent ? value : current.presentAddress,
      };
    } else {
      newOwner = { ...current, [field]: value };
    }

    updated[index] = newOwner;
    setLandOwners(updated);

    // If owner-1 changes and sync checkbox is on, auto-sync applicant details
    if (index === 0 && applicantSameAsFirstOwner) {
      if (newOwner.name !== undefined) setApplicantName(newOwner.name);
      if (newOwner.fatherOrHusbandName !== undefined) setApplicantFatherHusband(newOwner.fatherOrHusbandName);
      if (newOwner.permanentAddress !== undefined) setApplicantPermanentAddress(newOwner.permanentAddress);
      if (newOwner.presentAddress !== undefined) setApplicantPresentAddress(newOwner.presentAddress);
      if (newOwner.nid !== undefined) setApplicantNid(newOwner.nid || '');
      if (newOwner.email !== undefined) setApplicantEmail(newOwner.email || '');
    }
  };

  // Toggle Same as First Owner
  const handleToggleApplicantSameAsFirstOwner = (isChecked: boolean) => {
    setApplicantSameAsFirstOwner(isChecked);
    if (isChecked) {
      const firstOwner = landOwners[0];
      if (firstOwner) {
        setApplicantName(firstOwner.name || '');
        setApplicantFatherHusband(firstOwner.fatherOrHusbandName || '');
        setApplicantPermanentAddress(firstOwner.permanentAddress || '');
        setApplicantPresentAddress(firstOwner.presentAddress || '');
        setApplicantNid(firstOwner.nid || '');
        setApplicantEmail(firstOwner.email || '');
      }
    }
  };

  // Auto Copy First Owner to Applicant (Convenience button)
  const handleCopyFirstOwnerToApplicant = () => {
    handleToggleApplicantSameAsFirstOwner(true);
  };

  // File Upload with 2 MB Size Validation
  const handleFileUpload = (docKey: string, docTitle: string, isMandatory: boolean, file: File | null) => {
    setFileError(null);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errMsg = `ফাইলের সাইজ ২ MB-এর বেশি হতে পারবে না (বর্তমান সাইজ: ${sizeMB} MB)। অনুগ্রহ করে ফাইল সাইজ কমিয়ে পুনরায় আপলোড করুন।`;
      setFileError(errMsg);
      alert(errMsg);
      return;
    }

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      docType: docKey,
      docTitle,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      isMandatory,
    };

    setUploadedDocs((prev) => ({
      ...prev,
      [docKey]: newDoc,
    }));
  };

  const handleRemoveDoc = (docKey: string) => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[docKey];
      return copy;
    });
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const isFloorCountApplicable =
      !constructionType.includes('সীমানা প্রাচীর') &&
      !constructionType.includes('আধাপাকা') &&
      !constructionType.includes('একতলা') &&
      !constructionType.includes('সীমানা চিহ্নিতকরণ');

    // 1. Proposed Construction
    if (isFloorCountApplicable && !floorsCount.trim()) {
      newErrors.floorsCount = 'তলার সংখ্যা প্রদান আবশ্যক';
    }
    if (constructionType.includes('অন্যান্য') && !customConstructionType.trim()) {
      newErrors.customConstructionType = 'অন্যান্য নির্মাণের নির্দিষ্ট বিবরণ প্রদান আবশ্যক';
    }

    // 2. Land Owners
    landOwners.forEach((owner, idx) => {
      if (!owner.name.trim()) {
        newErrors[`owner_${idx}_name`] = `মালিক-${toBanglaNumber(idx + 1)}-এর নাম প্রদান আবশ্যক`;
      }
      if (!owner.fatherOrHusbandName.trim()) {
        newErrors[`owner_${idx}_father`] = `মালিক-${toBanglaNumber(idx + 1)}-এর পিতা/স্বামীর নাম আবশ্যক`;
      }
      if (!owner.nid || !owner.nid.trim()) {
        newErrors[`owner_${idx}_nid`] = `মালিক-${toBanglaNumber(idx + 1)}-এর জাতীয় পরিচয়পত্র (NID) নম্বর আবশ্যক`;
      } else {
        const cleanNid = toEnglishDigits(owner.nid).replace(/\D/g, '');
        if (![10, 13, 17].includes(cleanNid.length)) {
          newErrors[`owner_${idx}_nid`] = `১০, ১৩ বা ১৭ ডিজিটের সঠিক NID নম্বর দিন (বর্তমান ডিজিট: ${toBanglaNumber(cleanNid.length)})`;
        }
      }
      if (owner.email && owner.email.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
          newErrors[`owner_${idx}_email`] = `সঠিক ইমেইল ফরম্যাট প্রদান করুন (যেমন: example@gmail.com)`;
        }
      }
      if (!owner.permanentAddress.trim()) {
        newErrors[`owner_${idx}_perm_addr`] = `মালিক-${toBanglaNumber(idx + 1)}-এর স্থায়ী ঠিকানা আবশ্যক`;
      }
      if (!owner.presentAddress.trim()) {
        newErrors[`owner_${idx}_pres_addr`] = `মালিক-${toBanglaNumber(idx + 1)}-এর বর্তমান ঠিকানা আবশ্যক`;
      }
    });

    // 3. Land Schedule
    if (!mouzaName) newErrors.mouzaName = 'মৌজার নাম নির্বাচন করুন';
    if (!jlNo) newErrors.jlNo = 'জে.এল. নং নির্বাচন আবশ্যক';
    if (!deedNo.trim()) newErrors.deedNo = 'দলিল নং প্রদান করা আবশ্যক';
    if (!deedDate.trim()) newErrors.deedDate = 'দলিল রেজিস্ট্রি তারিখ প্রদান করা আবশ্যক';
    if (!createdBsKhatianNo.trim()) newErrors.createdBsKhatianNo = 'সৃজিত বি.এস খতিয়ান নং প্রদান আবশ্যক';
    if (!bsKhatianNo.trim()) newErrors.bsKhatianNo = 'বি.এস খতিয়ান নং প্রদান আবশ্যক';
    if (!bsDagNo.trim()) newErrors.bsDagNo = 'বি.এস দাগ নং প্রদান আবশ্যক';
    if (!landArea.trim()) newErrors.landArea = 'জমির পরিমাণ প্রদান করা আবশ্যক';

    // Boundaries validation (All 4 are mandatory)
    if (!boundaryNorth.trim()) newErrors.boundaryNorth = 'উত্তর সীমানা উল্লেখ আবশ্যক';
    if (!boundarySouth.trim()) newErrors.boundarySouth = 'দক্ষিণ সীমানা উল্লেখ আবশ্যক';
    if (!boundaryEast.trim()) newErrors.boundaryEast = 'পূর্ব সীমানা উল্লেখ আবশ্যক';
    if (!boundaryWest.trim()) newErrors.boundaryWest = 'পশ্চিম সীমানা উল্লেখ আবশ্যক';

    // 4. Site Location & Applicant
    if (!holdingOrPlotNo.trim()) newErrors.holdingOrPlotNo = 'হোল্ডিং/প্লট নং আবশ্যক';
    if (!roadOrArea.trim()) newErrors.roadOrArea = 'রাস্তা/এলাকার নাম আবশ্যক';
    if (!applicantName.trim()) newErrors.applicantName = 'আবেদনকারীর নাম প্রদান আবশ্যক';
    if (!applicantFatherHusband.trim()) newErrors.applicantFatherHusband = 'আবেদনকারীর পিতা/স্বামীর নাম আবশ্যক';
    if (!applicantPermanentAddress.trim()) {
      newErrors.applicantPermanentAddress = 'আবেদনকারীর স্থায়ী ঠিকানা প্রদান করা বাধ্যতামূলক';
    }
    if (!applicantMobile.trim()) {
      newErrors.applicantMobile = 'মোবাইল নম্বর প্রদান করা আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(applicantMobile.replace(/[^0-9]/g, ''))) {
      newErrors.applicantMobile = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 018XXXXXXXX)';
    }
    if (!applicantNid.trim()) {
      newErrors.applicantNid = 'জাতীয় পরিচয়পত্র (NID) নম্বর প্রদান আবশ্যক';
    } else {
      const cleanApplicantNid = toEnglishDigits(applicantNid).replace(/\D/g, '');
      if (![10, 13, 17].includes(cleanApplicantNid.length)) {
        newErrors.applicantNid = `১০, ১৩ বা ১৭ ডিজিটের সঠিক NID নম্বর দিন (বর্তমান ডিজিট: ${toBanglaNumber(cleanApplicantNid.length)})`;
      }
    }
    if (applicantEmail && applicantEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail.trim())) {
        newErrors.applicantEmail = 'সঠিক ইমেইল ফরম্যাট প্রদান করুন (যেমন: example@gmail.com)';
      }
    }

    // 5. Mandatory Documents Validation
    REQUIRED_DOCUMENTS_LIST.forEach((docDef) => {
      if (docDef.isMandatory && !uploadedDocs[docDef.key]) {
        const errorKey = docDef.errorKey || `doc_${docDef.key}`;
        newErrors[errorKey] = `${docDef.title} আপলোড করা বাধ্যতামূলক`;
      }
    });

    // 6. Declaration
    if (!declared) {
      newErrors.declaration = 'আবেদন দাখিলের পূর্বে ঘোষণাপত্রে সম্মতি প্রদান করা আবশ্যক';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorKey) || document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const trackingId = generateTrackingId();
    const finalConstructionType =
      constructionType.includes('অন্যান্য') && customConstructionType.trim()
        ? customConstructionType.trim()
        : constructionType;

    const buildingCategoryLabel = buildingCategory === 'residential' ? 'আবাসিক (Residential)' : 'বাণিজ্যিক (Commercial)';
    const isFloorCountApplicable =
      !constructionType.includes('সীমানা প্রাচীর') &&
      !constructionType.includes('আধাপাকা') &&
      !constructionType.includes('একতলা') &&
      !constructionType.includes('সীমানা চিহ্নিতকরণ');

    const floorsCountFinal = isFloorCountApplicable
      ? (floorsCount.trim() || '১')
      : (constructionType.includes('একতলা') ? '১' : 'প্রযোজ্য নয়');
    const autoPurpose = isFloorCountApplicable
      ? `${buildingCategory === 'residential' ? 'আবাসিক' : 'বাণিজ্যিক'} ব্যবহারের নিমিত্তে ${floorsCountFinal ? floorsCountFinal + ' তলা ' : ''}${finalConstructionType} নির্মাণ ও সীমানা ডিমার্কেশন`
      : `${buildingCategory === 'residential' ? 'আবাসিক' : 'বাণিজ্যিক'} ব্যবহারের নিমিত্তে ${finalConstructionType} ও সীমানা ডিমার্কেশন`;

    const newApp: DemarcationApplication = {
      id: trackingId,
      formNo: generateFormNumber(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      declaredByApplicant: true,
      declarationDate: new Date().toISOString().split('T')[0],
      proposedConstruction: {
        constructionType: finalConstructionType,
        purpose: purpose.trim() || autoPurpose,
        floorsCount: floorsCountFinal,
        buildingCategory: buildingCategoryLabel,
        estimatedAreaSqFt: estimatedAreaSqFt || 'উদ্বৃত্ত নয়',
      },
      landOwners,
      schedule: {
        mouzaName,
        jlNo,
        wardNo: scheduleWardNo,
        deedNo,
        deedDate,
        createdBsKhatianNo: createdBsKhatianNo || 'প্রযোজ্য নয়',
        bsKhatianNo,
        bsDagNo,
        rsKhatianNo: rsKhatianNo || '',
        rsDagNo: rsDagNo || '',
        landArea,
        landClass,
        boundaryNorth: boundaryNorth || 'চিহ্নিত সীমানা',
        boundarySouth: boundarySouth || 'চিহ্নিত সীমানা',
        boundaryEast: boundaryEast || 'চিহ্নিত সীমানা',
        boundaryWest: boundaryWest || 'চিহ্নিত সীমানা',
      },
      siteLocation: {
        holdingOrPlotNo,
        roadOrArea,
        wardNo: siteWardNo,
        landmark,
        applicantName,
        applicantFatherHusband,
        applicantPermanentAddress,
        applicantPresentAddress: applicantPresentAddress || applicantPermanentAddress,
        applicantMobile,
        applicantNid,
        applicantEmail,
      },
      documents: Object.values(uploadedDocs),
      feeAmount: paymentDetails.amount || 100,
      feeStatus: (paymentDetails.moneyReceiptNo?.trim() || paymentDetails.status === 'paid') ? 'paid' : 'unpaid',
      moneyReceiptNo: paymentDetails.moneyReceiptNo?.trim() || undefined,
      moneyReceiptDate: paymentDetails.moneyReceiptDate || undefined,
      paymentDetails: paymentDetails,
      notificationPreferences: {
        notifySms,
        notifyEmail,
      },
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toISOString(),
          fromStatus: 'pending',
          toStatus: 'pending',
          statusTitle: 'আবেদন দাখিল সম্পন্ন ও সিস্টেমে অন্তর্ভুক্ত',
          updatedBy: applicantName || 'আবেদনকারী',
          designation: 'নাগরিক / আবেদনকারী',
          remarks:
            paymentDetails.status === 'paid'
              ? `অনলাইন সিস্টেমের মাধ্যমে ডিমার্কেশন আবেদনপত্র ও প্রয়োজনীয় সংযুক্তি সফলভাবে দাখিল করা হয়েছে। ফি: ৳ ${paymentDetails.amount}/- (${paymentDetails.methodNameBangla} - TrxID: ${paymentDetails.trxId || 'N/A'}) পরিশোধিত।`
              : `অনলাইন সিস্টেমের মাধ্যমে ডিমার্কেশন আবেদনপত্র ও প্রয়োজনীয় সংযুক্তি সফলভাবে দাখিল করা হয়েছে। ফি: ৳ ${paymentDetails.amount || 600}/- (পৌর ক্যাশ কাউন্টারে অপরিশোধিত)।`,
        },
      ],
      notificationLogs: [
        sendAutomatedStatusAlert(
          {
            id: trackingId,
            schedule: { mouzaName } as any,
            siteLocation: { applicantName, applicantMobile, applicantEmail } as any,
            notificationPreferences: { notifySms, notifyEmail },
          } as any,
          'pending'
        ).log,
      ],
      draftsmanReview: {
        reviewerName: 'মোঃ আবুল কালাম আজাদ',
        designation: 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা',
        reviewDate: new Date().toISOString().split('T')[0],
        remarks:
          'আপনার আবেদনটির প্রারম্ভিক নথিপত্র পৌরসভা কর্তৃক যাচাই করা হচ্ছে। খুব শীঘ্রই নক্সাকার (সিভিল) সরজমিনে আপনার প্রস্তাবিত সাইট পরিদর্শন করতে যাবেন। অনুগ্রহ করে হালনাগাদ তথ্যের জন্য অপেক্ষা করুন।',
        isSiteInspected: false,
      },
    };

    // Save to localStorage
    saveApplication(newApp);
    // Clear draft after successful submission
    clearSavedDraft();

    setTimeout(() => {
      setIsSubmitting(false);
      onApplicationSubmitted(newApp);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Draft Found Notification Banner */}
      {draftNotice && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  পূর্বে সংরক্ষিত খসড়া আবেদন পাওয়া গেছে (Draft Available)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  আবেদনকারী: <strong>{draftNotice.applicantName || 'অসম্পূর্ণ'}</strong> | মৌজা: <strong>{draftNotice.mouzaName}</strong> | সংরক্ষণ সময়: {draftNotice.lastSavedAt ? formatBanglaDate(draftNotice.lastSavedAt) : 'পূর্ববর্তী সেশন'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>খসড়া পুনরুদ্ধার করুন</span>
              </button>

              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-xl border border-amber-300 transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Saved Success Feedback */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between gap-2 text-emerald-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Header Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 sm:p-6 shadow-md border-l-4 border-emerald-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-800 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-50">
                ভূমির ডিমার্কেশন যাচাইয়ের অনলাইন আবেদন ফরম
              </h2>
              <p className="text-emerald-200 text-sm mt-1">
                সীতাকুণ্ড পৌরসভা এলাকাভুক্ত সকল মৌজার জন্য প্রযোজ্য | সকল তথ্য ও নথিপত্র বাংলায় পূরণ করুন
              </p>
            </div>
          </div>

          {/* Quick Save Draft Button & Auto-Save Badge in Header */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {isAutoSaving && (
              <span className="text-[11px] text-emerald-200 bg-emerald-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>স্বয়ংক্রিয় সংরক্ষণ...</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleManualSave}
              className="px-3.5 py-2 bg-emerald-800/90 hover:bg-emerald-700 active:bg-emerald-950 text-emerald-100 hover:text-white text-xs font-bold rounded-lg border border-emerald-600/60 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="বর্তমান তথ্য ডিভাইসে সংরক্ষণ করুন"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>খসড়া সংরক্ষণ (Save Draft)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Step Form Progress Bar */}
      <FormProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* =========================================================================
          SECTION ১: প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose)
          ========================================================================= */}
      <div id="step-1" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
            ১
          </span>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800 shrink-0" />
            <span>প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose)</span>
          </h2>
        </div>

        <div className="p-5 sm:p-6 space-y-4">

        {/* Dynamic Responsive Grid: 3 columns for buildings with floors, 2 columns for boundary wall / semi-pucca */}
        <div className={`grid grid-cols-1 ${isFloorCountApplicable ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-start`}>
          {/* 1. নির্মাণের ধরন */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              নির্মাণের ধরন <span className="text-red-600 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                id="constructionType"
                value={constructionType}
                onChange={(e) => setConstructionType(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-xl border-2 border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-white text-slate-900 text-sm font-medium pr-10 shadow-xs cursor-pointer focus:outline-none"
              >
                {CONSTRUCTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. তলার সংখ্যা (সীমানা প্রাচীর ও আধাপাকা ভবনের ক্ষেত্রে প্রযোজ্য নয়) */}
          {isFloorCountApplicable && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                তলার সংখ্যা <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                id="floorsCount"
                type="text"
                placeholder="১"
                value={floorsCount}
                onChange={(e) => setFloorsCount(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.floorsCount ? 'border-red-500 bg-red-50/40' : 'border-slate-200 bg-slate-50/50'
                } focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm text-slate-900 shadow-xs focus:outline-none`}
              />
              {errors.floorsCount && <p className="text-xs text-red-600 mt-1">{errors.floorsCount}</p>}
            </div>
          )}

          {/* 3. ভবন/স্থাপনার শ্রেণী */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              ভবন/স্থাপনার শ্রেণী <span className="text-red-600 font-bold">*</span>
            </label>
            <div className="p-1 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center gap-1.5 shadow-xs min-h-[44px]">
              <button
                type="button"
                onClick={() => setBuildingCategory('residential')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-center leading-tight transition-all duration-150 flex flex-col items-center justify-center cursor-pointer ${
                  buildingCategory === 'residential'
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold">আবাসিক</span>
                <span className="text-[10px] sm:text-[11px] opacity-90">(Residential)</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingCategory('commercial')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-center leading-tight transition-all duration-150 flex flex-col items-center justify-center cursor-pointer ${
                  buildingCategory === 'commercial'
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold">বাণিজ্যিক</span>
                <span className="text-[10px] sm:text-[11px] opacity-90">(Commercial)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom specification when 'অন্যান্য' is selected */}
        {constructionType.includes('অন্যান্য') && (
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              অন্যান্য নির্মাণের নির্দিষ্ট বিবরণ <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="যেমন: গুদাম ঘর / অস্থায়ী শেড / সীমানা পিলার ইত্যাদি"
              value={customConstructionType}
              onChange={(e) => setCustomConstructionType(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.customConstructionType ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
              } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
            />
            {errors.customConstructionType && (
              <p className="text-xs text-red-600 mt-1">{errors.customConstructionType}</p>
            )}
          </div>
        )}
        </div>
      </div>

      {/* =========================================================================
          SECTION ২: ভূমির মালিকের তথ্য (Land Owner Information) [Dedicated + Add Owner]
          ========================================================================= */}
      <div id="step-2" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
              ২
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ভূমির মালিকের তথ্য (Land Owner Information)
              </h2>
              <p className="text-xs text-slate-600 font-normal">
                এক বা একাধিক মালিক থাকলে ডানপাশের বাটন ক্লিক করে যুক্ত করুন (সর্বোচ্চ ১০০ জন)
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-add-owner"
            onClick={handleAddOwner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন মালিক যুক্ত করুন (Add Owner)</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {landOwners.map((owner, idx) => (
            <div
              key={owner.id || idx}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-300 transition-colors relative"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-300">
                    মালিক - {toBanglaNumber(idx + 1)}
                  </span>
                  {idx === 0 && (
                    <span className="text-xs text-slate-500 font-normal">(প্রধান মালিক / মূল আবেদনকারী)</span>
                  )}
                </div>

                {landOwners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOwner(idx)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন (Remove)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    ভূমির মালিকের নাম <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="মালিকের পূর্ণ নাম লিখুন"
                    value={owner.name}
                    onChange={(e) => handleOwnerChange(idx, 'name', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_name`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                  />
                  {errors[`owner_${idx}_name`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_name`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    পিতা/স্বামীর নাম <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="পিতা অথবা স্বামীর নাম লিখুন"
                    value={owner.fatherOrHusbandName}
                    onChange={(e) => handleOwnerChange(idx, 'fatherOrHusbandName', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_father`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                  />
                  {errors[`owner_${idx}_father`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_father`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="১০ / ১৩ / ১৭ ডিজিটের NID নম্বর"
                    value={owner.nid || ''}
                    onChange={(e) => handleOwnerChange(idx, 'nid', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_nid`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                  />
                  {errors[`owner_${idx}_nid`] ? (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_nid`]}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">১০, ১৩ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={owner.email || ''}
                    onChange={(e) => handleOwnerChange(idx, 'email', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_email`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                  />
                  {errors[`owner_${idx}_email`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_email`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    স্থায়ী ঠিকানা <span className="text-red-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="গ্রাম/রোড, ওয়ার্ড নং, ডাকঘর, উপজেলা, জেলা"
                    value={owner.permanentAddress}
                    onChange={(e) => handleOwnerChange(idx, 'permanentAddress', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_perm_addr`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                  ></textarea>
                  {errors[`owner_${idx}_perm_addr`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_perm_addr`]}</p>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                      বর্তমান ঠিকানা <span className="text-red-600 font-bold">*</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold cursor-pointer select-none bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean(owner.sameAsPermanent)}
                        onChange={(e) => handleOwnerChange(idx, 'sameAsPermanent', e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>স্থায়ী ঠিকানা ও বর্তমান ঠিকানা একই</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder={owner.sameAsPermanent ? 'স্থায়ী ঠিকানার অনুলিপি (স্বয়ংক্রিয়)' : 'বর্তমান বসবাসের বিস্তারিত ঠিকানা'}
                    value={owner.presentAddress}
                    readOnly={Boolean(owner.sameAsPermanent)}
                    onChange={(e) => handleOwnerChange(idx, 'presentAddress', e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg border ${
                      errors[`owner_${idx}_pres_addr`] ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                    } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                      owner.sameAsPermanent ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                    }`}
                  ></textarea>
                  {errors[`owner_${idx}_pres_addr`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`owner_${idx}_pres_addr`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION ৩: ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land]
          ========================================================================= */}
      <div id="step-3" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
            ৩
          </span>
          <h2 className="text-lg font-bold text-slate-800">
            ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land]
          </h2>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 1. Mouza Name (Strict 8 options) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                মৌজার নাম <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                id="mouzaName"
                value={mouzaName}
                onChange={handleMouzaChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-800 text-sm font-medium"
              >
                {VALID_MOUZAS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} (জে.এল. নং-{toBanglaNumber(m.jlNo)})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. J.L. No (Mandatory, strict numbers) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                জে.এল. নং (J.L. No) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                id="jlNo"
                value={jlNo}
                onChange={(e) => setJlNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.jlNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-800 text-sm font-medium`}
              >
                {VALID_JL_NUMBERS.map((num) => (
                  <option key={num} value={num}>
                    {toBanglaNumber(num)} ({num})
                  </option>
                ))}
              </select>
              {errors.jlNo && <p className="text-xs text-red-600 mt-1">{errors.jlNo}</p>}
            </div>

            {/* 3. Ward No */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                ওয়ার্ড নং <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={scheduleWardNo}
                onChange={(e) => setScheduleWardNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-800 text-sm font-medium"
              >
                {VALID_WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {/* 4. Deed No */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                দলিল নং <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: ৫৮৪/২০২৩"
                value={deedNo}
                onChange={(e) => setDeedNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.deedNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.deedNo && <p className="text-xs text-red-600 mt-1">{errors.deedNo}</p>}
            </div>

            {/* 5. Deed Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                দলিল রেজিস্ট্রি তারিখ <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="দিন/মাস/বছর (যেমন: ১৫/০৩/২০২৩)"
                value={deedDate}
                onChange={(e) => setDeedDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.deedDate ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.deedDate && <p className="text-xs text-red-600 mt-1">{errors.deedDate}</p>}
            </div>

            {/* 6. Mutated BS Khatian */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                সৃজিত বি.এস খতিয়ান নং <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: খতিয়ান-৮৮৪"
                value={createdBsKhatianNo}
                onChange={(e) => setCreatedBsKhatianNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.createdBsKhatianNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.createdBsKhatianNo && (
                <p className="text-xs text-red-600 mt-1">{errors.createdBsKhatianNo}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {/* 7. BS Khatian */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                বি.এস খতিয়ান নং <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: ৩১২"
                value={bsKhatianNo}
                onChange={(e) => setBsKhatianNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.bsKhatianNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.bsKhatianNo && <p className="text-xs text-red-600 mt-1">{errors.bsKhatianNo}</p>}
            </div>

            {/* 8. BS Dag */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                বি.এস দাগ নং <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: ১৪৫২"
                value={bsDagNo}
                onChange={(e) => setBsDagNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.bsDagNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.bsDagNo && <p className="text-xs text-red-600 mt-1">{errors.bsDagNo}</p>}
            </div>

            {/* 9. RS Khatian */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                আর.এস খতিয়ান নং
              </label>
              <input
                type="text"
                placeholder="যেমন: ১৮৪"
                value={rsKhatianNo}
                onChange={(e) => setRsKhatianNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
              />
            </div>

            {/* 10. RS Dag */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                আর.এস দাগ নং
              </label>
              <input
                type="text"
                placeholder="যেমন: ৮৯০"
                value={rsDagNo}
                onChange={(e) => setRsDagNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Land Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                জমির পরিমাণ (শতাংশ/ডেসিমেল) <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: ১০.৫০ শতাংশ / ৫ কাঠা"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.landArea ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.landArea && <p className="text-xs text-red-600 mt-1">{errors.landArea}</p>}
            </div>

            {/* Land Class */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                জমির শ্রেণি <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={landClass}
                onChange={(e) => setLandClass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-800 text-sm"
              >
                {LAND_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boundaries */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-2">
              প্রস্তাবিত ভূমির চতুর্সীমা (চৌহদ্দি):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  উত্তর সীমানা <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আব্দুল কাদের এর জায়গা"
                  value={boundaryNorth}
                  onChange={(e) => setBoundaryNorth(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.boundaryNorth ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } text-xs`}
                />
                {errors.boundaryNorth && (
                  <p className="text-[11px] text-red-600 mt-0.5">{errors.boundaryNorth}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  দক্ষিণ সীমানা <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পৌরসভা ৬ ফুট রাস্তা"
                  value={boundarySouth}
                  onChange={(e) => setBoundarySouth(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.boundarySouth ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } text-xs`}
                />
                {errors.boundarySouth && (
                  <p className="text-[11px] text-red-600 mt-0.5">{errors.boundarySouth}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পূর্ব সীমানা <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বসতভিটা"
                  value={boundaryEast}
                  onChange={(e) => setBoundaryEast(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.boundaryEast ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } text-xs`}
                />
                {errors.boundaryEast && (
                  <p className="text-[11px] text-red-600 mt-0.5">{errors.boundaryEast}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পশ্চিম সীমানা <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সরকারি খাল"
                  value={boundaryWest}
                  onChange={(e) => setBoundaryWest(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.boundaryWest ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } text-xs`}
                />
                {errors.boundaryWest && (
                  <p className="text-[11px] text-red-600 mt-0.5">{errors.boundaryWest}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION ৪: প্রস্তাবিত সাইটের ঠিকানা ও আবেদনকারীর তথ্য
          ========================================================================= */}
      <div id="step-4" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
              ৪
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              প্রস্তাবিত সাইটের ঠিকানা (যেখানে ম্যাপ ডিমার্কেশন হবে) ও আবেদনকারীর তথ্য
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCopyFirstOwnerToApplicant}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            ১ম মালিকের তথ্য আবেদনকারীতে কপি করুন
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Site Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                মৌজা ও হোল্ডিং নং / প্লট নং <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: হোল্ডিং নং-৫১২, প্লট-বি/৪"
                value={holdingOrPlotNo}
                onChange={(e) => setHoldingOrPlotNo(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.holdingOrPlotNo ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.holdingOrPlotNo && <p className="text-xs text-red-600 mt-1">{errors.holdingOrPlotNo}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                রাস্তা / এলাকার নাম <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: শিবপুর কলেজ রোড"
                value={roadOrArea}
                onChange={(e) => setRoadOrArea(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.roadOrArea ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm`}
              />
              {errors.roadOrArea && <p className="text-xs text-red-600 mt-1">{errors.roadOrArea}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                সাইটের ওয়ার্ড নং <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={siteWardNo}
                onChange={(e) => setSiteWardNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-slate-800 text-sm"
              >
                {VALID_WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              নিকটবর্তী পরিচিত স্থান / ল্যান্ডমার্ক
            </label>
            <input
              type="text"
              placeholder="যেমন: সীতাকুণ্ড সরকারি মহিলা কলেজের দক্ষিণ পার্শ্বে"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
            />
          </div>

          {/* Applicant Information Sub-block */}
          <div className="pt-4 border-t border-slate-200 bg-slate-50/80 p-4 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>আবেদনকারীর ব্যক্তিগত ও যোগাযোগের তথ্য (Applicant Contact Info)</span>
              </h3>

              {/* Right Symbol / Checkbox for matching with Owner 1 */}
              <label className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200/90 px-3 py-1.5 rounded-lg border border-emerald-300 cursor-pointer shadow-2xs transition-colors select-none">
                <input
                  type="checkbox"
                  checked={applicantSameAsFirstOwner}
                  onChange={(e) => handleToggleApplicantSameAsFirstOwner(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer accent-emerald-700"
                />
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>মালিক - ১ (মূল আবেদনকারী)-এর সাথে একই (Same as Owner-1)</span>
                </span>
              </label>
            </div>

            {applicantSameAsFirstOwner && (
              <div className="mb-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  মালিক-১ (<strong>{landOwners[0]?.name || 'প্রধান মালিক'}</strong>)-এর নাম, পিতা/স্বামীর নাম, NID, ইমেইল এবং ঠিকানার সাথে স্বয়ংক্রিয়ভাবে মিল রাখা হয়েছে।
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  আবেদনকারীর নাম <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="আবেদনকারীর পূর্ণ নাম লিখুন"
                  value={applicantName}
                  readOnly={applicantSameAsFirstOwner}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    errors.applicantName ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                {errors.applicantName && <p className="text-xs text-red-600 mt-1">{errors.applicantName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  পিতা/স্বামীর নাম <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="পিতা অথবা স্বামীর নাম"
                  value={applicantFatherHusband}
                  readOnly={applicantSameAsFirstOwner}
                  onChange={(e) => setApplicantFatherHusband(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    errors.applicantFatherHusband ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                {errors.applicantFatherHusband && (
                  <p className="text-xs text-red-600 mt-1">{errors.applicantFatherHusband}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  যোগাযোগের মোবাইল নম্বর <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="018XXXXXXXX"
                  value={applicantMobile}
                  onChange={(e) => setApplicantMobile(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    errors.applicantMobile ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white`}
                />
                {errors.applicantMobile && <p className="text-xs text-red-600 mt-1">{errors.applicantMobile}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="১০ / ১৩ / ১৭ ডিজিটের NID নম্বর"
                  value={applicantNid}
                  readOnly={applicantSameAsFirstOwner}
                  onChange={(e) => setApplicantNid(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    errors.applicantNid ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                {errors.applicantNid && <p className="text-xs text-red-600 mt-1">{errors.applicantNid}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  ইমেইল ঠিকানা (ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={applicantEmail}
                  readOnly={applicantSameAsFirstOwner}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Automated SMS/Email Alert Options */}
            <div className="pt-3 pb-1">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 sm:p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <span>আবেদনের অবস্থা পরিবর্তনের স্বয়ংক্রিয় নোটিফিকেশন এলার্ট (SMS & Email Alerts)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  আবেদনের প্রতিটি পদক্ষেপে (যেমন: সরজমিন তদন্ত, নক্সাকার পরিদর্শন, চূড়ান্ত অনুমোদন ও সনদপত্র জারি) আপনার মোবাইল ও ইমেইলে তাৎক্ষণিক এসএমএস ও ইমেইল এলার্ট পাঠানো হবে।
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  <label className="inline-flex items-center gap-2 text-slate-800 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer accent-emerald-700"
                    />
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>মোবাইলে এসএমএস (SMS) এলার্ট পাঠান</span>
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-slate-800 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer accent-emerald-700"
                    />
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-700" />
                      <span>ইমেইল (Email) এলার্ট পাঠান</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {/* Permanent Address is Mandatory */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  আবেদনকারীর স্থায়ী ঠিকানা <span className="text-red-600 font-bold">* (বাধ্যতামূলক)</span>
                </label>
                <textarea
                  id="applicantPermanentAddress"
                  rows={2}
                  placeholder="গ্রাম/রোড, ওয়ার্ড নং, ডাকঘর, উপজেলা, জেলা"
                  value={applicantPermanentAddress}
                  readOnly={applicantSameAsFirstOwner}
                  onChange={(e) => {
                    setApplicantPermanentAddress(e.target.value);
                    if (applicantPresentSameAsPermanent) {
                      setApplicantPresentAddress(e.target.value);
                    }
                  }}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    errors.applicantPermanentAddress ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                  } focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white'
                  }`}
                ></textarea>
                {errors.applicantPermanentAddress && (
                  <p className="text-xs text-red-600 mt-1">{errors.applicantPermanentAddress}</p>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    আবেদনকারীর বর্তমান ঠিকানা
                  </label>
                  {!applicantSameAsFirstOwner && (
                    <label className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold cursor-pointer select-none bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={applicantPresentSameAsPermanent}
                        onChange={(e) => {
                          const isSame = e.target.checked;
                          setApplicantPresentSameAsPermanent(isSame);
                          if (isSame) {
                            setApplicantPresentAddress(applicantPermanentAddress);
                          }
                        }}
                        className="w-3.5 h-3.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>স্থায়ী ঠিকানা ও বর্তমান ঠিকানা একই</span>
                    </label>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder={
                    applicantSameAsFirstOwner
                      ? 'মালিক-১ এর বর্তমান ঠিকানা (স্বয়ংক্রিয়)'
                      : applicantPresentSameAsPermanent
                      ? 'স্থায়ী ঠিকানার অনুলিপি (স্বয়ংক্রিয়)'
                      : 'বর্তমান বসবাসের বিস্তারিত ঠিকানা'
                  }
                  value={applicantPresentAddress}
                  readOnly={applicantSameAsFirstOwner || applicantPresentSameAsPermanent}
                  onChange={(e) => setApplicantPresentAddress(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm ${
                    applicantSameAsFirstOwner || applicantPresentSameAsPermanent
                      ? 'bg-slate-100 text-slate-700 cursor-not-allowed'
                      : 'bg-white'
                  }`}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION ৫: প্রয়োজনীয় কাগজপত্র আপলোড ও ফটোকপি (PDF/JPG/PNG)
          ========================================================================= */}
      <div id="step-5" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
              ৫
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                প্রয়োজনীয় কাগজপত্র আপলোড ও ফটোকপি (PDF/JPG/PNG)
              </h2>
              <p className="text-xs text-slate-600 font-normal">
                প্রতিটি আপলোডকৃত ফাইলের সর্বোচ্চ সাইজ হবে ২ MB (PDF, JPG, JPEG, PNG সমর্থিত)
              </p>
            </div>
          </div>

          <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md font-semibold border border-amber-300">
            সর্বোচ্চ সাইজ: ২ MB
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {fileError && (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{fileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_DOCUMENTS_LIST.map((docDef, index) => {
              const uploaded = uploadedDocs[docDef.key];
              const banglaNum = toBanglaNumber(index + 1);
              const hasError = docDef.errorKey ? errors[docDef.errorKey] : undefined;

              return (
                <div
                  key={docDef.key}
                  id={docDef.errorKey || docDef.key}
                  className={`p-4 rounded-xl border ${
                    hasError ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50/60'
                  } transition-colors flex flex-col justify-between`}
                >
                  <div className="mb-2.5">
                    <label className="text-sm font-semibold text-slate-800 leading-snug flex items-start justify-between gap-2">
                      <span>
                        {banglaNum}. {docDef.title}{' '}
                        {docDef.isMandatory ? (
                          <span className="text-red-600 font-bold">*</span>
                        ) : null}
                      </span>
                      {docDef.isMandatory ? (
                        <span className="shrink-0 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                          বাধ্যতামূলক
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          ঐচ্ছিক
                        </span>
                      )}
                    </label>
                  </div>

                  {uploaded ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-medium truncate">
                        <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate">{uploaded.fileName}</span>
                        <span className="text-emerald-700 font-mono">({(uploaded.fileSize / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(docDef.key)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="ফাইল মুছে ফেলুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept={docDef.accept || '.pdf,.jpg,.jpeg,.png'}
                        onChange={(e) =>
                          handleFileUpload(
                            docDef.key,
                            docDef.title,
                            docDef.isMandatory,
                            e.target.files?.[0] || null
                          )
                        }
                        className={`w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold ${
                          docDef.isMandatory
                            ? 'file:bg-emerald-700 hover:file:bg-emerald-800 file:text-white'
                            : 'file:bg-slate-700 hover:file:bg-slate-800 file:text-white'
                        } cursor-pointer`}
                      />
                    </div>
                  )}
                  {hasError && <p className="text-xs text-red-600 mt-1.5 font-medium">{hasError}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION ৬: সরকারি ফি পরিশোধ (Mock Payment Gateway & Fee Collection)
          ========================================================================= */}
      <div id="step-6" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
              ৬
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                সরকারি ফি পরিশোধ
              </h2>
              <p className="text-xs text-slate-500">
                বিকাশ, নগদ, রকেট, উপায়, কার্ড অথবা পৌরসভা ক্যাশ কাউন্টারে ফি পরিশোধ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {paymentDetails.status === 'paid' ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>পরিশোধিত</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
                {paymentDetails.method === 'counter' ? 'কাউন্টারে প্রদেয়' : 'অপরিশোধিত'}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <PaymentGatewayStep
            applicantMobile={applicantMobile}
            applicantName={applicantName}
            paymentDetails={paymentDetails}
            onPaymentChange={(updatedDetails) => setPaymentDetails(updatedDetails)}
          />
        </div>
      </div>

      {/* =========================================================================
          SECTION ৭: ঘোষণা (Declaration) & Submission
          ========================================================================= */}
      <div id="step-7" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden scroll-mt-24">
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
            ৭
          </span>
          <h2 className="text-lg font-bold text-slate-800">
            ঘোষণা ও দাখিল (Declaration & Submission)
          </h2>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="declaration"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-700 border-slate-300 rounded-sm focus:ring-emerald-600"
            />
            <span className="text-sm text-slate-800 font-normal leading-relaxed">
              আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত সকল তথ্য ও দাখিলকৃত কাগজপত্র সম্পূর্ণ সত্য ও সঠিক। কোনো ভুল বা অসত্য তথ্য প্রদান করা হলে বা ভূমির সীমানা সংক্রান্ত কোনো বিরোধ সৃষ্টি হলে পৌরসভা কর্তৃপক্ষ আইনানুগ ব্যবস্থা গ্রহণ করতে পারবেন এবং আবেদন বাতিল বলে গণ্য হবে।
              <span className="text-red-600 font-bold ml-1">*</span>
            </span>
          </label>
          {errors.declaration && <p className="text-xs text-red-600">{errors.declaration}</p>}

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              * সরকারি ফি: <strong>৳ {paymentDetails.amount || 600}/- ({paymentDetails.status === 'paid' ? `পরিশোধিত - ${paymentDetails.methodNameBangla}` : 'অপরিশোধিত / কাউন্টারে প্রদেয়'})</strong>।
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleManualSave}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-sm font-bold rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-emerald-700" />
                <span>খসড়া সংরক্ষণ (Save Draft)</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-base font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>আবেদনপত্র সংরক্ষিত হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-5 h-5" />
                    <span>আবেদনপত্র জমা দিন (Submit Application)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
