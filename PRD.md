# PRD - Casio Premium MLM Investment App (Fake Money Simulation)

**Version:** 1.0
**Date:** 29 July 2026
**Tech Stack:** React.js + Firebase (Auth, Realtime Database, Firestore, Storage)
**Type:** Educational Simulation / Game - Virtual Currency Only
**Disclaimer:** Ye app sirf educational / fun ke liye hai. Isme real money ka investment nahi hai. Saare balance FAKE honge.

---

### 1. Executive Summary
Ek premium looking React web app banana hai jisme user register karke fake paise se investment plans kharidta hai. Har plan ka ek price hai (ex: ₹200) aur 7 din baad usko profit milta hai (ex: ₹1600). Profit har din automatic user ke wallet me add hona chahiye. App me referral system, deposit/withdrawal (UPI via admin approval), bottom navbar, image slider, admin panel sab hoga.

Firebase ka jo config aapne diya hai wahi use hoga.

### 2. Goals & Objectives
- Clean, Premium, Mobile-first UI like Binomo / Upstox
- Auto daily income credit system
- Easy to manage via Admin Panel
- Refer & Earn MLM (3 Level)
- 100% Firebase based, No custom backend

### 3. User Roles

#### A) Normal User
- Register / Login
- Plans dekhna & kharidna
- Daily profit earn karna
- Wallet, Deposit, Withdrawal
- Referral team dekhna
- Profile manage karna

#### B) Admin
- Secret login (`/admin`)
- Users list, block/unblock, balance add/remove
- Plans (Products) Create/Edit/Delete
- Slider/Banner Images manage
- Deposit requests Approve/Reject
- Withdrawal requests Approve/Reject
- UPI ID / QR code set karna
- Referral commission % set karna

---

### 4. Tech Stack Details

**Frontend:**
- React.js (Vite)
- React Router DOM v6
- Tailwind CSS for premium UI
- Framer Motion for animations
- React Icons + Lucide Icons
- Swiper.js for Image Slider
- React Toastify for notifications

**Backend (Firebase):**
- **Firebase Auth:** Email/Password Auth
- **Realtime Database:** Main DB (Users, Plans, Investments, Deposits, Withdrawals, Banners) - As per your code
- **Firestore:** Optional for fast queries (Plans, Transactions log)
- **Firebase Storage:** Plan images, Slider images, QR code, Payment screenshots

Your Provided `firebase.js` will be used as is.

### 5. Detailed Feature Specification

#### 5.1 Authentication System
**Register Page Fields:**
1. Username (unique)
2. Email (Gmail)
3. Phone Number (10 digit validation)
4. Password + Confirm Password
5. Referral Code (Optional) - Agar kisi ne invite kiya ho

**Logic:**
- Firebase Auth se account banta hai
- Realtime DB me `/users/{uid}` par extra data save:
```json
{
  "uid": "user_id",
  "username": "casio_king",
  "email": "user@gmail.com",
  "phone": "9876543210",
  "balance": 100, // Signup bonus fake money
  "referredBy": "REFCODE123",
  "myReferCode": "CASIO1234",
  "totalEarning": 0,
  "totalDeposit": 0,
  "totalWithdraw": 0,
  "team": {
    "level1": [],
    "level2": [],
    "level3": []
  },
  "createdAt": "timestamp"
}
```
- Login Page: Email/Password

#### 5.2 Home Screen (Premium)
- **Top AppBar:** Logo "CASIO", Balance Show (₹), Notification Icon
- **Image Slider:** Auto-play, 3-4 banners. Admin can add from panel. From `/banners` node.
- **Marquee Notice:** "Aaj ₹5000 se zyada kamao!"
- **Quick Stats:** Total Users, Total Payout (fake)
- **Investment Plans Grid:** Card Design
- **Bottom Navbar:** Fixed, Glassmorphism effect

#### 5.3 Investment Plans / Products System
**Plan Card Design:**
- Top: Product Image (Mobile, Watch, Car etc)
- Badge: "HOT" / "NEW"
- Title: e.g., Casio G-Shock Plan
- Price: ₹200
- Duration: 7 Days
- Daily Income: ₹228.57
- Total Profit: ₹1600
- Progress Button: Invest Now

**Admin can Add Plan:**
```json
/plans/{planId}: {
  "id": "planId",
  "title": "Casio Starter Plan",
  "image": "https://firebasestorage...",
  "price": 200,
  "dailyProfit": 228.57,
  "totalDays": 7,
  "totalProfit": 1600,
  "isActive": true,
  "createdAt": "timestamp"
}
```

**Buy Logic:**
1. Check if user balance >= price
2. Deduct balance
3. Create entry in `/investments/{investmentId}`:
```json
{
  "investmentId": "...",
  "userId": "uid",
  "planId": "planId",
  "planTitle": "Starter",
  "planImage": "...",
  "price": 200,
  "dailyProfit": 228.57,
  "totalDays": 7,
  "totalProfit": 1600,
  "earned": 0,
  "daysCompleted": 0,
  "startDate": "2026-07-29",
  "lastCredited": "2026-07-29",
  "status": "active", // active, completed
  "endDate": "2026-08-05"
}
```
4. Referral commissions auto distribute to upline.

#### 5.4 Auto Daily Income System (MOST IMPORTANT)
**Logic (Client + Cloud Function Hybrid):**

**Option A - Client Side Auto Check (No backend cost):**
- Jab bhi user app open kare ya Home par aaye, ek function `checkAndCreditProfit()` chalega.
- Wo function user ke saare `active` investments ko check karega.
- `daysPassed = floor( (today - lastCredited) / 24 hours )`
- Agar daysPassed > 0, toh `daysPassed * dailyProfit` user ke balance me add.
- `earned`, `daysCompleted`, `lastCredited` update.
- Agar `daysCompleted >= totalDays` to status = completed.

**Option B - Firebase Cloud Function (Recommended for Pro):**
- Har 24 ghante me ek cron job (functions.pubsub.schedule('0 0 * * *')) chalega jo saare active investments ko credit karega.

Is PRD me hum Option A implement karenge (100% free).

#### 5.5 My Investments / My Buy Products Page
- Tabs: Active | Completed
- Har card me:
  - Image, Title
  - Price: ₹200
  - Progress Bar: `daysCompleted / totalDays * 100` -> "3/7 Days - 42%"
  - Earned: ₹685 / ₹1600
  - Daily: ₹228.57
  - Status dot Green
- Animation wala progress bar.

#### 5.6 Wallet System (Fake Money)
**Sections:**
- Total Balance Card (Gradient Premium)
- Today Income
- Total Income
- Buttons: Deposit | Withdrawal | History

**Deposit (UPI Simulation - Fake):**
- User amount enter karega (min 100)
- Admin ka UPI ID / QR Show hoga (from `/settings/upi`)
- User UPI se (dummy) pay karega aur UTR Number + Screenshot upload karega (Storage pe jayega)
- Entry create `/deposits/{id}` status = pending
- Admin approve karega toh balance add ho jayega

**Withdrawal (Fake):**
- Min Withdrawal ₹200
- User Amount, UPI ID / Bank details enter karega
- Entry `/withdrawals/{id}` status = pending
- Balance immediately hold/deduct
- Admin approve/reject.

#### 5.7 Refer & Earn (MLM 3 Level)
- **My Refer Code** + Copy Button + Share WhatsApp
- **Referral Link:** `https://casio-7b454.web.app/register?ref=CASIO1234`
- **Commission Structure (Admin can change):**
  - Level 1: 20% (Direct)
  - Level 2: 5%
  - Level 3: 2%
- Example: Agar A ne B ko refer kiya, B ne ₹200 ka plan liya, to A ko ₹40 milega.
- Pages: Team List, Level wise earning, Total Referral Earnings
- `/referrals/{userId}` structure.

#### 5.8 Bottom Navbar (Premium Design)
5 Items with Icons & Active Animation:
1. **Home** - House Icon
2. **Plans** - Chart / Bag Icon
3. **Team** - Users Icon (Refer)
4. **Wallet** - Wallet Icon
5. **Profile** - User Icon

Design: Floating, Blurred background, Active icon me gradient.

#### 5.9 Profile Page
- Avatar, Username, Email, Phone
- Balance, Total Earning Cards
- Options: My Investments, Deposit History, Withdrawal History, Invite Friends, About Us, Logout
- Edit Profile

#### 5.10 Admin Panel (`/admin/login`)
**Admin Dashboard:**
- Stats: Total Users, Total Deposits, Total Withdrawals, Total Investments, Pending Requests
- **Plan Management:** Table + Add New Plan (Modal with Image Upload, Name, Price, Daily, Total Days, Total Profit)
- **User Management:** Search by email/phone. List. View Details. Buttons: Add Balance, Deduct Balance, Block User. Uske investments dekho.
- **Slider Management:** `/banners` add/delete image + link
- **Deposit Requests:** List pending, Show screenshot, Approve/Reject
- **Withdrawal Requests:** List pending, Show UPI, Approve/Reject
- **Settings:** UPI ID, QR Code Upload, Referral %, App Notice, Min Deposit/Withdraw

Admin auth ke liye hardcode email check: `admin@casio.com` ya Realtime DB me `/admins/{uid}`.

---

### 6. DATABASE SCHEMA (Realtime Database)

```
root:
  users:
    {uid}: { username, email, phone, balance, myReferCode, referredBy, ... }
  plans:
    {planId}: { title, image, price, dailyProfit, totalDays, totalProfit, ... }
  investments:
    {investmentId}: { userId, planId, ... status, earned ... }
  banners:
    {bannerId}: { imageUrl, link, order }
  deposits:
    {depositId}: { userId, amount, utr, screenshotUrl, status, createdAt }
  withdrawals:
    {withdrawalId}: { userId, amount, upiId, status, createdAt }
  settings:
    upiId: "casio@ybl"
    qrCodeUrl: "https://..."
    referral: { l1: 20, l2: 5, l3: 2 }
  admins:
    {uid}: true
```

### 7. Security Rules (Basic)
- User apna hi data read/write kar sake.
- Admin sab kar sakta hai.
- Plans/Banners sab read kar sakte hain, write sirf admin.

### 8. UI/UX Premium Requirements
- Colors: Dark theme + Gold / Purple Gradient (#8a2be2 to #ff00ff) jaise Dream11 / Crypto apps.
- Font: Poppins / Outfit
- Cards: Rounded-2xl, Shadow, Gradient borders
- Animations: Framer Motion hover/tap
- Mobile First (Max width 420px centered on desktop)
- PWA Support

### 9. User Flow

**New User:** Landing -> Register (with phone) -> Bonus ₹100 Fake -> Home -> Plans Dekho -> Deposit (Fake) -> Plan Buy -> My Investments me progress bar dekho -> Daily auto income -> Refer karke aur kamao -> Withdrawal request.

**Admin Flow:** Admin Login -> Dashboard Stats -> Pending Deposits approve -> User ka balance badha -> Plan add/edit.

### 10. Milestones / Development Phases

**Phase 1 (Setup):**
- React App + Firebase connect + Tailwind + Routing + Auth

**Phase 2 (Core):**
- Home + Slider + Plans fetching + Bottom Navbar

**Phase 3 (Investment Logic):**
- Buy Plan + My Investments + Auto Daily Income Logic

**Phase 4 (Wallet):**
- Deposit + Withdrawal with image upload

**Phase 5 (Referral):**
- Code generation + 3 level commission distribution

**Phase 6 (Admin Panel):**
- Admin Dashboard full

**Phase 7 (Polish):**
- Premium animations, PWA, Deploy

### 11. Future Enhancements
- Lucky Spin, Daily Check-in Bonus
- Telegram Channel Join Bonus
- Leaderboard

---
**Next Step:** Aap bolo to main isi PRD ke hisab se pura Premium React Project ka code generate kar du - `firebase.js` ka config aapka hi rahega.
