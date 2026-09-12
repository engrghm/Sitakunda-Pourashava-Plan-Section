import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function localBackendPlugin(): Plugin {
  return {
    name: 'local-backend-api',
    configureServer(server) {
      const DATA_DIR = path.join(process.cwd(), 'data');
      const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
      const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications_db.json');
      const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
      const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

      const getApplications = (): any[] => {
        try {
          if (fs.existsSync(APPLICATIONS_FILE)) {
            return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf-8'));
          }
        } catch {}
        return [];
      };

      const saveApplications = (list: any[]) => {
        try {
          fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
        } catch (err) {
          console.error('[Vite Backend] Failed to save applications:', err);
        }
      };

      const extractBase64ToUploads = (dataUrl: string, origName: string): string => {
        if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
        try {
          const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) return dataUrl;
          const mime = match[1];
          const base64 = match[2];
          let ext = '.pdf';
          if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
          else if (mime.includes('png')) ext = '.png';
          else if (mime.includes('webp')) ext = '.webp';

          const cleanPrefix = path.basename(origName || 'doc', path.extname(origName || 'doc')).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
          const uniqueName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanPrefix}${ext}`;
          const filePath = path.join(UPLOADS_DIR, uniqueName);
          fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
          return `/uploads/${uniqueName}`;
        } catch {
          return dataUrl;
        }
      };

      const sanitizePayloadDocuments = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
          obj.forEach(item => sanitizePayloadDocuments(item));
        } else {
          if (obj.fileUrl && typeof obj.fileUrl === 'string' && obj.fileUrl.startsWith('data:')) {
            obj.fileUrl = extractBase64ToUploads(obj.fileUrl, obj.fileName || obj.docTitle || 'document');
          }
          if (obj.dataUrl && typeof obj.dataUrl === 'string' && obj.dataUrl.startsWith('data:')) {
            obj.dataUrl = extractBase64ToUploads(obj.dataUrl, obj.fileName || 'document');
          }
          if (obj.imageUrl && typeof obj.imageUrl === 'string' && obj.imageUrl.startsWith('data:')) {
            obj.imageUrl = extractBase64ToUploads(obj.imageUrl, obj.name || 'council_photo');
          }
          if (obj.leaderImageUrl && typeof obj.leaderImageUrl === 'string' && obj.leaderImageUrl.startsWith('data:')) {
            obj.leaderImageUrl = extractBase64ToUploads(obj.leaderImageUrl, 'administrator_photo');
          }
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
              sanitizePayloadDocuments(obj[key]);
            }
          });
        }
      };

      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        const pathname = urlObj.pathname;

        // 1. Upload Handler
        if (req.method === 'POST' && (pathname === '/api/upload.php' || pathname === '/api/upload' || pathname.endsWith('/api/upload.php') || pathname.endsWith('/api/upload'))) {
          const chunks: Buffer[] = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';
              let fileName = `doc_${Date.now()}.pdf`;
              let fileBuffer = buffer;

              if (contentType.includes('application/json')) {
                const parsed = JSON.parse(buffer.toString('utf-8'));
                if (parsed.fileData) {
                  fileName = parsed.fileName || fileName;
                  const ext = path.extname(fileName) || '.pdf';
                  const cleanPrefix = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
                  const uniqueName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanPrefix}${ext}`;
                  const filePath = path.join(UPLOADS_DIR, uniqueName);
                  const base64Data = parsed.fileData.includes(',') ? parsed.fileData.split(',')[1] : parsed.fileData;
                  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({
                    success: true,
                    fileUrl: `/uploads/${uniqueName}`,
                    fileName,
                    fileSize: fs.statSync(filePath).size,
                    uploadedAt: new Date().toISOString()
                  }));
                }
              }

              if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';
                if (boundary) {
                  const boundaryBuf = Buffer.from('--' + boundary);
                  let start = buffer.indexOf(boundaryBuf);
                  while (start !== -1) {
                    const nextStart = buffer.indexOf(boundaryBuf, start + boundaryBuf.length);
                    if (nextStart !== -1) {
                      const part = buffer.subarray(start + boundaryBuf.length, nextStart);
                      const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
                      if (headerEnd !== -1) {
                        const headerStr = part.subarray(0, headerEnd).toString('utf-8');
                        const fnMatch = headerStr.match(/filename="([^"]+)"/i);
                        if (fnMatch) {
                          fileName = fnMatch[1];
                          let body = part.subarray(headerEnd + 4);
                          if (body.length >= 2 && body.subarray(-2).toString() === '\r\n') {
                            body = body.subarray(0, body.length - 2);
                          }
                          fileBuffer = body;
                          break;
                        }
                      }
                    }
                    start = nextStart;
                  }
                }
              }

              const ext = path.extname(fileName) || '.pdf';
              const cleanPrefix = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
              const uniqueName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanPrefix}${ext}`;
              const filePath = path.join(UPLOADS_DIR, uniqueName);
              fs.writeFileSync(filePath, fileBuffer);

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: true,
                fileUrl: `/uploads/${uniqueName}`,
                fileName,
                fileSize: fileBuffer.length,
                uploadedAt: new Date().toISOString()
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message || 'Upload error' }));
            }
          });
          return;
        }

        // 2. Applications GET / POST / PUT
        if (pathname === '/api/applications.php' || pathname === '/api/applications' || pathname.endsWith('/api/applications.php') || pathname.endsWith('/api/applications')) {
          if (req.method === 'GET') {
            const id = urlObj.searchParams.get('id') || urlObj.searchParams.get('tracking_id') || urlObj.searchParams.get('q') || urlObj.searchParams.get('search');
            const moduleType = urlObj.searchParams.get('module');
            const list = getApplications();

            if (id) {
              const cleanLookup = id.trim().toLowerCase();
              const found = list.find((item: any) => {
                const itemId = (item.id || item.trackingId || '').toLowerCase();
                const formNo = (item.formNo || '').toLowerCase();
                const phone = (item.siteLocation?.applicantMobile || item.applicantMobile || item.applicantPhone || '').toLowerCase();
                return itemId === cleanLookup || formNo === cleanLookup || phone.includes(cleanLookup);
              });
              res.setHeader('Content-Type', 'application/json');
              if (found) return res.end(JSON.stringify(found));
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Application not found' }));
            }

            if (moduleType) {
              const filtered = list.filter((item: any) => (item.moduleType || 'demarcation') === moduleType);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(filtered));
            }

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(list));
          }

          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
              try {
                const payload = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
                const isDelete = payload?.action === 'delete' || urlObj.searchParams.get('action') === 'delete' || urlObj.searchParams.get('clear_all') || payload?.clear_all;

                if (isDelete) {
                  const id = (urlObj.searchParams.get('id') || payload?.id || '').trim();
                  const clearAll = urlObj.searchParams.get('clear_all') || payload?.clear_all;
                  const moduleType = urlObj.searchParams.get('module') || payload?.module;
                  let list = getApplications();

                  if (clearAll === 'true' || clearAll === '1' || clearAll === true || clearAll === 1) {
                    if (moduleType) {
                      list = list.filter((item: any) => (item.moduleType || 'demarcation') !== moduleType);
                    } else {
                      list = [];
                    }
                  } else if (id) {
                    const target = id.toLowerCase();
                    list = list.filter((item: any) => {
                      const iId = (item.id || '').trim().toLowerCase();
                      const tId = (item.trackingId || '').trim().toLowerCase();
                      const fNo = (item.formNo || '').trim().toLowerCase();
                      return iId !== target && tId !== target && fNo !== target;
                    });
                  }

                  saveApplications(list);
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: true, deletedId: id, totalRemaining: list.length }));
                }

                if (!payload || !payload.id) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ error: 'Missing application ID' }));
                }

                // Automatically extract and save any attached Base64 files to disk
                sanitizePayloadDocuments(payload);

                const list = getApplications();
                const existingIndex = list.findIndex((item: any) => item.id === payload.id);
                if (existingIndex >= 0) {
                  list[existingIndex] = { ...list[existingIndex], ...payload };
                } else {
                  list.unshift(payload);
                }

                saveApplications(list);
                res.statusCode = req.method === 'POST' ? 201 : 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, id: payload.id, data: payload }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message || 'Error processing application' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const id = (urlObj.searchParams.get('id') || '').trim();
            const clearAll = urlObj.searchParams.get('clear_all');
            const moduleType = urlObj.searchParams.get('module');
            let list = getApplications();

            if (clearAll === 'true' || clearAll === '1') {
              if (moduleType) {
                list = list.filter((item: any) => (item.moduleType || 'demarcation') !== moduleType);
              } else {
                list = [];
              }
            } else if (id) {
              const target = id.toLowerCase();
              list = list.filter((item: any) => {
                const iId = (item.id || '').trim().toLowerCase();
                const tId = (item.trackingId || '').trim().toLowerCase();
                const fNo = (item.formNo || '').trim().toLowerCase();
                return iId !== target && tId !== target && fNo !== target;
              });
            }

            saveApplications(list);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, deletedId: id, totalRemaining: list.length }));
          }
        }

        // 3. Settings GET / POST
        if (pathname === '/api/settings.php' || pathname === '/api/settings' || pathname.endsWith('/api/settings.php') || pathname.endsWith('/api/settings')) {
          if (req.method === 'GET') {
            const key = urlObj.searchParams.get('key') || 'portal_config';
            try {
              if (fs.existsSync(SETTINGS_FILE)) {
                const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
                if (settings[key]) {
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify(settings[key]));
                }
              }
            } catch {}
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(null));
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
                let settings: any = {};
                if (fs.existsSync(SETTINGS_FILE)) {
                  try { settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')); } catch {}
                }
                const key = body.key || 'portal_config';
                if (body.data) {
                  sanitizePayloadDocuments(body.data);
                }
                settings[key] = body.data;
                fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        // 4. Audit Logs GET / POST
        if (pathname === '/api/audit.php' || pathname === '/api/audit' || pathname.endsWith('/api/audit.php') || pathname.endsWith('/api/audit')) {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(AUDIT_FILE)) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(fs.readFileSync(AUDIT_FILE, 'utf-8'));
              }
            } catch {}
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify([]));
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
              try {
                const logItem = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
                let logs: any[] = [];
                if (fs.existsSync(AUDIT_FILE)) {
                  try { logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8')); } catch {}
                }
                logs.unshift({ ...logItem, id: logItem.id || `audit-${Date.now()}` });
                fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs.slice(0, 500), null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        // 5. Download Handler GET
        if (pathname === '/api/download.php' || pathname === '/api/download' || pathname.endsWith('/api/download.php') || pathname.endsWith('/api/download')) {
          const fileParam = urlObj.searchParams.get('file') || '';
          const nameParam = urlObj.searchParams.get('name') || fileParam;
          const cleanFile = path.basename(fileParam.replace(/\\/g, '/'));
          const targetPath = path.join(UPLOADS_DIR, cleanFile);

          if (cleanFile && fs.existsSync(targetPath)) {
            const ext = path.extname(cleanFile).toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === '.pdf') mimeType = 'application/pdf';
            else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.webp') mimeType = 'image/webp';

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nameParam || cleanFile)}"`);
            return fs.createReadStream(targetPath).pipe(res);
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'File not found' }));
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [localBackendPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
