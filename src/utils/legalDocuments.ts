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

export interface LegalDocumentSection {
  title: string;
  content: string;
  tag?: string;
}

export interface LegalDocumentItem {
  id: LegalDocId;
  title: string;
  category: string;
  year: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  officialUrl?: string;
  gazetteNo?: string;
  authority?: string;
  keyHighlights?: string[];
  sections?: LegalDocumentSection[];
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
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-254.html',
    gazetteNo: 'এস, আর, ও নং ১১২-আইন/৯৬ (১৯ মে ১৯৯৬)',
    authority: 'গৃহায়ন ও গণপূর্ত মন্ত্রণালয় | সীতাকুণ্ড পৌরসভা',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    keyHighlights: [
      'বিধি ৫: মোট ৭ ফর্দ নকশা (সাইট লে-আউট, সিএস/আরএস/বিএস দাগ প্ল্যান, ফ্লোর প্ল্যান, সেকশন) দাখিল বাধ্যতামূলক',
      'বিধি ৬: ৪ তলা পর্যন্ত ডিপ্লোমা/স্নাতক প্রকৌশলী/স্থপতি; ৫ তলা বা বাণিজ্যিক ভবনে শুধুমাত্র স্নাতক স্থপতি (B.Arch)',
      'বিধি ৮: সম্মুখ রাস্তা ন্যূন ৩.৬৫ মিটার (ব্যক্তিগত ৩.০০ মিটার); রাস্তা কেন্দ্র হতে ৪.৫ মিটার বা সীমানা হতে ১.৫ মিটার সেটব্যাক',
      'বিধি ১৩: আবাসিক ৩০০ বর্গমিটারে ২৩ বর্গমিটার এবং বাণিজ্যিক ২০০ বর্গমিটারে ২৩ বর্গমিটার গাড়ি পার্কিং',
      'বিধি ২৫: ৭ তলা বা তদূর্ধ্ব ভবনে সার্বক্ষণিক লিফট, ব্যাকআপ জেনারেটর এবং ফায়ার সেফটি বাধ্যতামূলক',
      'তফসিল-২: সরকারি ফি ৫০ বর্গমিটার পর্যন্ত ১০০/- টাকা হতে ধাপে ধাপে আয়তনভিত্তিক হিসাব'
    ],
    sections: [
      {
        title: 'বিধি ৩ ও ৪: পৌরসভা কর্তৃপক্ষের অনুমতি গ্রহণ ও আবেদন পদ্ধতি',
        content: 'সীতাকুণ্ড পৌরসভা এলাকায় যে কোনো ভবন নির্মাণ, পুনর্নির্মাণ বা সম্প্রসারণের পূর্বে পৌরসভার উপযুক্ত কর্তৃপক্ষের নিকট হইতে লিখিত অনুমতি গ্রহণ করিতে হইবে। আবেদনপত্রের সহিত তফসিল-১ ফরম, ভূমির স্বত্বাধিকার দলিল এবং নির্ধারিত সরকারি ফি জমা দিতে হইবে।'
      },
      {
        title: 'বিধি ৫: নকশার অপরিহার্য বিবরণ ও ৭ ফর্দ নথিপত্র দাখিল',
        content: '১:২০০ স্কেলে সাইট লে-আউট প্ল্যান, সি.এস/আর.এস ও বিএস দাগ নির্দেশক সাইট প্ল্যান, ১:৫০ বা ১:১০০ স্কেলে ফ্লোর প্ল্যান, এলিভেশন ও ক্রস সেকশনসহ মোট ৭ ফর্দ পূর্ণাঙ্গ নকশা দাখিল করিতে হইবে।'
      },
      {
        title: 'বিধি ৬: নকশা প্রণয়নকারীর শিক্ষাগত যোগ্যতা ও পেশাগত দায়িত্ব',
        content: '৪ তলা পর্যন্ত আবাসিক ভবনের ক্ষেত্রে সরকার স্বীকৃত ডিপ্লোমা/স্নাতক স্থপতি বা প্রকৌশলী। ৫ তলা বা ততোধিক তলা এবং যে কোনো বাণিজ্যিক বা শিল্প ভবনের ক্ষেত্রে শুধুমাত্র স্নাতক স্থপতি (B.Arch) দ্বারা নকশা প্রণয়ন বাধ্যতামূলক।'
      },
      {
        title: 'বিধি ৮: সম্মুখস্থ রাস্তা ও উন্মুক্ত স্থানের দূরত্ব (সেটব্যাক বিধান)',
        content: 'সাইট সংলগ্ন রাস্তা অন্যূন ৩.৬৫ মিটার (ব্যক্তিমালিকানাধীন হলে ৩.০০ মিটার) প্রশস্ত হইতে হইবে। রাস্তার কেন্দ্র হইতে ন্যূনতম ৪.৫ মিটার অথবা সাইটের সম্মুখ সীমানা হইতে ১.৫ মিটার উন্মুক্ত স্থান রাখিয়া ভবন নির্মাণ করিতে হইবে।'
      },
      {
        title: 'বিধি ১২: ইমারতের সর্বোচ্চ উচ্চতা ও রাস্তার প্রশস্ততার অনুপাত',
        content: 'ইমারতের সর্বোচ্চ উচ্চতা সম্মুখবর্তী রাস্তার প্রস্থ এবং উন্মুক্ত স্থানের যোগফলের দ্বিগুণের অধিক হইবে না। ২৩.০০ মিটার বা ততোধিক প্রশস্ত রাস্তায় উচ্চতার ক্ষেত্রে বিশেষ ছাড়পত্র প্রযোজ্য।'
      },
      {
        title: 'বিধি ১৩: গাড়ি পার্কিং ব্যবস্থা ও র‍্যাম্পের পরিমাপ',
        content: 'আবাসিক ভবনে প্রতি ৩০০ বর্গমিটার ফ্লোর এরিয়ার জন্য ২৩ বর্গমিটার এবং বাণিজ্যিক ভবনে প্রতি ২০০ বর্গমিটারের জন্য ২৩ বর্গমিটার গাড়ি পার্কিং স্পেস নিশ্চিত করিতে হইবে। র‍্যাম্পের ঢাল অনূর্ধ্ব ১:৮ রাখিতে হইবে।'
      },
      {
        title: 'বিধি ২৫: বহুতল ভবন (৭ তলা বা তদূর্ধ্ব) এর বিশেষ বাধ্যবাধকতা',
        content: '৭ তলা বা তদূর্ধ্ব ভবনে সার্বক্ষণিক চালু লিফট (Elevator), বিকল্প জরুরি বিদ্যুৎ জেনারেটর এবং ফায়ার সার্ভিস ও সিভিল ডিফেন্স অনুমোদিত অগ্নি নির্বাপক ব্যবস্থা স্থাপন বাধ্যতামূলক।'
      },
      {
        title: 'তফসিল-২: সরকারি অনুমোদন ফি সারণী (বিধি ৪)',
        content: '৫০ বর্গমিটার পর্যন্ত: ১০০/-, ৫১-১০০ বর্গমিটার: ২০০/-, ১০১-২০০ বর্গমিটার: ৩০০/-, ২০১-৩০০ বর্গমিটার: ৪০০/-, ৩০১-৫০০ বর্গমিটার: ৭৫০/-, ৫০১-১০০০ বর্গমিটার: ২,১০০/-, ১০০১-১৫০০ বর্গমিটার: ৪,৫০০/-, ১৫০১-২০০০ বর্গমিটার: ৬,৩০০/- টাকা। বাণিজ্যে ন্যূনতম ১,০০০/- টাকা।'
      }
    ]
  },
  {
    id: 'act1952',
    title: 'ইমারত নির্মাণ আইন, ১৯৫২ (Building Construction Act, 1952)',
    category: 'মূল আইন',
    year: '১৯৫২',
    description: 'ধারা ১-২০, ৩ বৎসরের অনুমোদন মেয়াদ, অননুমোদিত নির্মাণ অপসারণ ও দণ্ডাদেশ সংক্রান্ত বিধানাবলী।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-254.html',
    gazetteNo: 'East Bengal Act No. II of 1953 (২১ মার্চ ১৯৫৩)',
    authority: 'আইন ও সংসদ বিষয়ক বিভাগ | গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    keyHighlights: [
      'ধারা ৩: কর্তৃপক্ষের পূর্বানুমোদন ব্যতিরেকে কোনো ইমারত নির্মাণ বা পরিবর্তন দণ্ডনীয় অপরাধ; অনুমোদনের মেয়াদ ৩ বছর',
      'ধারা ৩ক: অনুমোদিত ব্যবহারের ব্যত্যয় ঘটিয়ে ভিন্ন কোনো উদ্দেশ্যে ভবন ব্যবহার করা যাবে না',
      'ধারা ৩খ: অনুমোদনহীন বা ব্যত্যয়কৃত নির্মাণ ভেঙে ফেলা বা অপসারণের নোটিশ এবং উচ্ছেদ অভিযান',
      'ধারা ১২: আইন ও বিধিমালা লঙ্ঘনের দায়ে ৭ বছর পর্যন্ত কারাদণ্ড বা ৫০,০০০/- টাকা জরিমানা বা উভয় দণ্ড'
    ],
    sections: [
      {
        title: 'ধারা ৩: লিখিত অনুমতি ব্যতিরেকে নির্মাণ নিষিদ্ধকরণ',
        content: 'অনুমোদিত কর্তৃপক্ষের লিখিত পূর্বানুমোদন ব্যতিরেকে কোনো ব্যক্তি কোনো ইমারত নির্মাণ, পুনর্নির্মাণ বা কাঠামো পরিবর্তন করিতে পারিবে না। অনুমোদনের মেয়াদ অনুমোদনের তারিখ হইতে ৩ (তিন) বৎসর পর্যন্ত বলবৎ থাকিবে।'
      },
      {
        title: 'ধারা ৩ক: অনুমোদিত ব্যবহারের ব্যত্যয় রোধ',
        content: 'যে উদ্দেশ্যে ইমারত নির্মাণের অনুমতি প্রদান করা হইয়াছে, কর্তৃপক্ষের অনুমতি ব্যতীত উক্ত উদ্দেশ্য ভিন্ন অন্য কোনো বাণিজ্যিক বা অননুমোদিত উদ্দেশ্যে ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।'
      },
      {
        title: 'ধারা ৩খ: অননুমোদিত নির্মাণ অপসারণ ও নোটিশ জারি',
        content: 'অনুমোদনহীন বা অনুমোদিত নকশার ব্যত্যয় ঘটিয়ে কোনো ইমারত নির্মিত হইলে কর্তৃপক্ষ উক্ত নির্মাণ অপসারণের বা ভাঙিয়া ফেলার নোটিশ জারি করিতে পারিবেন এবং অমান্য করিলে পৌর কর্তৃপক্ষ নিজ উদ্যোগে উচ্ছেদ করিতে পারিবেন।'
      },
      {
        title: 'ধারা ১২: আদেশ অমান্য ও আইন লঙ্ঘনের দণ্ড',
        content: 'এই আইনের কোনো বিধান বা বিধিমালা লঙ্ঘন করিলে অনূর্ধ্ব ৭ (সাত) বৎসর কারাদণ্ড বা অনূন ৫০,০০০/- (পঞ্চাশ হাজার) টাকা অর্থদণ্ড বা উভয় দণ্ডে দণ্ডিত করার স্পষ্ট আইনি বিধান রহিয়াছে।'
      }
    ]
  },
  {
    id: 'pourashava2009',
    title: 'স্থানীয় সরকার (পৌরসভা) আইন, ২০০৯',
    category: 'পৌরসভা আইন',
    year: '২০০৯',
    description: 'পৌর এলাকায় ইমারত ও ভূমি নিয়ন্ত্রণ, মহাপরিকল্পনা, ২য় তফসিল ৩৫-৩৭ এবং ৩য় ও ৪র্থ তফসিল।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-1024.html',
    gazetteNo: '২০০৯ সনের ৫৮ নং আইন (৬ অক্টোবর ২০০৯)',
    authority: 'স্থানীয় সরকার বিভাগ | সীতাকুণ্ড পৌরসভা',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    keyHighlights: [
      'ধারা ৩৫: পৌরসভা কর্তৃক সাইট ও নকশা অনুমোদিত না হওয়া পর্যন্ত নির্মাণ কাজ শুরু করা সম্পূর্ণ বেআইনি',
      'ধারা ৩৬: নির্মাণ সমাপ্তির ৩০ দিনের মধ্যে পৌরসভায় সমাপন প্রতিবেদন (Completion Report) দাখিল বাধ্যতামূলক',
      'ধারা ৩৭: বিপজ্জনক, ঝুঁকিপূর্ণ বা অনুমোদনহীন ইমারত অপসারণ এবং সমুদয় খরচ ও জরিমানা মালিকের নিকট হতে আদায়',
      '২য় তফসিল ৩৫-৩৭: পৌরসভার মহাপরিকল্পনা অনুযায়ী রাস্তা প্রশস্তকরণ ও ড্রেনেজ অবকাঠামোর নিরাপত্তা নিশ্চিতকরণ'
    ],
    sections: [
      {
        title: 'ধারা ৩৫: ইমারত নির্মাণ ও পুনর্নির্মাণ সংক্রান্ত পৌরসভার এখতিয়ার',
        content: 'পৌরসভা কর্তৃক সাইট ও নকশা অনুমোদিত না হওয়া পর্যন্ত কোনো ব্যক্তি পৌর সীমানার অভ্যন্তরে কোনো প্রকার নির্মাণ কাজ শুরু করিতে পারিবে না।'
      },
      {
        title: 'ধারা ৩৬: ইমারত সমাপন প্রতিবেদন দাখিল',
        content: 'নির্মাণ কাজ সমাপ্তির ৩০ (ত্রিশ) দিনের মধ্যে পৌরসভায় সমাপন প্রতিবেদন দাখিল করিতে হইবে এবং পৌর প্রকৌশল বিভাগ কর্তৃক চূড়ান্ত পরিদর্শন সাপেক্ষে ব্যবহারের অনাপত্তি গ্রহণ করিতে হইবে।'
      },
      {
        title: 'ধারা ৩৭ ও ১০৮: বিপজ্জনক ও ঝুঁকিপূর্ণ ভবন অপসারণ',
        content: 'পৌরসভা জনস্বার্থে বিপজ্জনক, ফাটল ধরা বা অনুমোদনহীন ইমারত অপসারণের নির্দেশ দিতে পারিবে। অমান্য করিলে পৌরসভা নিজ দায়িত্বে অপসারণপূর্বক সমুদয় ব্যয় ও জরিমানা মালিকের নিকট হইতে আদায় করিতে পারিবে।'
      }
    ]
  },
  {
    id: 'openspace2000',
    title: 'উন্মুক্ত স্থান ও জলাধার সংরক্ষণ আইন, ২০০০',
    category: 'পরিবেশ ও জলাধার',
    year: '২০০০',
    description: 'পৌর এলাকার খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান ও প্রাকৃতিক জলাধারের শ্রেণী পরিবর্তন সংক্রান্ত বাধা-নিষেধ।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-839.html',
    gazetteNo: '২০০০ সনের ৩৬ নং আইন (১৮ সেপ্টেম্বর ২০০০)',
    authority: 'গৃহায়ন ও গণপূর্ত মন্ত্রণালয় | পরিবেশ অধিদপ্তর',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    keyHighlights: [
      'ধারা ৫: খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান ও প্রাকৃতিক জলাধার (পুকুর/দীঘি/খাল) ভরাট বা শ্রেণি পরিবর্তন সম্পূর্ণ নিষিদ্ধ',
      'ধারা ৮: অননুমোদিত ভরাট বা নির্মাণের ক্ষেত্রে উপযুক্ত কর্তৃপক্ষ নিজ খরচে অপসারণ করে পূর্বাবস্থায় আনবেন',
      'ধারা ১১: আইন লঙ্ঘনে ৫ বছর পর্যন্ত কারাদণ্ড বা ৫০,০০০/- টাকা অর্থদণ্ড বা উভয় দণ্ডে দণ্ডনীয়'
    ],
    sections: [
      {
        title: 'ধারা ৫: শ্রেণি পরিবর্তন ও জলাধার ভরাট সম্পূর্ণ নিষিদ্ধ',
        content: 'মাস্টার প্ল্যান বা পৌর এলাকায় চিহ্নিত খেলার মাঠ, উন্মুক্ত স্থান, উদ্যান ও প্রাকৃতিক জলাধার (পুকুর/দীঘি/খাল/নদী) ভরাট করা বা অন্য কোনো উদ্দেশ্যে শ্রেণি পরিবর্তন করা সম্পূর্ণ নিষিদ্ধ।'
      },
      {
        title: 'ধারা ৮: পূর্বাবস্থায় ফিরিয়ে আনার বাধ্যবাধকতা',
        content: 'আইন অমান্য করিয়া কোনো জলাশয় বা উন্মুক্ত স্থান ভরাট করা হইলে উপযুক্ত কর্তৃপক্ষ নিজ উদ্যোগে উক্ত ভরাট অপসারণ করিয়া পূর্বাবস্থায় ফিরাইয়া আনিবেন এবং সমুদয় খরচ অপরাধীর নিকট হইতে আদায় করিবেন।'
      },
      {
        title: 'ধারা ১১: শাস্তি ও অর্থদণ্ড',
        content: 'এই আইনের বিধান লঙ্ঘনকারীকে অনূর্ধ্ব ৫ (পাঁচ) বৎসর পর্যন্ত কারাদণ্ড বা অনূর্ধ্ব ৫০,০০০/- টাকা অর্থদণ্ড বা উভয় দণ্ডে দণ্ডিত করা যাইবে।'
      }
    ]
  },
  {
    id: 'fire2003',
    title: 'অগ্নি প্রতিরোধ ও নির্বাপণ আইন, ২০০৩',
    category: 'অগ্নি নিরাপত্তা ও NOC',
    year: '২০০৩',
    description: 'বহুতল (৭+ তলা) ও বাণিজ্যিক ভবনের ফায়ার সার্ভিস ছাড়পত্র (NOC) ও জীবন-সম্পদ নিরাপত্তা বিধান।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-898.html',
    gazetteNo: '২০০৩ সনের ৭ নং আইন (২৪ মার্চ ২০০৩)',
    authority: 'স্বরাষ্ট্র মন্ত্রণালয় | ফায়ার সার্ভিস ও সিভিল ডিফেন্স অধিদপ্তর',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    keyHighlights: [
      'ধারা ৭: বহুতল (৭ তলা বা তদূর্ধ্ব) এবং সকল বাণিজ্যিক ভবনে ফায়ার সার্ভিস ছাড়পত্র (NOC) ব্যতিরেকে প্ল্যান পাস অবৈধ',
      'ধারা ৮: পর্যাপ্ত অগ্নিনির্বাপক সরঞ্জাম, স্মোক ডিটেক্টর, ফায়ার হাইড্রেন্ট ও স্বতন্ত্র জরুরি বহির্গমন সিঁড়ি স্থাপন বাধ্যতামূলক',
      'ধারা ১৬ ও ১৯: অগ্নিনিরাপত্তা শর্ত অমান্যে লাইসেন্স বাতিল এবং ৩ বছর কারাদণ্ড ও অর্থদণ্ডের বিধান'
    ],
    sections: [
      {
        title: 'ধারা ৭: বহুতল ও বাণিজ্যিক ভবনের ফায়ার সেফটি NOC',
        content: '৭ তলা বা তদূর্ধ্ব যেকোনো বহুতল ভবন, হাসপাতাল, মার্কেট, বিপণি-বিতান ও শিল্প কারখানার ক্ষেত্রে ফায়ার সার্ভিস ও সিভিল ডিফেন্স অধিদপ্তরের পূর্বানুমোদন ও অনাপত্তিপত্র (NOC) ব্যতিরেকে পৌরসভার নকশা অনুমোদন কার্যকর হইবে না।'
      },
      {
        title: 'ধারা ৮: ভবনে পর্যাপ্ত অগ্নিনির্বাপক ব্যবস্থা নিশ্চিতকরণ',
        content: 'প্রত্যেক বাণিজ্যিক ও বহুতল ভবনে পর্যাপ্ত অগ্নিনির্বাপক সরঞ্জাম, স্মোক ডিটেক্টর, ফায়ার এলার্ম, ফায়ার হাইড্রেন্ট ও স্বতন্ত্র জরুরি নির্গমন বহিঃসিঁড়ি (Fire Exit) স্থাপন বাধ্যতামূলক।'
      }
    ]
  },
  {
    id: 'envAct1995',
    title: 'বাংলাদেশ পরিবেশ সংরক্ষণ আইন, ১৯৯৫',
    category: 'পরিবেশ আইন',
    year: '১৯৯৫',
    description: 'পরিবেশ সংরক্ষণ, পরিবেশগত মান উন্নয়ন, দূষণ নিয়ন্ত্রণ ও পরিবেশগত ছাড়পত্র (ECC) সংক্রান্ত আইন।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-791.html',
    gazetteNo: '১৯৯৫ সনের ১ নং আইন (১৬ ফেব্রুয়ারি ১৯৯৫)',
    authority: 'পরিবেশ, বন ও জলবায়ু পরিবর্তন মন্ত্রণালয় | পরিবেশ অধিদপ্তর',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    keyHighlights: [
      'ধারা ৬খ: সীতাকুণ্ড অঞ্চলের পাহাড় বা টিলা কর্তন সম্পূর্ণ নিষিদ্ধ ও জামিন-অযোগ্য ফৌজদারি অপরাধ',
      'ধারা ৬গ: প্রাকৃতিক জলাধার ভরাট বা স্বাভাবিক জলপ্রবাহ বাধাগ্রস্ত করা সম্পূর্ণ বেআইনি',
      'ধারা ১২: পরিবেশ অধিদপ্তরের পরিবেশগত ছাড়পত্র (ECC) ব্যতিরেকে কোনো শিল্প বা বৃহৎ আবাসন প্রকল্প নিষিদ্ধ',
      'ধারা ১৫: আইন লঙ্ঘনে ১০ বছর কারাদণ্ড বা ১০ লক্ষ টাকা জরিমানা ও ক্ষতিপূরণ আদায়'
    ],
    sections: [
      {
        title: 'ধারা ৬খ: পাহাড় বা টিলা কর্তন সম্পূর্ণ নিষিদ্ধকরণ',
        content: 'পরিবেশ অধিদপ্তরের অনুমতি ব্যতিরেকে কোনো ব্যক্তি বা প্রতিষ্ঠান কর্তৃক সীতাকুণ্ড এলাকার কোনো পাহাড় বা টিলা কাটা বা বিনষ্ট করা সম্পূর্ণ নিষিদ্ধ ও জামিন-অযোগ্য অপরাধ।'
      },
      {
        title: 'ধারা ৬গ: জলাধার ভরাট ও জলনিষ্কাশন ব্যাহত করা নিষিদ্ধ',
        content: 'প্রাকৃতিক জলাধার ভরাট করা যাইবে না। কোনো ইমারত নির্মাণের কারণে স্বাভাবিক জলপ্রবাহ বাধাগ্রস্ত করা সম্পূর্ণ বেআইনি।'
      },
      {
        title: 'ধারা ১২: পরিবেশগত ছাড়পত্র (ECC) গ্রহণ বাধ্যতামূলক',
        content: 'পরিবেশ অধিদপ্তরের নিকট হইতে পরিবেশগত ছাড়পত্র ব্যতিরেকে কোনো শিল্প প্রতিষ্ঠান বা বড় আবাসন প্রকল্প স্থাপন বা ইমারত নির্মাণ করা যাইবে না।'
      }
    ]
  },
  {
    id: 'envRules2023',
    title: 'পরিবেশ সংরক্ষণ বিধিমালা, ২০২৩',
    category: 'পরিবেশ বিধিমালা',
    year: '২০২৩',
    description: 'ইমারত, শিল্প ও উন্নয়ন প্রকল্পের পরিবেশগত অবস্থান ছাড়পত্র, পরিবেশগত প্রভাব নিরূপণ (EIA) ও বর্জ্য ব্যবস্থাপনা।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'https://doe.portal.gov.bd',
    gazetteNo: 'এস, আর, ও নং ১৪-আইন/২০২৩ (১ জানুয়ারি ২০২৩)',
    authority: 'পরিবেশ অধিদপ্তর | গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    keyHighlights: [
      'বিধি ৪ ও ৫: প্রকল্পের পরিবেশগত ক্যাটাগরি (সবুজ, হলুদ, কমলা, লাল) শ্রেণিবিভাগ ও অবস্থান ছাড়পত্র',
      'বিধি ৮: বহুতল বাণিজ্যিক ও আবাসিক কমপ্লেক্সে পয়ঃবর্জ্যের জন্য নিজস্ব STP (Sewage Treatment Plant) বাধ্যতামূলক',
      'বিধি ৯: রেইন ওয়াটার হারভেস্টিং ও ভূগর্ভস্থ পানি সুরক্ষা নিশ্চিতকরণ'
    ],
    sections: [
      {
        title: 'বিধি ৪ ও ৫: প্রকল্পের পরিবেশগত ক্যাটাগরি শ্রেণিবিভাগ',
        content: 'সকল প্রকার নির্মাণ ও উন্নয়ন প্রকল্পকে সবুজ, হলুদ, কমলা ও লাল এই চারটি ক্যাটাগরিতে বিভক্ত করিয়া পরিবেশগত প্রভাব নিরূপণ (EIA) ও অবস্থান ছাড়পত্র বাধ্যতামূলক করা হইয়াছে।'
      },
      {
        title: 'বিধি ৮: সুয়ারেজ ট্রিটমেন্ট প্ল্যান্ট (STP) ও বর্জ্য ব্যবস্থাপনা',
        content: 'বহুতল বাণিজ্যিক ভবন ও আবাসন কমপ্লেক্সে অপরিশোধিত পয়ঃবর্জ্য সরাসরি পৌর ড্রেনে নিষ্কাশন নিষিদ্ধ। আধুনিক STP স্থাপন করিয়া পরিশোধিত পানি নিঃসরণ নিশ্চিত করিতে হইবে।'
      },
      {
        title: 'বিধি ৯: রেইন ওয়াটার হারভেস্টিং ও ভূগর্ভস্থ পানি সুরক্ষা',
        content: 'বৃষ্টির পানি ধারণ ও সংরক্ষণ (Rainwater Harvesting) ব্যবস্থা নিশ্চিত করিতে হইবে যেন ভূগর্ভস্থ পানির ওপর চাপ হ্রাস পায়।'
      }
    ]
  },
  {
    id: 'highwayAct2021',
    title: 'মহাসড়ক আইন, ২০২১',
    category: 'মহাসড়ক ও সড়ক আইন',
    year: '২০২১',
    description: 'জাতীয়, আঞ্চলিক ও জেলা মহাসড়ক সংরক্ষণ, রাইট অব ওয়ে (ROW), সড়কের উভয়পাশে নির্মাণ সীমানা ও নিয়ন্ত্রণ।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'http://bdlaws.minlaw.gov.bd/act-1393.html',
    gazetteNo: '২০২১ সনের ৩৫ নং আইন (২৭ নভেম্বর ২০২১)',
    authority: 'সড়ক পরিবহন ও মহাসড়ক বিভাগ | সড়ক ও জনপথ অধিদপ্তর',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    keyHighlights: [
      'ধারা ৮: ঢাকা-চট্টগ্রাম জাতীয় মহাসড়ক সংলগ্ন নিয়ন্ত্রণ রেখা (Control Line) ও রাইট অব ওয়ে (ROW) সীমানা সুরক্ষা',
      'ধারা ৯: মহাসড়ক সীমানা হতে নির্ধারিত নিরাপদ দূরত্বের মধ্যে অনুমতিহীন নির্মাণ নিষিদ্ধ',
      'ধারা ১৪: মহাসড়কের জমিতে অবৈধ দখল, প্রাচীর বা প্রবেশপথ উচ্ছেদ ও জরিমানা'
    ],
    sections: [
      {
        title: 'ধারা ৮: মহাসড়কের নিয়ন্ত্রণ রেখা ও রাইট অব ওয়ে (ROW)',
        content: 'সড়ক ও জনপথ অধিদপ্তর কর্তৃক নির্ধারিত মহাসড়কের সীমানা এবং রাইট অব ওয়ের মধ্যে কোনো স্থায়ী বা অস্থায়ী অবকাঠামো নির্মাণ সম্পূর্ণ নিষিদ্ধ।'
      },
      {
        title: 'ধারা ৯: মহাসড়ক সীমানা সংলগ্ন নির্মাণ নিয়ন্ত্রণ',
        content: 'মহাসড়ক সীমানা হইতে নির্ধারিত নিরাপদ দূরত্ব বজায় রাখিয়া ভবন নির্মাণ করিতে হইবে। সড়কের ড্রেনেজ ব্যবস্থা ব্যাহত করিয়া কোনো র‍্যাম্প বা কালভার্ট তৈরি নিষিদ্ধ।'
      }
    ]
  },
  {
    id: 'bnbc2020Part1',
    title: 'BNBC 2020 (Part - 01)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-১): সাধারণ ভবন নিয়ন্ত্রণ, প্রশাসনিক বিধান ও সাধারণ নির্দেশিকা।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'https://mohpw.gov.bd',
    gazetteNo: 'বাংলাদেশ গেজেট অতিরিক্ত ২০২১ (S.R.O. No. 55-Law/2021)',
    authority: 'গৃহায়ন ও গণপূর্ত মন্ত্রণালয় | HBRI',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    keyHighlights: [
      'Part 1: Scope & Administration - প্ল্যান পারমিট অনুমোদন পদ্ধতি, পৌরসভা বিল্ডিং কমিটির এখতিয়ার ও নির্মাণ তদারকি',
      'Part 2: Occupancy Classification - আবাসিক (A), বাণিজ্যিক (B), শিক্ষা (C), স্বাস্থ্যসেবা (D) ও শিল্প (G) শ্রেণিবিভাগ',
      'Part 3: General Building Requirements - FAR (Floor Area Ratio) হিসাব, উন্মুক্ত স্থান ও আলো-বাতাস নিশ্চিতকরণ'
    ],
    sections: [
      {
        title: 'Part 1: Scope & Administration (প্রশাসনিক কাঠামো ও প্রয়োগ)',
        content: 'ভবন নির্মাণ অনুমোদন প্রক্রিয়া, পৌরসভা বিল্ডিং কমিটির এখতিয়ার, প্ল্যান পারমিটের প্রকারভেদ এবং নির্মাণকালীন নিয়মিত তদারকি নিশ্চিতকরণ।'
      },
      {
        title: 'Part 2: Occupancy Classification (অকুপেন্সি শ্রেণীবিভাগ)',
        content: 'ভবনের ব্যবহারের ধরন অনুযায়ী শ্রেণিবিভাগ: আবাসিক (Occupancy A), বাণিজ্যিক (Occupancy B), শিক্ষা (Occupancy C), স্বাস্থ্যসেবা (Occupancy D) ও শিল্প (Occupancy G)।'
      }
    ]
  },
  {
    id: 'bnbc2020Part2',
    title: 'BNBC 2020 (Part - 02)',
    category: 'জাতীয় বিল্ডিং কোড',
    year: '২০২০',
    description: 'বাংলাদেশ ন্যাশনাল বিল্ডিং কোড ২০২০ (পার্ট-২): স্ট্রাকচারাল ডিজাইন, লোড ও সিসমিক ডিজাইন, অগ্নি নিরাপত্তা।',
    fileUrl: '',
    fileName: '',
    officialUrl: 'https://mohpw.gov.bd',
    gazetteNo: 'বাংলাদেশ গেজেট অতিরিক্ত ২০২১ (S.R.O. No. 55-Law/2021)',
    authority: 'গৃহায়ন ও গণপূর্ত মন্ত্রণালয় | HBRI',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    keyHighlights: [
      'Part 6: Seismic Design - সীতাকুণ্ড ভূকম্পন সংবেদনশীল জোন-৩ (Z=0.28) এর ভূমিকম্প সহনশীল কাঠামো ডিজাইন বাধ্যতামূলক',
      'Wind Load: উপকূলীয় সীতাকুণ্ড অঞ্চলে মৌলিক বাতাসের বেগ (২৬০ কিমি/ঘণ্টা) বিবেচনা করে সাইক্লোন রেজিস্ট্যান্ট ডিজাইন',
      'Part 4: Fire & Life Safety - অগ্নিরোধী দেয়াল, ফায়ার ডোর, ধোঁয়া নির্গমন শাফট ও জরুরি বহির্গমন সিঁড়ি (Emergency Staircase)'
    ],
    sections: [
      {
        title: 'Part 6: Structural Design (সিসমিক লোড ও সীতাকুণ্ড জোন-৩)',
        content: 'সীতাকুণ্ড এলাকা ভূকম্পন সংবেদনশীল জোন-৩ (Seismic Zone 3, Zone Coefficient Z=0.28) এর অন্তর্ভুক্ত। সকল আরসিসি ও স্টিল ভবনে যথাযথ ভূমিকম্প সহনশীল কাঠামো ডিজাইন বাধ্যতামূলক।'
      },
      {
        title: 'Wind Load & Cyclone Resistance (উপকূলীয় বাতাস ও সাইক্লোন লোড)',
        content: 'উপকূলীয় সীতাকুণ্ড অঞ্চলে মৌলিক বাতাসের বেগ (Basic Wind Speed) ২৬০ কিমি/ঘণ্টা বিবেচনা করিয়া ছাদ, কলাম ও ফাউন্ডেশন ডিজাইন সম্পন্ন করিতে হইবে।'
      }
    ]
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
      if (!custom || !custom.fileUrl) return def;
      return {
        ...def,
        ...custom,
        fileUrl: custom.fileUrl,
        fileName: custom.fileName || 'custom_document.pdf',
        isCustom: true,
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
 * Reset a document back to default (remove custom uploaded file)
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
 * Clear all uploaded custom legal documents and reset everything to clean default
 */
export function clearAllLegalDocuments(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(LEGAL_DOCS_STORAGE_KEY);
    window.dispatchEvent(new Event('legal-documents-updated'));
    return true;
  } catch (err) {
    console.error('Failed to clear legal documents:', err);
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
