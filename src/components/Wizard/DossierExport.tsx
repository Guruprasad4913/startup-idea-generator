"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  FolderHeart,
  Printer,
  Sparkles,
  ArrowLeft,
  Share2,
  Cloud,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Globe,
  Radio,
  ExternalLink,
  Layers,
  DollarSign,
  AlertTriangle,
  MapPin,
  Scale,
  Users,
  Award,
  Rocket,
  Milestone,
  Calendar,
  X,
  Zap,
  Mail,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { StartupProject, User } from "@/types";
import { exportProjectAsMarkdown, saveProjectToVault } from "@/lib/storage";

interface DossierExportProps {
  project: StartupProject;
  currentUser?: User | null;
  onRestart: () => void;
  onProjectSaved: () => void;
  onBack: () => void;
  onOpenCompare?: () => void;
}

export const DossierExport: React.FC<DossierExportProps> = ({
  project,
  currentUser,
  onRestart,
  onProjectSaved,
  onBack,
  onOpenCompare,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { selectedIdea, validation, feasibility, founderProfile } = project;
  const loc = project.targetLocation || founderProfile.targetLocation;

  const handleCopyMarkdown = () => {
    const md = exportProjectAsMarkdown(project);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    const activeUsername = project.username || currentUser?.username;
    const activeUserId = project.userId || currentUser?.id || currentUser?._id;
    const enrichedProject: StartupProject = {
      ...project,
      username: activeUsername,
      userId: activeUserId,
    };
    saveProjectToVault(enrichedProject, currentUser);
    setSaved(true);
    onProjectSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print glass-panel rounded-3xl p-5 sm:p-6 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-[#17181f] via-[#1c1d25] to-[#17181f] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-80 h-32 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Institutional Venture Memorandum</h2>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> 14-Stage Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Export, preserve in Cloud Vault, compare concepts, or download print-ready venture memo</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onBack}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-950/50 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare Ideas</span>
            </button>
          )}

          <button
            onClick={handleSaveToVault}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${
              saved
                ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                : "bg-slate-900 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40 hover:border-emerald-500"
            }`}
            title="Save this report to your portfolio for quick access anytime"
          >
            <FolderHeart className="w-3.5 h-3.5" />
            <span>{saved ? "✓ Saved to My Reports!" : "Save Report"}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 hover:border-indigo-400 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
            title="Copy formatted report to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition flex items-center gap-1.5 cursor-pointer"
            title="Download report as PDF or send to printer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Printable Dossier Container */}
      <div className="print-page glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-10 shadow-2xl bg-slate-950/90 text-slate-100 relative overflow-hidden">
        {/* Cover Header */}
        <div className="border-b border-slate-800/90 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                CONFIDENTIAL VENTURE MEMO
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-medium">{selectedIdea.domain}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {selectedIdea.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              {selectedIdea.tagline}
            </p>

            {/* Target Location & Founder Email Badge */}
            <div className="pt-1.5 flex items-center gap-2 flex-wrap text-xs text-slate-300">
              {loc && (
                <>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{loc.city}, {loc.country}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[11px] font-mono font-bold">
                    Ecosystem Score {loc.ecosystemScore}/100
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 text-[11px] font-mono">{loc.talentIndex} Talent</span>
                </>
              )}
              {project.founderProfile?.founderEmail && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-[11px] font-mono">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>{project.founderProfile.founderEmail}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Feasibility Verdict Pill */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center flex sm:flex-col items-center justify-between gap-4 sm:gap-2 flex-shrink-0 shadow-xl shadow-slate-950/50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Viability Index</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">{feasibility.overallScore}<span className="text-xs text-slate-500">/100</span></div>
            <div className="text-xs font-extrabold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {feasibility.verdict}
            </div>
          </div>
        </div>

        {/* Section 1: Problem-Solution Fit */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 1. Executive Problem & Solution Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">The Acute Market Problem</div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{selectedIdea.problemStatement}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-indigo-500/30 space-y-2">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">The AI (Artificial Intelligence) + Cloud Solution</div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{selectedIdea.solution}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Target Buyer Persona</span>
              <div className="text-white font-medium">{selectedIdea.targetPersona.title}</div>
              <div className="text-emerald-400 pt-1">Willingness to Pay: {selectedIdea.targetPersona.willingnessToPay}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Timing Catalyst (Why Now)</span>
              <div className="text-slate-300">{selectedIdea.whyNow}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Defensible Innovation Moat</span>
              <div className="text-slate-300">{selectedIdea.innovationMoat}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Market Opportunity & API Signals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 2. Market Sizing, Growth Funnel &amp; Customer Segments
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Verified Demand Telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold">TAM (Total Addressable Market)</span>
                <span className="text-[10px] text-indigo-400 font-mono">100% Total</span>
              </div>
              <div className="text-2xl font-extrabold text-white">{validation.tam.value}</div>
              <p className="text-[11px] text-slate-300 leading-snug">{validation.tam.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 uppercase font-bold">SAM (Serviceable Addressable)</span>
                <span className="text-[10px] text-cyan-400 font-mono">Current Tech</span>
              </div>
              <div className="text-2xl font-extrabold text-cyan-300">{validation.sam.value}</div>
              <p className="text-[11px] text-slate-300 leading-snug">{validation.sam.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 space-y-1 bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 uppercase font-bold">SOM (Serviceable Obtainable)</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">🎯 3-Yr Goal</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{validation.som.value}</div>
              <p className="text-[11px] text-slate-200 leading-snug font-medium">{validation.som.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 uppercase font-bold">CAGR (Annual Growth Rate)</span>
                <span className="text-[10px] text-indigo-300 font-mono">Annual</span>
              </div>
              <div className="text-2xl font-extrabold text-indigo-300">{validation.cagr}</div>
              <p className="text-[11px] text-slate-300 leading-snug">High velocity industry expansion rate</p>
            </div>
          </div>

          {/* Customer Segments Priority Breakdown */}
          {validation.targetSegments && validation.targetSegments.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Customer Segment</th>
                    <th className="px-4 py-2.5">Market Share</th>
                    <th className="px-4 py-2.5">Urgency</th>
                    <th className="px-4 py-2.5">Sales Cycle</th>
                    <th className="px-4 py-2.5 text-emerald-400">Recommended Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {validation.targetSegments.map((seg, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-bold text-white">{seg.segment}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-300">{seg.sizeShare}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            seg.urgency === "Critical"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : seg.urgency === "High"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          }`}
                        >
                          {seg.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">{seg.salesCycle}</td>
                      <td className="px-4 py-2.5 text-emerald-300 font-medium">
                        {seg.urgency === "Critical" || seg.salesCycle.includes("week")
                          ? "🎯 Beachhead (Target First)"
                          : "Scale Segment"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {validation.regionalMarketDynamics && (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Regional Ecosystem Dynamics: </strong>
              {validation.regionalMarketDynamics}
            </div>
          )}
        </div>

        {/* Section 3: Competitive Differentiation & Battlecard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 3. Competitive Landscape &amp; Defensibility Matrix
            </h2>
            <span className="text-[11px] text-indigo-300 font-medium">
              Moat: {selectedIdea.innovationMoat || "Architectural Advantage"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Competitor</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5 text-slate-400">Their Vulnerability</th>
                  <th className="px-4 py-2.5 text-emerald-400">Our Strategic Superpower</th>
                  <th className="px-4 py-2.5">Scale / Funding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {validation.competitors.map((c, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2.5 font-bold text-white whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          c.type === "Direct"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{c.weaknesses}</td>
                    <td className="px-4 py-2.5 text-emerald-300 font-semibold">{c.ourDifferentiation}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">{c.fundingOrScale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitor Feature Comparison Battlecard (if available) */}
          {validation.competitorComparisonMatrix && (() => {
            const totalFeatures = validation.competitorComparisonMatrix.features.length || 1;
            const compChartData = [
              {
                name: `${selectedIdea.name} (Our Product)`,
                coverage: 100,
                supportedCount: totalFeatures,
                total: totalFeatures,
                isOurProduct: true,
                color: "#10b981",
              },
              ...validation.competitorComparisonMatrix.competitors.map((c, cIdx) => {
                let count = 0;
                validation.competitorComparisonMatrix!.features.forEach((feat) => {
                  const val = c.scores[feat];
                  if (val === true) count += 1;
                  else if (typeof val === "string" && val.toLowerCase() !== "false" && val.toLowerCase() !== "no") count += 0.5;
                });
                const pct = Math.min(100, Math.round((count / totalFeatures) * 100));
                const colors = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899"];
                return {
                  name: c.name.split("(")[0].trim(),
                  coverage: pct,
                  supportedCount: Math.round(count * 10) / 10,
                  total: totalFeatures,
                  isOurProduct: false,
                  color: colors[cIdx % colors.length],
                };
              }),
            ];

            return (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Competitive Capability Coverage &amp; Moat Index
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ✨ 100% Native Architecture
                  </span>
                </div>

                {/* Capability Comparison Bar Chart */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181a28] to-[#12131d] border border-indigo-500/30">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={compChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          stroke="#64748b"
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#64748b"
                          width={140}
                          tick={{ fill: "#cbd5e1", fontSize: 10 }}
                        />
                        <Tooltip
                          formatter={(val: any, _name: any, item: any) => [
                            `${val}% (${item.payload.supportedCount}/${item.payload.total} capabilities supported)`,
                            "Capability Coverage",
                          ]}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#3b82f6",
                            borderRadius: "0.5rem",
                            fontSize: "11px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="coverage" radius={[0, 6, 6, 0]} maxBarSize={22}>
                          {compChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke={entry.isOurProduct ? "#34d399" : undefined}
                              strokeWidth={entry.isOurProduct ? 1.5 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-indigo-500/30 bg-slate-950/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Key Capability / Architecture</th>
                        <th className="px-4 py-2.5 font-bold text-emerald-400 bg-emerald-500/10">
                          {selectedIdea.name} (Our Product)
                        </th>
                        {validation.competitorComparisonMatrix.competitors.map((c, i) => (
                          <th key={i} className="px-4 py-2.5 font-semibold text-slate-400">
                            {c.name.split("(")[0].trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-slate-300">
                      {validation.competitorComparisonMatrix.features.map((feat, fIdx) => (
                        <tr key={fIdx}>
                          <td className="px-4 py-2 font-medium text-white">{feat}</td>
                          <td className="px-4 py-2 font-bold text-emerald-400 bg-emerald-500/5">
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Native Support
                            </span>
                          </td>
                          {validation.competitorComparisonMatrix?.competitors.map((c, cIdx) => {
                            const val = c.scores[feat];
                            return (
                              <td key={cIdx} className="px-4 py-2 text-slate-400">
                                {typeof val === "boolean" ? (
                                  val ? (
                                    <span className="inline-flex items-center text-emerald-400 gap-1">
                                      <Check className="w-3.5 h-3.5" /> Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-rose-400 gap-1">
                                      <X className="w-3.5 h-3.5" /> No
                                    </span>
                                  )
                                ) : (
                                  <span>{val}</span>
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
            );
          })()}
        </div>

        {/* Section 4: Target User Persona & Buying Journey */}
        {validation.targetUserAnalysis && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Users className="w-4 h-4" /> 4. Target User Persona, Buying Journey &amp; CAC (Customer Acquisition Cost)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Buyer Persona</span>
                <div className="text-white font-bold text-sm">{validation.targetUserAnalysis.personaName}</div>
                <div className="text-slate-300">{validation.targetUserAnalysis.roleTitle}</div>
                <div className="text-slate-400">{validation.targetUserAnalysis.organizationType}</div>
                <div className="text-emerald-400 pt-1 font-semibold">
                  Budget: {validation.targetUserAnalysis.willingnessToPayRange}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400">Acute Customer Pain Points</span>
                <ul className="space-y-1.5 text-slate-300">
                  {validation.targetUserAnalysis.acutePainPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span className="line-clamp-2">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Top Acquisition Channels &amp; Target CAC</span>
                <ul className="space-y-2 text-slate-300">
                  {validation.targetUserAnalysis.acquisitionChannels.map((ch, i) => (
                    <li key={i} className="flex items-center justify-between pt-1 border-b border-slate-800/60 pb-1 last:border-0">
                      <div>
                        <span className="text-white font-medium block">{ch.channel}</span>
                        <span className="text-[10px] text-indigo-300">{ch.effectiveness} ROI (Return on Investment)</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">CAC: {ch.estimatedCac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Decision Makers & Long-Term Retention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Buying Decision Makers</span>
                <div className="flex flex-wrap gap-1.5">
                  {validation.targetUserAnalysis.decisionMakers.map((dm, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {dm}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Long-Term Retention Drivers</span>
                <div className="flex flex-wrap gap-1.5">
                  {validation.targetUserAnalysis.retentionDrivers.map((rd, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/20 text-emerald-300 text-[11px]">
                      {rd}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Revenue Model & Unit Economics */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> 5. Revenue Model &amp; Unit Economics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">CAC (Customer Acquisition Cost)</span>
              <div className="text-sm font-bold text-white mt-0.5">{feasibility.revenueModel.keyUnitEconomics.cacEstimate}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">LTV (Customer Lifetime Value)</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{feasibility.revenueModel.keyUnitEconomics.ltvEstimate}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">LTV : CAC Ratio</span>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{feasibility.revenueModel.keyUnitEconomics.ltvCacRatio}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Gross Margin</span>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">{feasibility.revenueModel.keyUnitEconomics.grossMargin}</div>
            </div>
          </div>
        </div>

        {/* Section 6: Cloud Architecture & APIs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 6. Cloud Architecture Blueprint &amp; API (Application Programming Interface) Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Cloud Provider & Compute</span>
              <div className="text-white font-medium">{feasibility.cloudArchitecture.recommendedProvider}</div>
              <div className="text-slate-300 text-[11px]">{feasibility.cloudArchitecture.compute}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Database & Vector Storage</span>
              <div className="text-white font-medium">{feasibility.cloudArchitecture.database}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Monthly Cloud Run-Rate — MVP (Minimum Viable Product)</span>
              <div className="text-emerald-400 font-bold text-base">{feasibility.cloudArchitecture.estimatedMonthlyCloudCost.mvp}</div>
            </div>
          </div>
        </div>

        {/* Section 7: AI Scoring Engine Breakdown */}
        {feasibility.scoringEngine && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> 7. AI (Artificial Intelligence) Scoring Engine Breakdown (Score: {feasibility.scoringEngine.viabilityScore}/100)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {feasibility.scoringEngine.factors.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 block truncate">{f.name}</span>
                  <div className="text-lg font-black text-emerald-400">{f.score}%</div>
                  <div className="text-[9px] text-slate-500">Weight: {f.weight}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 8: MVP Recommendation & Sprint Plan */}
        {feasibility.mvpRecommendation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Rocket className="w-4 h-4" /> 8. MVP (Minimum Viable Product) Recommendation, MoSCoW Scope &amp; Execution Sprint Plan
              </h2>
              <span className="text-[11px] text-indigo-300 font-semibold">
                {feasibility.mvpRecommendation.timelineWeeks} Weeks to Production Launch
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-bold text-white text-sm block">{feasibility.mvpRecommendation.mvpName}</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{feasibility.mvpRecommendation.coreValueProposition}</p>
                </div>
                {(() => {
                  const tf = (feasibility.mvpRecommendation.timeframe || project.founderProfile.timeframe || "").toLowerCase();
                  const is2W = tf.includes("2-week") || tf.includes("2 week") || tf.includes("14") || feasibility.mvpRecommendation.timelineWeeks === 2;
                  const is30D = tf.includes("30-day") || tf.includes("30 day") || tf.includes("4-week") || tf.includes("4 week") || feasibility.mvpRecommendation.timelineWeeks === 4;
                  const is6M = tf.includes("6 month") || tf.includes("enterprise") || tf.includes("24 week") || tf.includes("180") || feasibility.mvpRecommendation.timelineWeeks === 24;
                  const targetText = is2W ? "14 Days to Launch" : is30D ? "30 Days to Cashflow" : is6M ? "180 Days to Staging" : "60-90 Days to Beta";
                  return (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 text-[11px] flex-shrink-0">
                      Target: {targetText}
                    </span>
                  );
                })()}
              </div>

              {/* MoSCoW Scope Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Must-Have (Day 1 Essential)</span>
                  <ul className="space-y-1 text-slate-200 text-[11px]">
                    {feasibility.mvpRecommendation.featureBacklog.mustHave.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 block">Should-Have (Sprint 2 Retention)</span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {feasibility.mvpRecommendation.featureBacklog.shouldHave.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Could-Have (Future Backlog)</span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {feasibility.mvpRecommendation.featureBacklog.couldHave.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Phased Sprint Plan */}
              <div className={`grid gap-2 pt-2 border-t border-slate-800 ${
                feasibility.mvpRecommendation.fourWeekSprintPlan.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : feasibility.mvpRecommendation.fourWeekSprintPlan.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
              }`}>
                {feasibility.mvpRecommendation.fourWeekSprintPlan.map((sp) => (
                  <div key={sp.week} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold block">{sp.periodLabel || `Week 0${sp.week}`}</span>
                    <div className="text-white font-medium text-[11px] truncate">{sp.title}</div>
                    <div className="text-slate-400 text-[10px] line-clamp-2">{sp.deliverable}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 9: 12-Month Business Roadmap */}
        {feasibility.businessRoadmap && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Milestone className="w-4 h-4" /> 9. 12-Month Phased Business Roadmap &amp; Financing Targets
              </h2>
              <span className="text-[11px] text-emerald-300 font-semibold">4 Sequenced Growth Phases</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {feasibility.businessRoadmap.phases.map((ph) => (
                <div key={ph.phase} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Phase 0{ph.phase}: {ph.title}</span>
                    <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                      {ph.timeframe}
                    </span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {ph.milestones.map((m, mi) => (
                      <li key={mi} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Target KPIs (Key Performance Indicators):</span>
                    <span className="text-white font-mono font-medium">{ph.keyMetrics}</span>
                  </div>
                  <div className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <span>Funding Goal:</span>
                    <span className="text-white">{ph.fundingGoal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 10: Actionable Founder Next Steps */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 10. Immediate 14-Day Founder Validation Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {feasibility.goNextSteps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>Generated by AI (Artificial Intelligence) + API (Application Programming Interface) + Cloud Startup Validator Engine</div>
          <div>Confidential & Proprietary Institutional Founder Report</div>
        </div>
      </div>

      {/* Restart Button (Hidden when printing) */}
      <div className="no-print flex justify-center pt-4 gap-3">
        {onOpenCompare && (
          <button
            onClick={onOpenCompare}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
          >
            <Scale className="w-4 h-4" />
            <span>Compare with Other Ideas</span>
          </button>
        )}
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition text-sm font-semibold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Validate Another Startup Idea</span>
        </button>
      </div>
    </div>
  );
};
