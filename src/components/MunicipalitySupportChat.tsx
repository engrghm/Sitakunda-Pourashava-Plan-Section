import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  HelpCircle, 
  ExternalLink,
  Phone,
  FileText,
  Clock,
  Coins,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MunicipalityLogo } from './MunicipalityLogo';
import { toBanglaNumber } from '../utils/storage';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  quickActions?: Array<{ label: string; action: () => void; icon?: React.ReactNode }>;
}

interface MunicipalitySupportChatProps {
  onNavigateTab?: (tab: 'apply' | 'track' | 'admin') => void;
  onSelectTrackingId?: (trackingId: string) => void;
}

const QUICK_PROMPTS = [
  { id: 'fee', label: '💰 ডিমার্কেশন ফি কত ও কীভাবে দেব?', query: 'ডিমার্কেশন ফি কত' },
  { id: 'docs', label: '📋 কী কী কাগজপত্র প্রয়োজন?', query: 'কী কী কাগজপত্র লাগবে' },
  { id: 'time', label: '⏱️ আবেদন নিষ্পত্তি হতে কতদিন লাগে?', query: 'কতদিন সময় লাগবে' },
  { id: 'track', label: '🔍 আবেদনের অগ্রগতি কীভাবে জানব?', query: 'আবেদন ট্র্যাক করব কীভাবে' },
  { id: 'survey', label: '📐 নক্সাকার পরিদর্শন প্রক্রিয়া কী?', query: 'নক্সাকার সরজমিন পরিদর্শন' },
  { id: 'contact', label: '📞 পৌরসভা হেল্পলাইন ও অফিস', query: 'পৌরসভার যোগাযোগ ও হেল্পলাইন' },
];

export const MunicipalitySupportChat: React.FC<MunicipalitySupportChatProps> = ({
  onNavigateTab,
  onSelectTrackingId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `আসসালামু আলাইকুম! **সীতাকুণ্ড পৌরসভা ভূমির ডিমার্কেশন ও সঠিকতা যাচাই পোর্টালে** আপনাকে স্বাগতম।

আমি পৌরসভার ভার্চুয়াল এআই সহকারী। ভূমির ডিমার্কেশন ফি, প্রয়োজনীয় নথিপত্র, আবেদন দাখিল কিংবা বর্তমান অগ্রগতি সম্পর্কে আপনার যেকোনো প্রশ্ন করতে পারেন।`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Generate automated intelligent response based on municipality rules
  const generateBotResponse = (userQuery: string): { text: string; quickActions?: any[] } => {
    const q = userQuery.toLowerCase().trim();

    // 1. Fee related
    if (q.includes('ফি') || q.includes('টাকা') || q.includes('খরচ') || q.includes('fee') || q.includes('পেমেন্ট') || q.includes('খরচা') || q.includes('cost') || q.includes('charge')) {
      return {
        text: `**সরকারি ডিমার্কেশন ফি ও পরিশোধ নিয়মাবলী:**
• **ডিমার্কেশন আবেদন ফরম মূল্য:** **৳১০০.০০ (একশত টাকা মাত্র)**
• **তফসিল-১ আবেদন ফি:** **৳১,০০০.০০ (এক হাজার টাকা মাত্র)**

• **পরিশোধের মাধ্যম:**
সরাসরি **সীতাকুণ্ড পৌরসভা কার্যালয়ের ক্যাশ কাউন্টারে** ফি জমা দিয়ে অফিসিয়াল সিলযুক্ত মানি রসিদ গ্রহণ করতে হবে। ট্রেজারী চালান/ব্যাংক ড্রাফটের বিবরণ দায়িত্বপ্রাপ্ত নক্সাকার (সিভিল) তার অফিসিয়াল আইডি হতে সিস্টেমে এন্ট্রি ও যাচাই করবেন।`,
        quickActions: [
          {
            label: 'আবেদন ফরমে যান',
            action: () => {
              onNavigateTab?.('apply');
              setIsOpen(false);
            },
          },
        ],
      };
    }

    // 2. Documents required
    if (q.includes('কাগজ') || q.includes('নথি') || q.includes('দলিল') || q.includes('খতিয়ান') || q.includes('ডিসিআর') || q.includes('ডকুমেন্ট') || q.includes('document') || q.includes('কাগজপত্র')) {
      return {
        text: `**আবেদনের জন্য প্রয়োজনীয় নথিপত্রের তালিকা:**
১. **মালিকানা দলিল (Deed):** মূল রেজিস্ট্রিকৃত দলিলের স্পষ্ট স্ক্যান কপি/ছবি।
২. **বি.এস / সৃজিত খতিয়ান (Khatian):** সর্বশেষ নামজারি ও জমাভাগ খতিয়ান।
৩. **দাখিলা / ডিসিআর (DCR):** হালনাগাদ ভূমি উন্নয়ন কর (খাজনা) পরিশোধের রসিদ ও ডিসিআর।
৪. **জাতীয় পরিচয়পত্র (NID):** সকল ভূমি মালিক ও আবেদনকারীর এনআইডি কার্ডের কপি।
৫. **আবেদনকারীর পাসপোর্ট সাইজ ছবি ও জমির সাইট লেআউট স্কেচ (ঐচ্ছিক)।**

*নোট: আবেদন ফরমে ফাইলগুলো PDF বা স্পষ্ট JPEG/PNG ফরম্যাটে আপলোড করতে হবে।*`,
        quickActions: [
          {
            label: 'অনলাইন আবেদন শুরু করুন',
            action: () => {
              onNavigateTab?.('apply');
              setIsOpen(false);
            },
          },
        ],
      };
    }

    // 3. Processing Timeline
    if (q.includes('সময়') || q.includes('দিন') || q.includes('কতদিন') || q.includes('লাগে') || q.includes('time') || q.includes('duration') || q.includes('কত সময়')) {
      return {
        text: `**আবেদন প্রক্রিয়াকরণ ও সনদ প্রদানের সময়সীমা:**
• **মোট সময়:** আবেদন গ্রহণের **৭ থেকে ১০ কার্যদিবসের মধ্যে** চূড়ান্ত ডিমার্কেশন প্রত্যয়নপত্র প্রদান করা হয়।

**ধাপভিত্তিক সময় বণ্টন:**
১. প্রারম্ভিক নথিপত্র ও তফসিল যাচাই: **১-২ কার্যদিবস**
২. নক্সাকার (সিভিল) কর্তৃক সরজমিন সীমানা পরিমাপ: **৩-৫ কার্যদিবসের মধ্যে** (আবেদনকারীকে মোবাইলে SMS দিয়ে জানানো হবে)
৩. নির্বাহী প্রকৌশলী কর্তৃক চূড়ান্ত যাচাই ও ডিজিটাল স্বাক্ষর: **১-২ কার্যদিবস**`,
        quickActions: [
          {
            label: 'বর্তমান স্ট্যাটাস দেখুন',
            action: () => {
              onNavigateTab?.('track');
              setIsOpen(false);
            },
          },
        ],
      };
    }

    // 4. Tracking
    if (q.includes('ট্র্যাক') || q.includes('track') || q.includes('অবস্থা') || q.includes('স্ট্যাটাস') || q.includes('খোঁজ') || q.includes('skm-') || q.includes('আইডি')) {
      return {
        text: `**আবেদনের বর্তমান অবস্থা যাচাইয়ের উপায়:**
১. আবেদনের সময় প্রাপ্ত **ট্র্যাকিং আইডি** (যেমন: \`SKM-DEM-2026-0841\`) অথবা আপনার **মোবাইল নম্বর** দিয়ে পোর্টালে সার্চ করুন।
২. এছাড়া আপনার আবেদনের কিউআর কোডটি মোবাইল ক্যামেরায় স্ক্যান করেও তাৎক্ষণিক স্ট্যাটাস দেখা যাবে।
৩. প্রতিবার স্ট্যাটাস পরিবর্তন হলে আপনার ফোনে স্বয়ংক্রিয় SMS ও Email নোটিফিকেশন পাঠানো হয়।`,
        quickActions: [
          {
            label: 'ট্র্যাকিং পোর্টাল ওপেন করুন',
            action: () => {
              onNavigateTab?.('track');
              setIsOpen(false);
            },
          },
        ],
      };
    }

    // 5. Survey & Field Inspection
    if (q.includes('নক্সাকার') || q.includes('পরিদর্শন') || q.includes('সার্ভে') || q.includes('inspection') || q.includes('মাপজোক') || q.includes('আমিন') || q.includes('সার্ভেয়ার')) {
      return {
        text: `**নক্সাকার (সিভিল) সরজমিন পরিদর্শনের নিয়ম:**
• পৌরসভা থেকে দায়িত্বপ্রাপ্ত নক্সাকার সরজমিনে সাইট পরিদর্শনের নির্দিষ্ট তারিখ ও সময় আবেদনকারীকে আগেই SMS/ফোনে অবহিত করবেন।
• পরিদর্শনের সময় আবেদনকারী ও ক্ষেত্রবিশেষে সীমানার পার্শ্ববর্তী প্রতিবেশীদের উপস্থিত থাকতে অনুরোধ করা হয়।
• নক্সাকার বি.এস মৌজা ম্যাপ ও ফিতা/চেইন নিয়ে দাগের সঠিক সীমানা চিহ্নিত করে মাপজোক রিপোর্ট তৈরি করেন।`,
      };
    }

    // 6. Dispute / Boundaries
    if (q.includes('বিরোধ') || q.includes('মামলা') || q.includes('ঝামেলা') || q.includes('dispute') || q.includes('সমস্যা')) {
      return {
        text: `**সীমানা সংক্রান্ত বিরোধ নিষ্পত্তি সংক্রান্ত নির্দেশনা:**
• পৌরসভা কেবল ভূমির সরকারি রেকর্ড (বি.এস/দলিল) অনুযায়ী সঠিক দাগের অবস্থান ডিমার্কেশন ও সঠিকতা যাচাই করে।
• জমিতে যদি কোনো বিজ্ঞ আদালতের অস্থায়ী নিষেধাজ্ঞা বা মামলা চলমান থাকে, তবে সংশ্লিষ্ট আদালতের আদেশ চূড়ান্ত বলে গণ্য হবে।
• কোনো পার্শ্ববর্তী পক্ষের আপত্তি থাকলে উভয় পক্ষের উপস্থিতিতে যৌথভাবে সীমানা যাচাই করা হয়।`,
      };
    }

    // 7. Contact / Office info
    if (q.includes('যোগাযোগ') || q.includes('হেল্পলাইন') || q.includes('অফিস') || q.includes('ফোন') || q.includes('contact') || q.includes('address') || q.includes('ঠিকানা') || q.includes('মেয়র') || q.includes('প্রকৌশলী')) {
      return {
        text: `**সীতাকুণ্ড পৌরসভা কার্যালয় ও হেল্পডেস্ক:**
📍 **ঠিকানা:** সীতাকুণ্ড পৌরসভা ভবন, ঢাকা-চট্টগ্রাম মহাসড়ক, সীতাকুণ্ড, চট্টগ্রাম।
⏰ **অফিস সময়:** রবিবার হতে বৃহস্পতিবার, সকাল ৯:০০ টা - বিকাল ৫:০০ টা (সরকারি ছুটির দিন ব্যতীত)।
📞 **ডিজিটাল হেল্পলাইন:** 01819-847291 / 01711-394820
✉️ **ইমেইল:** info@sitakundapourashava.gov.bd
🌐 **ওয়েবসাইট:** sitakundapourashava.gov.bd`,
      };
    }

    // Default Fallback Response
    return {
      text: `আপনার প্রশ্নের জন্য ধন্যবাদ! 

সীতাকুণ্ড পৌরসভা ভূমির ডিমার্কেশন পোর্টাল সম্পর্কিত যেকোনো তথ্যের জন্য নিচের বিষয়গুলো বেছে নিতে পারেন:
• **ডিমার্কেশন ফি:** সর্বমোট ৳৬০০
• **প্রয়োজনীয় কাগজপত্র:** খতিয়ান, দলিল, ডিসিআর ও এনআইডি
• **সনদ পাওয়ার সময়:** ৭-১০ কার্যদিবস
• **আবেদন ট্র্যাকিং:** ট্র্যাকিং আইডি বা মোবাইল নম্বর দিয়ে সার্চ

আপনার যদি বিশেষ কোনো তদন্ত বা সহায়তা প্রয়োজন হয়, সরাসরি পৌরসভার প্রকৌশল শাখায় যোগাযোগ করতে পারেন।`,
      quickActions: [
        {
          label: 'নতুন আবেদন করুন',
          action: () => {
            onNavigateTab?.('apply');
            setIsOpen(false);
          },
        },
        {
          label: 'আবেদন ট্র্যাক করুন',
          action: () => {
            onNavigateTab?.('track');
            setIsOpen(false);
          },
        },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate natural AI thinking/typing delay (550ms)
    setTimeout(() => {
      const responseData = generateBotResponse(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseData.text,
        timestamp: new Date(),
        quickActions: responseData.quickActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handlePromptClick = (promptQuery: string) => {
    handleSendMessage(promptQuery);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `চ্যাট হিস্ট্রি রিসেট করা হয়েছে। কীভাবে আপনাকে সহায়তা করতে পারি?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 scale-95'
              : 'bg-gradient-to-r from-emerald-800 to-emerald-950 text-white hover:from-emerald-700 hover:to-emerald-900 border-2 border-emerald-400/40 hover:scale-105 shadow-emerald-950/40'
          }`}
          title="পৌরসভা এআই সহায়তা চ্যাট"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <div className="relative">
                <MessageSquare className="w-6 h-6 text-emerald-100" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full"></span>
              </div>
            </>
          )}

          {/* Floating Pill Label */}
          {!isOpen && (
            <div className="hidden sm:flex absolute right-full mr-3 items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>সহায়তা AI</span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[550px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-kalpurush">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-slate-900 text-white p-4 flex items-center justify-between border-b border-emerald-700/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center border border-emerald-400/40">
                  <MunicipalityLogo className="w-7 h-7" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>পৌরসভা সহায়তা এআই</span>
                  <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-normal">
                    AI Assistant
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>অনলাইন • তাৎক্ষণিক নাগরিক হেল্পডেস্ক</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="চ্যাট হিস্ট্রি মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-4 h-4 text-emerald-200" />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2 ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                        : 'bg-emerald-800 text-white rounded-br-xs'
                    }`}
                  >
                    <div className="leading-relaxed whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Simple bold parsing
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lIdx} className={line === '' ? 'h-2' : ''}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong
                                    key={pIdx}
                                    className={isBot ? 'text-emerald-950 font-bold' : 'text-amber-200 font-bold'}
                                  >
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              if (part.startsWith('`') && part.endsWith('`')) {
                                return (
                                  <code
                                    key={pIdx}
                                    className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                                      isBot ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-emerald-900 text-emerald-100'
                                    }`}
                                  >
                                    {part.slice(1, -1)}
                                  </code>
                                );
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bot Quick Actions */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                        {msg.quickActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={action.action}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors cursor-pointer"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-700" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-right ${
                        isBot ? 'text-slate-400' : 'text-emerald-200'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                      <User className="w-4 h-4 text-slate-700" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">টাইপ করছেন</span>
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-thin">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePromptClick(p.query)}
                className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-300 hover:border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs transition-all shrink-0 cursor-pointer font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="পৌরসভার সেবা সম্পর্কে যেকোনো প্রশ্ন লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-950 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="বার্তা পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
