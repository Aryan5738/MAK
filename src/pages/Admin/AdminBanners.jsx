import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, push, update, remove } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Grid, IconButton } from '@mui/material';
import { Add, Delete, ViewCarousel } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminBanners() {
 const [banners, setBanners] = useState([]);
 const [form, setForm] = useState({ imageUrl: '' });

 useEffect(() => {
  const bRef = ref(realtimeDb, 'banners');
  const unsub = onValue(bRef, snap => { if(snap.exists()) setBanners(Object.entries(snap.val()).map(([id,v])=>({id,...v}))); else setBanners([]); });
  return () => unsub();
 }, []);

 const handleAdd = async (e) => {
  e.preventDefault();
  if (!form.imageUrl) return toast.error('Image URL required');
  const id = push(ref(realtimeDb, 'banners')).key;
  await update(ref(realtimeDb, `banners/${id}`), { id, imageUrl: form.imageUrl, createdAt: new Date().toISOString() });
  setForm({ imageUrl: '' });
  toast.success('Banner added');
 };

 return (
  <AdminLayout title="Banners • MUI">
   <Typography variant="h5" fontWeight={900} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ViewCarousel /> Banners / Slider • MUI</Typography>
   <Card sx={{ p: 2, mb: 3 }}>
    <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2 }}>
     <TextField label="Image URL" value={form.imageUrl} onChange={e=>setForm({imageUrl:e.target.value})} fullWidth size="small" placeholder="https://images.unsplash.com/..." />
     <Button type="submit" variant="contained" startIcon={<Add />} sx={{ whiteSpace: 'nowrap', fontWeight: 900 }}>Add Banner</Button>
    </Box>
   </Card>
   <Grid container spacing={2}>
    {banners.map(b => (
     <Grid item xs={12} sm={6} md={4} key={b.id}>
      <Card sx={{ overflow: 'hidden' }}>
       <Box sx={{ height: 160, bgcolor: 'grey.100' }}><img src={b.imageUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Box>
       <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{b.id.substring(0,12)}...</Typography>
        <IconButton size="small" color="error" onClick={async()=>{ if(confirm('Delete?')) await remove(ref(realtimeDb, `banners/${b.id}`)); }}><Delete fontSize="small" /></IconButton>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>
  </AdminLayout>
 );
}
