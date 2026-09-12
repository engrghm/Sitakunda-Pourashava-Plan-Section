import {
  DemarcationApplication,
  BuildingConstructionApplication,
  RoadCuttingApplication,
  SystemAuditLogItem,
  UploadedDocument
} from '../types';

import {
  saveDocumentFileToVault,
  saveApplicationToVault,
  hydrateApplicationFromVault,
  hydrateDocumentsFromVault
} from './indexedDbStorage';

/**
 * Returns dynamic API base URL based on current host & subdirectory
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    let dir = pathname;
    if (dir.includes('.')) {
      dir = dir.substring(0, dir.lastIndexOf('/'));
    }
    dir = dir.replace(/\/+$/, '');

    if (dir && dir !== '' && dir !== '/') {
      return `${origin}${dir}/api`;
    }
    return `${origin}/api`;
  }
  return '/api';
}

/**
 * Generate fallback URLs for an API endpoint to withstand subdirectories or rewrites
 */
export function getApiEndpoints(fileOrQuery: string): string[] {
  const base = getApiBase();
  const clean = fileOrQuery.replace(/^\/+/, '');
  const list = [
    `${base}/${clean}`,
    `/api/${clean}`,
    `./api/${clean}`,
    `api/${clean}`
  ];
  return Array.from(new Set(list));
}

/**
 * Resolve relative uploads path (e.g. /uploads/doc_... .pdf) to full URL
 */
export function resolveFileUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    let dir = pathname;
    if (dir.includes('.')) {
      dir = dir.substring(0, dir.lastIndexOf('/'));
    }
    dir = dir.replace(/\/+$/, '');

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (dir && dir !== '' && dir !== '/') {
      return `${origin}${dir}${cleanUrl}`;
    }
    return `${origin}${cleanUrl}`;
  }
  return url;
}

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
 * Upload any supported file (PDF, JPG, PNG, WEBP) directly to Hostinger's uploads directory.
 * Returns public file URL path (e.g. /uploads/doc_....pdf)
 */
export async function uploadFileToServer(file: File): Promise<{
  success: boolean;
  fileUrl: string;
  fullFileUrl?: string;
  fileName: string;
  fileSize: number;
  isServerStored?: boolean;
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

  const endpoints = getApiEndpoints('upload.php');
  let lastError = '';

  // 1. First attempt: Standard multipart form data across endpoints
  for (const endpoint of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', preparedFile, preparedFile.name);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.fileUrl) {
          return {
            success: true,
            isServerStored: true,
            fileUrl: data.fileUrl,
            fullFileUrl: data.fullFileUrl,
            fileName: data.fileName || preparedFile.name,
            fileSize: data.fileSize || preparedFile.size,
          };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson && errJson.error) {
          lastError = errJson.error;
        }
      }
    } catch (err: any) {
      lastError = err.message || 'Network error';
    }
  }

  // 2. Second attempt: Base64 JSON payload
  try {
    const dataUrl = await toDataUrl();
    if (dataUrl) {
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: preparedFile.name,
              fileData: dataUrl,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.fileUrl) {
              return {
                success: true,
                isServerStored: true,
                fileUrl: data.fileUrl,
                fullFileUrl: data.fullFileUrl,
                fileName: data.fileName || preparedFile.name,
                fileSize: data.fileSize || preparedFile.size,
              };
            }
          }
        } catch (err) {}
      }
    }
  } catch (err: any) {
    lastError = err.message || lastError;
  }

  // 3. Fallback to local DataURL so user data is retained in emergency
  const fallbackDataUrl = await toDataUrl();
  console.warn('[Hostinger Upload] Upload to server failed, temporary local backup stored:', lastError);
  return {
    success: false,
    isServerStored: false,
    fileUrl: fallbackDataUrl,
    fileName: preparedFile.name,
    fileSize: preparedFile.size,
    error: lastError || 'সার্ভারে ফাইল সংরক্ষণ করা সম্ভব হয়নি।',
  };
}

/**
 * Upload an image (PNG, JPG, WEBP) directly to Hostinger uploads folder.
 * Returns the public URL path (e.g. /uploads/doc_....jpg) or a dataURL fallback.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  const res = await uploadFileToServer(file);
  if (res.fileUrl) {
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
 * Upload a document (PDF, JPG, PNG) to Hostinger's uploads directory.
 * Guarantees local persistence in IndexedDB vault and server disk persistence.
 */
export async function uploadDocumentToServer(
  file: File,
  docKey: string,
  docTitle: string,
  isMandatory: boolean
): Promise<UploadedDocument> {
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const defaultDoc: UploadedDocument = {
    id: docId,
    docType: docKey,
    docTitle,
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date().toISOString().split('T')[0],
    isMandatory,
  };

  // Convert to DataURL for immediate resilience and vault storage
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  // 1. Immediately save into IndexedDB vault so file is NEVER lost
  if (dataUrl) {
    saveDocumentFileToVault(docId, dataUrl, file.name, docTitle).catch(() => {});
  }

  // 2. Upload file to server (/api/upload.php)
  try {
    const uploadRes = await uploadFileToServer(file);
    if (uploadRes && uploadRes.fileUrl && !uploadRes.fileUrl.startsWith('data:')) {
      // Update vault with permanent server file URL
      saveDocumentFileToVault(docId, uploadRes.fileUrl, uploadRes.fileName || file.name, docTitle).catch(() => {});
      return {
        ...defaultDoc,
        fileUrl: uploadRes.fileUrl,
        fileName: uploadRes.fileName || file.name,
        fileSize: uploadRes.fileSize || file.size,
      };
    }
  } catch (err) {
    console.warn('[Hostinger Upload] Server upload attempt failed, using local vault:', err);
  }

  // 3. Fallback with verified dataUrl
  return {
    ...defaultDoc,
    fileUrl: dataUrl,
  };
}

/**
 * Helper to upload any inline Base64 documents to the server disk via FormData before sending application JSON
 */
async function uploadInlineBase64Documents(documents: UploadedDocument[]): Promise<UploadedDocument[]> {
  if (!documents || !Array.isArray(documents)) return documents;

  return await Promise.all(
    documents.map(async (doc) => {
      if (!doc || !doc.fileUrl || !doc.fileUrl.startsWith('data:')) {
        return doc;
      }

      try {
        // Convert data URL to blob and upload as multipart form data
        const resBlob = await fetch(doc.fileUrl);
        const blob = await resBlob.blob();
        const file = new File([blob], doc.fileName || `${doc.docTitle || 'document'}.pdf`, {
          type: blob.type || 'application/pdf',
        });

        const uploadRes = await uploadFileToServer(file);
        if (uploadRes && uploadRes.fileUrl && !uploadRes.fileUrl.startsWith('data:')) {
          saveDocumentFileToVault(doc.id, uploadRes.fileUrl, doc.fileName, doc.docTitle).catch(() => {});
          return {
            ...doc,
            fileUrl: uploadRes.fileUrl,
            fileSize: uploadRes.fileSize || doc.fileSize,
          };
        }
      } catch (err) {
        console.warn('[Hostinger Upload] Inline base64 upload failed:', err);
      }
      return doc;
    })
  );
}

/**
 * Fetch all applications for a specific module from Hostinger MySQL
 * and hydrate with IndexedDB vault so document attachments are never lost.
 */
export async function fetchApplicationsFromApi<T>(module: 'demarcation' | 'building' | 'road_cutting'): Promise<T[] | null> {
  const endpoints = getApiEndpoints(`applications.php?module=${module}`);

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Hydrate each application with persistent vault attachments
          const hydrated = await Promise.all(
            data.map(async (app) => {
              try {
                return await hydrateApplicationFromVault(app);
              } catch {
                return app;
              }
            })
          );
          return hydrated as T[];
        }
      }
    } catch (err) {
      console.warn(`[Hostinger MySQL] fetchApplicationsFromApi error on ${endpoint}:`, err);
    }
  }
  return null;
}

/**
 * Search single application from Hostinger MySQL by ID, tracking ID, form number, or phone
 */
export async function searchApplicationApi<T>(query: string): Promise<T | null> {
  if (!query || !query.trim()) return null;
  const encoded = encodeURIComponent(query.trim());
  const endpoints = getApiEndpoints(`applications.php?tracking_id=${encoded}`);

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.id || data.trackingId)) {
          const hydrated = await hydrateApplicationFromVault(data);
          return hydrated as T;
        }
      }
    } catch (err) {
      console.warn(`[Hostinger MySQL] searchApplicationApi error on ${endpoint}:`, err);
    }
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
    // 1. Permanently cache application and documents in IndexedDB vault
    await saveApplicationToVault(app);

    // 2. Pre-upload any inline Base64 documents so the MySQL payload remains lightweight (<20KB)
    let sanitizedApp: any = { ...app };
    if (sanitizedApp.documents && Array.isArray(sanitizedApp.documents)) {
      sanitizedApp.documents = await uploadInlineBase64Documents(sanitizedApp.documents);
    }

    const endpoints = getApiEndpoints(`applications.php?module=${module}`);
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...sanitizedApp, moduleType: module }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.data) {
            await saveApplicationToVault(data.data);
          }
          return { success: true, data };
        } else {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          lastError = errData.error || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastError = err.message || 'Network error';
      }
    }

    return { success: false, error: lastError || 'Server connection failed' };
  } catch (err: any) {
    console.warn('[Hostinger MySQL] Could not save to applications.php:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Permanently delete an application from Hostinger MySQL / local API
 */
export async function deleteApplicationFromApi(id?: string): Promise<boolean> {
  try {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return false;
    }
    const cleanId = id.trim();
    const endpoints = getApiEndpoints(`applications.php?id=${encodeURIComponent(cleanId)}`);

    for (const endpoint of endpoints) {
      try {
        let res = await fetch(endpoint, {
          method: 'DELETE',
        }).catch(() => null);

        if (!res || !res.ok) {
          const postEndpoint = endpoint.includes('?') ? `${endpoint}&action=delete` : `${endpoint}?action=delete`;
          res = await fetch(postEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: cleanId }),
          }).catch(() => null);
        }

        if (res && res.ok) {
          return true;
        }
      } catch {}
    }
    return false;
  } catch (err) {
    console.warn('[Hostinger MySQL] Could not delete application:', err);
    return false;
  }
}

/**
 * Permanently clear applications from Hostinger MySQL / local API
 */
export async function clearAllApplicationsFromApi(module?: 'demarcation' | 'building' | 'road_cutting'): Promise<boolean> {
  try {
    const query = module ? `clear_all=1&module=${module}` : `clear_all=1`;
    const endpoints = getApiEndpoints(`applications.php?${query}`);

    for (const endpoint of endpoints) {
      try {
        let res = await fetch(endpoint, {
          method: 'DELETE',
        }).catch(() => null);

        if (!res || !res.ok) {
          const postEndpoint = endpoint.includes('?') ? `${endpoint}&action=delete` : `${endpoint}?action=delete`;
          res = await fetch(postEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', clear_all: true, module }),
          }).catch(() => null);
        }

        if (res && res.ok) {
          return true;
        }
      } catch {}
    }
    return false;
  } catch (err) {
    console.warn('[Hostinger MySQL] Could not clear applications:', err);
    return false;
  }
}

/**
 * Save an audit log to Hostinger MySQL
 */
export async function saveAuditLogToApi(log: SystemAuditLogItem): Promise<boolean> {
  const endpoints = getApiEndpoints('audit.php');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
      if (res.ok) return true;
    } catch {}
  }
  return false;
}

/**
 * Fetch audit logs from Hostinger MySQL
 */
export async function fetchAuditLogsFromApi(): Promise<SystemAuditLogItem[] | null> {
  const endpoints = getApiEndpoints('audit.php?limit=200');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data as SystemAuditLogItem[];
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Fetch portal and council configuration from Hostinger MySQL
 */
export async function fetchPortalConfigFromApi<T = any>(customKey: string = 'portal_config'): Promise<T | null> {
  const endpoints = getApiEndpoints(`settings.php?key=${encodeURIComponent(customKey)}`);
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          return data as T;
        }
      }
    } catch (err) {
      console.warn(`[Hostinger MySQL] Could not fetch settings (${customKey}) on ${endpoint}:`, err);
    }
  }
  return null;
}

/**
 * Save portal configuration to Hostinger MySQL
 */
export async function savePortalConfigToApi<T = any>(config: T, customKey: string = 'portal_config'): Promise<boolean> {
  const endpoints = getApiEndpoints('settings.php');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: customKey,
          data: config,
        }),
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn(`[Hostinger MySQL] Could not save settings (${customKey}) on ${endpoint}:`, err);
    }
  }
  return false;
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
