# CASIO Premium - MLM Fake Money Investment Simulation (React + Firebase)

**Premium UI | Fake Money | Auto Daily Profit | Refer & Earn | Admin Panel**

> ⚠️ **DISCLAIMER:** Ye app sirf educational / simulation ke liye hai. Isme koi real money use nahi hota. Saara balance FAKE hai.

### 🔥 Live Features (As per PRD)

**User App:**
- ✅ Register: Username, Email, Phone, Password, Referral Code
- ✅ Login with Firebase Auth
- ✅ Home: Image Slider (Admin managed), Balance, Stats
- ✅ Plans: Price ₹200, 7 Days, Profit ₹1600 - Premium Cards
- ✅ Buy Logic: Balance check, deduct, create investment
- ✅ **Auto Daily Profit:** App open karte hi auto credit (checkAndCreditDailyProfits)
- ✅ My Investments: Progress bar (3/7 Days - 42%), Earned / Total
- ✅ Wallet: Total Balance, Deposit (UPI QR + UTR), Withdrawal
- ✅ Deposit: User UTR dalta hai, Admin approve karta hai -> balance add
- ✅ Withdrawal: Min ₹200, Admin approve/reject
- ✅ Referral: 3 Level MLM - L1 20%, L2 5%, L3 2% - Auto commission on plan purchase
- ✅ Team Page: Level wise team list, Refer link + Share
- ✅ Bottom Navbar: Premium Glassmorphism, Floating center button for My Plans
- ✅ Profile: Edit, Refer code copy, Logout

**Admin Panel (/admin):**
- ✅ Admin Dashboard: Stats (Users, Plans, Deposits, Withdrawals)
- ✅ Plans Manage: Add/Edit/Delete with Image, Price, Daily, Total Days, Total Profit
- ✅ Users Manage: List, Search, Add Fake Balance, Deduct
- ✅ Deposits: Pending list, Approve/Reject -> Balance adds automatically
- ✅ Withdrawals: Approve/Reject + Refund logic
- ✅ Banners: Home slider images manage
- ✅ Settings: UPI ID, QR Code URL, Referral %, Min Limits

### 🛠️ Tech Stack
- React 18 + Vite
- Tailwind CSS + Glassmorphism + Gradient Premium UI
- Firebase Auth + Realtime Database + Storage
- React Router DOM v6
- Swiper.js for Slider
- Lucide React Icons

### 📂 Firebase Structure
```
/users/{uid}: { username, email, phone, balance, myReferCode, referredBy, totalEarning, referralEarning, ... }
/plans/{id}: { title, image, price, dailyProfit, totalDays, totalProfit, isActive }
/investments/{id}: { userId, planId, price, dailyProfit, totalDays, earned, daysCompleted, status: active/completed, lastCredited }
/banners/{id}: { imageUrl }
/deposits/{id}: { userId, amount, utr, status }
/withdrawals/{id}: { userId, amount, upiId, status }
/settings: { upiId, qrCodeUrl, referral: {l1,l2,l3}, minDeposit, minWithdraw }
/admins/{uid}: true
/transactions/{userId}/{txId}: { type, amount, date, desc }
```

### 🚀 Installation & Run

```bash
# 1. Dependencies install
npm install

# 2. Run dev server
npm run dev

# 3. Build for production
npm run build
```

App will run on `http://localhost:5173`

### 👤 First Admin Setup

1. Register normal user with email `admin@casio.com`
2. Go to `/admin/login` and login with same email/pass
3. First time admin automatically ban jayega (because no admins exist)
4. Then you can access `/admin` dashboard

### 📱 User Flow Testing (Fake Money)

1. **Register** -> You get ₹100 signup bonus (fake)
2. **Admin** -> Users -> Add Balance ₹1000 fake
3. **Home** -> Buy Plan ₹200 wala
4. **My Investments** -> Progress bar dekho
5. **Auto Profit Test:** Change your device date to next day, app reopen karo -> profit auto credit hoga
6. **Referral Test:** Different browser me register with your refer code, then plan buy karega toh tumhe 20% milega

### 💎 Auto Daily Income Logic

`src/utils/profitLogic.js` me:

```js
- lastCredited aur today ka diff nikalta hai days me
- diffDays * dailyProfit user balance me add
- earned, daysCompleted update
- Agar daysCompleted >= totalDays to status = completed
- Ye logic har login pe aur home open pe chalta hai
```

For production, Firebase Cloud Function cron use kar sakte ho:
```
functions.pubsub.schedule('0 0 * * *').onRun(creditAllUsers)
```

### 🎨 Premium UI Highlights

- Dark theme `#0a0a14` + Purple/Pink gradient `#8a2be2 -> #ff00e5`
- Glass cards with `backdrop-filter: blur(12px)`
- Floating bottom nav with active animation
- Progress bar with gradient
- Mobile first, max-width 480px centered on desktop

### 📸 Screens

- `/` - Home + Slider + Plans
- `/plans` - All Plans + Filter
- `/plans/:id` - Detail + Buy
- `/my-investments` - My Plans + Progress Bar
- `/wallet` - Balance + Deposit/Withdraw + Tx History
- `/team` - Refer Code + 3 Level Team
- `/profile` - User Info + Logout
- `/admin/*` - Full Admin

### 🔒 Security Note

- Realtime DB rules me user apna data hi edit kar sake, but demo ke liye open rakha hai
- Production me rules tight karo

### ✅ Next Improvements

- Cloud Functions for daily cron
- PWA install support
- Daily check-in bonus, Spin wheel
- Leaderboard

---

**Made for Educational Simulation Only. No Real Money.**

Firebase Config already included in `src/firebase.js` (your given config).

Enjoy! 🚀
