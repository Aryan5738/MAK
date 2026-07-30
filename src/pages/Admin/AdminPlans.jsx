import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, push, update, remove } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Grid, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Chip, Avatar, IconButton, Stack } from '@mui/material';
import { Add, Delete, Edit, Inventory, TrendingUp } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminPlans() {
 const [plans, setPlans] = useState([]);
 const [open, setOpen] = useState(false);
 const [form, setForm] = useState({ title: '', image: '', price: '', dailyProfit: '', totalDays: '', totalProfit: '' });

 useEffect(() => {
  const plansRef = ref(realtimeDb, 'plans');
  const unsub = onValue(plansRef, (snap) => {
   if (snap.exists()) setPlans(Object.entries(snap.val()).map(([id, v])=>({ id, ...v })));
   else setPlans([]);
  });
  return () => unsub();
 }, []);

 const handleAdd = async (e) => {
  e.preventDefault();
  const id = push(ref(realtimeDb, 'plans')).key;
  await update(ref(realtimeDb, `plans/${id}`), {
   id, title: form.title, image: form.image || `https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=60`,
   price: Number(form.price), dailyProfit: Number(form.dailyProfit), totalDays: Number(form.totalDays), totalProfit: Number(form.totalProfit),
   isActive: true, createdAt: new Date().toISOString()
  });
  setForm({ title: '', image: '', price: '', dailyProfit: '', totalDays: '', totalProfit: '' });
  setOpen(false);
  toast.success('Plan added!');
 };

 const handleDelete = async (id) => {
  if (!confirm('Delete plan?')) return;
  await remove(ref(realtimeDb, `plans/${id}`));
  toast.success('Deleted');
 };

 return (
  <AdminLayout title="Manage Plans • MUI">
   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Box>
     <Typography variant="h5" fontWeight={900}>Investment Plans • {plans.length}</Typography>
     <Typography variant="body2" color="text.secondary">MUI Premium • Add ROI plans like Price 200 Daily 228 Total 1600</Typography>
    </Box>
    <Button variant="contained" startIcon={<Add />} onClick={()=>setOpen(true)} sx={{ borderRadius: 3, fontWeight: 900 }}>Add Plan</Button>
   </Box>

   <Grid container spacing={2.5}>
    {plans.map(p => (
     <Grid item xs={12} sm={6} md={4} key={p.id}>
      <Card sx={{ height: '100%', overflow: 'hidden' }}>
       <Box sx={{ height: 160, position: 'relative', bgcolor: 'grey.100' }}>
        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Chip label={`${Math.round(p.totalProfit/p.price*100)}% ROI`} size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'white', fontWeight: 800, fontSize: 11 }} />
        <Chip label={`${p.totalDays} Days`} size="small" color="primary" sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 800, fontSize: 10 }} />
       </Box>
       <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={900} sx={{ fontSize: 14, lineHeight: 1.2, mb: 1 }}>{p.title}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
         <Chip label={`₹${p.price}`} size="small" sx={{ fontWeight: 800, fontSize: 11 }} />
         <Chip label={`₹${p.dailyProfit}/day`} size="small" color="success" variant="outlined" sx={{ fontWeight: 800, fontSize: 11 }} />
         <Chip label={`Total ₹${p.totalProfit}`} size="small" sx={{ bgcolor: 'grey.900', color: 'white', fontWeight: 800, fontSize: 11 }} />
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
         <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{p.id.substring(0,12)}...</Typography>
         <IconButton size="small" color="error" onClick={()=>handleDelete(p.id)} sx={{ bgcolor: 'error.lighter' }}><Delete fontSize="small" /></IconButton>
        </Box>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

   {plans.length===0 && (
    <Card sx={{ mt: 3, p: 4, textAlign: 'center' }}>
     <Inventory sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
     <Typography fontWeight={700}>No plans yet</Typography>
     <Typography variant="body2" color="text.secondary">Add Price 200, Daily 228, Days 7, Total 1600</Typography>
    </Card>
   )}

   <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ fontWeight: 900 }}>Add Investment Plan • MUI</DialogTitle>
    <DialogContent>
     <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <TextField label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required fullWidth size="small" placeholder="Casio Starter Plan" />
      <TextField label="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} fullWidth size="small" placeholder="Unsplash link" />
      <Box sx={{ display: 'flex', gap: 2 }}>
       <TextField label="Price - 200" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required fullWidth size="small" />
       <TextField label="Daily Profit - 228" type="number" value={form.dailyProfit} onChange={e=>setForm({...form,dailyProfit:e.target.value})} required fullWidth size="small" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
       <TextField label="Total Days - 7" type="number" value={form.totalDays} onChange={e=>setForm({...form,totalDays:e.target.value})} required fullWidth size="small" />
       <TextField label="Total Profit - 1600" type="number" value={form.totalProfit} onChange={e=>setForm({...form,totalProfit:e.target.value})} required fullWidth size="small" />
      </Box>
     </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2.5 }}>
     <Button onClick={()=>setOpen(false)}>Cancel</Button>
     <Button variant="contained" onClick={handleAdd} startIcon={<TrendingUp />}>Add Plan</Button>
    </DialogActions>
   </Dialog>
  </AdminLayout>
 );
}
