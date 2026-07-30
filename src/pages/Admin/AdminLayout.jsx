import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
 ThemeProvider, createTheme, CssBaseline, Box, Drawer, AppBar, Toolbar, 
 List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, 
 IconButton, Avatar, Chip, Divider, Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as PlansIcon,
  People as UsersIcon,
  AccountBalanceWallet as DepositsIcon,
  MoneyOff as WithdrawalsIcon,
  CardGiftcard as RedeemIcon,
  Campaign as AnnouncementsIcon,
  ViewCarousel as BannersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  TrendingUp,
  VerifiedUser,
  Notifications as NotificationsIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { logoutUser } from '../../firebase';

const drawerWidth = 280;

const theme = createTheme({
 palette: {
  mode: 'light',
  primary: { main: '#0FB86F', dark: '#0A8B53', light: '#00E58F', contrastText: '#fff' },
  secondary: { main: '#0F172A' },
  background: { default: '#F8FDF9', paper: '#FFFFFF' },
  success: { main: '#0FB86F' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  text: { primary: '#0F172A', secondary: '#64748B' },
  divider: '#E2E8F0',
 },
 typography: {
  fontFamily: '"Outfit", "Poppins", sans-serif',
  h5: { fontWeight: 800, letterSpacing: '-0.5px' },
  h6: { fontWeight: 800 },
  button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.2px' },
 },
 shape: { borderRadius: 16 },
 components: {
  MuiCard: {
   styleOverrides: {
    root: { borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }
   }
  },
  MuiButton: {
   styleOverrides: {
    root: { borderRadius: 12, padding: '10px 20px', fontWeight: 700 },
    contained: { boxShadow: '0 4px 16px rgba(15,184,111,0.25)', '&:hover': { boxShadow: '0 6px 20px rgba(15,184,111,0.35)' } }
   }
  },
  MuiChip: { styleOverrides: { root: { fontWeight: 700, borderRadius: 8 } } },
  MuiAppBar: { styleOverrides: { root: { boxShadow: '0 1px 12px rgba(0,0,0,0.06)', backdropFilter: 'blur(12px)' } } },
 }
});

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin', badge: null },
  { id: 'plans', label: 'Manage Plans', icon: PlansIcon, path: '/admin/plans', badge: null },
  { id: 'users', label: 'Users & Suspend', icon: UsersIcon, path: '/admin/users', badge: 'Live' },
  { id: 'kyc', label: 'KYC Verification', icon: BadgeIcon, path: '/admin/kyc', badge: 'Aadhar PAN', color: 'info' },
  { id: 'deposits', label: 'Deposits', icon: DepositsIcon, path: '/admin/deposits', badge: 'Pending', color: 'warning' },
  { id: 'withdrawals', label: 'Withdrawals', icon: WithdrawalsIcon, path: '/admin/withdrawals', badge: 'Bank', color: 'error' },
  { id: 'redeem', label: 'Redeem Codes', icon: RedeemIcon, path: '/admin/redeem', badge: 'Gift' },
  { id: 'announcements', label: 'Announcements', icon: AnnouncementsIcon, path: '/admin/announcements', badge: 'Pop 7s' },
  { id: 'banners', label: 'Banners', icon: BannersIcon, path: '/admin/banners', badge: null },
  { id: 'settings', label: 'App Settings', icon: SettingsIcon, path: '/admin/settings', badge: 'Name' },
];

export default function AdminLayout({ children, title = 'Admin Panel' }) {
 const [mobileOpen, setMobileOpen] = useState(false);
 const navigate = useNavigate();
 const location = useLocation();
 const { settings } = useApp();

 const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

 const handleLogout = async () => {
  await logoutUser();
  navigate('/admin/login');
 };

 const drawer = (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
   <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontWeight: 900, fontSize: 18 }}>
     {settings.appName?.substring(0,2).toUpperCase()}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
     <Typography variant="h6" sx={{ fontSize: 16, lineHeight: 1.2, fontWeight: 900 }}>{settings.appName} Admin</Typography>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
      <VerifiedUser sx={{ fontSize: 12, color: 'primary.main' }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>PREMIUM • VERIFIED</Typography>
     </Box>
    </Box>
    <Chip label="LIVE" size="small" color="success" sx={{ height: 20, fontSize: 10, fontWeight: 900 }} />
   </Box>

   <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
    <Typography variant="overline" sx={{ px: 2, py: 1, fontWeight: 800, letterSpacing: 1.2, color: 'text.secondary', fontSize: 10 }}>MAIN MENU</Typography>
    <List sx={{ px: 1 }}>
     {menuItems.map((item) => {
      const isActive = location.pathname === item.path;
      const Icon = item.icon;
      return (
       <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
         onClick={() => { navigate(item.path); setMobileOpen(false); }}
         sx={{
          borderRadius: 2.5,
          py: 1.3,
          px: 2,
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'white' : 'text.primary',
          '&:hover': { bgcolor: isActive ? 'primary.dark' : 'action.hover' },
          transition: 'all 0.2s',
         }}
        >
         <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'white' : 'text.secondary' }}>
          <Icon fontSize="small" />
         </ListItemIcon>
         <ListItemText 
          primary={item.label} 
          primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 800 : 600 }}
         />
         {item.badge && (
          <Chip 
           label={item.badge} 
           size="small" 
           color={item.color || (isActive ? 'default' : 'primary')}
           sx={{ 
            height: 20, 
            fontSize: 10, 
            fontWeight: 800,
            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : undefined,
            color: isActive ? 'white' : undefined,
           }} 
          />
         )}
        </ListItemButton>
       </ListItem>
      );
     })}
    </List>

    <Divider sx={{ my: 2 }} />
    
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <TrendingUp color="primary" fontSize="small" />
      <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 0.8 }}>QUICK STATS</Typography>
     </Box>
     <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.5 }}>
      Manage all users, deposits, withdrawals, redeem codes & announcements from this premium MUI panel.
     </Typography>
    </Box>
   </Box>

   <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2.5, color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}>
     <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
     <ListItemText primary="Logout Admin" primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }} />
    </ListItemButton>
   </Box>
  </Box>
 );

 return (
  <ThemeProvider theme={theme}>
   <CssBaseline />
   <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
    <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }} elevation={0}>
     <Toolbar>
      <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
       <MenuIcon />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
       <Typography variant="h6" noWrap sx={{ fontWeight: 900, fontSize: { xs: 16, md: 18 } }}>
        {title}
       </Typography>
       <Chip label="MUI Premium" size="small" color="primary" sx={{ display: { xs: 'none', sm: 'flex' }, fontWeight: 800, fontSize: 10 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
       <IconButton size="small" sx={{ bgcolor: 'grey.100' }}><NotificationsIcon fontSize="small" /></IconButton>
       <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 800 }}>A</Avatar>
      </Box>
     </Toolbar>
    </AppBar>

    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
     <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' } }}>
      {drawer}
     </Drawer>
     <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } }} open>
      {drawer}
     </Drawer>
    </Box>

    <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', bgcolor: 'background.default' }}>
     <Toolbar />
     <Box sx={{ p: { xs: 2, md: 3 } }}>
      {children}
     </Box>
    </Box>
   </Box>
  </ThemeProvider>
 );
}
