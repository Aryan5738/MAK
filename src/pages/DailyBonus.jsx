import { useEffect, useState } from 'react';
import { realtimeDb, ref, get, update, push } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar, CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function DailyBonus() {
  const { currentUser, userData } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBonus = async () => {
      const today = new Date().toDateString();
      const lastClaim = userData?.lastBonusClaim ? new Date(userData.lastBonusClaim).toDateString() : null;
      
      if (lastClaim !== today) {
        setCanClaim(true);
      }
      
      setStreak(userData?.bonusStreak || 0);
    };
    if (userData) checkBonus();
  }, [userData]);

  const handleClaim = async () => {
    if (!canClaim) {
      toast.error('Already claimed today! Come tomorrow');
      return;
    }

    setLoading(true);
    try {
      // Bonus amount based on streak: 10, 15, 20, 25, 30, 50, 100 for 7 days
      const bonusAmounts = [10, 15, 20, 25, 30, 50, 100];
      const amount = bonusAmounts[Math.min(streak, 6)] || 10;

      const now = new Date();
      const newStreak = streak + 1;

      await update(ref(realtimeDb, `users/${currentUser.uid}`), {
        balance: (userData.balance || 0) + amount,
        totalEarning: (userData.totalEarning || 0) + amount,
        bonusEarning: (userData.bonusEarning || 0) + amount,
        lastBonusClaim: now.toISOString(),
        bonusStreak: newStreak,
      });

      await push(ref(realtimeDb, `transactions/${currentUser.uid}`), {
        type: 'bonus',
        amount,
        date: now.toISOString(),
        desc: `Daily check-in bonus Day ${newStreak} - ₹${amount}`,
      });

      await push(ref(realtimeDb, `notifications/${currentUser.uid}`), {
        title: 'Daily Bonus Claimed!',
        message: `You claimed ₹${amount} daily bonus! Streak: ${newStreak} days`,
        type: 'bonus',
        date: now.toISOString(),
        read: false,
      });

      toast.success(`Bonus claimed! ₹${amount} added • Streak ${newStreak} days`);
      setCanClaim(false);
      setStreak(newStreak);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const amounts = [10, 15, 20, 25, 30, 50, 100];

  return (
    <div className="min-h-screen bg-[#F8FDF9] max-w-[480px] mx-auto pb-10 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <button onClick={()=>navigate(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-black text-[15px]">Daily Check-in Bonus</h1>
          <p className="text-[11px] text-slate-500">Claim daily • Increase streak • Earn more</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-32">
        <div className="bg-gradient-to-br from-[#0FB86F] to-[#00E58F] rounded-[24px] p-6 text-white relative overflow-hidden shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-[11px] font-bold tracking-widest">CURRENT STREAK</p>
                <p className="text-[36px] font-black mt-1">{streak} Days</p>
                <p className="text-white/80 text-[12px] font-medium mt-1">Keep checking daily to increase bonus!</p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Gift className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-5 bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-white/70 font-bold tracking-widest">NEXT BONUS</p>
              <p className="font-black text-[18px] mt-1">₹{amounts[Math.min(streak, 6)]} on Day {Math.min(streak+1, 7)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
          <h3 className="font-black text-[14px] flex items-center gap-2"><Calendar className="w-4 h-4 text-[#0FB86F]" /> 7-Day Streak Rewards</h3>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {weekDays.map((day, i) => {
              const isCompleted = i < streak;
              const isToday = i === streak;
              return (
                <div key={i} className={`rounded-xl p-2 text-center border transition-all ${isCompleted ? 'bg-[#0FB86F]/10 border-[#0FB86F]/30' : isToday ? 'bg-amber-50 border-amber-300 shadow-md scale-105' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[9px] font-black tracking-widest ${isCompleted ? 'text-[#0FB86F]' : isToday ? 'text-amber-700' : 'text-slate-500'}`}>{day}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-2 text-[12px] font-black ${isCompleted ? 'bg-[#0FB86F] text-white' : isToday ? 'bg-amber-500 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-500'}`}>
                    {isCompleted ? '✓' : `₹${amounts[i]}`}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 ${isCompleted ? 'text-[#0FB86F]' : isToday ? 'text-amber-700' : 'text-slate-500'}`}>₹{amounts[i]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleClaim}
          disabled={!canClaim || loading}
          className={`w-full py-4 rounded-xl font-black text-[15px] shadow-lg flex items-center justify-center gap-2 transition-all ${canClaim ? 'bg-slate-900 text-white hover:bg-black shadow-premium' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Claiming...</>
          ) : canClaim ? (
            <><Zap className="w-5 h-5 text-[#00E58F]" /> Claim ₹{amounts[Math.min(streak, 6)]} Today Bonus</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Already Claimed Today - Come Tomorrow</>
          )}
        </motion.button>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
          <h4 className="font-black text-[13px] flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#0FB86F]" /> How Daily Bonus Works</h4>
          <ul className="mt-3 space-y-2 text-[12px] text-slate-600 font-medium leading-relaxed list-disc list-inside">
            <li>Claim bonus every 24 hours - bonus increases with streak</li>
            <li>Day 1: ₹10, Day 2: ₹15, Day 3: ₹20, Day 4: ₹25, Day 5: ₹30, Day 6: ₹50, Day 7: ₹100</li>
            <li>Miss a day and streak resets to 0</li>
            <li>Bonus directly added to wallet for investment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
