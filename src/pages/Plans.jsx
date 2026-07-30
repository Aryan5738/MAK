import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import PlanCard from '../components/PlanCard';
import { realtimeDb, ref, onValue } from '../firebase';
import { Search, Filter, Sparkles } from 'lucide-react';

export default function Plans() {
 const [plans, setPlans] = useState([]);
 const [filter, setFilter] = useState('all');

 useEffect(() => {
  const plansRef = ref(realtimeDb, 'plans');
  const unsub = onValue(plansRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    setPlans(Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(p=>p.isActive!==false));
   } else {
    setPlans([
     { id: '1', title: 'Casio Starter Plan', price: 200, dailyProfit: 228.57, totalDays: 7, totalProfit: 1600, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=60' },
     { id: '2', title: 'Casio Pro G-Shock Edition', price: 500, dailyProfit: 500, totalDays: 10, totalProfit: 5000, image: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&auto=format&fit=crop&q=60' },
     { id: '3', title: 'Casio Elite Premium Collection', price: 1000, dailyProfit: 800, totalDays: 15, totalProfit: 12000, image: 'https://images.unsplash.com/photo-1545579069-a9400d74544e?w=600&auto=format&fit=crop&q=60' },
     { id: '4', title: 'Casio Diamond Exclusive', price: 2000, dailyProfit: 1000, totalDays: 20, totalProfit: 20000, image: 'https://images.unsplash.com/photo-1548169674-3a2b96bb6637?w=600&auto=format&fit=crop&q=60' },
    ]);
   }
  });
  return () => unsub();
 }, []);

 const filtered = filter === 'all' ? plans : plans.filter(p => filter === 'low' ? p.price < 500 : filter === 'mid' ? p.price < 1500 : p.price >= 1500);

 return (
  <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto">
   <TopBar />
   
   <div className="px-4 mt-5">
    <div className="flex items-center gap-3">
     <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
      <Sparkles className="w-5 h-5 text-white" />
     </div>
     <div>
      <h1 className="text-[20px] font-black text-slate-900 tracking-tight">Investment Plans</h1>
      <p className="text-[12px] text-slate-500 font-medium">Choose your premium growth plan</p>
     </div>
    </div>

    {/* Filter Pills - Light Modern */}
    <div className="flex gap-2 mt-5 overflow-x-auto scrollbar-hide pb-1">
     {[
      { id: 'all', label: 'All Plans', icon: Filter },
      { id: 'low', label: 'Starter <₹500', icon: null },
      { id: 'mid', label: 'Growth ₹500-1500', icon: null },
      { id: 'high', label: 'Elite ₹1500+', icon: null },
     ].map(f => (
      <button 
       key={f.id} 
       onClick={()=>setFilter(f.id)} 
       className={`whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-bold border flex items-center gap-1.5 transition-all ${
        filter===f.id 
         ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm'
       }`}
      >
       {f.icon && <f.icon className="w-3.5 h-3.5" />}
       {f.label}
      </button>
     ))}
    </div>

    <div className="mt-6 space-y-4">
     {filtered.map(p => <PlanCard key={p.id} plan={p} />)}
     {filtered.length===0 && (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-4">
       <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Search className="w-6 h-6 text-slate-400" />
       </div>
       <p className="font-bold text-slate-700">No plans found</p>
       <p className="text-xs text-slate-500 mt-1">Try different filter</p>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
