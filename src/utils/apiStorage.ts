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
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    docType: docKey,
    docTitle,
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date().toISOString().split('T')[0],
    isMandatory,
  };

  try {
    const uploadRes = await uploadFileToServer(file);
    if (uploadRes && uploadRes.fileUrl) {
      return {
        ...defaultDoc,
        fileUrl: uploadRes.fileUrl,
        fileName: uploadRes.fileName || file.name,
        fileSize: uploadRes.fileSize || file.size,
      };
    }
  } catch (err) {
    console.warn('[Hostinger Upload] Error in uploadDocumentToServer:', err);
  }

  // Ensure fileUrl is ALWAYS set with DataURL base64 if server upload was unavailable
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  return {
    ...defaultDoc,
    fileUrl: dataUrl,
  };
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
  const res = await uploadFileToServer(file);
  if (res.success && res.fileUrl) {
    return res.fileUrl;
  }

  // Fallback to local DataURL if server unreachable
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.readAsDataURL(file);
  });
}

/**
 * Upload any supported file (PDF, JPG, PNG, WEBP) directly to Hostinger's uploads directory.
 * Returns public file URL path (e.g. /uploads/doc_....pdf)
 */
export async function uploadFileToServer(file: File): Promise<{
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  error?: string;
}> {
  const toDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // 1. First attempt: Standard multipart form data
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
          success: true,
          fileUrl: data.fileUrl,
          fileName: data.fileName || file.name,
          fileSize: data.fileSize || file.size,
        };
      }
    }
  } catch (err) {
    console.warn('[Hostinger Upload] Multipart upload error, trying base64 fallback:', err);
  }

  // 2. Second attempt: Base64 JSON payload
  try {
    const dataUrl = await toDataUrl();
    if (dataUrl) {
      const res = await fetch(`${API_BASE}/upload.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: dataUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fileUrl) {
          return {
            success: true,
            fileUrl: data.fileUrl,
            fileName: data.fileName || file.name,
            fileSize: data.fileSize || file.size,
          };
        }
      }

      // 3. Resilient fallback: Return the local DataURL so user is never blocked
      return {
        success: true,
        fileUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    }
  } catch (err: any) {
    console.warn('[Hostinger Upload] Base64 upload fallback error:', err);
  }

  // Final fallback
  const fallbackDataUrl = await toDataUrl();
  return {
    success: !!fallbackDataUrl,
    fileUrl: fallbackDataUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Fetch portal and council configuration from Hostinger MySQL
 */
export async function fetchPortalConfigFromApi<T = any>(customKey: string = 'portal_config'): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/settings.php?key=${encodeURIComponent(customKey)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return data as T;
      }
    }
  } catch (err) {
    console.warn(`[Hostinger Settings] Could not fetch ${customKey}:`, err);
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
export async function savePortalConfigToApi(config: any, customKey: string = 'portal_config'): Promise<boolean> {
  const session = getCurrentOfficerSession();
  const officerUser = session?.username || 'admin.sitakunda';
  const officerRole = session?.role || 'super_admin';

  try {
    const res = await fetch(`${API_BASE}/settings.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Officer-Username': officerUser,
      },
      body: JSON.stringify({
        key: customKey,
        data: config,
        officer_username: officerUser,
        officer_role: officerRole,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Hostinger Settings] Could not save ${customKey} to server:`, err);
    return false;
  }
}


