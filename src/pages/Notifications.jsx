import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, update, get } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle2, Gift, TrendingUp, Wallet, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
 const { currentUser } = useAuth();
 const [notifications, setNotifications] = useState([]);
 const navigate = useNavigate();

 useEffect(() => {
  if (!currentUser) return;
  const notifRef = ref(realtimeDb, `notifications/${currentUser.uid}`);
  const unsub = onValue(notifRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    const list = Object.entries(data).map(([id, v]) => ({ id, ...v })).sort((a,b) => new Date(b.date) - new Date(a.date));
    setNotifications(list);
   } else {
    // Generate demo notifications if none
    setNotifications([
     { id: 'demo1', title: 'Welcome to Premium App', message: 'You received ₹100 signup bonus ', type: 'bonus', date: new Date().toISOString(), read: false },
     { id: 'demo2', title: 'Daily Profit System', message: 'Your investments auto-credit daily. Just open app!', type: 'income', date: new Date(Date.now()-3600000).toISOString(), read: false },
     { id: 'demo3', title: 'Refer & Earn 20%', message: 'Invite friends and get instant commission', type: 'referral', date: new Date(Date.now()-7200000).toISOString(), read: true },
    ]);
   }
  });
  return () => unsub();
 }, [currentUser]);

 const markAllRead = async () => {
  try {
   const updates = {};
   notifications.forEach(n => {
    if (!n.read && !n.id.startsWith('demo')) {
     updates[`notifications/${currentUser.uid}/${n.id}/read`] = true;
    }
   });
   if (Object.keys(updates).length > 0) {
    // Batch update
    for (let [path, val] of Object.entries(updates)) {
     const [_, uid, notifId, field] = path.split('/');
     await update(ref(realtimeDb, `notifications/${uid}/${notifId}`), { read: val });
    }
   }
   toast.success('All notifications marked as read');
  } catch (e) {
   // For demo notifications just clear locally
   setNotifications(prev => prev.map(n => ({ ...n, read: true })));
   toast.success('All marked as read');
  }
 };

 const getIcon = (type) => {
  switch(type) {
   case 'bonus': return <Gift className="w-5 h-5 text-amber-600" />;
   case 'income': return <TrendingUp className="w-5 h-5 text-green-600" />;
   case 'deposit': return <Wallet className="w-5 h-5 text-blue-600" />;
   case 'referral': return <Users className="w-5 h-5 text-purple-600" />;
   default: return <Bell className="w-5 h-5 text-slate-600" />;
  }
 };

 const getBg = (type) => {
  switch(type) {
   case 'bonus': return 'bg-amber-50 border-amber-200';
   case 'income': return 'bg-green-50 border-green-200';
   case 'deposit': return 'bg-blue-50 border-blue-200';
   case 'referral': return 'bg-purple-50 border-purple-200';
   default: return 'bg-slate-50 border-slate-200';
  }
 };

 return (
  <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto pb-10">
   <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm">
    <div className="flex items-center gap-3">
     <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
      <ArrowLeft className="w-5 h-5 text-slate-700" />
     </button>
     <div>
      <h1 className="font-black text-[16px] text-slate-900 flex items-center gap-2">
       <Bell className="w-4 h-4" /> Notifications
      </h1>
      <p className="text-[11px] text-slate-500 font-medium">{notifications.filter(n=>!n.read).length} unread messages</p>
     </div>
    </div>
    <button onClick={markAllRead} className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-800">
     Mark all read
    </button>
   </div>

   <div className="p-4 space-y-3">
    {notifications.map(notif => (
     <div key={notif.id} className={`bg-white border rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all ${notif.read ? 'border-slate-200 opacity-80' : 'border-[#0FB86F]/30 shadow-[0_0_0_2px_rgba(15,184,111,0.1)]'}`}>
      <div className="flex gap-3">
       <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${getBg(notif.type)}`}>
        {getIcon(notif.type)}
       </div>
       <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
         <h3 className="font-bold text-[13px] text-slate-900 leading-tight">{notif.title}</h3>
         {!notif.read && <div className="w-2 h-2 bg-[#0FB86F] rounded-full flex-shrink-0 mt-1.5 animate-pulse"></div>}
        </div>
        <p className="text-[12px] text-slate-600 font-medium mt-1 leading-relaxed">{notif.message}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-2">{new Date(notif.date).toLocaleString()}</p>
       </div>
      </div>
     </div>
    ))}

    {notifications.length === 0 && (
     <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-card">
      <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
       <Bell className="w-7 h-7 text-slate-400" />
      </div>
      <p className="font-bold text-slate-700">No notifications</p>
      <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
     </div>
    )}

    <div className="bg-slate-900 rounded-2xl p-4 mt-6 text-white relative overflow-hidden">
     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl"></div>
     <div className="relative z-10 flex gap-3">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
       <CheckCircle2 className="w-5 h-5 text-white" />
      </div>
      <div>
       <p className="font-bold text-[13px]">Real-time Notifications Active</p>
       <p className="text-[11px] text-white/60 font-medium leading-relaxed mt-1">You will receive instant alerts for daily profits, deposits, withdrawals and referral commissions. All notifications are live.</p>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
