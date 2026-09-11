import React, { useState, useEffect } from 'react';
import { Address, Attachment, LandApplication, LandOwner } from '../types.ts';
import { Upload, CheckCircle2, ShieldCheck, AlertCircle, FileText, Info, Building, MapPin, User, ChevronRight, Trash2, PlusCircle } from 'lucide-react';

const MOUZA_JL_MAPPING: Record<string, string> = {
  'দক্ষিণ টেরিয়াইল': '13',
  'শিবপুর': '19',
  'ইয়াকুব নগর': '20',
  'আমিরাবাদ': '25',
  'মহাদেবপুর': '27',
  'সীতাকুণ্ড': '28',
  'জঙ্গল সীতাকুণ্ড': '29',
  'জঙ্গল মহাদেবপুর': '30'
};

interface FormPortalProps {
  onSuccess: (app: LandApplication) => void;
}

const defaultAddress = (): Address => ({
  villageOrMahalla: '',
  wardNo: '',
  upOrPourashava: 'সীতাকুণ্ড পৌরসভা',
  thana: 'সীতাকুণ্ড',
  upazila: 'সীতাকুণ্ড',
  district: 'চট্টগ্রাম'
});

const defaultAttachments = (): Attachment[] => [
  { id: '1', label: 'জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন সনদ/পাসপোর্টের ফটোকপি (আবশ্যক)', required: true, uploaded: false, copies: 1 },
  { id: '2', label: 'ছবি (পাসপোর্ট সাইজ) (আবশ্যক)', required: true, uploaded: false, copies: 1 },
  { id: '3', label: 'আর.এস খতিয়ান এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '4', label: 'বি.এস খতিয়ান এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '5', label: 'সৃজিত বি.এস খতিয়ান এর ফটোকপি', required: true, uploaded: false, copies: 1 },
  { id: '6', label: 'খরিদা/হেবা/দানপত্র/বণ্টননামা দলিল (রেজিস্ট্রিকৃত) এর ফটোকপি', required: true, uploaded: false, copies: 1 },
  { id: '7', label: 'মৌজা ম্যাপ এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '8', label: 'ওয়ারিশান সনদপত্র এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '9', label: 'অনাপত্তি পত্র (দাগের অন্যান্য মালিকগণের) এর ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '10', label: 'হোল্ডিং কর পরিশোধের হালনাগাদ রশিদের ফটোকপি (প্রযোজ্য ক্ষেত্রে)', required: false, uploaded: false, copies: 1 },
  { id: '11', label: 'আয়কর ই-রিটার্ন সার্টিফিকেট', required: false, uploaded: false, copies: 1 },
  { id: '12', label: 'অন্যান্য কাগজপত্র (Others) এর ফটোকপি (ঐচ্ছিক)', required: false, uploaded: false, copies: 1 }
];

export default function FormPortal({ onSuccess }: FormPortalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Helper to check if a draft has non-empty field values
  const isDraftNotEmpty = (d: any) => {
    if (!d) return false;
    return !!(
      (d.owners && d.owners.length > 0 && d.owners[0].name) ||
      d.applicantName || 
      d.mouzaName || 
      d.rsKhatianNo || 
      d.bsKhatianNo || 
      d.applicantMobile
    );
  };

  // Check if a saved draft exists
  const draft = (() => {
    try {
      const saved = localStorage.getItem('sitakunda_demarcation_form_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const [restoredNotification, setRestoredNotification] = useState<boolean>(() => {
    return isDraftNotEmpty(draft);
  });

  // Structure Type & Category
  const [proposedStructureType, setProposedStructureType] = useState<'Boundary Wall' | 'Semi-pucka' | 'Building'>(
    draft?.proposedStructureType || 'Building'
  );
  const [buildingFloors, setBuildingFloors] = useState<string>(draft?.buildingFloors || '১');
  const [buildingCategory, setBuildingCategory] = useState<'Residential' | 'Commercial'>(draft?.buildingCategory || 'Residential');

  // Land owners dynamic information array
  const [owners, setOwners] = useState<LandOwner[]>(() => {
    if (draft?.owners && Array.isArray(draft.owners)) {
      return draft.owners;
    }
    return [
      {
        name: '',
        fatherOrHusbandName: '',
        permanentAddress: defaultAddress(),
        presentAddress: defaultAddress()
      }
    ];
  });

  const [mouzaName, setMouzaName] = useState(draft?.mouzaName || '');
  const [jlNo, setJlNo] = useState(draft?.jlNo || '');
  const [rsKhatianNo, setRsKhatianNo] = useState(draft?.rsKhatianNo || '');
  const [rsDagNo, setRsDagNo] = useState(draft?.rsDagNo || '');
  const [bsKhatianNo, setBsKhatianNo] = useState(draft?.bsKhatianNo || '');
  const [bsDagNo, setBsDagNo] = useState(draft?.bsDagNo || '');
  const [mutatedBsKhatianNo, setMutatedBsKhatianNo] = useState(draft?.mutatedBsKhatianNo || '');
  const [landQuantity, setLandQuantity] = useState(draft?.landQuantity || '');
  const [landClass, setLandClass] = useState(draft?.landClass || '');
  const [deedNoAndDate, setDeedNoAndDate] = useState(draft?.deedNoAndDate || '');

  // Addresses
  const [permanentAddress, setPermanentAddress] = useState<Address>(draft?.permanentAddress || defaultAddress());
  const [proposedSiteAddress, setProposedSiteAddress] = useState<Address>(
    draft?.proposedSiteAddress || {
      ...defaultAddress(),
      villageOrMahalla: ''
    }
  );

  // Checklist / Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const defaults = defaultAttachments();
    if (draft?.attachments && Array.isArray(draft.attachments)) {
      const existingIds = new Set(draft.attachments.map((a: any) => a.id));
      const missing = defaults.filter(d => !existingIds.has(d.id));
      return [...draft.attachments, ...missing];
    }
    return defaults;
  });

  // Applicant contact
  const [applicantName, setApplicantName] = useState(draft?.applicantName || '');
  const [applicantFatherOrHusbandName, setApplicantFatherOrHusbandName] = useState(draft?.applicantFatherOrHusbandName || '');
  const [applicantMobile, setApplicantMobile] = useState(draft?.applicantMobile || '');
  const [applicantEmail, setApplicantEmail] = useState(draft?.applicantEmail || '');
  const [applicationDate, setApplicationDate] = useState(draft?.applicationDate || new Date().toISOString().slice(0, 10));

  // Reset Draft/Form Progress to defaults
  const handleClearDraft = () => {
    try {
      localStorage.removeItem('sitakunda_demarcation_form_draft');
    } catch {}
    setRestoredNotification(false);
    
    setProposedStructureType('Building');
    setBuildingFloors('১');
    setBuildingCategory('Residential');
    setOwners([
      {
        name: '',
        fatherOrHusbandName: '',
        permanentAddress: defaultAddress(),
        presentAddress: defaultAddress()
      }
    ]);
    setMouzaName('');
    setJlNo('');
    setRsKhatianNo('');
    setRsDagNo('');
    setBsKhatianNo('');
    setBsDagNo('');
    setMutatedBsKhatianNo('');
    setLandQuantity('');
    setLandClass('');
    setDeedNoAndDate('');
    setPermanentAddress(defaultAddress());
    setProposedSiteAddress({
      ...defaultAddress(),
      villageOrMahalla: ''
    });
    setApplicantName('');
    setApplicantFatherOrHusbandName('');
    setApplicantMobile('');
    setApplicantEmail('');
    setApplicationDate(new Date().toISOString().slice(0, 10));
    setAttachments(defaultAttachments());
  };

  const addOwner = () => {
    if (owners.length >= 100) {
      alert('দুঃখিত, সর্বোচ্চ ১০০ জন মালিকের তথ্য সংযোজন করা সম্ভব।');
      return;
    }
    setOwners([
      ...owners,
      {
        name: '',
        fatherOrHusbandName: '',
        permanentAddress: defaultAddress(),
        presentAddress: defaultAddress()
      }
    ]);
  };

  const removeOwner = (index: number) => {
    if (owners.length <= 1) {
      alert('অনূন্য ১ জন মালিকের তথ্য থাকতে হবে।');
      return;
    }
    setOwners(owners.filter((_, i) => i !== index));
  };

  const updateOwnerField = (index: number, field: keyof LandOwner, value: any) => {
    setOwners(prev =>
      prev.map((owner, i) => {
        if (i === index) {
          return { ...owner, [field]: value };
        }
        return owner;
      })
    );
  };

  const updateOwnerAddressField = (
    index: number,
    addressType: 'permanentAddress' | 'presentAddress',
    field: keyof Address,
    value: string
  ) => {
    setOwners(prev =>
      prev.map((owner, i) => {
        if (i === index) {
          return {
            ...owner,
            [addressType]: {
              ...owner[addressType],
              [field]: value
            }
          };
        }
        return owner;
      })
    );
  };

  const copyOwnerPermanentToPresent = (index: number) => {
    setOwners(prev =>
      prev.map((owner, i) => {
        if (i === index) {
          return {
            ...owner,
            presentAddress: { ...owner.permanentAddress }
          };
        }
        return owner;
      })
    );
  };

  const copyFirstOwnerPermanentToApplicant = () => {
    if (owners.length > 0) {
      setPermanentAddress({ ...owners[0].permanentAddress });
    }
  };

  // Auto-save progress on changes
  useEffect(() => {
    const draftPayload = {
      proposedStructureType,
      buildingFloors,
      buildingCategory,
      owners,
      mouzaName,
      jlNo,
      rsKhatianNo,
      rsDagNo,
      bsKhatianNo,
      bsDagNo,
      mutatedBsKhatianNo,
      landQuantity,
      landClass,
      deedNoAndDate,
      permanentAddress,
      proposedSiteAddress,
      applicantName,
      applicantFatherOrHusbandName,
      applicantMobile,
      applicantEmail,
      applicationDate,
      attachments
    };

    if (isDraftNotEmpty(draftPayload)) {
      try {
        localStorage.setItem('sitakunda_demarcation_form_draft', JSON.stringify(draftPayload));
      } catch (e) {
        console.warn('Could not auto-save form draft to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem('sitakunda_demarcation_form_draft');
      } catch {}
    }
  }, [
    proposedStructureType,
    buildingFloors,
    buildingCategory,
    owners,
    mouzaName,
    jlNo,
    rsKhatianNo,
    rsDagNo,
    bsKhatianNo,
    bsDagNo,
    mutatedBsKhatianNo,
    landQuantity,
    landClass,
    deedNoAndDate,
    permanentAddress,
    proposedSiteAddress,
    applicantName,
    applicantFatherOrHusbandName,
    applicantMobile,
    applicantEmail,
    applicationDate,
    attachments
  ]);

  // Handle uploading specific attachment (single file per field)
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('দুঃখিত, প্রতিটি আপলোডকৃত ফাইলের সর্বোচ্চ সাইজ ২ মেগাবাইট (2 MB)। এর বেশি সাইজের ফাইল আপলোড করা যাবে না।');
      return;
    }
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
      alert('দুঃখিত, ফাইলের ফরম্যাট গ্রহণযোগ্য নয়। শুধুমাত্র JPG, JPEG, PNG, এবং PDF ফাইল আপলোড করা যাবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachments(prev =>
        prev.map(att => {
          if (att.id === id) {
            return {
              ...att,
              uploaded: true,
              fileName: file.name,
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              fileData: reader.result as string,
              fileUrl: reader.result as string
            };
          }
          return att;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  // Copy permanent address to proposed site
  const copyAddressPermanentToProposed = () => {
    setProposedSiteAddress({ ...permanentAddress });
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setValidationErrors([]);

    const errors: string[] = [];
    
    // ১। প্রস্তাবিত নির্মাণ ও উদ্দেশ্য
    if (proposedStructureType === 'Building' && !buildingFloors.trim()) {
      errors.push('তলার সংখ্যা প্রদান করা আবশ্যক।');
    }

    // ২। ভূমির মালিকের তথ্য
    if (!owners || owners.length === 0) {
      errors.push('অনূন্য ১ জন ভূমির মালিকের তথ্য প্রদান করা আবশ্যক।');
    } else {
      owners.forEach((owner, idx) => {
        const ownerLabel = `মালিক #${idx + 1}`;
        if (!owner.name.trim()) errors.push(`${ownerLabel}: ভূমির মালিকের নাম প্রদান করা আবশ্যক।`);
        if (!owner.fatherOrHusbandName.trim()) errors.push(`${ownerLabel}: পিতা/স্বামীর নাম প্রদান করা আবশ্যক।`);
        
        // Permanent address
        if (!owner.permanentAddress.villageOrMahalla.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): গ্রাম/মহল্লা/হোল্ডিং প্রদান করা আবশ্যক।`);
        if (!owner.permanentAddress.wardNo.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): ওয়ার্ড নং প্রদান করা আবশ্যক।`);
        if (!owner.permanentAddress.upOrPourashava.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): পৌরসভা/ইউনিয়নের নাম প্রদান করা আবশ্যক।`);
        if (!owner.permanentAddress.thana.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): থানার নাম প্রদান করা আবশ্যক।`);
        if (!owner.permanentAddress.upazila.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): উপজেলার নাম প্রদান করা আবশ্যক।`);
        if (!owner.permanentAddress.district.trim()) errors.push(`${ownerLabel} (স্থায়ী ঠিকানা): জেলার নাম প্রদান করা আবশ্যক।`);
        
        // Present address
        if (!owner.presentAddress.villageOrMahalla.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): গ্রাম/মহল্লা/হোল্ডিং প্রদান করা আবশ্যক।`);
        if (!owner.presentAddress.wardNo.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): ওয়ার্ড নং প্রদান করা আবশ্যক।`);
        if (!owner.presentAddress.upOrPourashava.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): পৌরসভা/ইউনিয়নের নাম প্রদান করা আবশ্যক।`);
        if (!owner.presentAddress.thana.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): থানার নাম প্রদান করা আবশ্যক।`);
        if (!owner.presentAddress.upazila.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): উপজেলার নাম প্রদান করা আবশ্যক।`);
        if (!owner.presentAddress.district.trim()) errors.push(`${ownerLabel} (বর্তমান ঠিকানা): জেলার নাম প্রদান করা আবশ্যক।`);
      });
    }

    // ৩। ভূমির বিবরণ (তফসিল)
    if (!mouzaName.trim()) errors.push('মৌজার নাম প্রদান করা আবশ্যক।');
    if (!jlNo.trim()) errors.push('জে.এল. নং (J.L. No) প্রদান করা আবশ্যক।');
    if (!mutatedBsKhatianNo.trim()) errors.push('সৃজিত বি.এস খতিয়ান নং প্রদান করা আবশ্যক।');
    if (!landQuantity.trim()) errors.push('সম্পত্তির পরিমাণ উল্লেখ করা আবশ্যক।');
    if (!deedNoAndDate.trim()) errors.push('দলিল নং এবং তারিখ প্রদান করা আবশ্যক।');
    
    // ৪। প্রস্তাবিত সাইটের ঠিকানা
    if (!proposedSiteAddress.villageOrMahalla.trim()) errors.push('প্রস্তাবিত সাইটের গ্রাম/মহল্লা/সাইট এলাকা প্রদান করা আবশ্যক।');
    if (!proposedSiteAddress.wardNo.trim()) errors.push('প্রস্তাবিত সাইটের ওয়ার্ড নং প্রদান করা আবশ্যক।');
    if (!proposedSiteAddress.upOrPourashava.trim()) errors.push('প্রস্তাবিত সাইটের পৌরসভা/ইউনিয়নের নাম প্রদান করা আবশ্যক।');
    if (!proposedSiteAddress.thana.trim()) errors.push('প্রস্তাবিত সাইটের থানার নাম প্রদান করা আবশ্যক।');
    if (!proposedSiteAddress.upazila.trim()) errors.push('প্রস্তাবিত সাইটের উপজেলার নাম প্রদান করা আবশ্যক।');
    if (!proposedSiteAddress.district.trim()) errors.push('প্রস্তাবিত সাইটের জেলার নাম প্রদান করা আবশ্যক।');

    // ৫। প্রয়োজনীয় কাগজপত্র
    const missingRequiredAttachments = attachments.filter(att => att.required && !att.uploaded);
    if (missingRequiredAttachments.length > 0) {
      errors.push(`নিম্নোক্ত প্রয়োজনীয় কাগজপত্র আপলোড করতে হবে: ${missingRequiredAttachments.map(a => a.label).join(', ')}`);
    }

    // ৬। ঘোষণা ও নিবেদক
    if (!applicantName.trim()) errors.push('নিবেদকের নাম প্রদান করা আবশ্যক।');
    if (!applicantFatherOrHusbandName.trim()) errors.push('নিবেদকের পিতা/স্বামীর নাম প্রদান করা আবশ্যক।');
    if (!applicantMobile.trim()) errors.push('নিবেদকের মোবাইল নম্বর প্রদান করা আবশ্যক।');
    if (applicantMobile.trim() && !/^\d{11}$/.test(applicantMobile.trim())) {
      errors.push('১১ ডিজিটের সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 018XXXXXXXX)।');
    }
    if (!permanentAddress.villageOrMahalla.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার গ্রাম/মহল্লা/হোল্ডিং প্রদান করা আবশ্যক।');
    if (!permanentAddress.wardNo.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার ওয়ার্ড নং প্রদান করা আবশ্যক।');
    if (!permanentAddress.upOrPourashava.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার পৌরসভা/ইউনিয়নের নাম প্রদান করা আবশ্যক।');
    if (!permanentAddress.thana.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার থানার নাম প্রদান করা আবশ্যক।');
    if (!permanentAddress.upazila.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার উপজেলার নাম প্রদান করা আবশ্যক।');
    if (!permanentAddress.district.trim()) errors.push('নিবেদকের স্থায়ী ঠিকানার জেলার নাম প্রদান করা আবশ্যক।');

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    const payload: Partial<LandApplication> = {
      proposedStructureType,
      buildingFloors: proposedStructureType === 'Building' ? buildingFloors : undefined,
      buildingCategory,
      owners,
      mouzaName,
      jlNo,
      rsKhatianNo,
      rsDagNo,
      bsKhatianNo,
      bsDagNo,
      mutatedBsKhatianNo,
      landQuantity,
      landClass,
      deedNoAndDate,
      permanentAddress,
      presentAddress: permanentAddress,
      proposedSiteAddress,
      applicantName,
      applicantFatherOrHusbandName,
      applicantMobile,
      applicantEmail,
      applicationDate,
      attachments
    };

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('সার্ভারে তথ্য জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }

      const registeredApp: LandApplication = await response.json();
      try {
        localStorage.removeItem('sitakunda_demarcation_form_draft');
      } catch {}
      onSuccess(registeredApp);
    } catch (err: any) {
      setErrorText(err.message || 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {restoredNotification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-lg p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in no-print">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-950 font-bengali">
              <p className="font-bold text-emerald-950">খসড়া উদ্ধার করা হয়েছে!</p>
              <p className="text-xs text-emerald-900 opacity-90 mt-0.5">আপনার পূর্ববর্তী ফিলাপকৃত অগ্রগতি সফলভাবে রিলোড করা হয়েছে।</p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto font-bengali shrink-0">
            <button
              type="button"
              onClick={() => setRestoredNotification(false)}
              className="bg-transparent hover:bg-emerald-100/60 text-emerald-800 text-xs px-3 py-1.5 rounded transition-all cursor-pointer font-bold uppercase"
            >
              ঠিক আছে
            </button>
            <button
              type="button"
              onClick={handleClearDraft}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-1.5 rounded transition-all cursor-pointer font-bold uppercase tracking-wider flex items-center justify-center shadow-2xs border-b-2 border-rose-800"
            >
              <span>নতুন করে শুরু করুন (Reset)</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Instruction Bar */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 mb-6 shadow-xs flex items-start gap-3">
        <Info className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed font-bengali">
          <p className="font-semibold text-base mb-1 text-amber-950">জরুরী দৃষ্টিআকর্ষণ:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>আবেদন ফর্মটি সীতাকুণ্ড পৌরসভা কার্যালয় কর্তৃক নির্ধারিত সীমানা প্রাচীর/ভবন নির্মাণ সংক্রান্ত মালিকানা সঠিকতা যাচাইয়ের জন্য ব্যবহৃত হয়। ভূমির ডিমার্কেশন যাচাইয়ের পর ডিমার্কেশন প্রত্যয়নপত্র প্রাপ্তি সাপেক্ষে ইমারত নির্মাণ অনুমোদনের আবেদন করতে পারবেন।</li>
            <li>আবেদনপত্র অবশ্যই বাংলা ফন্টে ও বাংলা ভাষায় পূরণ করতে হবে।</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleFormSubmission} className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Official Form Header styled with Geometric Balance */}
        <div className="bg-emerald-800 text-white p-6 text-center border-b-4 border-orange-500 relative">
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3.5 py-1.5 rounded font-semibold uppercase tracking-wider shadow-sm">
            ফি: ১০০/- টাকা
          </div>
          <p className="text-xs text-slate-100 opacity-95 tracking-wider font-bengali">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
          <h2 className="text-2xl font-bold font-bengali uppercase tracking-tight mt-0.5">সীতাকুণ্ড পৌরসভা কার্যালয়</h2>
          <p className="text-xs text-slate-100 opacity-90 mt-0.5 tracking-wider font-bengali">সীতাকুণ্ড, চট্টগ্রাম</p>
          <div className="mt-4 inline-block bg-emerald-750 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border border-emerald-600/35">
            <h1 className="text-sm font-bold font-bengali text-emerald-50 tracking-wide">ভূমির ডিমার্কেশন যাচাইয়ের অনলাইন আবেদন ফরম</h1>
          </div>
        </div>

        {/* Validation Errors Box */}
        {(validationErrors.length > 0 || errorText) && (
          <div className="p-6 bg-rose-50 border-b border-rose-100 font-bengali">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-lg mb-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>আবেদন ফর্মে কিছু ত্রুটি পাওয়া গিয়েছে:</span>
            </div>
            {errorText && <p className="text-rose-700 text-sm font-medium mb-1 font-mono">{errorText}</p>}
            <ul className="list-disc ml-6 space-y-1 text-rose-700 text-sm">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Application details Body */}
        <div className="p-6 space-y-8 font-bengali">
          
          {/* Section 1: Proposed Construction & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <Building className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-800">১। প্রস্তাবিত নির্মাণ ও উদ্দেশ্য (Proposed Construction & Purpose)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  নির্মাণের ধরন <span className="text-red-500">*</span>
                </label>
                <select
                  value={proposedStructureType}
                  onChange={(e) => setProposedStructureType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all outline-none"
                >
                  <option value="Building">বহুতল ভবন (Building)</option>
                  <option value="Semi-pucka">আধাপাকা ঘর (Semi-pucka)</option>
                  <option value="Boundary Wall">সীমানা প্রাচীর (Boundary Wall)</option>
                </select>
              </div>

              {proposedStructureType === 'Building' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    তলার সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: ৫ তলা"
                    value={buildingFloors}
                    onChange={(e) => setBuildingFloors(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ভবন/স্থাপনার শ্রেণী <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBuildingCategory('Residential')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      buildingCategory === 'Residential'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-1001'
                    }`}
                  >
                    আবাসিক (Residential)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuildingCategory('Commercial')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      buildingCategory === 'Commercial'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-1001'
                    }`}
                  >
                    বাণিজ্যিক (Commercial)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>আবেদনপত্র বয়ান:</strong> বরাবর প্রসাশক, সীতাকুণ্ড পৌরসভা কার্যালয়। বিষয়: প্রস্তাবিত সম্পত্তির মালিকানা সম্পর্কিত সঠিকতা যাচাই প্রসঙ্গে। বিনীত প্রার্থনা এই যে, আমি/আমরা নিম্নবর্ণিত তফসিলভুক্ত সম্পত্তিতে <span className="font-semibold text-emerald-800 underline">
                {proposedStructureType === 'Boundary Wall' ? 'সীমানা প্রাচীর' : proposedStructureType === 'Semi-pucka' ? 'আধাপাকা ঘর' : `${buildingFloors} বিশিষ্ট ${buildingCategory === 'Residential' ? 'আবাসিক' : 'বাণিজ্যিক'} ভবন`}
              </span> নির্মাণ সম্পন্ন করার অনুমোদনকল্পে প্রস্তাবিত ভূমির সঠিকতা যাচাই সংক্রান্ত ডিমার্কেশনপত্র প্রদানের জন্য আবেদন করছি।
            </div>
          </div>

          {/* Section 2: Land Owner Information */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-800">২। ভূমির মালিকের তথ্য (Land Owner Information)</h3>
              </div>
              <button
                type="button"
                onClick={addOwner}
                className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>মালিক যোগ করুন ({owners.length}/১০০)</span>
              </button>
            </div>

            <div className="space-y-6">
              {owners.map((owner, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs relative transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                    <span className="font-bold text-emerald-950 text-sm bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      মালিক #{idx + 1}
                    </span>
                    {owners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOwner(idx)}
                        className="text-xs bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-350 text-rose-700 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>বাদ দিন</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        ভূমির মালিকের নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="উদা: আব্দুল করিম"
                        value={owner.name}
                        onChange={(e) => updateOwnerField(idx, 'name', e.target.value)}
                        className="w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        পিতা/স্বামীর নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="পিতা বা স্বামীর নাম"
                        value={owner.fatherOrHusbandName}
                        onChange={(e) => updateOwnerField(idx, 'fatherOrHusbandName', e.target.value)}
                        className="w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Owner Addresses Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Owner Permanent Address */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="font-bold text-slate-700 text-xs mb-3 border-b border-slate-100 pb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>ক) স্থায়ী ঠিকানা</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">গ্রাম/মহল্লা/হোল্ডিং <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.villageOrMahalla}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'villageOrMahalla', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">ওয়ার্ড নং <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.wardNo}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'wardNo', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">পৌরসভা/ইউনিয়ন <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.upOrPourashava}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'upOrPourashava', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">থানা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.thana}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'thana', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">উপজেলা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.upazila}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'upazila', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">জেলা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.permanentAddress.district}
                            onChange={(e) => updateOwnerAddressField(idx, 'permanentAddress', 'district', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Owner Present Address */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-1">
                        <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>খ) বর্তমান ঠিকানা</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => copyOwnerPermanentToPresent(idx)}
                          className="text-[10px] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          স্থায়ী ঠিকানার মতই করুন
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">গ্রাম/মহল্লা/হোল্ডিং <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.villageOrMahalla}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'villageOrMahalla', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">ওয়ার্ড নং <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.wardNo}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'wardNo', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">পৌরসভা/ইউনিয়ন <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.upOrPourashava}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'upOrPourashava', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">থানা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.thana}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'thana', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">উপজেলা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.upazila}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'upazila', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">জেলা <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={owner.presentAddress.district}
                            onChange={(e) => updateOwnerAddressField(idx, 'presentAddress', 'district', e.target.value)}
                            className="w-full bg-slate-50/50 rounded border border-slate-300 px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Land Details (তফসিল) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2.5 border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-800">৩। ভূমির বিবরণ (তফসিল) [Land Information / Schedule of Land]</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  মৌজার নাম <span className="text-red-500">*</span>
                </label>
                <select
                  value={mouzaName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMouzaName(val);
                    if (val && MOUZA_JL_MAPPING[val]) {
                      setJlNo(MOUZA_JL_MAPPING[val]);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">--- মৌজা নির্বাচন করুন ---</option>
                  {Object.keys(MOUZA_JL_MAPPING).map((mouza) => (
                    <option key={mouza} value={mouza}>{mouza}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  জে.এল. নং (J.L. No) <span className="text-red-500">*</span>
                </label>
                <select
                  value={jlNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJlNo(val);
                    const matchingMouza = Object.keys(MOUZA_JL_MAPPING).find(key => MOUZA_JL_MAPPING[key] === val);
                    if (matchingMouza) {
                      setMouzaName(matchingMouza);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">--- জে.এল. নং নির্বাচন করুন ---</option>
                  {Object.values(MOUZA_JL_MAPPING).map((jl) => (
                    <option key={jl} value={jl}>{jl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/70">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  আর.এস খতিয়ান নং <span className="text-xs text-emerald-800 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  placeholder="R.S Khatian"
                  value={rsKhatianNo}
                  onChange={(e) => setRsKhatianNo(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  আর.এস দাগ নং <span className="text-xs text-emerald-800 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  placeholder="R.S Dag No"
                  value={rsDagNo}
                  onChange={(e) => setRsDagNo(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  বি.এস খতিয়ান নং <span className="text-xs text-emerald-800 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  placeholder="B.S Khatian"
                  value={bsKhatianNo}
                  onChange={(e) => setBsKhatianNo(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  বি.এস দাগ নং <span className="text-xs text-emerald-800 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  placeholder="B.S Dag No"
                  value={bsDagNo}
                  onChange={(e) => setBsDagNo(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  সৃজিত বি.এস খতিয়ান নং <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ৪২২/খ"
                  value={mutatedBsKhatianNo}
                  onChange={(e) => setMutatedBsKhatianNo(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  সম্পত্তির পরিমাণ (শতক) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ৫.২৫"
                  value={landQuantity}
                  onChange={(e) => setLandQuantity(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  জমির শ্রেণী <span className="text-xs text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  placeholder="উদা: নাল, ভিটি"
                  value={landClass}
                  onChange={(e) => setLandClass(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  দলিল নং এবং তারিখ (রেজিস্ট্রিকৃত) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: দলিল নং ১২৩৪, তারিখ: ১২/০৫/২০২০"
                  value={deedNoAndDate}
                  onChange={(e) => setDeedNoAndDate(e.target.value)}
                  className="w-full bg-white rounded-lg border border-emerald-250 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Proposed Site Address */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-800">৪। প্রস্তাবিত নকশা/ইমারতের সাইটের ঠিকানা (Proposed Site Address)</h3>
              </div>
              <button
                type="button"
                onClick={copyAddressPermanentToProposed}
                className="text-xs bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded transition-colors"
              >
                আবেদনকারীর স্থায়ী ঠিকানা কপি করুন
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">গ্রাম/মহল্লা/সাইট এলাকা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.villageOrMahalla}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, villageOrMahalla: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">ওয়ার্ড নং <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.wardNo}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, wardNo: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">পৌরসভা/ইউনিয়নের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.upOrPourashava}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, upOrPourashava: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">থানার নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.thana}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, thana: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">উপজেলা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.upazila}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, upazila: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-900 mb-1">জেলা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={proposedSiteAddress.district}
                    onChange={(e) => setProposedSiteAddress({ ...proposedSiteAddress, district: e.target.value })}
                    className="w-full bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Document Uploads & Checklist */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2.5 border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <Upload className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-800">৫। প্রয়োজনীয় কাগজপত্র আপলোড ও ফটোকপি (PDF/JPG/PNG)</h3>
            </div>

            <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 mb-4">
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                * ভূমির সঠিকতা সম্পর্কিত চূড়ান্ত প্রত্যয়নপত্র পাওয়ার জন্য আপনার মূল খতিয়ান, দলিল ও পরিচয়পত্রের সুস্পষ্ট কপি স্ক্যান করে সংযুক্ত করুন। ফাইলে অতিরিক্ত কপি সংখ্যা নির্দেশ করতে পারেন। প্রতিটি ফাইলের সাইজ সর্বোচ্চ ২ মেগাবাইট (2 MB) হওয়া বাঞ্ছনীয়।
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-xs">
              {attachments.map((att, idx) => (
                <div key={att.id} className="p-4 sm:flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 mb-2 sm:mb-0">
                    <span className="bg-slate-100 text-slate-700 text-xs py-1 px-2.5 rounded-full mt-0.5 tracking-tight font-mono">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {att.label}
                      </span>
                      {att.required && (
                        <span className="ml-1.5 text-xs bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-100">
                          আবশ্যক *
                        </span>
                      )}
                      {att.uploaded ? (
                        <div className="flex items-center gap-1.5 mt-1 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>সংযুক্ত হয়েছে: {att.fileName} ({att.fileSize})</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">
                          ফাইল নির্বাচন করে আপলোড সম্পন্ন করুন
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mr-1">কপি:</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={att.copies || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setAttachments(prev => prev.map(a => a.id === att.id ? { ...a, copies: val } : a));
                        }}
                        className="w-10 text-xs text-center font-bold bg-transparent focus:outline-none"
                      />
                    </div>

                    <label className="cursor-pointer shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all ${
                        att.uploaded 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-450'
                      }`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{att.uploaded ? 'পরিবর্তন করুন' : 'ফাইল নির্বাচন'}</span>
                      </span>
                      <input
                        type="file"
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e) => handleFileUpload(att.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Applicant Signature Details */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2.5 border-l-4 border-emerald-700 pl-3 pb-1 mb-2">
              <User className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-800">৬। ঘোষণা (Declaration)</h3>
            </div>

            <div className="bg-red-50/40 p-4 rounded-xl border border-red-100/50 mb-4 text-xs text-rose-950 leading-relaxed font-bengali">
              <strong>ঘোষণাপত্র:</strong> আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত যাবতীয় তথ্য সম্পূর্ণ সত্য ও সঠিক। প্রস্তাবিত সম্পত্তিতে সীমানা বা মালিকানা সংক্রান্ত কোন প্রকার মোকদ্দমা বা আইনগত বিরোধ চলমান নাই। যদি পরবর্তীতে কোন ভুল তথ্য বা জালিয়াতি প্রমাণিত হয়, তবে আমার আবেদন বাতিলসহ যেকোনো ধরনের আইনগত শাস্তি মেনে নিতে বাধ্য থাকিব।
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  নিবেদকের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: আলহাজ্ব মো: জাফর উল্লাহ"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  পিতা/স্বামীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="নিবেদকের পিতা বা স্বামীর নাম"
                  value={applicantFatherOrHusbandName}
                  onChange={(e) => setApplicantFatherOrHusbandName(e.target.value)}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  মোবাইল নম্বর (SMS বিজ্ঞপ্তির জন্য) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="উদা: 01819654321"
                  value={applicantMobile}
                  onChange={(e) => setApplicantMobile(e.target.value)}
                  className="w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">আবেদন অনুমোদন প্রক্রিয়া চলাকালীন এই নম্বরে স্ট্যাটাস মেসেজ পাঠানো হবে।</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ইমেইল ঠিকানা (ইমেইল বিজ্ঞপ্তির জন্য) <span className="text-xs text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="email"
                  placeholder="উদা: zafar@example.com"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">আবেদনের অগ্রগতি বা অনুমোদনের কপি এই ইমেইলে স্বয়ংক্রিয়ভাবে পাঠানো হবে।</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  আবেদনের তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Applicant Permanent Address */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-700 text-sm">আবেদনকারীর স্থায়ী ঠিকানা</h4>
                <button
                  type="button"
                  onClick={copyFirstOwnerPermanentToApplicant}
                  className="text-xs bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded transition-colors"
                >
                  ১ম মালিকের স্থায়ী ঠিকানা কপি করুন
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">গ্রাম/মহল্লা/হোল্ডিং <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.villageOrMahalla}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, villageOrMahalla: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">ওয়ার্ড নং (পৌরসভা/ইউপি) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.wardNo}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, wardNo: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">পৌরসভা/ইউনিয়নের নাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.upOrPourashava}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, upOrPourashava: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">থানা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.thana}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, thana: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">উপজেলা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.upazila}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, upazila: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">জেলা <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={permanentAddress.district}
                    onChange={(e) => setPermanentAddress({ ...permanentAddress, district: e.target.value })}
                    className="w-full bg-white rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="bg-slate-50 px-6 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-850 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>সীতাকুণ্ড পৌর জোন কর্তৃক সুরক্ষিত সিক্যুর কানেকশন</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer font-bengali tracking-wide text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>আবেদন জমা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>অনলাইন আবেদন জমা দিন</span>
                <ChevronRight className="w-5 h-5 text-emerald-100" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
