import { DemarcationApplication, NotificationLog, ApplicationStatus } from '../types';
import { toBanglaNumber, formatBanglaDate } from './storage';

export interface EmailTemplate {
  subject: string;
  recipientEmail: string;
  recipientName: string;
  recipientMobile: string;
  applicationId: string;
  statusBengali: string;
  officerDesignation: string;
  officerRemarks?: string;
  htmlContent: string;
  plainText: string;
  sentAt: string;
}

export interface SendAlertResult {
  success: boolean;
  log: NotificationLog;
  emailTemplate?: EmailTemplate;
  message: string;
}

export function getStatusBengali(status: ApplicationStatus | string): string {
  switch (status) {
    case 'pending':
      return 'অপেক্ষমান (Pending)';
    case 'under_review':
      return 'পর্যালোচনাধীন (Under Review)';
    case 'investigating':
      return 'সরজমিন তদন্তাধীন (In-Progress / Field Investigation)';
    case 'approved':
      return 'অনুমোদিত ও সনদ প্রস্তুত (Approved)';
    case 'rejected':
      return 'বাতিল / স্থগিত (Rejected)';
    default:
      return 'প্রক্রিয়াধীন';
  }
}

export function generateStatusMessage(
  app: DemarcationApplication, 
  newStatus: ApplicationStatus | string,
  officerName?: string,
  officerDesignation?: string
): { title: string; body: string; nextSteps: string } {
  const applicantName = app.siteLocation.applicantName || 'শ্রদ্ধেয় নাগরিক';
  const appId = app.id;
  const mouza = app.schedule.mouzaName;
  const ward = app.schedule.wardNo;
  const khatian = app.schedule.bsKhatianNo;
  const dag = app.schedule.bsDagNo;

  switch (newStatus) {
    case 'investigating':
    case 'under_review':
      return {
        title: `সীতাকুণ্ড পৌরসভা: ডিমার্কেশন আবেদন #${appId} সরজমিন তদন্তাধীন (In-Progress)`,
        body: `জনাব ${applicantName}, আপনার ডিমার্কেশন আবেদনটি (আইডি: ${appId}, মৌজা: ${mouza}, ওয়ার্ড নং ${toBanglaNumber(ward)}, বি.এস খতিয়ান: ${toBanglaNumber(khatian)}, বি.এস দাগ: ${toBanglaNumber(dag)}) নক্সাকার কর্তৃক সরজমিন পরিদর্শন ও সীমানা যাচাইয়ের জন্য নথিভুক্ত করা হয়েছে।`,
        nextSteps: 'পৌরসভার সংশ্লিষ্ট সার্ভেয়ার/নক্সাকার সরজমিনে উপস্থিত হওয়ার পূর্বে আপনার উল্লেখিত মোবাইল নম্বরে যোগাযোগ করবেন। অনুগ্রহ করে মূল দলিল ও প্রয়োজনীয় কাগজপত্র প্রস্তুত রাখুন।'
      };
    case 'approved':
      return {
        title: `সীতাকুণ্ড পৌরসভা: ডিমার্কেশন আবেদন #${appId} চূড়ান্ত অনুমোদিত (Approved)`,
        body: `অভিনন্দন জনাব ${applicantName}! আপনার ভূমির ডিমার্কেশন ও সীমানা প্রত্যয়ন আবেদনটি (আইডি: ${appId}) নির্বাহী প্রকৌশলী মহোদয় কর্তৃক সফলভাবে অনুমোদিত হয়েছে এবং ডিজিটাল সনদ প্রস্তুত করা হয়েছে।`,
        nextSteps: 'আপনি এখনই পৌর ডিজিটাল ট্র্যাকিং পোর্টাল থেকে কিউআর-কোড যুক্ত অফিসিয়াল সীমানা প্রত্যয়ন সনদ (A4) ডাউনলোড ও প্রিন্ট করতে পারবেন।'
      };
    case 'rejected':
      return {
        title: `সীতাকুণ্ড পৌরসভা: ডিমার্কেশন আবেদন #${appId} সংক্রান্ত স্থগিতাদেশ (Rejected)`,
        body: `জনাব ${applicantName}, আপনার ডিমার্কেশন আবেদনটি (আইডি: ${appId}) সরজমিন তদন্ত ও রেকর্ড পর্যালোচনা শেষে শর্তপূরণ বা সীমানা বিরোধের কারণে স্থগিত/বাতিল করা হয়েছে।`,
        nextSteps: 'বিস্তারিত কারণ জানতে ট্র্যাকিং পোর্টালে তদন্ত রিপোর্ট দেখুন অথবা সীতাকুণ্ড পৌরসভা প্রকৌশল শাখায় সরাসরি যোগাযোগ করুন।'
      };
    default:
      return {
        title: `সীতাকুণ্ড পৌরসভা: ডিমার্কেশন আবেদন #${appId} স্ট্যাটাস আপডেট`,
        body: `জনাব ${applicantName}, আপনার ভূমির ডিমার্কেশন আবেদনটি (আইডি: ${appId}) প্রকৌশল শাখায় গৃহীত ও অপেক্ষমান রয়েছে।`,
        nextSteps: 'পৌরসভা প্রকৌশল বিভাগে নথিপত্র যাচাই প্রক্রিয়া চলমান রয়েছে।'
      };
  }
}

/**
 * Generate a rich, formatted HTML email template for the applicant
 */
export function generateOfficialEmailTemplate(
  app: DemarcationApplication,
  newStatus: ApplicationStatus | string,
  customNote?: string,
  officerName?: string,
  officerDesignation?: string
): EmailTemplate {
  const { title, body, nextSteps } = generateStatusMessage(app, newStatus, officerName, officerDesignation);
  const applicantName = app.siteLocation.applicantName || 'নাগরিক';
  const recipientEmail = app.siteLocation.applicantEmail || `${app.siteLocation.applicantMobile}@citizen.sitakundacity.gov.bd`;
  const statusBn = getStatusBengali(newStatus);
  const now = new Date().toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const plainText = `
সীতাকুণ্ড পৌরসভা কার্যালয়, চট্টগ্রাম
প্রকৌশল শাখা
---------------------------------------------------------
বিষয়: ${title}

প্রিয় ${applicantName},
${body}

আবেদনের বর্তমান স্থিতি: ${statusBn}
আবেদন ট্র্যাকিং আইডি: ${app.id}
ফরম নম্বর: ${app.formNo || 'N/A'}
মৌজা: ${app.schedule.mouzaName} (জে.এল #${toBanglaNumber(app.schedule.jlNo)})
ওয়ার্ড: ${app.schedule.wardNo}
বি.এস খতিয়ান: ${toBanglaNumber(app.schedule.bsKhatianNo)} | বি.এস দাগ: ${toBanglaNumber(app.schedule.bsDagNo)}
${customNote ? `কর্মকর্তার বিশেষ মন্তব্য: ${customNote}\n` : ''}
পরবর্তী পদক্ষেপ:
${nextSteps}

অনলাইনে স্ট্যাটাস যাচাই করতে ভিজিট করুন: https://sitakundacity.gov.bd/demarcation-tracking?id=${app.id}

ধন্যবাদান্তে,
${officerName || 'দায়িত্বপ্রাপ্ত প্রকৌশলী'}, ${officerDesignation || 'প্রকৌশল বিভাগ'}
সীতাকুণ্ড পৌরসভা, চট্টগ্রাম
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .email-header { background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); color: #ffffff; padding: 24px; text-align: center; }
    .email-header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .email-header p { margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0; }
    .email-body { padding: 24px; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 13px; margin: 12px 0; }
    .status-investigating { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .status-approved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .status-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .status-pending { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .details-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
    .details-table td.label { background: #f8fafc; font-weight: bold; width: 35%; color: #475569; }
    .note-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
    .next-steps-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 13px; }
    .action-btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 12px; }
    .email-footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>সীতাকুণ্ড পৌরসভা কার্যালয়</h1>
      <p>প্রকৌশল শাখা</p>
    </div>
    
    <div class="email-body">
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">জনাব ${applicantName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        ${body}
      </p>

      <div style="text-align: center;">
        <span class="status-badge ${
          newStatus === 'approved' ? 'status-approved' :
          newStatus === 'investigating' || newStatus === 'under_review' ? 'status-investigating' :
          newStatus === 'rejected' ? 'status-rejected' : 'status-pending'
        }">
          আবেদনের বর্তমান স্থিতি: ${statusBn}
        </span>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">আবেদন ট্র্যাকিং আইডি</td>
          <td style="font-family: monospace; font-weight: bold; color: #059669;">${app.id}</td>
        </tr>
        <tr>
          <td class="label">মৌজা ও জে.এল. নং</td>
          <td>${app.schedule.mouzaName} (জে.এল #${toBanglaNumber(app.schedule.jlNo)})</td>
        </tr>
        <tr>
          <td class="label">ওয়ার্ড নং</td>
          <td>${app.schedule.wardNo}</td>
        </tr>
        <tr>
          <td class="label">বি.এস খতিয়ান ও দাগ</td>
          <td>খতিয়ান: <strong>${toBanglaNumber(app.schedule.bsKhatianNo)}</strong>, দাগ: <strong>${toBanglaNumber(app.schedule.bsDagNo)}</strong></td>
        </tr>
        <tr>
          <td class="label">হালনাগাদ সময়</td>
          <td>${now}</td>
        </tr>
      </table>

      ${customNote ? `
      <div class="note-box">
        <strong>কর্মকর্তার মন্তব্য:</strong> ${customNote}
      </div>
      ` : ''}

      <div class="next-steps-box">
        <strong style="color: #166534;">পরবর্তী করণীয় (Next Steps):</strong>
        <p style="margin: 4px 0 0 0; color: #14532d;">${nextSteps}</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="#" class="action-btn">অনলাইন ট্র্যাকিং পোর্টাল দেখুন</a>
      </div>
    </div>

    <div class="email-footer">
      <p style="margin: 0 0 4px 0;">সীতাকুণ্ড পৌরসভা ডিজিটাল ভূমি ডিমার্কেশন ব্যবস্থাপনা সিস্টেম</p>
      <p style="margin: 0;">হেল্পলাইন: ০১৮১৯-০০০০০০ | ইমেইল: demarcation@sitakundacity.gov.bd</p>
    </div>
  </div>
</body>
</html>
`.trim();

  return {
    subject: title,
    recipientEmail,
    recipientName: applicantName,
    recipientMobile: app.siteLocation.applicantMobile,
    applicationId: app.id,
    statusBengali: statusBn,
    officerDesignation: officerDesignation || 'দায়িত্বপ্রাপ্ত কর্মকর্তা',
    officerRemarks: customNote,
    htmlContent,
    plainText,
    sentAt: new Date().toISOString(),
  };
}

/**
 * Sends automated status alert (SMS + Email template) and logs notification
 */
export function sendAutomatedStatusAlert(
  app: DemarcationApplication,
  newStatus: ApplicationStatus | string,
  customNote?: string,
  officerName?: string,
  officerDesignation?: string
): SendAlertResult {
  const { title, body } = generateStatusMessage(app, newStatus, officerName, officerDesignation);
  const fullMessage = customNote ? `${body} (মন্তব্য: ${customNote})` : body;

  const pref = app.notificationPreferences || { notifySms: true, notifyEmail: true };
  const hasEmail = Boolean(app.siteLocation.applicantEmail);
  const type: 'sms' | 'email' | 'both' = pref.notifyEmail && hasEmail && pref.notifySms ? 'both' : pref.notifyEmail && hasEmail ? 'email' : 'sms';

  const emailTemplate = generateOfficialEmailTemplate(app, newStatus, customNote, officerName, officerDesignation);

  const log: NotificationLog = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type,
    recipientPhone: app.siteLocation.applicantMobile,
    recipientEmail: app.siteLocation.applicantEmail || `${app.siteLocation.applicantMobile}@citizen.sitakundacity.gov.bd`,
    title,
    message: fullMessage,
    status: 'delivered',
  };

  return {
    success: true,
    log,
    emailTemplate,
    message: `আবেদনকারী (${app.siteLocation.applicantName})-কে সফলভাবে স্বয়ংক্রিয় ইমেইল ও এসএমএস নোটিফিকেশন প্রেরণ করা হয়েছে।`,
  };
}
