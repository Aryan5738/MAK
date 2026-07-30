import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { realtimeDb, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Copy, Share2, Users2, TrendingUp, Gift, ShieldCheck } from 'lucide-react';

export default function Team() {
 const { currentUser, userData } = useAuth();
 const [team, setTeam] = useState({ l1: [], l2: [], l3: [] });
 const [tab, setTab] = useState('l1');

 useEffect(() => {
  if (!currentUser) return;
  const usersRef = ref(realtimeDb, 'users');
  const unsub = onValue(usersRef, (snap) => {
   if (!snap.exists()) return;
   const all = snap.val();
   const allList = Object.entries(all).map(([uid, u]) => ({ uid, ...u }));
   
   const l1 = allList.filter(u => u.referredBy === userData?.myReferCode);
   const l1Codes = l1.map(u => u.myReferCode);
   const l2 = allList.filter(u => l1Codes.includes(u.referredBy));
   const l2Codes = l2.map(u => u.myReferCode);
   const l3 = allList.filter(u => l2Codes.includes(u.referredBy));

   setTeam({ l1, l2, l3 });
  });
  return () => unsub();
 }, [currentUser, userData]);

 const referLink = `${window.location.origin}/register?ref=${userData?.myReferCode}`;
 const levels = [
  { id: 'l1', label: 'Level 1', percent: '20%', count: team.l1.length, color: 'from-[#0FB86F] to-[#00E58F]', bg: 'bg-[#0FB86F]/10', border: 'border-[#0FB86F]/20', text: 'text-[#0A8B53]' },
  { id: 'l2', label: 'Level 2', percent: '5%', count: team.l2.length, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { id: 'l3', label: 'Level 3', percent: '2%', count: team.l3.length, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
 ];

 const currentList = team[tab] || [];
 const totalTeam = team.l1.length + team.l2.length + team.l3.length;

 return (
  <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto">
   <TopBar />
   <div className="px-4 mt-5">
    <div className="flex items-center justify-between">
     <div>
      <h1 className="text-[20px] font-black text-slate-900 tracking-tight">My Team</h1>
      <p className="text-[12px] text-slate-500 font-medium">Refer & earn lifetime commission</p>
     </div>
     <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[11px] font-bold">
      {totalTeam} Members
     </div>
    </div>

    {/* Referral Card - Premium Light */}
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 mt-5 shadow-card relative overflow-hidden">
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
     <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0FB86F]/5 to-transparent rounded-full blur-2xl"></div>
     
     <div className="relative z-10">
      <div className="flex justify-between items-center">
       <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
         <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
         <p className="text-[11px] text-slate-500 font-bold tracking-widest">MY REFERRAL CODE</p>
         <p className="text-[20px] font-black tracking-[2px] text-slate-900 mt-0.5">{userData?.myReferCode}</p>
        </div>
       </div>
       <button onClick={()=>navigator.clipboard.writeText(userData?.myReferCode||'')} className="w-11 h-11 bg-[#0FB86F]/10 border border-[#0FB86F]/20 rounded-full flex items-center justify-center hover:bg-[#0FB86F]/15 transition-colors">
        <Copy className="w-5 h-5 text-[#0FB86F]" />
       </button>
      </div>

      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
       <p className="text-[10px] text-slate-500 font-bold tracking-widest">REFERRAL LINK</p>
       <p className="text-[11px] font-mono text-slate-700 mt-1 break-all leading-relaxed">{referLink}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
       <button onClick={()=>navigator.clipboard.writeText(referLink)} className="bg-white border border-slate-200 py-3 rounded-xl text-[12px] font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
        <Copy className="w-4 h-4" /> Copy Link
       </button>
       <button onClick={()=>{ if(navigator.share) navigator.share({title: 'CASIO Premium', text: `Join CASIO and earn rewards! Code: ${userData?.myReferCode}`, url: referLink}); else navigator.clipboard.writeText(referLink); }} className="gradient-primary py-3 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2 shadow-premium hover:brightness-105 transition-all">
        <Share2 className="w-4 h-4" /> Share Now
       </button>
      </div>
     </div>
    </div>

    {/* Level Stats */}
    <div className="grid grid-cols-3 gap-3 mt-5">
     {levels.map(l => (
      <button key={l.id} onClick={()=>setTab(l.id)} className={`rounded-2xl p-4 text-center border transition-all text-left ${tab===l.id ? `bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]` : `bg-white border-slate-200 hover:border-slate-300 shadow-sm`}`}>
       <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${tab===l.id ? 'bg-white/10' : l.bg}`}>
        <Users2 className={`w-4 h-4 ${tab===l.id ? 'text-white' : l.text}`} />
       </div>
       <p className={`text-[10px] font-bold tracking-wide ${tab===l.id ? 'text-white/60' : 'text-slate-500'}`}>{l.label} • {l.percent}</p>
       <p className={`text-[22px] font-black mt-1 ${tab===l.id ? 'text-white' : 'text-slate-900'}`}>{l.count}</p>
       <p className={`text-[10px] font-medium mt-1 ${tab===l.id ? 'text-white/60' : 'text-slate-500'}`}>Members</p>
      </button>
     ))}
    </div>

    <div className="mt-6 flex justify-between items-center">
     <h3 className="font-black text-[14px] text-slate-900">{levels.find(l=>l.id===tab)?.label} Team - {levels.find(l=>l.id===tab)?.percent} Commission</h3>
     <span className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1 rounded-full">{currentList.length} users</span>
    </div>

    <div className="mt-4 space-y-3">
     {currentList.map(u => (
      <div key={u.uid} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-card hover:shadow-card-hover transition-all">
       <div className="flex gap-3 items-center min-w-0">
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center font-black text-sm text-white flex-shrink-0">
         {u.username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
         <p className="text-[13px] font-bold text-slate-900 truncate">{u.username}</p>
         <p className="text-[11px] text-slate-500 font-medium truncate">{u.phone} • Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</p>
        </div>
       </div>
       <div className="text-right flex-shrink-0 ml-3">
        <p className="text-[13px] font-black text-[#0FB86F]">₹{Math.floor(u.totalEarning||0).toLocaleString('en-IN')}</p>
        <p className="text-[10px] text-slate-500 font-bold tracking-wide">EARNED</p>
       </div>
      </div>
     ))}
     
     {currentList.length===0 && (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-card">
       <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
        <Users2 className="w-8 h-8 text-slate-400" />
       </div>
       <p className="font-bold text-slate-700">No members in {tab.toUpperCase()}</p>
       <p className="text-[12px] text-slate-500 mt-1 max-w-[220px] mx-auto">Share your referral link to start earning 20% commission instantly</p>
      </div>
     )}
    </div>

    <div className="bg-slate-900 rounded-2xl p-5 mt-6 text-white relative overflow-hidden">
     <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl"></div>
     <h4 className="font-black text-[13px] flex items-center gap-2 relative z-10">
      <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
       <TrendingUp className="w-3.5 h-3.5 text-white" />
      </div>
      Commission Structure 
     </h4>
     <div className="mt-4 space-y-2.5 text-[12px] relative z-10">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
       <span className="text-white/70 font-medium">Level 1 (Direct Friend)</span>
       <span className="bg-[#0FB86F] text-white px-2.5 py-1 rounded-full text-[11px] font-bold">20% Earning</span>
      </div>
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
       <span className="text-white/70 font-medium">Level 2 (Friend of Friend)</span>
       <span className="bg-white/10 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">5% Earning</span>
      </div>
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
       <span className="text-white/70 font-medium">Level 3 (Extended Team)</span>
       <span className="bg-white/10 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">2% Earning</span>
      </div>
      <p className="text-[11px] text-white/50 mt-3 flex items-center gap-1.5">
       <ShieldCheck className="w-3.5 h-3.5" /> Example: Friend buys ₹200 plan → You get ₹40 instantly ()
      </p>
     </div>
    </div>
   </div>
  </div>
 );
}
