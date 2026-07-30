import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';
import { X, Megaphone, AlertTriangle, Gift, Info, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AnnouncementPopup() {
 const [announcements, setAnnouncements] = useState([]);
 const [current, setCurrent] = useState(null);
 const [visible, setVisible] = useState(false);
 const [timer, setTimer] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
  const annRef = ref(realtimeDb, 'announcements');
  const unsub = onValue(annRef, (snap) => {
   if (snap.exists()) {
    const all = Object.entries(snap.val())
     .map(([id, v]) => ({ id, ...v }))
     .filter(a => a.isActive)
     .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAnnouncements(all);
    if (all.length > 0 && !current && !visible) {
     showAnnouncement(all[0]);
    }
   }
  });
  return () => unsub();
 }, []);

 const showAnnouncement = (ann) => {
  setCurrent(ann);
  setVisible(true);
  
  const t = setTimeout(() => {
   setVisible(false);
   setTimeout(() => setCurrent(null), 400);
  }, 7000);
  setTimer(t);
 };

 const handleClose = () => {
  if (timer) clearTimeout(timer);
  setVisible(false);
  setTimeout(() => setCurrent(null), 400);
 };

 const handleAction = () => {
  if (current?.actionLink) {
   handleClose();
   setTimeout(() => navigate(current.actionLink), 400);
  }
 };

 const getIcon = (type) => {
  switch(type) {
   case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
   case 'gift': return <Gift className="w-5 h-5 text-green-600" />;
   case 'info': return <Info className="w-5 h-5 text-blue-600" />;
   default: return <Megaphone className="w-5 h-5 text-white" />;
  }
 };

 const getBg = (type) => {
  switch(type) {
   case 'warning': return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200';
   case 'gift': return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
   case 'info': return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
   default: return 'bg-gradient-to-br from-slate-900 via-slate-800 to-black border-slate-800';
  }
 };

 const getTextColor = (type) => {
  return type === 'default' ? 'text-white' : 'text-slate-900';
 };

 const getSubTextColor = (type) => {
  return type === 'default' ? 'text-white/70' : 'text-slate-600';
 };

 return (
  <AnimatePresence>
   {visible && current && (
    <motion.div
     initial={{ opacity: 0, y: -120, scale: 0.9 }}
     animate={{ opacity: 1, y: 0, scale: 1 }}
     exit={{ opacity: 0, y: -80, scale: 0.85 }}
     transition={{ type: 'spring', damping: 18, stiffness: 300 }}
     className="fixed top-4 left-3 right-3 z-[100] max-w-[420px] mx-auto"
    >
     <div className={`${getBg(current.type)} border rounded-[22px] p-0 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl relative overflow-hidden`}>
      {/* Progress bar - 7 sec */}
      <motion.div
       initial={{ width: '100%' }}
       animate={{ width: '0%' }}
       transition={{ duration: 7, ease: 'linear' }}
       className="absolute top-0 left-0 h-1 bg-[#0FB86F] z-20"
      />

      {/* Image if exists */}
      {current.imageUrl && (
       <div className="relative h-36 w-full overflow-hidden">
        <img src={current.imageUrl} alt="announcement" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
         <Sparkles className="w-3 h-3" /> ANNOUNCEMENT
        </div>
        <button
         onClick={handleClose}
         className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-colors"
        >
         <X className="w-4 h-4" />
        </button>
       </div>
      )}

      <div className="p-4 relative">
       {!current.imageUrl && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl -mr-6 -mt-6"></div>
       )}

       <div className="flex gap-3 relative z-10">
        {!current.imageUrl && (
         <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${current.type === 'default' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'}`}>
          {getIcon(current.type)}
         </div>
        )}
        
        <div className="flex-1 min-w-0">
         <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
           <h3 className={`font-black text-[14px] leading-tight truncate ${getTextColor(current.type)}`}>
            {current.title}
           </h3>
           {!current.imageUrl && <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${current.type === 'default' ? 'text-white/50' : 'text-amber-500'}`} />}
          </div>
          
          {!current.imageUrl && (
           <button
            onClick={handleClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors border ${
             current.type === 'default' 
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' 
              : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
            }`}
           >
            <X className="w-4 h-4" />
           </button>
          )}
          {current.imageUrl && (
           <button
            onClick={handleClose}
            className="w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-slate-50 transition-colors"
           >
            <X className="w-4 h-4 text-slate-600" />
           </button>
          )}
         </div>
         
         <p className={`text-[12px] font-medium mt-2 leading-relaxed ${getSubTextColor(current.type)}`}>
          {current.message}
         </p>

         <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
           <span className={`text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest border ${
            current.type === 'default' 
             ? 'bg-white/10 text-white border-white/10' 
             : 'bg-slate-900 text-white border-slate-900'
           }`}>
            {current.type.toUpperCase()} • 7S
           </span>
           <span className={`text-[10px] font-bold ${current.type === 'default' ? 'text-white/50' : 'text-slate-400'}`}>
            Auto closing
           </span>
          </div>
          
          <div className="flex items-center gap-2">
           <button
            onClick={handleClose}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
             current.type === 'default'
              ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
           >
            Close
           </button>
           
           {current.actionLabel && current.actionLink && (
            <button
             onClick={handleAction}
             className="bg-[#0FB86F] hover:bg-[#0A8B53] text-white text-[11px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:shadow-lg transition-all"
            >
             <ShoppingBag className="w-3 h-3" />
             {current.actionLabel.length > 18 ? current.actionLabel.substring(0,18)+'...' : current.actionLabel}
             <ArrowRight className="w-3 h-3" />
            </button>
           )}
          </div>
         </div>
        </div>
       </div>
      </div>
     </div>
    </motion.div>
   )}
  </AnimatePresence>
 );
}
