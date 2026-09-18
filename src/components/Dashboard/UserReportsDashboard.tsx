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
} from "lucide-react";
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
        await deleteProjectFromVault(id);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Founder Workspace
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                MongoDB Cloud Synced
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">{currentUser.username}</span>!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access your institutional startup reports, real-time market sizing, and execution roadmaps. Review previous validations or spin up a new multi-sector concept.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {onOpenCompare && projects.length >= 2 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="px-4 py-3 rounded-2xl bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-indigo-400 hover:text-white transition flex items-center gap-2 text-sm font-semibold shadow-lg cursor-pointer"
                title="Compare Multiple Saved Concepts"
              >
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>Compare ({projects.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onStartNewValidation}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Validate New Startup Concept</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Saved Reports</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persisted in Cloud Vault & MongoDB</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Viability Score</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {stats.maxScore > 0 ? `${stats.maxScore}/100` : "—"}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.maxScore > 0 ? `Rating: ${stats.highestScoreVerdict}` : "Awaiting first validation"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Industry Domain</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white truncate" title={stats.topDomain}>
            {stats.topDomain}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {availableDomains.length > 0 ? `${availableDomains.length} unique sector(s) validated` : "Multi-sector engine ready"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cloud Engine Topologies</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-cyan-300">AWS / GCP / Azure</div>
          <div className="text-xs text-slate-400 mt-1">
            Live Tavily Market API + Gemini 2.5
          </div>
        </div>
      </div>

      {/* Search, Domain Filter Pills, and Sort Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by startup name, sector, tagline, or launch city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
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
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="highestScore">Sort: Highest Viability</option>
            <option value="highestTam">Sort: Highest Market TAM</option>
          </select>

          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600 transition"
              title="Refresh Reports from Database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reports Listing */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-8 h-8" />
          </div>
          {projects.length === 0 ? (
            <>
              <h3 className="text-lg font-bold text-white">No Validated Reports Yet</h3>
              <p className="text-sm text-slate-400 max-w-md mt-1.5 mb-6 leading-relaxed">
                You haven&apos;t generated any startup reports yet. Step through our 14-stage multi-sector validation engine to build your first validation report.
              </p>
              <button
                type="button"
                onClick={onStartNewValidation}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Launch 14-Stage Validation Engine</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">No Matching Reports</h3>
              <p className="text-sm text-slate-400 max-w-md mt-1 mb-4">
                No startup reports match your search term &quot;{searchTerm}&quot; or chosen sector filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDomainFilter("all");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
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
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition-all duration-200 p-5 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
              >
                {/* Top highlight bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isHighScore
                      ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                      : isMediumScore
                      ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                      : "bg-gradient-to-r from-amber-400 to-rose-400"
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Card Header: Badges & Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {p.selectedIdea?.domain || "Tech / AI"}
                      </span>
                      {p.founderProfile?.businessType && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {p.founderProfile.businessType}
                        </span>
                      )}
                      {loc && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                          {loc.city}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Startup Title & Tagline */}
                  <div>
                    <h2 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                      {p.selectedIdea?.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.selectedIdea?.tagline}
                    </p>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        Viability Score
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-black text-white">{score}/100</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isHighScore
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isMediumScore
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {verdict}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        Market TAM
                      </div>
                      <div className="text-base font-black text-cyan-300 truncate mt-0.5">
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
                      className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white hover:border-slate-600 border border-slate-800 transition cursor-pointer"
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
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm group-hover:bg-indigo-600 group-hover:text-white"
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
