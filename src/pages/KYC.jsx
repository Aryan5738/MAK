import { useState, useEffect } from 'react';
import { realtimeDb, ref, get, update, push, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function KYC() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [kycFields, setKycFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingKyc, setExistingKyc] = useState(null);

  useEffect(() => {
    const fieldsRef = ref(realtimeDb, 'settings/kycFields');
    const unsub = onValue(fieldsRef, snap => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Array.isArray(data) ? data : Object.values(data);
        setKycFields(list);
      } else {
        setKycFields([
          { id: 'fullName', label: 'Full Name as per Aadhar', type: 'text', required: true, placeholder: 'Enter full name' },
          { id: 'aadhar', label: 'Aadhar Number (12 digits)', type: 'number', required: true, placeholder: '123456789012' },
          { id: 'pan', label: 'PAN Number (10 chars)', type: 'text', required: false, placeholder: 'ABCDE1234F' },
          { id: 'aadharFrontUrl', label: 'Aadhar Front Image URL', type: 'image', required: false, placeholder: 'https://.../aadhar-front.jpg' },
          { id: 'panFrontUrl', label: 'PAN Front Image URL', type: 'image', required: false, placeholder: 'https://.../pan.jpg' },
        ]);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (userData?.kyc) {
      setExistingKyc(userData.kyc);
      // Populate formData with existing values
      const existingData = {};
      Object.entries(userData.kyc).forEach(([k,v]) => {
        if (!['status','submittedAt','approvedAt','rejectedAt','rejectReason','approvedBy'].includes(k)) {
          existingData[k] = v;
        }
      });
      setFormData(existingData);
      
      // If fullName not set but username exists
      if (!existingData.fullName && userData.username) {
        setFormData(prev => ({ ...prev, fullName: userData.username }));
      }
    } else if (userData?.username) {
      setFormData(prev => ({ ...prev, fullName: prev.fullName || userData.username }));
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    for (let field of kycFields) {
      if (field.required && !formData[field.id]) {
        toast.error(`${field.label} is required`);
        return;
      }
      if (field.id === 'aadhar' && formData[field.id] && formData[field.id].length !== 12) {
        toast.error('Aadhar must be 12 digits');
        return;
      }
      if (field.id === 'pan' && formData[field.id] && formData[field.id].length !== 10) {
        toast.error('PAN must be 10 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const kycData = {
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      await update(ref(realtimeDb, `users/${currentUser.uid}`), { kyc: kycData });

      await push(ref(realtimeDb, `notifications/${currentUser.uid}`), {
        title: 'KYC Submitted for Verification',
        message: 'Your KYC documents submitted. Admin will verify within 24 hours with dynamic fields check.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
      });

      toast.success('KYC submitted! Admin will verify your Aadhar, PAN and other documents.');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto flex flex-col pb-32">
      <div className="px-4 py-4 flex items-center gap-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-[15px]">KYC Verification • Dynamic Fields</h1>
          <p className="text-[11px] text-slate-500">Admin creates fields • Real verification</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black ${getStatusColor(existingKyc?.status || 'not_submitted')}`}>
          {existingKyc?.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : existingKyc?.status === 'pending' ? <Upload className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {(existingKyc?.status || 'NOT_SUBMITTED').replace('_',' ').toUpperCase()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <div className="bg-slate-900 rounded-[20px] p-5 text-white relative overflow-hidden shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-[14px]">KYC Required for Real Withdrawal</p>
                <p className="text-white/60 text-[11px] font-medium mt-0.5">Dynamic fields by admin • Aadhar, PAN, etc.</p>
              </div>
            </div>
            <div className="mt-4 bg-white/10 border border-white/10 rounded-xl p-3">
              <p className="text-[11px] text-white/80 font-medium leading-relaxed">Admin can create custom fields like Aadhar card, PAN card, selfie, bank proof, address. Fill all required fields for verification.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[14px]">KYC Form • {kycFields.length} Fields (Admin Created)</h3>
            <span className="bg-[#0FB86F]/10 text-[#0FB86F] border border-[#0FB86F]/20 text-[10px] font-black px-2 py-1 rounded-full">{kycFields.filter(f=>f.required).length} Required</span>
          </div>

          {kycFields.map(field => (
            <div key={field.id}>
              <label className="text-[11px] font-black tracking-widest text-slate-600 flex items-center gap-1.5">
                {field.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'image' ? (
                <div className="mt-2 space-y-2">
                  <input 
                    type="url"
                    value={formData[field.id] || ''} 
                    onChange={e=>setFormData({...formData, [field.id]: e.target.value})} 
                    className="w-full input-modern rounded-xl px-4 py-3.5 text-sm font-medium" 
                    placeholder={field.placeholder || 'https://... image URL'}
                    required={field.required}
                  />
                  {formData[field.id] && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={formData[field.id]} alt={field.label} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              ) : (
                <input 
                  type={field.type === 'number' ? 'text' : 'text'}
                  inputMode={field.type === 'number' ? 'numeric' : 'text'}
                  value={formData[field.id] || ''} 
                  onChange={e=>{
                    let val = e.target.value;
                    if (field.type === 'number') val = val.replace(/\D/g,'');
                    if (field.id === 'pan') val = val.toUpperCase();
                    setFormData({...formData, [field.id]: val});
                  }} 
                  className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-bold" 
                  placeholder={field.placeholder || field.label}
                  required={field.required}
                  maxLength={field.id === 'aadhar' ? 12 : field.id === 'pan' ? 10 : undefined}
                />
              )}
            </div>
          ))}

          {existingKyc?.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <Upload className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-amber-900">KYC Under Verification</p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">Admin is verifying your {kycFields.length} fields including Aadhar, PAN etc. Usually 2-4 hours.</p>
              </div>
            </div>
          )}

          {existingKyc?.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-green-900">KYC Verified!</p>
                <p className="text-[11px] text-green-700 font-medium mt-1">Your account fully verified for real withdrawals.</p>
              </div>
            </div>
          )}

          {existingKyc?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-[12px] font-bold text-red-900">KYC Rejected: {existingKyc.rejectReason || 'Documents not clear'}</p>
              <p className="text-[11px] text-red-700 font-medium mt-1">Please correct and resubmit all fields.</p>
            </div>
          )}

          <button disabled={loading || existingKyc?.status === 'approved'} type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[14px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</> : existingKyc?.status === 'pending' ? 'Update KYC Submission' : existingKyc?.status === 'approved' ? 'KYC Already Verified ✓' : `Submit KYC • ${kycFields.length} Fields`}
          </button>

          <p className="text-[10px] text-slate-500 text-center font-medium">All {kycFields.length} fields created by admin in Admin → KYC Management. Includes Aadhar, PAN, images etc.</p>
        </form>
      </div>
    </div>
  );
}
