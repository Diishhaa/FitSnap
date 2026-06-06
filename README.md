# 🩺 FitSnapI — AI-Powered Preventive Health & Fitness Dashboard

Welcome to **FitSnapI**, a modern, premium preventive health-tech startup portal designed to turn traditional fitness tracking into proactive health forecasting. By combining genetic-lifestyle indicators (FitDNA), a real-time Health Twin Simulator, and custom-rendered biometric charts, FitSnapI helps users stay ahead of chronic disease trajectories.

---

## 🌟 Premium Features Implemented

### 1. Modern Glassmorphism UI
- Fully responsive dark-mode and light-mode dashboard themes using curated HSL color palettes and CSS transitions.
- Soft neon radial ambient glows and high-fidelity tech-grid backgrounds for a futuristic dashboard aesthetic.

### 2. Onboarding Bio-Assessment Wizard
- Multi-step questionnaire collecting key data points: Age, Gender, Height, Weight, Activity Exertion level, Sleep hours, Water intake, and Existing medical indicators.
- Automated calculators yielding **BMI values** and **BMI Categories**.

### 3. FitDNA Profile Generation
- Post-assessment card showing metabolic Body Types (e.g. Endomorph, Mesomorph) alongside Lifestyle Score indices, Hydration coefficients, and Recovery Score percentages.

### 4. Flagship Feature: Health Twin Simulator
- Interactive sliders (Sleep, Water, Exercise, Diet Quality, Exertion levels) that compute and project metabolic changes in real-time.
- Side-by-side comparison cards: **Current Lifestyle vs Projected Twin**.
- Visualizes health score improvements over a 12-week trajectory using dynamic SVG paths.
- Computes risk indices for **Diabetes**, **Heart Disease**, and **Obesity**.

### 5. Integrated AI Health Coach Panel
- Interactive AI chat assistant with pre-programmed diagnostic prompt templates.
- Features a **Doctor Summary Generator** that compiles a clean, structured clinical summary for patient consultations.

### 6. Computer Vision Food Analyzer
- Drag-and-drop file uploader and preset scanning simulator.
- Displays calories, protein, carbs, fat, nutritional grades, and recommends healthier alternatives.

### 7. Habit Tracking & Gamification System
- Interactive checklist to log biometrics and water intake daily.
- Unlocks milestone badges (e.g. *Hydration Hero*, *Sleep Champion*) and tracks XP points to level up on the Community Leaderboard.

---

## 🛠️ Technology Stack & Architecture

- **Frontend core:** Next.js + React + TypeScript + Tailwind CSS v4.
- **Styling system:** Tailwind CSS v4 alongside high-fidelity glassmorphic Vanilla CSS variables for light/dark toggles.
- **Graphics rendering:** Lightweight, custom-rendered SVG path plotting to bypass bulky, version-sensitive charting packages.
- **Offline Emulation Fallback:** Integrated mock database handlers enabling a 100% functional, self-contained frontend client that operates without registry connection errors in restricted sandboxes.
- **FastAPI/PostgreSQL Integration:** Contains a built-in connection console template detailing database sync parameters, uvicorn configurations, and API controllers.

---

## ⚙️ How to Setup & Run

### 1. Install Dependencies
Run this in the repository folder (ensuring you are connected to the network):
```bash
npm install
```

### 2. Launch Next.js Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to:
```
http://localhost:3000
```
Use the theme toggle in the top navbar to switch between dark and light modes.
