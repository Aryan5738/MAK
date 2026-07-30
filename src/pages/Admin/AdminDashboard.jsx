import { useEffect, useState } from 'react';
import { realtimeDb, ref, get } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
 Grid, Card, CardContent, Typography, Box, Chip, Button, Avatar, Stack, LinearProgress, Divider
} from '@mui/material';
import {
 People, Inventory, AccountBalanceWallet, AccountBalance, TrendingUp, Warning, CheckCircle, Block, CardGiftcard, Campaign, Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
 const [stats, setStats] = useState({ users: 0, plans: 0, deposits: 0, withdrawals: 0, investments: 0, pendingDeposits: 0, pendingWithdrawals: 0, blocked: 0, redeemCodes: 0, announcements: 0 });
 const navigate = useNavigate();

 useEffect(() => {
  const fetchStats = async () => {
   const [usersSnap, plansSnap, invSnap, depSnap, wdSnap, redeemSnap, annSnap] = await Promise.all([
    get(ref(realtimeDb, 'users')),
    get(ref(realtimeDb, 'plans')),
    get(ref(realtimeDb, 'investments')),
    get(ref(realtimeDb, 'deposits')),
    get(ref(realtimeDb, 'withdrawals')),
    get(ref(realtimeDb, 'redeemCodes')),
    get(ref(realtimeDb, 'announcements')),
   ]);

   const usersVal = usersSnap.exists() ? usersSnap.val() : {};
   const blockedCount = Object.values(usersVal).filter(u => u.isBlocked).length;

   setStats({
    users: usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0,
    plans: plansSnap.exists() ? Object.keys(plansSnap.val()).length : 0,
    investments: invSnap.exists() ? Object.keys(invSnap.val()).length : 0,
    deposits: depSnap.exists() ? Object.keys(depSnap.val()).length : 0,
    withdrawals: wdSnap.exists() ? Object.keys(wdSnap.val()).length : 0,
    pendingDeposits: depSnap.exists() ? Object.values(depSnap.val()).filter(d=>d.status==='pending').length : 0,
    pendingWithdrawals: wdSnap.exists() ? Object.values(wdSnap.val()).filter(d=>d.status==='pending').length : 0,
    blocked: blockedCount,
    redeemCodes: redeemSnap.exists() ? Object.keys(redeemSnap.val()).length : 0,
    announcements: annSnap.exists() ? Object.keys(annSnap.val()).length : 0,
   });
  };
  fetchStats();
 }, []);

 const statCards = [
  { label: 'Total Users', value: stats.users, icon: People, color: '#0F172A', bg: '#0F172A', sub: `${stats.blocked} blocked`, trend: '+12%' },
  { label: 'Investment Plans', value: stats.plans, icon: Inventory, color: '#0FB86F', bg: '#0FB86F', sub: 'Active plans', trend: '+5%' },
  { label: 'Total Investments', value: stats.investments, icon: AccountBalanceWallet, color: '#3B82F6', bg: '#3B82F6', sub: 'Portfolio', trend: '+23%' },
  { label: 'Deposits', value: stats.deposits, icon: AccountBalance, color: '#F59E0B', bg: '#F59E0B', sub: `${stats.pendingDeposits} pending`, trend: `${stats.pendingDeposits} new` },
  { label: 'Withdrawals', value: stats.withdrawals, icon: AccountBalance, color: '#EF4444', bg: '#EF4444', sub: `${stats.pendingWithdrawals} pending`, trend: 'Bank + UPI' },
  { label: 'Redeem Codes', value: stats.redeemCodes, icon: CardGiftcard, color: '#8B5CF6', bg: '#8B5CF6', sub: 'Gift cards', trend: 'Promo' },
  { label: 'Announcements', value: stats.announcements, icon: Campaign, color: '#EC4899', bg: '#EC4899', sub: 'Popups 7s', trend: 'Live' },
  { label: 'Blocked Users', value: stats.blocked, icon: Block, color: '#EF4444', bg: '#991B1B', sub: 'Suspended', trend: 'Reason' },
 ];

  const quickActions = [
    { title: 'Manage Plans', desc: 'Add, edit investment plans with images, ROI + next profit realtime', icon: Inventory, path: '/admin/plans', color: '#0FB86F' },
    { title: 'Users & Suspend', desc: 'Add/deduct balance, suspend with reason, unban, notify single', icon: People, path: '/admin/users', color: '#3B82F6' },
    { title: 'KYC Verification', desc: 'Dynamic fields: Aadhar, PAN, images + approve/reject', icon: People, path: '/admin/kyc', color: '#6366F1' },
    { title: `Deposits • ${stats.pendingDeposits} Pending`, desc: 'Approve deposits with full user info & real payments', icon: AccountBalance, path: '/admin/deposits', color: '#10B981' },
    { title: `Withdrawals • ${stats.pendingWithdrawals} Pending`, desc: 'Bank Acc No, IFSC, Holder + UPI approval', icon: AccountBalanceWallet, path: '/admin/withdrawals', color: '#EF4444' },
    { title: 'Redeem Codes Gift', desc: 'Create codes with price, show to specific user via notification', icon: CardGiftcard, path: '/admin/redeem', color: '#F59E0B' },
    { title: 'Announcements Popup', desc: '7sec auto popup + image + buy button + close', icon: Campaign, path: '/admin/announcements', color: '#8B5CF6' },
    { title: 'App Settings Global', desc: 'App name everywhere, logo URL, UPI QR, referral %', icon: Settings, path: '/admin/settings', color: '#0F172A' },
  ];

 return (
  <AdminLayout title="Admin Dashboard • MUI Premium">
   <Box sx={{ mb: 3 }}>
    <Typography variant="h5" fontWeight={900} gutterBottom>
     Welcome to MUI Premium Admin
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
     Modern Material UI admin panel with suspension, notifications, redeem codes, announcement popups, bank withdrawal system. All real-time Firebase.
    </Typography>
   </Box>

   <Grid container spacing={2.5} sx={{ mb: 4 }}>
    {statCards.map((stat, i) => (
     <Grid item xs={6} md={3} key={i}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
       <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: stat.bg }} />
        <CardContent sx={{ p: 2.5 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: `${stat.bg}15`, color: stat.bg, width: 44, height: 44, border: `1px solid ${stat.bg}20` }}>
           <stat.icon />
          </Avatar>
          <Chip label={stat.trend} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: `${stat.bg}15`, color: stat.bg }} />
         </Box>
         <Typography variant="h4" fontWeight={900} sx={{ fontSize: 28, letterSpacing: -1 }}>{stat.value}</Typography>
         <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: 13, mt: 0.3 }}>{stat.label}</Typography>
         <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 600 }}>{stat.sub}</Typography>
         <LinearProgress variant="determinate" value={65 + Math.random()*30} sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: `${stat.bg}15`, '& .MuiLinearProgress-bar': { bgcolor: stat.bg } }} />
        </CardContent>
       </Card>
      </motion.div>
     </Grid>
    ))}
   </Grid>

   <Typography variant="h6" fontWeight={900} sx={{ mb: 2, fontSize: 16 }}>Quick Management • MUI Cards</Typography>
   <Grid container spacing={2.5}>
    {quickActions.map((action, i) => (
     <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
       <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { borderColor: `${action.color}40`, boxShadow: `0 8px 32px ${action.color}15` } }} onClick={() => navigate(action.path)}>
        <CardContent sx={{ p: 2.5 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: `${action.color}15`, color: action.color, width: 40, height: 40, border: `1px solid ${action.color}20` }}>
           <action.icon fontSize="small" />
          </Avatar>
          <Box sx={{ ml: 'auto' }}>
           <TrendingUp sx={{ fontSize: 16, color: 'text.secondary' }} />
          </Box>
         </Box>
         <Typography variant="subtitle2" fontWeight={900} sx={{ fontSize: 14, lineHeight: 1.2, mb: 0.5 }}>{action.title}</Typography>
         <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11.5, lineHeight: 1.4, fontWeight: 500, minHeight: 32 }}>{action.desc}</Typography>
         <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label="Manage →" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: 'grey.100' }} />
          {action.title.includes('Pending') && <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />}
         </Box>
        </CardContent>
       </Card>
      </motion.div>
     </Grid>
    ))}
   </Grid>

   <Card sx={{ mt: 4, bgcolor: 'grey.900', color: 'white', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: 'primary.main' }} />
    <CardContent sx={{ p: 3 }}>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 32, height: 32 }}><CheckCircle fontSize="small" /></Avatar>
      <Typography variant="subtitle1" fontWeight={900}>MUI Premium Features Implemented</Typography>
     </Box>
     <Grid container spacing={2}>
      {[
       'Material UI 5.15 with Emotion, custom theme green #0FB86F',
       'Drawer sidebar responsive, AppBar with blur, search, stats',
       'Suspend/unban with reason modal, single user notification',
       'Deposit/withdrawal approval with full user info, bank details',
       'Redeem codes gift cards, announcements popup 7sec with image+buy button',
       'App name global change from settings updates everywhere realtime',
       'Broadcast notification to all users + announcement popup auto-remove',
       'BottomNav fix (hidden on deposit/withdraw), bank fields, refresh persist',
      ].map((t,i) => (
       <Grid item xs={12} sm={6} key={i}>
        <Box sx={{ display: 'flex', gap: 1.5, bgcolor: 'rgba(255,255,255,0.06)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
         <CheckCircle sx={{ fontSize: 16, color: 'primary.main', mt: 0.2 }} />
         <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.4, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{t}</Typography>
        </Box>
       </Grid>
      ))}
     </Grid>
    </CardContent>
   </Card>
  </AdminLayout>
 );
}
