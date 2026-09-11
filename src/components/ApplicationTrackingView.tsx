import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Copy,
  Calendar,
  Building,
  Check,
  QrCode,
  ScanLine,
  Smartphone,
  Mail,
  History,
  Trash2,
  X,
  Award,
  ClipboardCheck,
  Navigation,
  Building2,
  AlertTriangle,
  Compass,
  Construction,
  Loader2
} from 'lucide-react';
import { DemarcationApplication, RoadCuttingApplication, BuildingConstructionApplication } from '../types';
import { 
  getStoredApplications,
  getBuildingApplications,
  getRoadCuttingApplications, 
  toBanglaNumber, 
  formatBanglaDate,
  getRecentTrackingSearches,
  saveRecentTrackingSearch,
  clearRecentTrackingSearches,
  removeRecentTrackingSearch,
  saveApplication,
  RecentSearchItem
} from '../utils/storage';
import { searchApplicationApi, fetchApplicationsFromApi } from '../utils/apiStorage';
import { ApplicationQRCodeCard } from './ApplicationQRCodeCard';
import { DocumentAttachmentsViewer } from './DocumentAttachmentsViewer';
import { QRCodeScannerModal } from './QRCodeScannerModal';
import { RoadCuttingApplicationPrintA4 } from './RoadCuttingApplicationPrintA4';
import { BuildingApprovalPermitPrintA4 } from './BuildingApprovalPermitPrintA4';
import { Schedule1ApplicationPrintA4 } from './Schedule1ApplicationPrintA4';

const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/[০-৯]/g, (d) => {
    const idx = banglaDigits.indexOf(d);
    return idx >= 0 ? idx.toString() : d;
  });
};

const matchApp = (app: any, query: string, queryEn: string, digitsOnly: string): boolean => {
  if (!app) return false;
  const id = (app.id || '').toLowerCase();
  const trackingId = (app.trackingId || '').toLowerCase();
  const formNo = (app.formNo || '').toLowerCase();
  const certNo = (app.certificateNo || app.engineerApproval?.certificateNo || '').toLowerCase();

  const qLower = query.toLowerCase();
  const qEnLower = queryEn.toLowerCase();

  // 1. Direct equality matches
  if (id === qLower || id === qEnLower) return true;
  if (trackingId && (trackingId === qLower || trackingId === qEnLower)) return true;
  if (formNo && (formNo === qLower || formNo === qEnLower)) return true;
  if (certNo && (certNo === qLower || certNo === qEnLower)) return true;

  // 2. Substring matches on ID / Tracking ID / Form No
  if (qEnLower.length >= 4) {
    if (id.includes(qEnLower)) return true;
    if (trackingId && trackingId.includes(qEnLower)) return true;
    if (formNo && formNo.includes(qEnLower)) return true;
    if (certNo && certNo.includes(qEnLower)) return true;
  }

  // 3. Mobile phone matches
  const mobiles: string[] = [
    app.siteLocation?.applicantMobile,
    app.applicantMobile,
    app.applicantPhone,
    app.mobile,
  ].filter(Boolean).map(m => toEnglishDigits(m).replace(/[^0-9]/g, ''));

  if (digitsOnly && digitsOnly.length >= 6) {
    for (const mob of mobiles) {
      if (mob.includes(digitsOnly) || digitsOnly.includes(mob)) return true;
      const mobNorm = mob.replace(/^880|^0/, '');
      const queryNorm = digitsOnly.replace(/^880|^0/, '');
      if (mobNorm && queryNorm && (mobNorm.includes(queryNorm) || queryNorm.includes(mobNorm))) {
        return true;
      }
    }
  }

  // 4. NID matches
  const nids: string[] = [
    app.siteLocation?.applicantNid,
    app.applicantNid,
  ].filter(Boolean).map(n => toEnglishDigits(n).replace(/[^0-9]/g, ''));

  if (digitsOnly && digitsOnly.length >= 8) {
    for (const nid of nids) {
      if (nid.includes(digitsOnly) || digitsOnly.includes(nid)) return true;
    }
  }

  return false;
};

interface ApplicationTrackingViewProps {
  initialTrackingId?: string;
  onViewPrintA4: (app: DemarcationApplication) => void;
  onViewCertificate: (app: DemarcationApplication) => void;
  onApplySchedule1?: (app: DemarcationApplication) => void;
}

export const ApplicationTrackingView: React.FC<ApplicationTrackingViewProps> = ({
  initialTrackingId = '',
  onViewPrintA4,
  onViewCertificate,
  onApplySchedule1,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialTrackingId);
  const [searchedApp, setSearchedApp] = useState<DemarcationApplication | null>(null);
  const [searchedBuildingApp, setSearchedBuildingApp] = useState<BuildingConstructionApplication | null>(null);
  const [searchedRoadCuttingApp, setSearchedRoadCuttingApp] = useState<RoadCuttingApplication | null>(null);
  const [printRoadCuttingModal, setPrintRoadCuttingModal] = useState<RoadCuttingApplication | null>(null);
  const [printBuildingPermitModal, setPrintBuildingPermitModal] = useState<BuildingConstructionApplication | null>(null);
  const [printBuildingFormModal, setPrintBuildingFormModal] = useState<BuildingConstructionApplication | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearchingServer, setIsSearchingServer] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => getRecentTrackingSearches());

  // Background sync applications from server so any device can track immediately
  useEffect(() => {
    const syncRemote = async () => {
      try {
        const [dApps, bApps, rcApps] = await Promise.all([
          fetchApplicationsFromApi<DemarcationApplication>('demarcation'),
          fetchApplicationsFromApi<BuildingConstructionApplication>('building'),
          fetchApplicationsFromApi<RoadCuttingApplication>('road_cutting'),
        ]);

        if (dApps && Array.isArray(dApps) && dApps.length > 0) {
          const current = getStoredApplications();
          const map = new Map<string, DemarcationApplication>();
          current.forEach(a => map.set(a.id, a));
          dApps.forEach(a => map.set(a.id, a));
          try {
            localStorage.setItem('sitakunda_demarcation_applications_clean_v1', JSON.stringify(Array.from(map.values())));
          } catch {}
        }
        if (bApps && Array.isArray(bApps) && bApps.length > 0) {
          const currentB = getBuildingApplications();
          const mapB = new Map<string, BuildingConstructionApplication>();
          currentB.forEach(a => mapB.set(a.id, a));
          bApps.forEach(a => mapB.set(a.id, a));
          try {
            localStorage.setItem('sitakunda_building_applications_clean_v1', JSON.stringify(Array.from(mapB.values())));
          } catch {}
        }
        if (rcApps && Array.isArray(rcApps) && rcApps.length > 0) {
          const currentRC = getRoadCuttingApplications();
          const mapRC = new Map<string, RoadCuttingApplication>();
          currentRC.forEach(a => mapRC.set(a.id, a));
          rcApps.forEach(a => mapRC.set(a.id, a));
          try {
            localStorage.setItem('sitakunda_road_cutting_applications_clean_v1', JSON.stringify(Array.from(mapRC.values())));
          } catch {}
        }
      } catch (err) {
        console.warn('[Tracking View] Remote sync error:', err);
      }
    };

    syncRemote();
  }, []);

  // Auto search if initialTrackingId provided
  useEffect(() => {
    if (initialTrackingId) {
      setSearchQuery(initialTrackingId);
      performSearch(initialTrackingId);
    }
  }, [initialTrackingId]);

  const performSearch = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setHasSearched(true);
    const cleanQueryEn = toEnglishDigits(cleanQuery);
    const digitsOnly = cleanQueryEn.replace(/[^0-9]/g, '');

    // 1. First check local storage for instant response
    const allApps = getStoredApplications();
    let found = allApps.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));

    const bApps = getBuildingApplications();
    let foundB = bApps.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));

    const rcApps = getRoadCuttingApplications();
    let foundRC = rcApps.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));

    setSearchedApp(found || null);
    setSearchedBuildingApp(foundB || null);
    setSearchedRoadCuttingApp(foundRC || null);

    // 2. Query Hostinger MySQL database for real-time remote updates
    setIsSearchingServer(true);
    try {
      // Query server with both cleanQuery and cleanQueryEn
      let serverApp: any = await searchApplicationApi(cleanQueryEn);
      if (!serverApp && cleanQuery !== cleanQueryEn) {
        serverApp = await searchApplicationApi(cleanQuery);
      }

      if (serverApp && (serverApp.id || serverApp.trackingId)) {
        if (serverApp.moduleType === 'building' || serverApp.buildingInfo || serverApp.structureType) {
          foundB = serverApp;
          setSearchedBuildingApp(serverApp);
        } else if (serverApp.moduleType === 'road_cutting' || serverApp.roadInfo) {
          foundRC = serverApp;
          setSearchedRoadCuttingApp(serverApp);
        } else {
          found = serverApp;
          setSearchedApp(serverApp);
          saveApplication(serverApp);
        }
      } else if (!found && !foundB && !foundRC) {
        // Fallback: If not found yet, fetch remote modules to search comprehensive list
        const [remoteD, remoteB, remoteRC] = await Promise.all([
          fetchApplicationsFromApi<DemarcationApplication>('demarcation'),
          fetchApplicationsFromApi<BuildingConstructionApplication>('building'),
          fetchApplicationsFromApi<RoadCuttingApplication>('road_cutting'),
        ]);

        if (remoteD && Array.isArray(remoteD)) {
          const matchD = remoteD.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));
          if (matchD) {
            found = matchD;
            setSearchedApp(matchD);
            saveApplication(matchD);
          }
        }

        if (remoteB && Array.isArray(remoteB)) {
          const matchB = remoteB.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));
          if (matchB) {
            foundB = matchB;
            setSearchedBuildingApp(matchB);
          }
        }

        if (remoteRC && Array.isArray(remoteRC)) {
          const matchRC = remoteRC.find((app) => matchApp(app, cleanQuery, cleanQueryEn, digitsOnly));
          if (matchRC) {
            foundRC = matchRC;
            setSearchedRoadCuttingApp(matchRC);
          }
        }
      }
    } catch (err) {
      console.warn('[Tracking Search] Error querying server DB:', err);
    } finally {
      setIsSearchingServer(false);
    }

    // Save to recent tracking searches (keep last 3-5)
    const displayName = found 
      ? (found.siteLocation?.applicantName || (found as any).applicantName)
      : foundB 
      ? foundB.applicantName 
      : foundRC 
      ? foundRC.applicantName 
      : undefined;

    const displayStatus = found 
      ? found.status 
      : foundB 
      ? foundB.status 
      : foundRC 
      ? foundRC.status 
      : undefined;

    const updated = saveRecentTrackingSearch(
      cleanQuery,
      displayName,
      displayStatus
    );
    setRecentSearches(updated);
  };


  const handleSelectRecentSearch = (itemQuery: string) => {
    setSearchQuery(itemQuery);
    performSearch(itemQuery);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, itemQuery: string) => {
    e.stopPropagation();
    const updated = removeRecentTrackingSearch(itemQuery);
    setRecentSearches(updated);
  };

  const handleClearAllRecentSearches = () => {
    clearRecentTrackingSearches();
    setRecentSearches([]);
  };

  const handleQrScanSuccess = (scannedTrackingId: string) => {
    setSearchQuery(scannedTrackingId);
    performSearch(scannedTrackingId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমান (Pending)</span>
          </span>
        );
      case 'investigating':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            <span>সরজমিনে তদন্তাধীন (Investigating)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>অনুমোদিত ও প্রত্যয়িত (Approved)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>অননুমোদিত / বাতিল (Rejected)</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Pipeline steps (4 distinct official steps with dedicated state icons)
  const steps = [
    { 
      title: 'আবেদন দাখিল', 
      subtitle: 'অনলাইন আবেদন ও নথি গ্রহণ',
      status: 'completed',
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: 'প্রারম্ভিক নথিপত্র যাচাই',
      subtitle: 'খতিয়ান ও দলিল নিরীক্ষা',
      status: searchedApp ? 'completed' : 'pending',
      icon: <ClipboardCheck className="w-4 h-4" />
    },
    {
      title: 'নক্সাকার সরজমিন পরিদর্শন',
      subtitle: 'মাঠপর্যায়ে সীমানা পরিমাপ',
      status:
        searchedApp?.status === 'investigating' || searchedApp?.status === 'approved'
          ? 'completed'
          : searchedApp?.status === 'pending'
          ? 'current'
          : 'pending',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      title: 'চূড়ান্ত ডিমার্কেশন প্রত্যয়নপত্র',
      subtitle: 'নির্বাহী প্রকৌশলী/প্রশাসক/মেয়র অনুমোদন',
      status: searchedApp?.status === 'approved' ? 'completed' : 'pending',
      icon: <Award className="w-4 h-4" />
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-[#043328] via-[#064e3b] to-[#0f172a] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3.5 mb-3.5 relative z-10">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-emerald-300 shadow-md">
            <Search className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              ভূমির ডিমার্কেশন ও সঠিকতা যাচাই ট্র্যাকিং পোর্টাল
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-0.5 font-normal">
              আবেদনের ট্র্যাকিং আইডি অথবা আবেদনকারীর মোবাইল নম্বর দিয়ে বর্তমান অবস্থা যাচাই করুন
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ট্র্যাকিং আইডি (যেমন: SKM-DEM-2026-0841) বা মোবাইল নং..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-emerald-700 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-medium text-sm sm:text-base"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="px-4 py-3 bg-emerald-800/90 hover:bg-emerald-700 active:bg-emerald-950 text-emerald-100 hover:text-white font-bold rounded-lg border border-emerald-500/50 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-sm sm:text-base group"
            title="রশিদের কিউআর কোড স্ক্যান করুন"
          >
            <QrCode className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            <span>কিউআর স্ক্যান</span>
          </button>

          <button
            type="submit"
            disabled={isSearchingServer}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-70 text-slate-950 font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-sm sm:text-base"
          >
            {isSearchingServer ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>স্ট্যাটাস দেখুন</span>
              </>
            )}
          </button>
        </form>

        {/* Recent Searches (Last 3-5 Search IDs) */}
        {recentSearches.length > 0 && (
          <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold shrink-0">
              <History className="w-3.5 h-3.5" />
              <span>সাম্প্রতিক অনুসন্ধান:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {recentSearches.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectRecentSearch(item.query)}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-700/60 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs"
                  title={`অনুসন্ধান করুন: ${item.query}`}
                >
                  <span className="font-mono font-bold text-[11px]">{item.query}</span>
                  {item.applicantName && (
                    <span className="text-[10px] text-emerald-300/90 font-normal truncate max-w-[90px]">
                      ({item.applicantName})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, item.query)}
                    className="p-0.5 text-emerald-400 hover:text-red-300 rounded hover:bg-emerald-900/50 cursor-pointer transition-colors"
                    title="তালিকা থেকে বাদ দিন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleClearAllRecentSearches}
                className="text-[11px] text-emerald-300/80 hover:text-emerald-100 hover:underline px-1 py-0.5 transition-colors cursor-pointer"
                title="সকল সাম্প্রতিক অনুসন্ধান মুছুন"
              >
                সব মুছুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scanner Modal */}
      <QRCodeScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Search Result Display (Not found) */}
      {hasSearched && !searchedApp && !searchedBuildingApp && !searchedRoadCuttingApp && (
        <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">কোনো আবেদন পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            আপনার প্রদত্ত ট্র্যাকিং আইডি বা মোবাইল নম্বরের বিপরীতে কোনো আবেদন (ডিমার্কেশন, ইমারত নির্মাণ বা রাস্তা কর্তন) খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Building Construction Application Tracking Card */}
      {searchedBuildingApp && (
        <div className="space-y-6 animate-fade-in-up mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-300 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-emerald-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>ইমারত নির্মাণ / তফসিল-১ অনুমোদন আবেদন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {searchedBuildingApp.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(searchedBuildingApp.id)}
                    title="কপি করুন"
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  দাখিলের তারিখ: {formatBanglaDate(searchedBuildingApp.createdAt)} • ফরম নং: {searchedBuildingApp.formNo}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div>{getStatusBadge(searchedBuildingApp.status)}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPrintBuildingFormModal(searchedBuildingApp)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>তফসিল-১ ফরম প্রিন্ট (A4)</span>
                  </button>

                  {searchedBuildingApp.status === 'approved' && (
                    <button
                      onClick={() => setPrintBuildingPermitModal(searchedBuildingApp)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-md shadow-md transition-colors cursor-pointer"
                      title="ইমারত নির্মাণের নকশার Lay-out Plan অনুমোদনের সরকারি অনুমতিপত্র দেখুন ও ডাউনলোড করুন"
                    >
                      <Award className="w-4 h-4 text-emerald-300" />
                      <span>অনুমোদনের অনুমতিপত্র (Permit Letter)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">আবেদনকারীর নাম ও পিতা:</span>
                <strong className="text-slate-900 block text-sm">{searchedBuildingApp.applicantName}</strong>
                <span className="text-slate-600">পিতা/স্বামী: {searchedBuildingApp.applicantFatherHusband}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">কাজের ধরন ও তলার সংখ্যা:</span>
                <strong className="text-slate-900 block text-sm">{searchedBuildingApp.activityTypeTitle}</strong>
                <span className="text-slate-600">{searchedBuildingApp.constructionDetails?.floorsCount || '৩ তলা'} ({searchedBuildingApp.constructionDetails?.useTypeTitle || 'আবাসিক'})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">সাইট ও ওয়ার্ড:</span>
                <strong className="text-slate-900 block text-sm">{searchedBuildingApp.siteDetails?.mouzaName}, {searchedBuildingApp.siteDetails?.wardNo}</strong>
                <span className="text-slate-600">হোল্ডিং: {searchedBuildingApp.siteDetails?.holdingNo}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Road Cutting Application Tracking Card */}
      {searchedRoadCuttingApp && (
        <div className="space-y-6 animate-fade-in-up mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-amber-300 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-amber-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <Construction className="w-4 h-4 text-amber-700" />
                  <span>রাস্তা কর্তন অনুমোদন আবেদন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {searchedRoadCuttingApp.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(searchedRoadCuttingApp.id)}
                    title="কপি করুন"
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  দাখিলের তারিখ: {formatBanglaDate(searchedRoadCuttingApp.createdAt)} • ফরম নং: {searchedRoadCuttingApp.formNo}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div>{getStatusBadge(searchedRoadCuttingApp.status)}</div>
                <button
                  onClick={() => setPrintRoadCuttingModal(searchedRoadCuttingApp)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>আবেদনপত্র প্রিন্ট / PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">আবেদনকারী:</span>
                <strong className="text-slate-900 block text-sm">{searchedRoadCuttingApp.applicantName}</strong>
                <span className="text-slate-600">ফোন: {searchedRoadCuttingApp.applicantPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">কর্তনের উদ্দেশ্য ও সড়ক:</span>
                <strong className="text-slate-900 block text-sm">{searchedRoadCuttingApp.purposeTitle}</strong>
                <span className="text-slate-600">{searchedRoadCuttingApp.roadName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">পরিমাপ ও ফি:</span>
                <strong className="text-slate-900 block text-sm">{toBanglaNumber(searchedRoadCuttingApp.totalAreaSqFt)} বর্গফুট</strong>
                <span className="text-emerald-700 font-bold">ফি: ৳ {toBanglaNumber(searchedRoadCuttingApp.applicationFee || 300)}/-</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchedApp && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Main Status Banner Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-0.5">আবেদন ট্র্যাকিং আইডি</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {searchedApp.id}
                  </span>
                  <button
                    onClick={() => handleCopyId(searchedApp.id)}
                    title="কপি করুন"
                    className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  দাখিলের তারিখ: {formatBanglaDate(searchedApp.createdAt)}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div>{getStatusBadge(searchedApp.status)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewPrintA4(searchedApp)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-700" />
                    <span>আবেদনপত্র প্রিন্ট (A4)</span>
                  </button>

                  {searchedApp.status === 'approved' && (
                    <>
                      <button
                        onClick={() => onViewCertificate(searchedApp)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ডিমার্কেশন প্রত্যয়নপত্র</span>
                      </button>

                      {onApplySchedule1 && (
                        <button
                          onClick={() => onApplySchedule1(searchedApp)}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                          title="ইমারত নির্মাণ অনুমোদন আবেদন করুন"
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>ইমারত অনুমোদন (তফসিল-১)</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Alert Callout if status is rejected */}
            {searchedApp.status === 'rejected' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-red-900">
                    আবেদন অননুমোদিত / বাতিল হওয়ার সুনির্দিষ্ট কারণ:
                  </div>
                  <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
                    {searchedApp.draftsmanReview?.remarks ||
                      searchedApp.adminRemarks ||
                      searchedApp.engineerApproval?.finalRemarks ||
                      'নথিপত্র বা সরজমিন সীমানা যাচাইয়ে অসংগতি থাকায় আবেদনটি বাতিল করা হয়েছে। বিস্তারিত তথ্যের জন্য সীতাকুণ্ড পৌরসভা কার্যালয়ে যোগাযোগ করুন।'}
                  </p>
                </div>
              </div>
            )}

            {/* Tracking Progress Steps with visual state icons */}
            <div className="pt-6">
              <div className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>অগ্রগতির মাইলস্টোন ধাপসমূহ:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                        : step.status === 'current'
                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold transition-all">
                      {step.status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          {step.icon}
                        </div>
                      ) : step.status === 'current' ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs animate-pulse">
                          {step.icon}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold leading-tight">{step.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{step.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated QR Code Verification for Application */}
          <ApplicationQRCodeCard
            applicationId={searchedApp.id}
            applicantName={searchedApp.siteLocation.applicantName}
          />

          {/* =========================================================================
              ১. আবেদনকারীর তথ্য (Updated Section Title from "ভূমির মূল বিবরণ (তফসিল)")
              (Notice: Permanent address is strictly rendered right below father/husband name)
              ========================================================================= */}
          <div className="hidden bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-700" />
              <span>আবেদনকারীর তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">আবেদনকারীর নাম</span>
                <span className="font-semibold text-slate-900">{searchedApp.siteLocation.applicantName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">পিতা/স্বামীর নাম</span>
                <span className="font-semibold text-slate-900">{searchedApp.siteLocation.applicantFatherHusband}</span>
              </div>

              {/* স্থায়ী ঠিকানা is placed right below পিতা/স্বামীর নাম */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                <span className="text-xs text-slate-500 block">স্থায়ী ঠিকানা</span>
                <span className="font-semibold text-slate-900">
                  {searchedApp.siteLocation.applicantPermanentAddress}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">মোবাইল নম্বর</span>
                <span className="font-semibold text-slate-900">{searchedApp.siteLocation.applicantMobile}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">জাতীয় পরিচয়পত্র (NID)</span>
                <span className="font-semibold font-mono text-slate-900">{searchedApp.siteLocation.applicantNid}</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ২. ভূমির মালিকের তথ্য (একাধিক মালিক তালিকা)
              ========================================================================= */}
          <div className="hidden bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6" aria-hidden="true">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                <span>ভূমির মালিকের তথ্য (সকল মালিকের তালিকা)</span>
              </h3>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-300">
                মোট মালিক: {toBanglaNumber(searchedApp.landOwners.length)} জন
              </span>
            </div>

            <div className="space-y-4">
              {searchedApp.landOwners.map((owner, idx) => (
                <div
                  key={owner.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-sm text-emerald-950">
                      মালিক-{toBanglaNumber(idx + 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {owner.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">পিতা/স্বামীর নাম:</span>
                      <span className="font-semibold text-slate-800">{owner.fatherOrHusbandName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">এনআইডি ও ইমেইল:</span>
                      <span className="font-semibold font-mono text-slate-800">
                        {owner.nid ? `NID: ${toBanglaNumber(owner.nid)}` : 'তথ্য নেই'}
                      </span>
                      {owner.email && <span className="block text-[11px] text-slate-500">{owner.email}</span>}
                    </div>
                    <div>
                      <span className="text-slate-500 block">স্থায়ী ঠিকানা:</span>
                      <span className="font-semibold text-slate-800">{owner.permanentAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">বর্তমান ঠিকানা:</span>
                      <span className="font-semibold text-slate-800">{owner.presentAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              পৌর কর্তৃপক্ষের মূল্যায়ন/প্রত্যয়ন :
              ========================================================================= */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Compass className="w-4 h-4" />
                </span>
                <span>পৌর কর্তৃপক্ষের মূল্যায়ন/প্রত্যয়ন :</span>
              </h3>

              <div>
                {searchedApp.status === 'rejected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>অননুমোদিত / বাতিল (Rejected)</span>
                  </span>
                ) : searchedApp.draftsmanReview?.boundaryClearance === 'disputed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>সীমানা নিয়ে আপত্তি / বিরোধপূর্ণ (Disputed)</span>
                  </span>
                ) : searchedApp.status === 'approved' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>অনুমোদিত ও প্রত্যয়িত (Approved)</span>
                  </span>
                ) : searchedApp.status === 'investigating' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>সরজমিন তদন্তাধীন (Investigating)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>পর্যালোচনায় অপেক্ষমান</span>
                  </span>
                )}
              </div>
            </div>

            {/* Rejection Specific Notice Box */}
            {searchedApp.status === 'rejected' && (
              <div className="p-4 bg-red-50/90 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-950 font-bold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>আবেদন বাতিলের কারণ ও পৌর কর্তৃপক্ষের মূল্যায়ন মন্তব্য:</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-red-200 text-xs sm:text-sm text-red-900 font-medium leading-relaxed">
                  {searchedApp.draftsmanReview?.remarks ||
                    searchedApp.adminRemarks ||
                    searchedApp.engineerApproval?.finalRemarks ||
                    'নথিপত্র বা সরজমিন সীমানা যাচাইয়ে অসংগতি থাকায় আবেদনটি বাতিল করা হয়েছে।'}
                </div>
                <p className="text-[11px] text-red-700 leading-normal">
                  * প্রয়োজনীয় তথ্যাদি বা নথিপত্রের ত্রুটি সংশোধনপূর্বক পুনরায় আবেদন করতে অথবা বিস্তারিত জানতে সীতাকুণ্ড পৌরসভা কার্যালয়ের প্রকৌশল শাখায় যোগাযোগ করতে অনুরোধ করা যাচ্ছে।
                </p>
              </div>
            )}

            {/* General Assessment Remarks / Observation Box */}
            {searchedApp.status !== 'rejected' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>পৌর কর্তৃপক্ষের সরজমিন প্রতিবেদন ও মূল্যায়ন মন্তব্য:</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {searchedApp.draftsmanReview?.remarks ||
                    searchedApp.adminRemarks ||
                    (searchedApp.status === 'pending'
                      ? 'আবেদনটি পৌর কর্তৃপক্ষ কর্তৃক প্রারম্ভিক নথিপত্র নিরীক্ষা ও সরজমিন পরিদর্শনের অপেক্ষায় রয়েছে।'
                      : 'সরজমিন পরিদর্শন ও সীমানা পরিমাপ প্রতিবেদন প্রক্রিয়াধীন রয়েছে।')}
                </div>
              </div>
            )}

            {/* Assessment Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-0.5">মূল্যায়নকারী কর্তৃপক্ষ / পদবী</span>
                <span className="font-bold text-slate-900">
                  {searchedApp.draftsmanReview?.designation || 'দায়িত্বপ্রাপ্ত পৌর কর্মকর্তা, সীতাকুণ্ড পৌরসভা'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-0.5">মূল্যায়ন / পর্যালোচনার তারিখ</span>
                <span className="font-bold text-slate-900">
                  {searchedApp.draftsmanReview?.reviewDate
                    ? formatBanglaDate(searchedApp.draftsmanReview.reviewDate)
                    : searchedApp.status === 'pending'
                    ? 'প্রক্রিয়াধীন'
                    : formatBanglaDate(searchedApp.createdAt)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 block mb-0.5">সরজমিন পরিদর্শন অবস্থা</span>
                <span className="font-bold text-slate-900">
                  {searchedApp.draftsmanReview?.isSiteInspected
                    ? `পরিদর্শন সম্পন্ন (${formatBanglaDate(searchedApp.draftsmanReview.inspectionDate || searchedApp.draftsmanReview.reviewDate)})`
                    : searchedApp.status === 'pending'
                    ? 'পরিদর্শন অনুষ্ঠিত হয়নি'
                    : 'পরিদর্শন প্রক্রিয়াধীন'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2 md:col-span-1">
                <span className="text-slate-500 block mb-0.5">সীমানা সংক্রান্ত ছাড়পত্র</span>
                <span
                  className={`font-bold ${
                    searchedApp.draftsmanReview?.boundaryClearance === 'disputed'
                      ? 'text-red-700'
                      : searchedApp.draftsmanReview?.boundaryClearance === 'clear' || searchedApp.status === 'approved'
                      ? 'text-emerald-700'
                      : 'text-slate-900'
                  }`}
                >
                  {searchedApp.draftsmanReview?.boundaryClearance === 'disputed'
                    ? 'আপত্তি / বিরোধযুক্ত (Disputed)'
                    : searchedApp.draftsmanReview?.boundaryClearance === 'clear' || searchedApp.status === 'approved'
                    ? 'বিরোধমুক্ত ও সঠিক (Clear)'
                    : searchedApp.draftsmanReview?.boundaryClearance === 'under_survey'
                    ? 'জরিপাধীন (Under Survey)'
                    : 'যাচাই-বাছাই প্রক্রিয়াধীন'}
                </span>
              </div>

              {/* Demarcation PDF attachment if present */}
              {searchedApp.draftsmanReview?.demarcationPdf && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-800 font-bold block">সংযুক্ত ডিমার্কেশন নকশা / ফিল্ড স্কেচ:</span>
                    <span className="text-[11px] text-emerald-700 truncate max-w-xs block">
                      {searchedApp.draftsmanReview.demarcationPdf.fileName || 'Demarcation_Sketch.pdf'}
                    </span>
                  </div>
                  <a
                    href={searchedApp.draftsmanReview.demarcationPdf.dataUrl}
                    download={searchedApp.draftsmanReview.demarcationPdf.fileName || 'Demarcation_Sketch.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                  >
                    নকশা ফাইল ডাউনলোড
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              ৩. ভূমির তফসিল ও প্রস্তাবিত সাইট
              ========================================================================= */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>ভূমির তফসিল ও প্রস্তাবিত সাইটের বিবরণ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">মৌজার নাম ও জে.এল.</span>
                <span className="font-bold text-slate-900">
                  {searchedApp.schedule.mouzaName} (জে.এল. নং-{toBanglaNumber(searchedApp.schedule.jlNo)})
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">পৌর ওয়ার্ড নং</span>
                <span className="font-bold text-slate-900">{searchedApp.schedule.wardNo}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">জমির পরিমাণ ও শ্রেণি</span>
                <span className="font-bold text-slate-900">
                  {searchedApp.schedule.landArea} ({searchedApp.schedule.landClass})
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                <span className="text-xs text-emerald-800 font-medium block">দলিল নং ও তারিখ</span>
                <span className="font-bold text-emerald-950">
                  দলিল নং: {searchedApp.schedule.deedNo} ({searchedApp.schedule.deedDate})
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                <span className="text-xs text-blue-800 font-medium block">সৃজিত বি.এস খতিয়ান</span>
                <span className="font-bold text-blue-950">
                  {searchedApp.schedule.createdBsKhatianNo || 'প্রযোজ্য নয়'}
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                <span className="text-xs text-blue-800 font-medium block">বি.এস খতিয়ান ও দাগ</span>
                <span className="font-bold text-blue-950">
                  খতিয়ান: {toBanglaNumber(searchedApp.schedule.bsKhatianNo)} | দাগ: {toBanglaNumber(searchedApp.schedule.bsDagNo)}
                </span>
              </div>

              {(searchedApp.draftsmanReview?.geoCoordinates || searchedApp.schedule.geoCoordinates) && (
                <div className="sm:col-span-2 md:col-span-3 p-3 bg-emerald-50/80 rounded-lg border border-emerald-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        নক্সাকার কর্তৃক সরজমিন চিহ্নিত ভৌগোলিক অবস্থান (GPS Pin):
                      </span>
                      <span className="font-mono text-xs text-emerald-900 font-bold">
                        Lat: {(searchedApp.draftsmanReview?.geoCoordinates || searchedApp.schedule.geoCoordinates)?.latitude.toFixed(6)}, 
                        Lng: {(searchedApp.draftsmanReview?.geoCoordinates || searchedApp.schedule.geoCoordinates)?.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${(searchedApp.draftsmanReview?.geoCoordinates || searchedApp.schedule.geoCoordinates)?.latitude},${(searchedApp.draftsmanReview?.geoCoordinates || searchedApp.schedule.geoCoordinates)?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded shadow-2xs transition-colors"
                  >
                    <span>গুগল ম্যাপে দেখুন</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              ৩.৫ সংযুক্ত নথিপত্র ও মৌজা ম্যাপ (Attached Documents & Maps)
              ========================================================================= */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
            <DocumentAttachmentsViewer
              documents={searchedApp.documents || []}
              applicantName={searchedApp.siteLocation.applicantName}
              applicationId={searchedApp.id}
              hideViewAndDownload={true}
            />
          </div>

          {/* =========================================================================
              ৩.৬ সংবিধিবদ্ধ পরবর্তী ধাপ: তফসিল-১ আবেদন (ইমারত নির্মাণ অনুমোদন)
              ========================================================================= */}
          {searchedApp.status === 'approved' && onApplySchedule1 && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold border border-emerald-500/40">
                  <Building className="w-3.5 h-3.5" />
                  <span>সংবিধিবদ্ধ পরবর্তী নাগরিক সেবা</span>
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  ইমারত নির্মাণ অনুমোদন আবেদন (তফসিল - ১)
                </h4>
                <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
                  যেহেতু আপনার ভূমির সীমানা নির্ধারণ (ডিমার্কেশন) ও মালিকানা প্রত্যয়নপত্র অনুমোদিত হয়েছে, আপনি এখন Building Construction Act, 1952 অনুযায়ী ১,০০০/- টাকা ফি প্রদানপূর্বক ইমারত নির্মাণ অনুমোদনের আবেদন করতে পারবেন।
                </p>
              </div>

              <button
                onClick={() => onApplySchedule1(searchedApp)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-all shrink-0"
              >
                <span>তফসিল-১ আবেদন করুন (ফি: ১০০০/-)</span>
                <Navigation className="w-4 h-4 rotate-90" />
              </button>
            </div>
          )}

          {/* =========================================================================
              ৫. নোটিফিকেশন এলার্ট ও বার্তা হিস্ট্রি (Notification Alerts Stream)
              ========================================================================= */}
          {searchedApp.notificationLogs && searchedApp.notificationLogs.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span>স্বয়ংক্রিয় SMS ও Email নোটিফিকেশন লগ (Automated Status Alerts)</span>
                </h3>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                  সর্বমোট {toBanglaNumber(searchedApp.notificationLogs.length)} টি এলার্ট
                </span>
              </div>

              <div className="space-y-3">
                {searchedApp.notificationLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{log.title}</h4>
                        <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {(log.type || (log as any).channel) === 'both'
                            ? 'SMS & EMAIL'
                            : ((log.type || (log as any).channel || 'SMS')).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{log.message}</p>
                    </div>

                    <div className="text-right shrink-0 text-slate-500 text-xs">
                      <span className="font-mono block text-slate-700 font-medium">
                        {formatBanglaDate(log.timestamp || (log as any).sentAt || new Date().toISOString())}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">সফলভাবে প্রেরিত</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Modal Popups */}
          {printRoadCuttingModal && (
            <RoadCuttingApplicationPrintA4
              application={printRoadCuttingModal}
              onClose={() => setPrintRoadCuttingModal(null)}
            />
          )}

          {printBuildingPermitModal && (
            <BuildingApprovalPermitPrintA4
              application={printBuildingPermitModal}
              onClose={() => setPrintBuildingPermitModal(null)}
            />
          )}

          {printBuildingFormModal && (
            <Schedule1ApplicationPrintA4
              application={printBuildingFormModal}
              onClose={() => setPrintBuildingFormModal(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};
