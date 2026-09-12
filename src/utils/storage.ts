import { DemarcationApplication, OfficerUser, ApplicationDraftData, SystemAuditLogItem, AuditActionType, BuildingConstructionApplication, RoadCuttingApplication } from '../types';
import {
  INITIAL_DEMARCATION_APPLICATIONS,
  INITIAL_BUILDING_APPLICATIONS,
  INITIAL_ROAD_CUTTING_APPLICATIONS
} from '../data/initialApplications';
import {
  saveApplicationToApi,
  deleteApplicationFromApi,
  clearAllApplicationsFromApi,
  saveAuditLogToApi,
  fetchApplicationsFromApi,
  fetchAuditLogsFromApi
} from './apiStorage';
import { syncPortalConfigWithHostinger } from './portalConfig';
import {
  saveDocumentFileToVault,
  saveApplicationToVault,
  deleteApplicationFromVault,
  clearApplicationsFromVault,
  clearApplicationsByModuleFromVault,
  hydrateApplicationFromVault,
  hydrateDocumentsFromVault,
  getApplicationFromVault
} from './indexedDbStorage';


export const DEMARCATION_STORAGE_KEY = 'sitakunda_demarcation_applications_clean_v3';
export const BUILDING_APPS_STORAGE_KEY = 'sitakunda_building_applications_clean_v3';
export const ROAD_CUTTING_APPS_STORAGE_KEY = 'sitakunda_road_cutting_applications_clean_v3';
export const STORAGE_KEY = DEMARCATION_STORAGE_KEY;
const AUTH_KEY = 'sitakunda_admin_session_auth';
const PASSWORDS_STORAGE_KEY = 'sitakunda_officer_passwords_v1';
const DRAFT_STORAGE_KEY = 'sitakunda_demarcation_draft_v1';
const AUDIT_LOG_STORAGE_KEY = 'sitakunda_system_audit_logs_v1';
const DELETED_APP_IDS_KEY = 'sitakunda_permanently_deleted_ids_v1';

export function getDeletedAppIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_APP_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((s) => String(s).trim().toLowerCase()));
    }
  } catch {}
  return new Set();
}

export function recordDeletedAppId(id?: string, trackingId?: string, formNo?: string): void {
  try {
    const current = getDeletedAppIds();
    let changed = false;
    [id, trackingId, formNo].forEach((v) => {
      if (v && typeof v === 'string' && v.trim().length > 3) {
        const cleanVal = v.trim().toLowerCase();
        if (cleanVal !== 'undefined' && cleanVal !== 'null' && cleanVal !== '[object object]') {
          current.add(cleanVal);
          changed = true;
        }
      }
    });
    if (changed) {
      localStorage.setItem(DELETED_APP_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch {}
}

export function unmarkDeletedAppId(id?: string, trackingId?: string, formNo?: string): void {
  try {
    const current = getDeletedAppIds();
    let changed = false;
    [id, trackingId, formNo].forEach((v) => {
      if (v && typeof v === 'string' && v.trim()) {
        const cleanVal = v.trim().toLowerCase();
        if (current.has(cleanVal)) {
          current.delete(cleanVal);
          changed = true;
        }
      }
    });
    if (changed) {
      localStorage.setItem(DELETED_APP_IDS_KEY, JSON.stringify(Array.from(current)));
    }
  } catch {}
}

export function isAppDeleted(id?: string, trackingId?: string, formNo?: string): boolean {
  const deleted = getDeletedAppIds();
  if (!deleted || deleted.size === 0) return false;

  const check = (val?: string) => {
    if (!val || typeof val !== 'string') return false;
    const cleanVal = val.trim().toLowerCase();
    if (!cleanVal || cleanVal === 'undefined' || cleanVal === 'null' || cleanVal === '[object object]') {
      return false;
    }
    return deleted.has(cleanVal);
  };

  return check(id) || check(trackingId) || check(formNo);
}

// Clean up any legacy mock storage keys safely without touching remote database
try {
  if (typeof localStorage !== 'undefined') {
    [
      'sitakunda_demarcation_applications_clean_v1',
      'sitakunda_demarcation_applications_clean_v2',
      'sitakunda_demarcation_applications_v1',
      'sitakunda_demarcation_applications_v2',
      'sitakunda_demarcation_applications_v3',
      'sitakunda_demarcation_applications_v4',
      'sitakunda_demarcation_applications_v5',
      'sitakunda_building_applications_clean_v1',
      'sitakunda_building_applications_clean_v2',
      'sitakunda_building_applications_v1',
      'sitakunda_building_applications_v2',
      'sitakunda_building_applications_v3',
      'sitakunda_building_applications_v4',
      'sitakunda_road_cutting_applications_clean_v1',
      'sitakunda_road_cutting_applications_clean_v2',
      'sitakunda_road_cutting_applications_v1',
      'sitakunda_road_cutting_applications_v2',
      'sitakunda_road_cutting_applications_v3',
      'sitakunda_recent_tracking_searches_v1',
    ].forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
  }
} catch {
  // Ignore storage errors in non-browser environments
}

export const DEFAULT_OFFICERS: Array<OfficerUser & { defaultPassword: string; title: string }> = [
  {
    username: 'admin.sitakunda',
    role: 'super_admin',
    roleTitleBangla: 'সিস্টেম ও পৌর অ্যাডমিন (Super Admin)',
    title: 'পৌর অ্যাডমিনিস্ট্রেটর (System Admin)',
    name: 'পৌর অ্যাডমিনিস্ট্রেটর',
    designation: 'প্রধান প্রশাসনিক ও আইটি সেল, সীতাকুণ্ড পৌরসভা',
    defaultPassword: 'Admin@Sitakunda2026',
  },
  {
    username: 'draftsman.sitakunda',
    role: 'draftsman',
    roleTitleBangla: 'নক্সাকার (সিভিল)',
    title: 'নক্সাকার (সিভিল)',
    name: 'নক্সাকার (সিভিল)',
    designation: 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা',
    defaultPassword: 'Sitakunda@2026',
  },
  {
    username: 'xen.sitakunda',
    role: 'executive_engineer',
    roleTitleBangla: 'নির্বাহী প্রকৌশলী',
    title: 'নির্বাহী প্রকৌশলী',
    name: 'নির্বাহী প্রকৌশলী',
    designation: 'নির্বাহী প্রকৌশলী, সীতাকুণ্ড পৌরসভা',
    defaultPassword: 'Sitakunda@2026',
  },
  {
    username: 'mayor.sitakunda',
    role: 'mayor',
    roleTitleBangla: 'মেয়র / প্রশাসক',
    title: 'মেয়র / প্রশাসক',
    name: 'মেয়র / প্রশাসক',
    designation: 'মেয়র / প্রশাসক, সীতাকুণ্ড পৌরসভা',
    defaultPassword: 'Sitakunda@2026',
  },
];

export function getOfficerPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure admin passwords exist
      if (!parsed['admin.sitakunda']) {
        parsed['admin.sitakunda'] = 'Admin@Sitakunda2026';
        parsed['admin'] = 'Admin@Sitakunda2026';
        parsed['superadmin'] = 'Admin@Sitakunda2026';
        localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading officer passwords:', err);
  }
  const defaults: Record<string, string> = {
    'admin.sitakunda': 'Admin@Sitakunda2026',
    'admin': 'Admin@Sitakunda2026',
    'superadmin': 'Admin@Sitakunda2026',
    'draftsman.sitakunda': 'Sitakunda@2026',
    'draftsman.civil': 'Sitakunda@2026',
    'draftsman': 'Sitakunda@2026',
    'xen.sitakunda': 'Sitakunda@2026',
    'ee.sitakunda': 'Sitakunda@2026',
    'mayor.sitakunda': 'Sitakunda@2026',
    'administrator': 'Sitakunda@2026',
  };
  localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

export function getOfficerAccounts(): Array<{ username: string; title: string; password: string }> {
  const passwords = getOfficerPasswords();
  return DEFAULT_OFFICERS.map((o) => ({
    username: o.username,
    title: o.title,
    password: passwords[o.username] || o.defaultPassword,
  }));
}

export function verifyOfficerLogin(usernameInput: string, passwordInput: string): OfficerUser | null {
  const cleanUser = (usernameInput || '').trim();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanUser || !cleanPassword) {
    return null;
  }

  const passwords = getOfficerPasswords();
  const lowerUser = cleanUser.toLowerCase();

  // Find corresponding officer from DEFAULT_OFFICERS
  let officer = DEFAULT_OFFICERS.find(
    (o) => o.username.toLowerCase() === lowerUser
  );

  if (!officer) {
    if (lowerUser === 'admin' || lowerUser === 'superadmin' || lowerUser === 'admin.sitakunda') {
      officer = DEFAULT_OFFICERS[0];
    } else if (lowerUser === 'draftsman' || lowerUser === 'draftsman.civil' || lowerUser === 'draftsman.sitakunda') {
      officer = DEFAULT_OFFICERS[1];
    } else if (lowerUser === 'ee.sitakunda' || lowerUser === 'xen.sitakunda' || lowerUser === 'xen' || lowerUser === 'engineer') {
      officer = DEFAULT_OFFICERS[2];
    } else if (lowerUser === 'administrator' || lowerUser === 'mayor.sitakunda' || lowerUser === 'mayor') {
      officer = DEFAULT_OFFICERS[3];
    }
  }

  // Check saved password or default password
  const savedPassword = passwords[cleanUser] || passwords[lowerUser] || (officer ? passwords[officer.username] : null);
  const defaultPassword = officer?.defaultPassword;

  const isPasswordCorrect = 
    (savedPassword && savedPassword.trim() === cleanPassword) ||
    (defaultPassword && defaultPassword.trim() === cleanPassword);

  if (!isPasswordCorrect) {
    return null;
  }

  if (officer) {
    return {
      username: officer.username,
      role: officer.role,
      roleTitleBangla: officer.roleTitleBangla,
      title: officer.title,
      name: officer.name,
      designation: officer.designation,
    };
  }

  return {
    username: cleanUser,
    role: 'draftsman',
    roleTitleBangla: 'পৌর কর্মকর্তা',
    title: 'পৌর কর্মকর্তা',
    name: cleanUser,
    designation: 'সীতাকুণ্ড পৌরসভা',
  };
}

export const authenticateOfficer = verifyOfficerLogin;

export function changeOfficerPassword(
  username: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
  }

  const passwords = getOfficerPasswords();
  const currentSavedPassword = passwords[username] || passwords[username.toLowerCase()];

  if (currentSavedPassword && currentSavedPassword !== oldPassword) {
    return { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' };
  }

  passwords[username] = newPassword;
  passwords[username.toLowerCase()] = newPassword;
  if (username === 'ae.sitakunda') {
    passwords['Engr.Masum'] = newPassword;
  }

  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
  } catch (err) {
    return { success: false, message: 'পাসওয়ার্ড সংরক্ষণ করতে ব্যর্থ হয়েছে।' };
  }
}

export function getStoredApplications(): DemarcationApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    // Filter out permanently deleted applications
    const active = parsed.filter((app: DemarcationApplication) => !isAppDeleted(app.id, app.trackingId, app.formNo));
    if (active.length !== parsed.length) {
      safeSetLocalStorage(STORAGE_KEY, active);
    }
    // Normalize any legacy draftsman designation formatting
    return active.map((app: DemarcationApplication) => {
      if (app.statusHistory) {
        app.statusHistory = app.statusHistory.map((h) => {
          if (h.designation === 'পৌরসভা নক্সাকার (সিভিল)' || h.designation === 'নক্সাকার (সিভিল)') {
            return { ...h, designation: 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা' };
          }
          return h;
        });
      }
      if (app.draftsmanReview && (app.draftsmanReview.designation === 'পৌরসভা নক্সাকার (সিভিল)' || app.draftsmanReview.designation === 'নক্সাকার (সিভিল)')) {
        app.draftsmanReview.designation = 'নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা';
      }
      return app;
    });
  } catch (err) {
    console.error('Error reading localStorage applications:', err);
    return [];
  }
}

function safeSetLocalStorage(key: string, data: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014)) {
      console.warn('[LocalStorage] QuotaExceededError detected, preserving files in IndexedDB vault and trimming local cache');
      try {
        const lightData = data.map((item) => {
          if (!item || !item.documents || !Array.isArray(item.documents)) return item;
          const lightDocs = item.documents.map((doc: any) => {
            if (doc && doc.fileUrl && doc.fileUrl.startsWith('data:')) {
              // Ensure full file data is safely preserved in IndexedDB vault before lightening localStorage
              saveDocumentFileToVault(doc.id, doc.fileUrl, doc.fileName, doc.docTitle).catch(() => {});
              return {
                ...doc,
                fileUrl: '', // strip massive base64 for local storage cache while keeping metadata
              };
            }
            return doc;
          });
          return { ...item, documents: lightDocs };
        });
        localStorage.setItem(key, JSON.stringify(lightData));
      } catch (innerErr) {
        console.error('[LocalStorage] Critical failure saving to local storage:', innerErr);
      }
    } else {
      console.error('Error saving to localStorage:', err);
    }
  }
}

export function saveApplication(app: DemarcationApplication): DemarcationApplication[] {
  unmarkDeletedAppId(app.id, app.trackingId, app.formNo);
  saveApplicationToVault(app).catch(() => {});

  const current = getStoredApplications();
  const updated = [app, ...current.filter((item) => item.id !== app.id)];
  safeSetLocalStorage(STORAGE_KEY, updated);

  saveApplicationToApi(app, 'demarcation').catch((err) => {
    console.warn('[Hostinger MySQL] Application sync deferred:', err);
  });
  return updated;
}

export async function saveApplicationAsync(app: DemarcationApplication): Promise<{ success: boolean; data?: any; error?: string }> {
  unmarkDeletedAppId(app.id, app.trackingId, app.formNo);
  await saveApplicationToVault(app).catch(() => {});

  const current = getStoredApplications();
  const updated = [app, ...current.filter((item) => item.id !== app.id)];
  safeSetLocalStorage(STORAGE_KEY, updated);

  const apiRes = await saveApplicationToApi(app, 'demarcation');
  return apiRes;
}

export function updateApplication(id: string, updates: Partial<DemarcationApplication>): DemarcationApplication[] {
  unmarkDeletedAppId(id, updates.trackingId, updates.formNo);
  const current = getStoredApplications();
  let updatedItem: DemarcationApplication | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });
  safeSetLocalStorage(STORAGE_KEY, updated);

  if (updatedItem) {
    saveApplicationToVault(updatedItem).catch(() => {});
    saveApplicationToApi(updatedItem, 'demarcation').catch((err) => {
      console.warn('[Hostinger MySQL] Application update sync deferred:', err);
    });
  }
  return updated;
}


export function saveDraft(draft: ApplicationDraftData): boolean {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (err) {
    console.error('Error saving draft to localStorage:', err);
    return false;
  }
}

export function getSavedDraft(): ApplicationDraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading draft from localStorage:', err);
    return null;
  }
}

export function clearSavedDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing draft from localStorage:', err);
  }
}

export function hasSavedDraft(): boolean {
  try {
    return Boolean(localStorage.getItem(DRAFT_STORAGE_KEY));
  } catch {
    return false;
  }
}

// Random unique Form Number (e.g. SKM-FORM-749281)
export function generateFormNumber(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `SKM-FORM-${randomSixDigits}`;
}

// Random unique Tracking ID (e.g. SKM-DEM-2026-684912)
export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `SKM-DEM-${year}-${randomSixDigits}`;
}

export function toBanglaNumber(num: number | string): string {
  if (num === undefined || num === null) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

export function formatBanglaDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = toBanglaNumber(d.getDate().toString().padStart(2, '0'));
    const months = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    const month = months[d.getMonth()];
    const year = toBanglaNumber(d.getFullYear());
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

export interface OfficerSession extends OfficerUser {
  loggedInAt: string;
}

export function getAdminSession(): OfficerSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const getOfficerSession = getAdminSession;

export function setAdminSession(officer: OfficerUser): void {
  const session: OfficerSession = {
    ...officer,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export const setOfficerSession = setAdminSession;

export function clearAdminSession(): void {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export const clearOfficerSession = clearAdminSession;

// ============================================================================
// Recent Tracking Searches Storage (Last 3-5 Search IDs)
// ============================================================================
const RECENT_SEARCHES_KEY = 'sitakunda_recent_tracking_searches_v1';

export interface RecentSearchItem {
  query: string;
  applicantName?: string;
  timestamp: string;
  status?: string;
}

export function getRecentTrackingSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 5);
    }
  } catch (err) {
    console.error('Error reading recent tracking searches:', err);
  }
  return [];
}

export function saveRecentTrackingSearch(
  query: string,
  applicantName?: string,
  status?: string
): RecentSearchItem[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) return getRecentTrackingSearches();

  try {
    const current = getRecentTrackingSearches();
    // Remove if already exists to place at front
    const filtered = current.filter(
      (item) => item.query.toLowerCase() !== cleanQuery.toLowerCase()
    );

    const newItem: RecentSearchItem = {
      query: cleanQuery,
      applicantName,
      status,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving recent tracking search:', err);
    return [];
  }
}

export function removeRecentTrackingSearch(query: string): RecentSearchItem[] {
  try {
    const current = getRecentTrackingSearches();
    const updated = current.filter(
      (item) => item.query.toLowerCase() !== query.trim().toLowerCase()
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error removing recent tracking search:', err);
    return [];
  }
}

export function clearRecentTrackingSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (err) {
    console.error('Error clearing recent tracking searches:', err);
  }
}

// ============================================================================
// System Audit Trail & Administrative Activity Logs
// ============================================================================

export const INITIAL_AUDIT_LOGS: SystemAuditLogItem[] = [];

export function getStoredAuditLogs(): SystemAuditLogItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Error reading audit logs:', err);
    return [];
  }
}

export function addAuditLog(entry: {
  officerUsername: string;
  officerName: string;
  officerRole: string;
  officerDesignation: string;
  actionType: AuditActionType;
  actionTitle: string;
  targetId?: string;
  applicantName?: string;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}): SystemAuditLogItem[] {
  try {
    const current = getStoredAuditLogs();
    const newLogItem: SystemAuditLogItem = {
      id: `audit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      officerUsername: entry.officerUsername,
      officerName: entry.officerName,
      officerRole: entry.officerRole,
      officerDesignation: entry.officerDesignation,
      actionType: entry.actionType,
      actionTitle: entry.actionTitle,
      targetId: entry.targetId,
      applicantName: entry.applicantName,
      details: entry.details,
      ipAddress: entry.ipAddress || '103.114.98.24 (Sitakunda Municipality Intranet)',
      metadata: entry.metadata,
    };

    const updated = [newLogItem, ...current];
    // Keep max 500 records in storage
    const trimmed = updated.slice(0, 500);
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(trimmed));
    saveAuditLogToApi(newLogItem).catch((err) => {
      console.warn('[Hostinger MySQL] Audit log sync deferred:', err);
    });
    return trimmed;
  } catch (err) {
    console.error('Error adding audit log:', err);
    return getStoredAuditLogs();
  }
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing audit logs:', err);
  }
}

export function getBuildingApplications(): BuildingConstructionApplication[] {
  try {
    const raw = localStorage.getItem(BUILDING_APPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const active = parsed.filter((app: any) => !isAppDeleted(app.id, app.trackingId, app.formNo));
    if (active.length !== parsed.length) {
      safeSetLocalStorage(BUILDING_APPS_STORAGE_KEY, active);
    }
    return active;
  } catch (err) {
    console.error('Error reading building applications:', err);
    return [];
  }
}

export function saveBuildingApplication(app: BuildingConstructionApplication): BuildingConstructionApplication[] {
  try {
    unmarkDeletedAppId(app.id, (app as any).trackingId, app.formNo);
    saveApplicationToVault(app).catch(() => {});
    const current = getBuildingApplications();
    const updated = [app, ...current.filter((item) => item.id !== app.id)];
    safeSetLocalStorage(BUILDING_APPS_STORAGE_KEY, updated);
    saveApplicationToApi(app, 'building').catch((err) => {
      console.warn('[Hostinger MySQL] Building application sync deferred:', err);
    });
    return updated;
  } catch (err) {
    console.error('Error saving building application:', err);
    return getBuildingApplications();
  }
}

export async function saveBuildingApplicationAsync(app: BuildingConstructionApplication): Promise<{ success: boolean; data?: any; error?: string }> {
  unmarkDeletedAppId(app.id, (app as any).trackingId, app.formNo);
  await saveApplicationToVault(app).catch(() => {});
  const current = getBuildingApplications();
  const updated = [app, ...current.filter((item) => item.id !== app.id)];
  safeSetLocalStorage(BUILDING_APPS_STORAGE_KEY, updated);

  const apiRes = await saveApplicationToApi(app, 'building');
  return apiRes;
}

export function updateBuildingApplication(updatedApp: BuildingConstructionApplication): BuildingConstructionApplication[] {
  try {
    unmarkDeletedAppId(updatedApp.id, (updatedApp as any).trackingId, updatedApp.formNo);
    saveApplicationToVault(updatedApp).catch(() => {});
    const current = getBuildingApplications();
    const index = current.findIndex((item) => item.id === updatedApp.id);
    let updated: BuildingConstructionApplication[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = updatedApp;
    } else {
      updated = [updatedApp, ...current];
    }
    safeSetLocalStorage(BUILDING_APPS_STORAGE_KEY, updated);
    saveApplicationToApi(updatedApp, 'building').catch((err) => {
      console.warn('[Hostinger MySQL] Building application update sync deferred:', err);
    });
    return updated;
  } catch (err) {
    console.error('Error updating building application:', err);
    return getBuildingApplications();
  }
}

export function getRoadCuttingApplications(): RoadCuttingApplication[] {
  try {
    const raw = localStorage.getItem(ROAD_CUTTING_APPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const active = parsed.filter((app: any) => !isAppDeleted(app.id, app.trackingId, app.formNo));
    if (active.length !== parsed.length) {
      safeSetLocalStorage(ROAD_CUTTING_APPS_STORAGE_KEY, active);
    }
    return active;
  } catch (err) {
    console.error('Error reading road cutting applications:', err);
    return [];
  }
}

export function saveRoadCuttingApplication(app: RoadCuttingApplication): RoadCuttingApplication[] {
  try {
    unmarkDeletedAppId(app.id, (app as any).trackingId, app.formNo);
    saveApplicationToVault(app).catch(() => {});
    const current = getRoadCuttingApplications();
    const updated = [app, ...current.filter((item) => item.id !== app.id)];
    safeSetLocalStorage(ROAD_CUTTING_APPS_STORAGE_KEY, updated);
    saveApplicationToApi(app, 'road_cutting').catch((err) => {
      console.warn('[Hostinger MySQL] Road cutting application sync deferred:', err);
    });
    return updated;
  } catch (err) {
    console.error('Error saving road cutting application:', err);
    return getRoadCuttingApplications();
  }
}

export async function saveRoadCuttingApplicationAsync(app: RoadCuttingApplication): Promise<{ success: boolean; data?: any; error?: string }> {
  unmarkDeletedAppId(app.id, (app as any).trackingId, app.formNo);
  await saveApplicationToVault(app).catch(() => {});
  const current = getRoadCuttingApplications();
  const updated = [app, ...current.filter((item) => item.id !== app.id)];
  safeSetLocalStorage(ROAD_CUTTING_APPS_STORAGE_KEY, updated);

  const apiRes = await saveApplicationToApi(app, 'road_cutting');
  return apiRes;
}

export function updateRoadCuttingApplication(updatedApp: RoadCuttingApplication): RoadCuttingApplication[] {
  try {
    saveApplicationToVault(updatedApp).catch(() => {});
    const current = getRoadCuttingApplications();
    const index = current.findIndex((item) => item.id === updatedApp.id);
    let updated: RoadCuttingApplication[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = updatedApp;
    } else {
      updated = [updatedApp, ...current];
    }
    safeSetLocalStorage(ROAD_CUTTING_APPS_STORAGE_KEY, updated);
    saveApplicationToApi(updatedApp, 'road_cutting').catch((err) => {
      console.warn('[Hostinger MySQL] Road cutting application update sync deferred:', err);
    });
    return updated;
  } catch (err) {
    console.error('Error updating road cutting application:', err);
    return getRoadCuttingApplications();
  }
}

/**
 * Helper to smartly merge remote applications with local applications so that
 * locally attached documents/maps are NEVER wiped out by an incomplete remote record.
 */
function mergeApplicationsPreservingAttachments<T extends { id: string; trackingId?: string; formNo?: string; documents?: any[] }>(
  localList: T[],
  remoteList: T[]
): T[] {
  // 1. Filter out any permanently deleted applications from both lists
  const validLocal = localList.filter((a) => !isAppDeleted(a.id, a.trackingId, a.formNo));
  const validRemote = remoteList.filter((a) => !isAppDeleted(a.id, a.trackingId, a.formNo));

  // 2. If remote returned any previously deleted application, proactively purge it from API & vault
  remoteList.forEach((r) => {
    if (isAppDeleted(r.id, r.trackingId, r.formNo)) {
      deleteApplicationFromApi(r.id).catch(() => {});
      deleteApplicationFromVault(r.id).catch(() => {});
    }
  });

  const localMap = new Map<string, T>();
  validLocal.forEach((app) => localMap.set(app.id, app));

  // 3. Merge each remote app with local details
  const mergedRemotes = validRemote.map((remoteApp) => {
    const localApp = localMap.get(remoteApp.id);
    if (!localApp) return remoteApp;

    let mergedDocs = remoteApp.documents ? [...remoteApp.documents] : [];
    if (localApp.documents && localApp.documents.length > 0) {
      const localDocMap = new Map<string, any>();
      localApp.documents.forEach((d) => {
        if (d && d.id && d.fileUrl) localDocMap.set(d.id, d);
      });

      mergedDocs = mergedDocs.map((d) => {
        if ((!d.fileUrl || d.fileUrl === '') && localDocMap.has(d.id)) {
          return { ...d, fileUrl: localDocMap.get(d.id).fileUrl };
        }
        return d;
      });

      const remoteDocIds = new Set(mergedDocs.map((d) => d.id));
      localApp.documents.forEach((d) => {
        if (!remoteDocIds.has(d.id)) {
          mergedDocs.push(d);
        }
      });
    }

    return {
      ...localApp,
      ...remoteApp,
      documents: mergedDocs,
    };
  });

  // Also preserve any local applications that haven't reached remote yet
  const remoteIdSet = new Set(validRemote.map((r) => r.id));
  const unsyncedLocals = validLocal.filter((loc) => !remoteIdSet.has(loc.id));

  return [...unsyncedLocals, ...mergedRemotes];
}

/**
 * Synchronize all applications and audit logs with Hostinger MySQL server on startup
 */
export async function syncStorageWithHostinger(): Promise<void> {
  try {
    const localDemarcation = getStoredApplications();
    const localBuilding = getBuildingApplications();
    const localRoadCutting = getRoadCuttingApplications();

    const [demarcation, building, roadCutting, auditLogs] = await Promise.all([
      fetchApplicationsFromApi<DemarcationApplication>('demarcation'),
      fetchApplicationsFromApi<BuildingConstructionApplication>('building'),
      fetchApplicationsFromApi<RoadCuttingApplication>('road_cutting'),
      fetchAuditLogsFromApi(),
    ]);

    if (demarcation !== null && Array.isArray(demarcation)) {
      const mergedDemarcation = mergeApplicationsPreservingAttachments(localDemarcation, demarcation);
      safeSetLocalStorage(STORAGE_KEY, mergedDemarcation);
      // Ensure all merged apps are saved into vault
      mergedDemarcation.forEach((app) => saveApplicationToVault(app).catch(() => {}));

      // Check for unsynced local apps and push to remote (NEVER push deleted applications)
      const remoteIds = new Set(demarcation.map((a) => a.id));
      localDemarcation.forEach((app) => {
        if (!remoteIds.has(app.id) && !isAppDeleted(app.id, app.trackingId, app.formNo)) {
          saveApplicationToApi(app, 'demarcation').catch(() => {});
        }
      });
    }

    if (building !== null && Array.isArray(building)) {
      const mergedBuilding = mergeApplicationsPreservingAttachments(localBuilding, building);
      safeSetLocalStorage(BUILDING_APPS_STORAGE_KEY, mergedBuilding);
      mergedBuilding.forEach((app) => saveApplicationToVault(app).catch(() => {}));

      const remoteBIds = new Set(building.map((a) => a.id));
      localBuilding.forEach((app) => {
        if (!remoteBIds.has(app.id) && !isAppDeleted(app.id, (app as any).trackingId, app.formNo)) {
          saveApplicationToApi(app, 'building').catch(() => {});
        }
      });
    }

    if (roadCutting !== null && Array.isArray(roadCutting)) {
      const mergedRoadCutting = mergeApplicationsPreservingAttachments(localRoadCutting, roadCutting);
      safeSetLocalStorage(ROAD_CUTTING_APPS_STORAGE_KEY, mergedRoadCutting);
      mergedRoadCutting.forEach((app) => saveApplicationToVault(app).catch(() => {}));

      const remoteRCIds = new Set(roadCutting.map((a) => a.id));
      localRoadCutting.forEach((app) => {
        if (!remoteRCIds.has(app.id) && !isAppDeleted(app.id, (app as any).trackingId, app.formNo)) {
          saveApplicationToApi(app, 'road_cutting').catch(() => {});
        }
      });
    }

    if (auditLogs && auditLogs.length > 0) {
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(auditLogs));
    }

    // Also synchronize portal config, council & notices with Hostinger
    await syncPortalConfigWithHostinger().catch(() => {});
  } catch (err) {
    console.warn('[Hostinger Sync] Continuing with local storage:', err);
  }
}

export function generateRoadCuttingId(): string {
  const year = new Date().getFullYear();
  const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
  return `SKM-RC-${year}-${randomFourDigits}`;
}

export function generateRoadCuttingFormNo(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `SKM-RC-FORM-${randomSixDigits}`;
}

/**
 * Permanently delete a demarcation application across all layers (LocalStorage, IndexedDB, MySQL API)
 */
export function deleteDemarcationApplication(id: string): DemarcationApplication[] {
  const targetId = id.trim().toLowerCase();
  const current = getStoredApplications();
  const target = current.find(
    (a) =>
      (a.id || '').trim().toLowerCase() === targetId ||
      (a.trackingId || '').trim().toLowerCase() === targetId ||
      (a.formNo || '').trim().toLowerCase() === targetId
  );

  recordDeletedAppId(id, target?.trackingId, target?.formNo);

  // 1. Permanently delete from IndexedDB vault
  deleteApplicationFromVault(id).catch(() => {});
  if (target?.trackingId && target.trackingId !== id) {
    deleteApplicationFromVault(target.trackingId).catch(() => {});
  }

  // 2. Permanently delete from MySQL server / API
  deleteApplicationFromApi(id).catch((err) => {
    console.warn('[Hostinger MySQL] Application delete deferred:', err);
  });
  if (target?.trackingId && target.trackingId !== id) {
    deleteApplicationFromApi(target.trackingId).catch(() => {});
  }

  // 3. Delete from LocalStorage
  const updated = current.filter((item) => {
    const iId = (item.id || '').trim().toLowerCase();
    const tId = (item.trackingId || '').trim().toLowerCase();
    const fNo = (item.formNo || '').trim().toLowerCase();
    return iId !== targetId && tId !== targetId && fNo !== targetId;
  });
  safeSetLocalStorage(STORAGE_KEY, updated);
  try {
    localStorage.setItem('sitakunda_demarcation_applications', JSON.stringify(updated));
    localStorage.setItem('sitakunda_demarcation_applications_clean_v1', JSON.stringify([]));
    localStorage.setItem('sitakunda_demarcation_applications_clean_v2', JSON.stringify([]));
  } catch {}

  return updated;
}
export const deleteApplication = deleteDemarcationApplication;

/**
 * Permanently delete a building construction application across all layers
 */
export function deleteBuildingApplication(id: string): BuildingConstructionApplication[] {
  const targetId = id.trim().toLowerCase();
  const current = getBuildingApplications();
  const target = current.find(
    (a) =>
      (a.id || '').trim().toLowerCase() === targetId ||
      ((a as any).trackingId || '').trim().toLowerCase() === targetId ||
      (a.formNo || '').trim().toLowerCase() === targetId
  );

  recordDeletedAppId(id, (target as any)?.trackingId, target?.formNo);

  // 1. Permanently delete from IndexedDB vault
  deleteApplicationFromVault(id).catch(() => {});
  if ((target as any)?.trackingId && (target as any).trackingId !== id) {
    deleteApplicationFromVault((target as any).trackingId).catch(() => {});
  }

  // 2. Permanently delete from MySQL server / API
  deleteApplicationFromApi(id).catch((err) => {
    console.warn('[Hostinger MySQL] Building application delete deferred:', err);
  });
  if ((target as any)?.trackingId && (target as any).trackingId !== id) {
    deleteApplicationFromApi((target as any).trackingId).catch(() => {});
  }

  // 3. Delete from LocalStorage
  const updated = current.filter((item) => {
    const iId = (item.id || '').trim().toLowerCase();
    const tId = ((item as any).trackingId || '').trim().toLowerCase();
    const fNo = (item.formNo || '').trim().toLowerCase();
    return iId !== targetId && tId !== targetId && fNo !== targetId;
  });
  try {
    localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('sitakunda_building_applications', JSON.stringify(updated));
    localStorage.setItem('sitakunda_building_applications_clean_v1', JSON.stringify([]));
    localStorage.setItem('sitakunda_building_applications_clean_v2', JSON.stringify([]));
  } catch (err) {
    console.error('Error deleting building application:', err);
  }

  return updated;
}

/**
 * Permanently delete a road cutting application across all layers
 */
export function deleteRoadCuttingApplication(id: string): RoadCuttingApplication[] {
  const targetId = id.trim().toLowerCase();
  const current = getRoadCuttingApplications();
  const target = current.find(
    (a) =>
      (a.id || '').trim().toLowerCase() === targetId ||
      ((a as any).trackingId || '').trim().toLowerCase() === targetId ||
      (a.formNo || '').trim().toLowerCase() === targetId
  );

  recordDeletedAppId(id, (target as any)?.trackingId, target?.formNo);

  // 1. Permanently delete from IndexedDB vault
  deleteApplicationFromVault(id).catch(() => {});
  if ((target as any)?.trackingId && (target as any).trackingId !== id) {
    deleteApplicationFromVault((target as any).trackingId).catch(() => {});
  }

  // 2. Permanently delete from MySQL server / API
  deleteApplicationFromApi(id).catch((err) => {
    console.warn('[Hostinger MySQL] Road cutting delete deferred:', err);
  });
  if ((target as any)?.trackingId && (target as any).trackingId !== id) {
    deleteApplicationFromApi((target as any).trackingId).catch(() => {});
  }

  // 3. Delete from LocalStorage
  const updated = current.filter((item) => {
    const iId = (item.id || '').trim().toLowerCase();
    const tId = ((item as any).trackingId || '').trim().toLowerCase();
    const fNo = (item.formNo || '').trim().toLowerCase();
    return iId !== targetId && tId !== targetId && fNo !== targetId;
  });
  try {
    localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('sitakunda_road_cutting_applications', JSON.stringify(updated));
    localStorage.setItem('sitakunda_road_cutting_applications_clean_v1', JSON.stringify([]));
    localStorage.setItem('sitakunda_road_cutting_applications_clean_v2', JSON.stringify([]));
  } catch (err) {
    console.error('Error deleting road cutting application:', err);
  }

  return updated;
}

/**
 * Resets all applications across all 3 modules to empty (purges all demo/mock data)
 */
export function resetToDemoApplications(): {
  demarcation: DemarcationApplication[];
  building: BuildingConstructionApplication[];
  roadCutting: RoadCuttingApplication[];
} {
  try {
    // Clear all LocalStorage application keys
    localStorage.setItem(DEMARCATION_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify([]));
    [
      'sitakunda_demarcation_applications',
      'sitakunda_demarcation_applications_clean_v1',
      'sitakunda_demarcation_applications_clean_v2',
      'sitakunda_building_applications',
      'sitakunda_building_applications_clean_v1',
      'sitakunda_building_applications_clean_v2',
      'sitakunda_road_cutting_applications',
      'sitakunda_road_cutting_applications_clean_v1',
      'sitakunda_road_cutting_applications_clean_v2',
    ].forEach((k) => localStorage.removeItem(k));

    // Clear IndexedDB vault
    clearApplicationsFromVault().catch(() => {});

    // Clear backend / MySQL server
    clearAllApplicationsFromApi('demarcation').catch(() => {});
    clearAllApplicationsFromApi('building').catch(() => {});
    clearAllApplicationsFromApi('road_cutting').catch(() => {});
    clearAllApplicationsFromApi().catch(() => {});
  } catch (err) {
    console.error('Error clearing applications:', err);
  }
  return {
    demarcation: [],
    building: [],
    roadCutting: [],
  };
}

/**
 * Purge specific module demo applications
 */
export function purgeModuleApplications(module: 'demarcation' | 'building' | 'road_cutting'): void {
  try {
    if (module === 'demarcation') {
      localStorage.setItem(DEMARCATION_STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem('sitakunda_demarcation_applications');
      localStorage.removeItem('sitakunda_demarcation_applications_clean_v1');
      localStorage.removeItem('sitakunda_demarcation_applications_clean_v2');
      clearApplicationsByModuleFromVault('demarcation').catch(() => {});
      clearAllApplicationsFromApi('demarcation').catch(() => {});
    } else if (module === 'building') {
      localStorage.setItem(BUILDING_APPS_STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem('sitakunda_building_applications');
      localStorage.removeItem('sitakunda_building_applications_clean_v1');
      localStorage.removeItem('sitakunda_building_applications_clean_v2');
      clearApplicationsByModuleFromVault('building').catch(() => {});
      clearAllApplicationsFromApi('building').catch(() => {});
    } else if (module === 'road_cutting') {
      localStorage.setItem(ROAD_CUTTING_APPS_STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem('sitakunda_road_cutting_applications');
      localStorage.removeItem('sitakunda_road_cutting_applications_clean_v1');
      localStorage.removeItem('sitakunda_road_cutting_applications_clean_v2');
      clearApplicationsByModuleFromVault('road_cutting').catch(() => {});
      clearAllApplicationsFromApi('road_cutting').catch(() => {});
    }
  } catch (err) {
    console.error(`Error purging ${module} applications:`, err);
  }
}

