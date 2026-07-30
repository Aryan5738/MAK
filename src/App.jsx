import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import AnnouncementPopup from './components/AnnouncementPopup';

// User Pages
import Home from './pages/Home';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import MyInvestments from './pages/MyInvestments';
import Wallet from './pages/Wallet';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Redeem from './pages/Redeem';
import DailyBonus from './pages/DailyBonus';
import KYC from './pages/KYC';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminPlans from './pages/Admin/AdminPlans';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDeposits from './pages/Admin/AdminDeposits';
import AdminWithdrawals from './pages/Admin/AdminWithdrawals';
import AdminBanners from './pages/Admin/AdminBanners';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminRedeem from './pages/Admin/AdminRedeem';
import AdminAnnouncements from './pages/Admin/AdminAnnouncements';
import AdminKYC from './pages/Admin/AdminKYC';

function ProtectedRoute({ children }) {
 const { currentUser, loading, userData } = useAuth();
 if (loading) return <div className="min-h-screen bg-[#F8FDF9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0FB86F] border-t-transparent rounded-full animate-spin"></div></div>;
 if (!currentUser) return <Navigate to="/login" />;
 // If blocked, userData will be null after logout in AuthContext, but also check here
 if (userData?.isBlocked) return <Navigate to="/login" />;
 return children;
}

function PublicRoute({ children }) {
 const { currentUser, loading } = useAuth();
 if (loading) return <div className="min-h-screen bg-[#F8FDF9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0FB86F] border-t-transparent rounded-full animate-spin"></div></div>;
 if (currentUser) return <Navigate to="/" />;
 return children;
}

function AdminProtected({ children }) {
 const { currentUser, loading } = useAuth();
 if (loading) return <div className="min-h-screen bg-[#F8FDF9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0FB86F] border-t-transparent rounded-full animate-spin"></div></div>;
 if (!currentUser) return <Navigate to="/admin/login" />;
 return children;
}

function AppLayout() {
 return (
  <>
   <AnnouncementPopup />
   <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Admin Protected */}
    <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
    <Route path="/admin/plans" element={<AdminProtected><AdminPlans /></AdminProtected>} />
    <Route path="/admin/users" element={<AdminProtected><AdminUsers /></AdminProtected>} />
    <Route path="/admin/kyc" element={<AdminProtected><AdminKYC /></AdminProtected>} />
    <Route path="/admin/deposits" element={<AdminProtected><AdminDeposits /></AdminProtected>} />
    <Route path="/admin/withdrawals" element={<AdminProtected><AdminWithdrawals /></AdminProtected>} />
    <Route path="/admin/banners" element={<AdminProtected><AdminBanners /></AdminProtected>} />
    <Route path="/admin/settings" element={<AdminProtected><AdminSettings /></AdminProtected>} />
    <Route path="/admin/redeem" element={<AdminProtected><AdminRedeem /></AdminProtected>} />
    <Route path="/admin/announcements" element={<AdminProtected><AdminAnnouncements /></AdminProtected>} />

    {/* User Protected */}
    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
    <Route path="/plans/:id" element={<ProtectedRoute><PlanDetail /></ProtectedRoute>} />
    <Route path="/my-investments" element={<ProtectedRoute><MyInvestments /></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
    <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
    <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
    <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
    <Route path="/redeem" element={<ProtectedRoute><Redeem /></ProtectedRoute>} />
    <Route path="/daily-bonus" element={<ProtectedRoute><DailyBonus /></ProtectedRoute>} />
    <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
   </Routes>
   <BottomNav />
  </>
 );
}

export default function App() {
 return (
  <Router>
   <AppProvider>
    <AuthProvider>
     <AppLayout />
    </AuthProvider>
   </AppProvider>
  </Router>
 );
}
