import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  X,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  KeyRound,
  FileText,
  MessageSquare,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SystemAuditLogItem, AuditActionType } from '../types';
import { getStoredAuditLogs, toBanglaNumber, formatBanglaDate } from '../utils/storage';
import { MunicipalityLogo } from './MunicipalityLogo';

interface SystemAuditLogModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSelectApplication?: (appId: string) => void;
}

export const SystemAuditLogModal: React.FC<SystemAuditLogModalProps> = ({
  isOpen = true,
  onClose,
  onSelectApplication,
}) => {
  const [logs, setLogs] = useState<SystemAuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = useCallback(() => {
    const data = getStoredAuditLogs();
    setLogs(data);
  }, []);

  // Load audit logs on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLogs();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isOpen, loadLogs]);

  // Keyboard shortcut listener for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Quick Date Range Preset Handlers
  const handleSetDatePreset = (preset: 'today' | '7days' | 'month' | 'all') => {
    const now = new Date();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const todayStr = now.toISOString().split('T')[0];
    setEndDate(todayStr);

    if (preset === 'today') {
      setStartDate(todayStr);
    } else if (preset === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
    }
  };

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.actionTitle.toLowerCase().includes(query) ||
        item.details.toLowerCase().includes(query) ||
        item.officerName.toLowerCase().includes(query) ||
        item.officerUsername.toLowerCase().includes(query) ||
        (item.targetId && item.targetId.toLowerCase().includes(query)) ||
        (item.applicantName && item.applicantName.toLowerCase().includes(query)) ||
        (item.ipAddress && item.ipAddress.toLowerCase().includes(query));

      // Action type match
      const matchesAction =
        selectedActionType === 'all' ||
        item.actionType === selectedActionType ||
        (selectedActionType === 'auth' && (item.actionType === 'login' || item.actionType === 'logout' || item.actionType === 'password_changed')) ||
        (selectedActionType === 'processing' && (item.actionType === 'status_change' || item.actionType === 'certificate_issued' || item.actionType === 'inspection_scheduled'));

      // Officer match
      const matchesOfficer =
        selectedOfficer === 'all' ||
        item.officerUsername.toLowerCase() === selectedOfficer.toLowerCase();

      // Date Range Match
      let matchesDate = true;
      if (startDate || endDate) {
        const itemDateStr = item.timestamp.split('T')[0];
        if (startDate && itemDateStr < startDate) {
          matchesDate = false;
        }
        if (endDate && itemDateStr > endDate) {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesAction && matchesOfficer && matchesDate;
    });
  }, [logs, searchQuery, selectedActionType, selectedOfficer, startDate, endDate]);

  if (!isOpen) return null;

  // Summary Metrics
  const totalCount = logs.length;
  const loginCount = logs.filter((l) => l.actionType === 'login').length;
  const statusChangeCount = logs.filter((l) => l.actionType === 'status_change' || l.actionType === 'certificate_issued').length;
  const notesCount = logs.filter((l) => l.actionType === 'internal_note').length;
  const inspectionCount = logs.filter((l) => l.actionType === 'inspection_scheduled').length;

  // Export Filtered Audit Logs to CSV
  const handleExportCSV = () => {
    const headers = [
      'অডিট আইডি',
      'তারিখ ও সময়',
      'কর্মকর্তার নাম',
      'পদবী',
      'ইউজারনেম',
      'কার্যক্রমের ধরণ',
      'কার্যক্রমের শিরোনাম',
      'সংশ্লিষ্ট আবেদন আইডি',
      'আবেদনকারীর নাম',
      'বিস্তারিত বিবরণ',
      'আইপি ঠিকানা ও টার্মিনাল',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${new Date(log.timestamp).toLocaleString('bn-BD')}"`,
      `"${log.officerName}"`,
      `"${log.officerDesignation}"`,
      `"${log.officerUsername}"`,
      `"${log.actionType}"`,
      `"${log.actionTitle.replace(/"/g, '""')}"`,
      `"${log.targetId || ''}"`,
      `"${log.applicantName || ''}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.ipAddress || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sitakunda_system_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for action badge icon and style
  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'login':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-700" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: 'লগইন',
        };
      case 'logout':
        return {
          icon: <LogOut className="w-3.5 h-3.5 text-slate-700" />,
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          label: 'লগআউট',
        };
      case 'status_change':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-blue-700" />,
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          label: 'স্ট্যাটাস পরিবর্তন',
        };
      case 'internal_note':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-amber-700" />,
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          label: 'অভ্যন্তরীণ নোট',
        };
      case 'inspection_scheduled':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-purple-700" />,
          bg: 'bg-purple-50 text-purple-900 border-purple-300',
          label: 'পরিদর্শন শিডিউল',
        };
      case 'certificate_issued':
        return {
          icon: <Award className="w-3.5 h-3.5 text-emerald-800" />,
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold',
          label: 'প্রত্যয়ন সনদ জারি',
        };
      case 'password_changed':
        return {
          icon: <KeyRound className="w-3.5 h-3.5 text-orange-700" />,
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          label: 'পাসওয়ার্ড পরিবর্তন',
        };
      case 'csv_exported':
      case 'pdf_exported':
      case 'bulk_print':
        return {
          icon: <Printer className="w-3.5 h-3.5 text-indigo-700" />,
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          label: 'প্রিন্ট / এক্সপোর্ট',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'প্রশাসনিক কাজ',
        };
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  সিস্টেম অডিট লগ ও প্রশাসনিক কার্যক্রম ট্র্যাকিং (System Audit Trail)
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  ★ সুপার অ্যাডমিন প্রিভিলেজ (Super Admin Only)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  অপরিবর্তনযোগ্য লগ রেকর্ড
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                সীতাকুণ্ড পৌরসভা | কর্মকর্তাদের প্রমাণীকরণ, স্ট্যাটাস আপডেট, অভ্যন্তরীণ নোট ও রিপোর্ট জেনারেশন হিস্ট্রি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLogs}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="লগ তালিকা রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="close-system-audit-modal-btn"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 block">মোট অডিট রেকর্ড</span>
            <span className="text-lg font-bold text-slate-900">{toBanglaNumber(totalCount)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-emerald-800 block">কর্মকর্তা লগইন</span>
            <span className="text-lg font-bold text-emerald-900">{toBanglaNumber(loginCount)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-blue-800 block">স্ট্যাটাস ও সনদ আপডেট</span>
            <span className="text-lg font-bold text-blue-900">{toBanglaNumber(statusChangeCount)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-amber-800 block">অভ্যন্তরীণ পর্যবেক্ষণ নোট</span>
            <span className="text-lg font-bold text-amber-900">{toBanglaNumber(notesCount)}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-purple-800 block">পরিদর্শন শিডিউল আদেশ</span>
            <span className="text-lg font-bold text-purple-900">{toBanglaNumber(inspectionCount)}</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কীওয়ার্ড / কর্মকর্তা / আবেদন আইডি অনুসন্ধান
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="নাম, আবেদন আইডি, বিবরণ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-normal"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Action Type Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কার্যক্রমের ধরণ (Action Type)
              </label>
              <select
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                <option value="all">সকল কার্যক্রম (All Actions)</option>
                <option value="auth">লগইন, লগআউট ও পাসওয়ার্ড (Auth)</option>
                <option value="login">শুধুমাত্র লগইন (Login)</option>
                <option value="status_change">স্ট্যাটাস পরিবর্তন (Status Updates)</option>
                <option value="internal_note">অভ্যন্তরীণ তদন্ত নোট (Quick Notes)</option>
                <option value="inspection_scheduled">পরিদর্শন শিডিউল (Inspections)</option>
                <option value="certificate_issued">প্রত্যয়ন সনদ ইস্যু (Approvals)</option>
                <option value="password_changed">পাসওয়ার্ড পরিবর্তন (Password Changed)</option>
                <option value="bulk_print">বাল্ক / একক প্রিন্ট ও এক্সপোর্ট (Print & CSV)</option>
              </select>
            </div>

            {/* Officer Filter Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কর্মকর্তা অ্যাকাউন্ট (Officer Account)
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                <option value="all">সকল কর্মকর্তা (All Officers)</option>
                <option value="xen.sitakunda">নির্বাহী প্রকৌশলী (xen.sitakunda)</option>
                <option value="draftsman.sitakunda">নক্সাকার (সিভিল) (draftsman.sitakunda)</option>
                <option value="mayor.sitakunda">মেয়র / প্রশাসক (mayor.sitakunda)</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                তারিখের ব্যাপ্তি (Date Range)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600"
                  title="শুরুর তারিখ"
                />
                <span className="text-slate-400 text-xs">হতে</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600"
                  title="শেষের তারিখ"
                />
              </div>
            </div>
          </div>

          {/* Quick Date Presets & Export Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="font-semibold text-slate-600 text-[11px] mr-1">দ্রুত ফিল্টার:</span>
              <button
                type="button"
                onClick={() => handleSetDatePreset('today')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
              >
                আজকের লগ
              </button>
              <button
                type="button"
                onClick={() => handleSetDatePreset('7days')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
              >
                গত ৭ দিন
              </button>
              <button
                type="button"
                onClick={() => handleSetDatePreset('month')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
              >
                চলতি মাস
              </button>
              <button
                type="button"
                onClick={() => handleSetDatePreset('all')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
              >
                সকল সময়
              </button>
              {(searchQuery || selectedActionType !== 'all' || selectedOfficer !== 'all' || startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedActionType('all');
                    setSelectedOfficer('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-2.5 py-1 text-red-600 hover:text-red-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                  <span>ফিল্টার রিসেট</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                প্রদর্শিত রেকর্ড: <strong className="text-slate-900">{toBanglaNumber(filteredLogs.length)}</strong> টি
              </span>
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="অডিট লগ CSV ফাইল হিসেবে সংরক্ষণ করুন"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV এক্সপোর্ট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table / List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-sm">নির্দিষ্ট ফিল্টারে কোনো অডিট লগ পাওয়া যায়নি।</p>
              <p className="text-xs text-slate-400 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন বা রিসেট করে পুনরায় চেষ্টা করুন।</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.actionType);
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className={`bg-white rounded-xl border transition-all text-xs ${
                    isExpanded ? 'border-emerald-400 shadow-md ring-1 ring-emerald-300' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Badge & Title */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {badge.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold flex items-center gap-1 ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {log.actionTitle}
                          </h4>
                          {log.targetId && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectApplication) {
                                  onSelectApplication(log.targetId!);
                                  onClose();
                                }
                              }}
                              className="font-mono text-[11px] font-bold bg-slate-100 hover:bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-slate-300 transition-colors cursor-pointer"
                              title="আবেদনের বিস্তারিত দেখতে ক্লিক করুন"
                            >
                              ID: {log.targetId}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 text-xs mt-1 line-clamp-1">
                          {log.details}
                        </p>
                      </div>
                    </div>

                    {/* Right: Officer & Timestamp Info */}
                    <div className="flex items-center justify-between md:justify-end gap-3 text-[11px] text-slate-500 border-t md:border-t-0 pt-2 md:pt-0 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="font-bold text-slate-800 flex items-center md:justify-end gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{log.officerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({log.officerUsername})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.officerDesignation}
                        </div>
                      </div>

                      <div className="text-right pl-3 border-l border-slate-200">
                        <div className="font-mono text-slate-700 font-semibold flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatBanglaDate(log.timestamp)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                        title={isExpanded ? 'সংক্ষেপ করুন' : 'বিস্তারিত দেখুন'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 rounded-b-xl space-y-2 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold block text-[11px]">বিস্তারিত বিবরণ ও পর্যবেক্ষণ:</span>
                          <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                            {log.details}
                          </p>
                        </div>

                        <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">অডিট লগ আইডি:</span>
                            <span className="font-mono text-slate-800">{log.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">আইপি ঠিকানা / টার্মিনাল:</span>
                            <span className="font-mono text-slate-800">{log.ipAddress || 'সীতাকুণ্ড পৌরসভা লোকাল নেটওয়ার্ক'}</span>
                          </div>
                          {log.applicantName && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">আবেদনকারী:</span>
                              <span className="font-bold text-slate-800">{log.applicantName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-semibold">রেকর্ড তৈরির সময়:</span>
                            <span className="font-mono text-slate-800">{new Date(log.timestamp).toUTCString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            <span>সকল প্রশাসনিক কার্যকলাপ কেন্দ্রীয় ডাটাবেসে টাইমস্ট্যাম্প ও ডিজিটাল অডিট ট্রেইল সহ সংরক্ষিত থাকে।</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
