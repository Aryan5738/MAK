import { Clock, TrendingUp, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlanCard({ plan }) {
 const navigate = useNavigate();
 const roi = Math.round((plan.totalProfit / plan.price) * 100);

 return (
  <div className="premium-card rounded-[20px] overflow-hidden group hover:shadow-card-hover">
   {/* Image Section - Modern */}
   <div className="relative h-[148px] overflow-hidden bg-slate-100">
    <img 
     src={plan.image} 
     alt={plan.title} 
     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
    
    {/* Top Badges */}
    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
     <div className="flex gap-2">
      <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
       <Zap className="w-3 h-3 text-amber-500" fill="#f59e0b" />
       <span className="text-[10px] font-bold text-slate-900 tracking-wide">{roi}% ROI</span>
      </div>
      <div className="bg-[#0FB86F] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
       <Shield className="w-3 h-3 text-white" />
       <span className="text-[10px] font-bold text-white tracking-wide">VERIFIED</span>
      </div>
     </div>
     <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
      <Clock className="w-3 h-3 text-white" />
      <span className="text-[10px] font-bold text-white">{plan.totalDays} DAYS</span>
     </div>
    </div>

    {/* Bottom Info */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
     <div className="flex justify-between items-end">
      <div className="flex-1 mr-3">
       <h3 className="font-bold text-[15px] leading-tight text-white drop-shadow-sm line-clamp-2">{plan.title}</h3>
       <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-[11px] text-white/80 font-medium">Active Investors: 2.4k+</span>
       </div>
      </div>
      <div className="text-right bg-white rounded-xl px-3 py-2 shadow-lg">
       <p className="text-[9px] text-slate-500 font-bold tracking-widest">TOTAL PROFIT</p>
       <p className="font-black text-[16px] text-[#0FB86F] leading-none mt-0.5">₹{plan.totalProfit.toLocaleString('en-IN')}</p>
      </div>
     </div>
    </div>
   </div>

   {/* Details Section - Light Premium */}
   <div className="p-4 bg-white">
    {/* Metrics Grid */}
    <div className="grid grid-cols-3 gap-2.5">
     <div className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-2 text-center">
      <p className="text-[10px] text-slate-500 font-semibold tracking-wide">INVEST</p>
      <p className="font-bold text-[14px] text-slate-900 mt-0.5">₹{plan.price.toLocaleString('en-IN')}</p>
     </div>
     <div className="bg-[#0FB86F]/5 border border-[#0FB86F]/15 rounded-xl py-2.5 px-2 text-center">
      <p className="text-[10px] text-[#0FB86F] font-bold tracking-wide">DAILY</p>
      <p className="font-bold text-[14px] text-[#0A8B53] mt-0.5">₹{plan.dailyProfit?.toFixed(0)}</p>
     </div>
     <div className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-2 text-center">
      <p className="text-[10px] text-slate-500 font-semibold tracking-wide">DURATION</p>
      <p className="font-bold text-[14px] text-slate-900 mt-0.5">{plan.totalDays}D</p>
     </div>
    </div>

    {/* Action Buttons - Modern */}
    <div className="flex gap-2.5 mt-4">
     <button 
      onClick={() => navigate(`/plans/${plan.id}`)} 
      className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1.5 transition-all group/btn"
     >
      Details
      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
     </button>
     <button 
      onClick={() => navigate(`/plans/${plan.id}`)} 
      className="flex-[1.6] gradient-primary py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1.5 shadow-premium hover:shadow-[0_8px_24px_rgba(15,184,111,0.35)] hover:brightness-105 transition-all"
     >
      <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
      Invest Now
     </button>
    </div>

    {/* Trust Footer */}
    <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-100">
     <div className="flex items-center gap-1">
      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
       <span className="text-white text-[8px]">✓</span>
      </div>
      <span className="text-[10px] font-semibold text-slate-500">Instant Payout</span>
     </div>
     <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
     <div className="flex items-center gap-1">
      <Shield className="w-3 h-3 text-slate-400" />
      <span className="text-[10px] font-semibold text-slate-500">Secure</span>
     </div>
    </div>
   </div>
  </div>
 );
}
