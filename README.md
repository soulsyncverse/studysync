# 📚 StudySync

> AI-powered study companion for UPSC CSE, UPPCS, NDA/CDS, CAPF aspirants.
> Free 7-day trial · ₹25/month · ₹70 for 3 months

---

## ✨ Features

### Free (7-day trial, then Premium)
- ⏱ Pomodoro Timer — 25–45 min custom sessions
- 📅 Daily / Weekly / Monthly Planner
- 🔥 Streak Tracker — don't break the chain
- 🌍 Public Circle — see all aspirants studying live
- 👥 Private Groups — create & join study circles
- 🎯 Exam Dashboard — UPSC, UPPCS, NDA, CDS, CAPF modes
- 🔔 Smart Notifications — streak alerts, study reminders
- 🌙 Dark & Light theme

### Premium
- 🤖 AI Study Assistant — instant doubt solving
- 🧠 Revision Scheduler — spaced repetition
- 📝 Notes & Flashcards
- 📊 Weekly AI Coaching Report

### Streak Restore
- 💳 ₹10 (first-time only) — instant restore
- 📖 Free — study 2× normal time to restore

---

## 🗂️ Project Structure

```
studysync/
├── src/
│   ├── App.jsx          ← Complete UI (all screens)
│   ├── firebase.js      ← Auth + Firestore helpers
│   └── index.js         ← React entry point
├── api/
│   ├── claude.js        ← Secure Claude AI proxy
│   └── payment.js       ← Razorpay order + verification
├── public/
│   ├── index.html       ← HTML shell
│   ├── manifest.json    ← PWA config
│   ├── sw.js            ← Service worker
│   └── icons/           ← App icons (72–512px)
├── firebase/
│   ├── firestore.rules  ← Security rules
│   └── firebase.json    ← Firebase config
├── .env.example         ← Environment variables template
├── vercel.json          ← Vercel deployment config
├── package.json         ← Dependencies
└── .gitignore
```

---

## 🚀 Deploy in 30 Minutes — Step by Step

### Step 1 — Install Tools (5 min)

```bash
# Install Node.js from https://nodejs.org (download LTS version)
# Then open Terminal / Command Prompt and run:

node --version   # Should show v18 or higher
npm --version    # Should show 9 or higher
```

### Step 2 — Set Up Firebase (5 min)

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it `studysync-app` → Continue
3. In the project → click **"Web"** (</> icon) → Register app as `StudySync`
4. Copy the `firebaseConfig` values shown — you'll need them in Step 4
5. Go to **Authentication** → **Sign-in method** → Enable:
   - **Google** (toggle on)
   - **Phone** (toggle on)
6. Go to **Firestore Database** → **Create database** → Start in **test mode** → Done

### Step 3 — Set Up Razorpay (5 min)

1. Go to https://razorpay.com → Sign up
2. Go to **Settings** → **API Keys** → **Generate Test Key**
3. Copy the **Key ID** and **Key Secret** — you'll need them in Step 4

### Step 4 — Configure Environment (3 min)

```bash
# In your project folder, copy the template:
cp .env.example .env.local

# Open .env.local and fill in your real values:
# - ANTHROPIC_API_KEY    → from https://console.anthropic.com/keys
# - RAZORPAY_KEY_ID      → from Step 3
# - RAZORPAY_KEY_SECRET  → from Step 3
# - REACT_APP_FIREBASE_* → from Step 2
```

### Step 5 — Test Locally (2 min)

```bash
npm install
npm start
# Opens http://localhost:3000
```

### Step 6 — Push to GitHub (5 min)

1. Create a free account at https://github.com
2. Create a new repository called `studysync`
3. Run these commands:

```bash
git init
git add .
git commit -m "StudySync v1.0 🚀"
git remote add origin https://github.com/YOUR_USERNAME/studysync.git
git push -u origin main
```

### Step 7 — Deploy to Vercel (5 min)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **"New Project"** → Import your `studysync` repo
3. Click **Environment Variables** and add all values from your `.env.local`
4. Click **Deploy**

✅ **Your app is now live** at `https://studysync.vercel.app`

### Step 8 — Deploy Firebase Rules (2 min)

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # Select your project, accept defaults
firebase deploy --only firestore:rules
```

### Step 9 — Custom Domain (Optional, ₹800/year)

1. Buy `studysync.in` at https://namecheap.com or https://godaddy.in
2. In Vercel → Project → Settings → Domains → Add domain
3. Follow the DNS instructions (takes 5–10 min)

---

## 💰 Pricing Structure

| Plan | Price | What user pays |
|------|-------|----------------|
| 7-Day Trial | FREE | No card needed |
| Monthly | ₹25/month | Shows ₹50, 50% discount |
| 3 Months | ₹70 | Best value |
| Streak Restore | ₹10 | First time only |

---

## 🔒 Security

- Claude API key lives only in Vercel environment — never in browser
- Razorpay signature verified server-side before activating Premium
- Firestore rules ensure users can only access their own data
- No passwords stored — Google/Phone auth only

---

## 📱 Make it Installable (PWA)

After deploying, users on mobile can:
1. Open `studysync.vercel.app` in Chrome/Safari
2. Tap **"Add to Home Screen"**
3. App installs like a native app — no Play Store needed!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Hosting | Vercel (free) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Anthropic Claude API |
| Payments | Razorpay |
| PWA | Service Worker + Web Manifest |

---

## ❓ Need Help?

Every step in this README is complete. If you get stuck on any step:
- Firebase issues → https://firebase.google.com/docs
- Vercel issues → https://vercel.com/docs
- Razorpay → https://razorpay.com/docs

---

Built with ❤️ for Indian competitive exam aspirants.
