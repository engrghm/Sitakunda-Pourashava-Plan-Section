import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  MessageSquare, 
  PhoneCall, 
  Layers, 
  FileText, 
  AlertTriangle,
  Plus,
  Trash2,
  Users,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { PortalConfig, savePortalConfig, resetPortalConfig, getPortalConfig } from '../utils/portalConfig';
import { uploadImageToServer } from '../utils/apiStorage';
import { getOfficerSession } from '../utils/storage';
import { CouncilManagementPanel } from './CouncilManagementPanel';

interface PortalCustomizerModalProps {
  currentConfig: PortalConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (newConfig: PortalConfig) => void;
}

export const PortalCustomizerModal: React.FC<PortalCustomizerModalProps> = ({
  currentConfig,
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'hero' | 'notices' | 'leadership' | 'emergency' | 'council'>('general');
  const [formData, setFormData] = useState<PortalConfig>({ ...currentConfig });
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [newNoticeInput, setNewNoticeInput] = useState('');
  const [isUploadingLeaderImage, setIsUploadingLeaderImage] = useState(false);

  const officerSession = getOfficerSession();
  const isAuthenticated = !!officerSession?.username;

  // Keep formData in sync with latest currentConfig and portal-config-updated events
  useEffect(() => {
    if (isOpen) {
      setFormData(getPortalConfig());
    }
  }, [isOpen, currentConfig]);

  useEffect(() => {
    const handleSync = () => {
      const latest = getPortalConfig();
      setFormData(prev => ({
        ...prev,
        councilMembers: latest.councilMembers || prev.councilMembers,
        noticesList: latest.noticesList || prev.noticesList,
      }));
    };
    window.addEventListener('portal-config-updated', handleSync);
    return () => window.removeEventListener('portal-config-updated', handleSync);
  }, []);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof PortalConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে');
      return;
    }
    setIsUploadingLeaderImage(true);
    try {
      const serverUrl = await uploadImageToServer(file);
      if (serverUrl) {
        handleFieldChange('leaderImageUrl', serverUrl);
      }
    } catch (err) {
      console.warn('Leader image upload failed:', err);
    } finally {
      setIsUploadingLeaderImage(false);
    }
  };

  const handleSave = () => {
    const session = getOfficerSession();
    if (!session?.username) {
      alert('অননুমোদিত চেষ্টা! ওয়েবসাইট বা পরিষদ তথ্য পরিবর্তন করার জন্য অফিসিয়াল কর্মকর্তা আইডিতে লগইন থাকা বাধ্যতামূলক।');
      return;
    }

    const latestConf = getPortalConfig();
    const configToSave: PortalConfig = {
      ...formData,
      councilMembers: (latestConf.councilMembers && latestConf.councilMembers.length > 0)
        ? latestConf.councilMembers
        : formData.councilMembers,
      noticesList: (latestConf.noticesList && latestConf.noticesList.length > 0)
        ? latestConf.noticesList
        : formData.noticesList,
    };
    savePortalConfig(configToSave);
    onConfigSaved(configToSave);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
    }, 3500);
  };



  const handleReset = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে ওয়েবসাইট সেটিংস ডিফল্ট মানে ফিরিয়ে আনতে চান? আপনার কাস্টম পরিবর্তন মুছে যাবে।')) {
      const def = resetPortalConfig();
      setFormData({ ...def });
      onConfigSaved(def);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3000);
    }
  };

  const handleAddNotice = () => {
    if (!newNoticeInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      marqueeNotices: [...prev.marqueeNotices, newNoticeInput.trim()],
    }));
    setNewNoticeInput('');
  };

  const handleRemoveNotice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      marqueeNotices: prev.marqueeNotices.filter((_, i) => i !== index),
    }));
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sitakunda_portal_config_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setFormData((prev) => ({ ...prev, ...parsed }));
        alert('কনফিগারেশন সফলভাবে ইমপোর্ট হয়েছে। "সংরক্ষণ করুন" বাটনে ক্লিক করে কার্যকর করুন।');
      } catch {
        alert('অকার্যকর JSON ফাইল! অনুগ্রহ করে সঠিক কনফিগারেশন ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>ওয়েবসাইট কাস্টমাইজেশন ও সিএমএস প্যানেল</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                সীতাকুণ্ড পৌরসভা
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              সাইটের শিরোনাম, ব্যানার, মেয়র বাণী, হেল্পলাইন ও নোটিশ সরাসরি পরিবর্তন করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAuthenticated ? (
            <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>কর্মকর্তা: {officerSession.username}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-red-950/80 text-red-300 border border-red-600/50 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-inner">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>লগইন নেই (সংরক্ষণ নিষ্ক্রিয়)</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="JSON ব্যাকআপ ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ব্যাকআপ JSON</span>
          </button>

          <label className={`flex items-center gap-1.5 px-3 py-1.5 ${isAuthenticated ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer' : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'} rounded-lg text-xs font-semibold border border-slate-700 transition-colors`}>
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ইমপোর্ট</span>
            <input type="file" accept=".json" disabled={!isAuthenticated} onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${isAuthenticated ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'} rounded-lg text-xs font-semibold border border-rose-800/40 transition-colors`}
            title="ডিফল্ট মান ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 px-4 py-2 ${isAuthenticated ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md cursor-pointer' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'} rounded-lg text-xs font-bold transition-all`}
          >
            {isAuthenticated ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4 text-red-400" />}
            <span>{isAuthenticated ? 'পরিবর্তন সংরক্ষণ করুন' : 'লগইন আবশ্যক'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-3 text-xs animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</div>
            <div className="text-emerald-200 text-[11px]">ওয়েবসাইটের সকল টেক্সট ও কন্টেন্ট সাথে সাথে হালনাগাদ করা হয়েছে।</div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto my-6 px-4 flex-1 flex flex-col sm:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full sm:w-60 shrink-0 space-y-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm self-start">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'general' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>১. সাধারণ পৌর তথ্য</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('hero')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'hero' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>২. ব্যানার ও স্লোগান</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('notices')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'notices' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>৩. লাইভ স্ক্রোলিং নোটিশ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('leadership')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'leadership' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>৪. মেয়র / প্রশাসক বাণী</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('emergency')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'emergency' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>৫. জরুরি হটলাইন নম্বর</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('council')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSubTab === 'council' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>৬. বর্তমান পরিষদ ও কর্মকর্তা</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* SubTab 1: General Info */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">১. পৌরসভার সাধারণ পরিচিতি ও যোগাযোগ</h3>
                <p className="text-xs text-slate-500">ওয়েবসাইটের হেডার, ফুটার ও অফিশিয়াল নথিতে প্রদর্শিত তথ্য</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">পৌরসভার নাম</label>
                  <input
                    type="text"
                    value={formData.municipalityName}
                    onChange={(e) => handleFieldChange('municipalityName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ট্যাগলাইন / উপশিরোনাম</label>
                  <input
                    type="text"
                    value={formData.municipalityTagline}
                    onChange={(e) => handleFieldChange('municipalityTagline', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">উপজেলা / থানা</label>
                  <input
                    type="text"
                    value={formData.subDistrict}
                    onChange={(e) => handleFieldChange('subDistrict', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">জেলা</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleFieldChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">টেলিফোন / হেল্পলাইন নম্বর</label>
                  <input
                    type="text"
                    value={formData.helplinePhone}
                    onChange={(e) => handleFieldChange('helplinePhone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">হটলাইন মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={formData.hotlineMobile}
                    onChange={(e) => handleFieldChange('hotlineMobile', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) => handleFieldChange('officialEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফিসিয়াল ওয়েবসাইট URL</label>
                  <input
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) => handleFieldChange('websiteUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">পৌরসভা কার্যালয়ের পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    value={formData.physicalAddress}
                    onChange={(e) => handleFieldChange('physicalAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">অফিস সময়সূচি</label>
                  <input
                    type="text"
                    value={formData.officeHours}
                    onChange={(e) => handleFieldChange('officeHours', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Hero Section */}
          {activeSubTab === 'hero' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">২. হিরো ব্যানার ও স্লোগান কাস্টমাইজেশন</h3>
                <p className="text-xs text-slate-500">হোমপেজের শীর্ষে প্রদর্শিত প্রধান ব্যানার টেক্সট</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্যানার টপ ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={formData.heroBadgeText}
                    onChange={(e) => handleFieldChange('heroBadgeText', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্যানার প্রধান শিরোনাম (Headline)</label>
                  <input
                    type="text"
                    value={formData.heroHeadline}
                    onChange={(e) => handleFieldChange('heroHeadline', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্যানার উপ-শিরোনাম ও বর্ণনা (Subheadline)</label>
                  <textarea
                    rows={3}
                    value={formData.heroSubheadline}
                    onChange={(e) => handleFieldChange('heroSubheadline', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">জরুরি নোটিশ ব্যাজ নাম</label>
                    <input
                      type="text"
                      value={formData.heroNoticeBadge}
                      onChange={(e) => handleFieldChange('heroNoticeBadge', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">জরুরি নোটিশ বর্ণনা</label>
                    <input
                      type="text"
                      value={formData.heroNoticeText}
                      onChange={(e) => handleFieldChange('heroNoticeText', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Live Marquee Notices */}
          {activeSubTab === 'notices' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">৩. লাইভ স্ক্রোলিং জরুরি নোটিশ ব্যবস্থাপনা</h3>
                <p className="text-xs text-slate-500">হোমপেজে চলমান অ্যানিমেশন যুক্ত নোটিশ ও নাগরিক বিজ্ঞপ্তি</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.enableMarquee}
                    onChange={(e) => handleFieldChange('enableMarquee', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span>স্ক্রোলিং নোটিশ চালু রাখুন (Enable Marquee Bar)</span>
                </label>
              </div>

              {/* Add Notice */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 text-xs block">নতুন স্ক্রোলিং নোটিশ যুক্ত করুন:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="উদাঃ হোল্ডিং ট্যাক্স জমা দেওয়ার শেষ তারিখ ৩০শে সেপ্টেম্বর..."
                    value={newNoticeInput}
                    onChange={(e) => setNewNoticeInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddNotice}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              {/* Notice List */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs block">বর্তমানে সক্রিয় নোটিশ তালিকা ({formData.marqueeNotices.length}টি):</label>
                {formData.marqueeNotices.map((not, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs gap-3">
                    <span className="text-slate-800 flex-1">{not}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNotice(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 4: Leadership Message */}
          {activeSubTab === 'leadership' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">৪. মেয়র / প্রশাসক ও কর্মকর্তার বাণী</h3>
                <p className="text-xs text-slate-500">হোমপেজের লিডারশিপ সেকশনে প্রদর্শিত ছবি ও বাণীর বক্তব্য</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">বাণীর শিরোনাম</label>
                    <input
                      type="text"
                      value={formData.leaderTitle}
                      onChange={(e) => handleFieldChange('leaderTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">মেয়র / প্রশাসকের নাম</label>
                    <input
                      type="text"
                      value={formData.leaderName}
                      onChange={(e) => handleFieldChange('leaderName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পদবী ও দপ্তর</label>
                    <input
                      type="text"
                      value={formData.leaderDesignation}
                      onChange={(e) => handleFieldChange('leaderDesignation', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  {/* Mayor / Administrator Photo Upload Option */}
                  <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="font-bold text-slate-800 block mb-2 text-xs flex items-center justify-between">
                      <span>মেয়র / প্রশাসক মহোদয়ের অফিসিয়াল ছবি (Photo)</span>
                      <span className="text-[10px] text-slate-400 font-normal">সর্বোচ্চ ৫ MB (JPG, PNG, WEBP)</span>
                    </label>

                    <div className="flex items-center gap-4">
                      {formData.leaderImageUrl ? (
                        <div className="relative shrink-0">
                          <img
                            src={formData.leaderImageUrl}
                            alt="Leader Preview"
                            className="w-24 h-28 rounded-2xl object-cover object-top border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleFieldChange('leaderImageUrl', '/logo.png')}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                            title="লোগোতে ফিরিয়ে নিন"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-28 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-8 h-8 opacity-60" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 ${isUploadingLeaderImage ? 'bg-slate-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'} text-white text-xs font-bold rounded-xl shadow-xs transition-colors`}>
                            {isUploadingLeaderImage ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>সার্ভারে ছবি আপলোড হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>কম্পিউটার/মোবাইল থেকে প্রশাসকের ছবি আপলোড করুন</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingLeaderImage}
                                  onChange={handleLeaderImageUpload}
                                  className="hidden"
                                />
                              </>
                            )}
                          </label>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={formData.leaderImageUrl}
                            onChange={(e) => handleFieldChange('leaderImageUrl', e.target.value)}
                            placeholder="অথবা সরাসরি ছবির লিঙ্ক/URL পেস্ট করুন..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px] bg-white text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বাণীর বিস্তারিত বক্তব্য</label>
                  <textarea
                    rows={4}
                    value={formData.leaderMessage}
                    onChange={(e) => handleFieldChange('leaderMessage', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-2">নির্বাহী কর্মকর্তা / প্রকৌশলীর নোট</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">কর্মকর্তার নাম</label>
                      <input
                        type="text"
                        value={formData.officerName}
                        onChange={(e) => handleFieldChange('officerName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">পদবী</label>
                      <input
                        type="text"
                        value={formData.officerDesignation}
                        onChange={(e) => handleFieldChange('officerDesignation', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">কর্মকর্তার বার্তা</label>
                    <textarea
                      rows={2}
                      value={formData.officerMessage}
                      onChange={(e) => handleFieldChange('officerMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 5: Emergency Numbers */}
          {activeSubTab === 'emergency' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900">৫. জরুরি হটলাইন নম্বর ব্যবস্থাপনা</h3>
                <p className="text-xs text-slate-500">হোমপেজের ফুটার ও জরুরি ডিরেক্টরিতে প্রদর্শিত ফোন নম্বরসমূহ</p>
              </div>

              <div className="space-y-3">
                {formData.emergencyNumbers.map((em, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">সেবার নাম</label>
                      <input
                        type="text"
                        value={em.title}
                        onChange={(e) => {
                          const updated = [...formData.emergencyNumbers];
                          updated[idx].title = e.target.value;
                          setFormData((prev) => ({ ...prev, emergencyNumbers: updated }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">হটলাইন নম্বর</label>
                      <input
                        type="text"
                        value={em.phone}
                        onChange={(e) => {
                          const updated = [...formData.emergencyNumbers];
                          updated[idx].phone = e.target.value;
                          setFormData((prev) => ({ ...prev, emergencyNumbers: updated }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-red-700 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">সংক্ষিপ্ত বিবরণ</label>
                      <input
                        type="text"
                        value={em.description}
                        onChange={(e) => {
                          const updated = [...formData.emergencyNumbers];
                          updated[idx].description = e.target.value;
                          setFormData((prev) => ({ ...prev, emergencyNumbers: updated }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 6: Council Members & Officers Management */}
          {activeSubTab === 'council' && (
            <div className="space-y-4 animate-fade-in">
              <CouncilManagementPanel 
                onSuccessNotification={() => {
                  setSaveSuccessToast(true);
                  setTimeout(() => setSaveSuccessToast(false), 3000);
                }} 
              />
            </div>
          )}

          {/* Bottom Action Rail */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isAuthenticated
                ? '* পরিবর্তন সংরক্ষণের সাথে সাথে পুরো ওয়েবসাইটে সরাসরি কার্যকর হবে।'
                : '⚠️ তথ্য পরিবর্তন করতে উপরের অফিসার আইডি দিয়ে লগইন থাকা আবশ্যক।'}
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 px-6 py-2.5 ${isAuthenticated ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md hover:shadow-lg cursor-pointer' : 'bg-slate-400 text-white cursor-not-allowed opacity-60'} rounded-xl text-xs font-bold transition-all`}
            >
              {isAuthenticated ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isAuthenticated ? 'পরিবর্তন সংরক্ষণ করুন' : 'লগইন আবশ্যক'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
