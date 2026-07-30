import { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, realtimeDb, ref, onValue, logoutUser } from '../firebase';
import { checkAndCreditDailyProfits } from '../utils/profitLogic';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
 const [currentUser, setCurrentUser] = useState(null);
 const [userData, setUserData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [profitCredited, setProfitCredited] = useState(null);

 useEffect(() => {
  const unsubAuth = onAuthStateChanged(auth, async (user) => {
   setCurrentUser(user);
   if (!user) {
    setUserData(null);
    setLoading(false);
    return;
   }

   const userRef = ref(realtimeDb, `users/${user.uid}`);
   const unsubUser = onValue(userRef, async (snap) => {
    if (snap.exists()) {
     const data = snap.val();

     // Check if blocked / suspended
     if (data.isBlocked) {
      const reason = data.blockReason || 'Your account has been suspended by admin.';
      toast.error(`Account Suspended: ${reason}`, { duration: 5000 });
      // Force logout after showing message
      setTimeout(async () => {
       await logoutUser();
       setUserData(null);
       setCurrentUser(null);
       setLoading(false);
       window.location.href = '/login';
      }, 2000);
      return;
     }

     setUserData({ uid: user.uid, ...data });

     try {
      const credited = await checkAndCreditDailyProfits(user.uid);
      if (credited > 0) {
       setProfitCredited(credited);
       setTimeout(() => setProfitCredited(null), 5000);
       toast.success(`Daily profit ₹${credited.toFixed(2)} credited!`, { duration: 4000 });
      }
     } catch (e) {
      console.log(e);
     }

    } else {
     setUserData(null);
    }
    setLoading(false);
   });

   return () => unsubUser();
  });

  return () => unsubAuth();
 }, []);

 const value = {
  currentUser,
  userData,
  loading,
  profitCredited,
  setProfitCredited
 };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
