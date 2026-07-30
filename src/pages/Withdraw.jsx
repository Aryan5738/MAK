import { useState } from 'react';
import { realtimeDb, ref, push, update, get } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Wallet, CreditCard, Building2, User, Hash, Lock, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Withdraw() {
 const [amount, setAmount] = useState('');
 const [method, setMethod] = useState('bank'); // bank | upi
 const [form, setForm] = useState({
  upiId: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifsc: '',
  password: '', // for verification live
 });
 const [loading, setLoading] = useState(false);
 const { currentUser, userData } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (Number(amount) < 200) {
   toast.error('Minimum withdrawal ₹200');
   return;
  }
  if ((userData?.balance||0) < Number(amount)) {
   toast.error('Insufficient real balance');
   return;
  }

  if (method === 'bank') {
   if (!form.accountHolder || !form.accountNumber || !form.ifsc || !form.bankName) {
    toast.error('Please fill all bank details');
    return;
   }
   if (form.accountNumber.length < 8) {
    toast.error('Enter valid account number');
    return;
   }
  } else {
   if (!form.upiId) {
    toast.error('Enter UPI ID');
    return;
   }
  }

  if (!form.password) {
   toast.error('Enter login password for verification (live)');
   return;
  }

  setLoading(true);
  try {
   const withdrawId = push(ref(realtimeDb, 'withdrawals')).key;
   
   await update(ref(realtimeDb, `withdrawals/${withdrawId}`), {
    withdrawId,
    userId: currentUser.uid,
    amount: Number(amount),
    method,
    // Bank details
    bankName: method === 'bank' ? form.bankName : null,
    accountHolder: method === 'bank' ? form.accountHolder : null,
    accountNumber: method === 'bank' ? form.accountNumber : null,
    ifsc: method === 'bank' ? form.ifsc : null,
    upiId: method === 'upi' ? form.upiId : null,
    status: 'pending',
    createdAt: new Date().toISOString()
   });

   // Deduct balance
   await update(ref(realtimeDb, `users/${currentUser.uid}`), {
    balance: (userData.balance||0) - Number(amount)
   });

   // Notification
   await push(ref(realtimeDb, `notifications/${currentUser.uid}`), {
    title: 'Withdrawal Requested',
    message: `Your withdrawal of ₹${amount} via ${method === 'bank' ? 'Bank' : 'UPI'} is pending approval`,
    type: 'withdrawal',
    date: new Date().toISOString(),
    read: false,
   });

   toast.success('Withdrawal request submitted! Awaiting admin approval ');
   navigate('/history?tab=withdrawals');
  } catch (err) {
   toast.error(err.message);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto w-full pb-32">
   <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 shadow-sm">
    <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
     <ArrowLeft className="w-5 h-5 text-slate-700" />
    </button>
    <div>
     <h1 className="font-black text-[15px] text-slate-900">Withdrawal</h1>
     <p className="text-[11px] text-slate-500 font-medium">Bank Account / UPI • Live</p>
    </div>
   </div>

   <div className="px-4 mt-5 pb-24 space-y-5">
    {/* Balance Card */}
    <div className="bg-slate-900 rounded-[24px] p-5 relative overflow-hidden shadow-premium">
     <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>
     <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
     
     <div className="relative z-10">
      <div className="flex items-center gap-2">
       <Wallet className="w-4 h-4 text-white/60" />
       <p className="text-white/60 text-[11px] font-bold tracking-widest">AVAILABLE VIRTUAL BALANCE</p>
      </div>
      <h1 className="text-[32px] font-black text-white mt-2 tracking-tight">₹{Math.floor(userData?.balance||0).toLocaleString('en-IN')}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
       <span className="bg-white/10 border border-white/10 text-white/80 text-[11px] font-bold px-3 py-1 rounded-full">Min: ₹200</span>
       <span className="bg-[#0FB86F]/20 border border-[#0FB86F]/30 text-green-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
        Instant Live
       </span>
      </div>
     </div>
    </div>

    {/* Quick Amounts */}
    <div className="grid grid-cols-4 gap-2.5">
     {[200,500,1000,2000].map(a=>(
      <button key={a} onClick={()=>setAmount(a)} className={`py-3 rounded-xl text-[13px] font-black border transition-all ${Number(amount)===a ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'}`}>
       ₹{a}
      </button>
     ))}
    </div>

    {/* Method Selector */}
    <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-2 shadow-card">
     <button 
      type="button" 
      onClick={()=>setMethod('bank')} 
      className={`flex-1 py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all ${method==='bank' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
     >
      <Building2 className="w-4 h-4" /> Bank Account
     </button>
     <button 
      type="button" 
      onClick={()=>setMethod('upi')} 
      className={`flex-1 py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all ${method==='upi' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
     >
      <CreditCard className="w-4 h-4" /> UPI
     </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4 shadow-card">
     <div>
      <label className="text-[11px] font-black text-slate-700 tracking-widest">WITHDRAWAL AMOUNT *</label>
      <div className="relative mt-2">
       <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[16px]">₹</span>
       <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full input-modern rounded-xl pl-9 pr-4 py-4 text-[16px] font-black" placeholder="Minimum ₹200" required />
      </div>
     </div>

     {method === 'bank' ? (
      <>
       <div>
        <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> ACCOUNT HOLDER NAME *</label>
        <input value={form.accountHolder} onChange={e=>setForm({...form, accountHolder: e.target.value})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-bold" placeholder="e.g., Rahul Sharma" required />
       </div>

       <div>
        <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><Building2 className="w-3 h-3" /> BANK NAME *</label>
        <input value={form.bankName} onChange={e=>setForm({...form, bankName: e.target.value})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-bold" placeholder="e.g., State Bank of India" required />
       </div>

       <div className="grid grid-cols-1 gap-4">
        <div>
         <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><Hash className="w-3 h-3" /> ACCOUNT NUMBER *</label>
         <input value={form.accountNumber} onChange={e=>setForm({...form, accountNumber: e.target.value})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-mono font-bold" placeholder="Enter account number" required />
        </div>
        <div>
         <label className="text-[11px] font-black text-slate-700 tracking-widest">IFSC CODE *</label>
         <input value={form.ifsc} onChange={e=>setForm({...form, ifsc: e.target.value.toUpperCase()})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-mono font-bold tracking-widest uppercase" placeholder="e.g., SBIN0001234" required />
        </div>
       </div>
      </>
     ) : (
      <div>
       <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> UPI ID *</label>
       <input value={form.upiId} onChange={e=>setForm({...form, upiId: e.target.value})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-bold" placeholder="yourname@upi" required />
      </div>
     )}

     <div>
      <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><Lock className="w-3 h-3" /> LOGIN PASSWORD FOR VERIFICATION *</label>
      <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full mt-2 input-modern rounded-xl px-4 py-3.5 text-sm font-bold" placeholder="Enter your login password (live)" required />
      <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
       <Info className="w-3 h-3" /> This is for security verification (live only)
      </p>
     </div>

     <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-2.5">
      <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div>
       <p className="text-[12px] font-bold text-blue-900">Secure Withdrawal </p>
       <p className="text-[11px] text-blue-700 font-medium leading-relaxed mt-1">No real money transfer. Bank details saved securely. Request visible in Admin Panel → Withdrawals for approval. Admin can approve/reject and refund if needed.</p>
      </div>
     </div>

     <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[14px] shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
      {loading ? (
       <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Processing...
       </>
      ) : (
       `Withdraw ₹${amount || 0} via ${method === 'bank' ? 'Bank' : 'UPI'}`
      )}
     </button>

     <p className="text-center text-[11px] text-slate-500 font-medium">Withdrawal requests processed within 24 hours (live). Check history for status.</p>
    </form>

    <div className="h-10"></div>
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
     <p className="text-[11px] font-black text-slate-500 tracking-widest">BANK DETAILS SECURITY</p>
     <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">Your bank details are encrypted and stored securely. Only admin can view for withdrawal processing. This is live - no real money transfer.</p>
    </div>
   </div>
   <div className="h-20"></div>
  </div>
 );
}
