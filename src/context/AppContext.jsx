import { createContext, useContext, useEffect, useState } from 'react';
import { realtimeDb, ref, onValue } from '../firebase';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
 const [settings, setSettings] = useState({
  appName: 'CASIO',
  appFullName: 'CASIO Premium',
  upiId: 'casio@upi',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=casio@upi',
  referral: { l1: 20, l2: 5, l3: 2 },
  minDeposit: 100,
  minWithdraw: 200,
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const settingsRef = ref(realtimeDb, 'settings');
  const unsub = onValue(settingsRef, (snap) => {
   if (snap.exists()) {
    const data = snap.val();
    setSettings(prev => ({
     appName: data.appName || prev.appName,
     appFullName: data.appFullName || `${data.appName || 'CASIO'} Premium`,
     upiId: data.upiId || prev.upiId,
     qrCodeUrl: data.qrCodeUrl || prev.qrCodeUrl,
     referral: data.referral || prev.referral,
     minDeposit: data.minDeposit || 100,
     minWithdraw: data.minWithdraw || 200,
     logoUrl: data.logoUrl || null,
    }));
   }
   setLoading(false);
  });
  return () => unsub();
 }, []);

 return (
  <AppContext.Provider value={{ settings, loading, appName: settings.appName }}>
   {children}
  </AppContext.Provider>
 );
};
