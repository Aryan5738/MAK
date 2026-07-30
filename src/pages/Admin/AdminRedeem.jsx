import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, push, update, remove, get } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Avatar, Grid, IconButton, Stack, LinearProgress, Divider } from '@mui/material';
import { Add, Delete, CardGiftcard, ContentCopy, Send, Visibility, Person } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminRedeem() {
  const [codes, setCodes] = useState([]);
  const [users, setUsers] = useState({});
  const [open, setOpen] = useState(false);
  const [showToUser, setShowToUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [form, setForm] = useState({ code: '', amount: '', maxUses: '1' });

  useEffect(() => {
    const codesRef = ref(realtimeDb, 'redeemCodes');
    const usersRef = ref(realtimeDb, 'users');
    const unsubCodes = onValue(codesRef, snap => { 
      if(snap.exists()) setCodes(Object.entries(snap.val()).map(([id,v])=>({id,...v})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); 
      else setCodes([]); 
    });
    const unsubUsers = onValue(usersRef, snap => { if(snap.exists()) setUsers(snap.val()); });
    return () => { unsubCodes(); unsubUsers(); };
  }, []);

  const generateRandom = () => `CASIO${Math.random().toString(36).substring(2,7).toUpperCase()}`;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.code || !form.amount) return toast.error('Fill all');
    const id = push(ref(realtimeDb, 'redeemCodes')).key;
    await update(ref(realtimeDb, `redeemCodes/${id}`), { 
      id, 
      code: form.code.toUpperCase(), 
      amount: Number(form.amount), 
      maxUses: Number(form.maxUses)||1, 
      usedCount: 0, 
      isActive: true, 
      createdAt: new Date().toISOString(),
      price: Number(form.amount) // price = amount for display
    });
    setForm({ code: '', amount: '', maxUses: '1' });
    setOpen(false);
    toast.success(`Code ${form.code} created - Price ₹${form.amount}`);
  };

  const handleShowToUser = async (code, userId) => {
    if (!userId) return toast.error('Select user');
    const user = users[userId];
    if (!user) return toast.error('User not found');

    // Send notification with code to specific user
    await push(ref(realtimeDb, `notifications/${userId}`), {
      title: 'Gift Code Received!',
      message: `Admin sent you a gift code: ${code.code} - Worth ₹${code.amount}. Go to Profile > Redeem Code to use it!`,
      type: 'gift',
      code: code.code,
      amount: code.amount,
      date: new Date().toISOString(),
      read: false,
    });

    // Also add to user's assigned codes
    await push(ref(realtimeDb, `users/${userId}/assignedCodes`), {
      code: code.code,
      amount: code.amount,
      assignedAt: new Date().toISOString(),
      assignedBy: 'admin',
      redeemed: false,
    });

    toast.success(`Code ${code.code} (₹${code.amount}) shown to ${user.username} (${user.email}) via notification`);
    setShowToUser(null);
    setUserSearch('');
  };

  const filteredUsers = Object.entries(users)
    .filter(([uid, u]) => 
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch)
    )
    .slice(0, 10);

  return (
    <AdminLayout title={`Redeem Codes • ${codes.length} • MUI • Show to User`}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900}>Redeem Codes • Gift Cards • Send to User</Typography>
          <Typography variant="body2" color="text.secondary">Create codes, show price, send directly to specific user via notification</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={()=>{ setForm({...form, code: generateRandom()}); setOpen(true); }} sx={{ fontWeight: 900, borderRadius: 3 }}>Create Code</Button>
      </Box>

      <Grid container spacing={2.5}>
        {codes.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card sx={{ height: '100%', border: c.isActive ? '2px solid #0FB86F' : '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: c.isActive ? '#0FB86F' : 'grey.300' }} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'grey.900', fontWeight: 900, width: 52, height: 52, fontSize: 16 }}>₹{c.amount}</Avatar>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={()=>{navigator.clipboard.writeText(c.code); toast.success(`Copied ${c.code}`);}} sx={{ bgcolor: 'grey.100' }}><ContentCopy fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={async()=>{ if(confirm(`Delete code ${c.code}?`)) await remove(ref(realtimeDb, `redeemCodes/${c.id}`)); }} sx={{ bgcolor: 'error.lighter' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle1" fontWeight={900} sx={{ fontFamily: 'monospace', letterSpacing: 1, fontSize: 16 }}>{c.code}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Price: ₹${c.amount}`} size="small" sx={{ bgcolor: 'grey.900', color: 'white', fontWeight: 900, fontSize: 11 }} />
                  <Chip label={c.isActive?'ACTIVE':'INACTIVE'} size="small" color={c.isActive?'success':'default'} sx={{ fontWeight: 800, fontSize: 10 }} />
                  <Chip label={`${c.usedCount||0}/${c.maxUses||1} used`} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 10 }} />
                </Box>

                <Box sx={{ mt: 2, bgcolor: 'grey.50', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={800} sx={{ fontSize: 10, letterSpacing: 0.8, color: 'text.secondary' }}>REDEEM DETAILS</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, mt: 0.5 }}><strong>Code:</strong> {c.code}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12 }}><strong>Price/Worth:</strong> ₹{c.amount}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Created: {new Date(c.createdAt).toLocaleDateString()}</Typography>
                </Box>

                <LinearProgress variant="determinate" value={Math.min(100, ((c.usedCount||0)/(c.maxUses||1))*100)} sx={{ mt: 2, height: 6, borderRadius: 2 }} />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant="contained" color="primary" startIcon={<Visibility />} onClick={()=>setShowToUser(c)} fullWidth sx={{ fontWeight: 800, fontSize: 11 }}>
                    Show to User
                  </Button>
                  <Button size="small" variant="outlined" onClick={async()=>{ await update(ref(realtimeDb, `redeemCodes/${c.id}`), { isActive: !c.isActive }); toast.success(c.isActive?'Deactivated':'Activated'); }} sx={{ fontWeight: 800, fontSize: 11 }}>
                    {c.isActive?'Disable':'Enable'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {codes.length===0 && (
        <Card sx={{ mt: 3, p: 4, textAlign: 'center' }}>
          <CardGiftcard sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography fontWeight={700}>No redeem codes</Typography>
          <Typography variant="body2" color="text.secondary">Create gift codes with price and send to specific users</Typography>
        </Card>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Create Gift Code • Price • MUI</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Code (e.g., CASIO100)" value={form.code} onChange={e=>setForm({...form, code: e.target.value.toUpperCase()})} fullWidth size="small" required sx={{ fontFamily: 'monospace', fontWeight: 900 }} />
              <Button onClick={()=>setForm({...form, code: generateRandom()})} variant="outlined" size="small" sx={{ whiteSpace: 'nowrap', fontWeight: 800 }}>Random</Button>
            </Box>
            <TextField label="Price / Worth Amount ₹ (e.g., 500)" type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} fullWidth size="small" required helperText="This amount will be added to user's wallet on redeem" />
            <TextField label="Max Uses (1 = single use)" type="number" value={form.maxUses} onChange={e=>setForm({...form, maxUses: e.target.value})} fullWidth size="small" required />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} startIcon={<CardGiftcard />} sx={{ fontWeight: 900 }}>Create Code with Price</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!showToUser} onClose={()=>{setShowToUser(null); setUserSearch('');}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send /> Show Code {showToUser?.code} (₹{showToUser?.amount}) to User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
              <Typography variant="subtitle2" fontWeight={900} sx={{ fontFamily: 'monospace' }}>{showToUser?.code} • ₹{showToUser?.amount}</Typography>
              <Typography variant="caption" color="text.secondary">This code will be sent via notification to selected user and shown in their assigned codes</Typography>
            </Box>
            
            <TextField label="Search User by Name, Email, Phone" value={userSearch} onChange={e=>setUserSearch(e.target.value)} fullWidth size="small" placeholder="Type username or email..." />

            <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              {filteredUsers.length===0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Person sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No users found. Type to search.</Typography>
                </Box>
              ) : (
                filteredUsers.map(([uid, u]) => (
                  <Box key={uid} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'grey.50' }, cursor: 'pointer' }} onClick={()=>handleShowToUser(showToUser, uid)}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 800, fontSize: 14 }}>{u.username?.charAt(0).toUpperCase()}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 13 }}>{u.username}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{u.email} • {u.phone} • Bal ₹{Math.floor(u.balance||0)}</Typography>
                    </Box>
                    <Button size="small" variant="contained" sx={{ fontWeight: 800, fontSize: 11 }}>Send Code</Button>
                  </Box>
                ))
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              User will receive notification with code and can redeem from Profile → Redeem Code. Code: {showToUser?.code} worth ₹{showToUser?.amount} will be shown to them.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={()=>{setShowToUser(null); setUserSearch('');}}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
