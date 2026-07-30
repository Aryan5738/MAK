import { useEffect, useState, useRef } from 'react';
import { realtimeDb, ref, get, push, update } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ShieldCheck, Info, CreditCard, Clock, Timer, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const QUICK_AMOUNTS = [100, 200, 300, 500, 1000, 2000];

export default function Deposit() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);
  const { currentUser } = useAuth();
  const { settings: appSettings } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    get(ref(realtimeDb, 'settings')).then(snap => {
      if (snap.exists()) setSettings(snap.val());
      else setSettings({ upiId: 'casio@upi', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=casio@upi' });
    });
  }, []);

  useEffect(() => {
    if (step === 2) {
      setTimeLeft(600);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast.error('Payment time expired! Please restart.');
            setStep(1);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleNext = () => {
    if (!amount || Number(amount) < (settings?.minDeposit || 100)) {
      toast.error(`Minimum deposit ₹${settings?.minDeposit || 100}`);
      return;
    }
    setStep(2);
    toast.success(`₹${amount} deposit - Payment method opened`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr || utr.length < 6) {
      toast.error('Enter valid UTR / Transaction ID');
      return;
    }
    setLoading(true);
    try {
      const depositId = push(ref(realtimeDb, 'deposits')).key;
      await update(ref(realtimeDb, `deposits/${depositId}`), {
        depositId, userId: currentUser.uid, amount: Number(amount), utr, status: 'pending', method: 'UPI', paymentTime: 600 - timeLeft, createdAt: new Date().toISOString(),
      });
      await push(ref(realtimeDb, `notifications/${currentUser.uid}`), {
        title: 'Deposit Request Submitted',
        message: `Your deposit ₹${amount} is pending verification. UTR: ${utr}`,
        type: 'deposit', date: new Date().toISOString(), read: false,
      });
      toast.success('Deposit submitted! Awaiting verification');
      navigate('/history?tab=deposits');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const effectiveSettings = settings || appSettings;

  return (
    <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto w-full flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <button onClick={()=> step === 1 ? navigate(-1) : setStep(1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-[15px] text-slate-900">Real Deposit</h1>
          <p className="text-[11px] text-slate-500 font-medium">Step {step} of 2 • Secure UPI Payment</p>
        </div>
        {step === 2 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[12px] border ${timeLeft < 120 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <Timer className="w-3.5 h-3.5" />{formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-32">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-[22px] p-5 shadow-card">
              <h3 className="font-black text-[14px] flex items-center gap-2">
                <div className="w-7 h-7 bg-[#0FB86F]/10 border border-[#0FB86F]/20 rounded-lg flex items-center justify-center"><CreditCard className="w-4 h-4 text-[#0FB86F]" /></div>
                Select Deposit Amount
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Choose amount for real deposit • Instant verification</p>
              <div className="grid grid-cols-3 gap-2.5 mt-5">
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} onClick={()=>setAmount(a)} className={`py-4 rounded-xl text-[14px] font-black border transition-all flex flex-col items-center gap-1 ${Number(amount)===a ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white shadow-sm'}`}>
                    <span>₹{a}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${Number(amount)===a ? 'bg-white/20' : 'bg-slate-200 text-slate-500'} font-bold`}>{Number(amount)===a ? 'SELECTED' : 'QUICK'}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <label className="text-[11px] font-bold text-slate-600 tracking-widest">CUSTOM AMOUNT</label>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-black">₹</span>
                  <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full input-modern rounded-xl pl-9 pr-4 py-4 text-[18px] font-black" placeholder="e.g., 750" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0FB86F]/10 to-[#00E58F]/5 border border-[#0FB86F]/20 rounded-2xl p-4 flex gap-3">
              <div className="w-10 h-10 bg-white border border-[#0FB86F]/20 rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-5 h-5 text-[#0FB86F]" /></div>
              <div>
                <p className="font-black text-[13px]">Secure & Fast Deposit</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">UPI ID, QR and 10-min timer on next screen. Enter real UTR after payment for quick verification.</p>
              </div>
            </div>

            <button onClick={handleNext} disabled={!amount} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[14px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              Continue to Payment <span className="bg-white/10 px-2 py-1 rounded-full text-[12px]">₹{amount || 0} →</span>
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={`rounded-2xl p-4 flex items-center gap-3 border ${timeLeft < 120 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${timeLeft < 120 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white'}`}><Clock className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className={`font-black text-[14px] ${timeLeft < 120 ? 'text-red-800' : 'text-amber-800'}`}>Expires In {formatTime(timeLeft)}</p>
                <p className={`text-[11px] font-medium ${timeLeft < 120 ? 'text-red-600' : 'text-amber-700'}`}>Complete payment within 10 minutes</p>
              </div>
              <div className={`text-[22px] font-black ${timeLeft < 120 ? 'text-red-700' : 'text-amber-700'}`}>{formatTime(timeLeft)}</div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-premium">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0FB86F] to-[#00E58F]"></div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-[11px] font-bold tracking-widest">DEPOSIT AMOUNT</p>
                  <p className="text-[30px] font-black mt-1">₹{Number(amount).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold px-3 py-1 rounded-full">REAL PAYMENT</p>
                  <p className="text-white/60 text-[11px] mt-2">UPI • Secure</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[24px] p-5 text-center shadow-card">
              <p className="text-[12px] font-black tracking-widest flex items-center justify-center gap-2"><QrCode className="w-4 h-4" /> SCAN QR TO PAY</p>
              <div className="mt-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 inline-block">
                <img src={effectiveSettings?.qrCodeUrl} alt="QR" className="w-56 h-56 rounded-xl bg-white p-2 shadow-sm" />
              </div>
              <div className="mt-5 bg-slate-900 rounded-xl p-3.5 flex justify-between items-center text-white max-w-[320px] mx-auto">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] text-white/60 font-bold tracking-widest">UPI ID</p>
                    <p className="font-bold text-[14px]">{effectiveSettings?.upiId}</p>
                  </div>
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(effectiveSettings?.upiId); toast.success('UPI ID copied!');}} className="w-9 h-9 bg-[#0FB86F] rounded-full flex items-center justify-center shadow-lg">
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2.5 text-left max-w-[360px] mx-auto">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">Make real payment of exact amount ₹{amount} via UPI app, then enter 12-digit UTR below for verification.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-card space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-700 tracking-widest flex items-center gap-1.5"><span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span> ENTER UTR AFTER PAYMENT</label>
                <input value={utr} onChange={e=>setUtr(e.target.value)} className="w-full mt-3 input-modern rounded-xl px-4 py-4 text-[14px] font-bold tracking-wide" placeholder="12-digit UTR, e.g., 123456789012" required />
                <p className="text-[11px] text-slate-500 font-medium mt-2">Enter real 12-digit UTR from your UPI app payment history</p>
              </div>
              <button disabled={loading} className="w-full gradient-primary py-4 rounded-xl font-black text-[14px] text-white shadow-premium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</> : <><CheckCircle2 className="w-5 h-5" /> I Have Paid • Submit UTR</>}
              </button>
              <button type="button" onClick={()=>setStep(1)} className="w-full bg-white border border-slate-200 py-3 rounded-xl font-bold text-[13px] text-slate-700">← Back</button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
