# 🏍️ Delivery Express - On-Demand Delivery & Errand Platform

> **"Your first choice in delivery. Anything, Anywhere!"**  
> Tailored web application for [facebook.com/deliveryexpress23](https://www.facebook.com/deliveryexpress23)

Built with **React**, **Tailwind CSS**, **Supabase (PostgreSQL & Realtime)**, **Leaflet Maps**, and optimized for **Vercel** deployment.

---

## 🌟 9 Core Services Supported

1. 🍔 **Food Delivery** – Restaurant & eatery pickup with custom food notes and estimated meal cost.
2. 🛒 **Pasabuy Service** – Convenience store, supermarket, or bakery shopping errands on customer's behalf.
3. 🎂 **Cake & Flower Delivery** – Delicate handling with surprise gift delivery options.
4. 💊 **Medicine Delivery** – Pharmacy pickup (Mercury Drug, Watsons, etc.) with prescription & Senior/PWD discount tags.
5. 📦 **Pick up & Drop off Parcels** – Point-to-point motorcycle parcel courier.
6. 🧾 **Bills Payment** – Utility bills, government queues (Meralco, Maynilad, PLDT, etc.) with receipt tracking.
7. 🏃 **General Errands** – Custom odd jobs, document notarization queues, key retrieval.
8. 🛍️ **Market & Mall Kumpra** – Heavy & wet market (palengke) and department store bulk shopping.
9. 📄 **Documents Transport** – Confidential, tamper-proof business and legal papers delivery.

---

## 🚀 Features

- **📱 Customer Booking & Self-Service Portal**:
  - Dynamic service forms tailored to each errand type.
  - Smart distance & fare calculator (Base fare + ₱/km + Errand fee).
  - Live GPS route map with Pickup, Courier bike, and Destination markers.
  - Realtime delivery progress stepper.
  - Direct 1-tap Facebook Messenger chat (`m.me/deliveryexpress23`) & hotline call button.

- **🛵 Rider / Courier Console**:
  - Live available orders feed.
  - 1-tap accept and progress status (`Arrived at Store` ➔ `Out for Delivery` ➔ `Delivered`).
  - Google Maps & Waze quick navigation launchers.
  - Proof of Delivery (POD) photo submission & receipt attachment.
  - Daily payout and completed trips counter.

- **📊 Dispatcher & Admin Dashboard**:
  - Live dispatch board with filters (`Pending`, `Assigned`, `In Transit`, `Delivered`).
  - Rider roster manager with real-time duty status.
  - Rate card & operating hours configuration (8:00 AM – 2:00 AM).
  - Revenue analytics and order volume metrics.

---

## 🛠️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Database & Realtime)

1. Create a free account and new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/schema.sql` and click **Run**.
4. Create a `.env.local` file in the root of this project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart your dev server (`npm run dev`). The app will automatically connect to live Supabase!

*(Note: If Supabase keys are not set, the app automatically runs in interactive local storage demo mode so you can test all features immediately!)*

---

## 🌐 Deploying to Vercel

1. Push this project to your **GitHub** repository (see instructions below).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. (Optional) In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will build and launch your live production web app!

---

## 🐙 Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Delivery Express on-demand errand and delivery web app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/delivery-express-app.git
git push -u origin main
```