import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckSquare, 
  Square, 
  Filter, 
  Calendar, 
  Search, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { 
  CsvModuleType, 
  CsvColumnDefinition, 
  getColumnsForModule, 
  generateCsvContent, 
  downloadCsvFile 
} from '../utils/csvExportHelper';
import { toBanglaNumber, formatBanglaDate } from '../utils/storage';

interface CustomCsvExportModalProps {
  moduleType: CsvModuleType;
  allApplications: any[];
  currentFilteredApplications: any[];
  selectedAppIds: string[];
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const CustomCsvExportModal: React.FC<CustomCsvExportModalProps> = ({
  moduleType,
  allApplications,
  currentFilteredApplications,
  selectedAppIds,
  onClose,
  onSuccess,
}) => {
  // Available Columns for current module
  const allColumns = useMemo(() => getColumnsForModule(moduleType), [moduleType]);

  // Selected column keys state (initialized with defaultSelected)
  const [selectedColKeys, setSelectedColKeys] = useState<string[]>(() => 
    allColumns.filter((c) => c.defaultSelected).map((c) => c.key)
  );

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Scope: 'filtered' | 'selected' | 'all'
  const [exportScope, setExportScope] = useState<'filtered' | 'selected' | 'all'>(
    selectedAppIds.length > 0 ? 'selected' : 'filtered'
  );

  // In-modal custom filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // Module Title
  const moduleMeta = useMemo(() => {
    switch (moduleType) {
      case 'demarcation':
        return {
          title: '১. সীমানা নির্ধারণ ও ডিমার্কেশন প্রত্যয়ন ফরম',
          subtitle: 'ভূমির সীমানা নির্ধারণ, মালিকানা সঠিকতা ও সরজমিন তদন্ত ডাটাবেজ',
          defaultFilename: `Sitakunda_Demarcation_Applications_${new Date().toISOString().split('T')[0]}.csv`,
          themeColor: 'emerald',
        };
      case 'schedule1':
        return {
          title: '২. ইমারত নির্মাণ অনুমোদন ফরম তফসিল-১',
          subtitle: 'ইমারত নির্মাণ নকশা অনুমোদন, ৭ কপি ফর্দ ও ট্রেজারী চালান ডাটাবেজ',
          defaultFilename: `Sitakunda_Schedule1_Building_Applications_${new Date().toISOString().split('T')[0]}.csv`,
          themeColor: 'amber',
        };
      case 'roadcutting':
        return {
          title: '৩. রাস্তা কর্তন অনুমোদন ফরম',
          subtitle: 'পৌর এলাকার রাস্তা কর্তন অনুমতি, ক্ষতিপূরণ ফি ও পরিমাপ ডাটাবেজ',
          defaultFilename: `Sitakunda_Road_Cutting_Applications_${new Date().toISOString().split('T')[0]}.csv`,
          themeColor: 'amber',
        };
    }
  }, [moduleType]);

  const [fileName, setFileName] = useState<string>(moduleMeta.defaultFilename);

  // Calculate filtered dataset based on scope and in-modal filters
  const filteredData = useMemo(() => {
    let sourceList: any[] = [];
    if (exportScope === 'selected' && selectedAppIds.length > 0) {
      sourceList = allApplications.filter((app) => selectedAppIds.includes(app.id));
    } else if (exportScope === 'filtered') {
      sourceList = currentFilteredApplications;
    } else {
      sourceList = allApplications;
    }

    return sourceList.filter((item) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && item.status !== 'pending' && item.status !== 'submitted') return false;
        if (statusFilter === 'approved' && item.status !== 'approved') return false;
        if (statusFilter === 'under_review' && item.status !== 'under_review' && item.status !== 'investigating') return false;
        if (statusFilter === 'rejected' && item.status !== 'rejected') return false;
      }

      // Ward filter
      if (wardFilter !== 'all') {
        const itemWard = (
          item.wardNo || 
          item.schedule?.wardNo || 
          item.siteLocation?.wardNo || 
          item.siteDetails?.wardNo || 
          ''
        ).toString();
        if (!itemWard.includes(wardFilter)) return false;
      }

      // Date range filter
      if (dateFrom && item.createdAt) {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        if (itemDate < dateFrom) return false;
      }
      if (dateTo && item.createdAt) {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        if (itemDate > dateTo) return false;
      }

      // Search keyword
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const strVal = JSON.stringify(item).toLowerCase();
        if (!strVal.includes(q)) return false;
      }

      return true;
    });
  }, [
    exportScope,
    selectedAppIds,
    allApplications,
    currentFilteredApplications,
    statusFilter,
    wardFilter,
    dateFrom,
    dateTo,
    searchKeyword,
  ]);

  // Toggle single column
  const handleToggleColumn = (key: string) => {
    setSelectedColKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Select all columns
  const handleSelectAllColumns = () => {
    setSelectedColKeys(allColumns.map((c) => c.key));
  };

  // Deselect all columns
  const handleDeselectAllColumns = () => {
    setSelectedColKeys([]);
  };

  // Group columns by category for nice organized UI
  const categorizedColumns = useMemo(() => {
    return {
      applicant: allColumns.filter((c) => c.category === 'applicant'),
      land_schedule: allColumns.filter((c) => c.category === 'land_schedule'),
      construction: allColumns.filter((c) => c.category === 'construction'),
      approval_fees: allColumns.filter((c) => c.category === 'approval_fees'),
    };
  }, [allColumns]);

  // Handle CSV Download
  const handleDownloadCsv = () => {
    if (selectedColKeys.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি কলাম নির্বাচন করুন।');
      return;
    }
    if (filteredData.length === 0) {
      alert('নির্বাচিত ফিল্টারে কোনো ডাটা পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।');
      return;
    }

    try {
      const csvContent = generateCsvContent(filteredData, allColumns, selectedColKeys, delimiter);
      downloadCsvFile(csvContent, fileName);
      if (onSuccess) {
        onSuccess(`${toBanglaNumber(filteredData.length)} টি আবেদনের CSV ফাইল সফলভাবে ডাউনলোড হয়েছে।`);
      }
      onClose();
    } catch (err: any) {
      alert(err?.message || 'CSV জেনারেট করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  কাস্টম CSV এক্সপোর্ট ও ডাউনলোড ফিল্টারিং
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  Excel & Sheets সাপোর্টেড
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {moduleMeta.title} • {moduleMeta.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {/* 1. DATA SCOPE & LIVE FILTERS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ১। এক্সপোর্টের পরিধি ও ফিল্টারিং নির্ধারণ (Data Scope & Filters)
                </h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-bold border border-emerald-300">
                মোট এক্সপোর্টযোগ্য ডাটা: {toBanglaNumber(filteredData.length)} টি রেকর্ড
              </span>
            </div>

            {/* Scope Selection Radios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportScope === 'filtered' ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="exportScope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={() => setExportScope('filtered')}
                  className="rounded-full text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold block text-slate-900">বর্তমানে ফিল্টারকৃত ডাটা</span>
                  <span className="text-[11px] text-slate-500">ড্যাশবোর্ডের ফিল্টার অনুযায়ী ({toBanglaNumber(currentFilteredApplications.length)} টি)</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportScope === 'selected' ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="exportScope"
                  value="selected"
                  checked={exportScope === 'selected'}
                  onChange={() => setExportScope('selected')}
                  disabled={selectedAppIds.length === 0}
                  className="rounded-full text-emerald-700 focus:ring-emerald-500 w-4 h-4 disabled:opacity-50"
                />
                <div>
                  <span className="font-bold block text-slate-900">চেকবক্সে নির্বাচিত আবেদনসমূহ</span>
                  <span className="text-[11px] text-slate-500">
                    {selectedAppIds.length > 0 ? `নির্বাচিত (${toBanglaNumber(selectedAppIds.length)} টি)` : 'কোনো আবেদন সিলেক্ট করা নেই'}
                  </span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportScope === 'all' ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className="rounded-full text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold block text-slate-900">সম্পূর্ণ ডাটাবেজ</span>
                  <span className="text-[11px] text-slate-500">সকল দাখিলকৃত রেকর্ড ({toBanglaNumber(allApplications.length)} টি)</span>
                </div>
              </label>
            </div>

            {/* Quick in-modal filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">আবেদনের অবস্থা (Status):</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">সকল অবস্থা (All Status)</option>
                  <option value="pending">অপেক্ষমান / নতুন দাখিলকৃত</option>
                  <option value="under_review">তদন্ত ও পরিদর্শনে</option>
                  <option value="approved">অনুমোদিত / প্রত্যয়নপত্র সম্পন্ন</option>
                  <option value="rejected">বাতিল</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">পৌর ওয়ার্ড নং:</label>
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">সকল ওয়ার্ড (১ - ৯ নং)</option>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={String(w)}>
                      {toBanglaNumber(w)} নং ওয়ার্ড
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">তারিখ হতে (From Date):</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">তারিখ পর্যন্ত (To Date):</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Keyword search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="নির্দিষ্ট আবেদনকারীর নাম, মোবাইল, দাগ নং, খতিয়ান বা আইডি দিয়ে ফিল্টার করুন..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* 2. FIELD / COLUMN SELECTION CHECKLIST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ২। CSV কলাম ও ফিল্ড নির্বাচন (Columns to Include in CSV)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg transition-colors border border-emerald-200 cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>সবগুলো কলাম নির্বাচন ({toBanglaNumber(allColumns.length)})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllColumns}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>সব বাতিল</span>
                </button>
              </div>
            </div>

            {/* Categorized Column Groups */}
            <div className="space-y-4">
              {/* Group A: Applicant Details */}
              {categorizedColumns.applicant.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                  <span className="font-bold text-slate-800 text-xs block mb-2 text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    আবেদনকারী ও ব্যক্তিগত তথ্য
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categorizedColumns.applicant.map((col) => {
                      const isChecked = selectedColKeys.includes(col.key);
                      return (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColumn(col.key)}
                            className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="truncate" title={col.label}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group B: Land & Location */}
              {categorizedColumns.land_schedule.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                  <span className="font-bold text-slate-800 text-xs block mb-2 text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    জমির তফসিল, মৌজা ও অবস্থান বিবরণ
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categorizedColumns.land_schedule.map((col) => {
                      const isChecked = selectedColKeys.includes(col.key);
                      return (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-blue-50 border-blue-400 font-bold text-blue-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColumn(col.key)}
                            className="rounded text-blue-700 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="truncate" title={col.label}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group C: Construction & Work Details */}
              {categorizedColumns.construction.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                  <span className="font-bold text-slate-800 text-xs block mb-2 text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    প্রস্তাবিত নির্মাণ, পরিমাপ ও কাঠামোগত বিবরণ
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categorizedColumns.construction.map((col) => {
                      const isChecked = selectedColKeys.includes(col.key);
                      return (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColumn(col.key)}
                            className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="truncate" title={col.label}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group D: Approval, Inspection & Fees */}
              {categorizedColumns.approval_fees.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                  <span className="font-bold text-slate-800 text-xs block mb-2 text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    অনুমোদন, পরিদর্শন মন্তব্য, ট্রেজারী চালান ও সরকারি ফি
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categorizedColumns.approval_fees.map((col) => {
                      const isChecked = selectedColKeys.includes(col.key);
                      return (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${isChecked ? 'bg-purple-50 border-purple-400 font-bold text-purple-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColumn(col.key)}
                            className="rounded text-purple-700 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="truncate" title={col.label}>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. LIVE CSV DATA PREVIEW (First 3 rows) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ৩। লাইভ প্রিভিউ (প্রথম ৩টি রেকর্ড)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                নির্বাচিত কলাম সংখ্যা: <strong>{toBanglaNumber(selectedColKeys.length)}</strong> টি
              </span>
            </div>

            {filteredData.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                কোনো ডাটা পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার অপশন শিথিল করুন।
              </div>
            ) : selectedColKeys.length === 0 ? (
              <div className="p-6 text-center text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                অনুগ্রহ করে উপরের তালিকা থেকে অন্তত একটি কলাম নির্বাচন করুন।
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2 text-center w-8 bg-slate-200/60">#</th>
                      {allColumns
                        .filter((c) => selectedColKeys.includes(c.key))
                        .map((col) => (
                          <th key={col.key} className="p-2 border-r border-slate-200 whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.slice(0, 3).map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center font-bold text-slate-400 bg-slate-50">
                          {toBanglaNumber(idx + 1)}
                        </td>
                        {allColumns
                          .filter((c) => selectedColKeys.includes(c.key))
                          .map((col) => {
                            const val = col.getValue(item);
                            return (
                              <td key={col.key} className="p-2 border-r border-slate-100 max-w-[200px] truncate">
                                {val !== undefined && val !== null ? String(val) : '-'}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. FILE CONFIGURATION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ডাউনলোড ফাইল নাম (File Name):
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                CSV সেপারেটর / ডিলিমিটার (Delimiter):
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value=",">কমা (Comma ,) - স্ট্যান্ডার্ড এক্সেল ও গুগল শিটস</option>
                <option value=";">সেমিকোলন (Semicolon ;) - ইউরোপিয়ান রিজিয়ন</option>
                <option value="&#9;">ট্যাব (Tab \t) - TSV ফরম্যাট</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              UTF-8 BOM যুক্ত হওয়ায় বাংলা ফন্ট এক্সেলে কোনো ত্রুটি ছাড়াই সঠিকভাবে খুলবে।
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              বাতিল করুন
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={filteredData.length === 0 || selectedColKeys.length === 0}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                কাস্টম CSV ডাউনলোড করুন ({toBanglaNumber(filteredData.length)} টি রেকর্ড)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
