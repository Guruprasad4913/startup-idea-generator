"use client";

import React, { useState } from "react";
import {
  Rocket,
  Milestone,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Sparkles,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Code2,
  Zap,
  HelpCircle,
  Info,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Target,
  Check,
  PackageCheck,
  Users,
  Briefcase,
  Flag,
  PlusCircle,
} from "lucide-react";
import { StartupIdea, FeasibilityReport, MVPRecommendation, BusinessRoadmap, FounderProfile } from "@/types";

interface StepMvpAndRoadmapProps {
  idea: StartupIdea;
  feasibility: FeasibilityReport;
  profile?: FounderProfile;
  onNext: () => void;
  onBack: () => void;
  onStartNewValidation?: () => void;
}

export const StepMvpAndRoadmap: React.FC<StepMvpAndRoadmapProps> = ({
  idea,
  feasibility,
  profile,
  onNext,
  onBack,
  onStartNewValidation,
}) => {
  const [activeTab, setActiveTab] = useState<"mvp" | "roadmap">("mvp");
  const [showJargonGuide, setShowJargonGuide] = useState(false);

  const isTechIdea =
    (idea.businessType || "").toLowerCase().includes("software") ||
    (idea.businessType || "").toLowerCase().includes("saas");

  const activeTimeframe = feasibility.mvpRecommendation?.timeframe || profile?.timeframe || (feasibility.mvpRecommendation?.timelineWeeks ? `${feasibility.mvpRecommendation.timelineWeeks} Weeks` : "1-3 Months Full Beta");
  const tfLower = activeTimeframe.toLowerCase();

  const is2Week = tfLower.includes("2-week") || tfLower.includes("2 week") || tfLower.includes("14") || tfLower.includes("rapid mvp") || feasibility.mvpRecommendation?.timelineWeeks === 2;
  const is30Day = tfLower.includes("30-day") || tfLower.includes("30 day") || tfLower.includes("4-week") || tfLower.includes("4 week") || tfLower.includes("pilot launch") || feasibility.mvpRecommendation?.timelineWeeks === 4;
  const is6Month = tfLower.includes("6 month") || tfLower.includes("enterprise") || tfLower.includes("24 week") || tfLower.includes("180") || feasibility.mvpRecommendation?.timelineWeeks === 24;

  let timelineDaysText = "60 - 90 Days";
  let timelineWeeksText = `${feasibility.mvpRecommendation?.timelineWeeks || 10} Weeks to Production`;
  let targetSpeedBadge = "Comprehensive Beta Readiness";
  let sprintTimelineTitle = "Phased Beta Sprint Launch Timeline";
  let sprintTimelineDescription = "Multi-week phased execution roadmap with verified deliverables to guarantee a high-quality beta release.";
  let tab1Badge = "60-90 Day Launch";

  if (is2Week) {
    timelineDaysText = "14 Days";
    timelineWeeksText = "2 Weeks to Production";
    targetSpeedBadge = "Fastest Route to Cashflow";
    sprintTimelineTitle = "2-Week Rapid Sprint Launch Timeline";
    sprintTimelineDescription = "Week-by-week high-velocity sprint roadmap with verified deliverables to guarantee a 14-day public release.";
    tab1Badge = "14-Day Sprint";
  } else if (is30Day) {
    timelineDaysText = "30 Days";
    timelineWeeksText = "4 Weeks to Production";
    targetSpeedBadge = "Commercial Pilot Velocity";
    sprintTimelineTitle = "30-Day Pilot Sprint Launch Timeline";
    sprintTimelineDescription = "Week-by-week execution roadmap with verified deliverables to guarantee a 30-day commercial pilot release.";
    tab1Badge = "30-Day Launch";
  } else if (is6Month) {
    timelineDaysText = "180 Days";
    timelineWeeksText = "24 Weeks to Production";
    targetSpeedBadge = "Enterprise-Grade Reliability";
    sprintTimelineTitle = "6-Month Enterprise Architecture & Rollout Timeline";
    sprintTimelineDescription = "Phase-by-phase enterprise development and compliance roadmap across 6 months with verified milestones.";
    tab1Badge = "6-Month Staging";
  }

  const mvp: MVPRecommendation = feasibility.mvpRecommendation || (isTechIdea ? {
    mvpName: `${idea.name} Core MVP`,
    timelineWeeks: 4,
    coreValueProposition: "A focused, self-serve automated solution solving the primary acute bottleneck with zero setup friction.",
    featureBacklog: {
      mustHave: [
        "Automated API (Application Programming Interface) onboarding & instant credential verification",
        "Core AI (Artificial Intelligence) inference and heuristic anomaly analysis pipeline",
        "Interactive results dashboard with exportable summary metrics",
        "Role-based multi-tenant authentication & team workspace",
      ],
      shouldHave: [
        "Automated email & webhook notification triggers",
        "Usage-based billing meter integration via Stripe Elements",
        "Detailed audit log with historical data export",
        "Custom threshold alert configurations",
      ],
      couldHave: [
        "Custom white-label domain branding",
        "Multi-region data residency compliance toggle",
        "Bi-directional bi-weekly CRM (Customer Relationship Management) / Slack sync integration",
      ],
    },
    recommendedStack: {
      frontend: "Next.js 14 App Router, Tailwind CSS, Lucide Icons, Recharts",
      backend: "Next.js Edge Route Handlers + AWS Lambda Serverless Workers",
      database: "PostgreSQL (Aurora Serverless / Supabase) with pgvector",
      aiModel: "Google Gemini 1.5 Flash + Claude 3.5 Sonnet hybrid fallback",
      lowCodeAccelerators: [
        "Clerk / NextAuth for instant secure authentication",
        "Stripe Elements for rapid payment flow",
        "Upstash Redis for sub-millisecond semantic caching",
        "Resend API for transactional user notifications",
      ],
    },
    fourWeekSprintPlan: [
      {
        week: 1,
        title: "Architecture & Data Ingestion Setup",
        goals: [
          "Configure PostgreSQL schema & vector index",
          "Implement user authentication & tenant isolation",
          "Build mock API ingestion adapters",
        ],
        deliverable: "Deployable staging backend with functioning authentication and mock data pipeline",
      },
      {
        week: 2,
        title: "Core AI Engine & Processing Loop",
        goals: [
          "Wire Google Gemini API inference engine",
          "Implement caching & rate-limiting middleware",
          "Construct automated verification heuristics",
        ],
        deliverable: "Functional API endpoint that returns verified results in under 800ms",
      },
      {
        week: 3,
        title: "Dashboard UI & Self-Serve Billing",
        goals: [
          "Build reactive analytics dashboard with charts",
          "Connect Stripe subscription checkout tiers",
          "Implement CSV / PDF export engine",
        ],
        deliverable: "Complete end-to-end user journey from signup to payment and report generation",
      },
      {
        week: 4,
        title: "Testing, Hardening & Beta Launch",
        goals: [
          "Execute load testing and prompt injection defense tests",
          "Conduct 5 live beta user onboarding sessions",
          "Public launch on Product Hunt, HackerNews & Twitter/X",
        ],
        deliverable: "Public production release with live telemetry and first 25 paying pilot accounts",
      },
    ],
  } : {
    mvpName: `${idea.name} Commercial Pilot Launch`,
    timelineWeeks: 4,
    coreValueProposition: "A focused real-world commercial pilot: batch production, certified materials/service delivery, and verified unit profitability.",
    featureBacklog: {
      mustHave: [
        "Direct supplier contracts & certified batch materials sourcing",
        "Pilot workshop / facility setup & quality control protocols",
        "WhatsApp Business & Direct POS ordering/invoicing channels",
        "Initial client delivery & structured feedback iteration loop",
      ],
      shouldHave: [
        "Automated customer loyalty & repeat purchase accounts",
        "Standardized branded packaging / field safety equipment",
        "Integrated delivery dispatch & logistics fleet coordination",
        "Weekly inventory & operational cost tracking ledger",
      ],
      couldHave: [
        "Corporate bulk supply & wholesale contractor tier",
        "Regional depot / showroom expansion blueprint",
        "Standardized franchise SOP operations manual",
      ],
    },
    recommendedStack: {
      frontend: "Omnichannel Direct Client Storefront & WhatsApp Business Catalog",
      backend: "Field Dispatch & Inventory Operations Hub",
      database: "PostgreSQL (Supabase) + Local Offline POS Cache",
      aiModel: "Demand Forecasting & Routing Optimization Heuristics",
      lowCodeAccelerators: [
        "Razorpay / UPI for multi-mode payment checkout",
        "WhatsApp Business API for order receipts & job alerts",
        "Shiprocket / Local Logistics for dispatch tracking",
        "Zoho / Tally Cloud for GST invoice compliance",
      ],
    },
    fourWeekSprintPlan: [
      {
        week: 1,
        title: "Supplier Procurement & Spec Formulation",
        goals: [
          "Finalize raw material suppliers and trade contractor partnerships",
          "Audit physical samples and regulatory licensing (FSSAI/BIS/GST)",
          "Formulate standard operating procedures (SOPs) and safety protocols",
        ],
        deliverable: "Approved production specifications with verified supplier agreements",
      },
      {
        week: 2,
        title: "Pilot Facility Setup & Dispatch Channels",
        goals: [
          "Setup commercial pilot workshop or staging hub",
          "Deploy direct client ordering channels and WhatsApp Business bot",
          "Connect UPI/card payment checkout and automated job notifications",
        ],
        deliverable: "Operational pilot facility with active ordering and billing flow",
      },
      {
        week: 3,
        title: "Sampling, Commercial Proof & Pre-Orders",
        goals: [
          "Execute first 25 sample deliveries to target commercial buyers",
          "Launch local catchment marketing campaign and collect customer intent",
          "Finalize 3 commercial trade or partner placement accounts",
        ],
        deliverable: "Signed partner distribution agreements and confirmed customer orders",
      },
      {
        week: 4,
        title: "Commercial Execution & Operations Hardening",
        goals: [
          "Execute full-scale commercial delivery across initial launch hubs",
          "Collect customer retention reviews and measure unit economics",
          "Optimize operational throughput and trade worker dispatch",
        ],
        deliverable: "Live commercial operations generating verified revenue with strong customer repeat intent",
      },
    ],
  });

  const roadmap: BusinessRoadmap = feasibility.businessRoadmap || {
    phases: [
      {
        phase: 1,
        title: "Validation & Rapid MVP Launch",
        timeframe: "Months 1 - 2",
        milestones: [
          "Complete 15 problem validation interviews with target buyers",
          "Ship 4-week functional MVP to staging",
          "Collect first 5 signed Letters of Intent (LOIs)",
          "Launch public waitlist with 500+ signups",
        ],
        keyMetrics: "15 LOIs (Letters of Intent) · 40% waitlist conversion · < 800ms API (Application Programming Interface) latency",
        fundingGoal: "Bootstrapped / $25k Angel Pre-Seed",
        status: "Active",
      },
      {
        phase: 2,
        title: "Closed Beta & Initial Traction",
        timeframe: "Months 3 - 5",
        milestones: [
          "Onboard 50 active beta companies",
          "Achieve weekly retention rate above 60%",
          "Launch self-serve Stripe billing integration",
          "Reach first $5,000 in Monthly Recurring Revenue (MRR)",
        ],
        keyMetrics: "$5k MRR (Monthly Recurring Revenue) · 60% WAU/MAU (Weekly/Monthly Active Users) · NPS (Net Promoter Score) 65+",
        fundingGoal: "$150k - $250k Accelerator / Pre-Seed",
        status: "Upcoming",
      },
      {
        phase: 3,
        title: "Product-Market Fit & Monetization Scale",
        timeframe: "Months 6 - 9",
        milestones: [
          "Scale to 250 paying SMBs (Small & Midsize Businesses) & Mid-Market customers",
          "Launch developer API (Application Programming Interface) marketplace & webhooks",
          "Achieve $25,000+ MRR with negative net revenue churn",
          "Hire first 2 senior full-stack & AI (Artificial Intelligence) engineers",
        ],
        keyMetrics: "$25k MRR ($300k ARR - Annual Recurring Revenue) · < 2% Monthly Churn · 11x LTV : CAC (Lifetime Value to Acquisition Cost Ratio)",
        fundingGoal: "$750k - $1.5M Seed Round",
        status: "Planned",
      },
      {
        phase: 4,
        title: "Market Expansion & Enterprise Scale",
        timeframe: "Months 10 - 12",
        milestones: [
          "Introduce Enterprise Tier with SOC2 (Security Compliance) & dedicated VPC (Virtual Private Cloud)",
          "Expand sales channels into European & Asian-Pacific corridors",
          "Cross $75,000+ MRR ($900k ARR)",
          "Prepare Series A institutional venture financing",
        ],
        keyMetrics: "$75k MRR (Monthly Recurring Revenue) · 5 Enterprise Annual Contracts · 85% Gross Margin",
        fundingGoal: "$3.0M - $5.0M Series A",
        status: "Planned",
      },
    ],
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Rocket className="w-3.5 h-3.5" />
            Step 5 of 6: MVP (Minimum Viable Product) Recommendation &amp; 12-Month Business Roadmap
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Execution &amp; Launch Roadmap for <span className="text-indigo-400">{idea.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            An actionable {timelineDaysText} MVP (Minimum Viable Product) development plan, clear feature boundaries via MoSCoW (Must, Should, Could, Won&apos;t have), and a phased funding roadmap.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowJargonGuide(!showJargonGuide)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              showJargonGuide
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:text-white"
            }`}
            title="Toggle plain English explanations for MVP and roadmap terms"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showJargonGuide ? "Hide Execution Guide" : "Plain English Guide"}</span>
          </button>

          {onStartNewValidation && (
            <button
              type="button"
              onClick={onStartNewValidation}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/70 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-900/60 hover:text-white hover:border-indigo-400 transition text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-950/40 cursor-pointer"
              title="Start a new startup validation from Step 1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Validation</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <span>View Full Startup Report &amp; Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Beginner-Friendly Jargon Buster / Plain English Execution Guide (Collapsible) */}
      {showJargonGuide && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border border-indigo-500/40 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Product &amp; Execution Terminology: In Plain English</span>
            </div>
            <span className="text-[11px] text-slate-400">Essential rules to avoid building the wrong thing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-indigo-400" /> MVP (Minimum Viable Product)
              </span>
              <p className="text-slate-300 text-[11px]">
                The simplest version of your product that solves 1 core pain point and proves customers will pay. Built in weeks, not months.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> MoSCoW (Must, Should, Could, Won&apos;t Have) Prioritization
              </span>
              <p className="text-slate-300 text-[11px]">
                Must-Have (cannot launch without it) · Should-Have (adds value in sprint 2) · Could-Have (nice-to-have later). Keeps costs low.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> 1-Week Sprints
              </span>
              <p className="text-slate-300 text-[11px]">
                Focused 7-day development sprints where your team ships a concrete working deliverable at the end of every week.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> LOI (Letter of Intent)
              </span>
              <p className="text-slate-300 text-[11px]">
                A signed document from a client stating: &quot;If you build this solution with these specs, we intend to purchase it for ₹X.&quot;
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" /> MRR (Monthly Recurring) &amp; ARR (Annual Recurring Revenue)
              </span>
              <p className="text-slate-300 text-[11px]">
                <strong>MRR</strong> = Monthly Recurring Revenue from subscriptions. <strong>ARR</strong> = Annual Recurring Revenue (MRR × 12).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Pre-Seed vs. Seed Round
              </span>
              <p className="text-slate-300 text-[11px]">
                <strong>Pre-Seed</strong>: Early funds to build the MVP. <strong>Seed</strong>: Growth capital raised once you have paying users.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Executive 60-Second Launch Briefing (High-level glance for busy founders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Time to First Customer */}
        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Time to Production
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
              {mvp.timelineWeeks} Weeks
            </span>
          </div>
          <div className="text-2xl font-black text-white">{timelineDaysText}</div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {is2Week
              ? "Ultra-rapid sprint velocity designed to validate core demand and capture first users in 2 weeks."
              : is30Day
              ? "Rapid sprint velocity designed to get working software or pilot batches into real customer hands within 1 month."
              : is6Month
              ? "Enterprise-grade engineering cycle ensuring full security compliance, audits, and high availability in 6 months."
              : "Focused beta development cycle delivering a feature-complete product with automated billing in 1-3 months."}
          </p>
        </div>

        {/* Card 2: Core Job of MVP */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Single Core MVP (Minimum Viable Product) Job
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Core Loop</span>
          </div>
          <div className="text-sm font-bold text-white line-clamp-2">
            {mvp.coreValueProposition}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-snug">
            Rule: Solve this 1 problem flawlessly before adding any auxiliary features.
          </p>
        </div>

        {/* Card 3: First Revenue Milestone */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Validation Target
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">Phase 1</span>
          </div>
          <div className="text-2xl font-black text-cyan-300">5 LOIs (Letters of Intent) / Pilots</div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {roadmap.phases[0]?.milestones[2] || "Collect 5 signed customer commitments or paying beta pilots."}
          </p>
        </div>

        {/* Card 4: Build vs Buy Speed Strategy */}
        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Speed-to-Market Strategy
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">Accelerators</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {mvp.recommendedStack.lowCodeAccelerators[0] || "Serverless & Managed Auth"}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Use pre-built billing, auth, and AI APIs (Application Programming Interfaces) to skip 80% of repetitive infrastructure work.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-3 sm:gap-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("mvp")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === "mvp"
              ? "border-indigo-400 text-indigo-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>1. MVP (Minimum Viable Product) Scope &amp; {is2Week ? "2-Week Sprint" : is30Day ? "30-Day Sprint" : is6Month ? "6-Month Plan" : "Phased Beta Plan"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-400 font-mono">
            {tab1Badge}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roadmap")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === "roadmap"
              ? "border-emerald-400 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Milestone className="w-4 h-4" />
          <span>2. 12-Month Phased Business Roadmap</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
            4 Funding Phases
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MVP RECOMMENDATION & 4-WEEK SPRINT PLAN */}
      {/* ========================================================================= */}
      {activeTab === "mvp" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* MVP Overview Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Recommended Initial MVP Scope
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                  {timelineWeeksText}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{mvp.mvpName}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {mvp.coreValueProposition}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex-shrink-0 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target Launch Timeline
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{timelineDaysText}</span>
              <span className="text-[10px] text-emerald-300/80 font-medium">{targetSpeedBadge}</span>
            </div>
          </div>

          {/* MoSCoW Feature Backlog Matrix with Guardrails */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  MoSCoW (Must, Should, Could, Won&apos;t Have) Feature Prioritization &amp; Scope Guardrails
                </h4>
                <p className="text-xs text-slate-400">
                  What MUST be built for day 1 vs what should wait until you have paying customers.
                </p>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Rule: Never build Could-Haves before Day 1 revenue
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Must-Have */}
              <div className="p-5 rounded-2xl glass-panel border-2 border-emerald-500/50 bg-slate-950/80 space-y-3 shadow-lg shadow-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                      Must-Have — P0 (Priority 0 Core Loop)
                    </span>
                    <span className="text-[10px] text-slate-400">Non-negotiable for launch</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Day 1 Essential
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200 pt-1">
                  {mvp.featureBacklog.mustHave.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Should-Have */}
              <div className="p-5 rounded-2xl glass-panel border border-indigo-500/40 bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider block">
                      Should-Have — P1 (Priority 1 Retention)
                    </span>
                    <span className="text-[10px] text-slate-400">Add after first 10 users</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Sprint 2 Focus
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200 pt-1">
                  {mvp.featureBacklog.shouldHave.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Could-Have */}
              <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                      Could-Have — P2 (Priority 2 Scale)
                    </span>
                    <span className="text-[10px] text-slate-500">Do NOT build for MVP</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Future Backlog
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400 pt-1">
                  {mvp.featureBacklog.couldHave.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Rapid Sprint Launch Plan (Visual Stepped Timeline) */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {sprintTimelineTitle}
              </h4>
              <p className="text-xs text-slate-400">
                {sprintTimelineDescription}
              </p>
            </div>

            <div className={`grid gap-4 ${
              mvp.fourWeekSprintPlan.length <= 2
                ? "grid-cols-1 md:grid-cols-2"
                : mvp.fourWeekSprintPlan.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            }`}>
              {mvp.fourWeekSprintPlan.map((sprint) => (
                <div
                  key={sprint.week}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition space-y-4 flex flex-col justify-between bg-slate-950/70 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {sprint.periodLabel || `Week 0${sprint.week}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sprint.daysLabel || `Days ${(sprint.week - 1) * 7 + 1} - ${sprint.week * 7}`}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white leading-snug">{sprint.title}</h5>

                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {sprint.goals.map((g, gi) => (
                        <li key={gi} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Sprint Deliverable:
                    </span>
                    <p className="text-[11px] text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {sprint.deliverable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Build vs Buy Stack & Low-Code Accelerators */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 bg-slate-950/60 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                {idea.businessType && idea.businessType !== "Tech & Software"
                  ? "Operational Core & Technology Stack (Rapid Route to Market)"
                  : "Build vs. Buy Accelerators (Fastest Time-to-Market)"}
              </h4>
              <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                Saves 12+ Weeks of Custom Coding
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {idea.businessType && idea.businessType !== "Tech & Software" ? "Customer Interface / POS (Point of Sale)" : "Frontend Stack"}
                </span>
                <span className="text-white font-medium block leading-snug">{mvp.recommendedStack.frontend}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {idea.businessType && idea.businessType !== "Tech & Software" ? "Operations & Core Backend" : "Backend & Edge"}
                </span>
                <span className="text-white font-medium block leading-snug">{mvp.recommendedStack.backend}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {idea.businessType && idea.businessType !== "Tech & Software" ? "Inventory & Data Layer" : "Database & Store"}
                </span>
                <span className="text-white font-medium block leading-snug">{mvp.recommendedStack.database}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {idea.businessType && idea.businessType !== "Tech & Software" ? "Sourcing & Logistics Model" : "AI (Artificial Intelligence) Inference Model"}
                </span>
                <span className="text-emerald-400 font-medium block leading-snug">{mvp.recommendedStack.aiModel}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-xs items-center">
              <span className="text-slate-400 text-[11px] font-semibold">
                {idea.businessType && idea.businessType !== "Tech & Software" ? "Operational & Supply Chain Accelerators:" : "Pre-Configured Turnkey Accelerators:"}
              </span>
              {mvp.recommendedStack.lowCodeAccelerators.map((acc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{acc}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Sub-Tab Navigation Helper */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Feasibility</span>
              </button>

              {onStartNewValidation && (
                <button
                  type="button"
                  onClick={onStartNewValidation}
                  className="px-3.5 py-2 rounded-xl bg-indigo-950/70 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-900/60 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Start a new startup validation from Step 1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Validation</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("roadmap");
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:text-white transition text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Explore 12-Month Business Roadmap</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={onNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>View Full Startup Report &amp; Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 12-MONTH BUSINESS ROADMAP & FUNDING PHASES */}
      {/* ========================================================================= */}
      {activeTab === "roadmap" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Milestone className="w-5 h-5 text-emerald-400" />
                  {is6Month ? "18-Month Phased Business Growth & Financing Roadmap" : "12-Month Phased Business Growth & Financing Roadmap"}
                </h3>
                <p className="text-xs text-slate-400">
                  Four sequential execution phases to take your startup from Day 1 validation to scalable Series A readiness.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                4 Phased Milestones
              </span>
            </div>

            <div className="space-y-4">
              {roadmap.phases.map((phase) => (
                <div
                  key={phase.phase}
                  className={`p-6 rounded-2xl glass-panel border transition relative ${
                    phase.status === "Active"
                      ? "border-emerald-500/50 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/25 shadow-xl shadow-emerald-500/10"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          phase.status === "Active"
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        0{phase.phase}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white">{phase.title}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{phase.timeframe}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Target: {phase.fundingGoal}</span>
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          phase.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {phase.status === "Active" ? "● Currently In Focus" : phase.status}
                      </span>
                    </div>
                  </div>

                  {/* Milestones & Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Concrete Execution Deliverables
                      </span>
                      <ul className="space-y-2 text-slate-200">
                        {phase.milestones.map((m, mi) => (
                          <li key={mi} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Phase Success Target KPIs (Key Performance Indicators)
                        </span>
                        <p className="text-xs font-bold text-white leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                          {phase.keyMetrics}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>Achieving these validated metrics unlocks advancement to the next funding round.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Tab Navigation Helper */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mvp");
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to MVP Sprint Plan</span>
              </button>

              {onStartNewValidation && (
                <button
                  type="button"
                  onClick={onStartNewValidation}
                  className="px-3.5 py-2 rounded-xl bg-indigo-950/70 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-900/60 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Start a new startup validation from Step 1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Validation</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Ready! View Final Institutional Dossier &amp; Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
