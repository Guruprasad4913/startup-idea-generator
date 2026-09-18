"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Globe,
  Radio,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Users,
  Building2,
  Sparkles,
  BarChart3,
  Check,
  X,
  Target,
  Clock,
  Compass,
  DollarSign,
  Zap,
  MapPin,
  HelpCircle,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Flame,
} from "lucide-react";
import { StartupIdea, MarketValidation } from "@/types";

interface StepMarketValidationProps {
  idea: StartupIdea;
  validation: MarketValidation;
  onNext: () => void;
  onBack: () => void;
  isEvaluatingCloud: boolean;
}

export const StepMarketValidation: React.FC<StepMarketValidationProps> = ({
  idea,
  validation,
  onNext,
  onBack,
  isEvaluatingCloud,
}) => {
  const [activeTab, setActiveTab] = useState<"market" | "competitors" | "users">("market");
  const [showJargonGuide, setShowJargonGuide] = useState(false);
  const [competitorFilter, setCompetitorFilter] = useState<"all" | "Direct" | "Indirect">("all");

  const {
    competitorComparisonMatrix,
    targetUserAnalysis,
    regionalMarketDynamics,
    targetSegments,
  } = validation;

  // Filtered competitors for tab 2
  const displayedCompetitors = validation.competitors.filter((c) => {
    if (competitorFilter === "all") return true;
    return c.type === competitorFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Step 3 of 6: Market, Competitor &amp; Target User Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Market &amp; Customer Intelligence for <span className="text-emerald-400">{idea.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Understand your total market demand, how you beat existing alternatives, and exactly who will buy your product first.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowJargonGuide(!showJargonGuide)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              showJargonGuide
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:text-white"
            }`}
            title="Toggle plain English explanations for startup terms"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showJargonGuide ? "Hide Terminology Guide" : "Plain English Guide"}</span>
          </button>

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
            disabled={isEvaluatingCloud}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isEvaluatingCloud ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Feasibility &amp; AI Engine...</span>
              </>
            ) : (
              <>
                <span>Continue to Feasibility &amp; Scoring</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Beginner-Friendly Jargon Buster / Plain English Dictionary (Collapsible) */}
      {showJargonGuide && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/40 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Startup &amp; Venture Terminology: In Plain English</span>
            </div>
            <span className="text-[11px] text-slate-400">Everything you need to know in 1 minute</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> TAM (Total Addressable Market)
              </span>
              <p className="text-slate-300 text-[11px]">
                The entire universe of possible revenue if 100% of potential customers worldwide bought your solution.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> SAM (Serviceable Addressable Market)
              </span>
              <p className="text-slate-300 text-[11px]">
                The portion of the market your product and business model can realistically serve today given geography and technology.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> SOM (Serviceable Obtainable Market / 3-Year Target)
              </span>
              <p className="text-slate-300 text-[11px]">
                Your realistic 3-year revenue target. Capturing just 1% to 3% of SAM represents your immediate business size.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> CAGR (Compound Annual Growth Rate)
              </span>
              <p className="text-slate-300 text-[11px]">
                How fast customer demand in this industry grows year over year. Anything above 15% represents strong startup tailwinds.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-rose-400" /> CAC (Customer Acquisition Cost)
              </span>
              <p className="text-slate-300 text-[11px]">
                The marketing &amp; sales expense to gain 1 paying customer. Lower is better, and customer lifetime value should be 3x CAC.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Innovation Moat (Defensibility)
              </span>
              <p className="text-slate-300 text-[11px]">
                Your unfair strategic advantage (proprietary AI, workflow lock-in, data network) that prevents competitors from copying you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Executive 60-Second Market Briefing (High-level glance for busy users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 3-Year Opportunity */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> 3-Year Revenue Target — SOM (Serviceable Obtainable Market)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">₹ INR (Indian Rupee)</span>
          </div>
          <div className="text-2xl font-black text-white">{validation.som.value}</div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Realistic achievable revenue if you capture your beachhead market segment over 36 months.
          </p>
        </div>

        {/* Card 2: Industry Growth Rate */}
        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Market Growth Velocity — CAGR (Compound Annual Growth Rate)
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">CAGR (Annual Growth)</span>
          </div>
          <div className="text-2xl font-black text-indigo-300">{validation.cagr}</div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Annual industry expansion rate. High velocity signals strong buyer urgency and expanding budgets.
          </p>
        </div>

        {/* Card 3: Top Competitor & Edge */}
        <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Your Unfair Moat
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Moat</span>
          </div>
          <div className="text-sm font-bold text-white line-clamp-2">
            {idea.innovationMoat || validation.competitors[0]?.ourDifferentiation || "AI & Cloud Architecture"}
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Primary strategic reason why buyers will choose you over {validation.competitors[0]?.name || "incumbents"}.
          </p>
        </div>

        {/* Card 4: Primary Buyer & Channel */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Primary Buyer Persona
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Buyer</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {targetUserAnalysis?.personaName || idea.targetPersona.title}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Budget: {targetUserAnalysis?.willingnessToPayRange || idea.targetPersona.willingnessToPay}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            Best Channel: {targetUserAnalysis?.acquisitionChannels[0]?.channel || "Direct Outbound"}
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation for Market, Competitors, and Target Users */}
      <div className="flex border-b border-slate-800 gap-3 sm:gap-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("market")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === "market"
              ? "border-emerald-400 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>1. Market Sizing &amp; Live Trends</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
            TAM / SAM / SOM (Market Sizing)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("competitors")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === "competitors"
              ? "border-indigo-400 text-indigo-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>2. Competitor Battlecard &amp; Moat</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-400 font-mono">
            {validation.competitors.length} Rivals
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === "users"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Target Customer &amp; Buying Journey</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-400 font-mono">
            Persona &amp; CAC (Customer Acquisition Cost)
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MARKET ANALYSIS & SIZING */}
      {/* ========================================================================= */}
      {activeTab === "market" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Visual Market Sizing Funnel & Growth Speed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Visual Market Sizing Funnel: From Global Universe to Your 3-Year Goal
                </h3>
                <p className="text-xs text-slate-400">
                  How big is this industry overall, how much is reachable right now, and what can you realistically achieve?
                </p>
              </div>
            </div>

            {/* Stepped Sizing Hierarchy Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Level 1: TAM */}
              <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-800/20 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" /> Level 1 · Universe
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/60">
                      TAM (Total Addressable Market)
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{validation.tam.value}</div>
                  <div className="text-xs font-semibold text-indigo-300">Total Addressable Market</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{validation.tam.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>The 100% boundary of all global spend for this problem category.</span>
                </div>
              </div>

              {/* Level 2: SAM */}
              <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-cyan-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-cyan-500/50 transition">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" /> Level 2 · Reachable
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60">
                      SAM (Serviceable Addressable Market)
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-300">{validation.sam.value}</div>
                  <div className="text-xs font-semibold text-cyan-300">Serviceable Addressable Market</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{validation.sam.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-cyan-300/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Customers who fit your specific geographic and tech profile.</span>
                </div>
              </div>

              {/* Level 3: SOM */}
              <div className="p-5 rounded-2xl glass-panel border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900/90 to-emerald-950/30 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-lg shadow-emerald-950/30 group hover:border-emerald-400 transition">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Level 3 · Realistic 3-Year Target
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/50">
                      SOM Target (Serviceable Obtainable Market)
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">{validation.som.value}</div>
                  <div className="text-xs font-semibold text-emerald-300">Serviceable Obtainable Market (36 Months)</div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{validation.som.description}</p>
                </div>
                <div className="pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                  <span>Your concrete business revenue goal if you capture 1-3% market share.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Segments Priority Breakdown */}
          {targetSegments && targetSegments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Target Customer Segments &amp; Sales Velocity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Who should you sell to first? Start with segments that have Critical urgency and fast sales cycles.
                  </p>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {targetSegments.length} Segments Profiled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targetSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 transition space-y-3 bg-slate-950/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Segment {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{seg.segment}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            seg.urgency === "Critical"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : seg.urgency === "High"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          }`}
                        >
                          {seg.urgency} Urgency
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          {seg.sizeShare} Share
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/70">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sales Cycle Duration:</span>
                        <span className="font-semibold text-slate-200">{seg.salesCycle}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Founder Strategy:</span>
                        <span className="font-medium text-emerald-400">
                          {seg.urgency === "Critical" || seg.salesCycle.includes("week")
                            ? "🎯 Target First (Beachhead)"
                            : "Scale After Launch"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regional & Strategic Market Dynamics */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Strategic Market Forces &amp; Regional Location Intelligence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strategic Summary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Market Dynamics &amp; Tailwinds</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {validation.marketSummary}
                </p>
              </div>

              {/* Regional Dynamics (if present) */}
              {regionalMarketDynamics ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span>Regional Ecosystem Intelligence</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {regionalMarketDynamics}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Globe className="w-4 h-4" />
                    <span>Global Industry Expansion</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Demand is scaling rapidly across modern cloud native teams and technology enterprises seeking automated efficiency.
                  </p>
                </div>
              )}
            </div>

            {/* Tavily Web Intelligence (if present) */}
            {validation.tavilyResearchSummary && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-3 shadow-lg">
                <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-cyan-300">Tavily Live Web Intelligence Synthesis</strong>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold border border-cyan-500/30">
                      Real-Time Web Evidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{validation.tavilyResearchSummary}</p>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time API Market Trends & Signals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Live Industry Trends &amp; Research Citations
              </h3>
              <div className="flex items-center gap-2">
                {validation.usedTavily && (
                  <span className="text-[11px] text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 font-semibold">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    Tavily Verified
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Signals Connected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {validation.realTimeTrends.map((trend, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl glass-panel border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {trend.source}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          trend.sentiment === "Bullish"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {trend.sentiment}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-snug">
                      {trend.headline}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-medium">{trend.growthSignal}</span>
                    {trend.url && (
                      <a
                        href={trend.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation Footer Helper */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setActiveTab("competitors");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 hover:text-white transition text-xs font-semibold flex items-center gap-2"
            >
              <span>Next: Explore Competitor Battlecard &amp; Moat</span>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPETITOR ANALYSIS & FEATURE BATTLECARD */}
      {/* ========================================================================= */}
      {activeTab === "competitors" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Unfair Moat Highlight Banner */}
          <div className="p-5 rounded-2xl glass-panel border border-indigo-500/40 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Core Moat &amp; Defensibility Strategy
                </span>
                <h4 className="text-base font-bold text-white">
                  Why Customers Will Pick {idea.name} Over Incumbents
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {idea.innovationMoat || "Combining automated real-time intelligence with modular cloud architectures."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setCompetitorFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  competitorFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                All Rivals ({validation.competitors.length})
              </button>
              <button
                type="button"
                onClick={() => setCompetitorFilter("Direct")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  competitorFilter === "Direct"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                Direct Threats
              </button>
              <button
                type="button"
                onClick={() => setCompetitorFilter("Indirect")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  competitorFilter === "Indirect"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                Indirect Alternatives
              </button>
            </div>
          </div>

          {/* Competitor Cards Grid (Easy to scan side-by-side) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Competitor Weaknesses vs. Your Strategic Superpower
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCompetitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 bg-slate-950/70 shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header: Name + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-extrabold text-white">{comp.name}</h4>
                        <span className="text-[11px] text-slate-400 block">{comp.fundingOrScale}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          comp.type === "Direct"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {comp.type} Rival
                      </span>
                    </div>

                    {/* Competitor Strength (if available) */}
                    {comp.strengths && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          💪 Their Current Strength
                        </span>
                        <p className="text-slate-300">{comp.strengths}</p>
                      </div>
                    )}

                    {/* Competitor Vulnerability */}
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                        ⚠️ Their Vulnerability / Weakness
                      </span>
                      <p className="text-slate-200">{comp.weaknesses}</p>
                    </div>

                    {/* Our Advantage */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                        🚀 Your Unfair Advantage
                      </span>
                      <p className="text-emerald-200 font-medium">{comp.ourDifferentiation}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Positioning Battlecard #{idx + 1}</span>
                    <span className="text-indigo-400 font-semibold">Ready for Pitch Deck</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Feature Comparison Matrix (Battlecard) */}
          {competitorComparisonMatrix && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Product Capability &amp; Architecture Comparison Battlecard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Feature-by-feature proof demonstrating why your technology stack outpaces competitors.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ✨ 100% Core Moat Advantage
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-indigo-500/30 bg-slate-950/80 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Key Capability / Architecture</th>
                      <th className="px-4 py-3 font-bold text-emerald-400 bg-emerald-500/10 border-x border-emerald-500/20">
                        {idea.name} (Our Product)
                      </th>
                      {competitorComparisonMatrix.competitors.map((c, i) => (
                        <th key={i} className="px-4 py-3 font-semibold text-slate-400">
                          {c.name.split("(")[0].trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-300">
                    {competitorComparisonMatrix.features.map((feat, fIdx) => (
                      <tr key={fIdx} className="hover:bg-slate-900/40 transition">
                        <td className="px-4 py-3 font-medium text-white">{feat}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/15">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Native Support
                          </span>
                        </td>
                        {competitorComparisonMatrix.competitors.map((c, cIdx) => {
                          const val = c.scores[feat];
                          return (
                            <td key={cIdx} className="px-4 py-3 text-slate-400">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                                    <Check className="w-3.5 h-3.5" /> Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-rose-400 gap-1 font-semibold">
                                    <X className="w-3.5 h-3.5" /> No
                                  </span>
                                )
                              ) : (
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Navigation Footer Helper */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("market");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Market Sizing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:text-white transition text-xs font-semibold flex items-center gap-2"
            >
              <span>Next: Understand Target Customers &amp; Buying Journey</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TARGET USER ANALYSIS & BUYING JOURNEY */}
      {/* ========================================================================= */}
      {activeTab === "users" && targetUserAnalysis && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Persona Header Dossier Card */}
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-600/30 font-bold text-xl">
                {targetUserAnalysis.personaName.charAt(0) || "P"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Primary Buyer Persona
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300">{targetUserAnalysis.organizationType}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{targetUserAnalysis.personaName}</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {targetUserAnalysis.roleTitle}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center flex-shrink-0 shadow-inner">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Target Willingness to Pay
              </span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                {targetUserAnalysis.willingnessToPayRange}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-medium">Budget Confirmed</span>
            </div>
          </div>

          {/* Customer Pain Points vs Buying Catalysts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: What Hurts (Pain Points) */}
            <div className="p-5 rounded-2xl glass-panel border border-rose-500/30 space-y-3 bg-slate-950/60 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400" /> Acute Daily Frustrations &amp; Pain Points
                </h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                  Why They Need You
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {targetUserAnalysis.acutePainPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✕
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: What Triggers Purchase (Buying Catalysts) */}
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-3 bg-slate-950/60 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Purchase Catalysts (When They Buy)
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  High Conversion Moments
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {targetUserAnalysis.buyingTriggerMoments.map((trigger, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Adoption Friction & Counter-Strategy (if present) */}
          {targetUserAnalysis.adoptionFriction && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-amber-300 block">Anticipated Adoption Friction &amp; Objections:</strong>
                <p className="text-slate-300">{targetUserAnalysis.adoptionFriction}</p>
                <div className="text-[11px] text-indigo-300 pt-1">
                  💡 <em>Recommendation: Provide zero-friction 1-click cloud sandbox setups and automated onboarding tours to dissolve this hesitation.</em>
                </div>
              </div>
            </div>
          )}

          {/* Customer Acquisition Channels with Plain-English CAC */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Customer Acquisition Channels &amp; Target CAC (Customer Acquisition Cost)
                </h4>
                <p className="text-xs text-slate-400">
                  How you reach this buyer, expected cost per acquisition (CAC), and channel effectiveness.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Healthy benchmark: LTV (Customer Lifetime Value) should exceed 3x CAC (Customer Acquisition Cost)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {targetUserAnalysis.acquisitionChannels.map((channel, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl glass-panel border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition bg-slate-950/60"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Channel #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          channel.effectiveness === "High"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : channel.effectiveness === "Medium"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {channel.effectiveness} ROI (Return on Investment)
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-snug">{channel.channel}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Est. CAC (Customer Acquisition Cost):</span>
                    <span className="text-emerald-400 font-bold font-mono">{channel.estimatedCac}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Makers & Retention Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Buying Decision Makers */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Buying Decision Makers &amp; Stakeholders
                </span>
                <span className="text-[10px] text-slate-500">Sign-off Team</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                People who influence or have veto power over adopting this product:
              </p>
              <ul className="space-y-1.5 text-slate-200">
                {targetUserAnalysis.decisionMakers.map((dm, i) => (
                  <li key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-medium">{dm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Retention Drivers */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Long-Term Retention &amp; Negative Churn
                </span>
                <span className="text-[10px] text-emerald-400/80">Sticky Product</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Why users keep renewing and never switch to competitors:
              </p>
              <ul className="space-y-1.5 text-slate-200">
                {targetUserAnalysis.retentionDrivers.map((rd, i) => (
                  <li key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium">{rd}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Action Helper */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("competitors");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Competitors</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={isEvaluatingCloud}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <span>Ready! Proceed to Cloud Feasibility &amp; Scoring</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
