import {
  DemarcationApplication,
  BuildingConstructionApplication,
  RoadCuttingApplication,
  SystemAuditLogItem,
  UploadedDocument
} from '../types';

const API_BASE = '/api';

/**
 * Upload a document (PDF, JPG, PNG) to Hostinger's uploads directory.
 * Falls back to local object metadata if API is unavailable.
 */
export async function uploadDocumentToServer(
  file: File,
  docKey: string,
  docTitle: string,
  isMandatory: boolean
): Promise<UploadedDocument> {
  const defaultDoc: UploadedDocument = {
    id: `doc-${Date.now()}`,
    docType: docKey,
    docTitle,
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date().toISOString().split('T')[0],
    isMandatory,
  };

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload.php`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.fileUrl) {
        return {
          ...defaultDoc,
          fileUrl: data.fileUrl,
          fileName: data.fileName || file.name,
          fileSize: data.fileSize || file.size,
        };
      }
    }
  } catch (err) {
    console.warn('[Hostinger Upload] Could not reach upload.php, storing metadata locally:', err);
  }

  return defaultDoc;
}

/**
 * Fetch all applications for a specific module from Hostinger MySQL
 */
export async function fetchApplicationsFromApi<T>(module: 'demarcation' | 'building' | 'road_cutting'): Promise<T[] | null> {
  try {
    const res = await fetch(`${API_BASE}/applications.php?module=${module}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as T[];
      }
    }
  } catch {
    // API not reachable, fallback to localStorage
  }
  return null;
}

/**
 * Save or update an application to Hostinger MySQL
 */
export async function saveApplicationToApi(
  app: DemarcationApplication | BuildingConstructionApplication | RoadCuttingApplication,
  module: 'demarcation' | 'building' | 'road_cutting'
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/applications.php?module=${module}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...app, moduleType: module }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Hostinger MySQL] Could not save to applications.php:', err);
    return false;
  }
}

/**
 * Save an audit log to Hostinger MySQL
 */
export async function saveAuditLogToApi(log: SystemAuditLogItem): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/audit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch audit logs from Hostinger MySQL
 */
export async function fetchAuditLogsFromApi(): Promise<SystemAuditLogItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/audit.php?limit=200`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as SystemAuditLogItem[];
      }
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Upload an image (PNG, JPG, WEBP) directly to Hostinger uploads folder.
 * Returns the public URL path (e.g. /uploads/doc_....jpg) or a dataURL fallback.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload.php`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.fileUrl) {
        return data.fileUrl;
      }
    }
  } catch (err) {
    console.warn('[Hostinger Upload] Image upload failed, falling back to local reader:', err);
  }

  // Fallback to local DataURL if server unreachable
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch portal and council configuration from Hostinger MySQL
 */
export async function fetchPortalConfigFromApi<T = any>(): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/settings.php?key=portal_config`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return data as T;
      }
    }
  } catch (err) {
    console.warn('[Hostinger Settings] Could not fetch portal_config:', err);
  }
  return null;
}

function getCurrentOfficerSession(): { username: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('sitakunda_admin_session_auth') || localStorage.getItem('sitakunda_admin_session_auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save portal and council configuration to Hostinger MySQL (Protected: Requires logged-in officer)
 */
export async function savePortalConfigToApi(config: any): Promise<boolean> {
  const session = getCurrentOfficerSession();
  if (!session?.username) {
    console.warn('[Hostinger Settings] তথ্য পরিবর্তনের জন্য অফিসিয়াল আইডিতে লগইন করা আবশ্যক।');
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/settings.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Officer-Username': session.username,
      },
      body: JSON.stringify({
        key: 'portal_config',
        data: config,
        officer_username: session.username,
        officer_role: session.role || 'officer',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Hostinger Settings] Could not save portal_config to server:', err);
    return false;
  }
}


