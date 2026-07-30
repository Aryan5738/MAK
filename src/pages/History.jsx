import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, TrendingUp, Wallet, Gift, Award, Filter } from 'lucide-react';

export default function History() {
 const { currentUser } = useAuth();
 const [searchParams] = useSearchParams();
 const initialTab = searchParams.get('tab') || 'all';
 const [tab, setTab] = useState(initialTab);
 const [deposits, setDeposits] = useState([]);
 const [withdrawals, setWithdrawals] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const navigate = useNavigate();

 useEffect(() => {
  if (!currentUser) return;
  
  const depRef = ref(realtimeDb, 'deposits');
  const wdRef = ref(realtimeDb, 'withdrawals');
  const txRef = ref(realtimeDb, `transactions/${currentUser.uid}`);

  const unsubDep = onValue(depRef, (snap) => {
   if (snap.exists()) {
    const all = Object.entries(snap.val()).filter(([_, v]) => v.userId === currentUser.uid).map(([id, v]) => ({ id, ...v })).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    setDeposits(all);
   }
  });

  const unsubWd = onValue(wdRef, (snap) => {
   if (snap.exists()) {
    const all = Object.entries(snap.val()).filter(([_, v]) => v.userId === currentUser.uid).map(([id, v]) => ({ id, ...v })).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    setWithdrawals(all);
   }
  });

  const unsubTx = onValue(txRef, (snap) => {
   if (snap.exists()) {
    const all = Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })).sort((a,b)=> new Date(b.date)-new Date(a.date));
    setTransactions(all);
   }
  });

  return () => { unsubDep(); unsubWd(); unsubTx(); };
 }, [currentUser]);

 const tabs = [
  { id: 'all', label: 'All', count: deposits.length + withdrawals.length },
  { id: 'deposits', label: 'Deposits', count: deposits.length },
  { id: 'withdrawals', label: 'Withdrawals', count: withdrawals.length },
  { id: 'bonus', label: 'Bonus', count: transactions.filter(t=>['daily_income','referral','redeem','bonus'].includes(t.type)).length },
 ];

 const getStatusStyle = (status) => {
  switch(status) {
   case 'approved': return 'bg-green-50 text-green-700 border-green-200';
   case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
   case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
   default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
 };

 const getStatusIcon = (status) => {
  switch(status) {
   case 'approved': return <CheckCircle2 className="w-3.5 h-3.5" />;
   case 'pending': return <Clock className="w-3.5 h-3.5" />;
   case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
   default: return <Clock className="w-3.5 h-3.5" />;
  }
 };

 return (
  <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto pb-10">
   <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 shadow-sm">
    <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
     <ArrowLeft className="w-5 h-5 text-slate-700" />
    </button>
    <div className="flex-1">
     <h1 className="font-black text-[16px] text-slate-900">Transaction History</h1>
     <p className="text-[11px] text-slate-500 font-medium">Premium detailed history • All records</p>
    </div>
    <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center">
     <Filter className="w-4 h-4 text-white" />
    </div>
   </div>

   <div className="p-4">
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
     {tabs.map(t => (
      <button 
       key={t.id} 
       onClick={()=>setTab(t.id)} 
       className={`whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black border flex items-center gap-2 transition-all ${
        tab===t.id 
         ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm'
       }`}
      >
       {t.label}
       <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab===t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{t.count}</span>
      </button>
     ))}
    </div>

    <div className="mt-6 space-y-3">
     {/* Deposits List */}
     {(tab === 'all' || tab === 'deposits') && deposits.map(d => (
      <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all">
       <div className="flex justify-between items-start">
        <div className="flex gap-3">
         <div className="w-11 h-11 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-blue-600" />
         </div>
         <div>
          <p className="font-black text-[14px] text-slate-900">Deposit • ₹{d.amount.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">UTR: {d.utr} • {new Date(d.createdAt).toLocaleString()}</p>
         </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusStyle(d.status)}`}>
         {getStatusIcon(d.status)} {d.status.toUpperCase()}
        </span>
       </div>
       {d.status === 'pending' && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
         <Clock className="w-4 h-4 text-amber-600" />
         <p className="text-[11px] font-bold text-amber-800">Waiting for admin approval ( live)</p>
        </div>
       )}
      </div>
     ))}

     {/* Withdrawals List */}
     {(tab === 'all' || tab === 'withdrawals') && withdrawals.map(w => (
      <div key={w.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all">
       <div className="flex justify-between items-start">
        <div className="flex gap-3">
         <div className="w-11 h-11 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-red-600" />
         </div>
         <div>
          <p className="font-black text-[14px] text-slate-900">Withdrawal • ₹{w.amount.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">To: {w.upiId} • {new Date(w.createdAt).toLocaleString()}</p>
         </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusStyle(w.status)}`}>
         {getStatusIcon(w.status)} {w.status.toUpperCase()}
        </span>
       </div>
      </div>
     ))}

     {/* Bonus Transactions */}
     {(tab === 'all' || tab === 'bonus') && transactions.filter(t=>['daily_income','referral','redeem','bonus'].includes(t.type)).map(tx => (
      <div key={tx.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all">
       <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
         <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${
          tx.type === 'daily_income' ? 'bg-green-50 border-green-200' :
          tx.type === 'referral' ? 'bg-purple-50 border-purple-200' :
          tx.type === 'redeem' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
         }`}>
          {tx.type === 'daily_income' ? <TrendingUp className="w-5 h-5 text-green-600" /> :
           tx.type === 'referral' ? <Gift className="w-5 h-5 text-purple-600" /> :
           <Award className="w-5 h-5 text-amber-600" />}
         </div>
         <div>
          <p className="font-bold text-[13px] text-slate-900">{tx.desc}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(tx.date).toLocaleString()} • {tx.type.toUpperCase()}</p>
         </div>
        </div>
        <p className="font-black text-[14px] text-[#0A8B53]">+₹{tx.amount.toLocaleString('en-IN')}</p>
       </div>
      </div>
     ))}

     {/* Empty State */}
     {((tab === 'deposits' && deposits.length === 0) || (tab === 'withdrawals' && withdrawals.length === 0) || (tab === 'bonus' && transactions.filter(t=>['daily_income','referral','redeem','bonus'].includes(t.type)).length === 0) || (tab === 'all' && deposits.length===0 && withdrawals.length===0 && transactions.length===0)) && (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-card">
       <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
        <Clock className="w-7 h-7 text-slate-400" />
       </div>
       <p className="font-bold text-slate-700">No {tab} history</p>
       <p className="text-xs text-slate-500 mt-1">Your {tab} records will appear here</p>
      </div>
     )}
    </div>

    <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
     <h3 className="font-black text-[13px] text-slate-900 flex items-center gap-2">
      <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
       <Award className="w-3.5 h-3.5 text-white" />
      </div>
      Premium History Features
     </h3>
     <div className="mt-3 grid gap-2 text-[11px] font-medium">
      <div className="flex justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5">
       <span className="text-slate-600">Total Deposits</span>
       <span className="font-black text-slate-900">₹{deposits.filter(d=>d.status==='approved').reduce((s,d)=>s+d.amount,0).toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5">
       <span className="text-slate-600">Total Withdrawals</span>
       <span className="font-black text-slate-900">₹{withdrawals.filter(w=>w.status==='approved').reduce((s,w)=>s+w.amount,0).toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between bg-[#0FB86F]/10 border border-[#0FB86F]/20 rounded-xl p-2.5">
       <span className="text-[#0A8B53] font-bold">Total Bonus Earned</span>
       <span className="font-black text-[#0A8B53]">₹{transactions.filter(t=>['daily_income','referral','redeem','bonus'].includes(t.type)).reduce((s,t)=>s+t.amount,0).toLocaleString('en-IN')}</span>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
