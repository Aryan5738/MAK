import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerUser, realtimeDb, ref, set, get } from '../../firebase';
import { generateReferCode } from '../../utils/profitLogic';
import { User, Mail, Phone, Lock, Gift, ShieldCheck, Users } from 'lucide-react';

export default function Register() {
 const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirm: '', referCode: '' });
 const [loading, setLoading] = useState(false);
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const defaultRef = searchParams.get('ref') || '';

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.password !== form.confirm) return alert("Passwords do not match");
  if (form.password.length < 6) return alert("Password minimum 6 characters");
  if (!/^\d{10}$/.test(form.phone)) return alert("Enter valid 10 digit phone number");

  setLoading(true);
  try {
   const userCred = await registerUser(form.email, form.password);
   const uid = userCred.user.uid;
   const myCode = generateReferCode(form.username);

   await set(ref(realtimeDb, `users/${uid}`), {
    uid,
    username: form.username,
    email: form.email,
    phone: form.phone,
    balance: 100,
    totalEarning: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    referralEarning: 0,
    myReferCode: myCode,
    referredBy: form.referCode || defaultRef || null,
    createdAt: new Date().toISOString(),
    isBlocked: false
   });

   if (form.referCode || defaultRef) {
    const codeToSearch = form.referCode || defaultRef;
    const usersRef = ref(realtimeDb, 'users');
    const snap = await get(usersRef);
    if (snap.exists()) {
     const all = snap.val();
     const referrerEntry = Object.entries(all).find(([_, u]) => u.myReferCode === codeToSearch);
     if (referrerEntry) {
      const [refUid] = referrerEntry;
      const teamRef = ref(realtimeDb, `users/${refUid}/team/level1`);
      const { push } = await import('../../firebase');
      await push(teamRef, { uid, joinedAt: new Date().toISOString() });
     }
    }
   }

   alert("Registration Successful! ₹100 bonus added - Secure Platform");
   navigate('/');
  } catch (err) {
   alert(err.message);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center p-5 bg-[#F8FDF9] py-10">
   <div className="w-full max-w-[400px]">
    <div className="text-center mb-6">
     <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center shadow-premium mb-3">
      <Gift className="w-8 h-8 text-white" />
     </div>
     <h1 className="text-[24px] font-black text-slate-900 tracking-tight">Create Account</h1>
     <p className="text-[13px] text-slate-500 font-medium mt-1">Join CASIO Premium Live</p>
     {defaultRef && (
      <div className="mt-3 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 inline-flex items-center gap-2">
       <Users className="w-3.5 h-3.5 text-green-700" />
       <span className="text-[11px] font-bold text-green-800">Referred by: {defaultRef}</span>
      </div>
     )}
    </div>

    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-slate-200 rounded-[24px] p-6 shadow-card">
     <div className="relative">
      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium" placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
     </div>
     <div className="relative">
      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium" placeholder="Email Address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
     </div>
     <div className="relative">
      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium" placeholder="Phone Number (10 digits)" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required />
     </div>
     <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium" placeholder="Password (min 6)" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
     </div>
     <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input className="w-full input-modern rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium" placeholder="Confirm Password" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required />
     </div>
     <div className="relative">
      <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0FB86F]" />
      <input className="w-full bg-green-50/50 border border-[#0FB86F]/20 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium focus:border-[#0FB86F] focus:ring-4 focus:ring-[#0FB86F]/10 outline-none" placeholder={`Referral Code (Optional) ${defaultRef ? defaultRef : ''}`} value={form.referCode} onChange={e=>setForm({...form,referCode:e.target.value.toUpperCase()})} />
     </div>

     <button disabled={loading} className="w-full gradient-primary py-3.5 rounded-xl font-bold text-sm text-white shadow-premium disabled:opacity-50 flex items-center justify-center gap-2">
      {loading ? 'Creating Account...' : 'Register & Get ₹100 Bonus'}
     </button>

     <p className="text-center text-[13px] text-slate-600 font-medium pt-2">Already have account? <Link to="/login" className="text-[#0FB86F] font-bold hover:underline">Login Here</Link></p>
    </form>

    <p className="text-[10px] text-center text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
     <ShieldCheck className="w-3 h-3" /> Secure Investment Platform • Secure Real Transactions
    </p>
   </div>
  </div>
 );
}
