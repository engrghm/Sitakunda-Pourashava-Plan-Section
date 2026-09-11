export type LegalDocId = 
  | 'rules1996' 
  | 'act1952' 
  | 'pourashava2009' 
  | 'openspace2000' 
  | 'fire2003'
  | 'envAct1995'
  | 'envRules2023'
  | 'highwayAct2021'
  | 'bnbc2020Part1'
  | 'bnbc2020Part2';

export interface LegalDocumentItem {
  id: LegalDocId;
  title: string;
  category: string;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  isCustom?: boolean;
  badgeColor: string;
}

export const DEFAULT_LEGAL_DOCUMENTS: LegalDocumentItem[] = [
  {
    id: 'rules1996',
    title: 'ইমারত নির্মাণ বিধিমালা, ১৯৯৬',
    category: 'গেজেট বিধিমালা',
    year: '১৯৯৬',
    description: 'বিধি ১-৩০, নকশা প্রণয়নকারীর যোগ্যতা, উন্মুক্ত স্থান (সেটব্যাক) ও তফসিল-২ সরকারি ফি তালিকা।',
    fileUrl: '/documents/building-construction-rules-1996.pdf',
    fileName: 'ইমারত_নির্মাণ_বিধিমালা_১৯৯৬.pdf',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'act1952',
    title: 'ইমারত নির্মাণ আইন, ১৯৫২',
    category: 'মূল আইন',
    year: '১৯৫২',
    description: 'ধারা ১-২০, ৩ বৎসরের অনুমোদন মেয়াদ, অননুমোদিত নির্মাণ অপসারণ ও দণ্ডাদেশ সংক্রান্ত বিধানাবলী।',
    fileUrl: '/documents/building-construction-act-1952.pdf',
    fileName: 'ইমারত_নির্মাণ_আইন_১৯৫২.pdf',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'pourashava2009',
    title: 'স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯',
    category: 'পৌরসভা আইন',
    year: '২০০৯',
    description: 'পৌর এলাকায় ইমারত ও ভূমি নিয়ন্ত্রণ, মহাপরিকল্পনা, ২য় তফসিল ৩৫-৩৭ এবং ৩য় ও ৪র্থ তফসিল।',
    fileUrl: '/documents/local-government-pourashava-act-2009.pdf',
    fileName: 'স্থানীয়_সরকার_পৌরসভা_আইন_২০০৯.pdf',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'openspace2000',
    title: 'উন্মুক্ত স্থান ও জলাধার সংরক্ষণ আইন, ২০০০',
    category: 'পরিবেশ ও জলাধার',
    year: '২০০০',
    description: 'পৌর এলাকার খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান ও প্রাকৃতিক জলাধারের শ্রেণী পরিবর্তন সংক্রান্ত বাধা-নিষেধ।',
    fileUrl: '/documents/open-space-waterbody-act-2000.pdf',
    fileName: 'উন্মুক্ত_স্থান_ও_জলাধার_সংরক্ষণ_আইন_২০০০.pdf',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'fire2003',
    title: 'অগ্নি প্রতিরোধ ও নির্বাপণ আইন, ২০০৩',
    category: 'অগ্নি নিরাপত্তা ও NOC',
    year: '২০০৩',
    description: 'বহুতল (৭+ তলা) ও বাণিজ্যিক ভবনের ফায়ার সার্ভিস ছাড়পত্র (NOC) ও জীবন-সম্পদ নিরাপত্তা বিধান।',
    fileUrl: '/documents/fire-prevention-extinguishment-act-2003.pdf',
    fileName: 'অগ্নি_প্রতিরোধ_ও_নির্বাপণ_আইন_২০০৩.pdf',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'envAct1995',
    title: 'বাংলাদেশ পরিবেশ সংরক্ষণ আইন, ১৯৯৫',
    category: 'পরিবেশ আইন',
    year: '১৯৯৫',
    description: 'পরিবেশ সংরক্ষণ, পরিবেশগত মান উন্নয়ন, দূষণ নিয়ন্ত্রণ ও পরিবেশগত ছাড়পত্র (ECC) সংক্রান্ত আইন।',
    fileUrl: '/documents/bangladesh-environment-conservation-act-1995.pdf',
    fileName: 'বাংলাদেশ_পরিবেশ_সংরক্ষণ_আইন_১৯৯৫.pdf',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'envRules2023',
    title: 'পরিবেশ সংরক্ষণ বিধিমালা, ২০২৩',
    category: 'পরিবেশ বিধিমালা',
    year: '২০২৩',
    description: 'ইমারত, শিল্প ও উন্নয়ন প্রকল্পের পরিবেশগত অবস্থান ছাড়পত্র, পরিবেশগত প্রভাব নিরূপণ (EIA) ও বর্জ্য ব্যবস্থাপনা।',
    fileUrl: '/documents/environment-conservation-rules-2023.pdf',
    fileName: 'পরিবেশ_সংরক্ষণ_বিধিমালা_২০২৩.pdf',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    id: 'highwayAct2021',
    title: 'মহাসড়ক আইন, ২০২১',
    category: 'মহাসড়ক ও সড়ক আইন',
    year: '২০২১',
    description: 'জাতীয়, আঞ্চলিক ও জেলা মহাসড়ক সংরক্ষণ, রাইট অব ওয়ে (ROW), সড়কের উভয়পাশে নির্মাণ সীমানা ও নিয়ন্ত্রণ।',
    fileUrl: '/documents/highway-act-2021.pdf',
    fileName: 'মহাসড়ক_আইন_২০২১.pdf',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'bnbc2020Part1',
    title: 'BNBC 2020 (Part - 01)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-১): সাধারণ ভবন নিয়ন্ত্রণ, প্রশাসনিক বিধান ও সাধারণ নির্দেশিকা।',
    fileUrl: '/documents/bnbc-2020-part-01.pdf',
    fileName: 'BNBC_2020_Part_01.pdf',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'bnbc2020Part2',
    title: 'BNBC 2020 (Part - 02)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-২): স্ট্রাকচারাল ডিজাইন, লোড ও সিসমিক ডিজাইন, অগ্নি নিরাপত্তা।',
    fileUrl: '/documents/bnbc-2020-part-02.pdf',
    fileName: 'BNBC_2020_Part_02.pdf',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
];

const LEGAL_DOCS_STORAGE_KEY = 'sitakunda_official_legal_documents_v1';

/**
 * Get the current list of 10 official legal documents, merging customized uploaded files
 */
export function getLegalDocuments(): LegalDocumentItem[] {
  if (typeof window === 'undefined') return DEFAULT_LEGAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(LEGAL_DOCS_STORAGE_KEY);
    if (!raw) return DEFAULT_LEGAL_DOCUMENTS;
    const customMap: Record<string, Partial<LegalDocumentItem>> = JSON.parse(raw);
    
    return DEFAULT_LEGAL_DOCUMENTS.map((def) => {
      const custom = customMap[def.id];
      if (!custom) return def;
      return {
        ...def,
        ...custom,
        fileUrl: custom.fileUrl || def.fileUrl,
        fileName: custom.fileName || def.fileName,
        isCustom: !!custom.fileUrl,
      };
    });
  } catch (err) {
    console.error('Failed to get legal documents:', err);
    return DEFAULT_LEGAL_DOCUMENTS;
  }
}

/**
 * Save custom metadata or uploaded PDF URL for a legal document
 */
export function saveLegalDocument(docId: LegalDocId, updates: Partial<LegalDocumentItem>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LEGAL_DOCS_STORAGE_KEY);
    const customMap: Record<string, Partial<LegalDocumentItem>> = raw ? JSON.parse(raw) : {};
    
    customMap[docId] = {
      ...(customMap[docId] || {}),
      ...updates,
      uploadedAt: updates.uploadedAt || new Date().toISOString(),
      isCustom: true,
    };

    localStorage.setItem(LEGAL_DOCS_STORAGE_KEY, JSON.stringify(customMap));
    window.dispatchEvent(new Event('legal-documents-updated'));
    return true;
  } catch (err) {
    console.error('Failed to save legal document:', err);
    return false;
  }
}

/**
 * Reset a document back to default
 */
export function resetLegalDocument(docId: LegalDocId): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LEGAL_DOCS_STORAGE_KEY);
    if (!raw) return true;
    const customMap: Record<string, Partial<LegalDocumentItem>> = JSON.parse(raw);
    delete customMap[docId];
    localStorage.setItem(LEGAL_DOCS_STORAGE_KEY, JSON.stringify(customMap));
    window.dispatchEvent(new Event('legal-documents-updated'));
    return true;
  } catch (err) {
    console.error('Failed to reset legal document:', err);
    return false;
  }
}

/**
 * Upload Gazette PDF to server (Node Express or Hostinger PHP) with Base64 fallback
 */
export async function uploadGazettePdf(
  docId: LegalDocId,
  file: File,
  uploadedBy: string = 'Officer'
): Promise<{ success: boolean; fileUrl: string; fileName: string; fileSize: number; error?: string }> {
  const fileName = file.name;
  const fileSize = file.size;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ success: false, fileUrl: '', fileName, fileSize, error: 'ফাইল পড়তে ব্যর্থ হয়েছে' });
    };

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      let savedUrl = dataUrl; // default fallback

      // Try Node Express endpoint /api/upload-gazette
      try {
        const res = await fetch('/api/upload-gazette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docId,
            fileName,
            fileData: dataUrl
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.fileUrl) {
            savedUrl = json.fileUrl;
          }
        }
      } catch {
        // Local server upload unavailable, will persist dataUrl in localStorage
      }

      // Also attempt Hostinger upload.php if available
      if (savedUrl === dataUrl) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const phpRes = await fetch('/api/upload.php', {
            method: 'POST',
            body: formData,
          });
          if (phpRes.ok) {
            const phpJson = await phpRes.json();
            if (phpJson.success && phpJson.fileUrl) {
              savedUrl = phpJson.fileUrl;
            }
          }
        } catch {
          // Fallback remains dataUrl
        }
      }

      // Save to client storage
      saveLegalDocument(docId, {
        fileUrl: savedUrl,
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        isCustom: true,
      });

      resolve({
        success: true,
        fileUrl: savedUrl,
        fileName,
        fileSize,
      });
    };

    reader.readAsDataURL(file);
  });
}
