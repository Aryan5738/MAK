import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, update, get, push } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, Chip, Button, Avatar, Stack, Alert } from '@mui/material';
import { Check, Close, AccountBalanceWallet } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminDeposits() {
 const [deposits, setDeposits] = useState([]);
 const [users, setUsers] = useState({});

 useEffect(() => {
  const depRef = ref(realtimeDb, 'deposits');
  const usersRef = ref(realtimeDb, 'users');
  const unsubDep = onValue(depRef, snap => {
   if (snap.exists()) setDeposits(Object.entries(snap.val()).map(([id,v])=>({id,...v})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
   else setDeposits([]);
  });
  const unsubUsers = onValue(usersRef, snap => { if(snap.exists()) setUsers(snap.val()); });
  return () => { unsubDep(); unsubUsers(); };
 }, []);

 const handleApprove = async (dep) => {
  const user = users[dep.userId];
  if (!user) return toast.error('User not found');
  if (!confirm(`Approve ₹${dep.amount} for ${user.username}?`)) return;
  await update(ref(realtimeDb, `users/${dep.userId}`), { balance: (user.balance||0)+dep.amount, totalDeposit: (user.totalDeposit||0)+dep.amount });
  await update(ref(realtimeDb, `deposits/${dep.id}`), { status: 'approved', approvedAt: new Date().toISOString() });
  await push(ref(realtimeDb, `transactions/${dep.userId}`), { type: 'deposit', amount: dep.amount, date: new Date().toISOString(), desc: `Deposit approved ₹${dep.amount}` });
  await push(ref(realtimeDb, `notifications/${dep.userId}`), { title: 'Deposit Approved!', message: `₹${dep.amount} added to wallet`, type: 'deposit', date: new Date().toISOString(), read: false });
  toast.success('Approved');
 };

 const handleReject = async (dep) => {
  const reason = prompt('Reject reason:','Invalid UTR');
  if (reason===null) return;
  await update(ref(realtimeDb, `deposits/${dep.id}`), { status: 'rejected', rejectReason: reason });
  toast.success('Rejected');
 };

 return (
  <AdminLayout title={`Deposits • ${deposits.filter(d=>d.status==='pending').length} Pending • MUI`}>
   <Box sx={{ mb: 3 }}>
    <Typography variant="h5" fontWeight={900}>Deposits Management</Typography>
    <Typography variant="body2" color="text.secondary">Full user info shown for approval • MUI Premium</Typography>
   </Box>

   <Stack spacing={2}>
    {deposits.map(d => {
     const user = users[d.userId];
     return (
      <Card key={d.id} sx={{ border: d.status==='pending' ? '2px solid #F59E0B' : undefined }}>
       <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
         <Box>
          <Typography variant="h6" fontWeight={900}>₹{d.amount.toLocaleString('en-IN')} <Chip label={d.status.toUpperCase()} size="small" color={d.status==='pending'?'warning':d.status==='approved'?'success':'error'} sx={{ ml: 1, fontWeight: 800, fontSize: 10 }} /></Typography>
          <Typography variant="caption" color="text.secondary">UTR: {d.utr} • {new Date(d.createdAt).toLocaleString()}</Typography>
         </Box>
         <Avatar sx={{ bgcolor: d.status==='pending'?'warning.main':d.status==='approved'?'success.main':'error.main' }}>{d.status==='pending'?'⏳':d.status==='approved'?'✓':'✕'}</Avatar>
        </Box>

        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
         <Typography variant="overline" sx={{ fontWeight: 800, fontSize: 10 }}>USER DETAILS</Typography>
         {user ? (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
           <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 900 }}>{user.username?.charAt(0)}</Avatar>
           <Box>
            <Typography variant="subtitle2" fontWeight={900}>{user.username} • {user.phone}</Typography>
            <Typography variant="caption" color="text.secondary">{user.email} • Bal ₹{Math.floor(user.balance||0)}</Typography>
           </Box>
          </Box>
         ) : <Typography color="error" variant="body2">User not found: {d.userId?.substring(0,20)}</Typography>}
        </Box>

        {d.status==='pending' && user && (
         <Stack direction="row" spacing={1}>
          <Button variant="contained" color="success" startIcon={<Check />} onClick={()=>handleApprove(d)} sx={{ flex: 1, fontWeight: 900 }}>Approve ₹{d.amount} to {user.username}</Button>
          <Button variant="outlined" color="error" startIcon={<Close />} onClick={()=>handleReject(d)}>Reject</Button>
         </Stack>
        )}
       </CardContent>
      </Card>
     );
    })}
    {deposits.length===0 && <Card sx={{ p: 4, textAlign: 'center' }}><Typography>No deposits</Typography></Card>}
   </Stack>
  </AdminLayout>
 );
}
