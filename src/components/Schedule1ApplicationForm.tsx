import React, { useState, useEffect } from 'react';
import {
  DemarcationApplication,
  BuildingConstructionApplication,
  VALID_MOUZAS,
  VALID_WARDS,
} from '../types';
import {
  getStoredApplications,
  saveBuildingApplication,
  toBanglaNumber,
  formatBanglaDate,
  addAuditLog,
} from '../utils/storage';
import {
  Building2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Check,
  CreditCard,
  Printer,
  ChevronRight,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  MapPin,
  HelpCircle,
  BookOpen,
  Scale,
  Flame,
  Download,
  ExternalLink,
  Award
} from 'lucide-react';
import { Schedule1ApplicationPrintA4 } from './Schedule1ApplicationPrintA4';
import { 
  BuildingLegalDocumentsModal, 
  LegalDocId, 
  OFFICIAL_LEGAL_DOCUMENTS 
} from './BuildingLegalDocumentsModal';

interface Schedule1ApplicationFormProps {
  initialDemarcationApp?: DemarcationApplication | null;
  onSubmitted?: (app: BuildingConstructionApplication) => void;
  onCancel?: () => void;
}

export const Schedule1ApplicationForm: React.FC<Schedule1ApplicationFormProps> = ({
  initialDemarcationApp,
  onSubmitted,
  onCancel,
}) => {
  // Verification states
  const [demarcationSearchId, setDemarcationSearchId] = useState<string>(
    initialDemarcationApp?.id || ''
  );
  const [verifiedDemarcationApp, setVerifiedDemarcationApp] =
    useState<DemarcationApplication | null>(initialDemarcationApp || null);
  const [verificationError, setVerificationError] = useState<string>('');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocId>('rules1996');
  const [architectName, setArchitectName] = useState<string>('');
  const [architectDesignation, setArchitectDesignation] = useState<string>('স্নাতক স্থপতি (B.Arch)');
  const [architectRegNo, setArchitectRegNo] = useState<string>('');
  const [architectPhone, setArchitectPhone] = useState<string>('');
  const [checked7Drawings, setChecked7Drawings] = useState<boolean>(true);
  const [buildingFloorsTotal, setBuildingFloorsTotal] = useState<string>('৩');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Form Fields
  const [activityType, setActivityType] = useState<string>('building'); // 'building' | 'pond' | 'hill_cutting' | 'demolition'
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantFatherHusband, setApplicantFatherHusband] = useState<string>('');
  const [applicantPresentAddress, setApplicantPresentAddress] = useState<string>('');
  const [applicantPermanentAddress, setApplicantPermanentAddress] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantNid, setApplicantNid] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');

  // 3. Land / Site Details
  const [siteAreaName, setSiteAreaName] = useState<string>('সীতাকুণ্ড পৌরসভা');
  const [dagKhatianPlotNo, setDagKhatianPlotNo] = useState<string>('বি.এস দাগ নং- ১৫৩৩, বি.এস খতিয়ান নং- ২৭৪');
  const [mouzaBlockSector, setMouzaBlockSector] = useState<string>('আমিরাবাদ (জে.এল নং- ২৫)');
  const [wardNo, setWardNo] = useState<string>('৭ নং ওয়ার্ড');
  const [roadName, setRoadName] = useState<string>('পৌর মেইন রোড');
  const [sheetNo, setSheetNo] = useState<string>('০১ নং সিট');
  const [applicantShare, setApplicantShare] = useState<string>('সম্পূর্ণ অংশ (১০০%)');
  const [landAcquisitionSource, setLandAcquisitionSource] = useState<string>('সাফ-কবলা দলিল নং- ৪১৪/২৩');

  // 4. Site details
  const [siteAreaSize, setSiteAreaSize] = useState<string>('১০.৫০ শতাংশ');
  const [boundNorth, setBoundNorth] = useState<string>('উত্তরে ব্যক্তিমালিকানাধীন জায়গা');
  const [boundSouth, setBoundSouth] = useState<string>('দক্ষিণে পৌরসভা সড়ক');
  const [boundEast, setBoundEast] = useState<string>('পূর্বে সীমানা দেওয়াল');
  const [boundWest, setBoundWest] = useState<string>('পশ্চিমে খালি জমি');

  const [coveredFirstFloor, setCoveredFirstFloor] = useState<string>('১১৫.৫০');
  const [coveredOtherFloors, setCoveredOtherFloors] = useState<string>('২৩০.৪৯');

  const [nearestRoadName, setNearestRoadName] = useState<string>('পৌর প্রধান সংযোগ সড়ক');
  const [nearestRoadPosition, setNearestRoadPosition] = useState<string>('দক্ষিণ');
  const [nearestRoadDistance, setNearestRoadDistance] = useState<string>('১০ ফুট');
  const [nearestRoadWidth, setNearestRoadWidth] = useState<string>('১৮ ফুট');
  const [roadAccessWay, setRoadAccessWay] = useState<string>('পৌর মেইন রাস্তা হইতে সরাসরি প্রবেশপথ');

  const [setbackNorth, setSetbackNorth] = useState<string>('৫ ফুট');
  const [setbackSouth, setSetbackSouth] = useState<string>('৫ ফুট');
  const [setbackEast, setSetbackEast] = useState<string>('৩.৫ ফুট');
  const [setbackWest, setSetbackWest] = useState<string>('৩.৫ ফুট');

  // 5. Existing structure
  const [existingStructure, setExistingStructure] = useState<string>('কোন পূর্ব নির্মিত ইমারত নাই (খালি সাইট)');
  const [demolitionRequired, setDemolitionRequired] = useState<string>('না, কোনো অংশ ভাঙ্গার প্রয়োজন নাই');

  // 6. Utilities
  const [utilElectricity, setUtilElectricity] = useState<boolean>(true);
  const [utilWater, setUtilWater] = useState<boolean>(true);
  const [utilGas, setUtilGas] = useState<boolean>(false);
  const [utilSewerage, setUtilSewerage] = useState<boolean>(true);
  const [utilSepticTank, setUtilSepticTank] = useState<boolean>(true);

  // 7, 8
  const [workStartDate, setWorkStartDate] = useState<string>('২০২৬-১০-১৫');
  const [purpose, setPurpose] = useState<string>('পৌর এলাকার বিল্ডিং কোড অনুযায়ী পরিকল্পিত আবাসিক ভবন নির্মাণ।');

  // 9, 10
  const [priorNotice, setPriorNotice] = useState<boolean>(false);
  const [priorNoticeDetails, setPriorNoticeDetails] = useState<string>('');
  const [legalCase, setLegalCase] = useState<boolean>(false);
  const [legalCaseDetails, setLegalCaseDetails] = useState<string>('');

  // 11. Activity Distances
  const [distRoad, setDistRoad] = useState<string>('১০ ফুট');
  const [distBuilding, setDistBuilding] = useState<string>('১৫ ফুট');
  const [distDrain, setDistDrain] = useState<string>('৮ ফুট');
  const [distElectric, setDistElectric] = useState<string>('১২ ফুট');
  const [distGas, setDistGas] = useState<string>('নাই');

  // Form Validation and Submission Error State
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  // Fee & Payment (১,০০০/- টাকা) - ক্যাশ কাউন্টার ও ব্যাংক মারফত
  const [paymentMethod, setPaymentMethod] = useState<'counter_receipt'>('counter_receipt');
  const [moneyReceiptNo, setMoneyReceiptNo] = useState<string>('');
  const [moneyReceiptDate, setMoneyReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attachedDrawingsDesc, setAttachedDrawingsDesc] = useState<string>(
    'অনুমোদিত স্থপতি ও সিভিল প্রকৌশলী কর্তৃক প্রণীত প্লট মাস্টার প্ল্যান, ফ্লোর প্ল্যান, এলিভেশন ও সাইট লেআউট নক্সা সংযুক্ত করা হইয়াছে।'
  );
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);

  // Submission outcome state
  const [submittedApp, setSubmittedApp] = useState<BuildingConstructionApplication | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // If initialDemarcationApp passed, populate fields automatically
  useEffect(() => {
    if (initialDemarcationApp) {
      applyDemarcationToForm(initialDemarcationApp);
    }
  }, [initialDemarcationApp]);

  // Helper to populate form fields from approved demarcation app
  const applyDemarcationToForm = (app: DemarcationApplication) => {
    setVerifiedDemarcationApp(app);
    setVerificationError('');

    // Prepopulate applicant info
    setApplicantName(app.siteLocation.applicantName || app.landOwners[0]?.name || 'মোঃ রফিকুল ইসলাম');
    setApplicantFatherHusband(app.siteLocation.applicantFatherHusband || app.landOwners[0]?.fatherOrHusbandName || 'মরহুম শামসুল হক');
    setApplicantPresentAddress(app.siteLocation.applicantPresentAddress || app.landOwners[0]?.presentAddress || 'সীতাকুণ্ড পৌরসভা');
    setApplicantPermanentAddress(app.siteLocation.applicantPermanentAddress || app.landOwners[0]?.permanentAddress || 'সীতাকুণ্ড পৌরসভা');
    setApplicantPhone(app.siteLocation.applicantMobile || '01812345678');
    setApplicantNid(app.siteLocation.applicantNid || app.landOwners[0]?.nid || '1985159482000045');
    setApplicantEmail(app.siteLocation.applicantEmail || 'applicant@gmail.com');

    // Land / Site
    setSiteAreaName(`সীতাকুণ্ড পৌরসভা, ${app.schedule.wardNo || '১ নং ওয়ার্ড'}, ${app.siteLocation.roadOrArea || app.schedule.mouzaName}`);
    setDagKhatianPlotNo(`বি.এস দাগ নং- ${app.schedule.bsDagNo || '১৫৩৩'}, বি.এস খতিয়ান নং- ${app.schedule.bsKhatianNo || '২৭৪'}${app.schedule.createdBsKhatianNo ? `, সৃজিত খতিয়ান: ${app.schedule.createdBsKhatianNo}` : ''}`);
    setMouzaBlockSector(`${app.schedule.mouzaName} (জে.এল নং- ${app.schedule.jlNo})`);
    setWardNo(app.schedule.wardNo || '১ নং ওয়ার্ড');
    const cleanLandArea = (app.schedule.landArea || '').replace(/শতাংশ/g, '').trim() || '১০.৫০';
    setApplicantShare(`${cleanLandArea} শতাংশ (${app.schedule.landClass || 'বাস্তু'})`);
    setLandAcquisitionSource(`সাফ-কবলা দলিল নং- ${app.schedule.deedNo || '৪১৪/২৩'}${app.schedule.deedDate ? `, রেজিস্ট্রি তারিখ: ${app.schedule.deedDate}` : ''}`);

    // Site Area & Boundaries
    setSiteAreaSize(`${cleanLandArea} শতাংশ`);
    setBoundNorth(app.schedule.boundaryNorth || 'উত্তরে ব্যক্তিমালিকানাধীন জায়গা');
    setBoundSouth(app.schedule.boundarySouth || 'দক্ষিণে পৌরসভা সড়ক');
    setBoundEast(app.schedule.boundaryEast || 'পূর্বে সীমানা দেওয়াল');
    setBoundWest(app.schedule.boundaryWest || 'পশ্চিমে খালি জমি');
    setNearestRoadName(app.siteLocation.roadOrArea || 'পৌর প্রধান সড়ক');
    setNearestRoadPosition('দক্ষিণ');
    setNearestRoadDistance('১০ ফুট');
    setNearestRoadWidth('১৮ ফুট');
    setSetbackNorth('৫ ফুট');
    setSetbackSouth('৫ ফুট');
    setSetbackEast('৩.৫ ফুট');
    setSetbackWest('৩.৫ ফুট');
    setPurpose(app.proposedConstruction?.purpose || 'পৌর এলাকার বিল্ডিং কোড অনুযায়ী পরিকল্পিত আবাসিক ভবন নির্মাণ।');
    setMoneyReceiptNo(`MR-${Math.floor(10000 + Math.random() * 90000)}`);
    setDeclarationAccepted(true);
  };

  // Perform Demarcation Certificate Verification
  const handleVerifyDemarcation = () => {
    if (!demarcationSearchId.trim()) {
      setVerificationError('দয়া করে আপনার ডিমার্কেশন আবেদন ট্র্যাকিং আইডি অথবা প্রত্যয়নপত্র নং প্রবেশ করান।');
      setVerifiedDemarcationApp(null);
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    setTimeout(() => {
      const allApps = getStoredApplications();
      const cleanSearch = demarcationSearchId.trim().toUpperCase();

      const found = allApps.find(
        (a) =>
          a.id.toUpperCase() === cleanSearch ||
          (a.formNo && a.formNo.toUpperCase() === cleanSearch) ||
          (a.engineerApproval?.certificateNo && a.engineerApproval.certificateNo.toUpperCase() === cleanSearch) ||
          (a.siteLocation.applicantMobile && a.siteLocation.applicantMobile.includes(cleanSearch))
      );

      if (!found) {
        setVerificationError(
          `❌ '${demarcationSearchId}' নম্বরযুক্ত কোনো ডিমার্কেশন প্রত্যয়নপত্র পাওয়া যায়নি। দয়া করে সঠিক ট্র্যাকিং আইডি বা প্রত্যয়নপত্র নং দিন।`
        );
        setVerifiedDemarcationApp(null);
      } else if (found.status !== 'approved') {
        setVerificationError(
          `⚠️ আবেদন আইডি '${found.id}' এর ডিমার্কেশন আবেদনটি এখনও চূড়ান্ত অনুমোদিত হয়নি (বর্তমান অবস্থা: ${
            found.status === 'pending'
              ? 'অপেক্ষমান'
              : found.status === 'investigating'
              ? 'সরজমিনে তদন্তাধীন'
              : 'অননুমোদিত'
          })। শুধুমাত্র 'অনুমোদিত ও প্রত্যয়িত' আবেদনকারীগণ ইমারত নির্মাণ অনুমোদন আবেদন করতে পারবেন।`
        );
        setVerifiedDemarcationApp(null);
      } else {
        // Successfully verified approved demarcation
        applyDemarcationToForm(found);
      }
      setIsVerifying(false);
    }, 400);
  };

  // Quick helper to get Activity title
  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'building':
        return 'ইমারত নির্মাণ';
      case 'pond':
        return 'পুকুর খনন';
      case 'hill_cutting':
        return 'পাহাড় কর্তন বা ধ্বংস সাধন';
      case 'demolition':
        return 'পুরাতন স্থাপনা ধ্বংস সাধন / সংস্কার';
      default:
        return 'ইমারত নির্মাণ';
    }
  };

  // Quick Demo Auto-fill Helper
  const handleAutoFillDemo = () => {
    const allApps = getStoredApplications();
    const approved = allApps.find((a) => a.status === 'approved') || allApps[0];
    if (approved) {
      setDemarcationSearchId(approved.id);
      applyDemarcationToForm(approved);
    }
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Comprehensive required fields check
    const errors: string[] = [];

    // ৪। (গ) আচ্ছাদিত স্থান
    if (!coveredFirstFloor.trim()) errors.push('৪। (গ) ১ম তলা আচ্ছাদিত স্থানের পরিমাণ');
    if (!coveredOtherFloors.trim()) errors.push('৪। (গ) অন্যান্য তলা আচ্ছাদিত স্থানের পরিমাণ');

    // ৪। (ঘ) রাস্তার বিবরণ
    if (!nearestRoadName.trim()) errors.push('৪। (ঘ) (১) রাস্তার নাম');
    if (!nearestRoadPosition.trim()) errors.push('৪। (ঘ) (২) রাস্তার অবস্থান (কোনদিকে)');
    if (!nearestRoadDistance.trim()) errors.push('৪। (ঘ) (৩) রাস্তার দূরত্ব');
    if (!nearestRoadWidth.trim()) errors.push('৪। (ঘ) (৪) রাস্তার বিস্তার (প্রস্থ)');

    // ৪। (চ) উন্মুক্ত স্থান (সেটব্যাক)
    if (!setbackNorth.trim()) errors.push('৪। (চ) উত্তর সীমানা হইতে উন্মুক্ত স্থান (সেটব্যাক)');
    if (!setbackSouth.trim()) errors.push('৪। (চ) দক্ষিণ সীমানা হইতে উন্মুক্ত স্থান (সেটব্যাক)');
    if (!setbackEast.trim()) errors.push('৪। (চ) পূর্ব সীমানা হইতে উন্মুক্ত স্থান (সেটব্যাক)');
    if (!setbackWest.trim()) errors.push('৪। (চ) পশ্চিম সীমানা হইতে উন্মুক্ত স্থান (সেটব্যাক)');

    // ৮। প্রস্তাবিত ইমারত নির্মাণের উদ্দেশ্য
    if (!purpose.trim()) errors.push(`৮। প্রস্তাবিত ${getActivityTitle(activityType)} এর উদ্দেশ্য`);

    // ১১। প্রস্তাবিত সাইট হইতে নিকটবর্তী দূরত্বসমূহের বিবরণ
    if (!distRoad.trim()) errors.push('১১। (ক) রাস্তার দূরত্ব');
    if (!distBuilding.trim()) errors.push('১১। (খ) ইমারতের দূরত্ব');
    if (!distDrain.trim()) errors.push('১১। (গ) পয়ঃ নালার দূরত্ব');
    if (!distElectric.trim()) errors.push('১১। (ঘ) বিদ্যুৎ লাইন দূরত্ব');
    if (!distGas.trim()) errors.push('১১। (ঙ) গ্যাস লাইন দূরত্ব');

    // ফি পরিশোধ: রশিদ মারফত জমা হইলে রসিদ নম্বর আবশ্যক
    if (paymentMethod === 'counter_receipt' && !moneyReceiptNo.trim()) {
      errors.push('ফি পরিশোধ: পৌরসভা ক্যাশ রসিদ নম্বর');
    }

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      const firstSectionElement = document.getElementById('schedule1-form-section');
      if (firstSectionElement) {
        firstSectionElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
      return;
    }

    setFormValidationErrors([]);

    if (!declarationAccepted) {
      alert('দয়া করে বিধিসম্মত ঘোষণা ও অঙ্গীকারনামায় সম্মতি দিন।');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppId = `SKM-BLD-2026-${randomSuffix}`;
    const newFormNo = `SKM-BLD-FORM-${Math.floor(910000 + (randomSuffix % 500))}`;
    const finalReceiptNo = moneyReceiptNo.trim() || `MR-2026-${Math.floor(5000 + Math.random() * 5000)}`;
    const finalName = applicantName.trim() || verifiedDemarcationApp?.siteLocation.applicantName || 'মোঃ আবেদনকারী';
    const finalFather = applicantFatherHusband.trim() || verifiedDemarcationApp?.siteLocation.applicantFatherHusband || 'মরহুম পিতা';
    const finalPhone = applicantPhone.trim() || verifiedDemarcationApp?.siteLocation.applicantMobile || '01812345678';
    const finalWard = wardNo || verifiedDemarcationApp?.schedule.wardNo || '৭ নং ওয়ার্ড';
    const finalMouza = mouzaBlockSector.split('(')[0].trim() || verifiedDemarcationApp?.schedule.mouzaName || 'আমিরাবাদ';

    const newBuildingApp: BuildingConstructionApplication = {
      id: newAppId,
      formNo: newFormNo,
      createdAt: new Date().toISOString().split('T')[0],
      demarcationTrackingId: verifiedDemarcationApp?.id || demarcationSearchId || `SKM-DEM-2026-${String(randomSuffix).padStart(4, '0')}`,
      demarcationAppId: verifiedDemarcationApp?.id || demarcationSearchId || `SKM-DEM-2026-${String(randomSuffix).padStart(4, '0')}`,
      demarcationFormNo: verifiedDemarcationApp?.formNo || `SKM-FORM-${849000 + (randomSuffix % 500)}`,
      demarcationCertificateNo:
        verifiedDemarcationApp?.engineerApproval?.certificateNo ||
        `SKM/ENGG/DEM/2026/${1000 + (randomSuffix % 500)}`,
      certificateIssueDate:
        verifiedDemarcationApp?.engineerApproval?.approvalDate ||
        verifiedDemarcationApp?.createdAt ||
        new Date().toISOString().split('T')[0],
      activityType: activityType,
      activityTypeTitle: getActivityTitle(activityType),

      applicantName: finalName,
      applicantFatherHusband: finalFather,
      applicantPresentAddress: applicantPresentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
      applicantPermanentAddress: applicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
      applicantPhone: finalPhone,
      applicantMobile: finalPhone,
      applicantNid: applicantNid || '1985159482000045',
      applicantEmail: applicantEmail,

      architectName: architectName || 'স্থপতি মোঃ কামরুল হাসান (B.Arch, IAB Reg: A-1240)',
      architectDesignation: architectDesignation || 'স্নাতক স্থপতি (B.Arch)',
      architectRegNo: architectRegNo || 'IAB-A1240',
      architectPhone: architectPhone || '01811111111',

      siteDetails: {
        holdingNo: '৫৮৮',
        roadName: roadName || 'পৌর প্রধান সড়ক',
        wardNo: finalWard,
        mouzaName: finalMouza,
        jlNo: '২৫',
        csKhatian: '১৮২',
        csDag: '৬৪০',
        saKhatian: '২৪৫',
        saDag: '৮৯০',
        rsKhatian: '২২৮',
        rsDag: '১১৭৪',
        bsKhatian: '২৭৪',
        bsDag: '১৫৩৩',
        boundaryNorth: boundNorth || 'উত্তরে ব্যক্তিমালিকানাধীন জায়গা',
        boundarySouth: boundSouth || 'দক্ষিণে পৌরসভা সড়ক',
        boundaryEast: boundEast || 'পূর্বে সীমানা দেওয়াল',
        boundaryWest: boundWest || 'পশ্চিমে খালি জমি',
      },

      constructionDetails: {
        constructionNature: 'new',
        natureTitle: 'নতুন ইমারত নির্মাণ',
        buildingUseType: 'residential',
        useTypeTitle: 'আবাসিক ভবন',
        structureType: 'rcc',
        structureTitle: 'আরসিসি (RCC) ফ্রেম স্ট্রাকচার',
        floorsCount: `${buildingFloorsTotal} তলা`,
        totalHeightMeters: String(parseInt(buildingFloorsTotal || '3') * 3.2),
        totalCoveredAreaSqM: parseFloat(coveredFirstFloor || '115.5') + parseFloat(coveredOtherFloors || '230.5'),
        groundCoverageSqM: Math.round(parseFloat(coveredFirstFloor || '115.5')),
      },

      siteAreaName: siteAreaName,
      dagKhatianPlotNo: dagKhatianPlotNo,
      mouzaBlockSector: mouzaBlockSector,
      wardNo: wardNo,
      roadName: roadName,
      sheetNo: sheetNo,
      applicantShare: applicantShare,
      landAcquisitionSource: landAcquisitionSource,

      siteAreaSize: siteAreaSize,
      siteBoundaries: {
        north: boundNorth,
        south: boundSouth,
        east: boundEast,
        west: boundWest,
      },
      coveredArea: {
        firstFloor: coveredFirstFloor,
        otherFloors: coveredOtherFloors,
      },
      nearestRoad: {
        name: nearestRoadName,
        position: nearestRoadPosition,
        distance: nearestRoadDistance,
        width: nearestRoadWidth,
      },
      roadAccessWay: roadAccessWay,
      setbacks: {
        north: setbackNorth,
        south: setbackSouth,
        east: setbackEast,
        west: setbackWest,
      },

      existingStructureCountAndArea: existingStructure,
      demolitionRequiredDetails: demolitionRequired,

      utilities: {
        electricity: utilElectricity,
        water: utilWater,
        gas: utilGas,
        sewerage: utilSewerage,
        septicTank: utilSepticTank,
      },

      workStartDate: workStartDate,
      purpose: purpose,

      priorNoticeIssued: priorNotice,
      priorNoticeDetails: priorNoticeDetails,
      legalCaseFiled: legalCase,
      legalCaseDetails: legalCaseDetails,

      activityDistances: {
        roadDistance: distRoad,
        buildingDistance: distBuilding,
        drainDistance: distDrain,
        electricLineDistance: distElectric,
        gasLineDistance: distGas,
      },

      feeAmount: 1000,
      feeStatus: moneyReceiptNo.trim() ? 'paid' : 'unpaid',
      paymentMethod: 'counter_receipt',
      paymentMethodTitle: 'পৌরসভা ক্যাশ কাউন্টার রসিদ',
      moneyReceiptNo: moneyReceiptNo.trim() || undefined,
      moneyReceiptDate: moneyReceiptDate || new Date().toISOString().split('T')[0],
      trxId: moneyReceiptNo.trim() || `MR-${Math.floor(100000 + Math.random() * 900000)}`,
      attachedDrawingsDescription: attachedDrawingsDesc,

      declarationAccepted: true,
      status: 'submitted',
    };

    // Save to storage
    saveBuildingApplication(newBuildingApp);

    // Audit log
    addAuditLog({
      officerUsername: 'citizen.portal',
      officerName: applicantName,
      officerRole: 'citizen',
      officerDesignation: 'আবেদনকারী',
      actionType: 'schedule1_applied',
      actionTitle: 'তফসিল-১ আবেদন দাখিল',
      targetId: newAppId,
      applicantName: applicantName,
      details: `তফসিল-১ অনুযায়ী ${getActivityTitle(activityType)} এর জন্য ১,০০০/- টাকা ফি সহ আবেদন দাখিল করা হইয়াছে (ডিমার্কেশন প্রত্যয়নপত্র নং: ${newBuildingApp.demarcationCertificateNo})।`,
    });

    setSubmittedApp(newBuildingApp);
    if (onSubmitted) {
      onSubmitted(newBuildingApp);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If already submitted, display success screen
  if (submittedApp) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-emerald-200 shadow-xl p-6 sm:p-10 text-slate-800">
        <div className="text-center pb-6 border-b border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 mb-2">
            আবেদন সফলভাবে দাখিল হয়েছে • ফি: ১,০০০/- (পরিশোধিত)
          </span>
          <h2 className="text-2xl font-bold text-emerald-950">
            তফসিল - ১ আবেদন পত্র সফলভাবে গৃহীত হয়েছে
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Building Construction Act, 1952 এর Section 3 ও 3c অনুযায়ী {submittedApp.activityTypeTitle} অনুমোদন আবেদন নিবন্ধন সম্পন্ন হয়েছে।
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">তফসিল-১ আবেদন ট্র্যাকিং আইডি:</span>
            <span className="text-lg font-mono font-bold text-emerald-900">{submittedApp.id}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">তফসিল-১ ফরম নং:</span>
            <span className="text-lg font-mono font-bold text-slate-900">{submittedApp.formNo}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">সংযুক্ত ডিমার্কেশন প্রত্যয়নপত্র নং:</span>
            <span className="text-sm font-mono font-bold text-slate-800">{submittedApp.demarcationCertificateNo}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">আবেদনকারীর নাম ও মোবাইল:</span>
            <span className="text-sm font-bold text-slate-900">{submittedApp.applicantName} ({toBanglaNumber(submittedApp.applicantPhone)})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => setShowPrintModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>তফসিল - ১ আবেদন পত্র প্রিন্ট / PDF সংরক্ষণ (A4)</span>
          </button>
          <button
            onClick={() => {
              setSubmittedApp(null);
              if (onCancel) onCancel();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300 cursor-pointer transition-all"
          >
            বন্ধ করুন / হোম পেজে ফিরে যান
          </button>
        </div>

        {/* Schedule-1 Print Modal */}
        {showPrintModal && (
          <Schedule1ApplicationPrintA4
            application={submittedApp}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* =========================================================================
          Header Card: Schedule - 1 Statutory Legal Notice & Info
          ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>তফসিল - ১ [বিধি ২ এর দফা (চ) দ্রষ্টব্য]</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              ইমারত নির্মাণ অনুমোদনের আবেদন
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              Building Construction Act, 1952 (E. B. Act II of 1953) এর Section 3 এবং 3c এর অধীন সীতাকুণ্ড পৌরসভা এলাকায় যেকোনো ইমারত নির্মাণ অনুমোদনের জন্য নির্ধারিত ফরম।
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-center bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-center shrink-0">
            <span className="text-[11px] text-emerald-200 font-semibold">আবেদন ফরমের সরকারি ফি</span>
            <span className="text-2xl font-extrabold text-white">১,০০০/-</span>
            <span className="text-[10px] text-emerald-300">টাকা (অফেরতযোগ্য)</span>
          </div>
        </div>

        {/* Eligibility Rule Warning & Legal Rules Guide Buttons */}
        <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-200 bg-amber-950/40 px-3.5 py-2 rounded-lg border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>শর্ত:</strong> শুধুমাত্র সীতাকুণ্ড পৌরসভার <strong>'ভূমির সীমানা নির্ধারণ (ডিমার্কেশন) ও মালিকানা সঠিকতা প্রত্যয়নপত্র'</strong> প্রাপ্ত আবেদনকারীগণ এই ফরমটি দাখিল করতে পারবেন।
            </span>
          </div>


        </div>
      </div>

      {/* =========================================================================
          Step 1: Demarcation Certificate Verification Gatekeeper (পূর্বশর্ত)
          ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ডিমার্কেশন ও মালিকানা প্রত্যয়নপত্র যাচাই (পূর্বশর্ত)
            </h3>
            <p className="text-xs text-slate-500">
              আপনার অনুমোদিত ডিমার্কেশন আবেদন ট্র্যাকিং আইডি অথবা প্রত্যয়নপত্র নং প্রবেশ করিয়ে তথ্য যাচাই করুন
            </p>
          </div>
        </div>

        {/* Verification Input Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={demarcationSearchId}
              onChange={(e) => setDemarcationSearchId(e.target.value)}
              placeholder="উদাঃ SKM-DEM-2026-0005 বা SKM-FORM-849005 বা প্রত্যয়নপত্র নং"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleVerifyDemarcation}
              disabled={isVerifying}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>যাচাই হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>প্রত্যয়নপত্র যাচাই ও ডাটা লোড</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
              title="অনুমোদিত ডিমার্কেশন প্রত্যয়নপত্রের ডেমো তথ্য দিয়ে এক ক্লিকে সম্পূর্ণ ফরম পূরণ করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>ডেমো অটো-ফিল</span>
            </button>
          </div>
        </div>

        {/* Verification Error Box */}
        {verificationError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{verificationError}</div>
          </div>
        )}

        {/* Verification Success Verified Card */}
        {verifiedDemarcationApp && (
          <div className="mt-5 p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    যাচাইকৃত ডিমার্কেশন প্রত্যয়নপত্র সনাক্ত হয়েছে
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    আইডি: <strong>{verifiedDemarcationApp.id}</strong> | ফরম নং: <strong>{verifiedDemarcationApp.formNo}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>অনুমোদিত ও প্রত্যয়িত</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">আবেদনকারীর নাম:</span>
                <strong className="text-slate-900">{verifiedDemarcationApp.siteLocation.applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">মৌজা ও জে.এল নং:</span>
                <strong className="text-slate-900">{verifiedDemarcationApp.schedule.mouzaName} ({verifiedDemarcationApp.schedule.jlNo})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">দাগ ও খতিয়ান:</span>
                <strong className="text-slate-900">দাগ: {verifiedDemarcationApp.schedule.bsDagNo}, খতিয়ান: {verifiedDemarcationApp.schedule.bsKhatianNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">জমির পরিমাণ:</span>
                <strong className="text-emerald-900">{verifiedDemarcationApp.schedule.landArea} শতাংশ</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          Main Form: 11 Statutory Points + Fee Payment (Always Open & Accessible)
          ========================================================================= */}
      <form id="schedule1-form-section" onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors Alert Banner */}
          {hasAttemptedSubmit && formValidationErrors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 sm:p-6 text-red-900 shadow-sm animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
                  !
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-950 mb-1.5">
                    আবেদন দাখিলের জন্য নিম্নলিখিত বাধ্যতামূলক তথ্যসমূহ পূরণ করা আবশ্যক:
                  </h4>
                  <p className="text-xs text-red-800 mb-3 font-medium">
                    ফরমের লাল চিহ্নিত ফিল্ডগুলো পূরণ না করিয়া আবেদন সাবমিট করা যাইবে না। দয়া করে প্রতিটি আবশ্যক ঘর পূরণ করুন:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 font-semibold text-red-900">
                    {formValidationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Approval Activity Type: Focused solely on Building Construction */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>অনুমোদনের আবেদনের বিষয়বস্তু / ধরণ:</span>
            </h4>

            <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-emerald-950 block">ইমারত নির্মাণ অনুমোদন</span>
                  <span className="text-xs text-slate-600">বহুতল/একতলা আবাসিক বা বাণিজ্যিক ভবন, সীমানা প্রাচীর ও অন্যান্য স্থাপনা</span>
                </div>
              </div>
              <span className="bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-xs">
                তফসিল - ১ (ফর্ম-ক)
              </span>
            </div>
          </div>

          {/* ১ & ২। আবেদনকারীর তথ্য ও ঠিকানা */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-mono">১-২</span>
              <span>আবেদনকারীর পূর্ণ নাম ও ঠিকানাসমূহ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ১। আবেদনকারী/আবেদনকারীগণের পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  পিতা / স্বামীর নাম
                </label>
                <input
                  type="text"
                  value={applicantFatherHusband}
                  onChange={(e) => setApplicantFatherHusband(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ২। (ক) বর্তমান/ডাকযোগাযোগের ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  value={applicantPresentAddress}
                  onChange={(e) => setApplicantPresentAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ২। (খ) স্থায়ী ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  value={applicantPermanentAddress}
                  onChange={(e) => setApplicantPermanentAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  জাতীয় পরিচয়পত্র (NID) নম্বর
                </label>
                <input
                  type="text"
                  value={applicantNid}
                  onChange={(e) => setApplicantNid(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* ৩। দাগ ও ভূমির বিবরণ */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-mono">৩</span>
              <span>যে দাগের জমিতে {getActivityTitle(activityType)} করা হইবে উহার বিবরণ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (ক) পৌরসভা/গ্রাম/মহল্লা/এলাকা:
                </label>
                <input
                  type="text"
                  value={siteAreaName}
                  onChange={(e) => setSiteAreaName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (খ) দাগ ও খতিয়ান নং/প্লট নং:
                </label>
                <input
                  type="text"
                  value={dagKhatianPlotNo}
                  onChange={(e) => setDagKhatianPlotNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (গ) মৌজার নাম/ব্লক/সেক্টর:
                </label>
                <input
                  type="text"
                  value={mouzaBlockSector}
                  onChange={(e) => setMouzaBlockSector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (ঘ) ওয়ার্ড নং:
                </label>
                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {VALID_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (ঙ) রাস্তার নাম:
                </label>
                <input
                  type="text"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (চ) সিট নং:
                </label>
                <input
                  type="text"
                  value={sheetNo}
                  onChange={(e) => setSheetNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  (ছ) দাগে আবেদনকারীগণের অংশের পরিমাণ:
                </label>
                <input
                  type="text"
                  value={applicantShare}
                  onChange={(e) => setApplicantShare(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  (জ) কি সূত্রে সাইটের জমি অর্জন করিয়াছেন (মালিকানার প্রমাণপত্র):
                </label>
                <input
                  type="text"
                  value={landAcquisitionSource}
                  onChange={(e) => setLandAcquisitionSource(e.target.value)}
                  placeholder="উদাঃ ক্রয়সূত্রে সাফ-কবলা দলিল নং- ৫৬৭৮/২০২১, তারিখ: ১২/০৩/২০২১ ইং"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ৪। সাইটের বিবরণ (আয়তন, চতুর্সীমা, সেটব্যাক ও আচ্ছাদিত স্থান) */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-mono">৪</span>
              <span>সাইটের বিবরণ (আয়তন, বাহুর দৈর্ঘ্য, আচ্ছাদিত স্থান ও উন্মুক্ত স্থান)</span>
            </h4>

            {/* ৪ (ক) ও (খ) আয়তন ও চৌহদ্দী */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  (ক) সাইটের আয়তন (ক্ষেত্রফল):
                </label>
                <input
                  type="text"
                  value={siteAreaSize}
                  onChange={(e) => setSiteAreaSize(e.target.value)}
                  className="w-full max-w-md px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  (খ) প্রস্তাবিত ভূমির চতুর্সীমা (চৌহদ্দি): <span className="text-emerald-700 text-[11px] font-normal">(ডিমার্কেশন প্রত্যয়নপত্র মোতাবেক)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      উত্তর সীমানা (উত্তরে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: নিজস্ব জমি / রাস্তা"
                      value={boundNorth}
                      onChange={(e) => setBoundNorth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      দক্ষিণ সীমানা (দক্ষিণে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: পার্শ্ববর্তী সীমানা"
                      value={boundSouth}
                      onChange={(e) => setBoundSouth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      পূর্ব সীমানা (পূর্বে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: সংযোগ সড়ক ও ড্রেন"
                      value={boundEast}
                      onChange={(e) => setBoundEast(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      পশ্চিম সীমানা (পশ্চিমে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: সীমানা প্রাচীর"
                      value={boundWest}
                      onChange={(e) => setBoundWest(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* ৪ (গ) আচ্ছাদিত স্থান */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    (গ) ১ম তলা আচ্ছাদিত স্থানের পরিমাণ: <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ১৫০০ বর্গফুট"
                    value={coveredFirstFloor}
                    onChange={(e) => setCoveredFirstFloor(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-colors ${
                      hasAttemptedSubmit && !coveredFirstFloor.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !coveredFirstFloor.trim() && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">১ম তলা আচ্ছাদিত স্থানের পরিমাণ আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    (গ) অন্যান্য তলা আচ্ছাদিত স্থানের পরিমাণ: <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ১৫০০ বর্গফুট / প্রযোজ্য নহে"
                    value={coveredOtherFloors}
                    onChange={(e) => setCoveredOtherFloors(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-colors ${
                      hasAttemptedSubmit && !coveredOtherFloors.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !coveredOtherFloors.trim() && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">অন্যান্য তলা আচ্ছাদিত স্থানের পরিমাণ আবশ্যক *</p>
                  )}
                </div>
              </div>

              {/* ৪ (ঘ) ও (ঙ) রাস্তা ও যাতায়াত */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    (ঘ) (১) রাস্তার নাম: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ স্টেশন রোড / সংযোগ সড়ক"
                    value={nearestRoadName}
                    onChange={(e) => setNearestRoadName(e.target.value)}
                    className={`w-full px-3 py-1.5 border rounded-lg ${
                      hasAttemptedSubmit && !nearestRoadName.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !nearestRoadName.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">রাস্তার নাম আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    (ঘ) (২) অবস্থান (কোনদিকে): <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ পূর্ব / সম্মুখ"
                    value={nearestRoadPosition}
                    onChange={(e) => setNearestRoadPosition(e.target.value)}
                    className={`w-full px-3 py-1.5 border rounded-lg ${
                      hasAttemptedSubmit && !nearestRoadPosition.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !nearestRoadPosition.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">অবস্থান আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    (ঘ) (৩) দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ০ ফুট / সংলগ্ন"
                    value={nearestRoadDistance}
                    onChange={(e) => setNearestRoadDistance(e.target.value)}
                    className={`w-full px-3 py-1.5 border rounded-lg ${
                      hasAttemptedSubmit && !nearestRoadDistance.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !nearestRoadDistance.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">দূরত্ব আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    (ঘ) (৪) বিস্তার (প্রস্থ): <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ২০ ফুট"
                    value={nearestRoadWidth}
                    onChange={(e) => setNearestRoadWidth(e.target.value)}
                    className={`w-full px-3 py-1.5 border rounded-lg ${
                      hasAttemptedSubmit && !nearestRoadWidth.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !nearestRoadWidth.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">বিস্তার (প্রস্থ) আবশ্যক *</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  (ঙ) নিকটস্থ রাস্তা হইতে সাইটে যাতায়াতের উপায়:
                </label>
                <input
                  type="text"
                  value={roadAccessWay}
                  onChange={(e) => setRoadAccessWay(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* ৪ (চ) বিভিন্ন দিকে উন্মুক্ত স্থান (Setbacks) */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  (চ) সাইটের বিভিন্ন দিকে যে পরিমাণ স্থান উন্মুক্ত রাখা হইবে (সেটব্যাক): <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600 block mb-0.5">
                      উত্তর সীমানা হইতে: <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৫ ফুট"
                      value={setbackNorth}
                      onChange={(e) => setSetbackNorth(e.target.value)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs ${
                        hasAttemptedSubmit && !setbackNorth.trim()
                          ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                      }`}
                    />
                    {hasAttemptedSubmit && !setbackNorth.trim() && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">উত্তর সেটব্যাক আবশ্যক *</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-0.5">
                      দক্ষিণ সীমানা হইতে: <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৫ ফুট"
                      value={setbackSouth}
                      onChange={(e) => setSetbackSouth(e.target.value)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs ${
                        hasAttemptedSubmit && !setbackSouth.trim()
                          ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                      }`}
                    />
                    {hasAttemptedSubmit && !setbackSouth.trim() && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">দক্ষিণ সেটব্যাক আবশ্যক *</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-0.5">
                      পূর্ব সীমানা হইতে: <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৭.৫ ফুট"
                      value={setbackEast}
                      onChange={(e) => setSetbackEast(e.target.value)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs ${
                        hasAttemptedSubmit && !setbackEast.trim()
                          ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                      }`}
                    />
                    {hasAttemptedSubmit && !setbackEast.trim() && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">পূর্ব সেটব্যাক আবশ্যক *</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-0.5">
                      পশ্চিম সীমানা হইতে: <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ ৫ ফুট"
                      value={setbackWest}
                      onChange={(e) => setSetbackWest(e.target.value)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs ${
                        hasAttemptedSubmit && !setbackWest.trim()
                          ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                      }`}
                    />
                    {hasAttemptedSubmit && !setbackWest.trim() && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">পশ্চিম সেটব্যাক আবশ্যক *</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ৫। পূর্ব নির্মিত ইমারত ও ৬। সেবা-সুযোগের বিবরণ */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-mono">৫-৬</span>
              <span>পূর্ব নির্মিত ইমারত এবং এলাকার সেবা-সুযোগের বিবরণ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ৫। (ক) পূর্ব নির্মিত ইমারতের সংখ্যা ও তদ্বারা বেষ্টিত স্থানের পরিমাণ:
                </label>
                <input
                  type="text"
                  value={existingStructure}
                  onChange={(e) => setExistingStructure(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ৫। (খ) কোনো অংশ ভাঙ্গিতে হইবে কিনা এবং হইলে স্থানের পরিমাণ:
                </label>
                <input
                  type="text"
                  value={demolitionRequired}
                  onChange={(e) => setDemolitionRequired(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* ৬। সেবা-সুযোগের চেকবক্স */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                ৬। এলাকার বিভিন্ন সেবা-সুযোগের বিবরণ (টিক চিহ্ন দিন):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={utilElectricity}
                    onChange={(e) => setUtilElectricity(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">(ক) বিদ্যুৎ লাইন</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={utilWater}
                    onChange={(e) => setUtilWater(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">(খ) পানি সরবরাহ</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={utilGas}
                    onChange={(e) => setUtilGas(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">(গ) গ্যাস লাইন</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={utilSewerage}
                    onChange={(e) => setUtilSewerage(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">(ঘ) পয়ঃনিষ্কাশন</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={utilSepticTank}
                    onChange={(e) => setUtilSepticTank(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">(ঙ) সেপ্টিক ট্যাংক</span>
                </label>
              </div>
            </div>
          </div>

          {/* ৭, ৮, ৯, ১০, ১১। উদ্দেশ্য, নোটিশ, মামলা ও দূরত্বের বিবরণ */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-mono">৭-১১</span>
              <span>উদ্দেশ্য, নোটিশ/মামলার ঘোষণা ও স্থানিক দূরত্বের বিবরণ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ৭। কাজ কখন শুরু হইবে (সম্ভাব্য তারিখ):
                </label>
                <input
                  type="date"
                  value={workStartDate}
                  onChange={(e) => setWorkStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ৮। প্রস্তাবিত {getActivityTitle(activityType)} এর উদ্দেশ্য: <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ আবাসিক বহুতল ভবন নির্মাণ ও বসবাস"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-colors ${
                    hasAttemptedSubmit && !purpose.trim()
                      ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                  }`}
                />
                {hasAttemptedSubmit && !purpose.trim() && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">নির্মাণের উদ্দেশ্য উল্লেখ করা আবশ্যক *</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ৯। Building Construction Act, 1952 এর অধীন পূর্বে কোনো নোটিশ জারী হইয়াছে কিনা:
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="radio"
                      name="priorNotice"
                      checked={!priorNotice}
                      onChange={() => setPriorNotice(false)}
                      className="text-emerald-600"
                    />
                    <span>না, কোনো নোটিশ জারী হয় নাই</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="radio"
                      name="priorNotice"
                      checked={priorNotice}
                      onChange={() => setPriorNotice(true)}
                      className="text-emerald-600"
                    />
                    <span>হ্যাঁ, নোটিশ জারী হইয়াছে</span>
                  </label>
                </div>
                {priorNotice && (
                  <input
                    type="text"
                    placeholder="নোটিশের স্মারক ও বিবরণ লিখুন"
                    value={priorNoticeDetails}
                    onChange={(e) => setPriorNoticeDetails(e.target.value)}
                    className="mt-2 w-full px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ১০। Building Construction Act, 1952 এর Section 12 এর অধীন কোনো মামলা দায়ের করা হইয়াছে কিনা:
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="radio"
                      name="legalCase"
                      checked={!legalCase}
                      onChange={() => setLegalCase(false)}
                      className="text-emerald-600"
                    />
                    <span>না, কোনো মামলা নাই</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="radio"
                      name="legalCase"
                      checked={legalCase}
                      onChange={() => setLegalCase(true)}
                      className="text-emerald-600"
                    />
                    <span>হ্যাঁ, মামলা দায়ের করা হইয়াছে</span>
                  </label>
                </div>
                {legalCase && (
                  <input
                    type="text"
                    placeholder="মামলা নং ও আদালতের বিবরণ লিখুন"
                    value={legalCaseDetails}
                    onChange={(e) => setLegalCaseDetails(e.target.value)}
                    className="mt-2 w-full px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>
            </div>

            {/* ১১। দূরত্বের বিবরণ */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ১১। প্রস্তাবিত সাইট হইতে নিকটবর্তী দূরত্বসমূহের বিবরণ: <span className="text-red-600 font-bold">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 block mb-0.5">
                    (ক) রাস্তার দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ০ ফুট / সংলগ্ন"
                    value={distRoad}
                    onChange={(e) => setDistRoad(e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                      hasAttemptedSubmit && !distRoad.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !distRoad.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">রাস্তার দূরত্ব আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-600 block mb-0.5">
                    (খ) ইমারতের দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ১৫ ফুট"
                    value={distBuilding}
                    onChange={(e) => setDistBuilding(e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                      hasAttemptedSubmit && !distBuilding.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !distBuilding.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">ইমারতের দূরত্ব আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-600 block mb-0.5">
                    (গ) পয়ঃ নালার দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ১০ ফুট"
                    value={distDrain}
                    onChange={(e) => setDistDrain(e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                      hasAttemptedSubmit && !distDrain.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !distDrain.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">পয়ঃনালার দূরত্ব আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-600 block mb-0.5">
                    (ঘ) বিদ্যুৎ লাইন দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ২০ ফুট"
                    value={distElectric}
                    onChange={(e) => setDistElectric(e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                      hasAttemptedSubmit && !distElectric.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !distElectric.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">বিদ্যুৎ দূরত্ব আবশ্যক *</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-600 block mb-0.5">
                    (ঙ) গ্যাস লাইন দূরত্ব: <span className="text-red-600 font-bold">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ৩০ ফুট / সংযোগ নাই"
                    value={distGas}
                    onChange={(e) => setDistGas(e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                      hasAttemptedSubmit && !distGas.trim()
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none'
                    }`}
                  />
                  {hasAttemptedSubmit && !distGas.trim() && (
                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">গ্যাস দূরত্ব আবশ্যক *</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ইমারত নির্মাণ বিধিমালা, ১৯৯৬ কমপ্লায়েন্স ও নকশা প্রণয়নকারী তথ্য (বিধি ৫ ও ৬)
              ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  ★
                </span>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>নকশা প্রণয়নকারীর বিবরণ ও ৭ ফর্দ নকশা চেকলিস্ট (বিধি ৫ ও ৬)</span>
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setIsLegalModalOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>বিধিমালা ১৯৯৬ ও তফসিল-২ দেখুন</span>
              </button>
            </div>

            {/* Architect / Engineer Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>নকশা প্রণয়নকারী স্থপতি / প্রকৌশলী / ডিপ্লোমা নকশাকারের বিবরণ (বিধি ৬ অনুযায়ী):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    নকশা প্রণয়নকারীর পূর্ণ নাম: <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: স্থপতি তানভীর আহমেদ"
                    value={architectName}
                    onChange={(e) => setArchitectName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    কারিগরি যোগ্যতা ও পদবী: <span className="text-red-600 font-bold">*</span>
                  </label>
                  <select
                    value={architectDesignation}
                    onChange={(e) => setArchitectDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="স্নাতক স্থপতি (B.Arch)">স্নাতক স্থপতি (B.Arch - IAB)</option>
                    <option value="স্নাতক পুর কৌশলী (B.Sc Civil)">স্নাতক পুর কৌশলী (B.Sc Civil - IEB)</option>
                    <option value="ডিপ্লোমা স্থপতি (Diploma Arch)">ডিপ্লোমা স্থপতি (কারিগরি বোর্ড)</option>
                    <option value="ডিপ্লোমা পুর কৌশলী (Diploma Civil)">ডিপ্লোমা পুর কৌশলী (কারিগরি বোর্ড)</option>
                    <option value="সার্টিফিকেটপ্রাপ্ত নক্সাকার">সার্টিফিকেটপ্রাপ্ত নক্সাকার</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    রেজিস্ট্রেশন / মেম্বারশিপ নং: <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ IAB-A/1284 বা IEB-M/45210"
                    value={architectRegNo}
                    onChange={(e) => setArchitectRegNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 7 Drawings Checklist Box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-emerald-950 block">
                ইমারত নির্মাণ বিধিমালা ১৯৯৬ এর বিধি ৫ মোতাবেক সংযুক্ত ৭ ফর্দ নকশা চেকলিস্ট:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>১:২০০ স্কেলে সাইট লে-আউট প্ল্যান ও চৌহদ্দি</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>সি.এস / আর.এস মৌজা দাগ অবস্থান নির্দেশক সাইট প্ল্যান</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>১:৫০ বা ১:১০০ স্কেলে প্রতিটি তলার বিস্তারিত ফ্লোর প্ল্যান</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>প্রধান সড়ক সম্মুখের এলিভেশন ও ক্রস সেকশন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>সিঁড়িঘর, র‍্যাম্প ও জরুরি নির্গমন পথের সেকশন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={checked7Drawings}
                    onChange={(e) => setChecked7Drawings(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>কার্নিশ, সানসেড, ছাদ ও পার্কিং লে-আউট ড্রয়িং</span>
                </label>
              </div>
            </div>
          </div>

          {/* =========================================================================
              আবেদন ফরমের ফি পরিশোধ (১,০০০/- টাকা)
              ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <span>তফসিল-১ আবেদন ফরমের ফি পরিশোধ (১,০০০/- টাকা)</span>
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                ফি: ১,০০০/- টাকা
              </span>
            </div>

            {/* Cash Counter / Bank Payment Card */}
            <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900">
                      পৌরসভা ক্যাশ কাউন্টারে জমা (রশিদ মারফত)
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                      নির্ধারিত মাধ্যম
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    সীতাকুণ্ড পৌরসভা ক্যাশ কাউন্টারে ১,০০০/- (এক হাজার) টাকা জমা দিয়ে প্রাপ্ত মানি রশিদ
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                <span className="text-[11px] text-slate-500 block">সরকারি ফি</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">৳ ১,০০০/-</span>
              </div>
            </div>

            {/* Money Receipt Details Input */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                পৌরসভা ক্যাশ কাউন্টার মানি রশিদ বিবরণ প্রদান করুন:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    পৌরসভা ক্যাশ রশিদ নং (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    placeholder="উদাঃ MR-2026-9841"
                    value={moneyReceiptNo}
                    onChange={(e) => setMoneyReceiptNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    * অনলাইনে আবেদন দাখিলের পরও পৌরসভা ক্যাশ কাউন্টারে সরাসরি ফি জমা দিয়ে রশিদ সংগ্রহ করা যাবে।
                  </p>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">রশিদ জমার তারিখ:</label>
                  <input
                    type="date"
                    value={moneyReceiptDate}
                    onChange={(e) => setMoneyReceiptDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Official Notice regarding Treasury Challan / Bank Draft */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5 text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-amber-950">অফিসিয়াল ট্রেজারী চালান ও ব্যাংক ড্রাফট সংক্রান্ত নির্দেশনা:</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  গ্রাহক নিজে পৌরসভার ক্যাশ রশিদ মারফত ফি জমা প্রদান করবেন। <strong>ট্রেজারী চালান / ব্যাংক ড্রাফট / পে-অর্ডারের বিবরণ ও সরকারি হিসাব কোড</strong> নক্সাকার (সিভিল) তার অফিসিয়াল আইডি হতে যাচাইপূর্বক সিস্টেমে ইনপুট প্রদান করবেন।
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              বিধিসম্মত ঘোষণা ও অঙ্গীকারনামা
              ========================================================================= */}
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-xs text-slate-800 space-y-3">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>আইনগত ঘোষণা ও প্রত্যয়ন অঙ্গীকারনামা</span>
            </h4>

            <p className="leading-relaxed text-justify text-slate-700">
              আমি {applicantName || 'আবেদনকারী'} এই মর্মে ঘোষণা করিতেছি যে, ইমারত নির্মাণ অনুমোদনের জন্য প্রয়োজনীয় নকশার ফর্দ এবং <strong>১,০০০/- (এক হাজার) টাকা</strong> ফি যথাযথ কর্তৃপক্ষের নিকট জমা প্রদান করিয়াছি। সংযুক্ত নকশা <em>ইমারত নির্মাণ বিধিমালা, ১৯৯৬</em> মোতাবেক প্রণীত এবং এই আবেদনপত্রে বর্ণিত তথ্য ও সংযুক্ত নকশার সমস্ত বিবরণ সম্পূর্ণ সত্য ও সঠিক।
            </p>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded mt-0.5"
              />
              <span className="font-bold text-slate-900 leading-snug">
                আমি উপরে বর্ণিত সকল তথ্য সঠিকভাবে যাচাই করিয়াছি এবং সকল আইনগত শর্তাবলীতে পূর্ণ সম্মতি জ্ঞাপন করিতেছি। *
              </span>
            </label>
          </div>

          {/* Submit Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm cursor-pointer transition-colors"
              >
                বাতিল করুন
              </button>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition-all"
            >
              <span>তফসিল-১ আবেদন দাখিল ও ফি পরিশোধ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      {/* =========================================================================
          Official Statutory Laws & PDF Reference Library Card (Host File Options) - Always at Bottom
          ========================================================================= */}
      <div className="bg-white rounded-3xl shadow-xs border border-emerald-200 p-6 sm:p-7 space-y-4 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>ইমারত নির্মাণ সংক্রান্ত আইন ও সরকারি বিধিমালা লাইব্রেরি</span>
                <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                  {OFFICIAL_LEGAL_DOCUMENTS.length}টি অফিসিয়াল গেজেট/আইন
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                ইমারত নির্মাণ আবেদনের পূর্বে সরকারি আইন, বিধিমালা, ছাড়পত্র ও ফি তালিকা যাচাই ও ডাউনলোড করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedLegalDoc('rules1996');
              setIsLegalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Scale className="w-4 h-4" />
            <span>সকল আইন একনজরে দেখুন</span>
          </button>
        </div>

        {/* 5 Law PDF Option Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {OFFICIAL_LEGAL_DOCUMENTS.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${doc.badgeColor}`}>
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{doc.year}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-1.5">
                    <Icon className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{toBanglaNumber(idx + 1)}। {doc.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLegalDoc(doc.id);
                      setIsLegalModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-white hover:bg-emerald-700 hover:text-white text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF দেখুন</span>
                  </button>

                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    title={`${doc.title} ডাউনলোড করুন`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BuildingLegalDocumentsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultDoc={selectedLegalDoc}
      />
    </div>
  );
};
