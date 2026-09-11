/**
 * IndexedDB Persistent Storage for Sitakunda Pourashava Portal
 * Guarantees that client attached documents, maps, deeds, and blueprints
 * never disappear due to localStorage quota limits (5MB) or network sync overwrites.
 */

import { UploadedDocument } from '../types';

const DB_NAME = 'sitakunda_portal_vault_v1';
const DB_VERSION = 1;
const STORE_DOCUMENTS = 'attached_documents';
const STORE_APPLICATIONS = 'applications_vault';

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
        db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_APPLICATIONS)) {
        db.createObjectStore(STORE_APPLICATIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result as IDBDatabase);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

/**
 * Save a document's file data (Data URL, Blob, or URL) permanently into IndexedDB
 */
export async function saveDocumentFileToVault(
  docId: string,
  fileUrl: string,
  fileName: string,
  docTitle?: string
): Promise<void> {
  if (!docId || !fileUrl) return;
  try {
    const db = await openVaultDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORE_DOCUMENTS);
      const record = {
        id: docId,
        fileUrl,
        fileName,
        docTitle: docTitle || fileName,
        savedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB Vault] Could not save document to vault:', err);
  }
}

/**
 * Retrieve a document's file URL from IndexedDB
 */
export async function getDocumentFileFromVault(docId: string): Promise<string | null> {
  if (!docId) return null;
  try {
    const db = await openVaultDb();
    return await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORE_DOCUMENTS);
      const req = store.get(docId);
      req.onsuccess = () => {
        if (req.result && req.result.fileUrl) {
          resolve(req.result.fileUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save a full application backup into IndexedDB
 */
export async function saveApplicationToVault(application: any): Promise<void> {
  if (!application || !application.id) return;
  try {
    const db = await openVaultDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_APPLICATIONS, 'readwrite');
      const store = tx.objectStore(STORE_APPLICATIONS);
      const req = store.put({
        id: application.id,
        appData: application,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Also index each document inside the application into document store
    if (application.documents && Array.isArray(application.documents)) {
      for (const doc of application.documents) {
        if (doc && doc.id && doc.fileUrl) {
          await saveDocumentFileToVault(doc.id, doc.fileUrl, doc.fileName, doc.docTitle);
        }
      }
    }
  } catch (err) {
    console.warn('[IndexedDB Vault] Could not save application to vault:', err);
  }
}

/**
 * Retrieve an application from IndexedDB
 */
export async function getApplicationFromVault(id: string): Promise<any | null> {
  if (!id) return null;
  try {
    const db = await openVaultDb();
    return await new Promise<any | null>((resolve) => {
      const tx = db.transaction(STORE_APPLICATIONS, 'readonly');
      const store = tx.objectStore(STORE_APPLICATIONS);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.appData) {
          resolve(req.result.appData);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Hydrate document list: If any document's fileUrl is empty or stripped,
 * restore it from the persistent IndexedDB vault.
 */
export async function hydrateDocumentsFromVault(docs: UploadedDocument[]): Promise<UploadedDocument[]> {
  if (!docs || !Array.isArray(docs)) return docs;

  const hydrated = await Promise.all(
    docs.map(async (doc) => {
      if (!doc) return doc;
      if (!doc.fileUrl || doc.fileUrl === '') {
        const storedUrl = await getDocumentFileFromVault(doc.id);
        if (storedUrl) {
          return { ...doc, fileUrl: storedUrl };
        }
      } else if (doc.fileUrl) {
        // Cache present fileUrl into vault for future resilience
        saveDocumentFileToVault(doc.id, doc.fileUrl, doc.fileName, doc.docTitle).catch(() => {});
      }
      return doc;
    })
  );

  return hydrated;
}

/**
 * Hydrate an entire application from IndexedDB vault
 */
export async function hydrateApplicationFromVault<T extends { id: string; documents?: UploadedDocument[] }>(
  app: T
): Promise<T> {
  if (!app) return app;

  let hydratedApp = { ...app };

  // Check if vault has a richer copy
  const vaulted = await getApplicationFromVault(app.id);
  if (vaulted && vaulted.documents && Array.isArray(vaulted.documents)) {
    const vaultedDocMap = new Map<string, UploadedDocument>();
    vaulted.documents.forEach((d: UploadedDocument) => {
      if (d && d.id && d.fileUrl) vaultedDocMap.set(d.id, d);
    });

    if (hydratedApp.documents && Array.isArray(hydratedApp.documents)) {
      hydratedApp.documents = hydratedApp.documents.map((d) => {
        if ((!d.fileUrl || d.fileUrl === '') && vaultedDocMap.has(d.id)) {
          return { ...d, fileUrl: vaultedDocMap.get(d.id)!.fileUrl };
        }
        return d;
      });
    }
  }

  if (hydratedApp.documents && Array.isArray(hydratedApp.documents)) {
    hydratedApp.documents = await hydrateDocumentsFromVault(hydratedApp.documents);
  }

  return hydratedApp;
}
