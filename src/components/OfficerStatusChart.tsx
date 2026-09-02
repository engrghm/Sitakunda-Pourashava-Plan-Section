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
import { DemarcationApplication } from '../types';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Inbox, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

export type TimeRangeOption = '30d' | '6m' | '1y' | '5y' | 'all';

interface OfficerStatusChartProps {
  applications: DemarcationApplication[];
  onStatusClick?: (status: string) => void;
}

const MONTH_NAMES_BANGLA = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export const OfficerStatusChart: React.FC<OfficerStatusChartProps> = ({ 
  applications, 
  onStatusClick 
}) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'distribution'>('trend');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');
  const [chartSubtype, setChartSubtype] = useState<'area' | 'bar'>('area');

  // Overall status counts
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const investigatingCount = applications.filter((a) => a.status === 'investigating' || a.status === 'under_review').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const total = applications.length;

  // Distribution chart data
  const statusData = [
    {
      name: 'অপেক্ষমান (Pending)',
      shortName: 'অপেক্ষমান',
      statusCode: 'pending',
      count: pendingCount,
      banglaCount: toBanglaNumber(pendingCount),
      color: '#f59e0b', // amber-500
      fill: '#f59e0b',
    },
    {
      name: 'তদন্তাধীন (Investigating)',
      shortName: 'তদন্তাধীন',
      statusCode: 'investigating',
      count: investigatingCount,
      banglaCount: toBanglaNumber(investigatingCount),
      color: '#3b82f6', // blue-500
      fill: '#3b82f6',
    },
    {
      name: 'অনুমোদিত / সম্পন্ন (Completed)',
      shortName: 'সম্পন্ন',
      statusCode: 'approved',
      count: approvedCount,
      banglaCount: toBanglaNumber(approvedCount),
      color: '#059669', // emerald-600
      fill: '#059669',
    },
    {
      name: 'বাতিল (Rejected)',
      shortName: 'বাতিল',
      statusCode: 'rejected',
      count: rejectedCount,
      banglaCount: toBanglaNumber(rejectedCount),
      color: '#ef4444', // red-500
      fill: '#ef4444',
    },
  ];

  // Dynamic Multi-Range Trend Data Calculation (30 Days, 6 Months, 1 Year, 5 Years, All)
  const trendData = useMemo(() => {
    const now = new Date();
    const result: Array<{
      dateKey: string;
      label: string;
      fullDateStr: string;
      incoming: number;
      pending: number;
      completed: number;
    }> = [];

    if (timeRange === '30d') {
      // Last 30 daily buckets
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const day = d.getDate();
        const label = `${toBanglaNumber(day)} ${MONTH_NAMES_BANGLA[d.getMonth()]}`;

        const incomingOnDay = applications.filter((a) => {
          return a.createdAt === dateKey || (a.createdAt && a.createdAt.startsWith(dateKey));
        }).length;

        const completedOnDay = applications.filter((a) => {
          if (a.status !== 'approved') return false;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate === dateKey || (approvalDate && approvalDate.startsWith(dateKey));
        }).length;

        const pendingOnDay = applications.filter((a) => {
          const isCreatedBeforeOrOn = a.createdAt <= dateKey;
          if (!isCreatedBeforeOrOn) return false;
          if (a.status === 'pending' || a.status === 'investigating' || a.status === 'under_review') return true;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate > dateKey;
        }).length;

        result.push({
          dateKey,
          label,
          fullDateStr: formatBanglaDate(dateKey),
          incoming: incomingOnDay,
          pending: pendingOnDay,
          completed: completedOnDay,
        });
      }
    } else if (timeRange === '6m') {
      // Last 6 months buckets
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${MONTH_NAMES_BANGLA[m]} '${toBanglaNumber(y.toString().slice(-2))}`;
        const fullDateStr = `${MONTH_NAMES_BANGLA[m]} ${toBanglaNumber(y)}`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(monthPrefix)).length;
        const completed = applications.filter((a) => {
          if (a.status !== 'approved') return false;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate && approvalDate.startsWith(monthPrefix);
        }).length;

        const pending = applications.filter((a) => {
          const isCreatedBeforeOrInMonth = a.createdAt <= `${monthPrefix}-31`;
          if (!isCreatedBeforeOrInMonth) return false;
          if (a.status === 'pending' || a.status === 'investigating' || a.status === 'under_review') return true;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate > `${monthPrefix}-31`;
        }).length;

        result.push({
          dateKey: monthPrefix,
          label,
          fullDateStr,
          incoming,
          pending,
          completed,
        });
      }
    } else if (timeRange === '1y') {
      // Last 12 months buckets
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${MONTH_NAMES_BANGLA[m]} '${toBanglaNumber(y.toString().slice(-2))}`;
        const fullDateStr = `${MONTH_NAMES_BANGLA[m]} ${toBanglaNumber(y)}`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(monthPrefix)).length;
        const completed = applications.filter((a) => {
          if (a.status !== 'approved') return false;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate && approvalDate.startsWith(monthPrefix);
        }).length;

        const pending = applications.filter((a) => {
          const isCreatedBeforeOrInMonth = a.createdAt <= `${monthPrefix}-31`;
          if (!isCreatedBeforeOrInMonth) return false;
          if (a.status === 'pending' || a.status === 'investigating' || a.status === 'under_review') return true;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate > `${monthPrefix}-31`;
        }).length;

        result.push({
          dateKey: monthPrefix,
          label,
          fullDateStr,
          incoming,
          pending,
          completed,
        });
      }
    } else if (timeRange === '5y') {
      // Last 5 years buckets
      const currentYear = now.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const y = currentYear - i;
        const yearPrefix = `${y}`;
        const label = `${toBanglaNumber(y)}`;
        const fullDateStr = `${toBanglaNumber(y)} সাল`;

        const incoming = applications.filter((a) => a.createdAt && a.createdAt.startsWith(yearPrefix)).length;
        const completed = applications.filter((a) => {
          if (a.status !== 'approved') return false;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate && approvalDate.startsWith(yearPrefix);
        }).length;

        const pending = applications.filter((a) => {
          const isCreatedBeforeOrInYear = a.createdAt <= `${yearPrefix}-12-31`;
          if (!isCreatedBeforeOrInYear) return false;
          if (a.status === 'pending' || a.status === 'investigating' || a.status === 'under_review') return true;
          const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
          return approvalDate > `${yearPrefix}-12-31`;
        }).length;

        result.push({
          dateKey: yearPrefix,
          label,
          fullDateStr,
          incoming,
          pending,
          completed,
        });
      }
    } else {
      // 'all' range - All-time overview grouped by quarter or month
      // Collect all years represented or past 2-3 years
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
            const dateStr = a.engineerApproval?.approvalDate || a.createdAt;
            if (!dateStr) return false;
            const [appY, appM] = dateStr.split('-').map(Number);
            return appY === y && appM >= qStartMonth && appM <= qEndMonth;
          }).length;

          const pending = applications.filter((a) => {
            const dateMax = `${y}-${String(qEndMonth).padStart(2, '0')}-31`;
            if (a.createdAt > dateMax) return false;
            if (a.status === 'pending' || a.status === 'investigating' || a.status === 'under_review') return true;
            const approvalDate = a.engineerApproval?.approvalDate || a.createdAt;
            return approvalDate > dateMax;
          }).length;

          result.push({
            dateKey: `${y}-Q${q}`,
            label: qLabel,
            fullDateStr,
            incoming,
            pending,
            completed,
          });
        }
      }
    }

    return result;
  }, [applications, timeRange]);

  // Aggregate metrics for currently selected time range
  const rangeIncoming = useMemo(() => {
    return trendData.reduce((sum, d) => sum + d.incoming, 0);
  }, [trendData]);

  const rangeCompleted = useMemo(() => {
    return trendData.reduce((sum, d) => sum + d.completed, 0);
  }, [trendData]);

  const rangePending = pendingCount + investigatingCount;

  // Title translation based on timeRange
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '30d': return 'গত ৩০ দিন';
      case '6m': return 'গত ৬ মাস';
      case '1y': return 'গত ১ বছর';
      case '5y': return 'গত ৫ বছর';
      case 'all': return 'সার্বিক (All-Time)';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5">
      {/* Chart Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              ড্যাশবোর্ড অ্যানালিটিক্স ও আবেদন পরিসংখ্যান ({getTimeRangeLabel()})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সীতাকুণ্ড পৌরসভার ভূমির ডিমার্কেশন আবেদনসমূহের আগমন, অপেক্ষমান ও নিষ্পত্তির চিত্র
          </p>
        </div>

        {/* Tab, Time-Range & Sub-type Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('trend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'trend'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>ট্রেন্ড বিশ্লেষণ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('distribution')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'distribution'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>স্ট্যাটাস বণ্টন</span>
            </button>
          </div>

          {/* Time Range Options (30 Days, 6 Months, 1 Year, 5 Years, All) */}
          {activeTab === 'trend' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '30d'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="গত ৩০ দিনের ট্রেন্ড"
              >
                ৩০ দিন
              </button>

              <button
                type="button"
                onClick={() => setTimeRange('6m')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '6m'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="গত ৬ মাসের ট্রেন্ড"
              >
                ৬ মাস
              </button>

              <button
                type="button"
                onClick={() => setTimeRange('1y')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '1y'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="গত ১ বছরের ট্রেন্ড"
              >
                ১ বছর
              </button>

              <button
                type="button"
                onClick={() => setTimeRange('5y')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '5y'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="গত ৫ বছরের ট্রেন্ড"
              >
                ৫ বছর
              </button>

              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="সকল সময়কালের সার্বিক ট্রেন্ড (All-Time)"
              >
                All
              </button>
            </div>
          )}

          {/* Area vs Bar Sub-type */}
          {activeTab === 'trend' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setChartSubtype('area')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartSubtype === 'area' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="স্মুথ এরিয়া চার্ট"
              >
                এরিয়া
              </button>
              <button
                type="button"
                onClick={() => setChartSubtype('bar')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartSubtype === 'bar' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="বার চার্ট"
              >
                বার
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Metric Chips for Selected Time-Range */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-slate-100">
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-800 font-medium block">
              {getTimeRangeLabel()} নতুন আবেদন
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-950 font-mono">
              {toBanglaNumber(rangeIncoming)} টি
            </span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-amber-800 font-medium block">অপেক্ষমান ও তদন্তাধীন</span>
            <span className="text-sm sm:text-base font-bold text-amber-950 font-mono">
              {toBanglaNumber(rangePending)} টি
            </span>
          </div>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-blue-800 font-medium block">
              {getTimeRangeLabel()} অনুমোদিত
            </span>
            <span className="text-sm sm:text-base font-bold text-blue-950 font-mono">
              {toBanglaNumber(rangeCompleted)} টি
            </span>
          </div>
        </div>

        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-purple-800 font-medium block">অনুমোদন সাফল্যের হার</span>
            <span className="text-sm sm:text-base font-bold text-purple-950 font-mono">
              {rangeIncoming > 0 ? toBanglaNumber(((rangeCompleted / rangeIncoming) * 100).toFixed(0)) : (total > 0 ? toBanglaNumber(((approvedCount / total) * 100).toFixed(0)) : '০')}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="pt-4">
        {activeTab === 'trend' ? (
          /* Multi-Range Trend Chart (Recharts Area / Bar Chart) */
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>{getTimeRangeLabel()} আবেদন প্রবাহ (Incoming vs. Pending vs. Completed)</span>
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span> নতুন ইনকামিং
                </span>
                <span className="flex items-center gap-1 text-amber-800 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span> অপেক্ষমান
                </span>
                <span className="flex items-center gap-1 text-blue-800 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block"></span> সম্পন্ন/অনুমোদিত
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartSubtype === 'area' ? (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      interval={timeRange === '30d' ? 3 : 0}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                                সময়কাল: {dataPoint.fullDateStr || label}
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-300">
                                <span>নতুন ইনকামিং:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.incoming)} টি</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-amber-300">
                                <span>অপেক্ষমান কিউ:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.pending)} টি</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-blue-300">
                                <span>সম্পন্ন ও প্রত্যয়নকৃত:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.completed)} টি</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="incoming" 
                      name="নতুন আবেদন" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorIncoming)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      name="অপেক্ষমান" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPending)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      name="সম্পন্ন" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      interval={timeRange === '30d' ? 3 : 0}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                              <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                                সময়কাল: {dataPoint.fullDateStr || label}
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-300">
                                <span>নতুন ইনকামিং:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.incoming)} টি</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-amber-300">
                                <span>অপেক্ষমান:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.pending)} টি</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-blue-300">
                                <span>সম্পন্ন:</span>
                                <strong className="font-mono">{toBanglaNumber(dataPoint.completed)} টি</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="incoming" name="নতুন আবেদন" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="অপেক্ষমান" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="সম্পন্ন" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Overall Status Breakdown View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="lg:col-span-2 h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    animationDuration={800}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              ></span>
                              <span>{item.name}</span>
                            </div>
                            <div className="text-slate-300">
                              আবেদন: <strong className="text-white">{toBanglaNumber(item.count)}</strong> টি (
                              {total > 0 ? toBanglaNumber(((item.count / total) * 100).toFixed(1)) : '০'}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 lg:border-l lg:border-slate-200 lg:pl-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                স্ট্যাটাস ফিল্টার
              </span>

              {statusData.map((item) => (
                <button
                  key={item.statusCode}
                  type="button"
                  onClick={() => onStatusClick && onStatusClick(item.statusCode)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                        {item.shortName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {total > 0 ? toBanglaNumber(((item.count / total) * 100).toFixed(0)) : '০'}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-900 text-slate-800">
                    {item.banglaCount} টি
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
