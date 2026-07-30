import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, update, get, push } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, Chip, Button, Avatar, Stack } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminWithdrawals() {
 const [list, setList] = useState([]);
 const [users, setUsers] = useState({});

 useEffect(() => {
  const wRef = ref(realtimeDb, 'withdrawals');
  const usersRef = ref(realtimeDb, 'users');
  const unsubW = onValue(wRef, snap => { if(snap.exists()) setList(Object.entries(snap.val()).map(([id,v])=>({id,...v})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); else setList([]); });
  const unsubUsers = onValue(usersRef, snap => { if(snap.exists()) setUsers(snap.val()); });
  return () => { unsubW(); unsubUsers(); };
 }, []);

 const handleApprove = async (wd) => {
  const user = users[wd.userId];
  if (!confirm(`Approve ₹${wd.amount} for ${user?.username}? ${wd.method==='bank'? wd.bankName : wd.upiId}`)) return;
  await update(ref(realtimeDb, `withdrawals/${wd.id}`), { status: 'approved', approvedAt: new Date().toISOString() });
  if (user) {
   await update(ref(realtimeDb, `users/${wd.userId}`), { totalWithdraw: (user.totalWithdraw||0)+wd.amount });
   await push(ref(realtimeDb, `notifications/${wd.userId}`), { title: 'Withdrawal Approved!', message: `₹${wd.amount} approved and will be processed`, type: 'success', date: new Date().toISOString(), read: false });
  }
  toast.success('Approved');
 };

 const handleReject = async (wd) => {
  const reason = prompt('Reject reason:','Bank details incorrect');
  if (reason===null) return;
  await update(ref(realtimeDb, `withdrawals/${wd.id}`), { status: 'rejected', rejectReason: reason });
  const user = users[wd.userId];
  if (user) {
   await update(ref(realtimeDb, `users/${wd.userId}`), { balance: (user.balance||0)+wd.amount });
   await push(ref(realtimeDb, `transactions/${wd.userId}`), { type: 'refund', amount: wd.amount, date: new Date().toISOString(), desc: `Withdrawal rejected refund ₹${wd.amount}` });
  }
  toast.success('Rejected & refunded');
 };

 return (
  <AdminLayout title={`Withdrawals • ${list.filter(d=>d.status==='pending').length} Pending • MUI`}>
   <Typography variant="h5" fontWeight={900} gutterBottom>Withdrawals • Bank + UPI • MUI</Typography>
   <Stack spacing={2}>
    {list.map(wd => {
     const user = users[wd.userId];
     return (
      <Card key={wd.id} sx={{ border: wd.status==='pending'?'2px solid #EF4444':undefined }}>
       <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
         <Typography variant="h6" fontWeight={900}>₹{wd.amount} <Chip label={wd.status.toUpperCase()} size="small" color={wd.status==='pending'?'warning':wd.status==='approved'?'success':'error'} sx={{ ml: 1, fontWeight: 800 }} /> <Chip label={wd.method?.toUpperCase()||'BANK'} size="small" sx={{ ml: 0.5, bgcolor: 'grey.900', color: 'white', fontWeight: 800, fontSize: 10 }} /></Typography>
         <Avatar sx={{ bgcolor: wd.status==='pending'?'warning.main':wd.status==='approved'?'success.main':'error.main', width: 32, height: 32 }}>{wd.status==='pending'?'⏳':'✓'}</Avatar>
        </Box>
        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
         <Typography variant="overline" sx={{ fontWeight: 800, fontSize: 10 }}>USER & BANK DETAILS</Typography>
         {user && <Typography variant="body2" fontWeight={700}>{user.username} • {user.email} • {user.phone}</Typography>}
         {wd.method==='bank' ? (
          <Box sx={{ mt: 1, fontSize: 12 }}>
           <div>Holder: <b>{wd.accountHolder}</b></div>
           <div>Bank: <b>{wd.bankName}</b> • Acc: <b style={{ fontFamily: 'monospace' }}>{wd.accountNumber}</b> • IFSC: <b>{wd.ifsc}</b></div>
          </Box>
         ) : <Box sx={{ mt: 1 }}>UPI: <Chip label={wd.upiId} size="small" sx={{ fontWeight: 800 }} /></Box>}
         <Typography variant="caption" color="text.secondary">{new Date(wd.createdAt).toLocaleString()}</Typography>
        </Box>
        {wd.status==='pending' && (
         <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" startIcon={<Check />} onClick={()=>handleApprove(wd)} sx={{ flex: 1, fontWeight: 900 }}>Approve Payout</Button>
          <Button variant="outlined" color="error" startIcon={<Close />} onClick={()=>handleReject(wd)}>Reject & Refund</Button>
         </Stack>
        )}
       </CardContent>
      </Card>
     );
    })}
   </Stack>
  </AdminLayout>
 );
}
