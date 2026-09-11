import { savePortalConfigToApi, fetchPortalConfigFromApi } from './apiStorage';

export type CouncilCategory = 
  | 'administrator' // প্রশাসকের প্রোফাইল
  | 'panel_mayor' // প্যানেল মেয়র প্রোফাইল
  | 'executive_officer' // পৌর নির্বাহী কর্মকর্তা প্রোফাইল
  | 'councillor' // ওয়ার্ড কাউন্সিলর প্রোফাইল
  | 'staff' // কর্মকর্তা ও কর্মচারীবৃন্দ প্রোফাইল
  | 'entrepreneur'; // উদ্যোক্তা ও অন্যান্য

export interface CouncilMember {
  id: string;
  category: CouncilCategory;
  name: string;
  designation: string;
  wardOrDepartment?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  bioOrSpeech?: string;
  joiningDate?: string;
  displayOrder?: number;
}

export type NoticeCategory = 'notice' | 'office_order' | 'tender';

export interface NoticeItem {
  id: string;
  category: NoticeCategory;
  title: string;
  memoNo?: string;
  publishDate: string;
  fileUrl?: string;
  description?: string;
  isImportant?: boolean;
}

export const NOTICE_CATEGORIES_META: {
  category: NoticeCategory;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    category: 'notice',
    label: 'নোটিশ',
    shortLabel: 'সাধারণ নোটিশ',
    description: 'পৌরসভার সাধারণ নাগরিক বিজ্ঞপ্তি ও গুরুত্বপূর্ণ ঘোষণা',
  },
  {
    category: 'office_order',
    label: 'অফিস আদেশ',
    shortLabel: 'দাপ্তরিক অফিস আদেশ',
    description: 'কর্মকর্তা-কর্মচারী ও অভ্যন্তরীণ প্রশাসনিক সিদ্ধান্ত সংক্রান্ত আদেশ',
  },
  {
    category: 'tender',
    label: 'টেন্ডার নোটিশ',
    shortLabel: 'ই-দরপত্র বিজ্ঞপ্তি',
    description: 'উন্নয়ন প্রকল্প, রাস্তাঘাট, ড্রেন ও মালামাল সরবরাহ কাজের ই-দরপত্র',
  },
];

export interface PortalConfig {
  // General Municipal Info
  municipalityName: string;
  municipalityTagline: string;
  subDistrict: string;
  district: string;
  establishedYear: string;
  officeHours: string;
  helplinePhone: string;
  hotlineMobile: string;
  officialEmail: string;
  websiteUrl: string;
  physicalAddress: string;

  // Hero Section
  heroBadgeText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroNoticeBadge: string;
  heroNoticeText: string;

  // Scrolling Announcements (Marquee)
  enableMarquee: boolean;
  marqueeNotices: string[];

  // Leadership (Mayor / Administrator)
  leaderTitle: string; // e.g., 'প্রশাসক / মেয়র'
  leaderName: string;
  leaderDesignation: string;
  leaderMessage: string;
  leaderImageUrl: string;

  // Chief Officer / Engineer
  officerTitle: string;
  officerName: string;
  officerDesignation: string;
  officerMessage: string;

  // Council Members (বর্তমান পরিষদ)
  councilMembers: CouncilMember[];

  // Notices List (নোটিশ, অফিস আদেশ, টেন্ডার নোটিশ)
  noticesList: NoticeItem[];

  // Emergency Hotlines
  emergencyNumbers: {
    title: string;
    phone: string;
    icon?: string;
    description: string;
  }[];

  // Citizen Charter & Services Highlights
  servicesList: {
    id: string;
    title: string;
    banglaTitle: string;
    category: string;
    fee: string;
    duration: string;
    iconName: string;
    description: string;
    serviceAction?: 'apply' | 'track' | 'schedule1' | 'roadcutting' | 'info';
    badge?: string;
  }[];

  // Live Statistics
  statistics: {
    label: string;
    value: string;
    sublabel: string;
    iconName: string;
  }[];

  // Social & Important Govt Links
  importantLinks: {
    label: string;
    url: string;
  }[];
}

export const COUNCIL_CATEGORIES_META: {
  category: CouncilCategory;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    category: 'administrator',
    label: 'প্রশাসকের প্রোফাইল',
    shortLabel: 'প্রশাসক',
    description: 'উপজেলা নির্বাহী অফিসার ও সীতাকুণ্ড পৌরসভার প্রশাসক মহোদয়ের পরিচিতি ও বক্তব্য',
  },
  {
    category: 'panel_mayor',
    label: 'প্যানেল মেয়র প্রোফাইল',
    shortLabel: 'প্যানেল মেয়র',
    description: 'সীতাকুণ্ড পৌর পরিষদের নির্বাচিত প্যানেল মেয়রবৃন্দের পরিচিতি ও যোগাযোগ',
  },
  {
    category: 'executive_officer',
    label: 'পৌর নির্বাহী কর্মকর্তা প্রোফাইল',
    shortLabel: 'পৌর নির্বাহী কর্মকর্তা (সচিব)',
    description: 'পৌরসভার প্রধান প্রশাসনিক কর্মকর্তা ও সচিব মহোদয়ের পরিচিতি',
  },
  {
    category: 'councillor',
    label: 'ওয়ার্ড কাউন্সিলর প্রোফাইল',
    shortLabel: 'ওয়ার্ড কাউন্সিলরবৃন্দ',
    description: '০১ হতে ০৯ নং সাধারণ ওয়ার্ড ও সংরক্ষিত নারী কাউন্সিলরবৃন্দের তালিকা ও পরিচিতি',
  },
  {
    category: 'staff',
    label: 'কর্মকর্তা ও কর্মচারীবৃন্দ প্রোফাইল',
    shortLabel: 'কর্মকর্তা ও কর্মচারীবৃন্দ',
    description: 'প্রকৌশল, রাজস্ব, প্রশাসন, স্বাস্থ্য ও পরিচ্ছন্নতা শাখার দায়িত্বপ্রাপ্ত কর্মকর্তাবৃন্দ',
  },
  {
    category: 'entrepreneur',
    label: 'উদ্যোক্তা ও অন্যান্য',
    shortLabel: 'উদ্যোক্তা ও ডিজিটাল টিম',
    description: 'পৌর ডিজিটাল সেবা কেন্দ্র ও তথ্যপ্রযুক্তি সহায়তা টিমের পরিচিতি',
  },
];

export const DEFAULT_PORTAL_CONFIG: PortalConfig = {
  municipalityName: 'সীতাকুণ্ড পৌরসভা কার্যালয়',
  municipalityTagline: 'স্মার্ট পৌরসভা ও ক্যাশলেস ডিজিটাল নাগরিক সেবা পোর্টাল',
  subDistrict: 'সীতাকুণ্ড',
  district: 'চট্টগ্রাম',
  establishedYear: '১৯৯৮',
  officeHours: 'রবিবার হতে বৃহস্পতিবার, সকাল ৯:০০ ঘটিকা হতে বিকাল ৫:০০ ঘটিকা',
  helplinePhone: '০৩০২৮-৫৬০৪৪',
  hotlineMobile: '০১৬১৩-৬২৩২৭৬',
  officialEmail: 'ae.sitakundapourashava@yahoo.com',
  websiteUrl: 'https://sitakunda-pourashava.gov.bd',
  physicalAddress: 'সীতাকুণ্ড পৌরসভা কার্যালয়, সীতাকুণ্ড বাজার সংলগ্ন, চট্টগ্রাম-৪৩২০',

  heroBadgeText: 'ডিজিটাল গভর্নেন্স ও স্মার্ট পৌরসভা প্ল্যাটফর্ম',
  heroHeadline: 'স্মার্ট সীতাকুণ্ড পৌরসভা নাগরিক সেবা পোর্টাল',
  heroSubheadline: 'ঘরে বসেই ভূমি ডিমার্কেশন যাচাই, ডিজিটাল ট্র্যাকিং, ইমারত নির্মাণ নকশা অনুমোদন এবং রাস্তা কর্তনের সরকারি অনুমতিপত্র গ্রহণ করুন সহজে ও স্বচ্ছতার সাথে।',
  heroNoticeBadge: 'জরুরি নোটিশ',
  heroNoticeText: 'ভূমি সীমানা নির্ধারণ (ডিমার্কেশন), ইমারত নির্মাণ অনুমোদন (তফসিল-১) এবং রাস্তা কর্তন আবেদন এখন শতভাগ অনলাইনে দাখিলযোগ্য।',

  enableMarquee: true,
  marqueeNotices: [
    'সীতাকুণ্ড পৌরসভা ই-সেবা পোর্টালে আপনাকে স্বাগতম।',
    'অনলাইনে আবেদন করে ঘরে বসেই কিউআর কোডযুক্ত অফিসিয়াল প্রত্যয়নপত্র ও ট্র্যাক আইডি সংগ্রহ করুন।',
    'ইমারত নির্মাণ ফি জমা দেওয়ার ক্ষেত্রে ১৫% সরকারি ভ্যাট পৃথক চালানের মাধ্যমে প্রদান করুন।',
    'রাস্তা কর্তন অনুমোদনের জন্য নির্ধারিত আবেদন ফি মাত্র ৳ ৩০০/- পৌর ক্যাশ কাউন্টারে জমা দিয়ে রসিদ গ্রহণ করুন।',
    'পৌরসভার যে কোনো সেবা সংক্রান্ত তথ্যের জন্য হেল্পলাইন নম্বর ০৩০২৮-৫৬০৪৪ অথবা ০১৬১৩-৬২৩২৭৬ এ যোগাযোগ করুন।'
  ],

  leaderTitle: 'প্রশাসক / মেয়র মহোদয়ের বাণী',
  leaderName: 'মোহাম্মদ ফখরুল ইসলাম',
  leaderDesignation: 'উপজেলা নির্বাহী অফিসার ও প্রশাসক, সীতাকুণ্ড পৌরসভা',
  leaderMessage: 'স্মার্ট বাংলাদেশের রূপকল্প বাস্তবায়নে সীতাকুণ্ড পৌরসভাকে একটি আধুনিক, পরিবেশবান্ধব ও প্রযুক্তিনির্ভর ডিজিটাল নগর হিসেবে গড়ে তোলাই আমাদের লক্ষ্য। নাগরিকদের সরকারি সেবা দ্রুত, স্বচ্ছ ও দুর্নীতিমুক্ত উপায়ে সরাসরি পৌঁছে দিতে আমাদের এই সমন্বিত স্মার্ট পোর্টাল। পৌরবাসীর সক্রিয় সহযোগিতা ও উন্নয়নে আমরা অঙ্গীকারবদ্ধ।',
  leaderImageUrl: '/logo.png',

  officerTitle: 'নির্বাহী প্রকৌশলীর বার্তা',
  officerName: 'প্রকৌশলী মো. জসিম উদ্দিন',
  officerDesignation: 'নির্বাহী প্রকৌশলী, সীতাকুণ্ড পৌরসভা',
  officerMessage: 'পরিকল্পিত নগরায়ন ও বিধি মোতাবেক ভবন নির্মাণের ক্ষেত্রে সীমানা সঠিকতা যাচাই ও ছাড়পত্র গ্রহণ অপরিহার্য। ডিজিটাল প্ল্যানিং শাখার মাধ্যমে আবেদনসমূহ দ্রুত নিষ্পত্তি করা হচ্ছে।',

  councilMembers: [
    // Administrator (প্রশাসকের প্রোফাইল)
    {
      id: 'cm-admin-1',
      category: 'administrator',
      name: 'মোহাম্মদ ফখরুল ইসলাম',
      designation: 'উপজেলা নির্বাহী অফিসার ও পৌর প্রশাসক',
      wardOrDepartment: 'পৌর প্রশাসন ও নির্বাহী শাখা',
      phone: '০৩০২৮-৫৬০৪৪',
      email: 'uno.sitakunda@mopa.gov.bd',
      imageUrl: '/logo.png',
      bioOrSpeech: 'সীতাকুণ্ড পৌরসভাকে একটি পরিকল্পিত, আধুনিক, পরিবেশবান্ধব ও প্রযুক্তিনির্ভর স্মার্ট নগরী হিসেবে গড়ে তোলাই আমাদের মূল লক্ষ্য। সকল নাগরিক সেবাকে ডিজিটালাইজড করার মাধ্যমে আমরা পৌরবাসীর দৌড়গোড়ায় দ্রুত ও স্বচ্ছ সেবা নিশ্চিত করতে বদ্ধপরিকর।',
      joiningDate: '২০২৪-০৮-১৫',
      displayOrder: 1,
    },
  ],

  // Notices List (নোটিশ, অফিস আদেশ, টেন্ডার নোটিশ)
  noticesList: [
    {
      id: 'notice-1',
      category: 'notice',
      title: 'সীতাকুণ্ড পৌরসভা এলাকার সকল নাগরিকের অবগতির জন্য পৌর হোল্ডিং ও কর পরিশোধ সংক্রান্ত জরুরি বিজ্ঞপ্তি',
      memoNo: 'সীকপ/প্রশা/২০২৬-১৮৯',
      publishDate: '২০২৬-০৩-০১',
      description: 'সীতাকুণ্ড পৌরসভা এলাকার সকল সম্মানিত পৌরবাসীর অবগতির জন্য জানানো যাচ্ছে যে, ২০২৫-২০২৬ অর্থ বছরের ধার্যকৃত পৌর হোল্ডিং কর ও বাণিজ্যিক এসেসমেন্ট আগামী ৩১শে মার্চের মধ্যে পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হলো।',
      isImportant: true
    },
    {
      id: 'notice-2',
      category: 'office_order',
      title: 'ডিজিটাল ল্যান্ড ভেরিফিকেশন ও ইমারত নির্মাণ অনুমোদন সংক্রান্ত অফিস আদেশ',
      memoNo: 'সীকপ/প্রকৌ/আদেশ/২০২৬-৭৪',
      publishDate: '২০২৬-০২-২০',
      description: 'সীতাকুণ্ড পৌরসভা আওতাধীন এলাকার সকল জমির সীমানা নির্ধারণ, ডিমার্কেশন প্রত্যয়ন ও ইমারত নির্মাণ নকশা অনুমোদন এখন থেকে সম্পূর্ণ অনলাইন পোর্টালের মাধ্যমে বাধ্যতামূলক করা হলো।',
      isImportant: true
    },
    {
      id: 'notice-3',
      category: 'tender',
      title: 'সীতাকুণ্ড পৌরসভা বিভিন্ন ওয়ার্ডের আরসিসি ড্রেন ও আরসিসি রাস্তা নির্মাণ কাজের উন্মুক্ত ই-দরপত্র বিজ্ঞপ্তি (e-GP/Tender)',
      memoNo: 'সীকপ/ইজিপি-টেন্ডার/২০২৬-১২',
      publishDate: '২০২৬-০২-১৫',
      description: 'সীতাকুণ্ড পৌরসভার রাজস্ব ও উন্নয়ন তহবিলের আওতায় প্যাকেজ নম্বর- ০১ হতে ০৮ এর বিভিন্ন ওয়ার্ডে আরসিসি ড্রেন, রোড কার্পেটিং ও কালভার্ট নির্মাণের লক্ষ্যে যোগ্য ঠিকাদারদের নিকট হতে ই-জিপির মাধ্যমে দরপত্র আহ্বান করা যাচ্ছে।',
      isImportant: true
    }
  ],

  emergencyNumbers: [
    {
      title: 'জাতীয় জরুরি সেবা',
      phone: '৯৯৯',
      description: 'পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিসের জন্য ২৪/৭ সার্বক্ষণিক জাতীয় হটলাইন'
    },
    {
      title: 'সরকারি তথ্য ও সেবা',
      phone: '৩৩৩',
      description: 'সকল সরকারি সেবা, অফিসারদের তথ্য ও সামাজিক সমস্যার প্রতিকার'
    },
    {
      title: 'নারী ও শিশু নির্যাতন প্রতিরোধ',
      phone: '১০৯',
      description: 'টোল-ফ্রি জাতীয় হেল্পলাইন সেন্টার'
    },
    {
      title: 'সীতাকুণ্ড ফায়ার সার্ভিস স্টেশন',
      phone: '০১৮১৮-৪১৮৫১১',
      description: 'জরুরি অগ্নিনির্বাপণ ও উদ্ধার সেবা'
    },
    {
      title: 'সীতাকুণ্ড মডেল থানা পুলিশ',
      phone: '০১৩২০-১০৮৩৪৪',
      description: 'আইন-শৃঙ্খলা নিয়ন্ত্রণ ও সার্বক্ষণিক পুলিশ সহায়তা'
    },
    {
      title: 'সীতাকুণ্ড পৌরসভা কন্ট্রোল রুম',
      phone: '০১৬১৩-৬২৩২৭৬',
      description: 'পৌরসভার জরুরি নাগরিক সহায়তা ও দুর্যোগ ব্যবস্থাপনা সেল'
    }
  ],

  servicesList: [
    {
      id: 'demarcation',
      title: 'Land Demarcation & Verification',
      banglaTitle: 'ভূমি ডিমার্কেশন ও মালিকানা প্রত্যয়ন',
      category: 'প্রকৌশল ও নগর পরিকল্পনা শাখা',
      fee: '৳ ১০০/-',
      duration: '৩-৭ কার্যদিবস',
      iconName: 'MapPin',
      description: 'মৌজা নকশা ও খতিয়ান অনুযায়ী জমির সঠিক সীমানা চিহ্নিতকরণ ও সরজমিন তদন্ত সাপেক্ষে ডিজিটাল প্রত্যয়নপত্র ইস্যু।',
      serviceAction: 'apply',
      badge: 'সর্বাধিক জনপ্রিয়'
    },
    {
      id: 'tracking',
      title: 'Real-time Application Tracking',
      banglaTitle: 'অনলাইন আবেদন লাইভ ট্র্যাকিং',
      category: 'ডিজিটাল ই-সেবা',
      fee: 'সম্পূর্ণ ফ্রি',
      duration: 'তাৎক্ষণিক (Instant)',
      iconName: 'Search',
      description: 'ট্র্যাকিং আইডি অথবা মোবাইল নম্বর দিয়ে ডিমার্কেশন, ইমারত অনুমোদন ও রাস্তা কর্তনের রিয়েল-টাইম অগ্রগতি পর্যবেক্ষণ।',
      serviceAction: 'track',
      badge: 'QR কোড ভেরিফাইড'
    },
    {
      id: 'schedule1',
      title: 'Building Construction Approval (Schedule-1)',
      banglaTitle: 'ইমারত নির্মাণ অনুমোদন (তফসিল-১)',
      category: 'প্রকৌশল ও নকশা অনুমোদন শাখা',
      fee: '৳ ১,০০০/- + বিধি মোতাবেক ফি ও ভ্যাট',
      duration: '৭-১৫ কার্যদিবস',
      iconName: 'Building2',
      description: 'ইমারত নির্মাণ বিধিমালা অনুযায়ী ভবনের প্ল্যান অনুমোদন, নক্সাকার রিভিউ এবং নির্বাহী প্রকৌশলীর ডিজিটাল অনুমোদন।',
      serviceAction: 'schedule1',
      badge: 'অফিসিয়াল ফরম'
    },
    {
      id: 'roadcutting',
      title: 'Road Cutting Permission',
      banglaTitle: 'রাস্তা কর্তন ও মেরামত অনুমতি',
      category: 'সড়ক ও অবকাঠামো শাখা',
      fee: '৳ ৩০০/- (আবেদন ফি)',
      duration: '৩-৫ কার্যদিবস',
      iconName: 'Construction',
      description: 'পানি, গ্যাস, বিদ্যুৎ, ড্রেনেজ বা ভূগর্ভস্থ লাইন সংযোগের জন্য পৌর সড়ক খননের অনুমতি ও পুনঃনির্মাণ পরিমাপ।',
      serviceAction: 'roadcutting',
      badge: 'পৌর ক্যাশ কাউন্টার'
    },
    {
      id: 'holdingtax',
      title: 'Holding Tax & Assessment',
      banglaTitle: 'হোল্ডিং ট্যাক্স ও অনলাইন কর নিরূপণ',
      category: 'রাজস্ব শাখা',
      fee: 'নির্ধারিত মূল্যায়ন অনুযায়ী',
      duration: 'তাৎক্ষণিক অনলাইন যাচাই',
      iconName: 'Receipt',
      description: 'পৌরসভার আওতাধীন বাসাবাড়ি ও বাণিজ্যিক প্রতিষ্ঠানের হোল্ডিং ট্যাক্স রেকর্ড, বকেয়া অনুসন্ধান ও ডিজিটাল রসিদ।',
      serviceAction: 'info',
      badge: 'স্মার্ট ট্যাক্স'
    },
    {
      id: 'tradelicense',
      title: 'e-Trade License',
      banglaTitle: 'ডিজিটাল ট্রেড লাইসেন্স ইস্যু ও নবায়ন',
      category: 'বাণিজ্য ও রাজস্ব শাখা',
      fee: 'ব্যবসার ধরন অনুযায়ী সরকারি ফি',
      duration: '২-৩ কার্যদিবস',
      iconName: 'Award',
      description: 'ব্যবসায়ীদের জন্য দ্রুততম সময়ে ই-ট্রেড লাইসেন্স প্রাপ্তি ও বার্ষিক নবায়ন সেবা।',
      serviceAction: 'info',
      badge: 'ব্যবসা সহজীকরণ'
    },
    {
      id: 'birthdeath',
      title: 'Birth & Death Registration',
      banglaTitle: 'জন্ম ও মৃত্যু নিবন্ধন সহায়তা সেল',
      category: 'সাধারণ প্রশাসন শাখা',
      fee: 'সরকারি নির্ধারিত ফি',
      duration: '১-২ কার্যদিবস',
      iconName: 'FileCheck',
      description: 'নাগরিকদের জন্ম ও মৃত্যু সনদের আবেদন যাচাই, সংশোধন ও স্থানীয় কাউন্সিলর কার্যালয় সত্যায়ন।',
      serviceAction: 'info',
      badge: 'নাগরিক অধিকার'
    },
    {
      id: 'complaint',
      title: 'Citizen Grievance Redressal',
      banglaTitle: 'নাগরিক অভিযোগ ও সমস্যা প্রতিকার সেল',
      category: 'পৌর প্রশাসন ও সচিব শাখা',
      fee: 'সম্পূর্ণ ফ্রি',
      duration: '২৪-৪৮ ঘণ্টার মধ্যে রেসপন্স',
      iconName: 'MessageSquare',
      description: 'সড়ক বাতি বিকল, ড্রেনেজ জটলা, আবর্জনা অপসারণ বা পৌর সেবা সংক্রান্ত যেকোনো অভিযোগ সরাসরি দাখিলের সুযোগ।',
      serviceAction: 'info',
      badge: 'নাগরিক অধিকার'
    }
  ],

  statistics: [
    {
      label: 'মোট নাগরিক সেবা গ্রহণকারী',
      value: '১৫,৮৫০+',
      sublabel: 'অনলাইন ও অফলাইন সমন্বিত',
      iconName: 'Users'
    },
    {
      label: 'ডিজিটাল ডিমার্কেশন ও প্ল্যান অনুমোদন',
      value: '৪,২৫০+',
      sublabel: 'যাচাইকৃত ও প্রত্যয়িত খতিয়ান',
      iconName: 'CheckCircle2'
    },
    {
      label: 'মোট হোল্ডিং ও ট্রেড ডাটাবেজ',
      value: '২২,৪০০+',
      sublabel: 'ডিজিটালাইজড পৌর সম্পদ',
      iconName: 'Building'
    },
    {
      label: 'সেবা নিষ্পত্তির সফলতার হার',
      value: '৯৯.৪%',
      sublabel: 'স্বচ্ছ ও প্রযুক্তিনির্ভর প্রশাসন',
      iconName: 'ShieldCheck'
    }
  ],

  importantLinks: [
    { label: 'স্থানীয় সরকার বিভাগ (LGD)', url: 'https://lgd.gov.bd' },
    { label: 'জাতীয় তথ্য বাতায়ন (Bangladesh.gov.bd)', url: 'https://bangladesh.gov.bd' },
    { label: 'চট্টগ্রাম জেলা প্রশাসন বাতায়ন', url: 'http://www.chittagong.gov.bd' },
    { label: 'ভূমি মন্ত্রণালয় ডিজিটাল সেবা', url: 'https://land.gov.bd' },
    { label: 'ই-পাসপোর্ট ও ভিসা পোর্টাল', url: 'https://epassport.gov.bd' }
  ]
};

const STORAGE_KEY = 'sitakunda_smart_portal_config_v3';

export function getPortalConfig(): PortalConfig {
  if (typeof window === 'undefined') return DEFAULT_PORTAL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PORTAL_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PORTAL_CONFIG,
      ...parsed,
      councilMembers: Array.isArray(parsed.councilMembers)
        ? parsed.councilMembers
        : DEFAULT_PORTAL_CONFIG.councilMembers,
      emergencyNumbers: parsed.emergencyNumbers || DEFAULT_PORTAL_CONFIG.emergencyNumbers,
      servicesList: parsed.servicesList || DEFAULT_PORTAL_CONFIG.servicesList,
      marqueeNotices: parsed.marqueeNotices || DEFAULT_PORTAL_CONFIG.marqueeNotices,
      statistics: parsed.statistics || DEFAULT_PORTAL_CONFIG.statistics,
      importantLinks: parsed.importantLinks || DEFAULT_PORTAL_CONFIG.importantLinks,
      noticesList: parsed.noticesList || DEFAULT_PORTAL_CONFIG.noticesList,
    };
  } catch {
    return DEFAULT_PORTAL_CONFIG;
  }
}

export function savePortalConfig(config: PortalConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('portal-config-updated'));
    // Asynchronously synchronize with Hostinger MySQL Database
    savePortalConfigToApi(config).catch((err) => {
      console.warn('[Hostinger PortalConfig Sync] Deferred:', err);
    });
    return true;
  } catch (err) {
    console.error('Failed to save portal config:', err);
    // Even if localStorage quota is exceeded, try to save directly to server
    savePortalConfigToApi(config).catch(() => {});
    return false;
  }
}

export function resetPortalConfig(): PortalConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('portal-config-updated'));
    savePortalConfigToApi(DEFAULT_PORTAL_CONFIG).catch(() => {});
  }
  return DEFAULT_PORTAL_CONFIG;
}

/**
 * Synchronize portal config, council members, and notices with Hostinger MySQL
 */
export async function syncPortalConfigWithHostinger(): Promise<PortalConfig | null> {
  try {
    const remote = await fetchPortalConfigFromApi<PortalConfig>();
    if (remote && typeof remote === 'object') {
      const merged: PortalConfig = {
        ...DEFAULT_PORTAL_CONFIG,
        ...remote,
        councilMembers: Array.isArray(remote.councilMembers)
          ? remote.councilMembers
          : DEFAULT_PORTAL_CONFIG.councilMembers,
        noticesList: Array.isArray(remote.noticesList)
          ? remote.noticesList
          : DEFAULT_PORTAL_CONFIG.noticesList,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event('portal-config-updated'));
      return merged;
    }
  } catch (err) {
    console.warn('[Hostinger Settings Sync] Error:', err);
  }
  return null;
}


