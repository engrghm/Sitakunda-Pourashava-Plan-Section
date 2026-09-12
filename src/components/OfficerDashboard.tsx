import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  User, 
  LogOut, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Users, 
  FileCheck2, 
  Save, 
  X, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Bell, 
  Send, 
  Smartphone, 
  Mail, 
  Filter, 
  FileText,
  Sun,
  Moon,
  ExternalLink,
  MessageSquare,
  Plus,
  Layers,
  Calendar,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  Trash2,
  Edit3,
  SlidersHorizontal,
  FileSpreadsheet as FileSpreadsheetIcon,
  Receipt,
  Landmark,
  Construction,
  Award,
  Upload,
  FileDown,
  ArrowRight,
  BookOpen,
  Video
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { ApplicationQRCodeCard } from './ApplicationQRCodeCard';
import { OfficerStatusChart } from './OfficerStatusChart';
import { Schedule1StatusChart } from './Schedule1StatusChart';
import { RoadCuttingStatusChart } from './RoadCuttingStatusChart';
import { AllFilteredApplicationsPrint } from './AllFilteredApplicationsPrint';
import { PendingApplicationsPrint } from './PendingApplicationsPrint';
import { BulkApplicationsMergedPrint } from './BulkApplicationsMergedPrint';
import { FieldInspectionSchedulePrint } from './FieldInspectionSchedulePrint';
import { PrintWatermark } from './PrintWatermark';
import { DocumentAttachmentsViewer } from './DocumentAttachmentsViewer';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';
import { LandLocationPicker } from './LandLocationPicker';
import { SystemAuditLogModal } from './SystemAuditLogModal';
import { Schedule1ApplicationPrintA4 } from './Schedule1ApplicationPrintA4';
import { RoadCuttingApplicationPrintA4 } from './RoadCuttingApplicationPrintA4';
import { BuildingApprovalPermitPrintA4 } from './BuildingApprovalPermitPrintA4';
import { CustomCsvExportModal } from './CustomCsvExportModal';
import { CsvModuleType } from '../utils/csvExportHelper';
import { CouncilManagementPanel } from './CouncilManagementPanel';
import { NoticeManagementPanel } from './NoticeManagementPanel';
import { GazetteManagementPanel } from './GazetteManagementPanel';
import { MediaManagementPanel } from './MediaManagementPanel';
import { 
  DemarcationApplication, 
  BuildingConstructionApplication,
  RoadCuttingApplication,
  VALID_MOUZAS, 
  VALID_WARDS, 
  ApplicationStatus, 
  OfficerUser, 
  StatusHistoryItem,
  GeoCoordinates,
  LandOwner,
  CONSTRUCTION_TYPES,
  LAND_CLASSES,
  UploadedDocument
} from '../types';
import { 
  getStoredApplications, 
  saveApplication,
  getBuildingApplications,
  getRoadCuttingApplications,
  updateRoadCuttingApplication,
  updateApplication, 
  updateBuildingApplication,
  deleteDemarcationApplication,
  deleteBuildingApplication,
  deleteRoadCuttingApplication,
  purgeModuleApplications,
  isAppDeleted,
  toBanglaNumber, 
  formatBanglaDate, 
  authenticateOfficer, 
  getOfficerSession, 
  setOfficerSession, 
  clearOfficerSession, 
  changeOfficerPassword, 
  getOfficerAccounts,
  addAuditLog,
  getStoredAuditLogs,
  resetToDemoApplications,
  DEMARCATION_STORAGE_KEY,
  BUILDING_APPS_STORAGE_KEY,
  ROAD_CUTTING_APPS_STORAGE_KEY
} from '../utils/storage';
import { 
  sendAutomatedStatusAlert, 
  generateOfficialEmailTemplate, 
  EmailTemplate 
} from '../utils/notificationService';
import { uploadFileToServer, fetchApplicationsFromApi, deleteApplicationFromApi } from '../utils/apiStorage';

interface OfficerDashboardProps {
  onViewPrintA4: (app: DemarcationApplication) => void;
  onViewCertificate: (app: DemarcationApplication) => void;
  onAuthChange?: (isLoggedIn: boolean) => void;
  onOpenCustomizer?: () => void;
}

const getStatusLabelBangla = (st: ApplicationStatus) => {
  switch (st) {
    case 'approved': return 'অনুমোদিত (Approved)';
    case 'investigating': return 'সরজমিনে তদন্তাধীন (Investigating)';
    case 'under_review': return 'পর্যালোচনাধীন (Under Review)';
    case 'rejected': return 'বাতিল (Rejected)';
    default: return 'অপেক্ষমান (Pending)';
  }
};

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  onViewPrintA4,
  onViewCertificate,
  onAuthChange,
  onOpenCustomizer,
}) => {
  // Theme state (Light / Dark mode toggle)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('officer_dashboard_theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('officer_dashboard_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Auth state
  const [currentOfficer, setCurrentOfficer] = useState<OfficerUser | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Applications data & filters
  const [applications, setApplications] = useState<DemarcationApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMouza, setSelectedMouza] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Print All Filtered modal state
  const [isPrintAllOpen, setIsPrintAllOpen] = useState<boolean>(false);
  // XEN Pending Applications PDF Summary Report Modal state
  const [isPendingPrintOpen, setIsPendingPrintOpen] = useState<boolean>(false);
  // Bulk Applications Merged Print Modal state
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState<boolean>(false);
  // Multi-selected application IDs for bulk operations
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  // Field Inspection Schedule Sheet Print Modal state
  const [inspectionPrintApp, setInspectionPrintApp] = useState<DemarcationApplication | null>(null);
  // System Audit Log modal state
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  // Retained only for backwards-compatible JSX; the Quick Note/Timeline panel is hidden.
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const [quickNoteSuccess] = useState<string | null>(null);
  const [quickNoteAutoSaveStatus] = useState<'idle' | 'typing' | 'saving' | 'saved'>('idle');
  const [quickNoteLastSavedAt] = useState<string | null>(null);

  // Email Notification Template Preview modal state
  const [emailPreviewTemplate, setEmailPreviewTemplate] = useState<EmailTemplate | null>(null);

  // Active modal application for inspection & approval
  const [selectedApp, setSelectedApp] = useState<DemarcationApplication | null>(null);

  // Editing officer review state in modal
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>('pending');
  const [draftsmanRemarks, setDraftsmanRemarks] = useState<string>('');
  const [isSiteInspected, setIsSiteInspected] = useState<boolean>(false);
  const [inspectionDate, setInspectionDate] = useState<string>('');
  const [geoCoordinates, setGeoCoordinates] = useState<GeoCoordinates | undefined>(undefined);
  const [certificateNo, setCertificateNo] = useState<string>('');
  const [memoNo, setMemoNo] = useState<string>('');
  const [engineerRemarks, setEngineerRemarks] = useState<string>('');
  const [isFeePaid, setIsFeePaid] = useState<boolean>(false);
  const [sendAlertOnSave, setSendAlertOnSave] = useState<boolean>(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [demarcationPdf, setDemarcationPdf] = useState<{ fileName: string; dataUrl: string; uploadedAt: string } | undefined>(undefined);

  // Full Administrative Edit State (Allows Admin to edit everything)
  const [isAdminEditMode, setIsAdminEditMode] = useState<boolean>(false);

  // 1. Applicant Details Edit State
  const [editApplicantName, setEditApplicantName] = useState<string>('');
  const [editApplicantFatherHusband, setEditApplicantFatherHusband] = useState<string>('');
  const [editApplicantMobile, setEditApplicantMobile] = useState<string>('');
  const [editApplicantEmail, setEditApplicantEmail] = useState<string>('');
  const [editApplicantNid, setEditApplicantNid] = useState<string>('');
  const [editApplicantPresentAddress, setEditApplicantPresentAddress] = useState<string>('');
  const [editApplicantPermanentAddress, setEditApplicantPermanentAddress] = useState<string>('');
  const [editHoldingOrPlotNo, setEditHoldingOrPlotNo] = useState<string>('');
  const [editRoadOrArea, setEditRoadOrArea] = useState<string>('');
  const [editLandmark, setEditLandmark] = useState<string>('');

  // 2. Land Schedule Details Edit State
  const [editMouzaName, setEditMouzaName] = useState<string>('');
  const [editJlNo, setEditJlNo] = useState<string>('');
  const [editWardNo, setEditWardNo] = useState<string>('');
  const [editDeedNo, setEditDeedNo] = useState<string>('');
  const [editDeedDate, setEditDeedDate] = useState<string>('');
  const [editCreatedBsKhatianNo, setEditCreatedBsKhatianNo] = useState<string>('');
  const [editBsKhatianNo, setEditBsKhatianNo] = useState<string>('');
  const [editBsDagNo, setEditBsDagNo] = useState<string>('');
  const [editRsKhatianNo, setEditRsKhatianNo] = useState<string>('');
  const [editRsDagNo, setEditRsDagNo] = useState<string>('');
  const [editLandArea, setEditLandArea] = useState<string>('');
  const [editLandClass, setEditLandClass] = useState<string>('');
  const [editBoundaryNorth, setEditBoundaryNorth] = useState<string>('');
  const [editBoundarySouth, setEditBoundarySouth] = useState<string>('');
  const [editBoundaryEast, setEditBoundaryEast] = useState<string>('');
  const [editBoundaryWest, setEditBoundaryWest] = useState<string>('');

  // 3. Land Owners List Edit State
  const [editLandOwners, setEditLandOwners] = useState<LandOwner[]>([]);

  // 4. Proposed Construction Edit State
  const [editConstructionType, setEditConstructionType] = useState<string>('');
  const [editPurpose, setEditPurpose] = useState<string>('');
  const [editFloorsCount, setEditFloorsCount] = useState<string>('');
  const [editBuildingCategory, setEditBuildingCategory] = useState<string>('residential');
  const [editEstimatedAreaSqFt, setEditEstimatedAreaSqFt] = useState<string>('');

  // 5. Fee & Meta Edit State
  const [editFeeAmount, setEditFeeAmount] = useState<number>(100);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('counter');
  const [editFormNo, setEditFormNo] = useState<string>('');

  // Password Change Modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [pwdChangeError, setPwdChangeError] = useState<string | null>(null);
  const [pwdChangeSuccess, setPwdChangeSuccess] = useState<string | null>(null);

  // Active Dashboard Module: Demarcation, Schedule-1, Road Cutting, Council, Notices, Gazettes, or Media Gallery
  const [activeModule, setActiveModule] = useState<'demarcation' | 'schedule1' | 'roadcutting' | 'council' | 'notices' | 'gazettes' | 'media'>('demarcation');
  const [roadCuttingApplications, setRoadCuttingApplications] = useState<RoadCuttingApplication[]>([]);
  const [roadCuttingSearchQuery, setRoadCuttingSearchQuery] = useState<string>('');
  const [roadCuttingSelectedStatus, setRoadCuttingSelectedStatus] = useState<string>('all');
  const [roadCuttingSelectedWard, setRoadCuttingSelectedWard] = useState<string>('all');
  const [roadCuttingSelectedPurpose, setRoadCuttingSelectedPurpose] = useState<string>('all');
  const [selectedRoadCuttingPrint, setSelectedRoadCuttingPrint] = useState<RoadCuttingApplication | null>(null);
  const [buildingApplications, setBuildingApplications] = useState<BuildingConstructionApplication[]>([]);
  const [buildingSearchQuery, setBuildingSearchQuery] = useState<string>('');
  const [buildingSelectedStatus, setBuildingSelectedStatus] = useState<string>('all');
  const [buildingSelectedWard, setBuildingSelectedWard] = useState<string>('all');
  const [buildingSelectedActivity, setBuildingSelectedActivity] = useState<string>('all');
  const [buildingSelectedTreasury, setBuildingSelectedTreasury] = useState<string>('all');
  const [selectedBuildingPrint, setSelectedBuildingPrint] = useState<BuildingConstructionApplication | null>(null);
  const [selectedBuildingPermitPrint, setSelectedBuildingPermitPrint] = useState<BuildingConstructionApplication | null>(null);
  const [selectedBuildingAppIds, setSelectedBuildingAppIds] = useState<string[]>([]);
  const [selectedRoadCuttingAppIds, setSelectedRoadCuttingAppIds] = useState<string[]>([]);
  const [csvExportModalModule, setCsvExportModalModule] = useState<CsvModuleType | null>(null);

  // Noksakar Draftsman Data Update Modal State (১. ৭ কপি নকশার ফর্দ • ২. আবেদন ফি ১০০০/- ফিক্সড • ৩. ইমারত নির্মাণ ফি ও চালান বিবরণ)
  const [treasuryModalApp, setTreasuryModalApp] = useState<BuildingConstructionApplication | null>(null);

  // ১। ৭ কপি নকশার ফর্দ
  const [sevenCopiesSubmitted, setSevenCopiesSubmitted] = useState<boolean>(true);
  const [sevenCopiesDate, setSevenCopiesDate] = useState<string>('');
  const [sevenCopiesDetails, setSevenCopiesDetails] = useState<string>('');

  // ২। ইমারত নির্মাণ আবেদন ফি জমা বিবরণ (Fixed 1000/-, কোনো ভ্যাট নেই)
  const [appFeeSubmitted, setAppFeeSubmitted] = useState<boolean>(true);
  const [appFeePaymentMethod, setAppFeePaymentMethod] = useState<string>('counter_receipt');
  const [appFeeReceiptNo, setAppFeeReceiptNo] = useState<string>('');
  const [appFeeReceiptDate, setAppFeeReceiptDate] = useState<string>('');

  // ৩। ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ (যা নক্সাকার এডিট করবে)
  const [constructionFeeSubmitted, setConstructionFeeSubmitted] = useState<boolean>(true);
  const [buildingPermitFee, setBuildingPermitFee] = useState<number>(5000);
  const [permitVatAmount, setPermitVatAmount] = useState<number>(750);
  const [totalPermitChalanAmount, setTotalPermitChalanAmount] = useState<number>(5750);
  const [treasuryPaymentInstrument, setTreasuryPaymentInstrument] = useState<string>('chalan');
  const [treasuryGovtCode, setTreasuryGovtCode] = useState<string>('১-২০৩১-০০০০-২৬৮১');
  const [treasuryInstrumentNo, setTreasuryInstrumentNo] = useState<string>('');
  const [treasuryDepositDate, setTreasuryDepositDate] = useState<string>('');
  const [treasuryBankName, setTreasuryBankName] = useState<string>('সোনালী ব্যাংক পিএলসি');
  const [treasuryBranchName, setTreasuryBranchName] = useState<string>('সীতাকুণ্ড শাখা, চট্টগ্রাম');

  // ভ্যাটের চালান আলাদাভাবে যুক্ত করার অপশন
  const [hasSeparateVatChalan, setHasSeparateVatChalan] = useState<boolean>(false);
  const [vatChalanNo, setVatChalanNo] = useState<string>('');
  const [vatChalanDate, setVatChalanDate] = useState<string>('');
  const [vatBankName, setVatBankName] = useState<string>('সোনালী ব্যাংক পিএলসি');
  const [vatBranchName, setVatBranchName] = useState<string>('সীতাকুণ্ড শাখা, চট্টগ্রাম');
  const [vatEconomicCode, setVatEconomicCode] = useState<string>('১-১১৩৩-০০১০-০৩১১');

  const [treasuryRemarks, setTreasuryRemarks] = useState<string>('');
  const [buildingAppStatusUpdate, setBuildingAppStatusUpdate] = useState<'submitted' | 'under_review' | 'approved' | 'rejected'>('approved');
  const [treasurySuccessMsg, setTreasurySuccessMsg] = useState<string | null>(null);

  // Requirement: Only Draftsman can fill/edit Schedule-1 Noksakar verification entry
  const isCurrentOfficerDraftsman = 
    Boolean(currentOfficer && (
      currentOfficer.role === 'draftsman' || 
      currentOfficer.username?.toLowerCase().includes('draftsman') ||
      currentOfficer.username === 'draftsman.sitakunda'
    ));

  // Check existing session on mount
  useEffect(() => {
    const session = getOfficerSession();
    if (session) {
      setCurrentOfficer(session);
      onAuthChange?.(true);
    }
    loadApplications();
  }, []);

  const loadApplications = async () => {
    // 1. Initial immediate render from local cache (already filtered by isAppDeleted)
    const data = getStoredApplications();
    setApplications(data);
    const bData = getBuildingApplications();
    setBuildingApplications(bData);
    const rcData = getRoadCuttingApplications();
    setRoadCuttingApplications(rcData);

    // 2. Fetch live data from Hostinger MySQL
    try {
      const [remoteDemarcation, remoteBuilding, remoteRoadCutting] = await Promise.all([
        fetchApplicationsFromApi<DemarcationApplication>('demarcation'),
        fetchApplicationsFromApi<BuildingConstructionApplication>('building'),
        fetchApplicationsFromApi<RoadCuttingApplication>('road_cutting'),
      ]);

      if (remoteDemarcation && Array.isArray(remoteDemarcation)) {
        // Purge any remote records that were marked as permanently deleted
        const validRemoteDemarcation = remoteDemarcation.filter((app) => {
          if (isAppDeleted(app.id, app.trackingId, app.formNo)) {
            deleteApplicationFromApi(app.id).catch(() => {});
            return false;
          }
          return true;
        });

        const mergedMap = new Map<string, DemarcationApplication>();
        data.forEach((app) => {
          if (!isAppDeleted(app.id, app.trackingId, app.formNo)) {
            mergedMap.set(app.id, app);
          }
        });
        validRemoteDemarcation.forEach((remoteApp) => {
          const localApp = mergedMap.get(remoteApp.id);
          if (localApp && localApp.documents && localApp.documents.length > 0) {
            const localDocMap = new Map<string, any>();
            localApp.documents.forEach((d) => {
              if (d && d.id && d.fileUrl) localDocMap.set(d.id, d);
            });
            const mergedDocs = (remoteApp.documents || []).map((d) => {
              if ((!d.fileUrl || d.fileUrl === '') && localDocMap.has(d.id)) {
                return { ...d, fileUrl: localDocMap.get(d.id).fileUrl };
              }
              return d;
            });
            const remoteDocIds = new Set(mergedDocs.map((d) => d.id));
            localApp.documents.forEach((d) => {
              if (!remoteDocIds.has(d.id)) mergedDocs.push(d);
            });
            mergedMap.set(remoteApp.id, { ...localApp, ...remoteApp, documents: mergedDocs });
          } else {
            mergedMap.set(remoteApp.id, remoteApp);
          }
        });
        const merged = Array.from(mergedMap.values()).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setApplications(merged);
        try {
          localStorage.setItem(DEMARCATION_STORAGE_KEY, JSON.stringify(merged));
        } catch {}

        // Push any local application that is missing on remote
        const remoteIds = new Set(validRemoteDemarcation.map((a) => a.id));
        data.forEach((app) => {
          if (!remoteIds.has(app.id) && !isAppDeleted(app.id, app.trackingId, app.formNo)) {
            saveApplicationToApi(app, 'demarcation').catch(() => {});
          }
        });
      }

      if (remoteBuilding && Array.isArray(remoteBuilding)) {
        const validRemoteBuilding = remoteBuilding.filter((app) => {
          if (isAppDeleted(app.id, (app as any).trackingId, app.formNo)) {
            deleteApplicationFromApi(app.id).catch(() => {});
            return false;
          }
          return true;
        });

        const mergedBMap = new Map<string, BuildingConstructionApplication>();
        bData.forEach((app) => {
          if (!isAppDeleted(app.id, (app as any).trackingId, app.formNo)) {
            mergedBMap.set(app.id, app);
          }
        });
        validRemoteBuilding.forEach((app) => mergedBMap.set(app.id, app));
        const mergedB = Array.from(mergedBMap.values()).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setBuildingApplications(mergedB);
        try {
          localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify(mergedB));
        } catch {}

        const remoteBIds = new Set(validRemoteBuilding.map((a) => a.id));
        bData.forEach((app) => {
          if (!remoteBIds.has(app.id) && !isAppDeleted(app.id, (app as any).trackingId, app.formNo)) {
            saveApplicationToApi(app, 'building').catch(() => {});
          }
        });
      }

      if (remoteRoadCutting && Array.isArray(remoteRoadCutting)) {
        const validRemoteRoadCutting = remoteRoadCutting.filter((app) => {
          if (isAppDeleted(app.id, (app as any).trackingId, (app as any).formNo)) {
            deleteApplicationFromApi(app.id).catch(() => {});
            return false;
          }
          return true;
        });

        const mergedRCMap = new Map<string, RoadCuttingApplication>();
        rcData.forEach((app) => {
          if (!isAppDeleted(app.id, (app as any).trackingId, (app as any).formNo)) {
            mergedRCMap.set(app.id, app);
          }
        });
        validRemoteRoadCutting.forEach((app) => mergedRCMap.set(app.id, app));
        const mergedRC = Array.from(mergedRCMap.values()).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setRoadCuttingApplications(mergedRC);
        try {
          localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify(mergedRC));
        } catch {}

        const remoteRCIds = new Set(validRemoteRoadCutting.map((a) => a.id));
        rcData.forEach((app) => {
          if (!remoteRCIds.has(app.id) && !isAppDeleted(app.id, (app as any).trackingId, (app as any).formNo)) {
            saveApplicationToApi(app, 'road_cutting').catch(() => {});
          }
        });
      }
    } catch (err) {
      console.warn('[OfficerDashboard] Background sync error:', err);
    }
  };

  // Login handler with multi-officer validation
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const officer = authenticateOfficer(username.trim(), password);
    if (officer) {
      setCurrentOfficer(officer);
      setOfficerSession(officer);
      onAuthChange?.(true);
      loadApplications();

      // Log Login Event to System Audit Trail
      addAuditLog({
        officerUsername: officer.username,
        officerName: officer.name || officer.title,
        officerRole: officer.role,
        officerDesignation: officer.designation,
        actionType: 'login',
        actionTitle: 'প্রশাসনিক অ্যাকাউন্টে সফল লগইন',
        details: `${officer.name || officer.title} (${officer.roleTitleBangla}) অ্যাকাউন্টে সফল প্রমাণীকরণ ও সেশন স্থাপন সম্পন্ন হয়েছে।`,
      });
    } else {
      setLoginError('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় সঠিক তথ্য প্রদান করুন।');
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (currentOfficer) {
      addAuditLog({
        officerUsername: currentOfficer.username,
        officerName: currentOfficer.name || currentOfficer.title,
        officerRole: currentOfficer.role,
        officerDesignation: currentOfficer.designation,
        actionType: 'logout',
        actionTitle: 'প্রশাসনিক প্যানেল হতে লগআউট',
        details: `${currentOfficer.name || currentOfficer.title} কর্তৃক সেশন সমাপ্ত ও নিরাপদ লগআউট সম্পন্ন হয়েছে।`,
      });
    }
    clearOfficerSession();
    setCurrentOfficer(null);
    onAuthChange?.(false);
    setUsername('');
    setPassword('');
  };

  // Password change handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeError(null);
    setPwdChangeSuccess(null);

    if (!currentOfficer) return;

    if (!oldPassword) {
      setPwdChangeError('বর্তমান পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPwdChangeError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdChangeError('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    const result = changeOfficerPassword(currentOfficer.username, oldPassword, newPassword);
    if (result.success) {
      setPwdChangeSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      
      // Log Password Change Event to Audit Trail
      addAuditLog({
        officerUsername: currentOfficer.username,
        officerName: currentOfficer.name || currentOfficer.title,
        officerRole: currentOfficer.role,
        officerDesignation: currentOfficer.designation,
        actionType: 'password_changed',
        actionTitle: 'অফিসার পাসওয়ার্ড সফলভাবে পরিবর্তিত',
        details: `${currentOfficer.name || currentOfficer.title} কর্তৃক অ্যাকাউন্টের নিরাপত্তা পাসওয়ার্ড হালনাগাদ করা হয়েছে।`,
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPwdChangeSuccess(null);
      }, 2000);
    } else {
      setPwdChangeError(result.message || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি হয়েছে।');
    }
  };

  // Delete a single demarcation application
  const handleDeleteDemarcationApp = async (id: string, applicantName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আবেদনকারী "${applicantName}"-এর সীমানা নির্ধারণ আবেদনটি (ID: ${id}) স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = deleteDemarcationApplication(id);
    setApplications(updated);
    setSelectedAppIds((prev) => prev.filter((i) => i !== id));
    if (selectedApp?.id === id) {
      setSelectedApp(null);
    }
    await deleteApplicationFromApi(id).catch(() => {});
    alert('সীমানা নির্ধারণ আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Delete a single building application
  const handleDeleteBuildingApp = async (id: string, applicantName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আবেদনকারী "${applicantName}"-এর তফসিল-১ আবেদনটি (ID: ${id}) স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = deleteBuildingApplication(id);
    setBuildingApplications(updated);
    setSelectedBuildingAppIds((prev) => prev.filter((i) => i !== id));
    await deleteApplicationFromApi(id).catch(() => {});
    alert('তফসিল-১ আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Delete a single road cutting application
  const handleDeleteRoadCuttingApp = async (id: string, applicantName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে আবেদনকারী "${applicantName}"-এর রাস্তা কর্তন আবেদনটি (ID: ${id}) স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = deleteRoadCuttingApplication(id);
    setRoadCuttingApplications(updated);
    setSelectedRoadCuttingAppIds((prev) => prev.filter((i) => i !== id));
    await deleteApplicationFromApi(id).catch(() => {});
    alert('রাস্তা কর্তন আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Bulk delete selected demarcation applications
  const handleBulkDeleteDemarcation = async () => {
    if (selectedAppIds.length === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${toBanglaNumber(selectedAppIds.length)} টি সীমানা নির্ধারণ আবেদন স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const toDelete = [...selectedAppIds];
    let current = applications;
    for (const id of toDelete) {
      current = deleteDemarcationApplication(id);
      await deleteApplicationFromApi(id).catch(() => {});
    }
    setApplications(current);
    setSelectedAppIds([]);
    alert('নির্বাচিত আবেদনসমূহ সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Bulk delete selected building applications
  const handleBulkDeleteBuilding = async () => {
    if (selectedBuildingAppIds.length === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${toBanglaNumber(selectedBuildingAppIds.length)} টি তফসিল-১ আবেদন স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const toDelete = [...selectedBuildingAppIds];
    let current = buildingApplications;
    for (const id of toDelete) {
      current = deleteBuildingApplication(id);
      await deleteApplicationFromApi(id).catch(() => {});
    }
    setBuildingApplications(current);
    setSelectedBuildingAppIds([]);
    alert('নির্বাচিত তফসিল-১ আবেদনসমূহ সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Purge demo applications across modules
  const handlePurgeDemoData = (module: 'demarcation' | 'building' | 'road_cutting' | 'all') => {
    const title = module === 'demarcation' 
      ? 'সীমানা নির্ধারণ ও ডিমার্কেশন ফরমের সকল ডেমো / পরীক্ষামূলক আবেদন' 
      : module === 'building'
      ? 'ইমারত নির্মাণ অনুমোদন ফরম তফসিল-১ এর সকল ডেমো / পরীক্ষামূলক আবেদন'
      : module === 'road_cutting'
      ? 'রাস্তা কর্তন অনুমোদন ফরমের সকল ডেমো / পরীক্ষামূলক আবেদন'
      : 'সকল মডিউলের পরীক্ষামূলক ও ডেমো আবেদন';

    if (!window.confirm(`আপনি কি নিশ্চিত যে ${title} স্থায়ীভাবে মুছে সম্পূর্ণ খালি করতে চান?`)) {
      return;
    }

    if (module === 'demarcation') {
      purgeModuleApplications('demarcation');
      setApplications([]);
      setSelectedAppIds([]);
    } else if (module === 'building') {
      purgeModuleApplications('building');
      setBuildingApplications([]);
      setSelectedBuildingAppIds([]);
    } else if (module === 'road_cutting') {
      purgeModuleApplications('road_cutting');
      setRoadCuttingApplications([]);
      setSelectedRoadCuttingAppIds([]);
    } else {
      resetToDemoApplications();
      setApplications([]);
      setBuildingApplications([]);
      setRoadCuttingApplications([]);
      setSelectedAppIds([]);
      setSelectedBuildingAppIds([]);
      setSelectedRoadCuttingAppIds([]);
    }
    alert(`${title} সফলভাবে মুছে ফেলা হয়েছে।`);
  };

  // Open Application Details Modal
  const handleOpenDetailModal = (app: DemarcationApplication) => {
    setSelectedApp(app);
    setReviewStatus(app.status);
    setDraftsmanRemarks(app.draftsmanReview?.remarks || '');
    setIsSiteInspected(app.draftsmanReview?.isSiteInspected || false);
    setInspectionDate(app.draftsmanReview?.inspectionDate || '');
    setGeoCoordinates(
      app.draftsmanReview?.geoCoordinates ||
      app.schedule?.geoCoordinates ||
      app.siteLocation?.geoCoordinates
    );
    setCertificateNo(
      app.engineerApproval?.certificateNo || 
      `SKM/ENGG/DEM/${new Date().getFullYear()}/${app.id.replace(/\D/g, '').slice(-4) || '1042'}`
    );
    setMemoNo(
      app.engineerApproval?.memoNo || 
      `সীতাপৌ/প্রকৌ/নক্সা/${toBanglaNumber(new Date().getFullYear())}-${toBanglaNumber(app.id.replace(/\D/g, '').slice(-4) || '1042')}`
    );
    setEngineerRemarks(app.engineerApproval?.finalRemarks || 'মালিকানা ও সরজমিন সীমানা যাচাইয়ে সঠিক পাওয়া গেছে।');
    setIsFeePaid(app.feeStatus === 'paid');
    setSaveSuccessMsg(null);
    setDemarcationPdf(app.draftsmanReview?.demarcationPdf);

    // Initialize all full administrative edit fields
    setIsAdminEditMode(currentOfficer?.role === 'super_admin' || currentOfficer?.role === 'admin' || currentOfficer?.role === 'draftsman');
    setEditApplicantName(app.siteLocation?.applicantName || '');
    setEditApplicantFatherHusband(app.siteLocation?.applicantFatherHusband || '');
    setEditApplicantMobile(app.siteLocation?.applicantMobile || '');
    setEditApplicantEmail(app.siteLocation?.applicantEmail || '');
    setEditApplicantNid(app.siteLocation?.applicantNid || '');
    setEditApplicantPresentAddress(app.siteLocation?.applicantPresentAddress || '');
    setEditApplicantPermanentAddress(app.siteLocation?.applicantPermanentAddress || '');
    setEditHoldingOrPlotNo(app.siteLocation?.holdingOrPlotNo || '');
    setEditRoadOrArea(app.siteLocation?.roadOrArea || '');
    setEditLandmark(app.siteLocation?.landmark || '');

    setEditMouzaName(app.schedule?.mouzaName || 'দক্ষিণ টেরিয়াইল');
    setEditJlNo(app.schedule?.jlNo || '25');
    setEditWardNo(app.schedule?.wardNo || '১ নং ওয়ার্ড');
    setEditDeedNo(app.schedule?.deedNo || '');
    setEditDeedDate(app.schedule?.deedDate || '');
    setEditCreatedBsKhatianNo(app.schedule?.createdBsKhatianNo || '');
    setEditBsKhatianNo(app.schedule?.bsKhatianNo || '');
    setEditBsDagNo(app.schedule?.bsDagNo || '');
    setEditRsKhatianNo(app.schedule?.rsKhatianNo || '');
    setEditRsDagNo(app.schedule?.rsDagNo || '');
    setEditLandArea(app.schedule?.landArea || '');
    setEditLandClass(app.schedule?.landClass || 'বাস্তু / ভিটি');
    setEditBoundaryNorth(app.schedule?.boundaryNorth || '');
    setEditBoundarySouth(app.schedule?.boundarySouth || '');
    setEditBoundaryEast(app.schedule?.boundaryEast || '');
    setEditBoundaryWest(app.schedule?.boundaryWest || '');

    setEditLandOwners(app.landOwners ? JSON.parse(JSON.stringify(app.landOwners)) : []);

    setEditConstructionType(app.proposedConstruction?.constructionType || 'বহুতল ভবন (Building)');
    setEditPurpose(app.proposedConstruction?.purpose || '');
    setEditFloorsCount(app.proposedConstruction?.floorsCount || '১');
    setEditBuildingCategory(app.proposedConstruction?.buildingCategory || 'residential');
    setEditEstimatedAreaSqFt(app.proposedConstruction?.estimatedAreaSqFt || '');

    setEditFeeAmount(app.paymentDetails?.amount || 100);
    setEditPaymentMethod(app.paymentDetails?.method || 'counter');
    setEditFormNo(app.formNo || '');
  };

  // Helper functions for Land Owners list management in admin edit mode
  const handleAddOwner = () => {
    const newOwner: LandOwner = {
      id: `owner-${Date.now()}`,
      name: '',
      fatherOrHusbandName: '',
      permanentAddress: editApplicantPermanentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
      presentAddress: editApplicantPresentAddress || 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
      nid: '',
      email: '',
    };
    setEditLandOwners((prev) => [...prev, newOwner]);
  };

  const handleUpdateOwner = (idx: number, field: keyof LandOwner, val: any) => {
    setEditLandOwners((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveOwner = (idx: number) => {
    if (editLandOwners.length <= 1) {
      alert('কমপক্ষে একজন ভূমির মালিকের তথ্য থাকা আবশ্যক।');
      return;
    }
    setEditLandOwners((prev) => prev.filter((_, i) => i !== idx));
  };

  // Legacy helper retained for exports; quick notes and timeline are no longer rendered or saved.
  const saveQuickNoteToTimeline = (_noteContent: string, _isAutoSave: boolean = false) => {
    return;
    /*
    if (!selectedApp || !noteContent.trim() || !currentOfficer) return;

    const trimmed = noteContent.trim();
    if (trimmed === lastSavedQuickNoteRef.current) return;

    const newHistoryItem: StatusHistoryItem = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStatus: selectedApp.status,
      toStatus: selectedApp.status,
      statusTitle: isAutoSave ? 'স্বয়ংক্রিয় অভ্যন্তরীণ নোট (Auto-Saved Note)' : 'অভ্যন্তরীণ নোট (Internal Note)',
      updatedBy: currentOfficer.name || currentOfficer.title || 'পৌর কর্মকর্তা',
      designation: currentOfficer.designation || 'সীতাকুণ্ড পৌরসভা',
      remarks: trimmed,
      actionType: 'internal_note',
    };

    const currentHistory = selectedApp.statusHistory || [];
    const updatedStatusHistory = [newHistoryItem, ...currentHistory];

    const updatedApp: DemarcationApplication = {
      ...selectedApp,
      statusHistory: updatedStatusHistory,
    };

    updateApplication(selectedApp.id, updatedApp);
    loadApplications();
    setSelectedApp(updatedApp);

    // Save to System Audit Trail
    addAuditLog({
      officerUsername: currentOfficer.username,
      officerName: currentOfficer.name || currentOfficer.title,
      officerRole: currentOfficer.role,
      officerDesignation: currentOfficer.designation,
      actionType: 'internal_note',
      actionTitle: isAutoSave ? 'অভ্যন্তরীণ নোট স্বয়ংক্রিয়ভাবে সংরক্ষিত' : 'অভ্যন্তরীণ পর্যবেক্ষণ নোট সংরক্ষিত',
      targetId: selectedApp.id,
      applicantName: selectedApp.siteLocation.applicantName,
      details: `আবেদন #${selectedApp.id} (মৌজা: ${selectedApp.schedule.mouzaName}) এর বিপরীতে পর্যবেক্ষণ নোট লিপিবদ্ধ: "${trimmed.slice(0, 120)}${trimmed.length > 120 ? '...' : ''}"`,
    });

    lastSavedQuickNoteRef.current = trimmed;
    const nowTimeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setQuickNoteLastSavedAt(nowTimeStr);
    setQuickNoteAutoSaveStatus('saved');
    setQuickNoteText('');
    setQuickNoteSuccess(
      isAutoSave
        ? `নোট স্বয়ংক্রিয়ভাবে টাইমলাইনে যুক্ত করা হয়েছে! (${toBanglaNumber(nowTimeStr)})`
        : 'অভ্যন্তরীণ নোট সফলভাবে টাইমলাইনে যুক্ত করা হয়েছে!'
    );

    setTimeout(() => {
      setQuickNoteSuccess(null);
      setQuickNoteAutoSaveStatus('idle');
    }, 3500);
    */
  };

  /* Quick-note auto-save disabled.
  useEffect(() => {
    if (!selectedApp || !currentOfficer) return;
    const trimmed = quickNoteText.trim();

    // If input is empty or matches last saved text, remain idle
    if (!trimmed || trimmed === lastSavedQuickNoteRef.current) {
      if (!trimmed) setQuickNoteAutoSaveStatus('idle');
      return;
    }

    // If text has at least 3 characters, set status to typing and initiate debounced auto-save
    if (trimmed.length >= 3) {
      setQuickNoteAutoSaveStatus('typing');

      const timer = setTimeout(() => {
        setQuickNoteAutoSaveStatus('saving');
        saveQuickNoteToTimeline(trimmed, true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [quickNoteText, selectedApp?.id, currentOfficer]); */

  // Add internal quick note manually via button
  const handleAddQuickNote = () => undefined;

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length && filteredApps.length > 0) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map((a) => a.id));
    }
  };

  const handleToggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Update documents for currently selected application (Draftsman/Admin can add, edit, or delete attachments & maps)
  const handleUpdateSelectedAppDocuments = (updatedDocs: UploadedDocument[]) => {
    if (!selectedApp) return;

    const updatedApp: DemarcationApplication = {
      ...selectedApp,
      documents: updatedDocs,
    };

    setSelectedApp(updatedApp);
    saveApplication(updatedApp);
    loadApplications();

    setSaveSuccessMsg('সংযুক্ত নথিপত্র ও ম্যাপসমূহ সফলভাবে আপডেট ও ডাটাবেজে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Save changes by officer
  const handleSaveAppUpdates = () => {
    if (!selectedApp) return;

    const reviewerTitle = currentOfficer?.title || 'নক্সাকার (সিভিল)';
    const approverTitle = currentOfficer?.title || 'নির্বাহী প্রকৌশলী';


    // ─── নক্সাকার (Draftsman) রোল: শুধুমাত্র নিজের সরজমিন মন্তব্য আপডেট করতে পারবে ───
    // অন্য কোনো ফিল্ড (status, applicant info, schedule, fee, certificate) পরিবর্তন করতে পারবে না।
    if (false && currentOfficer?.role === 'draftsman') {
      const draftsmanNote: StatusHistoryItem = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fromStatus: selectedApp.status,
        toStatus: selectedApp.status,
        statusTitle: 'নক্সাকার সরজমিন মন্তব্য আপডেট',
        updatedBy: currentOfficer.name || currentOfficer.title || 'নক্সাকার',
        designation: currentOfficer.designation || 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা',
        remarks: draftsmanRemarks.trim() || 'সরজমিন পরিদর্শন সম্পন্ন হয়েছে।',
        actionType: 'internal_note',
      };
      const updatedStatusHistory = [draftsmanNote, ...(selectedApp.statusHistory || [])];

      const draftsmanOnlyUpdate: DemarcationApplication = {
        ...selectedApp, // সকল অন্যান্য তথ্য অপরিবর্তিত রাখুন
        statusHistory: updatedStatusHistory,
        draftsmanReview: {
          reviewerName: currentOfficer.name || currentOfficer.title || reviewerTitle,
          designation: currentOfficer.designation || 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা',
          reviewDate: new Date().toISOString().split('T')[0],
          remarks: draftsmanRemarks.trim() || selectedApp.draftsmanReview?.remarks || '',
          isSiteInspected: Boolean(isSiteInspected),
          inspectionDate: isSiteInspected ? inspectionDate : undefined,
          boundaryClearance: selectedApp.draftsmanReview?.boundaryClearance || 'clear',
          fieldReportDetails: selectedApp.draftsmanReview?.fieldReportDetails || undefined,
          geoCoordinates,
        },
      };

      // Audit log for draftsman's action
      addAuditLog({
        officerUsername: currentOfficer.username,
        officerName: currentOfficer.name || currentOfficer.title,
        officerRole: currentOfficer.role,
        officerDesignation: currentOfficer.designation,
        actionType: 'internal_note',
        actionTitle: 'নক্সাকার সরজমিন মন্তব্য এন্ট্রি',
        details: `আবেদন আইডি ${selectedApp.id}-এর নক্সাকার সরজমিন মন্তব্য আপডেট করা হয়েছে। মন্তব্য: ${draftsmanRemarks.trim()}`,
        targetId: selectedApp.id,
        applicantName: selectedApp.siteLocation?.applicantName,
      } as any);

      saveApplication(draftsmanOnlyUpdate);
      setSelectedApp(draftsmanOnlyUpdate);
      loadApplications();
      setSaveSuccessMsg('নক্সাকার সরজমিন মন্তব্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      return;
    }
    // ─── End Draftsman-only save ───

    const statusChanged = selectedApp.status !== reviewStatus;
    let newLogs = selectedApp.notificationLogs || [];

    // Trigger automated SMS / Email notification alert if status changed or requested
    if (sendAlertOnSave && (statusChanged || !selectedApp.notificationLogs || selectedApp.notificationLogs.length === 0)) {
      const alertResult = sendAutomatedStatusAlert(
        {
          ...selectedApp,
          status: reviewStatus,
          engineerApproval: reviewStatus === 'approved' ? ({ certificateNo, memoNo } as any) : undefined,
        },
        reviewStatus,
        draftsmanRemarks.trim() || undefined,
        currentOfficer?.name || currentOfficer?.title,
        currentOfficer?.designation
      );
      newLogs = [alertResult.log, ...newLogs];
    }

    // Build Status History Log entry
    const currentHistory = selectedApp.statusHistory || [];
    const getStatusTitleBangla = (st: ApplicationStatus) => {
      switch (st) {
        case 'approved': return 'অনুমোদিত ও প্রত্যয়নপত্র ইস্যু সম্পন্ন';
        case 'investigating': return 'সরজমিন তদন্ত ও পরিমাপের জন্য নির্ধারিত';
        case 'rejected': return 'আবেদন বাতিল / স্থগিত';
        default: return 'অপেক্ষমান (প্রাথমিক পর্যালোচনায়)';
      }
    };

    const newHistoryItem: StatusHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStatus: selectedApp.status,
      toStatus: reviewStatus,
      statusTitle: getStatusTitleBangla(reviewStatus),
      updatedBy: currentOfficer?.name || currentOfficer?.title || 'পৌর কর্মকর্তা',
      designation: currentOfficer?.designation || 'সীতাকুণ্ড পৌরসভা',
      remarks: draftsmanRemarks.trim() || (reviewStatus === 'approved' ? engineerRemarks.trim() : 'আবেদনের তথ্য ও পর্যালোচনা সম্পন্ন হয়েছে।'),
    };

    const updatedStatusHistory = currentHistory;
    const canManageStatus = currentOfficer?.role === 'draftsman' || currentOfficer?.role === 'admin' || currentOfficer?.role === 'super_admin' || currentOfficer?.role === 'executive_engineer' || currentOfficer?.role === 'mayor';
    const canManageFee = currentOfficer?.role === 'draftsman' || currentOfficer?.role === 'admin' || currentOfficer?.role === 'super_admin';

    const updatedApp: DemarcationApplication = {
      ...selectedApp,
      formNo: editFormNo.trim() || selectedApp.formNo,
      status: canManageStatus ? reviewStatus : selectedApp.status,
      feeStatus: canManageFee ? (isFeePaid ? 'paid' : 'unpaid') : selectedApp.feeStatus,
      notificationLogs: newLogs,
      statusHistory: updatedStatusHistory,
      landOwners: editLandOwners.length > 0 ? editLandOwners : selectedApp.landOwners,
      siteLocation: {
        ...selectedApp.siteLocation,
        applicantName: editApplicantName.trim() || selectedApp.siteLocation.applicantName,
        applicantFatherHusband: editApplicantFatherHusband.trim() || selectedApp.siteLocation.applicantFatherHusband,
        applicantMobile: editApplicantMobile.trim() || selectedApp.siteLocation.applicantMobile,
        applicantEmail: editApplicantEmail.trim() || undefined,
        applicantNid: editApplicantNid.trim() || selectedApp.siteLocation.applicantNid,
        applicantPresentAddress: editApplicantPresentAddress.trim() || selectedApp.siteLocation.applicantPresentAddress,
        applicantPermanentAddress: editApplicantPermanentAddress.trim() || selectedApp.siteLocation.applicantPermanentAddress,
        holdingOrPlotNo: editHoldingOrPlotNo.trim() || selectedApp.siteLocation.holdingOrPlotNo,
        roadOrArea: editRoadOrArea.trim() || selectedApp.siteLocation.roadOrArea,
        landmark: editLandmark.trim() || undefined,
        wardNo: editWardNo || selectedApp.siteLocation.wardNo,
        geoCoordinates: currentOfficer?.role === 'draftsman' ? geoCoordinates : selectedApp.siteLocation.geoCoordinates,
      },
      schedule: {
        ...selectedApp.schedule,
        mouzaName: editMouzaName.trim() || selectedApp.schedule.mouzaName,
        jlNo: editJlNo.trim() || selectedApp.schedule.jlNo,
        wardNo: editWardNo || selectedApp.schedule.wardNo,
        deedNo: editDeedNo.trim() || selectedApp.schedule.deedNo,
        deedDate: editDeedDate.trim() || selectedApp.schedule.deedDate,
        createdBsKhatianNo: editCreatedBsKhatianNo.trim() || undefined,
        bsKhatianNo: editBsKhatianNo.trim() || selectedApp.schedule.bsKhatianNo,
        bsDagNo: editBsDagNo.trim() || selectedApp.schedule.bsDagNo,
        rsKhatianNo: editRsKhatianNo.trim() || undefined,
        rsDagNo: editRsDagNo.trim() || undefined,
        landArea: editLandArea.trim() || selectedApp.schedule.landArea,
        landClass: editLandClass.trim() || selectedApp.schedule.landClass,
        boundaryNorth: editBoundaryNorth.trim() || selectedApp.schedule.boundaryNorth,
        boundarySouth: editBoundarySouth.trim() || selectedApp.schedule.boundarySouth,
        boundaryEast: editBoundaryEast.trim() || selectedApp.schedule.boundaryEast,
        boundaryWest: editBoundaryWest.trim() || selectedApp.schedule.boundaryWest,
        geoCoordinates: currentOfficer?.role === 'draftsman' ? geoCoordinates : selectedApp.schedule.geoCoordinates,
      },
      proposedConstruction: {
        ...selectedApp.proposedConstruction,
        constructionType: editConstructionType.trim() || selectedApp.proposedConstruction.constructionType,
        purpose: editPurpose.trim() || selectedApp.proposedConstruction.purpose,
        floorsCount: editFloorsCount.trim() || selectedApp.proposedConstruction.floorsCount,
        buildingCategory: editBuildingCategory as any,
        estimatedAreaSqFt: editEstimatedAreaSqFt.trim() || undefined,
      },
      paymentDetails: {
        ...(selectedApp.paymentDetails || {
          method: 'counter',
          methodNameBangla: 'ব্যাংক / পৌর ক্যাশ কাউন্টার',
          amount: 100,
          status: isFeePaid ? 'paid' : 'unpaid',
        }),
        amount: Number(editFeeAmount) || 100,
        status: canManageFee ? (isFeePaid ? 'paid' : 'unpaid') : (selectedApp.paymentDetails?.status || 'unpaid'),
        method: editPaymentMethod,
      },
      // নক্সাকারের সরজমিন মন্তব্য কেবল নক্সাকার আইডি থেকে সম্পাদনযোগ্য
      // অন্যান্য কর্মকর্তাদের (admin, engineer, mayor ইত্যাদি) সেভ করার সময় নক্সাকারের মূল রিভিউ অপরিবর্তিত থাকবে
      draftsmanReview: currentOfficer?.role === 'draftsman' ? {
        reviewerName: currentOfficer.name || currentOfficer.title || reviewerTitle,
        designation: currentOfficer.designation || 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা',
        reviewDate: new Date().toISOString().split('T')[0],
        remarks: draftsmanRemarks.trim() || selectedApp.draftsmanReview?.remarks || '',
        isSiteInspected: Boolean(isSiteInspected),
        inspectionDate: isSiteInspected ? inspectionDate : undefined,
        boundaryClearance: selectedApp.draftsmanReview?.boundaryClearance || 'clear',
        fieldReportDetails: selectedApp.draftsmanReview?.fieldReportDetails,
        geoCoordinates,
        demarcationPdf,
      } : selectedApp.draftsmanReview,
      engineerApproval:
        reviewStatus === 'approved'
          ? {
              officerName: currentOfficer?.name || currentOfficer?.title || 'নির্বাহী প্রকৌশলী',
              designation: currentOfficer?.designation || 'নির্বাহী প্রকৌশলী, সীতাকুণ্ড পৌরসভা',
              approvalDate: new Date().toISOString().split('T')[0],
              approved: true,
              certificateNo: certificateNo.trim() || selectedApp.engineerApproval?.certificateNo || `SKM/ENGG/DEM/2026/${Math.floor(1000 + Math.random() * 9000)}`,
              finalRemarks: engineerRemarks.trim() || 'ভূমির ডিমার্কেশন ও মালিকানা সঠিকতা যথাযথভাবে অনুমোদিত হয়েছে।',
            }
          : engineerRemarks.trim()
          ? {
              ...(selectedApp.engineerApproval || {}),
              officerName: currentOfficer?.name || currentOfficer?.title || 'পৌর কর্মকর্তা',
              designation: currentOfficer?.designation || 'সীতাকুণ্ড পৌরসভা',
              approvalDate: selectedApp.engineerApproval?.approvalDate || new Date().toISOString().split('T')[0],
              approved: selectedApp.engineerApproval?.approved || false,
              certificateNo: selectedApp.engineerApproval?.certificateNo,
              finalRemarks: engineerRemarks.trim(),
            }
          : selectedApp.engineerApproval,
    };

    saveApplication(updatedApp);
    setSelectedApp(updatedApp);
    loadApplications();
    setIsAdminEditMode(false);
  };


  // Open Draftsman Data Update modal (১. ৭ কপি নকশার ফর্দ • ২. আবেদন ফি ১০০০/- ফিক্সড • ৩. ইমারত নির্মাণ ফি ও চালান বিবরণ)
  const handleOpenTreasuryModal = (bApp: BuildingConstructionApplication) => {
    setTreasuryModalApp(bApp);

    // ১। ৭ কপি নকশার ফর্দ
    setSevenCopiesSubmitted(bApp.sevenCopiesDrawingsSubmitted ?? true);
    setSevenCopiesDate(bApp.sevenCopiesSubmittedDate || bApp.createdAt || new Date().toISOString().split('T')[0]);
    setSevenCopiesDetails(
      bApp.sevenCopiesDrawingsDetails ||
        'বিধি অনুযায়ী ৭ কপি পূর্ণাঙ্গ নকশার ফর্দ (সাইট লে-আউট, ফ্লোর প্ল্যান, এলিভেশন, সেকশন ও স্ট্রাকচারাল ড্রয়িংস) যথাযথভাবে দাখিল করা হইয়াছে।'
    );

    // ২। ইমারত নির্মাণ আবেদন ফি জমা বিবরণ (Fixed 1000/-, কোনো ভ্যাট নেই)
    setAppFeeSubmitted(bApp.applicationFeeStatus ? bApp.applicationFeeStatus === 'paid' : true);
    setAppFeePaymentMethod(bApp.applicationFeePaymentMethod || 'counter_receipt');
    setAppFeeReceiptNo(bApp.applicationFeeReceiptNo || (bApp.moneyReceiptNo ? `MR-${bApp.moneyReceiptNo}` : 'MR-2026-9182'));
    setAppFeeReceiptDate(bApp.applicationFeeReceiptDate || bApp.moneyReceiptDate || bApp.createdAt || new Date().toISOString().split('T')[0]);

    // ৩। ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ (যা নক্সাকার এডিট করবে)
    const permitFee = bApp.buildingPermitFeeAmount ?? (bApp.feeAmount && bApp.feeAmount > 1000 ? Math.round(bApp.feeAmount / 1.15) : 5000);
    const vat = bApp.vatAmount ?? Math.round(permitFee * 0.15);
    const totalChalan = bApp.feeAmount || (permitFee + vat);

    setConstructionFeeSubmitted(bApp.feeStatus === 'paid' || bApp.feeSubmittedConfirmed !== false);
    setBuildingPermitFee(permitFee);
    setPermitVatAmount(vat);
    setTotalPermitChalanAmount(totalChalan);

    setTreasuryPaymentInstrument(bApp.paymentMethod || 'chalan');
    setTreasuryGovtCode(bApp.treasuryCode || '১-২০৩১-০০০০-২৬৮১');
    setTreasuryInstrumentNo(bApp.chalanOrDraftNo || '');
    setTreasuryDepositDate(bApp.chalanOrDraftDate || bApp.createdAt || new Date().toISOString().split('T')[0]);
    setTreasuryBankName(bApp.bankName || 'সোনালী ব্যাংক পিএলসি');
    setTreasuryBranchName(bApp.branchName || 'সীতাকুণ্ড শাখা, চট্টগ্রাম');

    // ভ্যাটের চালান আলাদাভাবে যুক্ত করার অপশন
    setHasSeparateVatChalan(bApp.hasSeparateVatChalan ?? false);
    setVatChalanNo(bApp.vatChalanNo || '');
    setVatChalanDate(bApp.vatChalanDate || bApp.chalanOrDraftDate || new Date().toISOString().split('T')[0]);
    setVatBankName(bApp.vatBankName || 'সোনালী ব্যাংক পিএলসি');
    setVatBranchName(bApp.vatBranchName || 'সীতাকুণ্ড শাখা, চট্টগ্রাম');
    setVatEconomicCode(bApp.vatEconomicCode || '১-১১৩৩-০০১০-০৩১১');

    setTreasuryRemarks(
      bApp.treasuryRemarks ||
        '৭ কপি নকশার ফর্দ, ফিক্সড ১,০০০/- টাকা আবেদন ফি এবং ইমারত নির্মাণ ফি ও ১৫% সরকারি ভ্যাট সরকারি ট্রেজারী চালানের মাধ্যমে যথাযথভাবে যাচাইপূর্বক সঠিক পাওয়া গেল।'
    );
    setBuildingAppStatusUpdate(bApp.status || 'under_review');
    setTreasurySuccessMsg(null);
  };

  // Save Draftsman 3-point updates (১. ৭ কপি নকশা • ২. আবেদন ফি ১০০০/- ফিক্সড • ৩. ইমারত নির্মাণ ফি ও ভ্যাট চালান)
  const handleSaveTreasuryData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treasuryModalApp) return;

    // Requirement: শুধুমাত্র নক্সাকার (draftsman.sitakunda) আইডি দিয়ে পূরণ ও সংরক্ষণ করা যাবে
    if (!isCurrentOfficerDraftsman) {
      alert('অননুমোদিত অ্যাক্সেস: নক্সাকারের ডাটা যাচাই ও অনুমোদন এন্ট্রি (তফসিল-১) শুধুমাত্র নক্সাকার (draftsman.sitakunda) আইডি দিয়ে পূরণ ও সম্পাদন করা যাবে!');
      return;
    }

    const officerDesignation = currentOfficer?.title || currentOfficer?.designation || 'নক্সাকার (সিভিল)';
    const officerName = currentOfficer?.name || currentOfficer?.title || 'নক্সাকার';

    const instrumentTitles: Record<string, string> = {
      chalan: 'ট্রেজারী চালান',
      bank_draft: 'ব্যাংক ড্রাফট',
      pay_order: 'পে-অর্ডার',
      online: 'সোনালী ই-সেবা চালান',
      counter_receipt: 'পৌর ক্যাশ রসিদ',
    };

    const finalPermitFee = Number(buildingPermitFee) || 0;
    const finalVat = Number(permitVatAmount) || 0;
    const finalTotalChalan = Number(totalPermitChalanAmount) || (finalPermitFee + finalVat);

    const updatedApp: Partial<BuildingConstructionApplication> = {
      // ১। ৭ কপি নকশার ফর্দ
      sevenCopiesDrawingsSubmitted: sevenCopiesSubmitted,
      sevenCopiesSubmittedDate: sevenCopiesSubmitted ? sevenCopiesDate : undefined,
      sevenCopiesDrawingsDetails: sevenCopiesDetails.trim(),

      // ২। ইমারত নির্মাণ আবেদন ফি (ফিক্সড ১,০০০/- টাকা, ভ্যাট থাকবে না)
      applicationFeeAmount: 1000,
      applicationFeeStatus: appFeeSubmitted ? 'paid' : 'unpaid',
      applicationFeePaymentMethod: appFeePaymentMethod,
      applicationFeeReceiptNo: appFeeSubmitted ? appFeeReceiptNo.trim() : undefined,
      applicationFeeReceiptDate: appFeeSubmitted ? appFeeReceiptDate : undefined,

      // ৩। ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ (যা নক্সাকার এডিট করবে)
      buildingPermitFeeAmount: finalPermitFee,
      vatAmount: finalVat,
      vatPercent: 15,
      feeAmount: finalTotalChalan,
      feeStatus: constructionFeeSubmitted ? 'paid' : 'unpaid',
      feeSubmittedConfirmed: constructionFeeSubmitted,
      paymentMethod: treasuryPaymentInstrument,
      paymentMethodTitle: instrumentTitles[treasuryPaymentInstrument] || 'ট্রেজারী চালান',
      treasuryCode: treasuryGovtCode.trim() || '১-২০৩১-০০০০-২৬৮১',
      chalanOrDraftNo: constructionFeeSubmitted ? treasuryInstrumentNo.trim() : undefined,
      chalanOrDraftDate: constructionFeeSubmitted ? treasuryDepositDate : undefined,
      bankName: constructionFeeSubmitted ? treasuryBankName.trim() : undefined,
      branchName: constructionFeeSubmitted ? treasuryBranchName.trim() : undefined,

      // ভ্যাটের চালান আলাদাভাবে যুক্ত করার অপশন
      hasSeparateVatChalan: hasSeparateVatChalan,
      vatChalanNo: (constructionFeeSubmitted && hasSeparateVatChalan) ? vatChalanNo.trim() : undefined,
      vatChalanDate: (constructionFeeSubmitted && hasSeparateVatChalan) ? vatChalanDate : undefined,
      vatBankName: (constructionFeeSubmitted && hasSeparateVatChalan) ? vatBankName.trim() : undefined,
      vatBranchName: (constructionFeeSubmitted && hasSeparateVatChalan) ? vatBranchName.trim() : undefined,
      vatEconomicCode: (constructionFeeSubmitted && hasSeparateVatChalan) ? vatEconomicCode.trim() : undefined,

      treasuryVerifiedBy: `${officerName && officerDesignation && (officerName === officerDesignation || officerDesignation.includes(officerName)) ? officerDesignation : `${officerName} (${officerDesignation})`} [আইডি: ${currentOfficer?.username || 'draftsman'}]`,
      treasuryVerifiedAt: new Date().toISOString(),
      treasuryRemarks: treasuryRemarks.trim(),

      status: buildingAppStatusUpdate,
    };

    const fullUpdatedApp: BuildingConstructionApplication = {
      ...treasuryModalApp,
      ...updatedApp,
    };

    updateBuildingApplication(fullUpdatedApp);

    // Save to System Audit Log
    addAuditLog({
      officerUsername: currentOfficer?.username || 'draftsman.sitakunda',
      officerName: officerName,
      officerRole: currentOfficer?.role || 'draftsman',
      officerDesignation: officerDesignation,
      actionType: 'schedule1_treasury_updated',
      actionTitle: 'তফসিল-১ নক্সাকার ডাটা আপডেট (৭ কপি নকশা, ফিক্সড আবেদন ফি, ইমারত নির্মাণ ফি ও ভ্যাট চালান)',
      targetId: treasuryModalApp.id,
      applicantName: (treasuryModalApp as any).applicantName || (treasuryModalApp as any).applicantDetails?.name || '',
      details: `তফসিল-১ আবেদন #${treasuryModalApp.id} এর ১. ৭ কপি নকশা (${sevenCopiesSubmitted ? 'জমা হয়েছে' : 'বাকি'}), ২. আবেদন ফি: ৳ ১,০০০/- (ফিক্সড, ${appFeeSubmitted ? 'পরিশোধিত' : 'বাকি'}), ৩. ইমারত নির্মাণ ফি: ৳ ${toBanglaNumber(finalPermitFee)}/-, ১৫% ভ্যাট: ৳ ${toBanglaNumber(finalVat)}/- (মোট ট্রেজারী চালান: ৳ ${toBanglaNumber(finalTotalChalan)}/- ${hasSeparateVatChalan ? `, আলাদা ভ্যাট চালান নং: ${vatChalanNo}` : ''}) সফলভাবে হালনাগাদ করা হয়েছে। বর্তমান স্ট্যাটাস: ${buildingAppStatusUpdate}।`,
    });

    loadApplications();
    setTreasurySuccessMsg('নক্সাকারের তথ্যাদি (৭ কপি নকশার ফর্দ, ফিক্সড আবেদন ফি, ইমারত নির্মাণ ফি ও ট্রেজারী চালান বিবরণ) সফলভাবে সংরক্ষিত হয়েছে!');

    setTimeout(() => {
      setTreasuryModalApp(null);
      setTreasurySuccessMsg(null);
    }, 1400);
  };

    // Export Filtered applications to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'ফরম নং',
      'ট্র্যাকিং আইডি',
      'দাখিলের তারিখ',
      'আবেদনকারীর নাম',
      'পিতা/স্বামীর নাম',
      'মোবাইল নম্বর',
      'ইমেইল',
      'স্থায়ী ঠিকানা',
      'বর্তমান ঠিকানা',
      'জাতীয় পরিচয়পত্র (NID)',
      'মৌজা এলাকা',
      'জে.এল. নং',
      'ওয়ার্ড নং',
      'মালিকদের তালিকা',
      'প্রস্তাবিত নির্মাণের ধরণ',
      'তলার সংখ্যা',
      'দলিল নং ও তারিখ',
      'বি.এস খতিয়ান',
      'বি.এস দাগ',
      'সৃজিত খতিয়ান',
      'জমির পরিমাণ',
      'জমির শ্রেণি',
      'ফি স্ট্যাটাস',
      'আবেদনের বর্তমান অবস্থা',
      'নক্সাকার সরজমিন মন্তব্য',
      'পরিদর্শন সম্পন্ন হয়েছে কিনা',
      'অনুমোদন মেমো নং',
      'প্রত্যয়ন সনদ নং',
      'নির্বাহী প্রকৌশলীর চূড়ান্ত মন্তব্য',
    ];

    const rows = filteredApps.map((app) => [
      `"${app.formNo || 'SKM-FORM-' + app.id.slice(-6)}"`,
      `"${app.id}"`,
      `"${app.createdAt}"`,
      `"${app.siteLocation.applicantName}"`,
      `"${app.siteLocation.applicantFatherHusband || ''}"`,
      `"${app.siteLocation.applicantMobile}"`,
      `"${app.siteLocation.applicantEmail || ''}"`,
      `"${app.siteLocation.applicantPermanentAddress || ''}"`,
      `"${app.siteLocation.applicantPresentAddress || ''}"`,
      `"${app.siteLocation.applicantNid || ''}"`,
      `"${app.schedule.mouzaName}"`,
      `"${app.schedule.jlNo}"`,
      `"${app.schedule.wardNo}"`,
      `"${app.landOwners.map((o) => `${o.name} (${o.fatherOrHusbandName})`).join('; ')}"`,
      `"${app.proposedConstruction.constructionType}"`,
      `"${app.proposedConstruction.floorsCount}"`,
      `"${app.schedule.deedNo} (${app.schedule.deedDate})"`,
      `"${app.schedule.bsKhatianNo}"`,
      `"${app.schedule.bsDagNo}"`,
      `"${app.schedule.createdBsKhatianNo || ''}"`,
      `"${app.schedule.landArea}"`,
      `"${app.schedule.landClass}"`,
      `"${app.feeStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}"`,
      `"${app.status === 'approved' ? 'অনুমোদিত' : app.status === 'investigating' ? 'তদন্তাধীন' : app.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}"`,
      `"${(app.draftsmanReview?.remarks || '').replace(/"/g, '""')}"`,
      `"${app.draftsmanReview?.isSiteInspected ? 'হ্যাঁ' : 'না'}"`,
      `"${app.engineerApproval?.memoNo || ''}"`,
      `"${app.engineerApproval?.certificateNo || ''}"`,
      `"${(app.engineerApproval?.finalRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sitakunda_demarcation_filtered_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (!app) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (app.id || '').toLowerCase().includes(q) ||
      (app.formNo && app.formNo.toLowerCase().includes(q)) ||
      (app.siteLocation?.applicantName || '').toLowerCase().includes(q) ||
      (app.siteLocation?.applicantMobile || '').includes(searchQuery) ||
      (app.schedule?.bsDagNo || '').includes(searchQuery) ||
      (app.schedule?.deedNo || '').includes(searchQuery) ||
      (app.landOwners && Array.isArray(app.landOwners) && app.landOwners.some((o) => (o.name || '').toLowerCase().includes(q)));

    const matchesMouza = selectedMouza === 'all' || app.schedule?.mouzaName === selectedMouza;
    const matchesWard = selectedWard === 'all' || app.schedule?.wardNo === selectedWard;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'in_progress' && (app.status === 'investigating' || app.status === 'under_review')) ||
      (selectedStatus === 'completed' && app.status === 'approved') ||
      app.status === selectedStatus;

    return matchesSearch && matchesMouza && matchesWard && matchesStatus;
  });

  // Filtered building construction applications (Schedule-1)
  const filteredBuildingApps = buildingApplications.filter((bApp: any) => {
    if (!bApp) return false;
    if (buildingSearchQuery.trim()) {
      const q = buildingSearchQuery.toLowerCase();
      const id = (bApp.id || '').toLowerCase();
      const formNo = (bApp.formNo || '').toLowerCase();
      const demId = (bApp.demarcationTrackingId || bApp.demarcationAppId || bApp.demarcationApplicationId || '').toLowerCase();
      const certNo = (bApp.demarcationCertificateNo || '').toLowerCase();
      const applicantName = (bApp.applicantName || bApp.applicantDetails?.name || '').toLowerCase();
      const phone = (bApp.applicantMobile || bApp.applicantPhone || bApp.applicantDetails?.mobile || '');
      const father = (bApp.applicantFatherHusband || bApp.applicantDetails?.fatherHusbandName || '').toLowerCase();
      const mouza = (bApp.siteDetails?.mouzaName || bApp.mouzaBlockSector || bApp.plotDetails?.mouza || '').toLowerCase();
      const dag = (bApp.siteDetails?.bsDag || bApp.dagKhatianPlotNo || bApp.plotDetails?.dagNo || '').toLowerCase();
      const chalan = (bApp.chalanOrDraftNo || bApp.moneyReceiptNo || '').toLowerCase();

      const matchesSearch =
        id.includes(q) ||
        formNo.includes(q) ||
        demId.includes(q) ||
        certNo.includes(q) ||
        applicantName.includes(q) ||
        phone.includes(q) ||
        father.includes(q) ||
        mouza.includes(q) ||
        dag.includes(q) ||
        chalan.includes(q);

      if (!matchesSearch) return false;
    }

    if (buildingSelectedStatus !== 'all') {
      if (buildingSelectedStatus === 'submitted' && (bApp.status !== 'submitted' && bApp.status !== 'pending')) return false;
      if (buildingSelectedStatus === 'under_review' && bApp.status !== 'under_review') return false;
      if (buildingSelectedStatus === 'approved' && bApp.status !== 'approved') return false;
      if (buildingSelectedStatus === 'rejected' && bApp.status !== 'rejected') return false;
    }

    if (buildingSelectedWard !== 'all') {
      const ward = (bApp.siteDetails?.wardNo || bApp.wardNo || bApp.plotDetails?.wardNo || '').toString();
      if (!ward.includes(buildingSelectedWard)) return false;
    }

    if (buildingSelectedActivity !== 'all') {
      const act = (bApp.activityType || bApp.activityTypeTitle || bApp.natureOfWork?.typeOfWork || '').toString();
      if (!act.includes(buildingSelectedActivity)) return false;
    }

    if (buildingSelectedTreasury !== 'all') {
      const hasTreasury = Boolean(bApp.chalanOrDraftNo || bApp.treasuryCode);
      if (buildingSelectedTreasury === 'verified' && !hasTreasury) return false;
      if (buildingSelectedTreasury === 'pending' && hasTreasury) return false;
    }

    return true;
  });

  // Filtered Road Cutting applications
  const filteredRoadCuttingApps = roadCuttingApplications.filter((app) => {
    if (!app) return false;
    if (roadCuttingSearchQuery.trim()) {
      const q = roadCuttingSearchQuery.toLowerCase();
      const match =
        (app.id || '').toLowerCase().includes(q) ||
        (app.formNo || '').toLowerCase().includes(q) ||
        (app.applicantName || '').toLowerCase().includes(q) ||
        (app.applicantPhone || '').includes(q) ||
        (app.roadName || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roadCuttingSelectedStatus !== 'all' && app.status !== roadCuttingSelectedStatus) return false;
    if (roadCuttingSelectedWard !== 'all' && !(app.wardNo || '').includes(roadCuttingSelectedWard)) return false;
    if (roadCuttingSelectedPurpose !== 'all' && !(app.purposeTitle || app.purpose || '').includes(roadCuttingSelectedPurpose)) return false;
    return true;
  });

  // Bulk selection handlers for Schedule-1
  const handleToggleSelectAllBuilding = () => {
    if (selectedBuildingAppIds.length === filteredBuildingApps.length && filteredBuildingApps.length > 0) {
      setSelectedBuildingAppIds([]);
    } else {
      setSelectedBuildingAppIds(filteredBuildingApps.map((a: any) => a.id));
    }
  };

  const handleToggleSelectBuildingApp = (id: string) => {
    setSelectedBuildingAppIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk selection handlers for Road Cutting
  const handleToggleSelectAllRoadCutting = () => {
    if (selectedRoadCuttingAppIds.length === filteredRoadCuttingApps.length && filteredRoadCuttingApps.length > 0) {
      setSelectedRoadCuttingAppIds([]);
    } else {
      setSelectedRoadCuttingAppIds(filteredRoadCuttingApps.map((a) => a.id));
    }
  };

  const handleToggleSelectRoadCuttingApp = (id: string) => {
    setSelectedRoadCuttingAppIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Schedule-1 Summary Metrics
  const buildingSubmittedCount = buildingApplications.filter((a) => a.status === 'submitted' || a.status === 'pending').length;
  const buildingUnderReviewCount = buildingApplications.filter((a) => a.status === 'under_review').length;
  const buildingApprovedCount = buildingApplications.filter((a) => a.status === 'approved').length;
  const buildingRejectedCount = buildingApplications.filter((a) => a.status === 'rejected').length;
  const buildingTreasuryVerifiedCount = buildingApplications.filter((a) => Boolean(a.chalanOrDraftNo || a.treasuryCode)).length;
  const buildingTreasuryPendingCount = buildingApplications.length - buildingTreasuryVerifiedCount;

  // Summary counts
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const investigatingCount = applications.filter((a) => a.status === 'investigating' || a.status === 'under_review').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const auditLogsCount = getStoredAuditLogs().length;
  const buildingTotalCount = buildingApplications.length;
  const buildingTotalFees = buildingApplications.reduce((sum, b) => sum + (b.feeAmount || 1000), 0);

  // Check if current logged-in officer is Admin / SuperAdmin
  const isAdmin = currentOfficer?.role === 'super_admin' || currentOfficer?.role === 'admin' || currentOfficer?.username === 'admin.sitakunda';

  // -------------------------------------------------------------
  // If not logged in -> Modern official multi-officer login screen
  // -------------------------------------------------------------
  if (!currentOfficer) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-4 animate-fade-in-scale">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Login Banner */}
          <div className="bg-slate-900 text-white p-6 text-center relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-emerald-400 bg-white overflow-hidden shadow-md">
              <MunicipalityLogo className="w-full h-full" />
            </div>
            <h2 className="text-xl font-bold">পৌর কর্মকর্তা ও প্রকৌশলী লগইন</h2>
            <p className="text-xs text-slate-300 mt-1">
              সীতাকুণ্ড পৌরসভা কার্যালয় | প্রকৌশল ও প্রশাসনিক শাখা
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ইউজারনেম দিন"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors text-sm cursor-pointer mt-2"
            >
              প্রশাসনিক প্যানেলে প্রবেশ করুন
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">
                শুধুমাত্র সীতাকুণ্ড পৌরসভার অনুমোদিত কর্মকর্তা ও প্রকৌশলীদের জন্য সংরক্ষিত
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // If logged in -> Officer Panel Dashboard
  // -------------------------------------------------------------
  return (
    <div className={`space-y-6 animate-fade-in-up transition-colors duration-200 ${isDarkMode ? 'dark-officer-theme bg-slate-950 p-4 sm:p-6 rounded-2xl shadow-xl' : ''}`}>
      {/* Officer Top Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">পৌর কর্মকর্তা ও প্রকৌশলী ড্যাশবোর্ড</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                অনলাইন
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              লগইনকৃত কর্মকর্তা:{' '}
              <strong className="text-emerald-950">
                {currentOfficer?.designation || currentOfficer?.title || currentOfficer?.name || 'পৌর কর্মকর্তা'}
              </strong>{' '}
              | <span className="font-mono text-slate-500">ID: {currentOfficer?.username || 'officer'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* System Audit Log Viewer Button (Strictly Super Admin / Admin only) */}
          {isAdmin && (
            <button
              type="button"
              id="system-audit-log-btn"
              onClick={() => setIsAuditLogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-amber-500/60 ring-1 ring-amber-400/30"
              title="কর্মকর্তা ও প্রকৌশলীদের প্রশাসনিক কার্যকলাপের সম্পূর্ণ অপরিবর্তনযোগ্য অডিট লগ দেখুন (Super Admin Access)"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>সিস্টেম অডিট লগ</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {toBanglaNumber(auditLogsCount || 0)}
              </span>
            </button>
          )}

          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            type="button"
            id="officer-theme-toggle-btn"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="ড্যাশবোর্ড থিম পরিবর্তন করুন (লাইট মোড / ডার্ক মোড)"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>লাইট মোড</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>ডার্ক মোড</span>
              </>
            )}
          </button>

          {/* Password Change Button */}
          <button
            type="button"
            onClick={() => {
              setPwdChangeError(null);
              setPwdChangeSuccess(null);
              setIsChangePasswordOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </button>

          {/* Refresh Applications */}
          <button
            type="button"
            id="officer-refresh-data-btn"
            onClick={() => {
              loadApplications();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-slate-300"
            title="আবেদন তালিকা রিফ্রেশ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
            <span>তালিকা রিফ্রেশ</span>
          </button>

          {/* XEN Export All Pending Applications PDF Button */}
          <button
            type="button"
            id="xen-export-pending-pdf-btn"
            onClick={() => setIsPendingPrintOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer border border-amber-500"
            title="নির্বাহী প্রকৌশলী (XEN) এর জন্য সকল অপেক্ষমান আবেদনের একক PDF সামারি রিপোর্ট তৈরি ও প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
            <span>অপেক্ষমান আবেদন PDF রিপোর্ট ({toBanglaNumber(pendingCount)})</span>
          </button>

          {/* Bulk Applications Merged PDF Button */}
          <button
            type="button"
            id="officer-bulk-merged-pdf-btn"
            onClick={() => {
              if (selectedAppIds.length === 0) {
                setSelectedAppIds(filteredApps.map((a) => a.id));
              }
              setIsBulkPrintOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-indigo-600"
            title="নির্বাচিত বা ফিল্টারকৃত একাধিক আবেদন একত্রে একটি একক মার্জড PDF ফাইলে প্রিন্ট বা ডাউনলোড করুন"
          >
            <Layers className="w-4 h-4" />
            <span>বাল্ক PDF ডাউনলোড ({toBanglaNumber(selectedAppIds.length > 0 ? selectedAppIds.length : filteredApps.length)})</span>
          </button>

          {/* Print All Filtered Button */}
          <button
            type="button"
            onClick={() => setIsPrintAllOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="বর্তমানে ফিল্টারকৃত সকল আবেদন এক পৃষ্ঠায় প্রিন্ট বা PDF তৈরি করুন"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট অল ফিল্টার্ড ({toBanglaNumber(filteredApps.length)})</span>
          </button>

          {/* Download CSV Report Button */}
          <button
            type="button"
            id="officer-export-csv-btn"
            onClick={() => setCsvExportModalModule('demarcation')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer border border-emerald-600"
            title="কাস্টম ফিল্টারিং ও কলাম নির্বাচনসহ CSV / Excel ডেটাসেট ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV ডাউনলোড ({toBanglaNumber(filteredApps.length)})</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Module Selector: Demarcation vs Schedule-1 (Building Construction & Pond Excavation) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          type="button"
          id="module-tab-demarcation"
          onClick={() => setActiveModule('demarcation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'demarcation'
              ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-300" />
          <span>১. সীমানা নির্ধারণ ও ডিমার্কেশন প্রত্যয়ন ফরম ({toBanglaNumber(applications.length)})</span>
        </button>

        <button
          type="button"
          id="module-tab-schedule1"
          onClick={() => setActiveModule('schedule1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'schedule1'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>২. ইমারত নির্মাণ অনুমোদন ফরম তফসিল-১ ({toBanglaNumber(buildingApplications.length)})</span>
        </button>

        <button
          type="button"
          id="module-tab-roadcutting"
          onClick={() => setActiveModule('roadcutting')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'roadcutting'
              ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Construction className="w-4 h-4 text-amber-400" />
          <span>৩. রাস্তা কর্তন অনুমোদন ফরম ({toBanglaNumber(roadCuttingApplications.length)})</span>
        </button>

        <button
          type="button"
          id="module-tab-council"
          onClick={() => setActiveModule('council')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'council'
              ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>৪. বর্তমান পরিষদ ও কর্মকর্তা প্রোফাইল</span>
        </button>

        <button
          type="button"
          id="module-tab-notices"
          onClick={() => setActiveModule('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'notices'
              ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-600/30'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-400" />
          <span>৫. নোটিশ ও টেন্ডার ব্যবস্থাপনা</span>
        </button>

        <button
          type="button"
          id="module-tab-gazettes"
          onClick={() => setActiveModule('gazettes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'gazettes'
              ? 'bg-emerald-900 text-white shadow-sm ring-2 ring-emerald-500/40'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>৬. আইন ও গেজেট লাইব্রেরি (১০টি PDF আপলোড)</span>
        </button>

        <button
          type="button"
          id="module-tab-media"
          onClick={() => setActiveModule('media')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeModule === 'media'
              ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-500/40'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Video className="w-4 h-4 text-purple-400" />
          <span>৭. গ্যালারি ও ভিডিও ব্যবস্থাপনা</span>
        </button>

        {onOpenCustomizer && (
          <button
            type="button"
            id="module-tab-customizer"
            onClick={onOpenCustomizer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm ml-auto"
            title="ওয়েবসাইট কাস্টমাইজেশন ও সিএমএস সেটিংস"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ওয়েবসাইট কাস্টমাইজেশন (CMS)</span>
          </button>
        )}
      </div>

      {/* MODULE 1: Demarcation & Ownership Certification Form */}
      {activeModule === 'demarcation' && (
        <div className="space-y-6">
          {/* Visual Analytics Chart using Recharts */}
          <OfficerStatusChart
            applications={applications}
            onStatusClick={(statusCode) => {
              if (statusCode === 'investigating' || statusCode === 'under_review') {
                setSelectedStatus('in_progress');
              } else if (statusCode === 'approved') {
                setSelectedStatus('completed');
              } else {
                setSelectedStatus(statusCode);
              }
            }}
          />

      {/* Enhanced Clickable Metrics Row with Interactive Filtering */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>দ্রুত ফিল্টারিং সামারি কার্ডসমূহ (ক্লিক করে সরাসরি ফিল্টার করুন):</span>
          </span>
          {selectedStatus !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ফিল্টার রিসেট / সকল আবেদন দেখুন</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: All Applications */}
          <div 
            onClick={() => setSelectedStatus('all')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
              selectedStatus === 'all' 
                ? 'ring-2 ring-slate-800 border-slate-800 bg-slate-900 text-white' 
                : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedStatus === 'all' ? 'text-slate-200' : 'text-slate-600'}`}>
                মোট আবেদন
              </span>
              {selectedStatus === 'all' && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  ✓ সক্রিয়
                </span>
              )}
            </div>
            <span className={`text-2xl font-black block tracking-tight ${selectedStatus === 'all' ? 'text-white' : 'text-slate-900'}`}>
              {toBanglaNumber(totalCount)}
            </span>
            <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              সকল রেকর্ড (All)
            </span>
          </div>

          {/* Card 2: Pending */}
          <div 
            onClick={() => setSelectedStatus('pending')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
              selectedStatus === 'pending' 
                ? 'ring-2 ring-amber-600 border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-md' 
                : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedStatus === 'pending' ? 'text-amber-950' : 'text-amber-900'}`}>
                অপেক্ষমান
              </span>
              {selectedStatus === 'pending' && (
                <span className="bg-slate-900 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  ✓ সক্রিয়
                </span>
              )}
            </div>
            <span className={`text-2xl font-black block tracking-tight ${selectedStatus === 'pending' ? 'text-slate-950' : 'text-amber-900'}`}>
              {toBanglaNumber(pendingCount)}
            </span>
            <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'pending' ? 'text-amber-950/80 font-medium' : 'text-amber-700'}`}>
              যাচাইয়ের অপেক্ষায় (Pending)
            </span>
          </div>

          {/* Card 3: In Progress */}
          <div 
            onClick={() => setSelectedStatus('in_progress')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
              selectedStatus === 'in_progress' 
                ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-600 text-white font-bold shadow-md' 
                : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedStatus === 'in_progress' ? 'text-white' : 'text-blue-900'}`}>
                চলমান / তদন্তাধীন
              </span>
              {selectedStatus === 'in_progress' && (
                <span className="bg-white text-blue-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  ✓ সক্রিয়
                </span>
              )}
            </div>
            <span className={`text-2xl font-black block tracking-tight ${selectedStatus === 'in_progress' ? 'text-white' : 'text-blue-900'}`}>
              {toBanglaNumber(investigatingCount)}
            </span>
            <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'in_progress' ? 'text-blue-100' : 'text-blue-700'}`}>
              তদন্তাধীন (In Progress)
            </span>
          </div>

          {/* Card 4: Completed / Approved */}
          <div 
            onClick={() => setSelectedStatus('completed')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
              selectedStatus === 'completed' 
                ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-700 text-white font-bold shadow-md' 
                : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedStatus === 'completed' ? 'text-white' : 'text-emerald-900'}`}>
                সম্পন্ন / অনুমোদিত
              </span>
              {selectedStatus === 'completed' && (
                <span className="bg-white text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  ✓ সক্রিয়
                </span>
              )}
            </div>
            <span className={`text-2xl font-black block tracking-tight ${selectedStatus === 'completed' ? 'text-white' : 'text-emerald-950'}`}>
              {toBanglaNumber(approvedCount)}
            </span>
            <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'completed' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              সনদ প্রদান সম্পন্ন (Approved)
            </span>
          </div>

          {/* Card 5: Rejected */}
          <div 
            onClick={() => setSelectedStatus('rejected')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
              selectedStatus === 'rejected' 
                ? 'ring-2 ring-red-600 border-red-500 bg-red-700 text-white font-bold shadow-md' 
                : 'bg-red-50/50 border-red-200 hover:bg-red-50 hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedStatus === 'rejected' ? 'text-white' : 'text-red-900'}`}>
                বাতিল / স্থগিত
              </span>
              {selectedStatus === 'rejected' && (
                <span className="bg-white text-red-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  ✓ সক্রিয়
                </span>
              )}
            </div>
            <span className={`text-2xl font-black block tracking-tight ${selectedStatus === 'rejected' ? 'text-white' : 'text-red-950'}`}>
              {toBanglaNumber(rejectedCount)}
            </span>
            <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'rejected' ? 'text-red-100' : 'text-red-700'}`}>
              বাতিলকৃত আবেদন (Rejected)
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar for XEN */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              নির্বাহী প্রকৌশলী (XEN) এর দ্রুত আবেদন অনুসন্ধান ও ফিল্টারিং ফিল্টার
            </span>
          </div>
          {(searchQuery || selectedMouza !== 'all' || selectedWard !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMouza('all');
                setSelectedWard('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>সকল ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search by Name / Mobile / ID */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              নাম অথবা মোবাইল নম্বর অনুসন্ধান <span className="text-emerald-700 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="আবেদনকারীর নাম / 018XXXXXXXX..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-normal focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Mouza Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মৌজা এলাকা (Mouza)
            </label>
            <select
              value={selectedMouza}
              onChange={(e) => setSelectedMouza(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="all">সকল মৌজা (All Mouzas)</option>
              {VALID_MOUZAS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} (জে.এল. {toBanglaNumber(m.jlNo)})
                </option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ওয়ার্ড নং (Ward)
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="all">সকল ওয়ার্ড (All Wards)</option>
              {VALID_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আবেদনের অবস্থা (Status Filter)
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="all">সকল আবেদন (All)</option>
              <option value="pending">অপেক্ষমান (Pending)</option>
              <option value="in_progress">চলমান / তদন্তাধীন (In Progress)</option>
              <option value="completed">সম্পন্ন / অনুমোদিত (Completed)</option>
              <option value="rejected">বাতিল (Rejected)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>আবেদনসমূহের তালিকা ও সরজমিন মূল্যায়ন</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
                {toBanglaNumber(filteredApps.length)} টি
              </span>
            </h3>
            {selectedAppIds.length > 0 && (
              <span className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                ✓ {toBanglaNumber(selectedAppIds.length)} টি নির্বাচিত
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePurgeDemoData('demarcation')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all border border-rose-200 cursor-pointer shadow-2xs"
              title="ডিমার্কেশন প্রত্যয়ন ফরমের সকল ডেমো / পরীক্ষামূলক আবেদন মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>সকল ডেমো মুছুন</span>
            </button>

            <button
              type="button"
              onClick={() => setCsvExportModalModule('demarcation')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-emerald-600"
              title="ডিমার্কেশন ফরমের কাস্টম CSV এক্সপোর্ট ও ফিল্টারিং"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>কাস্টম CSV ডাউনলোড</span>
            </button>

            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-600 rounded-lg cursor-pointer text-xs font-bold text-slate-700 hover:bg-emerald-50/50 transition-all shadow-2xs select-none">
              <input
                type="checkbox"
                checked={selectedAppIds.length === filteredApps.length && filteredApps.length > 0}
                onChange={handleToggleSelectAll}
                className="rounded text-emerald-700 w-4 h-4 cursor-pointer focus:ring-emerald-500"
              />
              <span>
                {selectedAppIds.length === filteredApps.length && filteredApps.length > 0
                  ? 'সবগুলো নির্বাচন বাতিল করুন'
                  : 'সবগুলো নির্বাচন করুন (Select All)'}
              </span>
            </label>

            {selectedAppIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAppIds([])}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="নির্বাচন রিসেট করুন"
              >
                রিসেট
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-800 border-b border-slate-200">
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedAppIds.length === filteredApps.length && filteredApps.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded text-emerald-700 w-4 h-4 cursor-pointer focus:ring-emerald-500"
                    title={selectedAppIds.length === filteredApps.length ? "সকল নির্বাচন বাতিল করুন" : "সকল ফিল্টারকৃত আবেদন নির্বাচন করুন"}
                  />
                </th>
                <th className="p-3 font-bold">ফরম নং ও ট্র্যাকিং আইডি</th>
                <th className="p-3 font-bold">আবেদনকারী ও যোগাযোগ</th>
                <th className="p-3 font-bold bg-emerald-50 text-emerald-950">মৌজা এলাকা</th>
                <th className="p-3 font-bold bg-emerald-50 text-emerald-950">ওয়ার্ড নং</th>
                <th className="p-3 font-bold">তফসিল ও জমির পরিমাণ</th>
                <th className="p-3 font-bold bg-amber-50 text-amber-950">নক্সাকার সরজমিন মন্তব্য</th>
                <th className="p-3 font-bold">আবেদনের অবস্থা</th>
                <th className="p-3 font-bold text-center">কার্যক্রম (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    কোনো আবেদন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = selectedAppIds.includes(app.id);
                  return (
                    <tr key={app.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                      <td className="p-3 align-top text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectApp(app.id)}
                          className="rounded text-emerald-700 w-4 h-4 cursor-pointer focus:ring-emerald-500 mt-1"
                        />
                      </td>

                      <td className="p-3 align-top">
                        <div className="font-mono font-bold text-xs text-slate-900">{app.id}</div>
                        <div className="font-mono text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {app.formNo || `SKM-FORM-${app.id.replace(/\D/g, '').slice(-6) || '849201'}`}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {formatBanglaDate(app.createdAt)}
                        </div>
                      </td>

                      <td className="p-3 align-top">
                        <div className="font-bold text-slate-900">{app.siteLocation.applicantName}</div>
                        <div className="text-slate-600">{app.siteLocation.applicantMobile}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NID: {app.siteLocation.applicantNid}</div>
                      </td>

                      <td className="p-3 align-top bg-emerald-50/40">
                        <div className="font-semibold text-emerald-950">{app.schedule.mouzaName}</div>
                        <div className="text-[10px] text-emerald-800">জে.এল. {toBanglaNumber(app.schedule.jlNo)}</div>
                      </td>

                      <td className="p-3 align-top bg-emerald-50/40">
                        <div className="font-bold text-emerald-950">{app.schedule.wardNo}</div>
                      </td>

                      <td className="p-3 align-top">
                        <div>খতিয়ান: {toBanglaNumber(app.schedule.bsKhatianNo)}, দাগ: {toBanglaNumber(app.schedule.bsDagNo)}</div>
                        <div className="text-[11px] text-slate-500">জমির পরিমাণ: {app.schedule.landArea}</div>
                        <div className="text-[11px] text-slate-500">দলিল: {app.schedule.deedNo}</div>
                      </td>

                      {/* Authorized only draftsman remarks column */}
                      <td className="p-3 align-top bg-amber-50/30 max-w-[220px]">
                        {app.draftsmanReview?.remarks ? (
                          <div className="text-[11px] text-amber-950 line-clamp-3" title={app.draftsmanReview.remarks}>
                            {app.draftsmanReview.remarks}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">এখনও মন্তব্য লিপিবদ্ধ করা হয়নি</span>
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {app.status === 'approved' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            অনুমোদিত
                          </span>
                        )}
                        {(app.status === 'investigating' || app.status === 'under_review') && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            তদন্তাধীন
                          </span>
                        )}
                        {app.status === 'pending' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            অপেক্ষমান
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                            বাতিল
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-1">
                          ফি: {app.feeStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                        </div>
                      </td>

                      <td className="p-3 align-top text-center space-y-1">
                        <button
                          onClick={() => handleOpenDetailModal(app)}
                          className="w-full px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          যাচাই ও মূল্যায়ন
                        </button>

                        <button
                          onClick={() => onViewPrintA4(app)}
                          className="w-full px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-emerald-700" />
                          <span>প্রিন্ট A4</span>
                        </button>

                        {app.status === 'approved' && (
                          <button
                            onClick={() => onViewCertificate(app)}
                            className="w-full px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded text-xs font-bold border border-emerald-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            <span>প্রত্যয়নপত্র</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteDemarcationApp(app.id, app.siteLocation?.applicantName || 'আবেদন')}
                          className="w-full px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded text-xs font-semibold border border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                          title="এই আবেদনটি স্থায়ীভাবে মুছে ফেলুন"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>আবেদন মুছুন</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedAppIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 max-w-lg w-full">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold">
              {toBanglaNumber(selectedAppIds.length)} টি আবেদন নির্বাচিত
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDeleteDemarcation}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              title="নির্বাচিত আবেদনসমূহ স্থায়ীভাবে মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
              <span>নির্বাচিত {toBanglaNumber(selectedAppIds.length)}টি মুছুন</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulkPrintOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>একত্রে Merged PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedAppIds([])}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}
        </div>
      )}

      {/* MODULE 2: Schedule-1 Building Construction / Pond Digging / Hill Cutting Module */}
      {activeModule === 'schedule1' && (
        <div className="space-y-6">
          {/* Quick Gazette Management Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>ইমারত নির্মাণ সংক্রান্ত আইন ও সরকারি বিধিমালা লাইব্রেরি (১০টি গেজেট PDF)</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">দাপ্তরিক লাইব্রেরি</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">নাগরিক পোর্টালে প্রদর্শিত ১০টি অফিশিয়াল আইন ও গেজেটের পিডিএফ সরাসরি আপলোড, পরিবর্তন ও ডাউনলোড করুন</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModule('gazettes')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow hover:shadow-md transition-all cursor-pointer whitespace-nowrap self-stretch md:self-auto justify-center"
            >
              <span>১০টি গেজেট PDF আপলোড ও পরিচালনা প্যানেল</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Visual Analytics Chart for Schedule-1 */}
          <Schedule1StatusChart
            applications={buildingApplications}
            onStatusClick={(statusCode) => setBuildingSelectedStatus(statusCode)}
            onActivityClick={(activityName) => setBuildingSelectedActivity(activityName)}
          />

          {/* Enhanced Clickable Metrics Row for Schedule-1 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>তফসিল-১ দ্রুত ফিল্টারিং সামারি কার্ডসমূহ (ক্লিক করে সরাসরি ফিল্টার করুন):</span>
              </span>
              {(buildingSelectedStatus !== 'all' || buildingSelectedWard !== 'all' || buildingSelectedActivity !== 'all' || buildingSelectedTreasury !== 'all' || buildingSearchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setBuildingSelectedStatus('all');
                    setBuildingSelectedWard('all');
                    setBuildingSelectedActivity('all');
                    setBuildingSelectedTreasury('all');
                    setBuildingSearchQuery('');
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ফিল্টার রিসেট / সকল আবেদন দেখুন</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: All */}
              <div 
                onClick={() => setBuildingSelectedStatus('all')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  buildingSelectedStatus === 'all' 
                    ? 'ring-2 ring-slate-800 border-slate-800 bg-slate-900 text-white' 
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${buildingSelectedStatus === 'all' ? 'text-slate-200' : 'text-slate-600'}`}>
                    মোট তফসিল-১ আবেদন
                  </span>
                  {buildingSelectedStatus === 'all' && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${buildingSelectedStatus === 'all' ? 'text-white' : 'text-slate-900'}`}>
                  {toBanglaNumber(buildingTotalCount)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${buildingSelectedStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                  ইমারত / পুকুর / পাহাড়
                </span>
              </div>

              {/* Card 2: Submitted / Pending */}
              <div 
                onClick={() => setBuildingSelectedStatus('submitted')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  buildingSelectedStatus === 'submitted' 
                    ? 'ring-2 ring-amber-600 border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-md' 
                    : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${buildingSelectedStatus === 'submitted' ? 'text-amber-950' : 'text-amber-900'}`}>
                    নতুন দাখিলকৃত
                  </span>
                  {buildingSelectedStatus === 'submitted' && (
                    <span className="bg-slate-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${buildingSelectedStatus === 'submitted' ? 'text-slate-950' : 'text-amber-950'}`}>
                  {toBanglaNumber(buildingSubmittedCount)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${buildingSelectedStatus === 'submitted' ? 'text-amber-950' : 'text-amber-700'}`}>
                  ট্রেজারী এন্ট্রি বাকি
                </span>
              </div>

              {/* Card 3: Under Review */}
              <div 
                onClick={() => setBuildingSelectedStatus('under_review')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  buildingSelectedStatus === 'under_review' 
                    ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-600 text-white font-bold shadow-md' 
                    : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${buildingSelectedStatus === 'under_review' ? 'text-white' : 'text-blue-900'}`}>
                    রিভিউ ও তদন্তাধীন
                  </span>
                  {buildingSelectedStatus === 'under_review' && (
                    <span className="bg-white text-blue-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${buildingSelectedStatus === 'under_review' ? 'text-white' : 'text-blue-950'}`}>
                  {toBanglaNumber(buildingUnderReviewCount)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${buildingSelectedStatus === 'under_review' ? 'text-blue-100' : 'text-blue-700'}`}>
                  নক্সাকার পরিদর্শনে
                </span>
              </div>

              {/* Card 4: Approved */}
              <div 
                onClick={() => setBuildingSelectedStatus('approved')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  buildingSelectedStatus === 'approved' 
                    ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-600 text-white font-bold shadow-md' 
                    : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${buildingSelectedStatus === 'approved' ? 'text-white' : 'text-emerald-900'}`}>
                    অনুমোদিত আবেদন
                  </span>
                  {buildingSelectedStatus === 'approved' && (
                    <span className="bg-white text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${buildingSelectedStatus === 'approved' ? 'text-white' : 'text-emerald-950'}`}>
                  {toBanglaNumber(buildingApprovedCount)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${buildingSelectedStatus === 'approved' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  তফসিল-১ অনুমতিপত্র প্রস্তুত
                </span>
              </div>

              {/* Card 5: Total Fees & Treasury Verified */}
              <div 
                onClick={() => setBuildingSelectedTreasury(buildingSelectedTreasury === 'verified' ? 'all' : 'verified')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  buildingSelectedTreasury === 'verified'
                    ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-600 text-white font-bold shadow-md'
                    : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${buildingSelectedTreasury === 'verified' ? 'text-white' : 'text-indigo-900'}`}>
                    মোট সংগৃহীত ফি
                  </span>
                  {buildingSelectedTreasury === 'verified' && (
                    <span className="bg-white text-indigo-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ চালান এন্ট্রিকৃত
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${buildingSelectedTreasury === 'verified' ? 'text-white' : 'text-indigo-950'}`}>
                  ৳ {toBanglaNumber(buildingTotalFees)}/-
                </span>
                <span className={`text-[11px] block mt-0.5 ${buildingSelectedTreasury === 'verified' ? 'text-indigo-100' : 'text-indigo-700'}`}>
                  চালান এন্ট্রি: {toBanglaNumber(buildingTreasuryVerifiedCount)} | বাকি: {toBanglaNumber(buildingTreasuryPendingCount)}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule-1 Filter and Search Bar */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">
                  তফসিল - ১ আবেদন ফিল্টারিং ও বহুমুখী অনুসন্ধান
                </span>
              </div>
              {(buildingSearchQuery || buildingSelectedStatus !== 'all' || buildingSelectedWard !== 'all' || buildingSelectedActivity !== 'all' || buildingSelectedTreasury !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setBuildingSearchQuery('');
                    setBuildingSelectedStatus('all');
                    setBuildingSelectedWard('all');
                    setBuildingSelectedActivity('all');
                    setBuildingSelectedTreasury('all');
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>সকল ফিল্টার রিসেট</span>
                </button>
              )}
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Status filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">আবেদনের স্ট্যাটাস:</label>
                <select
                  value={buildingSelectedStatus}
                  onChange={(e) => setBuildingSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল স্ট্যাটাস (All Status)</option>
                  <option value="submitted">নতুন দাখিলকৃত / অপেক্ষমান</option>
                  <option value="under_review">ট্রেজারী ও সাইট রিভিউাধীন</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">বাতিল (Rejected)</option>
                </select>
              </div>

              {/* Activity filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">কাজের ধরন (Activity Type):</label>
                <select
                  value={buildingSelectedActivity}
                  onChange={(e) => setBuildingSelectedActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল কাজের ধরন</option>
                  <option value="ভবন">বহুতল / পাকা ভবন নির্মাণ</option>
                  <option value="সীমানা">সীমানা প্রাচীর নির্মাণ</option>
                  <option value="পুকুর">পুকুর খনন</option>
                  <option value="পাহাড়">পাহাড় কর্তন / উন্নয়ন</option>
                </select>
              </div>

              {/* Ward filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ওয়ার্ড নং (Ward No):</label>
                <select
                  value={buildingSelectedWard}
                  onChange={(e) => setBuildingSelectedWard(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল ওয়ার্ড (১ - ৯ নং)</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={String(w)}>
                      {toBanglaNumber(w)} নং ওয়ার্ড
                    </option>
                  ))}
                </select>
              </div>

              {/* Treasury status filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ট্রেজারী চালান অবস্থা:</label>
                <select
                  value={buildingSelectedTreasury}
                  onChange={(e) => setBuildingSelectedTreasury(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল ট্রেজারী অবস্থা</option>
                  <option value="verified">ট্রেজারী চালান এন্ট্রিকৃত</option>
                  <option value="pending">ট্রেজারী চালান এন্ট্রি বাকি</option>
                </select>
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="আবেদনকারীর নাম, মোবাইল নম্বর, তফসিল-১ ফরম নং, দাগ নং বা ডিমার্কেশন ট্র্যাকিং আইডি দিয়ে খুঁজুন..."
                value={buildingSearchQuery}
                onChange={(e) => setBuildingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Schedule-1 Applications Data Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  দাখিলকৃত তফসিল-১ আবেদন তালিকা
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                  {toBanglaNumber(filteredBuildingApps.length)} টি
                </span>
                {selectedBuildingAppIds.length > 0 && (
                  <span className="text-xs bg-amber-700 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    ✓ {toBanglaNumber(selectedBuildingAppIds.length)} টি নির্বাচিত
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCsvExportModalModule('schedule1')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-amber-600"
                  title="তফসিল-১ ইমারত অনুমোদন ফরমের কাস্টম CSV এক্সপোর্ট ও ফিল্টারিং"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>তফসিল-১ CSV ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePurgeDemoData('building')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all border border-rose-200 cursor-pointer shadow-2xs"
                  title="তফসিল-১ ফরমের সকল ডেমো / পরীক্ষামূলক আবেদন মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>সকল ডেমো মুছুন</span>
                </button>

                {selectedBuildingAppIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteBuilding}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    title="নির্বাচিত তফসিল-১ আবেদনসমূহ স্থায়ীভাবে মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>নির্বাচিত {toBanglaNumber(selectedBuildingAppIds.length)}টি মুছুন</span>
                  </button>
                )}

                <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-amber-600 rounded-lg cursor-pointer text-xs font-bold text-slate-700 hover:bg-amber-50/50 transition-all shadow-2xs select-none">
                  <input
                    type="checkbox"
                    checked={selectedBuildingAppIds.length === filteredBuildingApps.length && filteredBuildingApps.length > 0}
                    onChange={handleToggleSelectAllBuilding}
                    className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                  />
                  <span>
                    {selectedBuildingAppIds.length === filteredBuildingApps.length && filteredBuildingApps.length > 0
                      ? 'সবগুলো নির্বাচন বাতিল করুন'
                      : 'সবগুলো নির্বাচন করুন (Select All)'}
                  </span>
                </label>

                {selectedBuildingAppIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedBuildingAppIds([])}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="নির্বাচন রিসেট করুন"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </div>

            {filteredBuildingApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">কোন তফসিল-১ আবেদন পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-400">
                  ফিল্টার পরিবর্তন করুন অথবা নতুন তফসিল-১ আবেদন দাখিল হওয়ার অপেক্ষা করুন।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedBuildingAppIds.length === filteredBuildingApps.length && filteredBuildingApps.length > 0}
                          onChange={handleToggleSelectAllBuilding}
                          className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                          title={selectedBuildingAppIds.length === filteredBuildingApps.length ? "সকল নির্বাচন বাতিল করুন" : "সকল তফসিল-১ আবেদন নির্বাচন করুন"}
                        />
                      </th>
                      <th className="p-3 text-center w-10">ক্র.</th>
                      <th className="p-3">তফসিল-১ ফরম নং ও তারিখ</th>
                      <th className="p-3">ডিমার্কেশন ট্র্যাকিং ও প্রত্যয়ন</th>
                      <th className="p-3">আবেদনকারী ও যোগাযোগ</th>
                      <th className="p-3">জমির তফসিল ও সাইট</th>
                      <th className="p-3 text-center">১. ৭ কপি নকশার ফর্দ</th>
                      <th className="p-3">২. ইমারত নির্মাণ ফি ও চালান</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                      <th className="p-3 text-center">নক্সাকার অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBuildingApps.map((bApp: any, idx: number) => {
                      const isSelected = selectedBuildingAppIds.includes(bApp.id);
                      const applicantName = bApp.applicantName || bApp.applicantDetails?.name || 'মোঃ আবেদনকারী';
                      const father = bApp.applicantFatherHusband || bApp.applicantDetails?.fatherHusbandName || '';
                      const mobile = bApp.applicantMobile || bApp.applicantPhone || bApp.applicantDetails?.mobile || '';
                      const demId = bApp.demarcationTrackingId || bApp.demarcationAppId || bApp.demarcationApplicationId || '';
                      const certNo = bApp.demarcationCertificateNo || '';
                      const mouza = bApp.siteDetails?.mouzaName || bApp.mouzaBlockSector || bApp.plotDetails?.mouza || 'আমিরাবাদ';
                      const ward = bApp.siteDetails?.wardNo || bApp.wardNo || bApp.plotDetails?.wardNo || '৭ নং ওয়ার্ড';
                      const dag = bApp.siteDetails?.bsDag || bApp.dagKhatianPlotNo || bApp.plotDetails?.dagNo || '';
                      const khatian = bApp.siteDetails?.bsKhatian || bApp.plotDetails?.khatianNo || '';
                      const area = bApp.constructionDetails?.totalCoveredAreaSqM ? `${toBanglaNumber(bApp.constructionDetails.totalCoveredAreaSqM)} বর্গমিটার` : bApp.siteAreaSize || bApp.plotDetails?.landArea || '';
                      const has7Copies = bApp.sevenCopiesDrawingsSubmitted !== false;
                      const hasFee = bApp.feeStatus === 'paid' || Boolean(bApp.chalanOrDraftNo);

                      return (
                        <tr key={bApp.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}>
                          <td className="p-3 align-middle text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectBuildingApp(bApp.id)}
                              className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                            />
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">
                            {toBanglaNumber(idx + 1)}
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              {bApp.formNo || bApp.id}
                            </span>
                            <span className="text-[11px] text-slate-500 block font-mono">
                              {formatBanglaDate(bApp.createdAt)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200/80 text-[11px] space-y-0.5">
                              <span className="font-bold text-emerald-950 block font-mono">
                                ID: {demId}
                              </span>
                              <span className="text-emerald-800 block text-[10px]">
                                সনদ নং: {certNo}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block text-xs">
                              {applicantName}
                            </span>
                            {father && (
                              <span className="text-[11px] text-slate-600 block">
                                পিতা/স্বামী: {father}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {toBanglaNumber(mobile || '')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block text-xs">
                              {mouza} {ward ? `(ওয়ার্ড-${ward})` : ''}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {khatian ? `খতিয়ান: ${toBanglaNumber(khatian)} | ` : ''}দাগ: {toBanglaNumber(dag || '')}
                            </span>
                            {area && (
                              <span className="text-[10px] text-slate-500 block">
                                পরিমাণ: {area}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {has7Copies ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold text-[11px] border border-emerald-300 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>৭ কপি জমা হয়েছে</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-300 shadow-2xs">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                                <span>৭ কপি জমা বাকি</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 space-y-1">
                            {hasFee ? (
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>৳ {toBanglaNumber(bApp.feeAmount || 1000)}/- পরিশোধিত</span>
                                </div>
                                {bApp.chalanOrDraftNo ? (
                                  <div className="text-[10px] text-slate-700 font-mono">
                                    চালান: <strong>{bApp.chalanOrDraftNo}</strong> ({bApp.bankName || 'সোনালী ব্যাংক'})
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500">
                                    {bApp.moneyReceiptNo ? `রসিদ নং: ${bApp.moneyReceiptNo}` : 'কাউন্টার / ডিজিটাল ফি'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>ফি জমা বাকি</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {bApp.status === 'approved' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300">
                                ✓ অনুমোদিত
                              </span>
                            )}
                            {bApp.status === 'under_review' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold border border-blue-300">
                                ⏳ রিভিউাধীন
                              </span>
                            )}
                            {(bApp.status === 'submitted' || bApp.status === 'pending') && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
                                অপেক্ষমান
                              </span>
                            )}
                            {bApp.status === 'rejected' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-red-100 text-red-900 text-[11px] font-bold border border-red-300">
                                বাতিল
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenTreasuryModal(bApp)}
                                className={
                                  isCurrentOfficerDraftsman
                                    ? "inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                    : "inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                }
                                title={
                                  isCurrentOfficerDraftsman
                                    ? "৭ কপি নকশার ফর্দ এবং ইমারত নির্মাণ আবেদন ফি ও ১৫% ভ্যাট চালান বিবরণ এন্ট্রি ও হালনাগাদ করুন"
                                    : "নক্সাকারের সংরক্ষিত ডাটা ও চালান বিবরণ দেখুন (শুধুমাত্র নক্সাকার সম্পাদনা করতে পারবেন)"
                                }
                              >
                                {isCurrentOfficerDraftsman ? (
                                  <>
                                    <Edit3 className="w-3.5 h-3.5 text-amber-200" />
                                    <span>নক্সাকার ডাটা এন্ট্রি</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                                    <span>নক্সাকার ডাটা দেখুন</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedBuildingPrint(bApp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                title="অফিসিয়াল তফসিল-১ ফরম A4 প্রিন্ট / PDF ভিউ দেখুন"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>তফসিল-১ ফরম</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBuildingApp(bApp.id, applicantName)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200 shadow-xs whitespace-nowrap"
                                title="এই তফসিল-১ আবেদনটি স্থায়ীভাবে মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>মুছুন</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: Road Cutting Module */}
      {activeModule === 'roadcutting' && (
        <div className="space-y-6">
          {/* Visual Analytics Chart for Road Cutting */}
          <RoadCuttingStatusChart
            applications={roadCuttingApplications}
            onStatusClick={(statusCode) => setRoadCuttingSelectedStatus(statusCode)}
            onPurposeClick={(purposeName) => setRoadCuttingSelectedPurpose(purposeName)}
          />

          {/* Enhanced Clickable Metrics Row for Road Cutting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>রাস্তা কর্তন দ্রুত ফিল্টারিং সামারি কার্ডসমূহ (ক্লিক করে সরাসরি ফিল্টার করুন):</span>
              </span>
              {(roadCuttingSelectedStatus !== 'all' || roadCuttingSelectedWard !== 'all' || roadCuttingSelectedPurpose !== 'all' || roadCuttingSearchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setRoadCuttingSelectedStatus('all');
                    setRoadCuttingSelectedWard('all');
                    setRoadCuttingSelectedPurpose('all');
                    setRoadCuttingSearchQuery('');
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ফিল্টার রিসেট / সকল আবেদন দেখুন</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: All */}
              <div 
                onClick={() => setRoadCuttingSelectedStatus('all')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  roadCuttingSelectedStatus === 'all' 
                    ? 'ring-2 ring-slate-800 border-slate-800 bg-slate-900 text-white' 
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${roadCuttingSelectedStatus === 'all' ? 'text-slate-200' : 'text-slate-600'}`}>
                    মোট রাস্তা কর্তন আবেদন
                  </span>
                  {roadCuttingSelectedStatus === 'all' && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${roadCuttingSelectedStatus === 'all' ? 'text-white' : 'text-slate-900'}`}>
                  {toBanglaNumber(roadCuttingApplications.length)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${roadCuttingSelectedStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                  সকল ওয়ার্ড
                </span>
              </div>

              {/* Card 2: Submitted / Pending */}
              <div 
                onClick={() => setRoadCuttingSelectedStatus('submitted')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  roadCuttingSelectedStatus === 'submitted' 
                    ? 'ring-2 ring-amber-600 border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-md' 
                    : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${roadCuttingSelectedStatus === 'submitted' ? 'text-amber-950' : 'text-amber-900'}`}>
                    নতুন দাখিলকৃত
                  </span>
                  {roadCuttingSelectedStatus === 'submitted' && (
                    <span className="bg-slate-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${roadCuttingSelectedStatus === 'submitted' ? 'text-slate-950' : 'text-amber-950'}`}>
                  {toBanglaNumber(roadCuttingApplications.filter((r) => r.status === 'submitted').length)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${roadCuttingSelectedStatus === 'submitted' ? 'text-amber-950' : 'text-amber-700'}`}>
                  পরিদর্শনের অপেক্ষায়
                </span>
              </div>

              {/* Card 3: Approved */}
              <div 
                onClick={() => setRoadCuttingSelectedStatus('approved')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden group ${
                  roadCuttingSelectedStatus === 'approved' 
                    ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-600 text-white font-bold shadow-md' 
                    : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${roadCuttingSelectedStatus === 'approved' ? 'text-white' : 'text-emerald-900'}`}>
                    অনুমোদিত অনুমতিপত্র
                  </span>
                  {roadCuttingSelectedStatus === 'approved' && (
                    <span className="bg-white text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                      ✓ সক্রিয়
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black block tracking-tight ${roadCuttingSelectedStatus === 'approved' ? 'text-white' : 'text-emerald-950'}`}>
                  {toBanglaNumber(roadCuttingApplications.filter((r) => r.status === 'approved').length)}
                </span>
                <span className={`text-[11px] block mt-0.5 ${roadCuttingSelectedStatus === 'approved' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  অনুমতিপত্র ইস্যু সম্পন্ন
                </span>
              </div>

              {/* Card 4: Total Fees */}
              <div className="p-3.5 rounded-xl border bg-indigo-50/50 border-indigo-200 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-900">
                    মোট ফরম ফি আদায়
                  </span>
                </div>
                <span className="text-2xl font-black block tracking-tight text-indigo-950">
                  ৳ {toBanglaNumber(roadCuttingApplications.reduce((sum, r) => sum + (r.applicationFee || 300), 0))}/-
                </span>
                <span className="text-[11px] block mt-0.5 text-indigo-700">
                  প্রতি আবেদন ৳ ৩০০/-
                </span>
              </div>
            </div>
          </div>

          {/* Road Cutting Multi-Filter Toolbar */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">
                  রাস্তা কর্তন আবেদন বহুমুখী অনুসন্ধান ও ফিল্টারিং
                </span>
              </div>
              {(roadCuttingSearchQuery || roadCuttingSelectedStatus !== 'all' || roadCuttingSelectedWard !== 'all' || roadCuttingSelectedPurpose !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setRoadCuttingSearchQuery('');
                    setRoadCuttingSelectedStatus('all');
                    setRoadCuttingSelectedWard('all');
                    setRoadCuttingSelectedPurpose('all');
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ফিল্টার রিসেট</span>
                </button>
              )}
            </div>

            {/* Dropdown filters grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">আবেদনের অবস্থা (Status):</label>
                <select
                  value={roadCuttingSelectedStatus}
                  onChange={(e) => setRoadCuttingSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল অবস্থা (All Status)</option>
                  <option value="submitted">নতুন দাখিলকৃত / অপেক্ষমান</option>
                  <option value="under_review">তদন্ত ও পরিদর্শনে</option>
                  <option value="approved">চূড়ান্ত অনুমোদিত</option>
                  <option value="rejected">বাতিল</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">কর্তনের উদ্দেশ্য (Purpose):</label>
                <select
                  value={roadCuttingSelectedPurpose}
                  onChange={(e) => setRoadCuttingSelectedPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল উদ্দেশ্য</option>
                  <option value="পানি">পানি সরবরাহ লাইন (ওয়াসা)</option>
                  <option value="গ্যাস">গ্যাস সংযোগ পাইপলাইন</option>
                  <option value="ড্রেন">ড্রেন / পয়ঃনিষ্কাশন</option>
                  <option value="বিদ্যুৎ">ভূগর্ভস্থ বিদ্যুৎ ক্যাবল</option>
                  <option value="টেলিকম">টেলিকম ও ফাইবার অপটিক</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ওয়ার্ড নং (Ward No):</label>
                <select
                  value={roadCuttingSelectedWard}
                  onChange={(e) => setRoadCuttingSelectedWard(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="all">সকল ওয়ার্ড (১ - ৯ নং)</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={String(w)}>
                      {toBanglaNumber(w)} নং ওয়ার্ড
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="আবেদনকারীর নাম, মোবাইল নম্বর, ট্র্যাকিং আইডি বা রাস্তার নাম দিয়ে খুঁজুন..."
                value={roadCuttingSearchQuery}
                onChange={(e) => setRoadCuttingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <Construction className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-slate-800">
                  দাখিলকৃত রাস্তা কর্তন আবেদন তালিকা
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                  {toBanglaNumber(filteredRoadCuttingApps.length)} টি
                </span>
                {selectedRoadCuttingAppIds.length > 0 && (
                  <span className="text-xs bg-amber-700 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    ✓ {toBanglaNumber(selectedRoadCuttingAppIds.length)} টি নির্বাচিত
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePurgeDemoData('road_cutting')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all border border-rose-200 cursor-pointer shadow-2xs"
                  title="রাস্তা কর্তন ফরমের সকল ডেমো / পরীক্ষামূলক আবেদন মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>সকল ডেমো মুছুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCsvExportModalModule('roadcutting')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-amber-600"
                  title="রাস্তা কর্তন অনুমোদন ফরমের কাস্টম CSV এক্সপোর্ট ও ফিল্টারিং"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>রাস্তা কর্তন CSV ডাউনলোড</span>
                </button>

                <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-amber-600 rounded-lg cursor-pointer text-xs font-bold text-slate-700 hover:bg-amber-50/50 transition-all shadow-2xs select-none">
                  <input
                    type="checkbox"
                    checked={selectedRoadCuttingAppIds.length === filteredRoadCuttingApps.length && filteredRoadCuttingApps.length > 0}
                    onChange={handleToggleSelectAllRoadCutting}
                    className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                  />
                  <span>
                    {selectedRoadCuttingAppIds.length === filteredRoadCuttingApps.length && filteredRoadCuttingApps.length > 0
                      ? 'সবগুলো নির্বাচন বাতিল করুন'
                      : 'সবগুলো নির্বাচন করুন (Select All)'}
                  </span>
                </label>

                {selectedRoadCuttingAppIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoadCuttingAppIds([])}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="নির্বাচন রিসেট করুন"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </div>

            {filteredRoadCuttingApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Construction className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">কোন রাস্তা কর্তন আবেদন দাখিল হয়নি।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedRoadCuttingAppIds.length === filteredRoadCuttingApps.length && filteredRoadCuttingApps.length > 0}
                          onChange={handleToggleSelectAllRoadCutting}
                          className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                          title={selectedRoadCuttingAppIds.length === filteredRoadCuttingApps.length ? "সকল নির্বাচন বাতিল করুন" : "সকল রাস্তা কর্তন আবেদন নির্বাচন করুন"}
                        />
                      </th>
                      <th className="p-3 text-center w-10">ক্র.</th>
                      <th className="p-3">ট্র্যাকিং আইডি ও তারিখ</th>
                      <th className="p-3">আবেদনকারী ও ফোন</th>
                      <th className="p-3">রাস্তা ও ওয়ার্ড</th>
                      <th className="p-3">উদ্দেশ্য ও পরিমাপ</th>
                      <th className="p-3">ফরম ফি</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoadCuttingApps.map((rcApp, idx) => {
                      const isSelected = selectedRoadCuttingAppIds.includes(rcApp.id);
                      return (
                        <tr key={rcApp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}>
                          <td className="p-3 align-middle text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRoadCuttingApp(rcApp.id)}
                              className="rounded text-amber-700 w-4 h-4 cursor-pointer focus:ring-amber-500"
                            />
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">
                            {toBanglaNumber(idx + 1)}
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              {rcApp.id}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {formatBanglaDate(rcApp.createdAt)}
                            </span>
                          </td>
                          <td className="p-3">
                            <strong className="text-slate-900 block">{rcApp.applicantName}</strong>
                            <span className="text-slate-500 font-mono">{toBanglaNumber(rcApp.applicantPhone)}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{rcApp.roadName}</span>
                            <span className="text-slate-500 text-[11px]">{rcApp.wardNo}</span>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] mb-1">
                              {rcApp.purposeTitle}
                            </span>
                            <div className="text-[11px] text-slate-600">
                              {toBanglaNumber(rcApp.cuttingLengthFt)} × {toBanglaNumber(rcApp.cuttingWidthFt)} = {toBanglaNumber(rcApp.totalAreaSqFt)} বর্গফুট
                            </div>
                          </td>
                          <td className="p-3">
                            <strong className="text-emerald-900 block font-bold">
                              ৳ {toBanglaNumber(rcApp.applicationFee || 300)}/-
                            </strong>
                            <span className="text-[10px] text-slate-500">ক্যাশ কাউন্টার</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              rcApp.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {rcApp.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমান'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {rcApp.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...rcApp, status: 'approved' as const, permitNo: `SKM-RC-PERMIT-${Math.floor(1000 + Math.random() * 9000)}`, permitIssueDate: new Date().toISOString() };
                                    updateRoadCuttingApplication(updated);
                                    setRoadCuttingApplications(getRoadCuttingApplications());
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                                >
                                  অনুমোদন
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedRoadCuttingPrint(rcApp)}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                              >
                                প্রিন্ট / PDF
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteRoadCuttingApp(rcApp.id, rcApp.applicantName || 'আবেদন')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs border border-rose-200 flex items-center justify-center gap-1"
                                title="এই রাস্তা কর্তন আবেদনটি স্থায়ীভাবে মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>মুছুন</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 4: Council & Officers Management Panel */}
      {activeModule === 'council' && (
        <div className="space-y-6 animate-fade-in">
          <CouncilManagementPanel 
            onSuccessNotification={(msg) => {
              setSaveSuccessMsg(msg);
              setTimeout(() => setSaveSuccessMsg(null), 4000);
            }} 
          />
        </div>
      )}

      {/* MODULE 5: Notice, Office Order & Tender Management */}
      {activeModule === 'notices' && (
        <div className="space-y-6 animate-fade-in">
          <NoticeManagementPanel
            onSuccessNotification={(msg) => {
              setSaveSuccessMsg(msg);
              setTimeout(() => setSaveSuccessMsg(null), 4000);
            }}
          />
        </div>
      )}

      {/* MODULE 6: Building Laws & Official Gazettes PDF Library Management */}
      {activeModule === 'gazettes' && (
        <div className="space-y-6 animate-fade-in">
          <GazetteManagementPanel
            onSuccessNotification={(msg) => {
              setSaveSuccessMsg(msg);
              setTimeout(() => setSaveSuccessMsg(null), 4000);
            }}
          />
        </div>
      )}

      {/* MODULE 7: Media, Photo & Video Gallery Management */}
      {activeModule === 'media' && (
        <div className="space-y-6 animate-fade-in">
          <MediaManagementPanel />
        </div>
      )}

      {/* Road Cutting Print Modal in Officer Dashboard */}
      {selectedRoadCuttingPrint && (
        <RoadCuttingApplicationPrintA4
          application={selectedRoadCuttingPrint}
          onClose={() => setSelectedRoadCuttingPrint(null)}
        />
      )}

      {/* Building Approval Permit (Official 2-Page Letter) Print Modal */}
      {selectedBuildingPermitPrint && (
        <BuildingApprovalPermitPrintA4
          application={selectedBuildingPermitPrint}
          onClose={() => setSelectedBuildingPermitPrint(null)}
        />
      )}

      {/* Schedule 1 Application Form Print Modal */}
      {selectedBuildingPrint && (
        <Schedule1ApplicationPrintA4
          application={selectedBuildingPrint}
          onClose={() => setSelectedBuildingPrint(null)}
        />
      )}

      {/* =========================================================================
          PASSWORD CHANGE MODAL
          ========================================================================= */}
      {isChangePasswordOpen && currentOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">পাসওয়ার্ড পরিবর্তন</h3>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-5 space-y-4 text-sm">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-slate-500 block">কর্মকর্তার পদবী:</span>
                <span className="font-bold text-slate-900">{currentOfficer.title}</span>
                <span className="text-slate-500 block mt-0.5">আইডি: {currentOfficer.username}</span>
              </div>

              {pwdChangeError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{pwdChangeError}</span>
                </div>
              )}

              {pwdChangeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{pwdChangeSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমান পাসওয়ার্ড (Current Password) <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নতুন পাসওয়ার্ড (New Password) <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password) <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  পাসওয়ার্ড সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          APPLICATION INSPECTION & REVIEW MODAL
          ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    আবেদন যাচাই ও মূল্যায়ন প্যানেল
                  </h3>
                  <span className="text-xs text-slate-300 font-mono">
                    আইডি: {selectedApp.id} | ফরম নং: {selectedApp.formNo || `SKM-FORM-${selectedApp.id.replace(/\D/g, '').slice(-6) || '849201'}`} | দাখিল: {formatBanglaDate(selectedApp.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {saveSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Draftsman Role Active Notice Banner */}
              {currentOfficer?.role === 'draftsman' && (
                <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3.5 rounded-xl flex items-start gap-3 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 block text-sm mb-0.5">
                      নক্সাকার (সিভিল) সরজমিন পরিদর্শন ও নথিপত্র মূল্যায়ন মোড সক্রিয়
                    </span>
                    <p className="text-amber-800 leading-relaxed">
                      আপনি এই আবেদনে <strong>নক্সাকারের সরজমিন মূল্যায়ন মন্তব্য</strong>, <strong>সাইট পরিদর্শন স্ট্যাটাস</strong>, <strong>জমির জিপিএস লোকেশন (ম্যাপ পিন)</strong> এবং নিচের <strong>সংযুক্ত নথিপত্র ও মৌজা ম্যাপসমূহ (নতুন ম্যাপ/নথি যোগ, এডিট বা ফাইল প্রতিস্থাপন)</strong> সরাসরি হালনাগাদ করতে পারবেন। আবেদন অনুমোদন/বাতিল এবং অন্যান্য প্রশাসনিক তথ্য সুরক্ষিত রাখা হয়েছে।
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Mode Toggle Bar - শুধুমাত্র admin/super_admin রোলে দেখাবে, Draftsman দেখতে পাবে না */}
              {isAdmin && currentOfficer?.role !== 'draftsman' && (
                <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-emerald-600/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-400/30">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                        <span>সুপার অ্যাডমিন ফুল এডিট প্যানেল</span>
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                          Admin Unrestricted
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        আবেদনকারীর নাম, ঠিকানা, খতিয়ান-দাগ, ভূমির মালিক ও চৌহদ্দিসহ প্রতিটি তথ্য পরিবর্তন করার পূর্ণ নিয়ন্ত্রণ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdminEditMode(!isAdminEditMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdminEditMode
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isAdminEditMode ? 'এডিট মোড সক্রিয় (Active)' : 'সবকিছু এডিট করুন (Enable Edit)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Digital QR Code Verification Box */}
              <ApplicationQRCodeCard
                applicationId={selectedApp.id}
                applicantName={editApplicantName || selectedApp.siteLocation.applicantName}
                compact
              />

              {/* IF ADMIN EDIT MODE IS ACTIVE */}
              {isAdminEditMode ? (
                <div className="space-y-6 animate-in fade-in">
                  {/* ADMIN SECTION 1: APPLICANT DETAILS */}
                  <div className="border border-emerald-300 bg-emerald-50/40 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-700" />
                        <span>১. আবেদনকারী ও যোগাযোগের তথ্যাদি সংশোধন (Applicant Information)</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                        অ্যাডমিন সম্পাদনা
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          আবেদনকারীর নাম <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editApplicantName}
                          onChange={(e) => setEditApplicantName(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          পিতা/স্বামীর নাম <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editApplicantFatherHusband}
                          onChange={(e) => setEditApplicantFatherHusband(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          জাতীয় পরিচয়পত্র (NID) নম্বর
                        </label>
                        <input
                          type="text"
                          value={editApplicantNid}
                          onChange={(e) => setEditApplicantNid(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          মোবাইল নম্বর (SMS এলার্ট প্রাপ্তি) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editApplicantMobile}
                          onChange={(e) => setEditApplicantMobile(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ই-মেইল এড্রেস (Email Notification)
                        </label>
                        <input
                          type="email"
                          value={editApplicantEmail}
                          onChange={(e) => setEditApplicantEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ফরম ট্র্যাকিং রেফারেন্স
                        </label>
                        <input
                          type="text"
                          value={editFormNo}
                          onChange={(e) => setEditFormNo(e.target.value)}
                          placeholder="SKM-FORM-XXXXXX"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            বর্তমান ঠিকানা
                          </label>
                          <textarea
                            rows={2}
                            value={editApplicantPresentAddress}
                            onChange={(e) => setEditApplicantPresentAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            স্থায়ী ঠিকানা
                          </label>
                          <textarea
                            rows={2}
                            value={editApplicantPermanentAddress}
                            onChange={(e) => setEditApplicantPermanentAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                          ></textarea>
                        </div>
                      </div>

                      <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            হোল্ডিং / প্লট নম্বর
                          </label>
                          <input
                            type="text"
                            value={editHoldingOrPlotNo}
                            onChange={(e) => setEditHoldingOrPlotNo(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            সড়ক / এলাকার নাম
                          </label>
                          <input
                            type="text"
                            value={editRoadOrArea}
                            onChange={(e) => setEditRoadOrArea(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ল্যান্ডমার্ক / পরিচিত স্থান
                          </label>
                          <input
                            type="text"
                            value={editLandmark}
                            onChange={(e) => setEditLandmark(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN SECTION 2: LAND SCHEDULE & BOUNDARIES */}
                  <div className="border border-slate-300 bg-slate-50/70 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <FileSpreadsheetIcon className="w-4 h-4 text-emerald-700" />
                        <span>২. ভূমির পূর্ণ তফসিল ও চতুর্দিকের চৌহদ্দি সংশোধন (Land Schedule)</span>
                      </h4>
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                        মৌজা ও দাগ খতিয়ান
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          মৌজা এলাকা <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={editMouzaName}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setEditMouzaName(selected);
                            const found = VALID_MOUZAS.find((m) => m.name === selected);
                            if (found) setEditJlNo(found.jlNo);
                          }}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
                        >
                          {VALID_MOUZAS.map((m) => (
                            <option key={m.name} value={m.name}>{m.name} (জে.এল. {toBanglaNumber(m.jlNo)})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          জে.এল. নম্বর
                        </label>
                        <input
                          type="text"
                          value={editJlNo}
                          onChange={(e) => setEditJlNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          পৌর ওয়ার্ড নম্বর <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={editWardNo}
                          onChange={(e) => setEditWardNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
                        >
                          {VALID_WARDS.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বি.এস খতিয়ান নং <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editBsKhatianNo}
                          onChange={(e) => setEditBsKhatianNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          বি.এস দাগ নং <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editBsDagNo}
                          onChange={(e) => setEditBsDagNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          সৃজিত বি.এস খতিয়ান (নামজারি)
                        </label>
                        <input
                          type="text"
                          value={editCreatedBsKhatianNo}
                          onChange={(e) => setEditCreatedBsKhatianNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          আর.এস খতিয়ান নং
                        </label>
                        <input
                          type="text"
                          value={editRsKhatianNo}
                          onChange={(e) => setEditRsKhatianNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          আর.এস দাগ নং
                        </label>
                        <input
                          type="text"
                          value={editRsDagNo}
                          onChange={(e) => setEditRsDagNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          জমির পরিমাণ (শতাংশ/শতক) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={editLandArea}
                          onChange={(e) => setEditLandArea(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          জমির শ্রেণি <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={editLandClass}
                          onChange={(e) => setEditLandClass(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        >
                          {LAND_CLASSES.map((lc) => (
                            <option key={lc} value={lc}>{lc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          মালিকানা দলিল নং
                        </label>
                        <input
                          type="text"
                          value={editDeedNo}
                          onChange={(e) => setEditDeedNo(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          দলিলের তারিখ
                        </label>
                        <input
                          type="date"
                          value={editDeedDate}
                          onChange={(e) => setEditDeedDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>

                      {/* 4 Boundaries */}
                      <div className="sm:col-span-3 pt-2 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-800 block mb-2">
                          চতুর্দিকের চৌহদ্দি (Boundaries):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">উত্তরে</label>
                            <input
                              type="text"
                              value={editBoundaryNorth}
                              onChange={(e) => setEditBoundaryNorth(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">দক্ষিণে</label>
                            <input
                              type="text"
                              value={editBoundarySouth}
                              onChange={(e) => setEditBoundarySouth(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">পূর্বে</label>
                            <input
                              type="text"
                              value={editBoundaryEast}
                              onChange={(e) => setEditBoundaryEast(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">পশ্চিমে</label>
                            <input
                              type="text"
                              value={editBoundaryWest}
                              onChange={(e) => setEditBoundaryWest(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN SECTION 3: LAND OWNERS LIST EDITOR */}
                  <div className="border border-slate-300 bg-white rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>৩. ভূমির মালিকদের পূর্ণ তালিকা ও এডিটর ({toBanglaNumber(editLandOwners.length)} জন)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOwner}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন মালিক যোগ করুন</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editLandOwners.map((owner, idx) => (
                        <div
                          key={owner.id || idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                            <span className="text-xs font-bold text-slate-800">
                              মালিক নং #{toBanglaNumber(idx + 1)}
                            </span>
                            {editLandOwners.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOwner(idx)}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>মুছুন</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">মালিকের নাম</label>
                              <input
                                type="text"
                                value={owner.name}
                                onChange={(e) => handleUpdateOwner(idx, 'name', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">পিতা/স্বামীর নাম</label>
                              <input
                                type="text"
                                value={owner.fatherOrHusbandName}
                                onChange={(e) => handleUpdateOwner(idx, 'fatherOrHusbandName', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">এনআইডি নম্বর</label>
                              <input
                                type="text"
                                value={owner.nid || ''}
                                onChange={(e) => handleUpdateOwner(idx, 'nid', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">ইমেইল</label>
                              <input
                                type="email"
                                value={owner.email || ''}
                                onChange={(e) => handleUpdateOwner(idx, 'email', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-slate-500 mb-0.5">স্থায়ী ঠিকানা</label>
                              <input
                                type="text"
                                value={owner.permanentAddress}
                                onChange={(e) => handleUpdateOwner(idx, 'permanentAddress', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-slate-500 mb-0.5">বর্তমান ঠিকানা</label>
                              <input
                                type="text"
                                value={owner.presentAddress}
                                onChange={(e) => handleUpdateOwner(idx, 'presentAddress', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white rounded-md border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADMIN SECTION 4: PROPOSED CONSTRUCTION DETAILS */}
                  <div className="border border-slate-300 bg-slate-50/70 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span>৪. প্রস্তাবিত নির্মাণ ও কাঠামোগত বিবরণ (Proposed Construction)</span>
                      </h4>
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                        ইমারত / স্থাপনা
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          নির্মাণের ধরন <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={editConstructionType}
                          onChange={(e) => setEditConstructionType(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
                        >
                          {CONSTRUCTION_TYPES.map((pc) => (
                            <option key={pc} value={pc}>{pc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          তলা সংখ্যা
                        </label>
                        <input
                          type="text"
                          value={editFloorsCount}
                          onChange={(e) => setEditFloorsCount(e.target.value)}
                          placeholder="যেমন: ৩ তলা"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ভবনের ক্যাটাগরি
                        </label>
                        <select
                          value={editBuildingCategory}
                          onChange={(e) => setEditBuildingCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        >
                          <option value="residential">আবাসিক (Residential)</option>
                          <option value="commercial">বাণিজ্যিক (Commercial)</option>
                          <option value="industrial">শিল্প কারখানা (Industrial)</option>
                          <option value="mixed">মিশ্র ব্যবহার (Mixed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          আনুমানিক আয়তন (বর্গফুট)
                        </label>
                        <input
                          type="text"
                          value={editEstimatedAreaSqFt}
                          onChange={(e) => setEditEstimatedAreaSqFt(e.target.value)}
                          placeholder="যেমন: ১৫০০"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ব্যবহারের সুনির্দিষ্ট উদ্দেশ্য
                        </label>
                        <input
                          type="text"
                          value={editPurpose}
                          onChange={(e) => setEditPurpose(e.target.value)}
                          placeholder="যেমন: আবাসিক পরিবার বসবাস"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* READ ONLY OVERVIEW (DEFAULT VIEW) */
                <div className="space-y-6">
                  {/* 1. Proposed Construction & Schedule Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">মৌজা এলাকা:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {editMouzaName || selectedApp.schedule.mouzaName} (জে.এল. {toBanglaNumber(editJlNo || selectedApp.schedule.jlNo)})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">পৌর ওয়ার্ড নং:</span>
                      <span className="font-bold text-slate-900 text-sm">{editWardNo || selectedApp.schedule.wardNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">প্রস্তাবিত নির্মাণ:</span>
                      <span className="font-bold text-slate-900 text-sm">{editConstructionType || selectedApp.proposedConstruction.constructionType}</span>
                    </div>

                    <div className="sm:col-span-3 pt-2 border-t border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-slate-500 block">দলিল নং ও তারিখ:</span>
                          <span className="font-bold">{editDeedNo || selectedApp.schedule.deedNo} ({editDeedDate || selectedApp.schedule.deedDate})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">সৃজিত বি.এস খতিয়ান:</span>
                          <span className="font-bold">{editCreatedBsKhatianNo || selectedApp.schedule.createdBsKhatianNo || 'প্রযোজ্য নয়'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">বি.এস খতিয়ান ও দাগ:</span>
                          <span className="font-bold">খতিয়ান-{toBanglaNumber(editBsKhatianNo || selectedApp.schedule.bsKhatianNo)}, দাগ-{toBanglaNumber(editBsDagNo || selectedApp.schedule.bsDagNo)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">জমির পরিমাণ ও শ্রেণি:</span>
                          <span className="font-bold">{editLandArea || selectedApp.schedule.landArea} ({editLandClass || selectedApp.schedule.landClass})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. All Land Owners list */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>ভূমির মালিকদের তালিকা ({toBanglaNumber((editLandOwners.length > 0 ? editLandOwners : selectedApp.landOwners).length)} জন)</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {(editLandOwners.length > 0 ? editLandOwners : selectedApp.landOwners).map((owner, idx) => (
                        <div
                          key={owner.id || idx}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs"
                        >
                          <div>
                            <span className="text-[10px] text-slate-500 block">মালিক-{toBanglaNumber(idx + 1)}</span>
                            <span className="font-bold text-slate-900">{owner.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">পিতা/স্বামীর নাম</span>
                            <span>{owner.fatherOrHusbandName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">এনআইডি ও ইমেইল</span>
                            <div className="font-mono text-slate-800 text-[11px]">NID: {owner.nid ? toBanglaNumber(owner.nid) : 'নেই'}</div>
                            {owner.email && <div className="text-[10px] text-slate-500">{owner.email}</div>}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">স্থায়ী ঠিকানা</span>
                            <span className="text-[11px]">{owner.permanentAddress}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">বর্তমান ঠিকানা</span>
                            <span className="text-[11px]">{owner.presentAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2.5 Document Attachments & Mouza Maps Viewer */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                <DocumentAttachmentsViewer
                  documents={selectedApp.documents || []}
                  applicantName={editApplicantName || selectedApp.siteLocation.applicantName}
                  applicationId={selectedApp.id}
                  allowManage={currentOfficer?.role === 'draftsman' || ['admin', 'super_admin'].includes(currentOfficer?.role || '')}
                  onUpdateDocuments={handleUpdateSelectedAppDocuments}
                />
              </div>

              {/* 3. Officer Review & Decision Form (Draftsman Remarks strictly viewable here) */}
              <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা ও প্রকৌশল মূল্যায়ন ও প্রত্যয়ন সিদ্ধান্ত:</span>
                  </h4>
                  <span className="text-[11px] font-semibold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    কর্মকর্তা লগইন সুরক্ষাপ্রাপ্ত
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      আবেদনের স্ট্যাটাস নির্ধারণ <span className="text-red-600">*</span>
                    </label>
                    {!['draftsman', 'admin', 'super_admin', 'executive_engineer', 'mayor'].includes(currentOfficer?.role || '') ? (
                      <div className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between cursor-not-allowed">
                        <span>{getStatusLabelBangla(reviewStatus)}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          🔒 নক্সাকার পরিবর্তনযোগ্য নয়
                        </span>
                      </div>
                    ) : (
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value as ApplicationStatus)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        <option value="pending">অপেক্ষমান (Pending)</option>
                        <option value="investigating">সরজমিনে তদন্তাধীন (Investigating)</option>
                        <option value="approved">অনুমোদিত ও প্রত্যয়িত (Approved)</option>
                        <option value="rejected">বাতিল (Rejected)</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      আবেদন ফি (১০০/- টাকা) স্ট্যাটাস
                    </label>
                    {!['draftsman', 'admin', 'super_admin'].includes(currentOfficer?.role || '') ? (
                      <div className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between cursor-not-allowed">
                        <span>{isFeePaid ? 'পরিশোধিত (Paid)' : 'অপরিশোধিত (Unpaid)'}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          🔒 নক্সাকার পরিবর্তনযোগ্য নয়
                        </span>
                      </div>
                    ) : (
                      <select
                        value={isFeePaid ? 'paid' : 'unpaid'}
                        onChange={(e) => setIsFeePaid(e.target.value === 'paid')}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                      >
                        <option value="unpaid">অপরিশোধিত (Unpaid)</option>
                        <option value="paid">পরিশোধিত (Paid)</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      সরজমিন সাইট পরিদর্শন
                    </label>
                    {currentOfficer?.role === 'draftsman' ? (
                      <div className="flex items-center gap-2 mt-2">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSiteInspected}
                            onChange={(e) => setIsSiteInspected(e.target.checked)}
                            className="rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>পরিদর্শন সম্পন্ন</span>
                        </label>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selectedApp.draftsmanReview?.isSiteInspected ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                        <span>{selectedApp.draftsmanReview?.isSiteInspected ? 'নক্সাকার দ্বারা পরিদর্শন সম্পন্ন' : 'পরিদর্শন এখনও সম্পন্ন হয়নি'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Draftsman remarks - STRICTLY PROTECTED: Editable ONLY by Draftsman ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      নক্সাকার (সিভিল) এর সরজমিন মূল্যায়ন ও প্রত্যয়ন মন্তব্য <span className="text-red-600">*</span>
                    </label>
                    {currentOfficer?.role === 'draftsman' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>নক্সাকার আইডি সক্রিয় (সম্পাদনাযোগ্য)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>সুরক্ষিত: কেবল নক্সাকার আইডি দ্বারা সম্পাদনাযোগ্য (Read-only)</span>
                      </span>
                    )}
                  </div>

                  {currentOfficer?.role === 'draftsman' ? (
                    <>
                    <textarea
                      rows={3}
                      value={draftsmanRemarks}
                      onChange={(e) => setDraftsmanRemarks(e.target.value)}
                      placeholder="নক্সাকার (সিভিল) এর মূল্যায়ন মন্তব্য ও প্রতিবেদন লিখুন..."
                      className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-400 focus:ring-2 focus:ring-emerald-500 text-xs font-normal"
                    ></textarea>
                    <div className="mt-3 rounded-lg border border-dashed border-emerald-400 bg-emerald-50 p-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>ডিমার্কেশন PDF কপি আপলোড করুন</span>
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                              setSaveSuccessMsg('শুধুমাত্র PDF ফাইল আপলোড করা যাবে।');
                              return;
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              setSaveSuccessMsg('শুধু ১০ MB পর্যন্ত PDF ফাইল আপলোড করা যাবে।');
                              return;
                            }
                            setSaveSuccessMsg('PDF সার্ভারে আপলোড হচ্ছে...');
                            const res = await uploadFileToServer(file);
                            if (res.success && res.fileUrl) {
                              setDemarcationPdf({ fileName: file.name, dataUrl: res.fileUrl, uploadedAt: new Date().toISOString() });
                              setSaveSuccessMsg('ডিমার্কেশন PDF সফলভাবে সার্ভারে আপলোড হয়েছে!');
                              setTimeout(() => setSaveSuccessMsg(null), 4000);
                            } else {
                              setSaveSuccessMsg('PDF আপলোড করতে সমস্যা হয়েছে: ' + (res.error || 'সার্ভার ত্রুটি'));
                            }
                          }}
                        />
                      </label>
                      {demarcationPdf && <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-900"><FileDown className="w-3.5 h-3.5" /><span>{demarcationPdf.fileName}</span></div>}
                    </div>
                    </>
                  ) : (
                    <div className="w-full px-3 py-2.5 bg-slate-100 rounded-lg border border-slate-300 text-xs text-slate-800 font-normal">
                      {draftsmanRemarks ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{draftsmanRemarks}</p>
                      ) : (
                        <p className="text-slate-400 italic">নক্সাকার কর্তৃক এখনও কোনো সরজমিন মন্তব্য লিপিবদ্ধ করা হয়নি।</p>
                      )}
                      {selectedApp?.draftsmanReview?.reviewerName && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                          <span>মন্তব্যকারী: <strong>{selectedApp.draftsmanReview.reviewerName}</strong> ({selectedApp.draftsmanReview.designation || 'নক্সাকার (সিভিল)'})</span>
                          {selectedApp.draftsmanReview.reviewDate && (
                            <span>তারিখ: {toBanglaNumber(selectedApp.draftsmanReview.reviewDate)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Noksakar Field Investigation Map Location / GPS Coordinate Live Picker */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>জমির সুনির্দিষ্ট ভৌগোলিক অবস্থান ও জিপিএস পিন (Geographic Map Location - নক্সাকার লাইভ আপডেট):</span>
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                      {currentOfficer?.role === 'draftsman' ? 'নক্সাকার সরজমিন লাইভ ম্যাপিং' : 'নক্সাকার কর্তৃক নির্ধারিত লোকেশন'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs">
                    <LandLocationPicker
                      value={geoCoordinates}
                      onChange={currentOfficer?.role === 'draftsman' ? setGeoCoordinates : () => {}}
                      mouzaName={selectedApp.schedule.mouzaName}
                      wardNo={selectedApp.schedule.wardNo || selectedApp.siteLocation.wardNo}
                    />
                  </div>
                </div>

                {/* If approved, certificate fields — Draftsman রোলে দেখাবে না */}
                {reviewStatus === 'approved' && currentOfficer?.role === 'draftsman' && (
                  <div className="pt-3 border-t border-emerald-200 grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        সনদ নং (Certificate No)
                      </label>
                      <input
                        type="text"
                        value={certificateNo}
                        onChange={(e) => setCertificateNo(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div className="hidden">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        স্মারক নং (Memo No)
                      </label>
                      <input
                        type="text"
                        value={memoNo}
                        onChange={(e) => setMemoNo(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                )}

                {(currentOfficer?.role === 'executive_engineer' || currentOfficer?.role === 'mayor') && (
                  <div className="pt-3 border-t border-emerald-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      নির্বাহী প্রকৌশলী / মেয়র-প্রশাসকের প্রত্যয়ন মন্তব্য (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={3}
                      value={engineerRemarks}
                      onChange={(e) => setEngineerRemarks(e.target.value)}
                      placeholder="প্রয়োজনে প্রত্যয়ন মন্তব্য লিখুন..."
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">এই ভূমিকাগুলো আবেদন ফি ও ভৌগোলিক অবস্থান পরিবর্তন করতে পারবে না।</p>
                  </div>
                )}

                {/* Automated Notification Dispatch Options */}
                <div className="pt-3 border-t border-emerald-200 bg-white/70 p-3 rounded-lg border border-emerald-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendAlertOnSave}
                        onChange={(e) => setSendAlertOnSave(e.target.checked)}
                        className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-emerald-700" />
                        <span>সংরক্ষণের সাথে সাথে আবেদনকারীকে স্বয়ংক্রিয় SMS ও Email এলার্ট পাঠান</span>
                      </span>
                    </label>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Smartphone className="w-3 h-3 text-emerald-700" />
                        <span>SMS: {selectedApp.siteLocation.applicantMobile}</span>
                      </span>
                      {selectedApp.siteLocation.applicantEmail && (
                        <span className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Mail className="w-3 h-3 text-blue-700" />
                          <span>Email: {selectedApp.siteLocation.applicantEmail}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const tpl = generateOfficialEmailTemplate(
                            {
                              ...selectedApp,
                              status: reviewStatus,
                            },
                            reviewStatus,
                            draftsmanRemarks.trim() || undefined,
                            currentOfficer?.name || currentOfficer?.title,
                            currentOfficer?.designation
                          );
                          setEmailPreviewTemplate(tpl);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        title="এই আবেদনের বর্তমান স্ট্যাটাস অনুযায়ী স্বয়ংক্রিয় ইমেইল টেমপ্লেট প্রিভিউ দেখুন"
                      >
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>ইমেইল টেমপ্লেট প্রিভিউ</span>
                      </button>
                    </div>
                  </div>

                  {/* Notification History Log for this application */}
                  {selectedApp.notificationLogs && selectedApp.notificationLogs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        পূর্ববর্তী প্রেরিত এলার্ট হিস্ট্রি (Alert History)
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {selectedApp.notificationLogs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-white border border-slate-200 rounded p-1.5 text-[11px] flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                <span>{log.title}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 line-clamp-1">{log.message}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {formatBanglaDate(log.timestamp || (log as any).sentAt || new Date().toISOString())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Officer Quick Internal Note & Immutable Status Timeline */}
                <div className="hidden bg-slate-50 border border-slate-300 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <span>কর্মকর্তার দ্রুত অভ্যন্তরীণ নোট (Quick Internal Note):</span>
                    </h4>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      টাইমলাইন রেকর্ড
                    </span>
                  </div>

                  {/* Quick Note Status / Auto-save Indicator */}
                  {quickNoteSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-semibold">{quickNoteSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label className="block text-xs font-bold text-slate-700">
                        এই আবেদনের সাথে অভ্যন্তরীণ পর্যবেক্ষণ / তদন্ত নোট যুক্ত করুন:
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {quickNoteAutoSaveStatus === 'typing' && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>টাইপ করা হচ্ছে (অটো-সেভ সক্রিয়)...</span>
                          </span>
                        )}
                        {quickNoteAutoSaveStatus === 'saving' && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 animate-pulse font-semibold">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>স্বয়ংক্রিয়ভাবে সংরক্ষণ হচ্ছে...</span>
                          </span>
                        )}
                        {quickNoteAutoSaveStatus === 'saved' && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>✓ টাইমলাইনে সংরক্ষিত</span>
                          </span>
                        )}
                        {quickNoteAutoSaveStatus === 'idle' && (
                          <span className="text-slate-400 text-[10px]">
                            {quickNoteLastSavedAt ? `সর্বশেষ স্বয়ংক্রিয় সেভ: ${toBanglaNumber(quickNoteLastSavedAt)}` : 'স্বয়ংক্রিয় অটো-সেভ সক্রিয়'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <textarea
                        rows={2}
                        value={quickNoteText}
                        onChange={(e) => setQuickNoteText(e.target.value)}
                        placeholder="নথিপত্র যাচাই, এসিল্যান্ড ও মৌজা রেকর্ড সমন্বয়, সরজমিন দাগের সীমানা বা বিশেষ পর্যবেক্ষণ নোট লিখুন (টাইপ থামানোর সাথে সাথে স্বয়ংক্রিয়ভাবে টাইমলাইনে যুক্ত হবে)..."
                        className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-normal focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuickNote}
                        disabled={!quickNoteText.trim()}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                        title="তাৎক্ষণিকভাবে টাইমলাইনে সংরক্ষণ করতে ক্লিক করুন"
                      >
                        <Plus className="w-4 h-4" />
                        <span>নোট সংরক্ষণ</span>
                      </button>
                    </div>
                  </div>

                  {/* Immutable Status & Internal Note Timeline */}
                  {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                    <div className="pt-3 border-t border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>আবেদনের স্ট্যাটাস ও কর্মকর্তাদের নোটের অপরিবর্তনযোগ্য ইতিহাস (History Timeline):</span>
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedApp.statusHistory.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border text-xs ${
                              item.actionType === 'internal_note'
                                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold flex items-center gap-1.5 flex-wrap">
                                {item.actionType === 'internal_note' ? (
                                  <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    অভ্যন্তরীণ নোট
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    {item.statusTitle}
                                  </span>
                                )}
                                {item.updatedBy && item.designation && (item.updatedBy === item.designation || item.designation.includes(item.updatedBy) || item.updatedBy.includes(item.designation)) ? (
                                  <span>{item.designation}</span>
                                ) : (
                                  <>
                                    <span>{item.updatedBy}</span>
                                    {item.designation && (
                                      <span className="text-[10px] text-slate-500 font-normal">({item.designation})</span>
                                    )}
                                  </>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {formatBanglaDate(item.timestamp)}
                              </span>
                            </div>
                            {item.remarks && (
                              <p className="text-slate-700 text-[11px] leading-relaxed pl-2 border-l-2 border-slate-300 mt-1">
                                {item.remarks}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onViewPrintA4(selectedApp)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-700" />
                  <span>আবেদন কপি (A4)</span>
                </button>

                {selectedApp.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => onViewCertificate(selectedApp)}
                    className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>ডিমার্কেশন প্রত্যয়নপত্র</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedApp) {
                      handleDeleteDemarcationApp(
                        selectedApp.id,
                        selectedApp.applicantName || selectedApp.siteLocation?.applicantName || 'আবেদন'
                      );
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="এই আবেদনটি স্থায়ীভাবে মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>মুছে ফেলুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  বন্ধ করুন
                </button>

                <button
                  type="button"
                  onClick={handleSaveAppUpdates}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{currentOfficer?.role === 'draftsman' ? 'নক্সাকার সরজমিন মন্তব্য সংরক্ষণ করুন' : 'সংরক্ষণ ও আপডেট করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Applications Merged Print View Modal */}
      {isBulkPrintOpen && (
        <BulkApplicationsMergedPrint
          applications={applications.filter((a) => selectedAppIds.includes(a.id))}
          onClose={() => setIsBulkPrintOpen(false)}
        />
      )}

      {/* Field Inspection Schedule Sheet Print Modal */}
      {inspectionPrintApp && (
        <FieldInspectionSchedulePrint
          application={inspectionPrintApp}
          onClose={() => setInspectionPrintApp(null)}
        />
      )}

      {/* All Filtered Applications Print View Modal */}
      {isPrintAllOpen && (
        <AllFilteredApplicationsPrint
          applications={filteredApps}
          filterSummary={{
            searchQuery,
            mouza: selectedMouza,
            ward: selectedWard,
            status: selectedStatus,
          }}
          onClose={() => setIsPrintAllOpen(false)}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* XEN Pending Applications PDF Summary Report Modal */}
      {isPendingPrintOpen && (
        <PendingApplicationsPrint
          applications={applications}
          onClose={() => setIsPendingPrintOpen(false)}
        />
      )}

      {/* Official Automated Email Template Preview Modal */}
      {emailPreviewTemplate && (
        <EmailTemplatePreviewModal
          template={emailPreviewTemplate}
          onClose={() => setEmailPreviewTemplate(null)}
          onSendEmail={() => {
            handleSaveAppUpdates();
            setEmailPreviewTemplate(null);
          }}
        />
      )}

      {/* System Audit Log Viewer Modal (Restricted strictly to Super Admin) */}
      {isAdmin && (
        <SystemAuditLogModal
          isOpen={isAuditLogOpen}
          onClose={() => setIsAuditLogOpen(false)}
        />
      )}


      {/* Noksakar 2-Point Data Update Modal: ৭ কপি নকশার ফর্দ & ইমারত নির্মাণ ফি ও চালান বিবরণ */}
      {treasuryModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 max-w-3xl w-full overflow-hidden my-8 animate-fade-in-scale">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-200 flex items-center justify-center font-bold border border-amber-400/40">
                  <Edit3 className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    নক্সাকারের ডাটা যাচাই ও অনুমোদন এন্ট্রি (তফসিল-১)
                  </h3>
                  <p className="text-xs text-amber-200">
                    ১. ৭ কপি নকশার ফর্দ অবস্থা • ২. আবেদন ফি (১,০০০/- ফিক্সড) • ৩. ইমারত নির্মাণ ফি ও চালান বিবরণ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreasuryModalApp(null)}
                className="text-amber-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Non-draftsman Read-Only Security Warning Banner */}
            {!isCurrentOfficerDraftsman && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center gap-3 text-rose-950 text-xs shadow-xs">
                <Lock className="w-5 h-5 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold text-sm text-rose-950 block">
                    শুধুমাত্র নক্সাকার (draftsman.sitakunda) আইডি দ্বারা এন্ট্রি ও সম্পাদনযোগ্য (রিড-অনলি মোড)
                  </span>
                  <span className="text-[11px] text-rose-800 block mt-0.5">
                    বর্তমান আইডি: <strong>{currentOfficer?.username || 'অন্যান্য কর্মকর্তা'}</strong> ({currentOfficer?.title || currentOfficer?.name})। বিধি মোতাবেক এই ফরমের তথ্য শুধুমাত্র অনুমোদিত নক্সাকার আইডি দ্বারা এন্ট্রি ও হালনাগাদ করা যাবে। অন্য কোনো আইডি দ্বারা ডাটা পরিবর্তন বা অনুমোদন সংরক্ষণ করা যাবে না।
                  </span>
                </div>
              </div>
            )}

            {/* Success Message Banner */}
            {treasurySuccessMsg && (
              <div className="m-5 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="font-bold">{treasurySuccessMsg}</span>
              </div>
            )}

            {/* Application Overview Box */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold block">আবেদনের সারসংক্ষেপ:</span>
                <p className="font-bold text-slate-900">
                  ফরম নং: <span className="font-mono text-emerald-900">{treasuryModalApp.formNo || treasuryModalApp.id}</span>
                </p>
                <p className="text-slate-700">
                  আবেদনকারী: <span className="font-semibold">{(treasuryModalApp as any).applicantName || (treasuryModalApp as any).applicantDetails?.name}</span>
                </p>
                <p className="text-slate-600">
                  সাইট: <span className="font-semibold">{treasuryModalApp.siteDetails?.mouzaName}, {treasuryModalApp.siteDetails?.wardNo}</span>
                </p>
              </div>

              <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-slate-500 font-semibold block">ডিমার্কেশন প্রত্যয়ন তথ্য:</span>
                <p className="text-slate-700 font-mono">
                  আইডি: <strong>{treasuryModalApp.demarcationTrackingId || treasuryModalApp.demarcationAppId}</strong>
                </p>
                <p className="text-slate-700 font-mono">
                  প্রত্যয়ন সনদ নং: <strong>{treasuryModalApp.demarcationCertificateNo}</strong>
                </p>
              </div>
            </div>

            {/* Form with 3 Specific Sections */}
            <form onSubmit={handleSaveTreasuryData} className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              {/* =========================================================
                  ১ম অংশ: ৭ কপি নকশার ফর্দ জমা সংক্রান্ত তথ্য
                  ========================================================= */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>১. ৭ কপি নকশার ফর্দ জমা সংক্রান্ত তথ্য</span>
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold">
                    বিধি ৬ দ্রষ্টব্য
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      ৭ কপি নকশার ফর্দ জমা করেছে কি না? <span className="text-red-600">*</span>
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className={`flex items-center gap-2 font-bold text-emerald-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                        <input
                          type="radio"
                          name="sevenCopies"
                          disabled={!isCurrentOfficerDraftsman}
                          checked={sevenCopiesSubmitted === true}
                          onChange={() => setSevenCopiesSubmitted(true)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>হ্যাঁ, ৭ কপি জমা প্রদান করেছে</span>
                      </label>
                      <label className={`flex items-center gap-2 font-bold text-rose-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                        <input
                          type="radio"
                          name="sevenCopies"
                          disabled={!isCurrentOfficerDraftsman}
                          checked={sevenCopiesSubmitted === false}
                          onChange={() => setSevenCopiesSubmitted(false)}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                        />
                        <span>না, এখনো বাকি আছে</span>
                      </label>
                    </div>
                  </div>

                  {sevenCopiesSubmitted && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-1.5">
                        নকশার ফর্দ জমার তারিখ
                      </label>
                      <input
                        type="date"
                        disabled={!isCurrentOfficerDraftsman}
                        value={sevenCopiesDate}
                        onChange={(e) => setSevenCopiesDate(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    নকশার ফর্দের তালিকা ও বিবরণ (সাইট প্ল্যান, ফ্লোর প্ল্যান, এলিভেশন, স্ট্রাকচারাল ইত্যাদি):
                  </label>
                  <textarea
                    rows={2}
                    disabled={!isCurrentOfficerDraftsman}
                    value={sevenCopiesDetails}
                    onChange={(e) => setSevenCopiesDetails(e.target.value)}
                    placeholder="বিধি অনুযায়ী ৭ কপি পূর্ণাঙ্গ নকশার ফর্দ (সাইট লে-আউট, ফ্লোর প্ল্যান, এলিভেশন, সেকশন ও স্ট্রাকচারাল ড্রয়িংস) যথাযথভাবে দাখিল করা হইয়াছে।"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* =========================================================
                  ২য় অংশ: ইমারত নির্মাণ আবেদন ফি জমা বিবরণ (Fixed ১,০০০/-, ভ্যাট থাকবে না)
                  ========================================================= */}
              <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-700" />
                    <span>২. ইমারত নির্মাণ আবেদন ফি জমা বিবরণ</span>
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-950 font-bold border border-blue-300">
                    ফিক্সড ৳ ১,০০০/- (ভ্যাট প্রযোজ্য নহে)
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    আবেদন দাখিল ফি জমা করেছে কি না? <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-4 pt-1 pb-1">
                    <label className={`flex items-center gap-2 font-bold text-emerald-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                      <input
                        type="radio"
                        name="appFeeRadio"
                        disabled={!isCurrentOfficerDraftsman}
                        checked={appFeeSubmitted === true}
                        onChange={() => setAppFeeSubmitted(true)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>হ্যাঁ, ১,০০০/- টাকা ফি জমা হয়েছে (পরিশোধিত)</span>
                    </label>
                    <label className={`flex items-center gap-2 font-bold text-rose-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                      <input
                        type="radio"
                        name="appFeeRadio"
                        disabled={!isCurrentOfficerDraftsman}
                        checked={appFeeSubmitted === false}
                        onChange={() => setAppFeeSubmitted(false)}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                      />
                      <span>না, ফি জমা এখনো বাকি</span>
                    </label>
                  </div>
                </div>

                {appFeeSubmitted && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-200/70">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        আবেদন ফির পরিমাণ
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 font-bold">৳</span>
                        <input
                          type="text"
                          readOnly
                          value="১,০০০/- (ফিক্সড)"
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-bold text-blue-950 bg-blue-100/50 cursor-not-allowed"
                        />
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                        * নির্ধারিত আবেদন ফি ১,০০০/- টাকা (এতে ভ্যাট থাকবে না)
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        আবেদন ফি জমার মাধ্যম <span className="text-red-600">*</span>
                      </label>
                      <select
                        disabled={!isCurrentOfficerDraftsman}
                        value={appFeePaymentMethod}
                        onChange={(e) => setAppFeePaymentMethod(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="counter_receipt">পৌর ক্যাশ কাউন্টার রসিদ</option>
                        <option value="online">অনলাইন পেমেন্ট</option>
                        <option value="bank_draft">ব্যাংক ড্রাফট / পে-অর্ডার</option>
                        <option value="chalan">ট্রেজারী চালান</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        ক্যাশ রসিদ / ট্রানজেকশন নং <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!isCurrentOfficerDraftsman}
                        value={appFeeReceiptNo}
                        onChange={(e) => setAppFeeReceiptNo(e.target.value)}
                        placeholder="উদাঃ MR-2026-9841"
                        className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================
                  ৩য় অংশ: ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ (যা নক্সাকার এডিট করবে)
                  ========================================================= */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-700" />
                    <span>৩. ইমারত নির্মাণ ফি জমা ও মোট চালান বিবরণ</span>
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-300">
                    নক্সাকার কর্তৃক নির্ধারিত ও সম্পাদিত
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    ইমারত নির্মাণ ফি ও চালান জমা করেছে কি না? <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-4 pt-1 pb-1">
                    <label className={`flex items-center gap-2 font-bold text-emerald-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                      <input
                        type="radio"
                        name="constructionFeeRadio"
                        disabled={!isCurrentOfficerDraftsman}
                        checked={constructionFeeSubmitted === true}
                        onChange={() => setConstructionFeeSubmitted(true)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>হ্যাঁ, ইমারত নির্মাণ ফি ও চালান জমা হয়েছে (পরিশোধিত)</span>
                    </label>
                    <label className={`flex items-center gap-2 font-bold text-amber-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                      <input
                        type="radio"
                        name="constructionFeeRadio"
                        disabled={!isCurrentOfficerDraftsman}
                        checked={constructionFeeSubmitted === false}
                        onChange={() => setConstructionFeeSubmitted(false)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span>না, চালান জমা এখনো বাকি</span>
                    </label>
                  </div>
                </div>

                {constructionFeeSubmitted && (
                  <div className="space-y-4 pt-2 border-t border-amber-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* ইমারত নির্মাণ ফি (টাকা) */}
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ইমারত নির্মাণ ফি (টাকা) <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500 font-bold">৳</span>
                          <input
                            type="number"
                            required
                            min="0"
                            disabled={!isCurrentOfficerDraftsman}
                            value={buildingPermitFee}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setBuildingPermitFee(val);
                              const calcVat = Math.round(val * 0.15);
                              setPermitVatAmount(calcVat);
                              setTotalPermitChalanAmount(val + calcVat);
                            }}
                            placeholder="যেমন: ৫০০০"
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          অনুমোদিত তলা ও আয়তন অনুযায়ী নক্সাকার কর্তৃক হিসাবকৃত মূল নির্মাণ ফি
                        </span>
                      </div>

                      {/* ১৫% সরকারি ভ্যাট (টাকা) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-800">
                            ১৫% সরকারি ভ্যাট (টাকা) <span className="text-red-600">*</span>
                          </label>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-bold">
                            ১৫% ভ্যাট (এডিটযোগ্য)
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500 font-bold">৳</span>
                          <input
                            type="number"
                            required
                            min="0"
                            disabled={!isCurrentOfficerDraftsman}
                            value={permitVatAmount}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setPermitVatAmount(v);
                              setTotalPermitChalanAmount(buildingPermitFee + v);
                            }}
                            placeholder="যেমন: ৭৫০"
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                        <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">
                          নির্মাণ ফির ১৫% ভ্যাট বাবদ ৳ {toBanglaNumber(Math.round(buildingPermitFee * 0.15))}/- (নক্সাকার সম্পাদনযোগ্য)
                        </span>
                      </div>
                    </div>

                    {/* সর্বমোট ট্রেজারী চালান জমার পরিমাণ */}
                    <div className="p-3 bg-gradient-to-r from-amber-100/90 to-amber-50 border border-amber-300 rounded-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-amber-950 block">
                            সর্বমোট ট্রেজারী চালান / জমার পরিমাণ (নির্মাণ ফি + ১৫% ভ্যাট):
                          </span>
                          <span className="text-[11px] text-slate-700">
                            নির্মাণ ফি ৳ {toBanglaNumber(buildingPermitFee)}/- + ১৫% ভ্যাট ৳ {toBanglaNumber(permitVatAmount)}/- = সর্বমোট চালান
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-700 font-bold">মোট চালান (৳):</span>
                          <input
                            type="number"
                            required
                            min="0"
                            disabled={!isCurrentOfficerDraftsman}
                            value={totalPermitChalanAmount}
                            onChange={(e) => setTotalPermitChalanAmount(Number(e.target.value) || 0)}
                            className="w-32 px-3 py-1.5 rounded-lg border-2 border-amber-500 font-mono font-black text-amber-950 bg-white text-sm text-right disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* মূল ট্রেজারী চালান তথ্যাদি */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ফি জমা প্রদানের মাধ্যম <span className="text-red-600">*</span>
                        </label>
                        <select
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryPaymentInstrument}
                          onChange={(e) => setTreasuryPaymentInstrument(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <option value="chalan">ট্রেজারী চালান (Treasury Challan)</option>
                          <option value="bank_draft">ব্যাংক ড্রাফট (Bank Draft)</option>
                          <option value="pay_order">পে-অর্ডার (Pay Order)</option>
                          <option value="online">সোনালী ই-সেবা চালান</option>
                          <option value="counter_receipt">পৌর ক্যাশ রসিদ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ট্রেজারী চালান / ড্রাফট নম্বর <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryInstrumentNo}
                          onChange={(e) => setTreasuryInstrumentNo(e.target.value)}
                          placeholder="উদাঃ CH-2026-98421 / BD-00234"
                          className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          চালান জমার তারিখ <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryDepositDate}
                          onChange={(e) => setTreasuryDepositDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ব্যাংকের নাম
                        </label>
                        <input
                          type="text"
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryBankName}
                          onChange={(e) => setTreasuryBankName(e.target.value)}
                          placeholder="সোনালী ব্যাংক পিএলসি"
                          className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          শাখার নাম
                        </label>
                        <input
                          type="text"
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryBranchName}
                          onChange={(e) => setTreasuryBranchName(e.target.value)}
                          placeholder="সীতাকুণ্ড শাখা, চট্টগ্রাম"
                          className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          সরকারি ট্রেজারী হিসাব কোড <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!isCurrentOfficerDraftsman}
                          value={treasuryGovtCode}
                          onChange={(e) => setTreasuryGovtCode(e.target.value)}
                          placeholder="১-২০৩১-০০০০-২৬৮১"
                          className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* ভ্যাটের চালান আলাদাভাবে যুক্ত করার অপশন */}
                    <div className="mt-4 p-3.5 bg-white rounded-xl border border-amber-300/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`flex items-center gap-2 font-bold text-amber-950 ${isCurrentOfficerDraftsman ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                          <input
                            type="checkbox"
                            disabled={!isCurrentOfficerDraftsman}
                            checked={hasSeparateVatChalan}
                            onChange={(e) => setHasSeparateVatChalan(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span>১৫% ভ্যাটের চালান কি আলাদাভাবে দাখিল করা হয়েছে?</span>
                        </label>
                        <span className="text-[10px] text-slate-500 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                          ভ্যাট চালান পৃথক অপশন
                        </span>
                      </div>

                      {hasSeparateVatChalan ? (
                        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block font-bold text-slate-800 mb-1">
                              পৃথক ভ্যাট চালান নম্বর / মূসক দাখিলপত্র নং <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              disabled={!isCurrentOfficerDraftsman}
                              value={vatChalanNo}
                              onChange={(e) => setVatChalanNo(e.target.value)}
                              placeholder="উদাঃ VAT-2026-4421 / মূসক-৬.৩"
                              className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-800 mb-1">
                              ভ্যাট চালান জমার তারিখ <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              disabled={!isCurrentOfficerDraftsman}
                              value={vatChalanDate}
                              onChange={(e) => setVatChalanDate(e.target.value)}
                              className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-800 mb-1">
                              ভ্যাট জমার ব্যাংক ও শাখা
                            </label>
                            <input
                              type="text"
                              disabled={!isCurrentOfficerDraftsman}
                              value={`${vatBankName}, ${vatBranchName}`}
                              onChange={(e) => {
                                const parts = e.target.value.split(',');
                                setVatBankName(parts[0]?.trim() || 'সোনালী ব্যাংক পিএলসি');
                                setVatBranchName(parts[1]?.trim() || 'সীতাকুণ্ড শাখা');
                              }}
                              placeholder="সোনালী ব্যাংক পিএলসি, সীতাকুণ্ড শাখা"
                              className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-800 mb-1">
                              ভ্যাট সরকারি ট্রেজারী কোড
                            </label>
                            <input
                              type="text"
                              disabled={!isCurrentOfficerDraftsman}
                              value={vatEconomicCode}
                              onChange={(e) => setVatEconomicCode(e.target.value)}
                              placeholder="১-১১৩৩-০০১০-০৩১১"
                              className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-600 italic pl-6">
                          * ভ্যাট ও মূল ইমারত নির্মাণ ফি একই সমন্বিত ট্রেজারী চালানে অন্তর্ভুক্ত থাকলে আলাদা ভ্যাট চালানের প্রয়োজন নেই। আলাদা চালানে ভ্যাট জমা দিলে টিক দিয়ে বিস্তারিত পূরণ করুন।
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* নক্সাকারের মূল্যায়ন ও সার্বিক স্ট্যাটাস আপডেট */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    নক্সাকারের সার্বিক মূল্যায়ন ও মন্তব্য
                  </label>
                  <textarea
                    rows={2}
                    disabled={!isCurrentOfficerDraftsman}
                    value={treasuryRemarks}
                    onChange={(e) => setTreasuryRemarks(e.target.value)}
                    placeholder="৭ কপি নকশার ফর্দ, ফিক্সড ১,০০০/- টাকা আবেদন ফি এবং ইমারত নির্মাণ ফি ও ১৫% সরকারি ভ্যাট ট্রেজারী চালান যাচাইপূর্বক সঠিক পাওয়া গেল।"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    আবেদনের বর্তমান অবস্থা / স্ট্যাটাস পরিবর্তন করুন:
                  </label>
                  <select
                    disabled={!isCurrentOfficerDraftsman}
                    value={buildingAppStatusUpdate}
                    onChange={(e) => setBuildingAppStatusUpdate(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="approved">✓ অনুমোদিত (Approved) - নকশা ও ফি সঠিক</option>
                    <option value="under_review">⏳ রিভিউাধীন (Under Review) - যাচাই চলমান</option>
                    <option value="submitted">অপেক্ষমান (Submitted/Pending)</option>
                    <option value="rejected">বাতিল (Rejected) - শর্ত অপূর্ণ</option>
                  </select>
                </div>
              </div>

              {/* Verified By Footnote */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span>
                  এন্ট্রি প্রদানকারী কর্মকর্তা: <strong>{currentOfficer?.name || currentOfficer?.title}</strong> (আইডি: <span className="font-mono">{currentOfficer?.username}</span>)
                </span>
                <span className="font-bold text-slate-900">
                  আবেদন ফি: ৳ ১,০০০/- (ফিক্সড) • নির্মাণ ফি: ৳ {toBanglaNumber(buildingPermitFee)}/- • ভ্যাট (১৫%): ৳ {toBanglaNumber(permitVatAmount)}/- • সর্বমোট চালান: ৳ {toBanglaNumber(constructionFeeSubmitted ? totalPermitChalanAmount : 0)}/-
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                {!isCurrentOfficerDraftsman ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-rose-700 font-bold bg-rose-50 border border-rose-300 px-3 py-2 rounded-lg">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>নক্সাকার ব্যতীত অন্য কোনো আইডি দিয়ে ডাটা পরিবর্তন বা অনুমোদন সংরক্ষণ করা যাবে না</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTreasuryModalApp(null)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setTreasuryModalApp(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>নক্সাকার ডাটা সংরক্ষণ ও আপডেট নিশ্চিত করুন</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSV Export & Filtering Modal for all 3 modules */}
      {csvExportModalModule && (
        <CustomCsvExportModal
          moduleType={csvExportModalModule}
          allApplications={
            csvExportModalModule === 'demarcation'
              ? applications
              : csvExportModalModule === 'schedule1'
              ? buildingApplications
              : roadCuttingApplications
          }
          currentFilteredApplications={
            csvExportModalModule === 'demarcation'
              ? filteredApps
              : csvExportModalModule === 'schedule1'
              ? filteredBuildingApps
              : filteredRoadCuttingApps
          }
          selectedAppIds={
            csvExportModalModule === 'demarcation'
              ? selectedAppIds
              : csvExportModalModule === 'schedule1'
              ? selectedBuildingAppIds
              : selectedRoadCuttingAppIds
          }
          onClose={() => setCsvExportModalModule(null)}
          onSuccess={(msg) => {
            saveQuickNoteToTimeline(`[CSV Export] ${msg}`, false);
          }}
        />
      )}
    </div>
  );
};
