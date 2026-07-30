import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, update, push } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Chip, Avatar, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Alert } from '@mui/material';
import { Search, Add, Remove, Block, CheckCircle, Message, Person } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminUsers() {
 const [users, setUsers] = useState([]);
 const [search, setSearch] = useState('');
 const [showNotify, setShowNotify] = useState(null);
 const [notifyForm, setNotifyForm] = useState({ title: '', message: '' });

 useEffect(() => {
  const usersRef = ref(realtimeDb, 'users');
  const unsub = onValue(usersRef, (snap) => {
   if (snap.exists()) setUsers(Object.entries(snap.val()).map(([uid, v])=>({ uid, ...v })));
   else setUsers([]);
  });
  return () => unsub();
 }, []);

 const handleAddBalance = async (user, isAdd = true) => {
  const action = isAdd ? 'Add' : 'Deduct';
  const amt = prompt(`${action} balance ${isAdd ? 'to' : 'from'} ${user.username} (current: ₹${Math.floor(user.balance||0)}):`, "500");
  if (!amt) return;
  const num = Number(amt);
  if (isNaN(num) || num <= 0) return toast.error('Invalid amount');
  
  const newBalance = isAdd ? (user.balance||0) + num : Math.max(0, (user.balance||0) - num);
  const updates = { balance: newBalance };
  if (isAdd) updates.totalDeposit = (user.totalDeposit||0) + num;
  
  await update(ref(realtimeDb, `users/${user.uid}`), updates);
  await push(ref(realtimeDb, `transactions/${user.uid}`), { 
    type: isAdd ? 'deposit' : 'deduct', 
    amount: isAdd ? num : -num, 
    date: new Date().toISOString(), 
    desc: `Admin ${isAdd ? 'added' : 'deducted'} ₹${num} ${isAdd ? 'to' : 'from'} real balance` 
  });
  await push(ref(realtimeDb, `notifications/${user.uid}`), { 
    title: `Balance ${isAdd ? 'Added' : 'Deducted'} by Admin`, 
    message: `Admin ${isAdd ? 'added' : 'deducted'} ₹${num} ${isAdd ? 'to' : 'from'} your account. New balance: ₹${newBalance}`, 
    type: isAdd ? 'deposit' : 'warning', 
    date: new Date().toISOString(), 
    read: false 
  });
  toast.success(`${action}ed ₹${num} ${isAdd ? 'to' : 'from'} ${user.username}`);
 };

 const handleSuspend = async (user) => {
  const reason = prompt(`Suspend ${user.username}? Reason:`, "Suspicious activity");
  if (reason === null) return;
  if (!reason.trim()) return toast.error('Reason required');
  await update(ref(realtimeDb, `users/${user.uid}`), { isBlocked: true, blockReason: reason, blockedAt: new Date().toISOString() });
  await push(ref(realtimeDb, `notifications/${user.uid}`), { title: 'Account Suspended', message: `Suspended: ${reason}`, type: 'warning', date: new Date().toISOString(), read: false });
  toast.success('Suspended');
 };

 const handleUnban = async (user) => {
  if (!confirm(`Unban ${user.username}?`)) return;
  await update(ref(realtimeDb, `users/${user.uid}`), { isBlocked: false, blockReason: null });
  await push(ref(realtimeDb, `notifications/${user.uid}`), { title: 'Unbanned', message: 'Your account unbanned by admin', type: 'success', date: new Date().toISOString(), read: false });
  toast.success('Unbanned');
 };

 const handleNotify = async (e) => {
  e.preventDefault();
  if (!notifyForm.title || !notifyForm.message) return toast.error('Fill all');
  await push(ref(realtimeDb, `notifications/${showNotify.uid}`), { title: notifyForm.title, message: notifyForm.message, type: 'info', date: new Date().toISOString(), read: false });
  toast.success(`Sent to ${showNotify.username}`);
  setShowNotify(null);
  setNotifyForm({ title: '', message: '' });
 };

 const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));

 return (
  <AdminLayout title={`Users • ${users.length} • MUI`}>
   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
    <Box>
     <Typography variant="h5" fontWeight={900}>Users Management • MUI</Typography>
     <Typography variant="body2" color="text.secondary">Add balance, suspend with reason, unban, single notify</Typography>
    </Box>
    <Chip label={`${users.filter(u=>u.isBlocked).length} Suspended`} color="error" sx={{ fontWeight: 800 }} />
   </Box>

   <TextField placeholder="Search username, email, phone..." value={search} onChange={e=>setSearch(e.target.value)} fullWidth size="small" sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }} />

   <Grid container spacing={2}>
    {filtered.map(u => (
     <Grid item xs={12} md={6} key={u.uid}>
      <Card sx={{ border: u.isBlocked ? '2px solid #EF4444' : undefined, bgcolor: u.isBlocked ? '#FEF2F2' : undefined }}>
       <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
         <Avatar sx={{ width: 48, height: 48, bgcolor: u.isBlocked ? 'error.main' : 'primary.main', fontWeight: 900 }}>{u.username?.charAt(0).toUpperCase()}</Avatar>
         <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
           <Typography variant="subtitle2" fontWeight={900} sx={{ fontSize: 14 }}>{u.username}</Typography>
           <Chip label={u.myReferCode} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
           {u.isBlocked && <Chip label="SUSPENDED" color="error" size="small" sx={{ height: 20, fontSize: 9, fontWeight: 900 }} />}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, display: 'block', mt: 0.3 }}>{u.email} • {u.phone}</Typography>
          <Stack direction="row" spacing={0.8} sx={{ mt: 1 }}>
           <Chip label={`Bal ₹${Math.floor(u.balance||0)}`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: 'grey.900', color: 'white' }} />
           <Chip label={`Earn ₹${Math.floor(u.totalEarning||0)}`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
          </Stack>
         </Box>
        </Box>

        {u.isBlocked && u.blockReason && (
         <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
          <strong>Suspended:</strong> {u.blockReason}
         </Alert>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap">
         <Button size="small" variant="contained" color="success" startIcon={<Add />} onClick={()=>handleAddBalance(u, true)} sx={{ fontWeight: 800, fontSize: 11 }}>+ Add</Button>
         <Button size="small" variant="outlined" color="warning" startIcon={<Remove />} onClick={()=>handleAddBalance(u, false)} sx={{ fontWeight: 800, fontSize: 11 }}>- Deduct</Button>
         <Button size="small" variant="outlined" startIcon={<Message />} onClick={()=>setShowNotify(u)} sx={{ fontWeight: 800, fontSize: 11 }}>Notify</Button>
         {u.isBlocked ? (
          <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={()=>handleUnban(u)} sx={{ fontWeight: 800, fontSize: 11 }}>Unban</Button>
         ) : (
          <Button size="small" variant="outlined" color="error" startIcon={<Block />} onClick={()=>handleSuspend(u)} sx={{ fontWeight: 800, fontSize: 11 }}>Suspend</Button>
         )}
        </Stack>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

   <Dialog open={!!showNotify} onClose={()=>setShowNotify(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ fontWeight: 900 }}>Send Notification to {showNotify?.username}</DialogTitle>
    <DialogContent>
     <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <TextField label="Title" value={notifyForm.title} onChange={e=>setNotifyForm({...notifyForm, title: e.target.value})} fullWidth size="small" required />
      <TextField label="Message" value={notifyForm.message} onChange={e=>setNotifyForm({...notifyForm, message: e.target.value})} fullWidth size="small" multiline rows={3} required />
     </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2.5 }}>
     <Button onClick={()=>setShowNotify(null)}>Cancel</Button>
     <Button variant="contained" onClick={handleNotify}>Send Notification</Button>
    </DialogActions>
   </Dialog>
  </AdminLayout>
 );
}
