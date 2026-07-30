import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Bell, Wallet, ShieldCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';

export default function TopBar() {
 const { userData, currentUser } = useAuth();
 const { settings } = useApp();
 const navigate = useNavigate();
 const [unread, setUnread] = useState(0);

 useEffect(() => {
  if (!currentUser) return;
  const notifRef = ref(realtimeDb, `notifications/${currentUser.uid}`);
  const unsub = onValue(notifRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    const count = Object.values(data).filter(n => !n.read).length;
    setUnread(count);
   } else {
    setUnread(0);
   }
  });
  return () => unsub();
 }, [currentUser]);

 return (
  <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">
   <div className="px-4 py-3 flex justify-between items-center max-w-[480px] mx-auto w-full">
    <div className="flex items-center gap-2.5">
     <div className="relative">
      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-premium">
       {settings.logoUrl ? (
        <img src={settings.logoUrl} alt="logo" className="w-full h-full object-cover rounded-xl" />
       ) : (
        <span className="font-black text-white text-[14px] tracking-tight">
         {settings.appName?.substring(0,2).toUpperCase()}
        </span>
       )}
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
       <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
      </div>
     </div>
     <div className="min-w-0">
      <div className="flex items-center gap-1.5">
       <h1 className="font-black text-[15px] tracking-tight text-slate-900 truncate max-w-[100px]">{settings.appName}</h1>
       <span className="bg-[#0FB86F]/10 text-[#0FB86F] text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-widest flex-shrink-0">PREMIUM</span>
      </div>
      <div className="flex items-center gap-1">
       <ShieldCheck className="w-3 h-3 text-[#0FB86F] flex-shrink-0" />
       <p className="text-[10px] text-slate-500 font-semibold tracking-wide truncate">VERIFIED • LIVE</p>
      </div>
     </div>
    </div>

    <div className="flex items-center gap-2 flex-shrink-0">
     <button 
      onClick={() => navigate('/wallet')} 
      className="bg-white border border-slate-200 rounded-full pl-2.5 pr-1 py-1 flex items-center gap-1.5 shadow-sm hover:shadow-md hover:border-[#0FB86F]/30 transition-all group"
     >
      <div className="w-6 h-6 bg-[#0FB86F]/10 rounded-full flex items-center justify-center">
       <Wallet className="w-3.5 h-3.5 text-[#0FB86F]" strokeWidth={2.5} />
      </div>
      <span className="text-[13px] font-bold text-slate-900 tracking-tight hidden xs:block">
       ₹{userData?.balance ? Math.floor(userData.balance).toLocaleString('en-IN') : 0}
      </span>
      <span className="text-[12px] font-bold text-slate-900 xs:hidden">
       ₹{userData?.balance ? Math.floor(userData.balance/1000) + 'k' : 0}
      </span>
      <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center ml-0.5">
       <span className="text-white text-[10px] font-bold">↗</span>
      </div>
     </button>

     <button 
      onClick={() => navigate('/notifications')} 
      className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center relative shadow-sm hover:shadow-md transition-all group"
     >
      <Bell className="w-[16px] h-[16px] text-slate-600 group-hover:text-slate-900" strokeWidth={2} />
      {unread > 0 ? (
       <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1">
        {unread > 9 ? '9+' : unread}
       </span>
      ) : (
       <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
      )}
     </button>
    </div>
   </div>
  </div>
 );
}
