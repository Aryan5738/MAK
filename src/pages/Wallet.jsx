import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { realtimeDb, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, History, Wallet2, TrendingUp, Plus } from 'lucide-react';

export default function Wallet() {
 const { currentUser, userData } = useAuth();
 const [tab, setTab] = useState('all');
 const [tx, setTx] = useState([]);
 const navigate = useNavigate();

 useEffect(() => {
  if (!currentUser) return;
  const txRef = ref(realtimeDb, `transactions/${currentUser.uid}`);
  const unsub = onValue(txRef, (snap) => {
   if (snap.exists()) {
    const all = Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })).sort((a,b)=> new Date(b.date) - new Date(a.date));
    setTx(all);
   }
  });
  return () => unsub();
 }, [currentUser]);

 const filtered = tab === 'all' ? tx : tx.filter(t => t.type === tab);

 return (
  <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto">
   <TopBar />

   <div className="px-4 mt-5">
    {/* Balance Card - Premium Green/White */}
    <div className="bg-slate-900 rounded-[28px] p-6 relative overflow-hidden shadow-premium">
     <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0FB86F]/20 to-[#00E58F]/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
     <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
     
     <div className="relative z-10">
      <div className="flex justify-between items-start">
       <div>
        <div className="flex items-center gap-2">
         <p className="text-white/60 text-[11px] font-bold tracking-[1.5px]">REAL WALLET BALANCE</p>
         <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-[32px] font-black text-white mt-1 tracking-tight">₹{Math.floor(userData?.balance||0).toLocaleString('en-IN')}</h1>
        <div className="flex items-center gap-2 mt-1">
         <span className="bg-[#0FB86F]/20 backdrop-blur-md text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#0FB86F]/30">
          REAL MONEY • LIVE
         </span>
         <span className="text-white/50 text-[11px] font-medium">• Verified</span>
        </div>
       </div>
       <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
        <Wallet2 className="w-6 h-6 text-white" strokeWidth={2} />
       </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-7">
       <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
        <p className="text-[10px] text-white/60 font-bold tracking-wide">EARNED</p>
        <p className="font-black text-[14px] text-white mt-1">₹{Math.floor(userData?.totalEarning||0).toLocaleString('en-IN')}</p>
       </div>
       <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
        <p className="text-[10px] text-white/60 font-bold tracking-wide">DEPOSITED</p>
        <p className="font-black text-[14px] text-white mt-1">₹{Math.floor(userData?.totalDeposit||0).toLocaleString('en-IN')}</p>
       </div>
       <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
        <p className="text-[10px] text-white/60 font-bold tracking-wide">WITHDRAWN</p>
        <p className="font-black text-[14px] text-white mt-1">₹{Math.floor(userData?.totalWithdraw||0).toLocaleString('en-IN')}</p>
       </div>
      </div>
     </div>
    </div>

    {/* Action Buttons - Modern Light */}
    <div className="grid grid-cols-2 gap-3 mt-4">
     <button onClick={()=>navigate('/deposit')} className="bg-white border border-slate-200 rounded-2xl py-5 flex flex-col items-center gap-3 shadow-card hover:shadow-card-hover hover:border-[#0FB86F]/30 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-[#0FB86F]/10 border border-[#0FB86F]/20 flex items-center justify-center group-hover:bg-[#0FB86F]/15 transition-colors">
       <ArrowDownLeft className="w-7 h-7 text-[#0FB86F]" strokeWidth={2.2} />
      </div>
      <div className="text-center">
       <span className="font-black text-[14px] text-slate-900 block">Deposit</span>
       <span className="text-[11px] text-slate-500 font-medium">Add Real Funds</span>
      </div>
      <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
       <Plus className="w-3 h-3" /> ADD FUNDS
      </div>
     </button>
     
     <button onClick={()=>navigate('/withdraw')} className="bg-white border border-slate-200 rounded-2xl py-5 flex flex-col items-center gap-3 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
       <ArrowUpRight className="w-7 h-7 text-slate-700" strokeWidth={2.2} />
      </div>
      <div className="text-center">
       <span className="font-black text-[14px] text-slate-900 block">Withdrawal</span>
       <span className="text-[11px] text-slate-500 font-medium">Instant Payout</span>
      </div>
      <div className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full">
       WITHDRAW
      </div>
     </button>
    </div>

    {/* Transactions Header */}
    <div className="mt-8 flex justify-between items-center">
     <h2 className="font-black text-[16px] text-slate-900 flex items-center gap-2.5">
      <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
       <History className="w-4 h-4 text-slate-700" />
      </div>
      Transaction History
     </h2>
     <span className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
      {tx.length} RECORDS
     </span>
    </div>

    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
     {[
      { id: 'all', label: 'All' },
      { id: 'daily_income', label: 'Income' },
      { id: 'referral', label: 'Referral' },
      { id: 'deposit', label: 'Deposits' },
     ].map(f=>(
      <button 
       key={f.id} 
       onClick={()=>setTab(f.id)} 
       className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${
        tab===f.id 
         ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
       }`}
      >
       {f.label}
      </button>
     ))}
    </div>

    <div className="mt-4 space-y-3">
     {filtered.map(t => (
      <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-card hover:shadow-card-hover transition-all">
       <div className="flex gap-3.5 items-center flex-1 min-w-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
         t.type==='daily_income' ? 'bg-green-50 border-green-200 text-green-700' : 
         t.type==='referral' ? 'bg-purple-50 border-purple-200 text-purple-700' : 
         'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
         {t.type==='daily_income' ? <TrendingUp className="w-5 h-5" /> : 
          t.type==='referral' ? <span className="font-bold text-sm">R</span> : 
          <Wallet2 className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-[13px] font-bold text-slate-900 truncate">{t.desc?.substring(0,36)}</p>
         <p className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(t.date).toLocaleString()}</p>
        </div>
       </div>
       <p className={`font-black text-[14px] ml-3 flex-shrink-0 ${t.amount < 0 ? 'text-red-600' : 'text-[#0A8B53]'}`}>
        {t.amount > 0 ? '+' : ''}₹{t.amount.toLocaleString('en-IN')}
       </p>
      </div>
     ))}
     
     {filtered.length===0 && (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-card">
       <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-full mx-auto flex items-center justify-center mb-3">
        <History className="w-6 h-6 text-slate-400" />
       </div>
       <p className="font-bold text-slate-700">No transactions yet</p>
       <p className="text-[12px] text-slate-500 mt-1">Start investing to see income history</p>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
