import { useLocation, useNavigate } from 'react-router-dom';
import { 
 LayoutDashboard, 
 ShoppingBag, 
 Activity, 
 Users2, 
 UserCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
 const location = useLocation();
 const navigate = useNavigate();

 const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home', id: 'home' },
  { path: '/plans', icon: ShoppingBag, label: 'Plans', id: 'plans' },
  { path: '/my-investments', icon: Activity, label: 'Active', id: 'active', isMain: true },
  { path: '/team', icon: Users2, label: 'Team', id: 'team' },
  { path: '/profile', icon: UserCircle2, label: 'Profile', id: 'profile' },
 ];

 // Hide bottom nav on these pages to prevent submit button overlap and give full scroll
 const hideOnPaths = [
  '/login',
  '/register',
  '/admin',
  '/deposit',
  '/withdraw',
  '/history',
  '/redeem',
  '/notifications',
 ];

 // Hide if current path starts with any hideOnPaths, or is plan detail
 const shouldHide = hideOnPaths.some(p => location.pathname.startsWith(p)) || location.pathname.startsWith('/plans/');

 if (shouldHide) {
  return null;
 }

 return (
  <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3">
   <div className="w-full max-w-[480px] pointer-events-auto">
    <div className="pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
     <motion.div 
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="bg-white/95 backdrop-blur-[20px] border border-slate-200 rounded-[26px] px-2 py-2.5 flex justify-between items-center shadow-[0_-4px_40px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]"
     >
      {navItems.map((item) => {
       const isActive = 
        location.pathname === item.path || 
        (item.id === 'active' && location.pathname.startsWith('/my-investments')) ||
        (item.id === 'profile' && (location.pathname === '/profile' || location.pathname === '/redeem' || location.pathname === '/history'));
       
       const Icon = item.icon;
       
       if (item.isMain) {
        return (
         <button
          key={item.id}
          onClick={() => navigate(item.path)}
          className="relative flex flex-col items-center justify-center -mt-7 group"
         >
          <motion.div 
           whileTap={{ scale: 0.92 }}
           className={`
            w-[58px] h-[58px] rounded-[18px] flex items-center justify-center
            transition-all duration-300 relative
            ${isActive 
             ? 'bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.35)] scale-105' 
             : 'bg-white border border-slate-200 text-slate-700 shadow-card group-hover:shadow-card-hover group-hover:-translate-y-1'
            }
           `}
          >
           <Icon className="w-6 h-6" strokeWidth={2.5} />
          </motion.div>
          <span className={`text-[10px] font-black mt-1.5 tracking-widest transition-colors ${
           isActive ? 'text-slate-900' : 'text-slate-500'
          }`}>
           {item.label.toUpperCase()}
          </span>
         </button>
        )
       }

       return (
        <button
         key={item.id}
         onClick={() => navigate(item.path)}
         className="flex flex-col items-center justify-center px-3.5 py-1 rounded-[16px] relative transition-all duration-200 group min-w-[56px]"
        >
         <motion.div 
          whileTap={{ scale: 0.85 }}
          className={`
           p-2 rounded-[12px] transition-all duration-300
           ${isActive 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-50'
           }
          `}
         >
          <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.6 : 2} />
         </motion.div>
         <span className={`
          text-[10px] font-bold mt-1 tracking-wide transition-colors
          ${isActive ? 'text-slate-900' : 'text-slate-500'}
         `}>
          {item.label}
         </span>
        </button>
       );
      })}
     </motion.div>
    </div>
   </div>
  </div>
 );
}
