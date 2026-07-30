import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { logoutUser } from '../firebase';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { LogOut, User, Mail, Phone, Copy, Award, Wallet, History, ShieldCheck, TrendingUp, Settings, Gift, Ticket, Bell, Users2, CreditCard, HelpCircle, LogOutIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Profile() {
 const { userData, currentUser } = useAuth();
 const { settings } = useApp();
 const navigate = useNavigate();

 const handleLogout = async () => {
  if (confirm('Logout from account?')) {
   await logoutUser();
   navigate('/login');
   toast.success('Logged out successfully');
  }
 };

 const copyRef = () => {
  navigator.clipboard.writeText(userData?.myReferCode || '');
  toast.success('Referral code copied!');
 };

 return (
  <div className="min-h-screen pb-28 bg-[#F8FDF9] max-w-[480px] mx-auto w-full">
   {/* Custom Premium Header */}
   <div className="relative">
    <div className="h-[200px] bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,184,111,0.15),transparent_50%)]"></div>
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
     <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-[#0FB86F]/20 to-transparent rounded-full blur-2xl"></div>
     
     <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
      <div className="flex items-center gap-2">
       <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
        <ShieldCheck className="w-4 h-4 text-white" />
       </div>
       <div>
        <p className="text-white font-black text-[13px] tracking-wide">{settings.appName} PREMIUM</p>
        <p className="text-white/60 text-[11px] font-medium">Verified Member • Live</p>
       </div>
      </div>
      <button onClick={()=>navigate('/notifications')} className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
       <Bell className="w-4 h-4 text-white" />
      </button>
     </div>
    </div>

    {/* Profile Card Overlapping */}
    <div className="px-4 -mt-14 relative z-10">
     <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
     >
      <div className="flex gap-4">
       <div className="relative">
        <div className="w-[72px] h-[72px] gradient-primary rounded-[20px] flex items-center justify-center font-black text-[22px] text-white shadow-premium">
         {userData?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border-2 border-[#0FB86F] rounded-full flex items-center justify-center shadow-md">
         <ShieldCheck className="w-4 h-4 text-[#0FB86F]" />
        </div>
       </div>
       
       <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
         <h2 className="font-black text-[18px] text-slate-900 truncate">{userData?.username}</h2>
         <span className="bg-[#0FB86F]/10 text-[#0FB86F] border border-[#0FB86F]/20 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest">VIP</span>
        </div>
        
        <div className="mt-1.5 space-y-1">
         <p className="text-[12px] text-slate-600 font-medium flex items-center gap-1.5 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> 
          <span className="truncate">{userData?.email}</span>
         </p>
         <p className="text-[12px] text-slate-600 font-medium flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" /> {userData?.phone}
         </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
         <div className="bg-slate-900 text-white rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-widest">{userData?.myReferCode}</span>
          <button onClick={copyRef} className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
           <Copy className="w-3 h-3" />
          </button>
         </div>
         <span className="text-[10px] text-slate-500 font-bold tracking-wide">REF CODE</span>
        </div>
       </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-5">
       <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
        <p className="text-[9px] font-black tracking-widest text-slate-500">BALANCE</p>
        <p className="font-black text-[14px] text-slate-900 mt-1">₹{Math.floor(userData?.balance||0).toLocaleString('en-IN')}</p>
        <div className="mt-1.5 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
         <div className="h-full w-[70%] bg-slate-900 rounded-full"></div>
        </div>
       </div>
       <div className="bg-[#0FB86F]/5 border border-[#0FB86F]/20 rounded-xl p-3 text-center">
        <p className="text-[9px] font-black tracking-widest text-[#0FB86F]">EARNED</p>
        <p className="font-black text-[14px] text-[#0A8B53] mt-1">₹{Math.floor(userData?.totalEarning||0).toLocaleString('en-IN')}</p>
        <div className="mt-1.5 w-full h-1 bg-[#0FB86F]/20 rounded-full overflow-hidden">
         <div className="h-full w-[85%] bg-[#0FB86F] rounded-full"></div>
        </div>
       </div>
       <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
        <p className="text-[9px] font-black tracking-widest text-purple-600">TEAM</p>
        <p className="font-black text-[14px] text-purple-700 mt-1">₹{Math.floor(userData?.referralEarning||0).toLocaleString('en-IN')}</p>
        <div className="mt-1.5 w-full h-1 bg-purple-200 rounded-full overflow-hidden">
         <div className="h-full w-[60%] bg-purple-600 rounded-full"></div>
        </div>
       </div>
      </div>
     </motion.div>
    </div>
   </div>

   <div className="px-4 mt-5 space-y-5">
    {/* Premium Action Grid */}
    <div>
     <p className="text-[11px] font-black tracking-[1.5px] text-slate-500 ml-1 mb-3">QUICK ACCESS • PREMIUM</p>
     <div className="grid grid-cols-4 gap-3">
      {[
       { icon: Wallet, label: 'Wallet', color: 'bg-slate-900 text-white', path: '/wallet' },
       { icon: TrendingUp, label: 'Active', color: 'bg-[#0FB86F] text-white', path: '/my-investments' },
       { icon: History, label: 'History', color: 'bg-white border border-slate-200 text-slate-700', path: '/history' },
       { icon: Gift, label: 'Redeem', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', path: '/redeem', highlight: true },
      ].map((item, i) => (
       <motion.button 
        key={i}
        whileTap={{ scale: 0.92 }}
        onClick={()=>navigate(item.path)}
        className={`rounded-2xl p-3 flex flex-col items-center gap-2 shadow-card hover:shadow-card-hover transition-all ${item.color}`}
       >
        <item.icon className="w-5 h-5" strokeWidth={2.2} />
        <span className="text-[10px] font-black tracking-wide">{item.label}</span>
       </motion.button>
      ))}
     </div>
    </div>

    {/* Full Width Premium Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={()=>navigate('/daily-bonus')} 
            className="bg-gradient-to-br from-[#0FB86F] to-[#00E58F] rounded-2xl p-4 text-left text-white shadow-[0_8px_24px_rgba(15,184,111,0.3)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-xl -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 mb-3">
                <Gift className="w-5 h-5" />
              </div>
              <p className="font-black text-[14px]">Daily Bonus</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5 leading-tight">₹10-₹100 daily streak</p>
              <div className="mt-3 bg-white text-[#0FB86F] text-[10px] font-black px-3 py-1 rounded-full inline-flex">CLAIM NOW →</div>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={()=>navigate('/kyc')} 
            className="bg-slate-900 rounded-2xl p-4 text-left text-white shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-6 -mt-6"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="font-black text-[14px]">KYC Verify</p>
              <p className="text-[11px] text-white/60 font-medium mt-0.5">{userData?.kyc?.status === 'approved' ? 'Verified ✓' : 'Required for withdraw'}</p>
              <div className="mt-3 bg-white/10 border border-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full inline-flex">
                {userData?.kyc?.status === 'approved' ? 'VERIFIED' : 'VERIFY NOW'}
              </div>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={()=>navigate('/redeem')} 
            className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-2xl p-4 text-left text-white shadow-[0_8px_24px_rgba(249,115,22,0.3)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-white/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 mb-3">
                <Ticket className="w-5 h-5" />
              </div>
              <p className="font-black text-[14px]">Redeem Gift</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5 leading-tight">Promo codes & bonus</p>
              <div className="mt-3 bg-white text-orange-600 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
                REDEEM NOW <span className="text-[12px]">→</span>
              </div>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={()=>navigate('/team')} 
            className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-card hover:shadow-card-hover transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#0FB86F]/5 rounded-full blur-xl -mr-6 -mt-6"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#0FB86F]/10 border border-[#0FB86F]/20 rounded-xl flex items-center justify-center mb-3">
                <Users2 className="w-5 h-5 text-[#0FB86F]" />
              </div>
              <p className="font-black text-[14px] text-slate-900">My Team</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Referral earnings</p>
              <div className="mt-3 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
                20% BONUS
              </div>
            </div>
          </motion.button>
        </div>

    {/* Menu List Premium */}
    <div>
     <p className="text-[11px] font-black tracking-[1.5px] text-slate-500 ml-1 mb-3">ACCOUNT SETTINGS</p>
     <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <MenuRow icon={Wallet} label="Wallet & Balance" sub={`${Math.floor(userData?.balance||0).toLocaleString('en-IN')} available`} onClick={()=>navigate('/wallet')} />
      <MenuRow icon={CreditCard} label="Deposit Funds" sub="Add real money" onClick={()=>navigate('/deposit')} />
      <MenuRow icon={History} label="Transaction History" sub="Deposits, withdrawals, bonus" onClick={()=>navigate('/history')} />
      <MenuRow icon={Bell} label="Notifications" sub="Alerts & updates" onClick={()=>navigate('/notifications')} hasDot />
      <MenuRow icon={Gift} label="Redeem Codes" sub="Gift cards & promos" onClick={()=>navigate('/redeem')} highlight />
      <MenuRow icon={HelpCircle} label="Help & Support" sub="FAQs and contact" onClick={()=>toast.info('Support coming soon!')} />
      <MenuRow icon={Settings} label="App Info" sub={`${settings.appName} v4.0 Premium`} onClick={()=>toast.success(`${settings.appName} v4.0 Light Premium`)} last />
     </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
     <h3 className="font-black text-[13px] text-slate-900 flex items-center gap-2">
      <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
       <User className="w-3.5 h-3.5 text-white" />
      </div>
      Account Details
     </h3>
     <div className="mt-4 space-y-3">
      <DetailItem label="User ID" value={currentUser?.uid.substring(0,16)+'...'} mono />
      <DetailItem label="Platform" value={settings.appName} pill />
      <DetailItem label="Joined On" value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'} />
      <DetailItem label="Referred By" value={userData?.referredBy || 'Direct Join'} badge />
      <DetailItem label="Status" value="Verified Premium" green />
     </div>
    </div>

    <motion.button 
     whileTap={{ scale: 0.98 }}
     onClick={handleLogout} 
     className="w-full bg-white border border-red-200 py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2.5 text-red-600 hover:bg-red-50 transition-colors shadow-sm"
    >
     <LogOut className="w-4 h-4" strokeWidth={2.5} /> Logout Account
    </motion.button>

    <div className="text-center pb-2">
     <div className="inline-flex items-center gap-2 bg-slate-900 rounded-full px-4 py-2 shadow-lg">
      <div className="w-2 h-2 bg-[#0FB86F] rounded-full animate-pulse"></div>
      <p className="text-[11px] text-white font-black tracking-wide">{settings.appName} PREMIUM v4.0 • LIGHT EDITION</p>
     </div>
     <p className="text-[10px] text-slate-400 mt-3 font-medium leading-relaxed max-w-[280px] mx-auto">
       live platform for educational purposes. Real money transactions with secure verification. All transactions are real and verified.
     </p>
    </div>
   </div>
  </div>
 );
}

function MenuRow({ icon: Icon, label, sub, onClick, hasDot, highlight, last }) {
 return (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors group ${!last ? 'border-b border-slate-100' : ''} ${highlight ? 'bg-amber-50/50' : ''}`}>
   <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${highlight ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-slate-50 border-slate-200 group-hover:bg-white group-hover:border-slate-300'}`}>
    <Icon className={`w-5 h-5 ${highlight ? 'text-white' : 'text-slate-700'}`} strokeWidth={2} />
   </div>
   <div className="flex-1 min-w-0">
    <p className={`font-bold text-[13px] ${highlight ? 'text-amber-900' : 'text-slate-900'} flex items-center gap-2`}>
     {label}
     {hasDot && <span className="w-2 h-2 bg-[#0FB86F] rounded-full animate-pulse"></span>}
    </p>
    <p className={`text-[11px] font-medium truncate ${highlight ? 'text-amber-700/80' : 'text-slate-500'}`}>{sub}</p>
   </div>
   <div className={`w-7 h-7 rounded-full flex items-center justify-center ${highlight ? 'bg-amber-500 text-white' : 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white'} transition-all`}>
    <span className="text-[14px] font-bold">›</span>
   </div>
  </button>
 );
}

function DetailItem({ label, value, mono, pill, badge, green }) {
 return (
  <div className="flex justify-between items-center py-2.5">
   <span className="text-[12px] text-slate-500 font-medium">{label}</span>
   {pill ? (
    <span className="bg-slate-900 text-white text-[11px] font-black px-3 py-1 rounded-full">{value}</span>
   ) : badge ? (
    <span className="bg-green-50 border border-green-200 text-green-700 text-[11px] font-black px-2.5 py-1 rounded-full">{value}</span>
   ) : green ? (
    <span className="bg-[#0FB86F]/10 border border-[#0FB86F]/20 text-[#0A8B53] text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#0FB86F] rounded-full"></span>{value}</span>
   ) : (
    <span className={`text-[12px] font-bold ${mono ? 'font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[11px]' : 'text-slate-900'}`}>{value}</span>
   )}
  </div>
 );
}
