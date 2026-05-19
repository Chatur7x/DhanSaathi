<div align="center">
  <h1>🏦 DhanSaathi</h1>
  <p><b>Your Intelligent Wealth Companion</b></p>
  <p>A premium, full-stack, cross-platform financial advisory platform built for Indian investors. DhanSaathi brings Wall Street-level analytics to everyday users through real-time NSE data, AI-driven insights, and a comprehensive suite of financial calculators.</p>
</div>

---

## 🚀 Features & Development Stages (What We Built)

The platform was systematically developed across 5 distinct phases to ensure enterprise-grade reliability and a flawless user experience.

### ✅ Phase 1: Foundation & Calculators
* **Cross-Platform Architecture:** Scaffolded a unified React + Vite codebase wrapped in Capacitor, allowing the exact same codebase to run natively on the Web and as an Android APK.
* **Premium Design System:** Implemented a modern, dark-themed UI featuring glassmorphism, fluid micro-animations, and responsive bottom-navigation for mobile users.
* **The 12 Calculators Suite:** Engineered highly interactive financial calculators using `recharts` for visual compounding (SIP, Lumpsum, SWP, CAGR, EMI, Goal Planner, Tax, Margin, Options Payoff, XIRR, Step-Up SIP, and Inflation).

### ✅ Phase 2: Knowledge Hub & Market Data
* **Indian Market Academy:** Built an interactive educational hub (`Academy.tsx` & `Knowledge.tsx`) categorizing topics across SIPs, Mutual Funds, ETFs, Stocks, and F&O to educate users dynamically.
* **Real-time NSE Integration:** Interfaced with the `stock-nse-india` API to stream live Nifty 50 and sectoral indices data, powering the Stock Screener and Dashboard.

### ✅ Phase 3: The Portfolio Engine (Backend)
* **SQLite Database Layer:** Established a robust relational database mapping Users, Portfolios, and Transactions.
* **REST API:** Created Express routes (`/api/portfolio`) allowing users to seamlessly Buy and Sell assets. The engine natively calculates Average Buy Prices and tracks historical P&L.
* **Auto-Sync:** The frontend `portfolioStore` automatically fetches and syncs the live ledger on app launch.

### ✅ Phase 4: AI News Agent (Real-Time Intelligence)
* **Live RSS Scraping:** Configured a server-side daemon using `axios` to scrape the Economic Times RSS feed.
* **WebSocket Streaming:** Instead of HTTP polling, the Node.js server streams breaking news directly to the frontend (`aiNewsUpdate` channel) instantly.
* **Sentiment Analysis:** Integrated AI logic to tag incoming news as 'Bullish' or 'Bearish', calculating estimated market impact scores for the AI Insights dashboard.

### ✅ Phase 5: Production Polish & Mobile Native Support
* **Progressive Web App (PWA):** Configured `vite-plugin-pwa` and generated `manifest.webmanifest`. The web version can now be natively installed on desktops and caches assets for offline support.
* **Android Capacitor Config:** Generated the `capacitor.config.ts` defining the Android App ID (`com.dhansaathi.app`), configuring Firebase Push Notifications payload rules, and setting up the native dark-mode splash screen.

---

## 🛠️ The Technology Stack

### Frontend (Web & Android)
* **React 19 + Vite:** Blazing fast development environment and optimized production builds.
* **Zustand:** Lightweight, unopinionated state management for portfolios and market data.
* **Capacitor (by Ionic):** The native bridge. It takes the built React web app and runs it inside a native Android WebView, exposing device APIs like Haptics, Local Storage, and Push Notifications.
* **Recharts & Lightweight Charts:** For rendering beautiful, responsive financial visualizations and technical trading charts.
* **Vanilla SCSS:** Used strictly over Tailwind to maintain pixel-perfect control over the premium glassmorphism gradients and complex responsive layouts.

### Backend (API & Real-time Server)
* **Node.js + Express:** A fast, asynchronous REST API server.
* **Socket.io:** Handles bi-directional communication to stream live NSE ticks and AI News flashes to the clients without refreshing.
* **Better-SQLite3:** A highly performant, synchronous SQLite engine for local persistence of users and portfolios.
* **stock-nse-india:** An unofficial API wrapper to scrape live equity data directly from the National Stock Exchange (NSE).

---

## 💡 Tech Stack Alternatives & Suggestions

While the current stack is incredibly fast and efficient for getting to market, here are architectural suggestions if the app scales to millions of users:

1. **Database: Migrate from SQLite to PostgreSQL**
   * *Why:* SQLite is fantastic for MVPs and local apps, but it locks the entire database during writes. When thousands of users are trading simultaneously, you will need a robust relational database like PostgreSQL hosted on AWS RDS or Supabase to handle concurrent writes and row-level locking.
2. **Real-time Data: Redis Pub/Sub**
   * *Why:* Right now, `Socket.io` is broadcasting from a single Node.js instance. If you scale to multiple backend servers (horizontal scaling), users on Server A won't receive WebSockets emitted from Server B. You will need a Redis adapter to synchronize sockets across a server cluster.
3. **App Framework: Next.js vs Vite**
   * *Why:* If SEO (Search Engine Optimization) becomes a priority for your Knowledge Hub and Academy pages, migrating from Vite (Client-side rendering) to Next.js (Server-side rendering) will ensure Google indexes your educational articles perfectly.
4. **Mobile: React Native vs Capacitor**
   * *Why:* Capacitor is brilliant because you only write code once. However, if the app requires extremely complex, heavy animations (like 3D models or 60fps TradingView charts running concurrently on low-end Androids), migrating to a truly native UI framework like React Native or Flutter might yield better CPU performance.

---

## 📈 Strategic Financial & Product Advice

Building a financial platform is 20% engineering and 80% trust and compliance. Here is business-level advice for scaling DhanSaathi:

### 1. SEBI Compliance & Disclaimers (CRITICAL)
India has very strict financial regulations under SEBI (Securities and Exchange Board of India).
* Since you are providing "AI Trade Signals" and "Portfolio Doctor" features, you **must** have clear disclaimers that the app is for "Educational Purposes Only" and you are not a SEBI Registered Investment Advisor (RIA).
* If you ever plan to charge users for specific stock tips, you must legally acquire a SEBI RIA license, otherwise the platform can be shut down.

### 2. Monetization Strategy
* **Freemium Model:** Give the Dashboard, Basic Calculators, and Market Data away for free. 
* **DhanSaathi Pro:** Charge a monthly subscription (e.g., ₹299/mo) to unlock the *AI Trade Signals*, the *Portfolio Doctor analysis*, and *Real-time Breaking AI News push notifications*.

### 3. Gamification of the Academy
You have a brilliant "Academy" section. Indians are currently flooding into the stock market. You should implement a "Streak" system (like Duolingo). If a user learns about Mutual Funds or passes a quiz for 5 days in a row, they get "XP" or virtual coins. They can use these virtual coins in the **Paper Trading** module.

### 4. Integration with Actual Brokers (Phase 6)
Currently, users have to manually type in their portfolio buys/sells. The ultimate holy grail for DhanSaathi is integrating the **Upstox API** or **Kite Connect API (Zerodha)**. 
* By adding a "Login with Zerodha" button, you can pull their real portfolio automatically via OAuth, instantly providing them with your superior AI insights without them doing manual data entry. This is the killer feature that will steal users from standard broker apps.
