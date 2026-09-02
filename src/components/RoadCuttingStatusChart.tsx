import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RoadCuttingApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Layers,
  Construction,
  Coins
} from 'lucide-react';

export type TimeRangeOption = '30d' | '6m' | '1y' | '5y' | 'all';

interface RoadCuttingStatusChartProps {
  applications: RoadCuttingApplication[];
  onStatusClick?: (status: string) => void;
  onPurposeClick?: (purpose: string) => void;
}

const MONTH_NAMES_BANGLA = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export const RoadCuttingStatusChart: React.FC<RoadCuttingStatusChartProps> = ({ 
  applications, 
  onStatusClick,
  onPurposeClick
}) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'distribution' | 'purpose' | 'ward'>('trend');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');
  const [chartSubtype, setChartSubtype] = useState<'area' | 'bar'>('area');

  const submittedCount = applications.filter((a) => a.status === 'submitted').length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const total = applications.length;

  const totalFees = applications.reduce((sum, a) => sum + (a.applicationFee || 100), 0);

  const statusData = [
    {
      name: 'দাখিলকৃত / অপেক্ষমান',
      shortName: 'দাখিলকৃত',
      statusCode: 'submitted',
      count: submittedCount,
      banglaCount: toBanglaNumber(submittedCount),
      color: '#f59e0b',
      fill: '#f59e0b',
    },
    {
      name: 'তদন্তাধীন ও পরিদর্শনে',
      shortName: 'তদন্তাধীন',
      statusCode: 'under_review',
      count: underReviewCount,
      banglaCount: toBanglaNumber(underReviewCount),
      color: '#3b82f6',
      fill: '#3b82f6',
    },
    {
      name: 'অনুমোদিত অনুমতিপত্র',
      shortName: 'অনুমোদিত',
      statusCode: 'approved',
      count: approvedCount,
      banglaCount: toBanglaNumber(approvedCount),
      color: '#059669',
      fill: '#059669',
    },
    {
      name: 'বাতিল / অযোগ্য',
      shortName: 'বাতিল',
      statusCode: 'rejected',
      count: rejectedCount,
      banglaCount: toBanglaNumber(rejectedCount),
      color: '#ef4444',
      fill: '#ef4444',
    },
  ];

  const purposeData = useMemo(() => {
    const counts: Record<string, number> = {
      'পানি সরবরাহ': 0,
      'গ্যাস লাইন': 0,
      'ড্রেন / পয়ঃনিষ্কাশন': 0,
      'বিদ্যুৎ ক্যাবল': 0,
      'টেলিকম ও ফাইবার': 0,
      'অন্যান্য': 0,
    };

    applications.forEach((a) => {
      const p = (a.purposeTitle || a.purpose || '').toString();
      if (p.includes('পানি') || p.includes('ওয়াসা')) counts['পানি সরবরাহ']++;
      else if (p.includes('গ্যাস')) counts['গ্যাস লাইন']++;
      else if (p.includes('ড্রেন') || p.includes('পয়ঃ')) counts['ড্রেন / পয়ঃনিষ্কাশন']++;
      else if (p.includes('বিদ্যুৎ')) counts['বিদ্যুৎ ক্যাবল']++;
      else if (p.includes('টেলিকম') || p.includes('ফাইবার')) counts['টেলিকম ও ফাইবার']++;
      else counts['অন্যান্য']++;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      banglaCount: toBanglaNumber(count),
      color: name.includes('পানি') ? '#0284c7' : name.includes('গ্যাস') ? '#d97706' : name.includes('ড্রেন') ? '#059669' : name.includes('বিদ্যুৎ') ? '#eab308' : name.includes('টেলিকম') ? '#8b5cf6' : '#64748b'
    }));
  }, [applications]);

  const wardData = useMemo(() => {
    const wards = Array.from({ length: 9 }, (_, i) => String(i + 1));
    return wards.map((w) => {
      const count = applications.filter((a) => (a.wardNo || '').toString().includes(w)).length;
      return {
        ward: `${toBanglaNumber(w)} নং ওয়ার্ড`,
        wardNo: w,
        count,
        banglaCount: toBanglaNumber(count),
      };
    });
  }, [applications]);

  const trendData = useMemo(() => {
    const now = new Date();
    const result = [];

    if (timeRange === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const day = d.getDate();
        const label = `${toBanglaNumber(day)} ${MONTH_NAMES_BANGLA[d.getMonth()]}`;

        const incomingOnDay = applications.filter((a) => a.createdAt && a.createdAt.startsWith(dateKey)).length;
        const completedOnDay = applications.filter((a) => a.status === 'approved' && a.createdAt && a.createdAt.startsWith(dateKey)).length;

        result.push({ dateKey, label, fullDateStr: formatBanglaDate(dateKey), incoming: incomingOnDay, completed: completedOnDay });
      }
    } else if (timeRange === '6m') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${MONTH_NAMES_BANGLA[m]} '${toBanglaNumber(y.toString().slice(-2))}`;
        const fullDateStr = `${MONTH_NAMES_BANGLA[m]} ${toBanglaNumber(y)}`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(monthPrefix)).length;
        const completed = applications.filter((a) => a.status === 'approved' && a.createdAt && a.createdAt.startsWith(monthPrefix)).length;

        result.push({ dateKey: monthPrefix, label, fullDateStr, incoming, completed });
      }
    } else if (timeRange === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${MONTH_NAMES_BANGLA[m]} '${toBanglaNumber(y.toString().slice(-2))}`;
        const fullDateStr = `${MONTH_NAMES_BANGLA[m]} ${toBanglaNumber(y)}`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(monthPrefix)).length;
        const completed = applications.filter((a) => a.status === 'approved' && a.createdAt && a.createdAt.startsWith(monthPrefix)).length;

        result.push({ dateKey: monthPrefix, label, fullDateStr, incoming, completed });
      }
    } else if (timeRange === '5y') {
      const currentYear = now.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const y = currentYear - i;
        const yearPrefix = `${y}`;
        const label = `${toBanglaNumber(y)}`;
        const fullDateStr = `${toBanglaNumber(y)} সাল`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(yearPrefix)).length;
        const completed = applications.filter((a) => a.status === 'approved' && a.createdAt && a.createdAt.startsWith(yearPrefix)).length;

        result.push({ dateKey: yearPrefix, label, fullDateStr, incoming, completed });
      }
    } else {
      // 'all'
      const currentYear = now.getFullYear();
      const startYear = Math.min(
        currentYear - 2,
        ...applications.map((a) => parseInt(a.createdAt?.split('-')[0] || `${currentYear}`, 10)).filter((n) => !isNaN(n))
      );

      for (let y = startYear; y <= currentYear; y++) {
        for (let q = 1; q <= 4; q++) {
          const qStartMonth = (q - 1) * 3 + 1;
          const qEndMonth = q * 3;
          const qLabel = `Q${toBanglaNumber(q)} '${toBanglaNumber(y.toString().slice(-2))}`;
          const fullDateStr = `${toBanglaNumber(y)} সালের কোয়ার্টার ${toBanglaNumber(q)}`;

          const incoming = applications.filter((a) => {
            if (!a.createdAt) return false;
            const [appY, appM] = a.createdAt.split('-').map(Number);
            return appY === y && appM >= qStartMonth && appM <= qEndMonth;
          }).length;

          const completed = applications.filter((a) => {
            if (a.status !== 'approved') return false;
            const dateStr = a.createdAt;
            if (!dateStr) return false;
            const [appY, appM] = dateStr.split('-').map(Number);
            return appY === y && appM >= qStartMonth && appM <= qEndMonth;
          }).length;

          result.push({ dateKey: `${y}-Q${q}`, label: qLabel, fullDateStr, incoming, completed });
        }
      }
    }

    return result;
  }, [applications, timeRange]);

  const timeRangeOptions: Array<{ id: TimeRangeOption; label: string }> = [
    { id: '30d', label: '৩০ দিন' },
    { id: '6m', label: '৬ মাস' },
    { id: '1y', label: '১ বছর' },
    { id: '5y', label: '৫ বছর' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <Construction className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>রাস্তা কর্তন অনুমোদন ড্যাশবোর্ড অ্যানালিটিক্স ও আবেদন পরিসংখ্যান</span>
              <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                {toBanglaNumber(total)} টি আবেদন
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              পৌর এলাকার রাস্তা কর্তন অনুমতির রিয়েল-টাইম চার্ট ও পরিসংখ্যান
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trend' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>আবেদন ট্রেন্ড</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'distribution' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>স্ট্যাটাস অনুপাত</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purpose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'purpose' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>কর্তনের উদ্দেশ্য</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ward')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ward' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ওয়ার্ডভিত্তিক</span>
          </button>
        </div>
      </div>

      {/* Top Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => onStatusClick && onStatusClick('submitted')}
          className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer hover:shadow-xs transition-all"
        >
          <span className="text-[11px] text-amber-800 font-bold block">নতুন দাখিলকৃত</span>
          <span className="text-xl font-black text-amber-950 block mt-0.5">{toBanglaNumber(submittedCount)}</span>
          <span className="text-[10px] text-amber-700">পরিদর্শনের অপেক্ষায়</span>
        </div>

        <div 
          onClick={() => onStatusClick && onStatusClick('under_review')}
          className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl cursor-pointer hover:shadow-xs transition-all"
        >
          <span className="text-[11px] text-blue-800 font-bold block">তদন্ত ও পরিদর্শনে</span>
          <span className="text-xl font-black text-blue-950 block mt-0.5">{toBanglaNumber(underReviewCount)}</span>
          <span className="text-[10px] text-blue-700">পরিমাপ প্রক্রিয়ায়</span>
        </div>

        <div 
          onClick={() => onStatusClick && onStatusClick('approved')}
          className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer hover:shadow-xs transition-all"
        >
          <span className="text-[11px] text-emerald-800 font-bold block">অনুমোদিত অনুমতিপত্র</span>
          <span className="text-xl font-black text-emerald-950 block mt-0.5">{toBanglaNumber(approvedCount)}</span>
          <span className="text-[10px] text-emerald-700">অনুমতিপত্র ইস্যু সম্পন্ন</span>
        </div>

        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
          <span className="text-[11px] text-indigo-800 font-bold block">মোট ফরম ফি আদায়</span>
          <span className="text-xl font-black text-indigo-950 block mt-0.5">৳ {toBanglaNumber(totalFees)}/-</span>
          <span className="text-[10px] text-indigo-700">প্রতি ফরম ৳ ১০০/-</span>
        </div>
      </div>

      {/* TAB 1: Trend View */}
      {activeTab === 'trend' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>সময়সীমা:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 flex-wrap">
                {timeRangeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeRange(opt.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      timeRange === opt.id ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChartSubtype('area')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md border cursor-pointer ${
                  chartSubtype === 'area' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                এরিয়া চার্ট
              </button>
              <button
                type="button"
                onClick={() => setChartSubtype('bar')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md border cursor-pointer ${
                  chartSubtype === 'bar' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                বার চার্ট
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartSubtype === 'area' ? (
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncomingRC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompletedRC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip formatter={(value: any) => [toBanglaNumber(value) + ' টি', '']} />
                  <Legend formatter={(value) => value === 'incoming' ? 'নতুন দাখিল' : 'অনুমোদিত'} />
                  <Area type="monotone" dataKey="incoming" stroke="#f59e0b" fillOpacity={1} fill="url(#colorIncomingRC)" name="incoming" strokeWidth={2} />
                  <Area type="monotone" dataKey="completed" stroke="#059669" fillOpacity={1} fill="url(#colorCompletedRC)" name="completed" strokeWidth={2} />
                </AreaChart>
              ) : (
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip formatter={(value: any) => [toBanglaNumber(value) + ' টি', '']} />
                  <Legend formatter={(value) => value === 'incoming' ? 'নতুন দাখিল' : 'অনুমোদিত'} />
                  <Bar dataKey="incoming" fill="#f59e0b" name="incoming" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#059669" name="completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 2: Distribution Pie */}
      {activeTab === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [toBanglaNumber(value) + ' টি', 'আবেদন সংখ্যা']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              স্ট্যাটাসভিত্তিক বিভাজন বিস্তারিত:
            </h4>
            {statusData.map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div
                  key={item.statusCode}
                  onClick={() => onStatusClick && onStatusClick(item.statusCode)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{item.banglaCount} টি</span>
                    <span className="text-[10px] font-bold text-slate-500">({toBanglaNumber(percent)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Purpose Breakdown */}
      {activeTab === 'purpose' && (
        <div className="space-y-4">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purposeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip formatter={(value: any) => [toBanglaNumber(value) + ' টি', 'আবেদন সংখ্যা']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
            {purposeData.map((p) => (
              <div 
                key={p.name}
                onClick={() => onPurposeClick && onPurposeClick(p.name)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-colors"
              >
                <span className="text-[11px] font-bold text-slate-700 block truncate">{p.name}</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{p.banglaCount} টি</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Ward-wise Breakdown */}
      {activeTab === 'ward' && (
        <div className="space-y-4">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="ward" tick={{ fontSize: 10.5, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip formatter={(value: any) => [toBanglaNumber(value) + ' টি', 'আবেদন সংখ্যা']} />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
