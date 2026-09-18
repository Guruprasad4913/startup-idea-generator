"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud,
  Cpu,
  Database,
  Server,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Activity,
  Layers,
  Sparkles,
  FileCheck,
  TrendingUp,
  Award,
  Sliders,
  ShieldAlert,
  HelpCircle,
  Check,
} from "lucide-react";
import { StartupIdea, FeasibilityReport, ScoringFactor } from "@/types";

interface StepCloudFeasibilityProps {
  idea: StartupIdea;
  feasibility: FeasibilityReport;
  onNext: () => void;
  onBack: () => void;
}

export const StepCloudFeasibility: React.FC<StepCloudFeasibilityProps> = ({
  idea,
  feasibility,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"scoring" | "cloud" | "revenue" | "risks">("scoring");

  // Interactive Scoring Engine State
  const defaultFactors = feasibility.scoringEngine?.factors || [
    { id: "tech", name: "Technical Feasibility", score: 86, weight: 20, impact: "Positive", rationale: "Serverless cloud primitives and verified API (Application Programming Interface) models ensure rapid buildability." },
    { id: "market", name: "Market Demand & Timing", score: 84, weight: 25, impact: "Positive", rationale: "Strong sector CAGR (Compound Annual Growth Rate) and acute customer urgency create an open commercial window." },
    { id: "financial", name: "Unit Economics & Monetization", score: 85, weight: 25, impact: "Positive", rationale: "High gross software margin (84%+) and 11.3x LTV : CAC (Lifetime Value to Customer Acquisition Cost Ratio) ensure capital efficiency." },
    { id: "regulatory", name: "Regulatory & Compliance Moat", score: 76, weight: 15, impact: "Neutral", rationale: "Clear path through regional regulatory sandboxes with proactive data privacy." },
    { id: "execution", name: "Speed to MVP (Minimum Viable Product) Velocity", score: 80, weight: 15, impact: "Positive", rationale: "4-week rapid sprint roadmap utilizing low-code accelerators enables fast time-to-market." },
  ];

  const [factors, setFactors] = useState<ScoringFactor[]>(defaultFactors);

  // Dynamic calculated score based on interactive weights
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const calculatedViabilityScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight), 0) / (totalWeight || 1)
  );

  // Dynamic Runway Calculator State
  const [blendedPrice, setBlendedPrice] = useState<number>(89);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(25);

  const calculateProjectedRunway = () => {
    let users = 40;
    const months = ["M1", "M2", "M3", "M4", "M6", "M8", "M10", "M12"];
    return months.map((m) => {
      const revenue = Math.round(users * blendedPrice);
      const cost = Math.round(400 + users * 8 + (revenue * 0.12));
      const margin = revenue > cost ? Math.round(((revenue - cost) / revenue) * 100) : 0;
      users = Math.round(users * (1 + monthlyGrowthRate / 100));
      return { month: m, users, revenue, cost, margin };
    });
  };

  const dynamicRunway = calculateProjectedRunway();

  const handleWeightChange = (id: string, newWeight: number) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, weight: Math.max(5, Math.min(60, newWeight)) } : f))
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            Step 4 of 6: Feasibility, Revenue & AI (Artificial Intelligence) Scoring Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Viability Blueprint for <span className="text-indigo-400">{idea.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Algorithmic viability scoring, cloud topology blueprints, unit economics simulator, and 2x2 risk matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <span>Proceed to MVP (Minimum Viable Product) & Business Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Prominent Viability Gauge & Verdict Banner (82/100) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-slate-950 via-slate-900/95 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Circular Viability Speedometer / Gauge */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            {/* Ambient circular glow */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <svg className="w-36 h-36 transform -rotate-90 relative" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gaugeGradient)"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * calculatedViabilityScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {calculatedViabilityScore}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                / 100 SCORE
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Institutional Viability Index
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {feasibility.verdict}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Top Decile Venture
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {feasibility.verdictSummary}
            </p>
          </div>
        </div>

        {/* 5-Factor Quick Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5 w-full md:w-auto">
          {factors.map((f) => (
            <div key={f.id} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-center hover:border-slate-700 transition">
              <div className="text-[10px] text-slate-400 truncate font-medium">{f.name.split(" ")[0]}</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">{f.score}%</div>
              <div className="text-[9px] text-slate-500 font-mono">Weight {f.weight}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("scoring")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "scoring"
              ? "border-emerald-400 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          1. AI (Artificial Intelligence) Scoring Engine (82/100)
        </button>
        <button
          onClick={() => setActiveTab("cloud")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "cloud"
              ? "border-cyan-400 text-cyan-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cloud className="w-4 h-4" />
          {idea.businessType && idea.businessType !== "Tech & Software"
            ? "2. Operations & Systems Blueprint"
            : "2. Technical Feasibility & Cloud Blueprint"}
        </button>
        <button
          onClick={() => setActiveTab("revenue")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "revenue"
              ? "border-emerald-400 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          3. Revenue Model & Runway Simulator
        </button>
        <button
          onClick={() => setActiveTab("risks")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "risks"
              ? "border-amber-400 text-amber-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          4. 2x2 Risk Analysis Matrix
        </button>
      </div>

      {/* Tab 1: AI Scoring Engine Breakdown */}
      {activeTab === "scoring" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Algorithmic Scoring Engine & Multi-Factor Weights
              </h3>
              <p className="text-xs text-slate-400">
                Adjust sliders to model customized founder risk preferences and see instant score re-calculation.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Active Viability Index: {calculatedViabilityScore}/100
            </span>
          </div>

          <div className="space-y-3">
            {factors.map((factor) => (
              <div
                key={factor.id}
                className="p-5 rounded-3xl glass-panel-subtle border border-slate-800/80 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold flex items-center justify-center text-xs font-mono shadow-inner">
                      {factor.score}%
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{factor.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{factor.rationale}</p>
                    </div>
                  </div>

                  {/* Weight Slider Control */}
                  <div className="flex items-center gap-3 self-end sm:self-center bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Weight: <strong className="text-indigo-300 font-mono">{factor.weight}%</strong>
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={factor.weight}
                      onChange={(e) => handleWeightChange(factor.id, parseInt(e.target.value))}
                      className="w-24 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800/50">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart Summary Cards */}
          <div className="p-6 rounded-3xl glass-panel border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/20 space-y-2.5 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Scoring Engine Institutional Synthesis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              With a composite viability score of <strong className="text-emerald-400 font-bold">{calculatedViabilityScore}/100</strong>, this startup idea exceeds the top-quartile viability benchmark (Minimum institutional hurdle: 75/100). The combination of healthy operating unit economics, practical operational deployability, and favorable market window qualifies this venture as an institutional <span className="text-emerald-400 font-semibold">&quot;Strong Go&quot;</span>.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Technical Feasibility & Cloud Architecture */}
      {activeTab === "cloud" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Provider & Estimated Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                {idea.businessType && idea.businessType !== "Tech & Software"
                  ? "Operational & Systems Core"
                  : "Recommended Cloud Provider"}
              </span>
              <div className="text-base sm:text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                {feasibility.cloudArchitecture.recommendedProvider}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                {idea.businessType && idea.businessType !== "Tech & Software"
                  ? "MVP (Minimum Viable Product) Ops & Setup Cost"
                  : "MVP (Minimum Viable Product) Monthly Cloud Cost"}
              </span>
              <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1.5 font-mono">
                {feasibility.cloudArchitecture.estimatedMonthlyCloudCost.mvp}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Growth Stage (10k Users)
              </span>
              <div className="text-base sm:text-lg font-bold text-indigo-300 mt-1.5 font-mono">
                {feasibility.cloudArchitecture.estimatedMonthlyCloudCost.growth}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Scale Stage (100k+ Users)
              </span>
              <div className="text-base sm:text-lg font-bold text-purple-300 mt-1.5 font-mono">
                {feasibility.cloudArchitecture.estimatedMonthlyCloudCost.scale}
              </div>
            </div>
          </div>

          {/* Interactive Cloud Architecture Diagram Visualizer */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              {idea.businessType && idea.businessType !== "Tech & Software"
                ? "Operational & Systems Architecture Blueprint (5 Tiers)"
                : "Cloud Infrastructure Topology Blueprint (5 Tiers)"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {feasibility.cloudArchitecture.diagramComponents.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/30 transition-all duration-200 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                      {comp.category}
                    </span>
                    <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{comp.details}</p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Tier 0{idx + 1}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third-Party APIs Integrated */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Essential Third-Party APIs (Application Programming Interfaces) &amp; Integration Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feasibility.cloudArchitecture.thirdPartyAPIs.map((api, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-indigo-500/40 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{api.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{api.purpose}</div>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-mono font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 whitespace-nowrap">
                    {api.costTier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Revenue Model & Interactive Runway Simulator */}
      {activeTab === "revenue" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Unit Economics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                CAC (Customer Acquisition Cost)
              </span>
              <div className="text-base sm:text-lg font-bold text-amber-400 mt-1 font-mono">
                {feasibility.revenueModel.keyUnitEconomics.cacEstimate}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                LTV (Customer Lifetime Value)
              </span>
              <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1 font-mono">
                {feasibility.revenueModel.keyUnitEconomics.ltvEstimate}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                LTV : CAC (Lifetime Value to Acquisition Cost Ratio)
              </span>
              <div className="text-base sm:text-lg font-bold text-cyan-400 mt-1 font-mono">
                {feasibility.revenueModel.keyUnitEconomics.ltvCacRatio}
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Gross Software Margin
              </span>
              <div className="text-base sm:text-lg font-bold text-indigo-400 mt-1 font-mono">
                {feasibility.revenueModel.keyUnitEconomics.grossMargin}
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Recommended Commercial Pricing Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feasibility.revenueModel.pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                    tier.highlighted
                      ? "bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/30 -translate-y-1"
                      : "glass-panel-subtle hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {tier.tier}
                      </span>
                      {tier.highlighted && (
                        <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-white font-mono">{tier.price}</span>
                      <span className="text-xs text-slate-400">{tier.billing}</span>
                    </div>
                    <ul className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Financial Runway Simulator */}
          <div className="space-y-4 p-6 rounded-3xl glass-panel border border-indigo-500/30 bg-slate-950/80 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Interactive 12-Month Runway &amp; ARR (Annual Recurring Revenue) Simulator
                </h4>
                <p className="text-xs text-slate-400">
                  Simulate dynamic subscriber growth and average revenue per account.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Blended ARPU (Avg Revenue Per User):</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={blendedPrice}
                    onChange={(e) => setBlendedPrice(parseInt(e.target.value) || 29)}
                    className="w-16 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Growth:</span>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={monthlyGrowthRate}
                    onChange={(e) => setMonthlyGrowthRate(parseInt(e.target.value) || 15)}
                    className="w-14 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-bold font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-slate-400 font-mono">% MoM (Month-over-Month)</span>
                </div>
              </div>
            </div>

            {/* Simulated Timeline Projection Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 pt-2">
              {dynamicRunway.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">{item.month}</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono">${item.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.users} Accts</div>
                  <div className="text-[9px] text-cyan-400 font-semibold font-mono">{item.margin}% Margin</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 2x2 Risk Matrix & Mitigation Blueprint */}
      {activeTab === "risks" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Visual 2x2 Risk Matrix Grid */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Visual 2x2 Risk Assessment Matrix (Severity vs Probability)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* High Severity / High Probability */}
              <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-2.5 shadow-lg shadow-rose-950/10">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <span>High Severity · High Probability</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-semibold border border-rose-500/30">Critical Priority</span>
                </div>
                <p className="text-xs font-bold text-white">Competitor Duplication &amp; Incumbent Speed</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-rose-300">Mitigation:</strong> Accelerate proprietary workflow integrations and private enterprise data lock-in that creates high switching barriers.
                </p>
              </div>

              {/* High Severity / Low Probability */}
              <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 shadow-lg shadow-amber-950/10">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <span>High Severity · Low Probability</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold border border-amber-500/30">Containment Plan</span>
                </div>
                <p className="text-xs font-bold text-white">Model Hallucination &amp; Erroneous Automated Actions</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">Mitigation:</strong> Enforce deterministic ground-truth verification loops with human-in-the-loop approval thresholds on irreversible mutations.
                </p>
              </div>

              {/* Low Severity / High Probability */}
              <div className="p-5 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5 shadow-lg shadow-indigo-950/10">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <span>Medium Severity · High Probability</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-mono font-semibold border border-indigo-500/30">Operational Guardrail</span>
                </div>
                <p className="text-xs font-bold text-white">API (Application Programming Interface) Rate Limiting &amp; Latency Bottlenecks</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300">Mitigation:</strong> Deploy Redis semantic caching layer with asynchronous background queue workers.
                </p>
              </div>

              {/* Low Severity / Low Probability */}
              <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 shadow-lg shadow-emerald-950/10">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <span>Low Severity · Low Probability</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-500/30">Standard Monitoring</span>
                </div>
                <p className="text-xs font-bold text-white">Cloud Infrastructure Cost Runaway</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-emerald-300">Mitigation:</strong> Serverless pay-as-you-go architecture with hard spend limits and automated billing anomaly alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Mitigations Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Comprehensive Risk Mitigation Strategy Table
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Identified Risk Factor</th>
                    <th className="px-4 py-3.5 font-semibold">Probability</th>
                    <th className="px-4 py-3.5 font-semibold">Severity</th>
                    <th className="px-4 py-3.5 font-semibold text-emerald-300">Concrete Mitigation Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {feasibility.risksAndMitigations.map((risk, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3.5 font-semibold text-white">{risk.risk}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/50">
                          {risk.probability}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${
                            risk.severity === "High"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {risk.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 leading-relaxed">{risk.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
