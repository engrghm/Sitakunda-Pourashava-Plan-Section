import React, { useState, useEffect } from 'react';
import { LandApplication } from '../types.ts';
import { 
  Lock, Search, Filter, Download, ArrowBigRight, RefreshCw, CheckCircle, 
  XCircle, Clock, Eye, AlertCircle, Printer, MessageSquare, MapPin, 
  User, Database, Calendar, FileDown, CheckCircle2, FileVideo, HardDrive, FileText
} from 'lucide-react';

const isSameAddress = (addr1?: any, addr2?: any) => {
  if (!addr1 || !addr2) return false;
  return (
    (addr1.villageOrMahalla || '').trim() === (addr2.villageOrMahalla || '').trim() &&
    (addr1.wardNo || '').trim() === (addr2.wardNo || '').trim() &&
    (addr1.upOrPourashava || '').trim() === (addr2.upOrPourashava || '').trim() &&
    (addr1.thana || '').trim() === (addr2.thana || '').trim() &&
    (addr1.upazila || '').trim() === (addr2.upazila || '').trim() &&
    (addr1.district || '').trim() === (addr2.district || '').trim()
  );
};

export default function AdminPortal() {
  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem('sitakunda_admin_session') || '');

  const [submissions, setSubmissions] = useState<LandApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [mouzaFilter, setMouzaFilter] = useState<string>('All');
  const [khatianFilter, setKhatianFilter] = useState('');
  const [dagFilter, setDagFilter] = useState('');
  const [jlFilter, setJlFilter] = useState('');
  const [mobileFilter, setMobileFilter] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected details view
  const [selectedApp, setSelectedApp] = useState<LandApplication | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load from Express backend api
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const response = await fetch('/api/submissions');
      if (!response.ok) throw new Error('সার্ভার থেকে তথ্য রিড করতে সমস্যা হয়েছে।');
      const data = await response.json();
      setSubmissions(data);
    } catch (err: any) {
      setErrorText(err.message || 'নেটওয়ার্ক ফেইলুর');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchSubmissions();
    }
  }, [authorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(async response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(({ token }) => {
        sessionStorage.setItem('sitakunda_admin_session', token);
        setSessionToken(token);
        setAuthorized(true);
      })
      .catch(() => setLoginError('ভুল ইউজারনেম অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় সঠিক তথ্য দিয়ে চেষ্টা করুন।'));
  };

  const updateApplicationStatus = async (id: string, newStatus: 'Pending' | 'Approved' | 'Rejected' | 'Under Review') => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ status: newStatus, adminRemarks })
      });
      if (!response.ok) throw new Error('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      const updatedApp = await response.json();
      
      // Update local state
      setSubmissions(prev => prev.map(item => item.id === id ? updatedApp : item));
      setSelectedApp(updatedApp);
      alert('আবেদনের অবস্থা সফলভাবে আপডেট হয়েছে এবং আবেদনকারীকে স্বয়ংক্রিয় এসএমএস পাঠানো হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ত্রুটি ঘটেছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Generate CSV download
  const handleExportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      alert('এক্সপোর্ট করার মত কোন তথ্য সারণীতে নেই।');
      return;
    }

    // Build headers with precise land schedule info
    const headers = [
      'Application ID (আবেদন আইডি)', 
      'Form No (ফরম নং)', 
      'Submission Date (জমা তারিখ)', 
      'Status (অবস্থা)', 
      'Owner Name (মালিকের নাম)', 
      'Father/Husband Name (পিতা/স্বামীর নাম)',
      'Permanent Address (স্থায়ী ঠিকানা)', 
      'Mobile No (মোবাইল নম্বর)', 
      'Ward No (ওয়ার্ড নং)', 
      'Mouza Name (মৌজার নাম)',
      'J.L No (জে.এল নং)', 
      'R.S Khatian (আর.এস খতিয়ান)', 
      'R.S Dag (আর.এস দাগ)', 
      'B.S Khatian (বি.এস খতিয়ান)', 
      'B.S Dag (বি.এস দাগ)', 
      'Mutated B.S Khatian (সৃজিত বি.এস খতিয়ান)',
      'Class of Land (জমির শ্রেণী)', 
      'Land Quantity (জমির পরিমাণ)', 
      'Deed Details (দলিল বিবরণ)', 
      'Proposed Structure (প্রস্তাবিত স্থাপনা)', 
      'Admin Remarks (প্রশাসনিক মন্তব্য)'
    ];

    const rows = filteredSubmissions.map(app => {
      const permAddress = `${app.permanentAddress.villageOrMahalla || ''}, ওয়া-${app.permanentAddress.wardNo || ''}, ${app.permanentAddress.upOrPourashava || ''}`;
      const wardNoVal = app.proposedSiteAddress.wardNo || app.permanentAddress.wardNo || '';
      const wardNoFormatted = wardNoVal.startsWith('০') || wardNoVal.length >= 2 ? wardNoVal : `০${wardNoVal}`;
      
      return [
        app.id,
        app.formNo,
        app.createdAt.slice(0, 10),
        app.status,
        (app.owners || []).map(o => o.name).join('; '),
        (app.owners || []).map(o => o.fatherOrHusbandName).join('; '),
        permAddress,
        app.applicantMobile,
        wardNoFormatted,
        app.mouzaName,
        app.jlNo,
        app.rsKhatianNo,
        app.rsDagNo,
        app.bsKhatianNo,
        app.bsDagNo,
        app.mutatedBsKhatianNo || 'N/A',
        app.landClass,
        app.landQuantity,
        app.deedNoAndDate,
        app.proposedStructureType === 'Building' ? `${app.buildingFloors} তলা ${app.buildingCategory}` : app.proposedStructureType,
        app.adminRemarks || ''
      ];
    });

    // Construct CSV text with UTF-8 BOM so Microsoft Excel can display Bengali font beautifully
    const csvContent = 
      "\uFEFF" + 
      [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sitakunda_Land_Verification_Applications_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setWardFilter('All');
    setMouzaFilter('All');
    setKhatianFilter('');
    setDagFilter('');
    setJlFilter('');
    setMobileFilter('');
    setApplicantFilter('');
    setOwnerFilter('');
    setIdFilter('');
    setDateFilter('');
  };

  const handleExportToPDF = () => {
    if (filteredSubmissions.length === 0) {
      alert('প্রিন্ট করার মত কোন তথ্য সারণীতে নেই।');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপ-আপ উইন্ডো ওপেন করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারের পপ-আপ ব্লকার নিষ্ক্রিয় করুন।');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>সীতাকুণ্ড পৌরসভা - ভূমির ডিমার্কেশন ও সঠিকতা যাচাই তালিকা</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            font-family: 'Hind Siliguri', 'Kalpurush', Arial, sans-serif;
            font-size: 10px;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #047857;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 18px;
            margin: 0;
            color: #065f46;
          }
          .header p {
            font-size: 11px;
            margin: 2px 0 0 0;
            color: #4b5563;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #4b5563;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f3f4f6;
            color: #111827;
            font-weight: 700;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 9999px;
            font-weight: bold;
            font-size: 8px;
          }
          .badge-approved { background-color: #d1fae5; color: #065f46; }
          .badge-pending { background-color: #dbeafe; color: #1e40af; }
          .badge-review { background-color: #fef3c7; color: #92400e; }
          .badge-rejected { background-color: #fee2e2; color: #991b1b; }
          
          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #6b7280;
          }
          .footer .sig-line {
            width: 150px;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 4px;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>সীতাকুণ্ড পৌরসভা কার্যালয়</h1>
          <p>ভূমির সঠিকতা ও সীমানা যাচাই পোর্টাল - কর্মকর্তা ড্যাশবোর্ড প্রতিবেদন</p>
        </div>
        <div class="meta-info">
          <div><strong>আবেদন সংখ্যা:</strong> ${filteredSubmissions.length} টি</div>
          <div><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')} ইং</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%">আইডি ও ফরম নং</th>
              <th style="width: 8%">জমা তারিখ</th>
              <th style="width: 15%">মালিক ও আবেদনকারী</th>
              <th style="width: 10%">মৌজা এলাকা</th>
              <th style="width: 5%">ওয়ার্ড</th>
              <th style="width: 15%">তফসিল (খতিয়ান/দাগ/JL)</th>
              <th style="width: 15%">স্থায়ী ঠিকানা</th>
              <th style="width: 10%">মোবাইল</th>
              <th style="width: 10%">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSubmissions.map(app => {
              const dateStr = app.createdAt.slice(0, 10);
              const ownerName = app.owners && app.owners.length > 0 ? app.owners[0].name + (app.owners.length > 1 ? ` (+${app.owners.length - 1} জন)` : '') : 'N/A';
              const wardNoVal = app.proposedSiteAddress.wardNo || app.permanentAddress.wardNo || '';
              const wardFormatted = wardNoVal.startsWith('০') || wardNoVal.length >= 2 ? wardNoVal : `০${wardNoVal}`;
              
              let statusText = 'অপেক্ষমান';
              let badgeClass = 'badge-pending';
              if (app.status === 'Approved') { statusText = 'অনুমোদিত'; badgeClass = 'badge-approved'; }
              else if (app.status === 'Rejected') { statusText = 'বাতিলকৃত'; badgeClass = 'badge-rejected'; }
              else if (app.status === 'Under Review') { statusText = 'তদন্তাধীন'; badgeClass = 'badge-review'; }

              return `
                <tr>
                  <td style="font-family: monospace; font-weight: bold;">
                    ${app.id}<br>
                    <span style="font-size: 8px; color: #6b7280; font-weight: normal;">ফরম: ${app.formNo}</span>
                  </td>
                  <td style="font-family: monospace;">${dateStr}</td>
                  <td>
                    <strong>${ownerName}</strong><br>
                    <span style="font-size: 8px; color: #6b7280;">নিবেদক: ${app.applicantName}</span>
                  </td>
                  <td>${app.mouzaName}</td>
                  <td style="text-align: center; font-weight: bold; font-family: monospace;">${wardFormatted}</td>
                  <td style="font-family: monospace; font-size: 9px;">
                    RS: ${app.rsKhatianNo || 'N/A'}/${app.rsDagNo || 'N/A'}<br>
                    BS: ${app.bsKhatianNo || 'N/A'}/${app.bsDagNo || 'N/A'}<br>
                    JL: ${app.jlNo || 'N/A'}
                  </td>
                  <td>${app.permanentAddress.villageOrMahalla || 'N/A'}</td>
                  <td style="font-family: monospace;">${app.applicantMobile || 'N/A'}</td>
                  <td style="text-align: center;">
                    <span class="badge ${badgeClass}">${statusText}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div>মুদ্রিত সময়: ${new Date().toLocaleString('bn-BD')}</div>
          <div class="sig-line">অনুমোদনকারী কর্মকর্তার স্বাক্ষর</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Extract unique mouzas & wards for filtering dynamically
  const uniqueMouzas = ['All', ...Array.from(new Set(submissions.map(item => item.mouzaName).filter(Boolean)))];
  const uniqueWards = ['All', ...Array.from(new Set(
    submissions.flatMap(item => [item.permanentAddress.wardNo, item.proposedSiteAddress.wardNo].filter(Boolean))
  ))].sort();

  // Apply sequential filters client-side
  const filteredSubmissions = submissions.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesWard = wardFilter === 'All' || app.permanentAddress.wardNo === wardFilter || app.proposedSiteAddress.wardNo === wardFilter;
    const matchesMouza = mouzaFilter === 'All' || app.mouzaName === mouzaFilter;
    
    const matchesKhatian = !khatianFilter || 
      (app.rsKhatianNo || '').includes(khatianFilter) || 
      (app.bsKhatianNo || '').includes(khatianFilter) || 
      (app.mutatedBsKhatianNo || '').includes(khatianFilter);
      
    const matchesDag = !dagFilter || 
      (app.rsDagNo || '').includes(dagFilter) || 
      (app.bsDagNo || '').includes(dagFilter);
      
    const matchesJl = !jlFilter || (app.jlNo || '').includes(jlFilter);
    
    const matchesMobile = !mobileFilter || (app.applicantMobile || '').includes(mobileFilter);
    
    const matchesApplicant = !applicantFilter || 
      (app.applicantName || '').toLowerCase().includes(applicantFilter.toLowerCase());
      
    const matchesOwner = !ownerFilter || 
      (app.owners || []).some(o => (o.name || '').toLowerCase().includes(ownerFilter.toLowerCase()));
      
    const matchesId = !idFilter || 
      (app.id || '').toLowerCase().includes(idFilter.toLowerCase()) || 
      (app.formNo || '').toLowerCase().includes(idFilter.toLowerCase());
      
    const matchesDate = !dateFilter || 
      (app.createdAt || '').slice(0, 10).includes(dateFilter) || 
      (app.applicationDate || '').includes(dateFilter);

    return matchesStatus && matchesWard && matchesMouza && matchesKhatian && matchesDag && matchesJl && matchesMobile && matchesApplicant && matchesOwner && matchesId && matchesDate;
  });

  // Get status color styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> অনুমোদিত</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" /> বাতিলকৃত</span>;
      case 'Under Review':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /> তদন্তাধীন</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /> অপেক্ষমান</span>;
    }
  };

  // Render Login state
  if (!authorized) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-150 overflow-hidden transition-all duration-300 hover:shadow-emerald-100/50">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 p-8 text-center text-white border-b-4 border-orange-500 font-bengali">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg select-none border border-white/20 animate-pulse">
            S
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wide">পৌরসভা কর্মকর্তা পোর্টাল</h2>
          <p className="text-xs text-emerald-100 opacity-90 mt-1.5 font-medium">ভূমির ডিমার্কেশন ও সঠিকতা যাচাই ড্যাশবোর্ড</p>
        </div>

        <div className="p-8">
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs leading-relaxed mb-6 font-bengali flex items-start gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 font-bengali">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">ইউজারনেম (Username)</label>
              <input
                type="text"
                required
                placeholder="ইউজারনেম লিখুন"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">পাসওয়ার্ড (Password)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 font-bold uppercase tracking-wider text-white py-3 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 border-emerald-950 shadow-md hover:shadow-lg mt-6"
            >
              <Lock className="w-4 h-4 text-emerald-100" />
              <span>প্যানেলে প্রবেশ করুন (Sign In)</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-bengali">
      {/* Admin stats dashboard banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5">মোট আবেদনপত্র</p>
            <p className="text-xl font-bold font-mono text-slate-900">{submissions.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs font-bengali">
          <div className="p-3 bg-amber-50 text-amber-850 rounded-lg"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5">অপেক্ষমান / তদন্তাধীন</p>
            <p className="text-xl font-bold font-mono text-amber-900">
              {submissions.filter(s => s.status === 'Pending' || s.status === 'Under Review').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-850 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5">অনুমোদিত আবেদন</p>
            <p className="text-xl font-bold font-mono text-emerald-900">
              {submissions.filter(s => s.status === 'Approved').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-rose-50 text-rose-850 rounded-lg"><XCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5">বাতিলকৃত আবেদন</p>
            <p className="text-xl font-bold font-mono text-rose-900">
              {submissions.filter(s => s.status === 'Rejected').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and control panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs no-print font-bengali">
        <div className="sm:flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Filter className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-800 text-sm">তফসিল ও ওয়ার্ড ভিত্তিক উন্নত ফিল্টারিং</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-1 text-xs border border-slate-300 hover:bg-slate-50 rounded px-2.5 py-1.5 transition-colors cursor-pointer text-slate-700 font-semibold"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={handleExportToCSV}
              className="flex items-center gap-1.5 text-xs bg-emerald-800 hover:bg-emerald-950 text-white rounded px-3 py-1.5 transition-colors cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel/CSV এক্সপোর্ট</span>
            </button>
            <button
              onClick={handleExportToPDF}
              className="flex items-center gap-1.5 text-xs bg-indigo-800 hover:bg-indigo-950 text-white rounded px-3 py-1.5 transition-colors cursor-pointer font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Landscape PDF এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 mb-1">মৌজা এলাকা</label>
            <select
              value={mouzaFilter}
              onChange={(e) => setMouzaFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 cursor-pointer outline-none"
            >
              {uniqueMouzas.map((m, idx) => (
                <option key={idx} value={m}>{m === 'All' ? 'সকল মৌজা' : m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">ওয়ার্ড নং</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 cursor-pointer outline-none"
            >
              {uniqueWards.map((w, idx) => (
                <option key={idx} value={w}>{w === 'All' ? 'সকল ওয়ার্ড' : `ওয়ার্ড ০${w}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">আবেদনের অবস্থা</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 cursor-pointer outline-none"
            >
              <option value="All">সকল অবস্থা</option>
              <option value="Pending">অপেক্ষমান</option>
              <option value="Under Review">তদন্তাধীন</option>
              <option value="Approved">অনুমোদিত</option>
              <option value="Rejected">বাতিলকৃত</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">আবেদন আইডি / ফরম নং</label>
            <input
              type="text"
              placeholder="উদা: APP-2026-0001"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">খতিয়ান নং</label>
            <input
              type="text"
              placeholder="খতিয়ান নং লিখুন"
              value={khatianFilter}
              onChange={(e) => setKhatianFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">দাগ নং</label>
            <input
              type="text"
              placeholder="দাগ নং লিখুন"
              value={dagFilter}
              onChange={(e) => setDagFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">জে.এল. নং</label>
            <input
              type="text"
              placeholder="জে.এল. নং লিখুন"
              value={jlFilter}
              onChange={(e) => setJlFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">নিবেদকের মোবাইল নং</label>
            <input
              type="text"
              placeholder="মোবাইল নং লিখুন"
              value={mobileFilter}
              onChange={(e) => setMobileFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">আবেদনকারীর নাম</label>
            <input
              type="text"
              placeholder="আবেদনকারীর নাম"
              value={applicantFilter}
              onChange={(e) => setApplicantFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">ভূমির মালিকের নাম</label>
            <input
              type="text"
              placeholder="ভূমির মালিকের নাম"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">জমাদানের তারিখ</label>
            <input
              type="text"
              placeholder="উদা: ২০২৬-০৬-০৫"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 rounded border border-slate-200 px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-1.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              ফিল্টার রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* Main Submissions Table Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden no-print">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="animate-spin h-8 w-8 text-emerald-800 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-semibold">আবেদনপত্র লোড হচ্ছে...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bengali">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">কোন আবেদনপত্র পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-650 font-bengali uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">আইডি ও ফরম নং</th>
                  <th className="py-3 px-3 text-left">জমা তারিখ</th>
                  <th className="py-3 px-4 text-left">মালিক ও আবেদনকারী</th>
                  <th className="py-3 px-4 text-center">মৌজা এলাকা</th>
                  <th className="py-3 px-4 text-center">ওয়ার্ড নং</th>
                  <th className="py-3 px-4 text-left">তফসিল (খতিয়ান/দাগ/JL)</th>
                  <th className="py-3 px-4 text-left">স্থায়ী ঠিকানা</th>
                  <th className="py-3 px-4 text-left">মোবাইল</th>
                  <th className="py-3 px-4 text-center">সংযুক্তি</th>
                  <th className="py-3 px-4 text-center">অবস্থা</th>
                  <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredSubmissions.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-all text-xs">
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-950">
                      <div>{app.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">ফরম: {app.formNo}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-550 font-mono">
                      {app.createdAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4">
                      {app.owners && app.owners.length > 0 ? (
                        <div className="font-bold text-slate-800 flex items-center flex-wrap gap-1">
                          <span>{app.owners[0].name}</span>
                          {app.owners.length > 1 && (
                            <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              +{app.owners.length - 1} জন
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="font-bold text-slate-400">N/A</div>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" /> 
                        <span>নিবেদক: {app.applicantName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">{app.mouzaName}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-950 font-mono">
                      {(() => {
                        const wardNoVal = app.proposedSiteAddress.wardNo || app.permanentAddress.wardNo || '';
                        return wardNoVal.startsWith('০') || wardNoVal.length >= 2 ? wardNoVal : `০${wardNoVal}`;
                      })()}
                    </td>
                    <td className="py-3 px-4 leading-relaxed">
                      <div className="text-[11px] text-slate-550 flex flex-wrap gap-1 font-mono">
                        <span className="bg-emerald-50 text-emerald-850 px-1 py-0.2 rounded border border-emerald-100">RS {app.rsKhatianNo || 'N/A'}/{app.rsDagNo || 'N/A'}</span>
                        <span className="bg-indigo-50 text-indigo-850 px-1 py-0.2 rounded border border-indigo-100 font-semibold">BS {app.bsKhatianNo || 'N/A'}/{app.bsDagNo || 'N/A'}</span>
                      </div>
                      <div className="text-[10px] text-slate-450 mt-1 font-normal">JL: {app.jlNo || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 font-bengali text-xs max-w-[160px] truncate" title={`${app.permanentAddress.villageOrMahalla || ''}, ওয়া-${app.permanentAddress.wardNo || ''}`}>
                      <div className="font-medium text-slate-800">{app.permanentAddress.villageOrMahalla || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">ওয়ার্ড: {app.permanentAddress.wardNo || 'N/A'}, {app.permanentAddress.upOrPourashava || ''}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {app.applicantMobile || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center -space-x-1">
                        {app.attachments.filter(a => a.uploaded).map((att) => (
                          <div 
                            key={att.id} 
                            title={att.label}
                            className="w-5 h-5 rounded-full border border-white bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold"
                          >
                            {att.id}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setAdminRemarks(app.adminRemarks || '');
                        }}
                        className="inline-flex items-center gap-1 text-xs bg-slate-100 border border-slate-350 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-lg text-slate-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>যাচাই ও পত্র</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Application Detailed Form Modal Workspace */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4 md:p-6 print:relative print:z-0 print:p-0 print:block print:bg-transparent">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-4">
            
            {/* Modal Title Action Rail */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
              <div className="font-bengali">
                <h3 className="font-bold text-base">আবেদন পত্রের বিস্তারিত ফাইল</h3>
                <p className="text-xs text-slate-400 font-mono">আইডি: {selectedApp.id} / ফরম নং: {selectedApp.formNo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white hover:text-rose-500 text-xs font-bold rounded-lg px-3 py-1.5 tracking-wide cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Modal layout */}
            <div className="p-6 md:p-8 space-y-6">

              {/* Printable Official Form (Shows in print beautifully) */}
              <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-xs print-page font-kalpurush text-sm text-black leading-relaxed">
                
                {/* Header for official print */}
                <div className="text-center border-b border-double border-slate-400 pb-4 mb-6">
                  <p className="text-xs text-slate-650 tracking-wider font-semibold">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                  <h2 className="text-xl font-bold tracking-wide mt-0.5">সীতাকুণ্ড পৌরসভা কার্যালয়</h2>
                  <h3 className="text-xs font-medium text-slate-600 mt-0.5">সীতাকুণ্ড, চট্টগ্রাম</h3>
                  <h1 className="text-base font-bold bg-slate-100 py-1.5 px-4 rounded-md inline-block uppercase tracking-wide border border-slate-300 mt-2">
                    ভূমির ডিমার্কেশন যাচাইয়ের আবেদনপত্র প্রতিলিপি
                  </h1>
                  <div className="mt-2 flex justify-between px-2 text-xs font-semibold text-slate-600 font-mono">
                    <span>আবেদন ট্র্যাকিং আইডি: {selectedApp.id}</span>
                    <span>ফরম নং : {selectedApp.formNo} (মূল্য ১০০/- টাকা)</span>
                  </div>
                </div>

                {/* Sender block */}
                <div className="space-y-4 mb-6 text-black">
                  <div className="flex flex-col gap-0.5">
                    <strong>বরাবর,</strong>
                    <span>প্রসাশক,</span>
                    <span>সীতাকুণ্ড পৌরসভা কার্যালয়।</span>
                  </div>
                  <div>
                    <strong>বিষয়: </strong> 
                    <span className="border-b border-dotted border-black pb-0.5 font-semibold">
                      প্রস্তাবিত সম্পত্তির মালিকানা সম্পর্কিত সঠিকতা যাচাই প্রসঙ্গে।
                    </span>
                  </div>
                  <div>
                    <p className="mt-1.5 text-justify leading-relaxed">
                      বিনীত প্রার্থনা এই যে, আমি/আমরা নিম্নবর্ণিত তফসিলভুক্ত সম্পত্তিতে <span className="font-bold underline">{selectedApp.proposedStructureType === 'Boundary Wall' ? 'সীমানা প্রাচীর' : selectedApp.proposedStructureType === 'Semi-pucka' ? 'আধাপাকা ঘর' : `${selectedApp.buildingFloors} বিশিষ্ট ${selectedApp.buildingCategory === 'Residential' ? 'আবাসিক' : 'বাণিজ্যিক'} ভবন`}</span> নির্মাণ সম্পন্ন করার অনুমোদনকল্পে প্রস্তাবিত ভূমির সঠিকতা যাচাই সংক্রান্ত ডিমার্কেশনপত্র প্রদানের জন্য আবেদন করছি।
                    </p>
                  </div>
                </div>

                {/* ১। প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose) */}
                <div className="mb-6">
                  <h3 className="font-bold border-b border-black pb-1 mb-3 text-[14px]">১। প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose) :</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50/40 p-3 border border-slate-300 rounded-lg">
                    <div><strong>নির্মাণের ধরন:</strong> {selectedApp.proposedStructureType === 'Boundary Wall' ? 'সীমানা প্রাচীর' : selectedApp.proposedStructureType === 'Semi-pucka' ? 'আধাপাকা ঘর' : 'বহুতল ভবন'}</div>
                    {selectedApp.proposedStructureType === 'Building' && <div><strong>তলার সংখ্যা:</strong> {selectedApp.buildingFloors} তলা</div>}
                    <div><strong>স্থাপনার শ্রেণী:</strong> {selectedApp.buildingCategory === 'Residential' ? 'আবাসিক' : 'বাণিজ্যিক'}</div>
                  </div>
                </div>

                {/* ২। ভূমির মালিকের তথ্য (Land Owner Information) */}
                <div className="mb-6">
                  <h3 className="font-bold border-b border-black pb-1 mb-3 text-[14px]">২। ভূমির মালিকের তথ্য (Land Owner Information) :</h3>
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-300 text-slate-700">
                          <th className="py-2 px-3 border-r border-slate-300 text-center font-bold w-12">ক্র.</th>
                          <th className="py-2 px-3 border-r border-slate-300 font-bold">মালিকের নাম ও পিতা/স্বামী</th>
                          <th className="py-2 px-3 border-r border-slate-300 font-bold">স্থায়ী ঠিকানা</th>
                          <th className="py-2 px-3 font-bold">বর্তমান ঠিকানা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {(selectedApp.owners || []).map((owner, index) => {
                          const permAddr = `${owner.permanentAddress?.villageOrMahalla || ''}, ওয়ার্ড: ${owner.permanentAddress?.wardNo || ''}, ${owner.permanentAddress?.upOrPourashava || ''}, ${owner.permanentAddress?.thana || ''}`;
                          const presAddr = `${owner.presentAddress?.villageOrMahalla || ''}, ওয়ার্ড: ${owner.presentAddress?.wardNo || ''}, ${owner.presentAddress?.upOrPourashava || ''}, ${owner.presentAddress?.thana || ''}`;
                          return (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-bold font-mono">{index + 1}</td>
                              <td className="py-2 px-3 border-r border-slate-300">
                                <div className="font-bold text-slate-900">{owner.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">পিতা/স্বামী: {owner.fatherOrHusbandName}</div>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-300 text-[11px] leading-tight">{permAddr}</td>
                              <td className="py-2 px-3 text-[11px] leading-tight">{presAddr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ৩। ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land] */}
                <div className="mb-6">
                  <h3 className="font-bold border-b border-black pb-1 mb-3 text-[14px]">৩। ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land] :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 border border-slate-300 rounded-lg p-3 bg-slate-50/40">
                    <div><strong>মৌজার নাম:</strong> {selectedApp.mouzaName} (জে.এল নং {selectedApp.jlNo || 'N/A'})</div>
                    <div><strong>আর.এস খতিয়ান নং:</strong> {selectedApp.rsKhatianNo}    <strong>আর.এস দাগ নং:</strong> {selectedApp.rsDagNo}</div>
                    <div><strong>বি.এস খতিয়ান নং:</strong> {selectedApp.bsKhatianNo}    <strong>বি.এস দাগ নং:</strong> {selectedApp.bsDagNo}</div>
                    <div><strong>সৃজিত বি.এস খতিয়ান নং (নামজারী):</strong> {selectedApp.mutatedBsKhatianNo || 'প্রযোজ্য নয়'}</div>
                    <div><strong>সম্পত্তির পরিমাণ:</strong> {selectedApp.landQuantity}</div>
                    <div><strong>সম্পত্তির শ্রেণী:</strong> {selectedApp.landClass}</div>
                    <div className="md:col-span-2"><strong>রেজিস্ট্রিকৃত দলিল নং ও তারিখ:</strong> {selectedApp.deedNoAndDate}</div>
                  </div>
                </div>

                {/* ৪। প্রস্তাবিত সাইটের ঠিকানা (যেখানে ম্যাপ ডিমার্কেশন হবে) */}
                <div className="mb-6">
                  <h3 className="font-bold border-b border-black pb-1 mb-3 text-[14px]">৪। প্রস্তাবিত সাইটের ঠিকানা (যেখানে ম্যাপ ডিমার্কেশন হবে) :</h3>
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/40 text-xs space-y-1">
                    <div>গ্রাম/মহল্লা: {selectedApp.proposedSiteAddress?.villageOrMahalla}</div>
                    <div>সাইট ওয়ার্ড নং: {selectedApp.proposedSiteAddress?.wardNo}</div>
                    <div>পৌরসভা: {selectedApp.proposedSiteAddress?.upOrPourashava}</div>
                    <div>থানা: {selectedApp.proposedSiteAddress?.thana}</div>
                    <div>উপজেলা: {selectedApp.proposedSiteAddress?.upazila}</div>
                    <div>জেলা: {selectedApp.proposedSiteAddress?.district}</div>
                  </div>
                </div>

                {/* ৫। প্রয়োজনীয় কাগজপত্র আপলোড ও ফটোকপি (PDF/JPG/PNG) */}
                <div className="mb-6">
                  <h3 className="font-bold border-b border-black pb-1 mb-3 text-[14px]">৫। প্রয়োজনীয় কাগজপত্র (Required Documents) :</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 mt-1.5 text-xs">
                    {selectedApp.attachments.filter(a => a.uploaded).map((att) => (
                      <div key={att.id} className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{att.label} ({att.copies || 1} কপি)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ৬। ঘোষণা (Declaration) ও আবেদনকারী */}
                {(() => {
                  const firstOwner = selectedApp.owners?.[0];
                  const showApplicantPermanentAddress = !firstOwner || !isSameAddress(selectedApp.permanentAddress, firstOwner.permanentAddress);
                  return (
                    <div className="mb-6 border border-slate-300 rounded-lg p-4 bg-slate-50/50 text-xs">
                      <h3 className="font-bold border-b border-black pb-1 mb-2 text-[13px]">৬। ঘোষণা ও নিবেদক (Declaration & Applicant) :</h3>
                      <p className="mb-3 text-justify leading-relaxed text-[11px] text-slate-700">
                        <strong>ঘোষণাপত্র:</strong> আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত যাবতীয় তথ্য সম্পূর্ণ সত্য ও সঠিক। প্রস্তাবিত সম্পত্তিতে সীমানা বা মালিকানা সংক্রান্ত কোন প্রকার মোকদ্দমা বা আইনগত বিরোধ চলমান নাই। যদি পরবর্তীতে কোন ভুল তথ্য বা জালিয়াতি প্রমাণিত হয়, তবে আমার আবেদন বাতিলসহ যেকোনো ধরনের আইনগত শাস্তি মেনে নিতে বাধ্য থাকিব।
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>নিবেদকের নাম:</strong> {selectedApp.applicantName}</p>
                          <p><strong>পিতা/স্বামীর নাম:</strong> {selectedApp.applicantFatherOrHusbandName}</p>
                          <p><strong>মোবাইল নম্বর:</strong> {selectedApp.applicantMobile}</p>
                          {selectedApp.applicantEmail && <p><strong>ইমেইল:</strong> {selectedApp.applicantEmail}</p>}
                        </div>
                        <div>
                          <p><strong>আবেদনের তারিখ:</strong> {selectedApp.applicationDate} ইং</p>
                          {showApplicantPermanentAddress ? (
                            <div>
                              <p><strong>আবেদনকারীর স্থায়ী ঠিকানা:</strong></p>
                              <p className="text-[11px] text-slate-650">গ্রাম/মহল্লা: {selectedApp.permanentAddress?.villageOrMahalla}, ওয়ার্ড নং: {selectedApp.permanentAddress?.wardNo}</p>
                              <p className="text-[11px] text-slate-650">পৌরসভা: {selectedApp.permanentAddress?.upOrPourashava}, থানা: {selectedApp.permanentAddress?.thana}</p>
                            </div>
                          ) : (
                            <p className="text-emerald-800 font-bold">স্থায়ী ঠিকানা: ১ম মালিকের ঠিকানার অনুরূপ।</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Submited application signing */}
                <div className="border-t border-dotted border-slate-300 pt-4 flex justify-between items-start text-xs font-semibold">
                  <div>
                    <strong>আবেদনকারী বিবরণ:</strong>
                    <div className="space-y-0.5 mt-1 font-normal">
                      <div>নাম: {selectedApp.applicantName}</div>
                      <div>মোবাইল নং: {selectedApp.applicantMobile}</div>
                      <div>তারিখ: {selectedApp.applicationDate} ইং</div>
                    </div>
                  </div>
                  
                  {/* Realtime verification signature design */}
                  <div className="text-center font-mono">
                    <div className="w-32 border-b border-black mx-auto mb-1">
                      <span className="font-bengali text-[10px] text-slate-400">অনলাইন সিগনেচার</span>
                    </div>
                    <span>{selectedApp.applicantName}</span>
                  </div>
                </div>
              </div>

              {/* View uploaded attachments block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 no-print">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-3">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>ডিজিটাল সংযুক্তি নথিসমূহ (Click file to open or copy base64 data)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedApp.attachments.map(att => (
                    <div 
                      key={att.id} 
                      className={`p-3 rounded-lg border text-xs flex justify-between items-center transition-all ${
                        att.uploaded 
                          ? 'bg-white border-slate-250 hover:bg-slate-50' 
                          : 'bg-slate-100/55 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-800 truncate">{att.label}</p>
                        {att.uploaded ? (
                          <span className="text-[10px] text-emerald-700 font-medium font-mono">{att.fileName} ({att.fileSize})</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">অনুপস্থিত (Not Uploaded)</span>
                        )}
                      </div>
                      
                      {att.uploaded && att.fileData && (
                        <button
                          onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.write(`<iframe src="${att.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            } else {
                              alert('পপ-আপ লকার নিষ্ক্রিয় করুন অথবা ফাইল ডাউনলোড করুন।');
                            }
                          }}
                          className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded transition-colors shrink-0"
                        >
                          নথি দেখুন
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Decision-making Assistant Box */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-700 shadow-md no-print space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-sm text-emerald-400 border-b border-slate-800 pb-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>পৌর কর্মকর্তা যাচাই সহায়িকা (Property Location Reference)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800/60 flex items-start gap-3">
                    <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Property Mouza / Area</span>
                      <span className="text-sm font-bold text-slate-100 block mt-1 font-bengali">মৌজা এলাকা: {selectedApp.mouzaName}</span>
                      <span className="text-[11px] text-slate-400 font-normal block mt-0.5 font-bengali">জে.এল. নং (J.L. No): {selectedApp.jlNo || 'প্রযোজ্য নয়'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800/60 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Administrative Ward / Site Location</span>
                      <span className="text-sm font-bold text-slate-100 block mt-1 font-bengali">
                        ওয়ার্ড নং (সংরক্ষিত এলাকা): {(() => {
                          const wardVal = selectedApp.proposedSiteAddress.wardNo || selectedApp.permanentAddress.wardNo || '';
                          return wardVal.startsWith('০') || wardVal.length >= 2 ? wardVal : `০${wardVal}`;
                        })()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal block mt-0.5 font-bengali">গ্রাম/মহল্লা: {selectedApp.proposedSiteAddress.villageOrMahalla || 'প্রযোজ্য নয়'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative status alteration widget */}
              <div className="bg-emerald-50/20 border-2 border-emerald-600/30 rounded-xl p-5 no-print">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-bold text-slate-800 text-sm">প্রশাসনিক পদক্ষেপ ও মন্তব্য কলাম (Admin Workflow)</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      নক্সাকার (সিভিল), সীতাকুণ্ড পৌরসভা এর মূল্যায়ন ও প্রত্যয়ন মন্তব্য:
                    </label>
                    <textarea
                      rows={3}
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      placeholder="ভূমি পরিদর্শকের তদন্ত খতিয়ান, দাগ নম্বরের মালিকানা সঠিকতা বা বাতিল করার যৌক্তিক কারণ এখানে উল্লেখ করুন..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none bg-white focus:ring-1 focus:ring-emerald-500"
                    ></textarea>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <span className="text-xs text-slate-500 font-semibold">
                      বর্তমান স্ট্যাটাস: {getStatusBadge(selectedApp.status)}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateApplicationStatus(selectedApp.id, 'Under Review')}
                        disabled={updatingStatus}
                        className="bg-yellow-100 hover:bg-yellow-250 border border-yellow-300 text-yellow-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        তদন্তাধীন (Review)
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApp.id, 'Approved')}
                        disabled={updatingStatus}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        অনুমোদন (Approve)
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApp.id, 'Rejected')}
                        disabled={updatingStatus}
                        className="bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        আবেদন খারিজ (Reject)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal action buttons */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="bg-white border border-slate-350 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer"
              >
                বন্ধ ও ফিরে যান
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
