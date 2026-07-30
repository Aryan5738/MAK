import { realtimeDb, ref, get, update } from '../firebase';

// Generate random refer code
export const generateReferCode = (username) => {
  const clean = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${rand}`;
};

// Check and credit daily profits automatically
export const checkAndCreditDailyProfits = async (userId) => {
  try {
    const investmentsRef = ref(realtimeDb, 'investments');
    const snapshot = await get(investmentsRef);
    if (!snapshot.exists()) return;

    const allInvestments = snapshot.val();
    const userInvestments = Object.entries(allInvestments).filter(([_, inv]) => inv.userId === userId && inv.status === 'active');

    if (userInvestments.length === 0) return;

    const userRef = ref(realtimeDb, `users/${userId}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.val();
    let totalCredit = 0;
    let today = new Date();
    today.setHours(0,0,0,0);

    for (let [invId, inv] of userInvestments) {
      const lastCredited = new Date(inv.lastCredited);
      lastCredited.setHours(0,0,0,0);
      const diffTime = today - lastCredited;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        // Don't credit more than remaining days
        const remainingDays = inv.totalDays - inv.daysCompleted;
        const daysToCredit = Math.min(diffDays, remainingDays);
        
        if (daysToCredit > 0) {
          const earning = daysToCredit * inv.dailyProfit;
          totalCredit += earning;

          const newEarned = (inv.earned || 0) + earning;
          const newDaysCompleted = inv.daysCompleted + daysToCredit;
          const isCompleted = newDaysCompleted >= inv.totalDays;

          const updates = {
            earned: newEarned,
            daysCompleted: newDaysCompleted,
            lastCredited: today.toISOString(),
            status: isCompleted ? 'completed' : 'active'
          };

          await update(ref(realtimeDb, `investments/${invId}`), updates);
        }
      }
    }

    if (totalCredit > 0) {
      await update(userRef, {
        balance: (userData.balance || 0) + totalCredit,
        totalEarning: (userData.totalEarning || 0) + totalCredit
      });

      // Add transaction log
      const txRef = ref(realtimeDb, `transactions/${userId}`);
      const { push } = await import('../firebase');
      await push(txRef, {
        type: 'daily_income',
        amount: totalCredit,
        date: new Date().toISOString(),
        desc: `Daily profit credited - ₹${totalCredit}`
      });

      return totalCredit;
    }
    return 0;
  } catch (e) {
    console.error("Profit credit error", e);
    return 0;
  }
};

// Distribute referral commissions
export const distributeReferralCommission = async (buyerUid, planPrice) => {
  try {
    const buyerRef = ref(realtimeDb, `users/${buyerUid}`);
    const buyerSnap = await get(buyerRef);
    if (!buyerSnap.exists()) return;
    const buyer = buyerSnap.val();
    if (!buyer.referredBy) return;

    // Get settings for commission %
    const settingsRef = ref(realtimeDb, 'settings/referral');
    const settingsSnap = await get(settingsRef);
    let percents = { l1: 20, l2: 5, l3: 2 };
    if (settingsSnap.exists()) percents = settingsSnap.val();

    // Level 1
    const level1UsersRef = ref(realtimeDb, 'users');
    const allUsersSnap = await get(level1UsersRef);
    if (!allUsersSnap.exists()) return;
    const allUsers = allUsersSnap.val();
    
    // Find user by refer code
    const findByCode = (code) => {
      return Object.entries(allUsers).find(([_, u]) => u.myReferCode === code);
    };

    let currentRefCode = buyer.referredBy;
    
    for (let level = 1; level <= 3; level++) {
      const found = findByCode(currentRefCode);
      if (!found) break;
      const [uid, user] = found;
      const percent = level === 1 ? percents.l1 : level === 2 ? percents.l2 : percents.l3;
      const commission = (planPrice * percent) / 100;

      if (commission > 0) {
        await update(ref(realtimeDb, `users/${uid}`), {
          balance: (user.balance || 0) + commission,
          totalEarning: (user.totalEarning || 0) + commission,
          referralEarning: (user.referralEarning || 0) + commission
        });

        // transaction
        const { push } = await import('../firebase');
        await push(ref(realtimeDb, `transactions/${uid}`), {
          type: 'referral',
          amount: commission,
          date: new Date().toISOString(),
          desc: `L${level} Referral from ${buyer.username} - ₹${commission}`,
          from: buyerUid
        });
      }

      // Move to next level
      currentRefCode = user.referredBy;
      if (!currentRefCode) break;
    }

  } catch (e) {
    console.error("Referral distribute error", e);
  }
};
