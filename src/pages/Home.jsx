import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import ImageSlider from '../components/ImageSlider';
import PlanCard from '../components/PlanCard';
import { realtimeDb, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Gift, TrendingUp, Users2, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
 const [plans, setPlans] = useState([]);
 const { profitCredited, userData } = useAuth();

 useEffect(() => {
  const plansRef = ref(realtimeDb, 'plans');
  const unsub = onValue(plansRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    const list = Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(p=>p.isActive!==false);
    setPlans(list);
   } else {
    setPlans([
     { id: '1', title: 'Casio Starter Plan', price: 200, dailyProfit: 228.57, totalDays: 7, totalProfit: 1600, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=60', isActive: true },
     { id: '2', title: 'Casio Pro G-Shock Edition', price: 500, dailyProfit: 500, totalDays: 10, totalProfit: 5000, image: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&auto=format&fit=crop&q=60', isActive: true },
     { id: '3', title: 'Casio Elite Premium Collection', price: 1000, dailyProfit: 800, totalDays: 15, totalProfit: 12000, image: 'https://images.unsplash.com/photo-1545579069-a9400d74544e?w=600&auto=format&fit=crop&q=60', isActive: true },
    ]);
   }
  });
  return () => unsub();
 }, []);

 return (
  <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto">
   <TopBar />

   {profitCredited && (
    <div className="mx-4 mt-4 bg-gradient-to-r from-[#0FB86F] to-[#00E58F] rounded-2xl p-4 flex items-center gap-3 shadow-premium animate-slide-up">
     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
      <Gift className="w-5 h-5 text-white" strokeWidth={2.5} />
     </div>
     <div className="flex-1">
      <p className="font-bold text-sm text-white">Daily Profit Credited Successfully</p>
      <p className="text-xs text-white/90 font-medium">₹{profitCredited.toFixed(2)} added to your wallet</p>
     </div>
     <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
      <span className="text-[#0FB86F] font-bold text-sm">✓</span>
     </div>
    </div>
   )}

   <ImageSlider />

   {/* Stats - Light Premium Cards */}
   <div className="grid grid-cols-3 gap-3 px-4 mt-5">
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-card hover:shadow-card-hover transition-all group">
     <div className="w-8 h-8 bg-[#0FB86F]/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#0FB86F]/15 transition-colors">
      <Zap className="w-4 h-4 text-[#0FB86F]" strokeWidth={2.5} />
     </div>
     <p className="text-[10px] text-slate-500 font-bold tracking-widest">BALANCE</p>
     <p className="font-black text-[14px] text-slate-900 mt-1">₹{Math.floor(userData?.balance||0).toLocaleString('en-IN')}</p>
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-card hover:shadow-card-hover transition-all group">
     <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-500/15 transition-colors">
      <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
     </div>
     <p className="text-[10px] text-slate-500 font-bold tracking-widest">EARNINGS</p>
     <p className="font-black text-[14px] text-slate-900 mt-1">₹{Math.floor(userData?.totalEarning||0).toLocaleString('en-IN')}</p>
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-card hover:shadow-card-hover transition-all group">
     <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-500/15 transition-colors">
      <Users2 className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
     </div>
     <p className="text-[10px] text-slate-500 font-bold tracking-widest">REFER</p>
     <p className="font-black text-[14px] text-slate-900 mt-1">₹{Math.floor(userData?.referralEarning||0).toLocaleString('en-IN')}</p>
    </div>
   </div>

   {/* Section Header - Modern */}
   <div className="px-4 mt-7 flex justify-between items-center">
    <div className="flex items-center gap-2.5">
     <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
      <Sparkles className="w-4 h-4 text-white" />
     </div>
     <div>
      <h2 className="font-black text-[16px] text-slate-900 tracking-tight">Premium Plans</h2>
      <p className="text-[11px] text-slate-500 font-medium -mt-1">Verified & Secure Returns</p>
     </div>
    </div>
    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
     <span className="text-[11px] font-bold text-slate-700">{plans.length} LIVE</span>
    </div>
   </div>

   <div className="px-4 mt-4 space-y-4">
    {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
   </div>

   {/* Trust Banner Real */}
   <div className="mx-4 mt-7 bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
    <div className="flex gap-3">
     <div className="w-9 h-9 bg-green-50 border border-green-200 rounded-full flex items-center justify-center flex-shrink-0">
      <ShieldCheck className="w-5 h-5 text-green-600" />
     </div>
     <div>
      <p className="text-[12px] font-bold text-slate-900">100% Secure & Verified • Real Payments</p>
      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">Real money transactions with bank-grade encryption. UPI & Bank withdrawals securely processed. 24/7 support available.</p>
     </div>
    </div>
   </div>
  </div>
 );
}
