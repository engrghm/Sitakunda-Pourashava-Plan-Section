import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { LandApplication } from './src/types.ts';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Configure body parsers with limit to handle PDF/image base64 document attachments
app.use(express.json({ limit: '50mb' }));
app.use('/documents', express.static(path.join(process.cwd(), 'public', 'documents')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Local upload handler for /api/upload.php and /api/upload
app.post(['/api/upload.php', '/api/upload'], (req, res) => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const chunks: Buffer[] = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    try {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      
      let fileName = `doc_${Date.now()}.pdf`;
      let fileBuffer = buffer;

      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';
        if (boundary) {
          const boundaryBuf = Buffer.from('--' + boundary);
          const parts: Buffer[] = [];
          let start = buffer.indexOf(boundaryBuf);
          while (start !== -1) {
            const next = buffer.indexOf(boundaryBuf, start + boundaryBuf.length);
            if (next !== -1) {
              parts.push(buffer.subarray(start + boundaryBuf.length, next));
              start = next;
            } else {
              break;
            }
          }

          for (const part of parts) {
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
        }
      }

      const ext = path.extname(fileName) || '.pdf';
      const cleanPrefix = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
      const uniqueName = `doc_${Date.now()}_${cleanPrefix}${ext}`;
      const targetPath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(targetPath, fileBuffer);
      const fileUrl = `/uploads/${uniqueName}`;
      res.json({
        success: true,
        fileUrl,
        fileName,
        fileSize: fileBuffer.length,
        uploadedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Upload error' });
    }
  });
});

// Official Gazette PDF Upload endpoint
app.post('/api/upload-gazette', (req, res) => {
  try {
    const { docId, fileName, fileData } = req.body || {};
    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing file data or fileName' });
    }
    const documentsDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    const ext = path.extname(fileName) || '.pdf';
    const cleanDocId = (docId || 'gazette').replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetFileName = `${cleanDocId}_${Date.now()}${ext}`;
    const targetPath = path.join(documentsDir, targetFileName);

    const base64Data = fileData.includes(';base64,') ? fileData.split(';base64,')[1] : fileData;
    fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/documents/${targetFileName}`;
    console.log(`[Gazette Upload] Saved ${targetFileName} to public/documents -> ${fileUrl}`);
    res.json({ success: true, fileUrl, fileName: targetFileName });
  } catch (err: any) {
    console.error('[Gazette Upload Error]', err);
    res.status(500).json({ error: err.message || 'Failed to save gazette PDF' });
  }
});

// Keep administrator credentials on the server; set ADMIN_USERNAME and
// ADMIN_PASSWORD in production. Sessions expire automatically after 8 hours.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Engr.Masum';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sharmin2023';
const adminSessions = new Map<string, number>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.header('x-admin-session') || '';
  const expiresAt = adminSessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = randomBytes(32).toString('hex');
  adminSessions.set(token, Date.now() + SESSION_TTL_MS);
  res.json({ token, expiresIn: SESSION_TTL_MS });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminSessions.delete(req.header('x-admin-session') || '');
  res.status(204).end();
});

// Nodemailer SMTP configured connections or sandboxed Ethereal fallback helper
const getMailTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // Live sandbox test credentials
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    // Plain console logger fallback
    return {
      sendMail: async (options: any) => {
        console.log('============= [CONSOLE LOG MOCK EMAIL] =============');
        console.log(`FROM: ${options.from}`);
        console.log(`TO: ${options.to}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`BODY: ${options.text}`);
        console.log('======================================================');
        return { messageId: `local-mock-${Date.now()}` };
      }
    } as any;
  }
};

// Compile and dispatch status alert email
async function sendApplicationStatusEmail(landApp: LandApplication) {
  const applicantName = landApp.applicantName || landApp.siteLocation?.applicantName || 'Applicant';
  const recipient = landApp.applicantEmail || landApp.siteLocation?.applicantEmail || 'engr.ghm@gmail.com'; 
  console.log(`[Email Alert] Status notifying applicant ${applicantName} (${recipient}) for tracker ${landApp.id}...`);

  try {
    const transporter = await getMailTransporter();
    
    let statusLabelBg = '#f1f5f9';
    let statusLabelText = '#475569';
    let statusLabelBn = 'Pending';
    
    const s = String(landApp.status).toLowerCase();
    if (s === 'approved') {
      statusLabelBg = '#ecfdf5';
      statusLabelText = '#047857';
      statusLabelBn = 'Approved';
    } else if (s === 'rejected') {
      statusLabelBg = '#fef2f2';
      statusLabelText = '#b91c1c';
      statusLabelBn = 'Rejected';
    } else if (s === 'under_review' || s === 'investigating' || s === 'under review') {
      statusLabelBg = '#fffbeb';
      statusLabelText = '#b45309';
      statusLabelBn = 'Under Review';
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const statusPageUrl = `${appUrl}/?track=${encodeURIComponent(landApp.id)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Land Demarcation Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 30px 20px; text-align: center; border-bottom: 4px solid #f97316; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; }
          .header p { color: #a7f3d0; margin: 5px 0 0 0; font-size: 13px; }
          .content { padding: 30px 25px; }
          .status-container { background-color: ${statusLabelBg}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px; }
          .status-badge { font-size: 18px; font-weight: bold; color: ${statusLabelText}; }
          .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
          .btn-primary { display: inline-block; background-color: #047857; color: #ffffff !important; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sitakunda Pourashava</h1>
            <p>Land Demarcation & Ownership Verification Portal</p>
          </div>
          <div class="content">
            <p>Dear ${applicantName},</p>
            <p>Your land demarcation application status has been updated:</p>
            <div class="status-container">
              <span class="status-badge">${statusLabelBn}</span>
            </div>
            <div class="details-card">
              <p><strong>Tracking ID:</strong> ${landApp.id}</p>
              <p><strong>Mouza:</strong> ${landApp.mouzaName || landApp.schedule?.mouzaName || '-'}</p>
              <p><strong>BS Dag No:</strong> ${landApp.bsDagNo || landApp.schedule?.bsDagNo || '-'}</p>
            </div>
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${statusPageUrl}" target="_blank" class="btn-primary">View Application Details</a>
            </div>
          </div>
          <div class="footer">
            <p>Sitakunda Municipality, Chattogram</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromAddress = process.env.SMTP_FROM || '"Sitakunda Pourashava" <no-reply@sitakunda.gov.bd>';
    const mailOptions = {
      from: fromAddress,
      to: recipient,
      subject: `[${landApp.id}] Application Status Update - Sitakunda Municipality`,
      text: `Dear ${applicantName},\n\nYour application (${landApp.id}) status is: ${statusLabelBn}.\nTrack link: ${statusPageUrl}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Alert] Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email Alert Error]', error);
  }
}

// Data storage configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to write submissions
const getSubmissions = (): LandApplication[] => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveSubmissions = (data: LandApplication[]) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// API Endpoints

// 1. Get all submissions
app.get('/api/submissions', (req, res) => {
  try {
    const data = getSubmissions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// 2. Submit new application
app.post('/api/submissions', (req, res) => {
  try {
    const submissions = getSubmissions();
    const newApp: LandApplication = req.body;
    
    const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNo = Math.floor(1000 + Math.random() * 9000);
    newApp.id = newApp.id || `APP-${dateSegment}-${randNo}`;
    newApp.formNo = newApp.formNo || `SP-${randNo}-${submissions.length + 1}`;
    newApp.formPrice = newApp.formPrice || 100;
    newApp.createdAt = newApp.createdAt || new Date().toISOString();
    newApp.status = newApp.status || 'pending';
    newApp.adminRemarks = newApp.adminRemarks || '';

    submissions.push(newApp);
    saveSubmissions(submissions);
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
});

// 3. Update Status
app.put('/api/submissions/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;
    const submissions = getSubmissions();
    const targetIdx = submissions.findIndex(item => item.id === id);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    submissions[targetIdx].status = status;
    submissions[targetIdx].adminRemarks = adminRemarks || '';
    
    saveSubmissions(submissions);

    sendApplicationStatusEmail(submissions[targetIdx]).catch(mailErr => {
      console.error('[Nodemailer Alert Trigger Error]', mailErr);
    });

    res.json(submissions[targetIdx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// 4. Return database schematic layout structures & config
app.get('/api/db-schemas', (req, res) => {
  res.json([
    {
      title: 'PostgreSQL Schema (Drizzle SQL)',
      description: 'Production-ready highly structured PostgreSQL model using Drizzle ORM.',
      language: 'typescript',
      code: 'export const landApplications = pgTable("land_applications", { id: text("id").primaryKey() });'
    },
    {
      title: 'MongoDB Mongoose Schema & S3 Configuration',
      description: 'Flexible NoSQL model optimized for Document attachments.',
      language: 'typescript',
      code: 'export const LandApplicationModel = mongoose.model("LandApplication", LandApplicationSchema);'
    }
  ]);
});

// 5. Portal settings endpoints for local Node development
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const getSettingsMap = (): Record<string, any> => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
};

app.get(['/api/settings.php', '/api/settings'], (req, res) => {
  const key = (req.query.key as string) || 'portal_config';
  const settings = getSettingsMap();
  res.json(settings[key] || null);
});

app.post(['/api/settings.php', '/api/settings'], (req, res) => {
  try {
    const { key, data } = req.body || {};
    const settingKey = key || 'portal_config';
    const settings = getSettingsMap();
    settings[settingKey] = data;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    res.json({ success: true, updated_at: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save settings' });
  }
});

// 6. Applications endpoints for full local development parity
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications_db.json');
const getApplicationsList = (): any[] => {
  try {
    if (fs.existsSync(APPLICATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
};

const saveApplicationsList = (list: any[]) => {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
};

app.get(['/api/applications.php', '/api/applications'], (req, res) => {
  try {
    const { id, tracking_id, q, search, module: moduleType } = req.query;
    const lookup = ((id || tracking_id || q || search) as string || '').trim().toLowerCase();
    const list = getApplicationsList();

    if (lookup) {
      const found = list.find((item: any) => {
        const itemId = (item.id || item.trackingId || '').toLowerCase();
        const formNo = (item.formNo || '').toLowerCase();
        const phone = (item.siteLocation?.applicantMobile || item.applicantMobile || item.applicantPhone || '').toLowerCase();
        const nid = (item.siteLocation?.applicantNid || item.applicantNid || '').toLowerCase();
        return itemId === lookup || formNo === lookup || phone.includes(lookup) || nid.includes(lookup);
      });

      if (found) {
        return res.json(found);
      } else {
        return res.status(404).json({ error: 'Application not found' });
      }
    }

    if (moduleType) {
      const filtered = list.filter((item: any) => (item.moduleType || 'demarcation') === moduleType);
      return res.json(filtered);
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query applications' });
  }
});

app.post(['/api/applications.php', '/api/applications'], (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id) {
      return res.status(400).json({ error: 'Missing application ID' });
    }

    const list = getApplicationsList();
    const existingIndex = list.findIndex((item: any) => item.id === payload.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...payload };
    } else {
      list.unshift(payload);
    }

    saveApplicationsList(list);
    res.status(201).json({ success: true, id: payload.id, data: payload });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save application' });
  }
});

app.put(['/api/applications.php', '/api/applications'], (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id) {
      return res.status(400).json({ error: 'Missing application ID' });
    }

    const list = getApplicationsList();
    const existingIndex = list.findIndex((item: any) => item.id === payload.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...payload };
      saveApplicationsList(list);
      return res.json({ success: true, id: payload.id, data: list[existingIndex] });
    } else {
      return res.status(404).json({ error: 'Application not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update application' });
  }
});

app.delete(['/api/applications.php', '/api/applications'], (req, res) => {
  try {
    const id = req.query.id as string;
    const clearAll = req.query.clear_all as string;
    const moduleType = req.query.module as string;
    let list = getApplicationsList();

    if (clearAll === 'true' || clearAll === '1') {
      if (moduleType) {
        list = list.filter((item: any) => (item.moduleType || 'demarcation') !== moduleType);
      } else {
        list = [];
      }
    } else if (id) {
      list = list.filter((item: any) => item.id !== id && item.trackingId !== id);
    }

    saveApplicationsList(list);
    return res.json({ success: true, deletedId: id, totalRemaining: list.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete application' });
  }
});


// Configure Vite integration as middleware in development or direct static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Land Demarcation Verification backend listening on port ${PORT} -> http://localhost:${PORT}`);
  });

  if (PORT !== 80) {
    try {
      const server80 = app.listen(80, '0.0.0.0', () => {
        console.log(`[Server] Also listening on default HTTP port 80 -> http://localhost/`);
      });
      server80.on('error', (err: any) => {
        console.log(`[Server] Port 80 not available (${err.code || err.message}). Please use http://localhost:${PORT}`);
      });
    } catch (e: any) {
      console.log(`[Server] Port 80 binding error: ${e.message}`);
    }
  }
}

startServer();