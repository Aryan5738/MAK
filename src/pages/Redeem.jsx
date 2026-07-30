import { useState } from 'react';
import { realtimeDb, ref, get, push, update } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, CheckCircle2, Ticket, Sparkles, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function Redeem() {
 const [code, setCode] = useState('');
 const [loading, setLoading] = useState(false);
 const { currentUser, userData } = useAuth();
 const navigate = useNavigate();

 const handleRedeem = async (e) => {
  e.preventDefault();
  if (!code || code.length < 4) {
   toast.error('Enter valid redeem code');
   return;
  }
  setLoading(true);
  try {
   const codesRef = ref(realtimeDb, 'redeemCodes');
   const snap = await get(codesRef);
   if (!snap.exists()) {
    toast.error('Invalid redeem code');
    setLoading(false);
    return;
   }

   const allCodes = snap.val();
   const foundEntry = Object.entries(allCodes).find(([_, c]) => c.code.toUpperCase() === code.toUpperCase() && c.isActive !== false);

   if (!foundEntry) {
    toast.error('Invalid or expired code');
    setLoading(false);
    return;
   }

   const [codeId, codeData] = foundEntry;

   // Check max uses
   if (codeData.maxUses && (codeData.usedCount || 0) >= codeData.maxUses) {
    toast.error('This code has reached max usage limit');
    setLoading(false);
    return;
   }

   // Check if user already used this code (if single use per user)
   const userRedeemedRef = ref(realtimeDb, `users/${currentUser.uid}/redeemedCodes`);
   const redeemedSnap = await get(userRedeemedRef);
   if (redeemedSnap.exists()) {
    const redeemed = Object.values(redeemedSnap.val());
    if (redeemed.includes(codeId) || redeemed.includes(codeData.code)) {
     toast.error('You have already redeemed this code');
     setLoading(false);
     return;
    }
   }

   // Add balance
   await update(ref(realtimeDb, `users/${currentUser.uid}`), {
    balance: (userData.balance || 0) + Number(codeData.amount),
    totalEarning: (userData.totalEarning || 0) + Number(codeData.amount),
   });

   // Increment used count
   await update(ref(realtimeDb, `redeemCodes/${codeId}`), {
    usedCount: (codeData.usedCount || 0) + 1,
   });

   // Save to user's redeemed list
   await push(userRedeemedRef, codeData.code);

   // Transaction log
   await push(ref(realtimeDb, `transactions/${currentUser.uid}`), {
    type: 'redeem',
    amount: Number(codeData.amount),
    date: new Date().toISOString(),
    desc: `Gift code redeemed: ${codeData.code} - ₹${codeData.amount}`,
   });

   // Notification
   await push(ref(realtimeDb, `notifications/${currentUser.uid}`), {
    title: 'Gift Code Redeemed!',
    message: `You received ₹${codeData.amount} from code ${codeData.code}`,
    type: 'bonus',
    date: new Date().toISOString(),
    read: false,
   });

   toast.success(`Success! ₹${codeData.amount} added to wallet `);
   setCode('');
   setTimeout(() => navigate('/wallet'), 1500);
  } catch (err) {
   toast.error(err.message);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto pb-10">
   <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 shadow-sm">
    <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
     <ArrowLeft className="w-5 h-5 text-slate-700" />
    </button>
    <div>
     <h1 className="font-black text-[15px] text-slate-900 flex items-center gap-2">
      <Ticket className="w-4 h-4 text-[#0FB86F]" /> Redeem Gift Code
     </h1>
     <p className="text-[11px] text-slate-500 font-medium">Enter code from admin • Instant bonus</p>
    </div>
   </div>

   <div className="p-4 space-y-6">
    {/* Gift Card Visual */}
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[28px] p-6 relative overflow-hidden shadow-premium text-white">
     <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#0FB86F]/30 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
     <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>

     <div className="relative z-10">
      <div className="flex justify-between items-start">
       <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
         <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
         <p className="text-white/60 text-[10px] font-bold tracking-widest">GIFT CARD</p>
         <p className="font-black text-[14px] tracking-wide">PREMIUM REDEEM</p>
        </div>
       </div>
       <Sparkles className="w-5 h-5 text-white/60" />
      </div>

      <div className="mt-8">
       <p className="text-white/60 text-[11px] font-bold tracking-widest">REDEEMABLE BALANCE CODE</p>
       <div className="mt-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex justify-between items-center">
        <span className="font-mono text-[16px] font-black tracking-widest">**** **** ****</span>
        <Award className="w-5 h-5 text-[#00E58F]" />
       </div>
       <p className="text-white/50 text-[11px] font-medium mt-3">Codes are created by admin in Admin Panel → Redeem Codes</p>
      </div>
     </div>
    </div>

    {/* Redeem Form */}
    <form onSubmit={handleRedeem} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-card space-y-4">
     <div>
      <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-2">
       <Ticket className="w-3.5 h-3.5 text-[#0FB86F]" /> ENTER REDEEM CODE
      </label>
      <div className="relative mt-3">
       <input 
        value={code} 
        onChange={e=>setCode(e.target.value.toUpperCase())} 
        className="w-full input-modern rounded-xl px-4 py-4 text-[16px] font-black tracking-[2px] uppercase placeholder:tracking-normal placeholder:font-medium" 
        placeholder="e.g., CASIO100" 
        required 
       />
       <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
        <Gift className="w-4 h-4 text-white" />
       </div>
      </div>
      <p className="text-[11px] text-slate-500 font-medium mt-2">Enter gift code given by admin or promotional codes</p>
     </div>

     <button disabled={loading} className="w-full gradient-primary py-4 rounded-xl font-black text-[14px] text-white shadow-premium disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-105 transition-all">
      {loading ? (
       <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Verifying Code...
       </>
      ) : (
       <>
        <CheckCircle2 className="w-5 h-5" />
        Redeem Now • Get Bonus
       </>
      )}
     </button>

     <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
      <p className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
       <Sparkles className="w-4 h-4 text-amber-500" /> How to get redeem codes?
      </p>
      <ul className="text-[11px] text-slate-600 font-medium mt-2 space-y-1.5 list-disc list-inside leading-relaxed">
       <li>Admin creates codes in Admin Panel → Redeem Codes section</li>
       <li>Each code gives real bonus balance (live)</li>
       <li>One code can be limited to single use or multiple uses</li>
       <li>Codes can be shared during promotions or festivals</li>
      </ul>
     </div>
    </form>

    <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
     <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl"></div>
     <p className="text-[12px] font-black flex items-center gap-2 relative z-10">
      <Award className="w-4 h-4 text-[#00E58F]" /> Premium Security
     </p>
     <p className="text-[11px] text-white/60 font-medium mt-1.5 leading-relaxed relative z-10">Each code can only be redeemed once per user. Admin can set max uses and expiry. Bonus instantly adds to real wallet.</p>
    </div>
    <div className="h-20"></div>
   </div>
  </div>
 );
}
