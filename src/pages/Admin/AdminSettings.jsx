import { useEffect, useState } from 'react';
import { realtimeDb, ref, get, update } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Grid, Avatar, Chip, Divider } from '@mui/material';
import { Save, Settings, CreditCard, People, Image, Title } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminSettings() {
 const [form, setForm] = useState({ appName: 'CASIO', appFullName: 'CASIO Premium', upiId: '', qrCodeUrl: '', logoUrl: '', l1: 20, l2: 5, l3: 2, minDeposit: 100, minWithdraw: 200 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  get(ref(realtimeDb, 'settings')).then(snap => {
   if (snap.exists()) {
    const s = snap.val();
    setForm({
     appName: s.appName || 'CASIO',
     appFullName: s.appFullName || 'CASIO Premium',
     upiId: s.upiId || 'casio@upi',
     qrCodeUrl: s.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=casio@upi',
     logoUrl: s.logoUrl || '',
     l1: s.referral?.l1 || 20,
     l2: s.referral?.l2 || 5,
     l3: s.referral?.l3 || 2,
     minDeposit: s.minDeposit || 100,
     minWithdraw: s.minWithdraw || 200,
    });
   }
   setLoading(false);
  });
 }, []);

 const handleSave = async () => {
  await update(ref(realtimeDb, 'settings'), {
   appName: form.appName,
   appFullName: form.appFullName,
   upiId: form.upiId,
   qrCodeUrl: form.qrCodeUrl,
   logoUrl: form.logoUrl,
   minDeposit: Number(form.minDeposit),
   minWithdraw: Number(form.minWithdraw),
   referral: { l1: Number(form.l1), l2: Number(form.l2), l3: Number(form.l3) }
  });
  toast.success('Settings saved! App name updates everywhere realtime');
 };

 if (loading) return <AdminLayout title="Settings"><Typography>Loading...</Typography></AdminLayout>;

 return (
  <AdminLayout title="App Settings • MUI • Global Name">
   <Typography variant="h5" fontWeight={900} gutterBottom>App Settings • MUI Premium • Global Control</Typography>
   <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Change app name, logo URL, UPI, referral % - updates everywhere instantly via realtime</Typography>

   <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
     <Card>
      <CardContent sx={{ p: 3 }}>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Title color="primary" /><Typography variant="subtitle1" fontWeight={900}>App Branding • Global</Typography>
       </Box>
       <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'primary.100', mb: 2 }}>
        <Typography variant="caption" fontWeight={800} color="primary.main">Change here → Updates TopBar, Profile, Login, Home everywhere instantly</Typography>
       </Box>
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="App Short Name (e.g., CASIO)" value={form.appName} onChange={e=>setForm({...form,appName:e.target.value})} fullWidth size="small" />
        <TextField label="App Full Name" value={form.appFullName} onChange={e=>setForm({...form,appFullName:e.target.value})} fullWidth size="small" />
        <TextField label="Logo URL (Optional Square)" value={form.logoUrl} onChange={e=>setForm({...form,logoUrl:e.target.value})} fullWidth size="small" placeholder="https://...logo.png" InputProps={{ startAdornment: <Image sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} /> }} />
        {form.logoUrl && <Avatar src={form.logoUrl} sx={{ width: 64, height: 64, border: '1px solid #E2E8F0' }} />}
        <Box sx={{ bgcolor: 'grey.900', color: 'white', p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
         <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 900 }}>{form.appName.substring(0,2).toUpperCase()}</Avatar>
         <Box>
          <Typography variant="subtitle2" fontWeight={900}>{form.appName} PREMIUM</Typography>
          <Typography variant="caption" color="grey.400">{form.appFullName} • Preview</Typography>
         </Box>
        </Box>
       </Box>
      </CardContent>
     </Card>
    </Grid>

    <Grid item xs={12} md={6}>
     <Stack spacing={3}>
      <Card>
       <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><CreditCard color="primary" /><Typography variant="subtitle1" fontWeight={900}>UPI Settings </Typography></Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
         <TextField label="UPI ID" value={form.upiId} onChange={e=>setForm({...form,upiId:e.target.value})} fullWidth size="small" />
         <TextField label="QR Code URL" value={form.qrCodeUrl} onChange={e=>setForm({...form,qrCodeUrl:e.target.value})} fullWidth size="small" />
         <Box sx={{ width: 160, height: 160, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0', bgcolor: 'white', p: 1 }}><img src={form.qrCodeUrl} alt="qr" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Box>
        </Box>
       </CardContent>
      </Card>

      <Card>
       <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><People color="secondary" /><Typography variant="subtitle1" fontWeight={900}>Referral % & Limits</Typography></Box>
        <Grid container spacing={2}>
         <Grid item xs={4}><TextField label="L1 % (Direct)" type="number" value={form.l1} onChange={e=>setForm({...form,l1:e.target.value})} fullWidth size="small" /></Grid>
         <Grid item xs={4}><TextField label="L2 %" type="number" value={form.l2} onChange={e=>setForm({...form,l2:e.target.value})} fullWidth size="small" /></Grid>
         <Grid item xs={4}><TextField label="L3 %" type="number" value={form.l3} onChange={e=>setForm({...form,l3:e.target.value})} fullWidth size="small" /></Grid>
         <Grid item xs={6}><TextField label="Min Deposit" type="number" value={form.minDeposit} onChange={e=>setForm({...form,minDeposit:e.target.value})} fullWidth size="small" /></Grid>
         <Grid item xs={6}><TextField label="Min Withdraw" type="number" value={form.minWithdraw} onChange={e=>setForm({...form,minWithdraw:e.target.value})} fullWidth size="small" /></Grid>
        </Grid>
       </CardContent>
      </Card>

      <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} sx={{ py: 1.5, fontWeight: 900, borderRadius: 3 }}>Save All Settings • Update Everywhere</Button>
     </Stack>
    </Grid>
   </Grid>
  </AdminLayout>
 );
}

function Stack({ children, spacing, ...props }) {
 return <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing ? spacing*8 : 16, ...props.sx }} {...props}>{children}</Box>;
}
