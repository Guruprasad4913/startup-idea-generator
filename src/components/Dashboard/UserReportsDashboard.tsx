"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  FolderHeart,
  Sparkles,
  TrendingUp,
  Award,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Plus,
  Scale,
  MapPin,
  Calendar,
  Layers,
  Building,
  CheckCircle2,
  ArrowRight,
  Database,
  RefreshCw,
  Target,
  Briefcase,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Activity,
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
import { User, StartupProject } from "@/types";
import { deleteProjectFromVault, exportProjectAsMarkdown } from "@/lib/storage";

interface UserReportsDashboardProps {
  currentUser: User;
  projects: StartupProject[];
  onSelectProject: (p: StartupProject) => void;
  onStartNewValidation: () => void;
  onOpenCompare?: () => void;
  onRefreshData?: () => void;
}

export const UserReportsDashboard: React.FC<UserReportsDashboardProps> = ({
  currentUser,
  projects,
  onSelectProject,
  onStartNewValidation,
  onOpenCompare,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "highestScore" | "highestTam">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPortfolioChart, setShowPortfolioChart] = useState(true);

  // Portfolio comparison data for comparative bar chart
  const portfolioComparisonData = useMemo(() => {
    return projects.slice(0, 8).map((p, idx) => {
      const palette = ["#06b6d4", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#3b82f6"];
      const score = p.feasibility?.overallScore || 0;
      const ltvCac = parseFloat(p.feasibility?.revenueModel?.keyUnitEconomics?.ltvCacRatio?.replace(/[^0-9.]/g, "") || "0") || 0;
      return {
        name: p.selectedIdea?.name?.split(" ")[0]?.substring(0, 12) || `Concept ${idx + 1}`,
        fullName: p.selectedIdea?.name || `Startup ${idx + 1}`,
        domain: p.selectedIdea?.domain || "Technology",
        viabilityScore: score,
        ltvCacRatio: ltvCac,
        color: palette[idx % palette.length],
        project: p,
      };
    });
  }, [projects]);

  // Compute domains list for filter pills
  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.selectedIdea?.domain) set.add(p.selectedIdea.domain);
    });
    return Array.from(set);
  }, [projects]);

  // Executive KPI summary computations
  const stats = useMemo(() => {
    const total = projects.length;
    if (total === 0) {
      return {
        total: 0,
        maxScore: 0,
        highestScoreVerdict: "N/A",
        topDomain: "None",
        primaryProvider: "N/A",
      };
    }

    let maxScore = 0;
    let highestScoreVerdict = "";
    const domainCounts: Record<string, number> = {};

    projects.forEach((p) => {
      const score = p.feasibility?.overallScore || 0;
      if (score > maxScore) {
        maxScore = score;
        highestScoreVerdict = p.feasibility?.verdict || "Strong Go";
      }
      const dom = p.selectedIdea?.domain || "General";
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    });

    const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";

    return {
      total,
      maxScore,
      highestScoreVerdict,
      topDomain,
    };
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const name = p.selectedIdea?.name || "";
      const domain = p.selectedIdea?.domain || "";
      const tagline = p.selectedIdea?.tagline || "";
      const loc = p.targetLocation?.city || p.founderProfile?.targetLocation?.city || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDomain =
        selectedDomainFilter === "all" ||
        p.selectedIdea?.domain?.toLowerCase() === selectedDomainFilter.toLowerCase();

      return matchesSearch && matchesDomain;
    });

    result.sort((a, b) => {
      if (sortBy === "highestScore") {
        return (b.feasibility?.overallScore || 0) - (a.feasibility?.overallScore || 0);
      }
      if (sortBy === "highestTam") {
        const parseTam = (str?: string) => {
          if (!str) return 0;
          // Check for Indian Crores (e.g. ₹42,000 Crores, ₹12,10,000 Cr)
          const inrCroreMatch = str.match(/₹?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Crores?|Cr)/i);
          if (inrCroreMatch) {
            return parseFloat(inrCroreMatch[1].replace(/,/g, ""));
          }
          // Check for Indian Lakhs (e.g. ₹5,000 Lakhs)
          const inrLakhMatch = str.match(/₹?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Lakhs?|Lac)/i);
          if (inrLakhMatch) {
            return parseFloat(inrLakhMatch[1].replace(/,/g, "")) / 100;
          }
          const match = str.match(/\$?([0-9.]+)\s*([BMK]?)/i);
          if (!match) return 0;
          let val = parseFloat(match[1]);
          const unit = match[2].toUpperCase();
          if (unit === "B") val *= 8350; // Convert USD B to Crores approx
          else if (unit === "M") val *= 8.35; // Convert USD M to Crores approx
          return val;
        };
        return parseTam(b.validation?.tam?.value) - parseTam(a.validation?.tam?.value);
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [projects, searchTerm, selectedDomainFilter, sortBy]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this validated startup report? This cannot be undone.")) {
      setDeletingId(id);
      try {
        await deleteProjectFromVault(id, currentUser);
        if (onRefreshData) onRefreshData();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownloadMarkdown = (p: StartupProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = exportProjectAsMarkdown(p);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.selectedIdea.name.toLowerCase().replace(/\s+/g, "-")}-validation-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171924] via-[#1a1d2e] to-[#161a26] border border-indigo-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/30">
        {/* Radiant top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 via-emerald-400 to-indigo-500" />
        
        {/* Colorful ambient glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/[0.12] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 bg-emerald-500/[0.10] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-16 w-60 h-60 bg-cyan-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Founder Workspace
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                MongoDB Cloud Synced
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentUser.isNewUser || projects.length === 0 ? "Welcome, " : "Welcome back, "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 font-extrabold">{currentUser.name || currentUser.username}</span>!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentUser.isNewUser || projects.length === 0
                ? "Start your venture journey by generating institutional startup reports, real-time market sizing, and execution roadmaps with our 14-stage AI validation engine."
                : "Access your institutional startup reports, real-time market sizing, and execution roadmaps. Review previous validations or spin up a new multi-sector concept."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {onOpenCompare && projects.length >= 2 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="px-4 py-3 rounded-2xl bg-slate-900/90 text-slate-200 border border-indigo-500/40 hover:border-cyan-400 hover:text-white transition flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
                title="Compare Multiple Saved Concepts"
              >
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Compare ({projects.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onStartNewValidation}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 border border-cyan-400/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Validate New Startup Concept</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saved Reports (Electric Blue / Indigo) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/35 via-[#161824] to-[#12131b] border border-blue-500/30 backdrop-blur-md relative overflow-hidden group hover:border-blue-400/60 transition-all shadow-xl shadow-blue-950/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300/90">Total Saved Reports</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <FolderHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300">{stats.total}</div>
          <div className="text-xs text-blue-200/80 mt-1.5 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Persisted in Cloud Vault & MongoDB</span>
          </div>
        </div>

        {/* Card 2: Peak Viability Score (Emerald / Mint) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/35 via-[#151c1a] to-[#121417] border border-emerald-500/30 backdrop-blur-md relative overflow-hidden group hover:border-emerald-400/60 transition-all shadow-xl shadow-emerald-950/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">Peak Viability Score</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
              {stats.maxScore > 0 ? `${stats.maxScore}/100` : "—"}
            </span>
          </div>
          <div className="text-xs text-emerald-300/80 mt-1.5 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{stats.maxScore > 0 ? `Rating: ${stats.highestScoreVerdict}` : "Awaiting first validation"}</span>
          </div>
        </div>

        {/* Card 3: Top Industry Domain (Amber / Warm Gold) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 via-[#1c1916] to-[#141315] border border-amber-500/30 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/60 transition-all shadow-xl shadow-amber-950/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">Top Industry Domain</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-orange-300 truncate" title={stats.topDomain}>
            {stats.topDomain}
          </div>
          <div className="text-xs text-amber-300/80 mt-1.5 font-medium">
            {availableDomains.length > 0 ? `${availableDomains.length} unique sector(s) validated` : "Multi-sector engine ready"}
          </div>
        </div>

        {/* Card 4: Cloud Engine Topologies (Cyan / Teal) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/35 via-[#131b22] to-[#11141a] border border-cyan-500/30 backdrop-blur-md relative overflow-hidden group hover:border-cyan-400/60 transition-all shadow-xl shadow-cyan-950/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300/90">Cloud Engine Topologies</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-blue-300">AWS / GCP / Azure</div>
          <div className="text-xs text-cyan-300/80 mt-1.5 font-medium">
            Live Tavily Market API + Gemini 2.5
          </div>
        </div>
      </div>

      {/* Portfolio Comparison Benchmark Chart Card (if 2 or more projects exist) */}
      {projects.length >= 2 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#181a28] to-[#12131d] border border-indigo-500/25 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-cyan-400 to-emerald-400" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Portfolio Concept Comparison &amp; Viability Benchmarks
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {projects.length} Saved Concepts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Side-by-side benchmark of algorithmic viability scores and capital efficiency across your saved portfolio.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {onOpenCompare && (
                <button
                  type="button"
                  onClick={onOpenCompare}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  title="Open Deep Comparison Modal with Radar & Revenue Ramp"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Deep Compare Modal</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPortfolioChart(!showPortfolioChart)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title={showPortfolioChart ? "Collapse Chart" : "Expand Chart"}
              >
                {showPortfolioChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showPortfolioChart && (
            <div className="space-y-3 pt-1">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portfolioComparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                      tickFormatter={(val) => `${val}`}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}/100 Viability (${item.payload.domain} · LTV:CAC ${item.payload.ltvCacRatio}x)`,
                        item.payload.fullName,
                      ]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#3b82f6",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="viabilityScore"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      onClick={(entry: any) => {
                        if (entry && entry.project) {
                          onSelectProject(entry.project);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {portfolioComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex-wrap gap-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Click any bar to instantly open that startup concept&apos;s full validation memo.
                </span>
                <span className="text-slate-500 font-mono">
                  Scale: 0 - 100 Viability Score
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search, Domain Filter Pills, and Sort Controls */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171924] via-[#161822] to-[#171924] border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by startup name, sector, tagline, or launch city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/30"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {availableDomains.length > 1 && (
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs text-indigo-200 focus:outline-none focus:border-cyan-400 cursor-pointer font-medium"
            >
              <option value="all">All Sectors ({projects.length})</option>
              {availableDomains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="highestScore">Sort: Highest Viability</option>
            <option value="highestTam">Sort: Highest Market TAM</option>
          </select>

          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
              title="Refresh Reports from Database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reports Listing */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-b from-[#171924]/60 to-[#12131b]/60 border border-indigo-500/20 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4 shadow-xl shadow-cyan-500/10">
            <Sparkles className="w-8 h-8" />
          </div>
          {projects.length === 0 ? (
            <>
              <h3 className="text-xl font-bold text-white">No Validated Reports Yet</h3>
              <p className="text-sm text-slate-300 max-w-md mt-1.5 mb-6 leading-relaxed">
                You haven&apos;t generated any startup reports yet. Step through our 14-stage multi-sector validation engine to build your first institutional validation report.
              </p>
              <button
                type="button"
                onClick={onStartNewValidation}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 border border-cyan-400/30 transition flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Launch 14-Stage Validation Engine</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">No Matching Reports</h3>
              <p className="text-sm text-slate-300 max-w-md mt-1 mb-4">
                No startup reports match your search term &quot;{searchTerm}&quot; or chosen sector filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDomainFilter("all");
                }}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              >
                Reset Search Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAndSortedProjects.map((p) => {
            const loc = p.targetLocation || p.founderProfile?.targetLocation;
            const score = p.feasibility?.overallScore || 70;
            const verdict = p.feasibility?.verdict || "Conditional Go";
            const isHighScore = score >= 80;
            const isMediumScore = score >= 65 && score < 80;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="group relative rounded-2xl bg-gradient-to-b from-[#181a25] to-[#12131c] border border-indigo-500/20 hover:border-cyan-400/60 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl shadow-black/30 hover:shadow-cyan-950/30 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                {/* Top radiant highlight bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isHighScore
                      ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                      : isMediumScore
                      ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400"
                      : "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Card Header: Badges & Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-sm shadow-blue-500/10">
                        {p.selectedIdea?.domain || "Tech / AI"}
                      </span>
                      {p.founderProfile?.businessType && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {p.founderProfile.businessType}
                        </span>
                      )}
                      {loc && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                          <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                          {loc.city}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Startup Title & Tagline */}
                  <div>
                    <h2 className="text-lg font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">
                      {p.selectedIdea?.name}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {p.selectedIdea?.tagline}
                    </p>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/20">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        Viability Score
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-black text-white">{score}/100</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isHighScore
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : isMediumScore
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {verdict}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        Market TAM
                      </div>
                      <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 truncate mt-0.5">
                        {p.validation?.tam?.value || "₹20,000 Cr ($2.4B)"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadMarkdown(p, e)}
                      className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-800 transition cursor-pointer"
                      title="Download Markdown Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(p.id, e)}
                      disabled={deletingId === p.id}
                      className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 border border-slate-800 transition disabled:opacity-50 cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20 border border-cyan-400/30 transition-all group-hover:scale-105"
                  >
                    <span>Open Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
