<div align="center">
  <h1>🏦 DhanSaathi (Enterprise Edition)</h1>
  <p><b>Your Intelligent Wealth Companion — Pro Max Architecture</b></p>
  <p>A premium, full-stack financial advisory platform built for Indian investors. DhanSaathi brings Wall Street-level analytics to everyday users through real-time NSE data, AI-driven insights, and a comprehensive suite of financial calculators.</p>
</div>

---

## 🚀 The Next.js 15 Enterprise Migration

The platform has been systematically upgraded from a standard Vite SPA to a high-performance **Next.js 15 (App Router)** ecosystem to ensure enterprise-grade reliability, SEO readiness, and a flawless user experience.

### ✅ 1. UI/UX "Pro Max" Overhaul
* **Tailwind CSS + Shadcn UI:** Replaced legacy SCSS with Tailwind to massively speed up development and ensure an accessible, responsive design system.
* **Premium Micro-interactions:** Integrated 21st.dev and Framer Motion to build advanced interactive components like `GlowCard`, `MagneticButton`, `LivePulse`, and `AnimatedCounter`.
* **Enterprise Dark Mode:** Implemented a unified `slate-950` dark mode aesthetic, eliminating inconsistent top-brightness gradients for a true stealth financial terminal look.

### ✅ 2. Data Integration Layer (The Live Engine)
* **TanStack React Query:** Completely eliminated Zustand and manual fetch logic. React Query now handles all asynchronous state management, caching, and background auto-refetching.
* **TradingView Lightweight Charts:** Replaced basic Recharts with TradingView's high-performance HTML5 canvas engine. It parses real historical UNIX timestamps and dynamically themes itself based on live price action.
* **Socket.io Streaming:** Live WebSocket connections stream NIFTY 50 ticks directly from the Node.js backend straight into the Next.js dashboard every 15 seconds.

### ✅ 3. Real-Time Market Precision (Yahoo Finance)
* **Options Chain Module:** Integrated a dedicated `/options` terminal mapping live Calls, Puts, Strike Prices, and Open Interest using the `yahoo-finance2` node module.
* **Global & Crypto Markets:** Upgraded the Markets dashboard to parse live data arrays for Global Indices (S&P 500, NASDAQ, FTSE) and leading Cryptocurrencies (BTC, ETH, SOL).
* **True Portfolio Synchronization:** The backend `/api/portfolio/summary` endpoint now queries the SQLite ledger and cross-references it with live market quotes to calculate absolute precise XIRR, Total Value, and Day P&L.

---

## 🛠️ The Technology Stack

### Frontend (Next.js App)
* **Framework:** Next.js 15 (App Router) with React 19.
* **Styling:** Tailwind CSS, Shadcn UI, Framer Motion.
* **State & Data:** TanStack React Query v5.
* **Charts:** Lightweight Charts (TradingView) & Recharts (for sparklines/pies).
* **Icons:** Lucide React.

### Backend (Express Server)
* **Runtime:** Node.js + Express.
* **Real-time Engine:** Socket.io.
* **Market Data:** `yahoo-finance2` and `stock-nse-india`.
* **Database:** Better-SQLite3 (Prisma schema ready for PostgreSQL migration).
* **AI Engine:** Mocked Sentiment Analysis daemon (Ready for Local Llama 3 / Gemini hookups).

---

## 📈 Roadmap & Next Strategic Moves

While the frontend is operating at a billion-dollar fintech level, the underlying infrastructure is scaling. Here are the immediate next strikes:

1. **Database Migration (PostgreSQL):** Migrate the active `better-sqlite3` ledger to a hosted PostgreSQL database via the existing Prisma schema to allow for high-concurrency trades.
2. **Redis Caching:** Implement a Redis caching layer in the Node server to prevent Yahoo Finance API rate-limiting during massive user spikes.
3. **Android Native Wrap:** Compile the Next.js web application into a Capacitor-wrapped Android APK with native Biometric Authentication (FaceID/Fingerprint) before portfolio access.
4. **AI Microservice:** Build a Python/FastAPI microservice hosting a local Vector DB (Pinecone) and LLM to replace the mocked AI insights with actual algorithmic trading strategies.

---

<div align="center">
  <i>"Building a financial platform is 20% engineering and 80% trust."</i>
</div>
