import {
  DemarcationApplication,
  BuildingConstructionApplication,
  RoadCuttingApplication,
  SystemAuditLogItem,
  UploadedDocument
} from '../types';

const API_BASE = '/api';

/**
 * Compresses large images client-side before upload to save bandwidth & server storage.
 * Leaves PDFs and smaller files unchanged.
 */
async function compressImageIfPossible(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size < 600 * 1024) return file; // small enough already

  try {
    return await new Promise<File>((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  } catch {
    return file;
  }
}

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

  // Ensure fileUrl is set with DataURL base64 if server upload was unavailable
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
  } catch (err) {
    console.warn(`[Hostinger MySQL] Could not fetch ${module} applications:`, err);
  }
  return null;
}

/**
 * Search an application from Hostinger MySQL by Tracking ID, Mobile, NID, or Form No
 */
export async function searchApplicationApi<T = DemarcationApplication>(query: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/applications.php?tracking_id=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.trackingId)) {
        return data as T;
      }
    }
  } catch (err) {
    console.warn('[Hostinger MySQL] searchApplicationApi error:', err);
  }
  return null;
}

/**
 * Save or update an application to Hostinger MySQL
 */
export async function saveApplicationToApi(
  app: DemarcationApplication | BuildingConstructionApplication | RoadCuttingApplication,
  module: 'demarcation' | 'building' | 'road_cutting'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/applications.php?module=${module}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...app, moduleType: module }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      return { success: true, data };
    } else {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.warn('[Hostinger MySQL] Server rejected save:', errData);
      return { success: false, error: errData.error || `HTTP ${res.status}` };
    }
  } catch (err: any) {
    console.warn('[Hostinger MySQL] Could not save to applications.php:', err);
    return { success: false, error: err.message || 'Network error' };
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
  const preparedFile = await compressImageIfPossible(file);

  const toDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(preparedFile);
    });
  };

  // 1. First attempt: Standard multipart form data
  try {
    const formData = new FormData();
    formData.append('file', preparedFile);

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
          fileName: data.fileName || preparedFile.name,
          fileSize: data.fileSize || preparedFile.size,
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
          fileName: preparedFile.name,
          fileData: dataUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fileUrl) {
          return {
            success: true,
            fileUrl: data.fileUrl,
            fileName: data.fileName || preparedFile.name,
            fileSize: data.fileSize || preparedFile.size,
          };
        }
      }

      // 3. Resilient fallback: Return the local DataURL so user is never blocked
      return {
        success: true,
        fileUrl: dataUrl,
        fileName: preparedFile.name,
        fileSize: preparedFile.size,
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
    fileName: preparedFile.name,
    fileSize: preparedFile.size,
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
    console.warn(`[Hostinger MySQL] Could not fetch settings (${customKey}):`, err);
  }
  return null;
}

/**
 * Save portal configuration to Hostinger MySQL
 */
export async function savePortalConfigToApi<T = any>(config: T, customKey: string = 'portal_config'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: customKey,
        data: config,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Hostinger MySQL] Could not save settings (${customKey}):`, err);
    return false;
  }
}

/**
 * Fetch council setup & officials config from Hostinger MySQL
 */
export async function fetchCouncilConfigFromApi<T = any>(): Promise<T | null> {
  return fetchPortalConfigFromApi<T>('council_setup');
}

/**
 * Save council setup & officials config to Hostinger MySQL
 */
export async function saveCouncilConfigToApi<T = any>(config: T): Promise<boolean> {
  return savePortalConfigToApi<T>(config, 'council_setup');
}
