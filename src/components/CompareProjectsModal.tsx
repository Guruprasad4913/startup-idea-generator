"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Scale,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Globe,
  DollarSign,
  Layers,
  Rocket,
  ShieldCheck,
  Check,
  BarChart3,
  Activity,
  Zap,
  Copy,
  Sparkles,
  Clock,
  ArrowRight,
  PieChart as PieIcon,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { StartupProject } from "@/types";

interface CompareProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StartupProject[];
  currentProject?: StartupProject | null;
}

// Project color themes for chart comparison
const PROJECT_THEMES = [
  {
    stroke: "#06b6d4", // Cyan
    fill: "#06b6d4",
    fillOpacity: 0.22,
    gradientId: "compareGradCyan",
    badgeBg: "bg-cyan-500/15",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-300",
    name: "Cyan",
  },
  {
    stroke: "#6366f1", // Indigo
    fill: "#6366f1",
    fillOpacity: 0.22,
    gradientId: "compareGradIndigo",
    badgeBg: "bg-indigo-500/15",
    badgeBorder: "border-indigo-500/30",
    badgeText: "text-indigo-300",
    name: "Indigo",
  },
  {
    stroke: "#10b981", // Emerald
    fill: "#10b981",
    fillOpacity: 0.22,
    gradientId: "compareGradEmerald",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300",
    name: "Emerald",
  },
  {
    stroke: "#f59e0b", // Amber
    fill: "#f59e0b",
    fillOpacity: 0.22,
    gradientId: "compareGradAmber",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300",
    name: "Amber",
  },
];

// Helper to safely parse currency string to numeric value
function parseDollarValue(str?: string): number {
  if (!str) return 0;
  const match = str.match(/\$([0-9,]+(?:\.[0-9]+)?)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ""));
  }
  const matchNum = str.match(/([0-9,]+(?:\.[0-9]+)?)/);
  if (matchNum) {
    return parseFloat(matchNum[1].replace(/,/g, ""));
  }
  return 0;
}

// Helper to safely parse ratio string e.g. "5.2x" -> 5.2
function parseRatio(str?: string): number {
  if (!str) return 0;
  const match = str.match(/([0-9.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper to safely parse percentage string e.g. "82%" -> 82
function parsePercentage(str?: string): number {
  if (!str) return 0;
  const match = str.match(/([0-9.]+)\s*%/);
  return match ? parseFloat(match[1]) : 0;
}

export const CompareProjectsModal: React.FC<CompareProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProject,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"charts" | "matrix" | "split">("split");
  const [chartSubTab, setChartSubTab] = useState<"all" | "radar" | "market" | "revenue" | "economics">("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge all available projects (saved + currently active if not already in list)
  const allProjects = useMemo(() => {
    const list = [...projects];
    if (currentProject && !list.some((p) => p.id === currentProject.id)) {
      list.unshift(currentProject);
    }
    return list;
  }, [projects, currentProject]);

  // Pre-select first 2 or 3 projects
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (allProjects.length > 0 && selectedIds.length === 0) {
      setSelectedIds(allProjects.slice(0, 3).map((p) => p.id));
    }
  }, [allProjects, selectedIds.length]);

  if (!isOpen) return null;

  const toggleSelectProject = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((pId) => pId !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], selectedIds[2], id]);
      }
    }
  };

  const comparedProjects = allProjects.filter((p) => selectedIds.includes(p.id));

  // Determine winners
  const highestScore = Math.max(...comparedProjects.map((p) => p.feasibility?.overallScore || 0));
  const scoreWinner = comparedProjects.find((p) => p.feasibility?.overallScore === highestScore);

  const largestTam = Math.max(
    ...comparedProjects.map((p) => p.validation?.tam?.numBillions || parseDollarValue(p.validation?.tam?.value) || 0)
  );
  const tamWinner = comparedProjects.find(
    (p) => (p.validation?.tam?.numBillions || parseDollarValue(p.validation?.tam?.value)) === largestTam
  );

  const highestRatio = Math.max(
    ...comparedProjects.map((p) => parseRatio(p.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio))
  );
  const economicsWinner = comparedProjects.find(
    (p) => parseRatio(p.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio) === highestRatio
  );

  const fastestWeeks = Math.min(
    ...comparedProjects.map((p) => p.feasibility?.mvpRecommendation?.timelineWeeks || 4)
  );
  const speedWinner = comparedProjects.find(
    (p) => (p.feasibility?.mvpRecommendation?.timelineWeeks || 4) === fastestWeeks
  );

  // 1. Radar Chart Data: Multi-Dimensional Feasibility Comparison
  const radarChartData = [
    {
      dimension: "Tech Feasibility",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.technicalScore || 85;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: "Market Demand",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.marketScore || 88;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: "Unit Economics",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.financialScore || 82;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: "Regulatory / Moat",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.regulatoryScore || 78;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: "Execution Speed",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.executionScore || 90;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: "Overall Viability",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] = p.feasibility?.overallScore || 87;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // 2. Market Sizing Data: TAM / SAM / SOM ($ Billions)
  const marketSizingData = [
    {
      tier: "TAM (Total Addressable)",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] =
          p.validation?.tam?.numBillions ||
          parseDollarValue(p.validation?.tam?.value) ||
          10;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      tier: "SAM (Serviceable Market)",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] =
          p.validation?.sam?.numBillions ||
          parseDollarValue(p.validation?.sam?.value) ||
          2.5;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      tier: "SOM (Serviceable Target)",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] =
          p.validation?.som?.numBillions ||
          parseDollarValue(p.validation?.som?.value) ||
          0.4;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // 3. 12-Month Projected Revenue Runway Trajectory Data
  const months = ["M1", "M2", "M3", "M4", "M6", "M8", "M10", "M12"];
  const revenueRunwayData = months.map((m) => {
    const row: Record<string, any> = { month: m };
    comparedProjects.forEach((p, idx) => {
      const runwayItem = p.feasibility?.revenueModel?.projectedRunway?.find((r) => r.month === m);
      if (runwayItem) {
        row[p.selectedIdea.name] = runwayItem.revenue;
      } else {
        // Fallback smooth synthetic baseline based on viability
        const baseRev = 2500 * (1 + idx * 0.2);
        const mIndex = months.indexOf(m) + 1;
        row[p.selectedIdea.name] = Math.round(baseRev * Math.pow(1.35, mIndex));
      }
    });
    return row;
  });

  // 4. Unit Economics: LTV ($) vs CAC ($)
  const unitEconomicsData = [
    {
      metric: "Customer Lifetime Value (LTV)",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] =
          parseDollarValue(p.feasibility?.revenueModel?.keyUnitEconomics?.ltvEstimate) || 1200;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: "Customer Acquisition Cost (CAC)",
      ...comparedProjects.reduce((acc, p) => {
        acc[p.selectedIdea.name] =
          parseDollarValue(p.feasibility?.revenueModel?.keyUnitEconomics?.cacEstimate) || 280;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Copy markdown summary to clipboard
  const handleCopyComparison = () => {
    let md = `# Startup Concept Comparison Matrix\n\n`;
    md += `Evaluated on ${new Date().toLocaleDateString()}\n\n`;
    md += `| Metric | ${comparedProjects.map((p) => p.selectedIdea.name).join(" | ")} |\n`;
    md += `|---|${comparedProjects.map(() => "---").join("|")}|\n`;
    md += `| **Domain** | ${comparedProjects.map((p) => p.selectedIdea.domain).join(" | ")} |\n`;
    md += `| **Viability Score** | ${comparedProjects.map((p) => `${p.feasibility?.overallScore || 0}/100`).join(" | ")} |\n`;
    md += `| **Target TAM** | ${comparedProjects.map((p) => p.validation?.tam?.value || "N/A").join(" | ")} |\n`;
    md += `| **Target SOM** | ${comparedProjects.map((p) => p.validation?.som?.value || "N/A").join(" | ")} |\n`;
    md += `| **LTV : CAC** | ${comparedProjects.map((p) => p.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio || "N/A").join(" | ")} |\n`;
    md += `| **Gross Margin** | ${comparedProjects.map((p) => p.feasibility?.revenueModel?.keyUnitEconomics?.grossMargin || "N/A").join(" | ")} |\n`;
    md += `| **MVP Timeline** | ${comparedProjects.map((p) => `${p.feasibility?.mvpRecommendation?.timelineWeeks || 4} Weeks`).join(" | ")} |\n`;
    md += `| **Verdict** | ${comparedProjects.map((p) => p.feasibility?.verdict || "Go").join(" | ")} |\n\n`;

    if (scoreWinner) {
      md += `**Overall Viability Winner**: ${scoreWinner.selectedIdea.name} (${scoreWinner.feasibility?.overallScore}/100)\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl bg-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 via-cyan-400 to-blue-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Startup Concept Comparison &amp; Visual Analytics
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Multi-Concept Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Side-by-side radar analysis, market sizing (TAM/SAM/SOM), 12-month revenue ramp, and unit economics comparison.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("charts")}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "charts"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Visual comparison charts only"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Charts</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "split"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Charts on top, specs below"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "matrix"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Side-by-side spec cards"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Matrix</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyComparison}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title="Copy comparison summary to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Selection Chips */}
        {allProjects.length > 1 && (
          <div className="py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-thin">
            <span className="text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Compare (Select 1-3):
            </span>
            {allProjects.map((p, idx) => {
              const isSelected = selectedIds.includes(p.id);
              const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelectProject(p.id)}
                  className={`px-3 py-1.5 rounded-xl transition border text-xs whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-cyan-400 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/40"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.stroke }}
                  />
                  <span className="font-bold">{p.selectedIdea.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({p.feasibility?.overallScore || 0}/100)
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Standout Highlights Banner */}
        {comparedProjects.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 pb-2 text-xs">
            {/* Viability Winner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900/90 border border-emerald-500/30 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                  Viability Winner
                </span>
                <span className="text-white font-extrabold truncate block">
                  {scoreWinner?.selectedIdea.name} ({scoreWinner?.feasibility?.overallScore}/100)
                </span>
              </div>
            </div>

            {/* TAM Winner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/90 border border-indigo-500/30 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">
                  Largest Market TAM
                </span>
                <span className="text-white font-extrabold truncate block">
                  {tamWinner?.selectedIdea.name} ({tamWinner?.validation?.tam?.value})
                </span>
              </div>
            </div>

            {/* Economics Winner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900/90 border border-cyan-500/30 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider block">
                  Best LTV : CAC
                </span>
                <span className="text-white font-extrabold truncate block">
                  {economicsWinner?.selectedIdea.name} ({economicsWinner?.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio})
                </span>
              </div>
            </div>

            {/* Speed Winner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900/90 border border-amber-500/30 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">
                  Fastest MVP Sprint
                </span>
                <span className="text-white font-extrabold truncate block">
                  {speedWinner?.selectedIdea.name} ({speedWinner?.feasibility?.mvpRecommendation?.timelineWeeks || 4} Weeks)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 py-3 space-y-6 pr-1">
          {comparedProjects.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              Please select at least one startup concept above to evaluate.
            </div>
          ) : (
            <>
              {/* SECTION 1: VISUAL COMPARISON CHARTS */}
              {(viewMode === "charts" || viewMode === "split") && isMounted && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Chart Sub-Tab Switcher */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                        Chart Focus:
                      </span>
                      <button
                        type="button"
                        onClick={() => setChartSubTab("all")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          chartSubTab === "all"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        All Comparison Charts
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartSubTab("radar")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          chartSubTab === "radar"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Feasibility Radar
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartSubTab("market")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          chartSubTab === "market"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Market Sizing (TAM/SAM/SOM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartSubTab("revenue")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          chartSubTab === "revenue"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        12-Month Revenue Ramp
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartSubTab("economics")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          chartSubTab === "economics"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Unit Economics (LTV vs CAC)
                      </button>
                    </div>

                    {/* Chart Legend of Concepts */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      {comparedProjects.map((p, idx) => {
                        const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                        return (
                          <div key={p.id} className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: theme.stroke }}
                            />
                            <span className="text-slate-200 font-bold">{p.selectedIdea.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid of Visual Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CHART 1: MULTI-DIMENSIONAL FEASIBILITY RADAR */}
                    {(chartSubTab === "all" || chartSubTab === "radar") && (
                      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#181a28] to-[#12131d] space-y-3 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Activity className="w-4 h-4 text-cyan-400" />
                              Multi-Dimensional Feasibility Radar
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-cyan-500/30">
                              0 - 100 Scale
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Compares Technical, Market, Financial, Moat, and Execution scores across selected concepts.
                          </p>
                        </div>

                        <div className="h-72 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                              <PolarGrid stroke="#2e384d" />
                              <PolarAngleAxis
                                dataKey="dimension"
                                stroke="#94a3b8"
                                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                              />
                              <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                stroke="#475569"
                                tick={{ fill: "#64748b", fontSize: 10 }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#3b82f6",
                                  borderRadius: "0.75rem",
                                  fontSize: "12px",
                                  color: "#fff",
                                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                }}
                              />
                              {comparedProjects.map((p, idx) => {
                                const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                                return (
                                  <Radar
                                    key={p.id}
                                    name={p.selectedIdea.name}
                                    dataKey={p.selectedIdea.name}
                                    stroke={theme.stroke}
                                    fill={theme.fill}
                                    fillOpacity={theme.fillOpacity}
                                    strokeWidth={2}
                                  />
                                );
                              })}
                              <Legend
                                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                formatter={(value) => <span className="text-slate-300">{value}</span>}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* CHART 2: MARKET SIZING SCALE (TAM / SAM / SOM) */}
                    {(chartSubTab === "all" || chartSubTab === "market") && (
                      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#181a28] to-[#12131d] space-y-3 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Globe className="w-4 h-4 text-emerald-400" />
                              Market Sizing Comparison (TAM / SAM / SOM)
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-emerald-300 border border-emerald-500/30">
                              USD ($ Billions)
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Total Addressable (TAM), Serviceable (SAM), and Target Obtainable (SOM) market scale.
                          </p>
                        </div>

                        <div className="h-72 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={marketSizingData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis
                                dataKey="tier"
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <YAxis
                                stroke="#64748b"
                                tickFormatter={(val) => `$${val}B`}
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <Tooltip
                                formatter={(val: any) => [`$${val}B`, "Estimated Volume"]}
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#10b981",
                                  borderRadius: "0.75rem",
                                  fontSize: "12px",
                                  color: "#fff",
                                }}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                formatter={(value) => <span className="text-slate-300">{value}</span>}
                              />
                              {comparedProjects.map((p, idx) => {
                                const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                                return (
                                  <Bar
                                    key={p.id}
                                    dataKey={p.selectedIdea.name}
                                    fill={theme.stroke}
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={48}
                                  />
                                );
                              })}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* CHART 3: 12-MONTH PROJECTED REVENUE TRAJECTORY */}
                    {(chartSubTab === "all" || chartSubTab === "revenue") && (
                      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#181a28] to-[#12131d] space-y-3 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-cyan-400" />
                              12-Month Financial Ramp &amp; Revenue Curves
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 border border-cyan-500/30">
                              Monthly ARR Pace ($)
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Simulated month-over-month revenue growth curves comparing scaling velocity.
                          </p>
                        </div>

                        <div className="h-72 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueRunwayData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                              <defs>
                                {comparedProjects.map((p, idx) => {
                                  const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                                  return (
                                    <linearGradient
                                      key={p.id}
                                      id={`grad-runway-${idx}`}
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.4} />
                                      <stop offset="95%" stopColor={theme.stroke} stopOpacity={0.0} />
                                    </linearGradient>
                                  );
                                })}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <YAxis
                                stroke="#64748b"
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <Tooltip
                                formatter={(val: any) => [`$${Number(val).toLocaleString()}/mo`, "Projected Revenue"]}
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#6366f1",
                                  borderRadius: "0.75rem",
                                  fontSize: "12px",
                                  color: "#fff",
                                }}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                formatter={(value) => <span className="text-slate-300">{value}</span>}
                              />
                              {comparedProjects.map((p, idx) => {
                                const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                                return (
                                  <Area
                                    key={p.id}
                                    type="monotone"
                                    dataKey={p.selectedIdea.name}
                                    stroke={theme.stroke}
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill={`url(#grad-runway-${idx})`}
                                  />
                                );
                              })}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* CHART 4: UNIT ECONOMICS (LTV VS CAC) */}
                    {(chartSubTab === "all" || chartSubTab === "economics") && (
                      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#181a28] to-[#12131d] space-y-3 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-amber-400" />
                              Unit Economics &amp; Capital Efficiency (LTV vs CAC)
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-amber-500/30">
                              Amounts in USD ($)
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Customer Lifetime Value (LTV) compared against Customer Acquisition Cost (CAC).
                          </p>
                        </div>

                        <div className="h-72 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={unitEconomicsData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis
                                dataKey="metric"
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <YAxis
                                stroke="#64748b"
                                tickFormatter={(val) => `$${val}`}
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                              />
                              <Tooltip
                                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Estimated Dollar Value"]}
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#f59e0b",
                                  borderRadius: "0.75rem",
                                  fontSize: "12px",
                                  color: "#fff",
                                }}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                                formatter={(value) => <span className="text-slate-300">{value}</span>}
                              />
                              {comparedProjects.map((p, idx) => {
                                const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                                return (
                                  <Bar
                                    key={p.id}
                                    dataKey={p.selectedIdea.name}
                                    fill={theme.stroke}
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={48}
                                  />
                                );
                              })}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: SIDE-BY-SIDE SPECIFICATION MATRIX CARDS */}
              {(viewMode === "matrix" || viewMode === "split") && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      Executive Side-by-Side Specification Matrix
                    </h3>
                    <span className="text-xs text-slate-400">
                      Comparing {comparedProjects.length} selected concepts
                    </span>
                  </div>

                  <div
                    className="grid gap-4 min-w-[650px] overflow-x-auto"
                    style={{
                      gridTemplateColumns: `repeat(${comparedProjects.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {comparedProjects.map((p, idx) => {
                      const isWinner = p.feasibility?.overallScore === highestScore && comparedProjects.length > 1;
                      const loc = p.targetLocation || p.founderProfile.targetLocation;
                      const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];

                      return (
                        <div
                          key={p.id}
                          className={`rounded-3xl p-5 border flex flex-col justify-between space-y-5 transition relative overflow-hidden ${
                            isWinner
                              ? "border-emerald-500/70 bg-gradient-to-b from-[#182320] via-slate-950 to-slate-950 shadow-xl shadow-emerald-950/30"
                              : "border-slate-800 bg-slate-950/80"
                          }`}
                        >
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ backgroundColor: theme.stroke }}
                          />

                          {/* Header: Name, Badge, Score */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-lg border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
                              >
                                {p.selectedIdea.domain}
                              </span>
                              {isWinner && (
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-md flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Top Pick
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                                {p.selectedIdea.name}
                              </h4>
                              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                                {p.selectedIdea.tagline}
                              </p>
                            </div>

                            {/* Score Gauge Pill */}
                            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/90 flex items-center justify-between">
                              <div className="text-xs text-slate-400 font-medium">Algorithmic Viability</div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-emerald-400">
                                  {p.feasibility?.overallScore || 0}
                                </span>
                                <span className="text-xs text-slate-500">/100</span>
                              </div>
                            </div>
                          </div>

                          {/* Metric Rows */}
                          <div className="space-y-3.5 text-xs border-t border-slate-800/80 pt-3">
                            {/* Launch Hub */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" /> Target Launch Hub
                              </span>
                              <div className="text-white font-medium">
                                {loc ? `${loc.city}, ${loc.country}` : "San Francisco, USA"}
                              </div>
                            </div>

                            {/* TAM / SAM / SOM */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Market Sizing (TAM / SOM)
                              </span>
                              <div className="text-white font-medium">
                                {p.validation?.tam?.value || "N/A"} · SOM: {p.validation?.som?.value || "N/A"}
                              </div>
                            </div>

                            {/* Unit Economics */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Unit Economics (LTV : CAC)
                              </span>
                              <div className="text-emerald-400 font-bold">
                                {p.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio || "N/A"} (Margin:{" "}
                                {p.feasibility?.revenueModel?.keyUnitEconomics?.grossMargin || "N/A"})
                              </div>
                            </div>

                            {/* MVP Sprint Scope */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                <Rocket className="w-3.5 h-3.5 text-cyan-400" /> MVP Launch Timeline
                              </span>
                              <div className="text-cyan-300 font-medium">
                                {p.feasibility?.mvpRecommendation?.timelineWeeks || 4} Weeks (Cloud:{" "}
                                {p.feasibility?.cloudArchitecture?.estimatedMonthlyCloudCost?.mvp || "$200/mo"})
                              </div>
                            </div>

                            {/* Defensible Moat */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Defensible Moat
                              </span>
                              <p className="text-slate-300 text-[11px] line-clamp-3">
                                {p.selectedIdea.innovationMoat}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Status Verdict */}
                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Verdict:</span>
                            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {p.feasibility?.verdict || "Strong Go"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive comparison dynamically generated from multi-stage AI validation models.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyComparison}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Summary Table"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
