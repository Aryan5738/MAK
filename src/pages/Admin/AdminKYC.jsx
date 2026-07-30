import { useEffect, useState } from 'react';
import { realtimeDb, ref, onValue, update, get, push } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Card, CardContent, Typography, Box, TextField, Button, Chip, Avatar, Grid, IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Divider, Alert } from '@mui/material';
import { Add, Delete, VerifiedUser, Pending, Block, CheckCircle, Person, Badge, CreditCard } from '@mui/icons-material';
import { toast } from 'sonner';

export default function AdminKYC() {
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [kycFields, setKycFields] = useState([]);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [fieldForm, setFieldForm] = useState({ label: '', type: 'text', required: true, placeholder: '' });

  useEffect(() => {
    const usersRef = ref(realtimeDb, 'users');
    const fieldsRef = ref(realtimeDb, 'settings/kycFields');

    const unsubUsers = onValue(usersRef, snap => {
      if (snap.exists()) {
        const allUsers = snap.val();
        const submissions = Object.entries(allUsers)
          .filter(([_, u]) => u.kyc)
          .map(([uid, u]) => ({ uid, ...u, kyc: u.kyc }))
          .sort((a,b) => new Date(b.kyc.submittedAt || 0) - new Date(a.kyc.submittedAt || 0));
        setKycSubmissions(submissions);
      } else setKycSubmissions([]);
    });

    const unsubFields = onValue(fieldsRef, snap => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Array.isArray(data) ? data : Object.values(data);
        setKycFields(list);
      } else {
        // Default fields
        setKycFields([
          { id: 'fullName', label: 'Full Name as per Aadhar', type: 'text', required: true, placeholder: 'Enter full name' },
          { id: 'aadhar', label: 'Aadhar Number (12 digits)', type: 'number', required: true, placeholder: '123456789012' },
          { id: 'pan', label: 'PAN Number (10 chars)', type: 'text', required: false, placeholder: 'ABCDE1234F' },
          { id: 'aadharFrontUrl', label: 'Aadhar Front Image URL', type: 'image', required: false, placeholder: 'https://.../aadhar-front.jpg' },
          { id: 'panFrontUrl', label: 'PAN Front Image URL', type: 'image', required: false, placeholder: 'https://.../pan.jpg' },
        ]);
      }
    });

    return () => { unsubUsers(); unsubFields(); };
  }, []);

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!fieldForm.label) return toast.error('Label required');
    
    const newField = {
      id: fieldForm.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      label: fieldForm.label,
      type: fieldForm.type,
      required: fieldForm.required,
      placeholder: fieldForm.placeholder || fieldForm.label,
    };

    const updatedFields = [...kycFields, newField];
    await update(ref(realtimeDb, 'settings'), { kycFields: updatedFields });
    setFieldForm({ label: '', type: 'text', required: true, placeholder: '' });
    setShowFieldDialog(false);
    toast.success(`KYC field "${newField.label}" added`);
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Delete this KYC field?')) return;
    const updated = kycFields.filter(f => f.id !== fieldId);
    await update(ref(realtimeDb, 'settings'), { kycFields: updated });
    toast.success('Field deleted');
  };

  const handleApprove = async (user) => {
    if (!confirm(`Approve KYC for ${user.username}?`)) return;
    await update(ref(realtimeDb, `users/${user.uid}/kyc`), { 
      status: 'approved', 
      approvedAt: new Date().toISOString(),
      approvedBy: 'admin'
    });
    await push(ref(realtimeDb, `notifications/${user.uid}`), {
      title: 'KYC Approved!',
      message: 'Your KYC verification approved. You can now withdraw real money.',
      type: 'success',
      date: new Date().toISOString(),
      read: false,
    });
    toast.success(`KYC approved for ${user.username}`);
  };

  const handleReject = async (user) => {
    const reason = prompt(`Reject KYC for ${user.username}? Enter reason:`, "Documents not clear, re-upload");
    if (reason === null) return;
    if (!reason.trim()) return toast.error('Reason required');
    
    await update(ref(realtimeDb, `users/${user.uid}/kyc`), { 
      status: 'rejected', 
      rejectReason: reason,
      rejectedAt: new Date().toISOString(),
    });
    await push(ref(realtimeDb, `notifications/${user.uid}`), {
      title: 'KYC Rejected',
      message: `Your KYC rejected: ${reason}. Please resubmit.`,
      type: 'warning',
      date: new Date().toISOString(),
      read: false,
    });
    toast.success('KYC rejected');
  };

  return (
    <AdminLayout title={`KYC Verification • ${kycSubmissions.length} • Dynamic Fields`}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900}>KYC Management • Dynamic Fields • MUI</Typography>
          <Typography variant="body2" color="text.secondary">Admin can create text, Aadhar, PAN, image fields and approve submissions</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={()=>setShowFieldDialog(true)} sx={{ fontWeight: 900 }}>Add KYC Field</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={900} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge /> KYC Fields Configuration (Dynamic)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Admin can create fields like text, Aadhar card, PAN card, image URL etc. These fields will show in user KYC form.
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {kycFields.map(field => (
                <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: field.type==='image' ? 'info.main' : field.type==='number' ? 'warning.main' : 'primary.main', fontSize: 14 }}>
                    {field.type==='image' ? '🖼️' : field.type==='number' ? '#' : 'T'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>{field.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{field.type} • {field.required ? 'Required' : 'Optional'} • ID: {field.id}</Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={()=>handleDeleteField(field.id)}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
            </Stack>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: 12 }}>
              Default fields: Full Name, Aadhar, PAN, Aadhar Front URL, PAN URL. You can add more like Address, Selfie URL, Bank Proof etc.
            </Alert>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`Total: ${kycSubmissions.length}`} sx={{ fontWeight: 800 }} />
            <Chip label={`Pending: ${kycSubmissions.filter(k=>k.kyc.status==='pending').length}`} color="warning" sx={{ fontWeight: 800 }} />
            <Chip label={`Approved: ${kycSubmissions.filter(k=>k.kyc.status==='approved').length}`} color="success" sx={{ fontWeight: 800 }} />
            <Chip label={`Rejected: ${kycSubmissions.filter(k=>k.kyc.status==='rejected').length}`} color="error" sx={{ fontWeight: 800 }} />
          </Box>

          <Stack spacing={2}>
            {kycSubmissions.map(user => (
              <Card key={user.uid} sx={{ border: user.kyc.status==='pending' ? '2px solid #F59E0B' : user.kyc.status==='approved' ? '2px solid #10B981' : '1px solid #E2E8F0' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 900 }}>{user.username?.charAt(0).toUpperCase()}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={900}>{user.username} • {user.phone}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email} • Submitted: {user.kyc.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString() : '-'}</Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip label={user.kyc.status.toUpperCase()} size="small" color={user.kyc.status==='approved'?'success':user.kyc.status==='pending'?'warning':'error'} sx={{ height: 20, fontSize: 10, fontWeight: 900 }} />
                          {user.kyc.aadhar && <Chip label={`Aadhar: ${user.kyc.aadhar.substring(0,4)}****`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                          {user.kyc.pan && <Chip label={`PAN: ${user.kyc.pan}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                        </Box>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: user.kyc.status==='approved' ? 'success.main' : user.kyc.status==='pending' ? 'warning.main' : 'error.main', width: 32, height: 32 }}>
                      {user.kyc.status==='approved' ? <CheckCircle fontSize="small" /> : user.kyc.status==='pending' ? <Pending fontSize="small" /> : <Block fontSize="small" />}
                    </Avatar>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="overline" sx={{ fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>KYC DETAILS SUBMITTED BY USER</Typography>
                  
                  <Grid container spacing={1.5} sx={{ mt: 1 }}>
                    {Object.entries(user.kyc).filter(([k])=>!['status','submittedAt','approvedAt','rejectedAt','rejectReason','approvedBy'].includes(k)).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{key}</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, mt: 0.3, wordBreak: 'break-all' }}>
                            {key.toLowerCase().includes('url') || key.toLowerCase().includes('image') ? (
                              <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#0FB86F', wordBreak: 'break-all' }}>{value}</a>
                            ) : value}
                          </Typography>
                          {key.toLowerCase().includes('url') && value && (
                            <Box sx={{ mt: 1, width: '100%', height: 80, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                              <img src={value} alt={key} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>e.target.style.display='none'} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {user.kyc.status==='rejected' && user.kyc.rejectReason && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2, fontSize: 12 }}>
                      <strong>Rejected Reason:</strong> {user.kyc.rejectReason}
                    </Alert>
                  )}

                  {user.kyc.status==='pending' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={()=>handleApprove(user)} fullWidth sx={{ fontWeight: 900 }}>Approve KYC</Button>
                      <Button variant="outlined" color="error" startIcon={<Block />} onClick={()=>handleReject(user)} fullWidth sx={{ fontWeight: 800 }}>Reject with Reason</Button>
                    </Stack>
                  )}

                  {user.kyc.status!=='pending' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={()=>handleApprove(user)} disabled={user.kyc.status==='approved'}>Approve</Button>
                      <Button size="small" variant="outlined" color="error" onClick={()=>handleReject(user)} disabled={user.kyc.status==='rejected'}>Reject</Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {kycSubmissions.length===0 && (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography fontWeight={700}>No KYC submissions</Typography>
                <Typography variant="body2" color="text.secondary">Users KYC will appear here for approval</Typography>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={showFieldDialog} onClose={()=>setShowFieldDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Add New KYC Field • Dynamic</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Field Label (e.g., Aadhar Card, PAN Card, Selfie URL, Address)" value={fieldForm.label} onChange={e=>setFieldForm({...fieldForm, label: e.target.value})} fullWidth size="small" required placeholder="e.g., Aadhar Front Image" />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={fieldForm.type} onChange={e=>setFieldForm({...fieldForm, type: e.target.value})} label="Type">
                <MenuItem value="text">Text (Name, Address)</MenuItem>
                <MenuItem value="number">Number (Aadhar 12 digits)</MenuItem>
                <MenuItem value="image">Image URL (Aadhar/PAN photo)</MenuItem>
                <MenuItem value="file">File Upload (Future)</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Placeholder" value={fieldForm.placeholder} onChange={e=>setFormField=>setFieldForm({...fieldForm, placeholder: e.target.value})} fullWidth size="small" placeholder="e.g., https://... or 1234..." />
            <Typography variant="caption" color="text.secondary">This field will appear in user KYC form dynamically</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={()=>setShowFieldDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddField}>Add Field</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
