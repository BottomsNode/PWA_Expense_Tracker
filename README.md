# 💰 PWA Expense Tracker

### **Live Demo:**  
➡️ https://pwa-expense-tracker.vercel.app

A modern offline-first **PWA Expense Tracker** built with **React, TypeScript, Vite**, and packaged for mobile using **Capacitor**. Installable on both **web** and **Android**, fast, reliable, and designed with clean architecture.

---

## 🚀 Features

- 📱 **Installable PWA** (Web + Native Android APK)  
- ⚡ **Offline-first** using Service Worker & IndexedDB  
- 💸 Add / Edit / Delete expenses  
- 📅 Monthly + Daily insights  
- 📍 Location tagging per expense  
- 📊 Dashboard with charts & analytics  
- 🌓 Light / Dark theme  
- 🧩 Modular, strongly typed codebase  
- 🔌 Native bridge via Capacitor  

---

## 🚀 Quick Start

```bash
yarn install
yarn dev
```

---

## ⚙️ Scripts

```json
{
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

## 🗂️ Project Structure

<details>
<summary><strong>Click to expand project tree</strong></summary>

```
application/
└─ expense-tracker.apk

src/
├─ base/
├─ components/
├─ context/
├─ hooks/
├─ layout/
├─ pages/
├─ props/
├─ providers/
├─ types/
├─ utils/
├─ App.tsx
├─ RootApp.tsx
├─ main.tsx
└─ index.css
```

</details>

---

## 📱 Android Build (Capacitor)

<details>
<summary><strong>Click to expand Android build instructions</strong></summary>

APK output location:

```
application/expense-tracker.apk
```

Manual installation:

1. Transfer APK to Android device  
2. Enable *Install Unknown Apps*  
3. Install  
4. Use offline immediately  

The APK is generated using:

```bash
yarn cap:build
```

</details>

---

## 📦 Build & Deploy

```bash
yarn lint
yarn build
yarn cap:copy
yarn cap:sync
yarn cap:open      # open Android Studio
```

---

## 🌍 Environment Variables

Create `.env`:

```
VITE_API_BASE_URL=...
VITE_FEATURE_FLAG_SYNC=false
```

> All Vite environment variables must begin with **VITE_**.

---

## 🧠 Tech Stack

| Layer | Tools |
|-------|--------|
| Framework | React + TypeScript + Vite |
| Styling | TailwindCSS + Shadcn UI |
| Icons | Lucide Icons |
| State | React Context + Custom Hooks |
| Native | Capacitor |
| Charts | Recharts |
| Hosting | Vercel |
| Code Quality | ESLint + Prettier |

---

## 📘 Developer Docs

See `.github/docs/`:

- CI/CD Pipeline  
- Android Build  
- PWA Setup  
- Branch Cleanup  
- Security Checks  

---

## 🔐 Security Notes

- Avoid storing sensitive data in localStorage  
- Use secure tokens  
- Always run under HTTPS  

---

## 🪪 License

**MIT License**

---

## 👤 Author

**Bottoms'Node**  
Live URL: https://pwa-expense-tracker.vercel.app