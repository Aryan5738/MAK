import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, push, update, remove, get } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, IconButton, Stack, Avatar } from '@mui/material';
import { Add, Delete, Campaign, Image, ShoppingBag, Send, People } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminAnnouncements() {
 const [announcements, setAnnouncements] = useState([]);
 const [plans, setPlans] = useState([]);
 const [open, setOpen] = useState(false);
 const [form, setForm] = useState({ title: '', message: '', type: 'default', imageUrl: '', actionLabel: '', actionLink: '' });
 const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });

 useEffect(() => {
  const annRef = ref(realtimeDb, 'announcements');
  const plansRef = ref(realtimeDb, 'plans');
  const unsubAnn = onValue(annRef, snap => { if(snap.exists()) setAnnouncements(Object.entries(snap.val()).map(([id,v])=>({id,...v})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); else setAnnouncements([]); });
  const unsubPlans = onValue(plansRef, snap => { if(snap.exists()) setPlans(Object.entries(snap.val()).map(([id,v])=>({id,...v}))); });
  return () => { unsubAnn(); unsubPlans(); };
 }, []);

 const handleAdd = async (e) => {
  e.preventDefault();
  if (!form.title || !form.message) return toast.error('Fill all');
  const id = push(ref(realtimeDb, 'announcements')).key;
  await update(ref(realtimeDb, `announcements/${id}`), { id, title: form.title, message: form.message, type: form.type, imageUrl: form.imageUrl||null, actionLabel: form.actionLabel||null, actionLink: form.actionLink||null, isActive: true, createdAt: new Date().toISOString() });
  setForm({ title: '', message: '', type: 'default', imageUrl: '', actionLabel: '', actionLink: '' });
  setOpen(false);
  toast.success('Announcement created! Popup 7sec auto-remove');
 };

 const handleBroadcast = async (e) => {
  e.preventDefault();
  if (!broadcastForm.title || !broadcastForm.message) return toast.error('Fill all');
  const usersSnap = await get(ref(realtimeDb, 'users'));
  if (!usersSnap.exists()) return toast.error('No users');
  const users = Object.keys(usersSnap.val());
  for (let uid of users) {
   await push(ref(realtimeDb, `notifications/${uid}`), { title: broadcastForm.title, message: broadcastForm.message, type: 'announcement', date: new Date().toISOString(), read: false });
  }
  toast.success(`Broadcast to ${users.length} users`);
  setBroadcastForm({ title: '', message: '' });
 };

 return (
  <AdminLayout title={`Announcements • ${announcements.length} • MUI`}>
   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Box>
     <Typography variant="h5" fontWeight={900}>Announcements • MUI Premium Popup</Typography>
     <Typography variant="body2" color="text.secondary">7sec auto-remove + image + buy button + close • Framer Motion</Typography>
    </Box>
    <Button variant="contained" startIcon={<Add />} onClick={()=>setOpen(true)} sx={{ fontWeight: 900 }}>New Popup</Button>
   </Box>

   <Grid container spacing={3}>
    <Grid item xs={12} md={5}>
     <Card sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" fontWeight={900} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><People fontSize="small" /> Broadcast to All Users</Typography>
      <Box component="form" onSubmit={handleBroadcast} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
       <TextField label="Title" value={broadcastForm.title} onChange={e=>setBroadcastForm({...broadcastForm, title: e.target.value})} size="small" fullWidth required />
       <TextField label="Message" value={broadcastForm.message} onChange={e=>setBroadcastForm({...broadcastForm, message: e.target.value})} size="small" fullWidth multiline rows={3} required />
       <Button type="submit" variant="contained" startIcon={<Send />} sx={{ fontWeight: 900 }}>Broadcast to All</Button>
      </Box>
     </Card>
    </Grid>

    <Grid item xs={12} md={7}>
     <Stack spacing={2}>
      {announcements.map(ann => (
       <Card key={ann.id} sx={{ border: ann.isActive ? '2px solid #0FB86F' : undefined }}>
        <CardContent sx={{ p: 2 }}>
         <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={ann.imageUrl} sx={{ width: 48, height: 48, bgcolor: 'grey.200' }}>{!ann.imageUrl && <Campaign />}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
           <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={900}>{ann.title}</Typography>
            <Chip label={ann.isActive?'LIVE POPUP':'INACTIVE'} size="small" color={ann.isActive?'success':'default'} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />
            <Chip label={ann.type.toUpperCase()} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: 'grey.900', color: 'white' }} />
           </Box>
           <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>{ann.message}</Typography>
           {ann.actionLabel && <Chip icon={<ShoppingBag sx={{ fontSize: 14 }} />} label={`${ann.actionLabel} → ${ann.actionLink}`} size="small" sx={{ mt: 1, fontWeight: 700, fontSize: 11 }} />}
           <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: 10 }}>{new Date(ann.createdAt).toLocaleString()} • 7sec auto + close + image</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
           <Button size="small" variant="outlined" onClick={async()=>{ await update(ref(realtimeDb, `announcements/${ann.id}`), { isActive: !ann.isActive }); }}>{ann.isActive?'⏸️':'▶️'}</Button>
           <IconButton size="small" color="error" onClick={async()=>{ if(confirm('Delete?')) await remove(ref(realtimeDb, `announcements/${ann.id}`)); }}><Delete fontSize="small" /></IconButton>
          </Box>
         </Box>
        </CardContent>
       </Card>
      ))}
     </Stack>
    </Grid>
   </Grid>

   <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ fontWeight: 900 }}>Create Premium Popup • MUI</DialogTitle>
    <DialogContent>
     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <TextField label="Title *" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} fullWidth size="small" required />
      <TextField label="Message *" value={form.message} onChange={e=>setForm({...form, message: e.target.value})} fullWidth size="small" multiline rows={3} required />
      <TextField label="Image URL (Optional)" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl: e.target.value})} fullWidth size="small" placeholder="https://..." InputProps={{ startAdornment: <Image sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }} />
      {form.imageUrl && <Box sx={{ width: '100%', height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}><img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Box>}
      <Box sx={{ display: 'flex', gap: 2 }}>
       <TextField label="Button Label (e.g., Buy Now)" value={form.actionLabel} onChange={e=>setForm({...form, actionLabel: e.target.value})} fullWidth size="small" placeholder="Buy Plan - ₹200" />
       <TextField label="Button Link" value={form.actionLink} onChange={e=>setForm({...form, actionLink: e.target.value})} fullWidth size="small" placeholder="/plans/1" />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
       {['default','gift','warning','info'].map(t => (
        <Chip key={t} label={t.toUpperCase()} onClick={()=>setForm({...form, type: t})} color={form.type===t?'primary':'default'} variant={form.type===t?'filled':'outlined'} sx={{ fontWeight: 800, fontSize: 11, flex: 1, justifyContent: 'center' }} />
       ))}
      </Box>
     </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2.5 }}>
     <Button onClick={()=>setOpen(false)}>Cancel</Button>
     <Button variant="contained" onClick={handleAdd}>Create Popup</Button>
    </DialogActions>
   </Dialog>
  </AdminLayout>
 );
}
