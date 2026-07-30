import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, realtimeDb, ref, get, set } from '../../firebase';
import { ThemeProvider, createTheme, CssBaseline, Box, Card, CardContent, TextField, Button, Typography, Avatar, Chip, Alert } from '@mui/material';
import { Shield, Lock } from '@mui/icons-material';

const theme = createTheme({
 palette: { mode: 'light', primary: { main: '#0FB86F' }, background: { default: '#F8FDF9' } },
 typography: { fontFamily: '"Outfit", sans-serif', button: { textTransform: 'none', fontWeight: 700 } },
 shape: { borderRadius: 16 }
});

export default function AdminLogin() {
 const [form, setForm] = useState({ email: '', password: '' });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
   const cred = await loginUser(form.email, form.password);
   const uid = cred.user.uid;
   const adminSnap = await get(ref(realtimeDb, `admins/${uid}`));
   const isAdminEmail = form.email.toLowerCase() === 'admin@casio.com' || form.email.toLowerCase().includes('admin');
   if (!adminSnap.exists() && !isAdminEmail) {
    const allAdminsSnap = await get(ref(realtimeDb, 'admins'));
    if (!allAdminsSnap.exists()) {
     await set(ref(realtimeDb, `admins/${uid}`), true);
     navigate('/admin');
     return;
    } else {
     setError('You are not admin!');
     return;
    }
   }
   navigate('/admin');
  } catch (err) {
   setError(err.message);
  } finally {
   setLoading(false);
  }
 };

 return (
  <ThemeProvider theme={theme}>
   <CssBaseline />
   <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
    <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
     <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
       <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 2, boxShadow: '0 8px 24px rgba(15,184,111,0.3)' }}>
        <Shield />
       </Avatar>
       <Typography variant="h5" fontWeight={900}>MUI Admin Login</Typography>
       <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>Modern Material UI • Premium • Secure</Typography>
       <Chip label="First admin auto-created" size="small" sx={{ mt: 1.5, fontWeight: 700, fontSize: 11 }} color="primary" variant="outlined" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
       <TextField label="Admin Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required fullWidth size="small" placeholder="admin@casio.com" />
       <TextField label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required fullWidth size="small" />
       <Button type="submit" variant="contained" disabled={loading} size="large" sx={{ mt: 1, py: 1.5, fontWeight: 900 }}>
        {loading ? 'Verifying...' : 'Login to MUI Admin'}
       </Button>
       <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1, fontSize: 11 }}>
        Use admin@casio.com for first time • Auto becomes admin if no admins exist
       </Typography>
      </Box>
     </CardContent>
    </Card>
   </Box>
  </ThemeProvider>
 );
}
