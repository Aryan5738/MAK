import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { realtimeDb, ref, get, push, update } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { distributeReferralCommission } from '../utils/profitLogic';
import { ArrowLeft, CheckCircle2, Clock, Wallet, TrendingUp, Shield, Zap, Gift, BarChart3, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanDetail() {
 const { id } = useParams();
 const [plan, setPlan] = useState(null);
 const [loading, setLoading] = useState(true);
 const [buying, setBuying] = useState(false);
 const { userData, currentUser } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
  const fetchPlan = async () => {
   const planRef = ref(realtimeDb, `plans/${id}`);
   const snap = await get(planRef);
   if (snap.exists()) setPlan({ id, ...snap.val() });
   else {
    const fallback = {
     '1': { title: 'Casio Starter Plan', price: 200, dailyProfit: 228.57, totalDays: 7, totalProfit: 1600, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=60', desc: 'Perfect for beginners to start earning income daily' },
     '2': { title: 'Casio Pro G-Shock Edition', price: 500, dailyProfit: 500, totalDays: 10, totalProfit: 5000, image: 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=600&auto=format&fit=crop&q=60', desc: 'Advanced plan with higher daily returns' },
    }[id];
    if (fallback) setPlan({ id, ...fallback });
   }
   setLoading(false);
  };
  fetchPlan();
 }, [id]);

 const handleBuy = async () => {
  if (!plan) return;
  if (!userData) return navigate('/login');
  if ((userData.balance||0) < plan.price) {
   toast.error(`Insufficient balance! Need ₹${plan.price}, you have ₹${Math.floor(userData.balance||0)}`);
   return navigate('/wallet');
  }
  if (!confirm(`Confirm investment: ${plan.title} for ₹${plan.price}?`)) return;

  setBuying(true);
  try {
   const investmentId = push(ref(realtimeDb, 'investments')).key;
   const now = new Date();
   const end = new Date();
   end.setDate(now.getDate() + plan.totalDays);

   await update(ref(realtimeDb, `investments/${investmentId}`), {
    investmentId,
    userId: currentUser.uid,
    planId: plan.id,
    planTitle: plan.title,
    planImage: plan.image,
    price: plan.price,
    dailyProfit: plan.dailyProfit,
    totalDays: plan.totalDays,
    totalProfit: plan.totalProfit,
    earned: 0,
    daysCompleted: 0,
    startDate: now.toISOString(),
    lastCredited: now.toISOString(),
    endDate: end.toISOString(),
    status: 'active'
   });

   await update(ref(realtimeDb, `users/${currentUser.uid}`), {
    balance: (userData.balance||0) - plan.price,
    totalInvested: (userData.totalInvested||0) + plan.price
   });

   await distributeReferralCommission(currentUser.uid, plan.price);
   
   const { push: pushNotif } = await import('../firebase');
   await pushNotif(ref(realtimeDb, `notifications/${currentUser.uid}`), {
    title: 'Investment Successful!',
    message: `You invested ₹${plan.price} in ${plan.title}. Daily profit ₹${plan.dailyProfit} will auto-credit.`,
    type: 'income',
    date: new Date().toISOString(),
    read: false,
   });

   toast.success(`Investment Successful! ₹${plan.price} plan activated`);
   navigate('/my-investments');
  } catch (e) {
   toast.error(e.message);
  } finally {
   setBuying(false);
  }
 };

 if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FDF9]"><div className="w-8 h-8 border-2 border-[#0FB86F] border-t-transparent rounded-full animate-spin"></div></div>;
 if (!plan) return <div className="min-h-screen flex items-center justify-center bg-[#F8FDF9]">Plan not found</div>;

 const roi = Math.round((plan.totalProfit / plan.price) * 100);
 const profit = plan.totalProfit - plan.price;

 return (
  <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto w-full flex flex-col">
   {/* Header Image with Premium Overlay */}
   <div className="relative h-[340px] bg-slate-900 flex-shrink-0">
    <img src={plan.image} className="w-full h-full object-cover" alt={plan.title} />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
    
    <button onClick={()=>navigate(-1)} className="absolute top-4 left-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
     <ArrowLeft className="w-5 h-5 text-slate-900" />
    </button>
    
    <div className="absolute top-4 right-4 flex gap-2">
     <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-[11px] font-black text-slate-900 tracking-wide">LIVE • {roi}% ROI</span>
     </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 p-5">
     <div className="flex items-center gap-2 mb-3">
      <span className="bg-[#0FB86F] text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
       <Zap className="w-3 h-3" fill="white" /> VERIFIED • SECURE
      </span>
      <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full">
       {plan.totalDays} DAYS
      </span>
     </div>
     <h1 className="text-[24px] font-black text-white leading-tight tracking-tight">{plan.title}</h1>
     <p className="text-[13px] text-white/80 mt-1.5 font-medium leading-relaxed max-w-[90%]">
      {plan.desc || `Invest ₹${plan.price} and earn ₹${plan.totalProfit} in ${plan.totalDays} days with daily auto-credit`}
     </p>
    </div>
   </div>

   {/* Content Scrollable */}
   <div className="flex-1 px-4 py-6 space-y-5 pb-32 overflow-y-auto">
    {/* Stats Premium with Gap & Divider */}
    <div className="grid grid-cols-3 gap-3">
     <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-card">
      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
       <Wallet className="w-4 h-4 text-slate-600" />
      </div>
      <p className="text-[10px] text-slate-500 font-black tracking-widest">INVEST</p>
      <p className="font-black text-[18px] text-slate-900 mt-1">₹{plan.price.toLocaleString('en-IN')}</p>
     </div>
     <div className="bg-[#0FB86F]/5 border border-[#0FB86F]/20 rounded-2xl p-4 text-center">
      <div className="w-8 h-8 bg-[#0FB86F]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
       <TrendingUp className="w-4 h-4 text-[#0FB86F]" />
      </div>
      <p className="text-[10px] text-[#0FB86F] font-black tracking-widest">DAILY</p>
      <p className="font-black text-[18px] text-[#0A8B53] mt-1">₹{Number(plan.dailyProfit).toFixed(0)}</p>
     </div>
     <div className="bg-slate-900 rounded-2xl p-4 text-center shadow-premium">
      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
       <Gift className="w-4 h-4 text-white" />
      </div>
      <p className="text-[10px] text-white/60 font-black tracking-widest">TOTAL</p>
      <p className="font-black text-[18px] text-white mt-1">₹{plan.totalProfit.toLocaleString('en-IN')}</p>
     </div>
    </div>

    {/* Divider */}
    <div className="flex items-center gap-3">
     <div className="h-px bg-slate-200 flex-1"></div>
     <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">DETAILS</span>
     <div className="h-px bg-slate-200 flex-1"></div>
    </div>

    {/* Breakdown Premium with Dividers */}
    <div className="bg-white border border-slate-200 rounded-[22px] shadow-card overflow-hidden">
     <div className="p-5 border-b border-slate-100">
      <h3 className="font-black text-[14px] text-slate-900 flex items-center gap-2.5">
       <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
        <BarChart3 className="w-4 h-4 text-white" />
       </div>
       Investment Breakdown
       <span className="ml-auto bg-[#0FB86F]/10 text-[#0FB86F] border border-[#0FB86F]/20 text-[10px] font-black px-2.5 py-1 rounded-full">{roi}% ROI</span>
      </h3>
     </div>
     
     <div className="p-5 space-y-0">
      {[
       { label: 'Investment Amount', value: `₹${plan.price.toLocaleString('en-IN')}`, icon: Wallet },
       { label: 'Daily Income', value: `₹${plan.dailyProfit} / day`, highlight: true, icon: TrendingUp },
       { label: 'Duration', value: `${plan.totalDays} Days`, icon: Clock },
       { label: 'Total Return', value: `₹${plan.totalProfit.toLocaleString('en-IN')}`, green: true, icon: Gift },
       { label: 'Net Profit', value: `₹${profit.toLocaleString('en-IN')}`, green: true, bold: true, icon: BarChart3 },
      ].map((row, i, arr) => (
       <div key={i}>
        <div className="flex justify-between items-center py-3.5">
         <span className="text-[13px] text-slate-600 font-medium flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.green ? 'bg-green-50 border border-green-200' : row.highlight ? 'bg-[#0FB86F]/10 border border-[#0FB86F]/20' : 'bg-slate-50 border border-slate-200'}`}>
           <row.icon className={`w-3.5 h-3.5 ${row.green ? 'text-green-600' : row.highlight ? 'text-[#0FB86F]' : 'text-slate-500'}`} />
          </div>
          {row.label}
         </span>
         <span className={`font-black text-[13px] ${row.green ? 'text-[#0FB86F]' : row.highlight ? 'text-[#0A8B53]' : 'text-slate-900'} ${row.bold ? 'text-[15px]' : ''}`}>{row.value}</span>
        </div>
        {i < arr.length - 1 && <div className="h-px bg-slate-100 ml-10"></div>}
       </div>
      ))}
     </div>

     <div className="bg-slate-50 border-t border-slate-100 p-4">
      <div className="flex justify-between items-center">
       <span className="text-[12px] text-slate-500 font-bold tracking-wide">PAYOUT MODE</span>
       <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        Instant Auto Credit Daily
       </span>
      </div>
     </div>
    </div>

    {/* Gap Divider */}
    <div className="flex items-center gap-3">
     <div className="h-px bg-slate-200 flex-1"></div>
     <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> HOW IT WORKS</span>
     <div className="h-px bg-slate-200 flex-1"></div>
    </div>

    <div className="bg-white border border-slate-200 rounded-[22px] p-5 shadow-card">
     <div className="grid grid-cols-1 gap-4">
      {[
       { title: 'Invest Instantly', desc: 'Purchase plan using real wallet balance', icon: Wallet },
       { title: 'Daily Auto Credit', desc: 'Profit auto-credits every 24 hours to wallet', icon: Clock },
       { title: 'Live Tracking', desc: 'Track progress with visual progress bar', icon: BarChart3 },
       { title: 'Refer Bonus', desc: 'Invite friends and earn 20% instant commission', icon: Gift },
      ].map((item, i) => (
       <div key={i} className="flex gap-3.5 group">
        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0 group-hover:bg-[#0FB86F] transition-colors">
         {i+1}
        </div>
        <div className="flex-1">
         <p className="font-black text-[13px] text-slate-900 flex items-center gap-2">
          <item.icon className="w-4 h-4 text-slate-500" />
          {item.title}
         </p>
         <p className="text-[12px] text-slate-600 font-medium leading-relaxed mt-1">{item.desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
       </div>
      ))}
     </div>
    </div>

    {/* Balance Check Premium */}
    <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center justify-between shadow-card">
     <div className="flex items-center gap-3">
      <div className="w-11 h-11 bg-[#0FB86F]/10 border border-[#0FB86F]/20 rounded-xl flex items-center justify-center">
       <Wallet className="w-5 h-5 text-[#0FB86F]" />
      </div>
      <div>
       <p className="text-[11px] text-slate-500 font-black tracking-wide">YOUR VIRTUAL BALANCE</p>
       <p className="font-black text-[16px] text-slate-900">₹{Math.floor(userData?.balance||0).toLocaleString('en-IN')}</p>
      </div>
     </div>
     <div className={`px-3.5 py-2 rounded-full text-[11px] font-black border flex items-center gap-1.5 ${
      (userData?.balance||0) >= plan.price 
       ? 'bg-green-50 text-green-700 border-green-200' 
       : 'bg-red-50 text-red-700 border-red-200'
     }`}>
      <div className={`w-2 h-2 rounded-full ${(userData?.balance||0) >= plan.price ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
      {(userData?.balance||0) >= plan.price ? 'Sufficient' : 'Low Balance'}
     </div>
    </div>

    {/* Bottom Spacer for fixed button */}
    <div className="h-6"></div>
   </div>

   {/* Fixed Bottom Action - Premium with Safe Gap */}
   <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] z-40">
    <div className="w-full max-w-[480px] flex gap-3">
     <button onClick={()=>navigate('/wallet')} className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-xl font-black text-[14px] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
      <Wallet className="w-4 h-4" />
      Deposit
     </button>
     <button onClick={handleBuy} disabled={buying} className="flex-[1.8] bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group">
      {buying ? (
       <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Processing...
       </>
      ) : (
       <>
        <TrendingUp className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        Buy Now • ₹{plan.price.toLocaleString('en-IN')}
       </>
      )}
     </button>
    </div>
   </div>
  </div>
 );
}
