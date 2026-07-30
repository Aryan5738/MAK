import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Zap } from 'lucide-react';

export default function NextProfitTimer({ lastCredited, dailyProfit, small = false }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, total: 0 });
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const last = lastCredited ? new Date(lastCredited) : now;
      
      // Next credit at next midnight (00:00) after lastCredited
      // If lastCredited was today at 00:00, next is tomorrow 00:00
      const nextMidnight = new Date(last);
      nextMidnight.setHours(0, 0, 0, 0);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      
      // If nextMidnight is in past (user missed), set to upcoming midnight
      const upcomingMidnight = new Date();
      upcomingMidnight.setHours(24, 0, 0, 0); // Next 00:00
      
      // Use the later of the two? Actually profit should credit daily at 00:00
      // So next profit is upcoming midnight
      const target = upcomingMidnight;
      
      const diff = target - now;
      
      if (diff <= 0) {
        setIsOverdue(true);
        return { h: 0, m: 0, s: 0, total: 0 };
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { h, m, s, total: diff };
    };

    // Initial
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      setIsOverdue(newTime.total <= 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCredited]);

  if (small) {
    return (
      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
        <Clock className="w-3 h-3 text-amber-600" />
        <span className="text-[10px] font-black text-amber-700 tracking-wide">
          {isOverdue ? 'CREDITING...' : `${String(timeLeft.h).padStart(2,'0')}:${String(timeLeft.m).padStart(2,'0')}:${String(timeLeft.s).padStart(2,'0')}`}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-amber-700">NEXT PROFIT IN</p>
            <p className="text-[11px] font-bold text-amber-800">Daily Auto Credit</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-full px-2 py-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-green-600" />
          <span className="text-[10px] font-black text-green-700">₹{dailyProfit}/day</span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-white border border-amber-200 rounded-xl p-2 text-center shadow-sm">
          <p className="text-[18px] font-black text-slate-900">{String(timeLeft.h).padStart(2,'0')}</p>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest">HOURS</p>
        </div>
        <div className="flex-1 bg-white border border-amber-200 rounded-xl p-2 text-center shadow-sm">
          <p className="text-[18px] font-black text-slate-900">{String(timeLeft.m).padStart(2,'0')}</p>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest">MINS</p>
        </div>
        <div className="flex-1 bg-white border border-amber-200 rounded-xl p-2 text-center shadow-sm">
          <p className="text-[18px] font-black text-slate-900">{String(timeLeft.s).padStart(2,'0')}</p>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest">SECS</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-amber-800 bg-white/60 border border-amber-200/50 rounded-lg px-2.5 py-2">
        <TrendingUp className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>
          {isOverdue 
            ? 'Profit crediting now! Open app to credit instantly' 
            : `Next profit ₹${dailyProfit} will auto-credit at 00:00 midnight. Keep app installed.`}
        </span>
      </div>
    </div>
  );
}
