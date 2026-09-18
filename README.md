# AI + API + Cloud Startup Idea Generator & Validator 🚀

An institutional-grade intelligence platform that empowers founders and entrepreneurs to generate, validate, and stress-test startup concepts using Artificial Intelligence, real-time market APIs, and Cloud Computing architecture blueprints.

---

## 🌟 Core Features

- **Multi-Step Guided Flow**:
  1. **Founder Profile & Vision**: Domain selection (AI Agents, Fintech, HealthTech, CleanTech, EdTech, etc.), skills matrix, budget, timeframe, and custom context.
  2. **AI Concept Generation**: Multi-idea ideation with value propositions, acute problem statements, AI/cloud solutions, target buyer personas, and defensible moats.
  3. **Live API Market Validation**: Real-time HackerNews discussions and GitHub open-source momentum feeds, TAM / SAM / SOM market sizing, and competitor differentiation matrices.
  4. **Cloud Blueprint & Feasibility Evaluation**: Quantitative feasibility scoring (0–100), AWS/GCP/Azure cloud topologies, 3-year financial runway, unit economics (CAC, LTV, LTV:CAC), and risk assessment.
  5. **Executive Startup Dossier**: Venture-grade investor memo ready to print or export as PDF, Markdown, and JSON.
- **Dual AI Engine Architecture**:
  - **Built-in Domain Heuristic Engine**: Works 100% offline out-of-the-box across 20+ verticals with zero configuration.
  - **Live Google Gemini Integration**: Optional API key support for dynamic frontier LLM synthesis.
- **Cloud Vault (Persistent Storage)**:
  - LocalStorage / IndexedDB preservation of generated dossiers.
  - Search, restore, compare, and manage your pipeline of startup concepts.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphism, Dark Mode, Print Stylesheet
- **Icons**: Lucide React
- **Visual Analytics**: Recharts & SVG Architecture Diagrams
- **Export Formats**: PDF (Print-ready), Markdown Memo, JSON Dataset

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

### 4. Run Automated Test Suite
```bash
node scripts/test-endpoints.mjs
```

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-ideas/route.ts   # AI concept generator API
│   │   │   ├── validate-market/route.ts  # Real-time API market telemetry
│   │   │   └── cloud-blueprint/route.ts  # Cloud architecture & feasibility API
│   │   ├── globals.css                   # Tailwind styles, glassmorphism, print CSS
│   │   ├── layout.tsx                    # Dark theme & grid layout wrapper
│   │   └── page.tsx                      # Master 5-step wizard orchestrator
│   ├── components/
│   │   ├── Navigation.tsx                # Brand header, preset triggers, vault counter
│   │   ├── SettingsModal.tsx             # Gemini API key & Cloud provider selector
│   │   ├── CloudVaultModal.tsx           # Saved startup pipeline & search manager
│   │   └── Wizard/
│   │       ├── StepInput.tsx             # Step 1: Founder Vision & skills
│   │       ├── StepIdeaSelection.tsx     # Step 2: Multi-concept selection cards
│   │       ├── StepMarketValidation.tsx  # Step 3: TAM/SAM/SOM & live API trends
│   │       ├── StepCloudFeasibility.tsx  # Step 4: Feasibility gauge, cloud topology, unit economics
│   │       └── DossierExport.tsx         # Step 5: Executive printable investor report
│   ├── lib/
│   │   ├── ai-engine.ts                  # Gemini API & offline heuristic engine
│   │   ├── market-api.ts                 # HackerNews & GitHub live signal fetcher
│   │   └── storage.ts                    # Cloud Vault persistence & export handlers
│   └── types/
│       └── index.ts                      # Strict TypeScript data models
└── scripts/
    └── test-endpoints.mjs                # Automated verification script
```
