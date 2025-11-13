# 💰 PWA Expense Tracker

### Live Demo: [expense-tracker-app](https://pwa-expense-tracker.vercel.app)

A modern **Progressive Web App (PWA)** built with **React, TypeScript, and Vite**, featuring offline capability, mobile install support, and full integration with **Capacitor** for native Android builds.

---

## 🚀 Features

- ✅ **Installable PWA** (Add to Home Screen + Native Android Build)
- ⚡ **Offline-first** architecture (Service Worker + IndexedDB)
- 💰 Add, Edit, and Delete expenses with ease
- 📅 Monthly / Daily summaries & analytics
- 📍 **Location tagging** for each expense
- 📊 Dashboard insights & charts
- 🌓 **Theme toggle** (light/dark)
- 📱 Fully responsive layout
- ⚙️ Built with modern hooks & context architecture
- 🧠 Modular TypeScript-based code organization

---

## 🧠 Tech Stack

| Layer | Tools |
|-------|--------|
| Framework | React (TypeScript + Vite) |
| Styling | TailwindCSS, Shadcn UI |
| Icons | Lucide Icons |
| State | React Context + Custom Hooks |
| Native Bridge | Capacitor |
| Charts | Recharts |
| Hosting | Vercel |
| Code Quality | ESLint + Prettier |
| Build Tool | Vite + TypeScript Compiler |

---

## 🗂️ Project Structure

```
application/
└─ expense-tracker.apk      # Native Android build

src/
├─ base/
│  ├─ InputField.tsx
│  ├─ TextAreaField.tsx
│  ├─ Modal.tsx
│  ├─ Popup.tsx
│  └─ index.ts
│
├─ components/
│  ├─ AddExpense.tsx
│  ├─ ChartCard.tsx
│  ├─ ExpenseList.tsx
│  ├─ MonthlyCalendar.tsx
│  ├─ SummaryCard.tsx
│  ├─ ThemeToggle.tsx
│  ├─ InstallButton.tsx
│  └─ index.ts
│
├─ context/
│  ├─ expenseContext.ts
│  ├─ LocationContext.ts
│  ├─ useThemeContext.ts
│  └─ index.ts
│
├─ hooks/
│  ├─ useAddExpense.ts
│  ├─ useDashboardMetrics.ts
│  ├─ useMonthlyStats.ts
│  ├─ useServiceWorker.ts
│  ├─ useLocationPermission.ts
│  ├─ useNativeOrWebLocation.ts
│  ├─ useInstallPrompt.ts
│  └─ index.ts
│
├─ layout/
│  ├─ DashboardLayout.tsx
│  └─ index.ts
│
├─ pages/
│  ├─ Home.tsx
│  ├─ Daily.tsx
│  ├─ Monthly.tsx
│  ├─ Analysis.tsx
│  ├─ AddExpensePage.tsx
│  ├─ Settings.tsx
│  └─ index.ts
│
├─ props/
│  ├─ *.ts / *.tsx
│  └─ index.ts
│
├─ providers/
│  ├─ ExpenseProvider.tsx
│  ├─ LocationProvider.tsx
│  ├─ ThemeProvider.tsx
│  └─ index.ts
│
├─ types/
│  ├─ Expense.ts
│  ├─ ExpenseContextType.ts
│  ├─ BeforeInstallPromptEvent.ts
│  ├─ ThemeContextType.ts
│  ├─ constants.ts
│  ├─ global.d.ts
│  └─ index.ts
│
├─ utils/
│  ├─ number.ts
│  └─ index.ts
│
├─ App.tsx
├─ RootApp.tsx
├─ main.tsx
├─ index.css
```

---

## ⚙️ Scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "cap:copy": "npx cap copy",
  "cap:sync": "npx cap sync",
  "cap:open": "npx cap open android",
  "cap:build": "yarn build && yarn cap:copy && yarn cap:sync"
}
```

---

## 🧩 Command Cheat Sheet

### 🔹 Development
```bash
yarn dev
# or npm run dev
```

### 🔹 Build for Production
```bash
yarn build
```

### 🔹 Preview Build
```bash
yarn preview
```

### 🔹 Lint Code
```bash
yarn lint
```

### 🔹 Build Android App (Capacitor)
```bash
yarn cap:build
# or step-by-step:
# yarn build && yarn cap:copy && yarn cap:sync
```

### 🔹 Open Android Studio
```bash
yarn cap:open
```

---

## 📱 Android Build (Capacitor)

The native Android build of the app is located in the **`application/`** directory:

```
application/
└─ expense-tracker.apk
```

### 🔸 To install manually:

1. Transfer `expense-tracker.apk` to your Android device.
2. Enable **“Install unknown apps”** for your file manager or browser.
3. Tap the file to install it.
4. Once installed, launch **Expense Tracker** like any other app — it works offline.

> 💡 This APK was generated using **Capacitor**, synced via `npx cap sync`, and built in **Android Studio**.

---

## 📦 Build & Deploy Steps

1. Clean and check code:
   ```bash
   yarn lint
   ```
2. Build web app:
   ```bash
   yarn build
   ```
3. Copy build to Capacitor:
   ```bash
   yarn cap:copy
   ```
4. Sync native Android project:
   ```bash
   yarn cap:sync
   ```
5. Open Android Studio for final build:
   ```bash
   yarn cap:open
   ```
6. Build and export `.apk` from **Build > Build Bundle(s) / APK(s)** in Android Studio.

7. The final APK will appear under `/application/expense-tracker.apk`.

---

## 🌍 Environment Variables

Create `.env` in project root:

```
VITE_API_BASE_URL=https://api.example.com
VITE_FEATURE_FLAG_SYNC=false
```

> **Note:** All Vite environment variables must start with `VITE_`.

---

## 🧱 PWA Configuration

Located in `/public/manifest.webmanifest`.  
Ensure the manifest and icons are correctly defined for installability.  
Run Lighthouse audit — aim for **90+ PWA score**.

---

## 🔐 Security

- Do **not** store sensitive data in localStorage.
- Use **short-lived access tokens** and **refresh tokens** securely.
- Always serve over **HTTPS**.

---

## 🪪 License

This project is licensed under the **MIT License** — free for personal or commercial use.

---

## 👤 Author

**Developed by:** Bottoms'Node  
**Project:** PWA Expense Tracker  
**Live URL:** [https://pwa-expense-tracker.vercel.app](https://pwa-expense-tracker.vercel.app)

---

**Made with ❤️ by Bottoms'Node — Powered by React, TypeScript & Capacitor**
