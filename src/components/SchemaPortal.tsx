import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, Server, FileCode, Hammer, Share2, ShieldAlert } from 'lucide-react';
import { DatabaseSchemaDetail } from '../types.ts';

export default function SchemaPortal() {
  const [schemas, setSchemas] = useState<DatabaseSchemaDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const response = await fetch('/api/db-schemas');
        const data = await response.json();
        setSchemas(data);
      } catch (err) {
        console.error('Error fetching schemas:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSchemas();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Introduction */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 font-bengali">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold">টেকনিক্যাল আর্কিটেকচার এবং ডাটাবেজ স্কিমা</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          নিচের তালিকায় এই "ভূমির সঠিকতা যাচাই পোর্টাল" (Land Verification Demarcation Portal)-এর জন্য ডেভেলপকৃত ডেটাবেজ টেবিল এবং এডাব্লিউএস এস৩ (AWS S3) ফাইল ক্লাউড স্টোরেজের বোইলারপ্লেট কোড দেওয়া হলো। আপনি আপনার রিয়েল-লাইফ প্রোডাকশন ডিপ্লয়মেন্টে এই স্কিমাসমূহ অবিকল ব্যবহার করতে পারবেন। উল্লেখ্য যে, ফর্মে এবং প্রিন্ট কপিতে তথ্যের সিকোয়েন্স হলো: (১) প্রস্তাবিত নির্মাণ ও উদ্দেশ্য, (২) ভূমির মালিকের তথ্য, (৩) ভূমির বিবরণ (তফসিল), (৪) প্রস্তাবিত সাইটের ঠিকানা, (৫) প্রয়োজনীয় কাগজপত্র, এবং (৬) ঘোষণা ও নিবেদক।
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-bengali">
          <svg className="animate-spin h-6 w-6 text-emerald-850 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs">স্কিমা ডেটা লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {schemas.map((schema, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-800" />
                  <span className="font-bold text-slate-800 text-[14px] font-bengali">{schema.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(schema.code, schema.title)}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-55 text-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  {copiedId === schema.title ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>কোড কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-50/45 border-b border-slate-100 text-xs text-slate-600 font-bengali leading-relaxed">
                {schema.description}
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 text-xs overflow-x-auto font-mono leading-relaxed max-h-[450px]">
                <code>{schema.code}</code>
              </pre>
            </div>
          ))}

          {/* S3 Storage & Hosting Best Practices Card */}
          <div className="bg-rose-50/50 rounded-xl border border-rose-200/60 p-5 font-bengali space-y-3">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-base">ভূমির দলিলপত্রের ক্লাউড সিকিউরিটি নির্দেশনা:</h4>
            </div>
            <div className="text-xs text-rose-950 space-y-2 leading-relaxed font-sans">
              <p>১. <strong>S3 Private Buckets</strong>: ভূমির দলিল অত্যন্ত সংবেদনশীল হওয়ায় AWS S3 বালতি সবসময় 'Private' বা অবরুদ্ধ মোডে রাখতে হবে। বাইরের কাউকে সরাসরি ফাইলের লিংক দেওয়া যাবে না।</p>
              <p>২. <strong>S3 Presigned URLs</strong>: কর্মকর্তা যখন ড্যাশবোর্ড থেকে দলিল যাচাই করবেন, তখন সাময়িকভাবে ৫ মিনিট মেয়াদী Cloudfront Presigned URL অথবা S3 Presigned URL জেনারেট করে ব্রাউজারে প্রদর্শন করা উত্তম।</p>
              <p>৩. <strong>PostgreSQL Indexes</strong>: আর.এস দাগ (<code>rs_dag_no</code>), আর.এস খতিয়ান (<code>rs_khatian_no</code>), এবং বি.এস দাগ (<code>bs_dag_no</code>) কলামগুলোর উপর ডাটাবেজে Index ব্যবহার করা উচিত। এতে লক্ষ লক্ষ রেকর্ড থাকলেও পৌরসভা সার্ভারে অনুসন্ধান ধীরগতির হবে না।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
