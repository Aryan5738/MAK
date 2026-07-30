import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import NextProfitTimer from '../components/NextProfitTimer';
import { Clock, TrendingUp, CheckCircle2, Wallet, ArrowUpRight, Timer } from 'lucide-react';

export default function MyInvestments() {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    if (!currentUser) return;
    const invRef = ref(realtimeDb, 'investments');
    const unsub = onValue(invRef, (snap) => {
      if (snap.exists()) {
        const all = snap.val();
        const mine = Object.entries(all).filter(([_, v]) => v.userId === currentUser.uid).map(([id, v]) => ({ id, ...v })).sort((a,b)=> new Date(b.startDate) - new Date(a.startDate));
        setInvestments(mine);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const filtered = investments.filter(inv => filter === 'all' ? true : inv.status === filter);
  const totalEarned = investments.reduce((s, i) => s + (i.earned||0), 0);
  const activeCount = investments.filter(i=>i.status==='active').length;
  const totalInvested = investments.filter(i=>i.status==='active').reduce((s,i)=>s+i.price, 0);
  const nextProfitTotal = investments.filter(i=>i.status==='active').reduce((s,i)=>s+i.dailyProfit, 0);

  return (
    <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto">
      <TopBar />

      <div className="px-4 mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black text-slate-900 tracking-tight">Active Plans</h1>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Real-time profit tracking</p>
          </div>
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <div className="w-8 h-8 bg-[#0FB86F]/10 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-[#0FB86F]" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest">ACTIVE</p>
            <p className="font-black text-[20px] text-slate-900 mt-1">{activeCount}</p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-4 shadow-premium text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-xl -mr-4 -mt-4"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] text-white/60 font-bold tracking-widest">EARNED</p>
              <p className="font-black text-[18px] mt-1">₹{Math.floor(totalEarned).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
              <Timer className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest">NEXT PROFIT</p>
            <p className="font-black text-[14px] text-amber-700 mt-1">₹{Math.floor(nextProfitTotal).toLocaleString('en-IN')}/day</p>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="mt-5">
            <NextProfitTimer lastCredited={new Date().toISOString()} dailyProfit={nextProfitTotal} />
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4 mt-6">
        {[
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All' },
        ].map(f=>(
          <button 
            key={f.id} 
            onClick={()=>setFilter(f.id)} 
            className={`px-5 py-2.5 rounded-full text-[12px] font-bold border transition-all ${
              filter===f.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-5 space-y-4">
        {filtered.map(inv => {
          const progress = Math.min(100, Math.round((inv.daysCompleted / inv.totalDays) * 100));
          const isCompleted = inv.status === 'completed';
          return (
            <div key={inv.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover transition-all">
              <div className="p-4 flex gap-4">
                <div className="relative">
                  <img src={inv.planImage} alt={inv.planTitle} className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${isCompleted ? 'bg-green-500 text-white' : 'bg-[#0FB86F] text-white'}`}>
                    {isCompleted ? '✓' : `${inv.daysCompleted}`}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-[14px] text-slate-900 leading-tight line-clamp-2">{inv.planTitle}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border flex-shrink-0 ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-[#0FB86F]/10 text-[#0A8B53] border-[#0FB86F]/20'}`}>
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-slate-50 rounded-xl py-2 px-2 text-center">
                      <p className="text-[9px] text-slate-500 font-bold tracking-wide">INVEST</p>
                      <p className="text-[12px] font-bold text-slate-900 mt-0.5">₹{inv.price}</p>
                    </div>
                    <div className="bg-[#0FB86F]/5 rounded-xl py-2 px-2 text-center border border-[#0FB86F]/10">
                      <p className="text-[9px] text-[#0FB86F] font-bold tracking-wide">DAILY</p>
                      <p className="text-[12px] font-bold text-[#0A8B53] mt-0.5">₹{inv.dailyProfit}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl py-2 px-2 text-center">
                      <p className="text-[9px] text-green-700 font-bold tracking-wide">EARNED</p>
                      <p className="text-[12px] font-bold text-green-700 mt-0.5">₹{Math.floor(inv.earned||0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-2.5 font-medium">
                    <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5" /> {inv.daysCompleted}/{inv.totalDays} Days Completed
                    </span>
                    <span className="font-black text-slate-900">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-1">
                    <div className="h-full bg-gradient-to-r from-[#0FB86F] to-[#00E58F] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-3 text-[11px] font-medium">
                    <span className="text-slate-500">₹{Math.floor(inv.earned||0).toLocaleString()} / ₹{inv.totalProfit.toLocaleString()}</span>
                    <span className="text-[#0FB86F] font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Auto Credit Daily
                    </span>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[11px] font-black tracking-widest text-slate-500">NEXT PROFIT REALTIME</p>
                      <NextProfitTimer lastCredited={inv.lastCredited} dailyProfit={inv.dailyProfit} small />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium">Next credit</p>
                        <p className="font-black text-[13px] text-slate-900">Tomorrow 00:00 • ₹{inv.dailyProfit}</p>
                      </div>
                      <div className="w-8 h-8 bg-[#0FB86F]/10 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#0FB86F]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length===0 && (
          <div className="text-center py-16 bg-white rounded-[20px] border border-slate-200 shadow-card">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full mx-auto flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-bold text-slate-700">No {filter} investments</p>
            <p className="text-[12px] text-slate-500 mt-1 max-w-[200px] mx-auto">Your purchased plans will appear here with live profit countdown</p>
            <button onClick={()=>window.location.href='/plans'} className="mt-4 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 mx-auto">
              Explore Plans <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
