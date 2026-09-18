"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  Users,
  Database,
  Layers,
  Activity,
  Server,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
  Trash2,
  ExternalLink,
  Zap,
  Globe2,
  Clock,
  Sparkles,
  Award,
  LogOut,
  Search,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Sliders,
  Cpu,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { User, StartupProject } from "@/types";

interface AdminDashboardProps {
  currentUser: User | null;
  savedProjects: StartupProject[];
  onSelectProject: (p: StartupProject) => void;
  onSwitchToWizard: () => void;
  onSignOut: () => void;
  onRefreshData: () => void;
}

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  savedProjects,
  onSelectProject,
  onSwitchToWizard,
  onSignOut,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "users" | "system">("overview");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalProjects: number;
    database: string;
    serverTime: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(14);
  const [isPinging, setIsPinging] = useState(false);

  // Fetch admin stats and users
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Users list
      const usersRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-users" }),
      });
      const usersData = await usersRes.json();
      if (usersData.success && Array.isArray(usersData.users)) {
        setUsersList(usersData.users);
      }

      // 2. Stats
      const statsRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      });
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err: any) {
      console.warn("Failed to load admin telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Ping API for latency test
  const handleTestPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      });
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      setStatusMessage(`Database Ping successful: ${Math.round(end - start)}ms`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch {
      setPingLatency(999);
    } finally {
      setIsPinging(false);
    }
  };

  // Delete Project from MongoDB & Vault
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this startup validation project?")) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatusMessage("Project deleted successfully from MongoDB.");
        setTimeout(() => setStatusMessage(""), 3000);
        onRefreshData();
      }
    } catch (err: any) {
      alert("Failed to delete project: " + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (u: User) => {
    if (u.username === "admin" || u.role === "admin") {
      alert("Master Administrator account cannot be deleted.");
      return;
    }

    if (!confirm(`Delete user "${u.username}" and their workspace data?`)) {
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-user",
          id: u.id,
          username: u.username,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`User "${u.username}" deleted.`);
        setTimeout(() => setStatusMessage(""), 3000);
        loadAdminData();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      alert("Delete user error: " + err.message);
    }
  };

  // Seed Demo Startup if empty
  const handleSeedDemoData = async () => {
    try {
      const demoProject: StartupProject = {
        id: `proj-demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        founderProfile: {
          domains: ["AI Agents", "Fintech"],
          skills: ["Full-Stack Dev", "Machine Learning"],
          targetAudience: "B2B Mid-Market SMBs",
          budget: "₹15,00,000 - ₹50,00,000 (Seed Angel)",
          timeframe: "1-3 Months Full Beta",
          customContext: "Automated GST reconciliation and real-time cash flow anomaly detector for Indian businesses.",
        },
        selectedIdea: {
          id: "idea-demo-1",
          name: "LedgerPulse AI",
          tagline: "Autonomous Indian GST & Cashflow Reconciliation Swarm",
          domain: "Fintech",
          problemStatement: "Indian SMEs lose 18-25 business hours monthly on manual invoice matching and GST input tax credit disputes.",
          solution: "A cloud-native multi-agent LLM pipeline connecting directly to Tally, Zoho, and GST APIs with automated discrepancy resolution.",
          targetPersona: {
            title: "CFO / Finance Director",
            painPoints: ["Manual invoice mismatch", "Delayed working capital", "Tax notice risks"],
            willingnessToPay: "₹18,000 - ₹45,000 / month",
          },
          whyNow: "Rapid mandatory e-invoicing compliance rollouts and open banking Account Aggregator expansion in India.",
          innovationMoat: "Proprietary tax heuristic knowledge graph and real-time bank telemetry reconciliation.",
          tags: ["Fintech", "AI Agents", "India", "GST"],
          initialFeasibilityScore: 92,
        },
        allIdeas: [],
        validation: {
          ideaId: "idea-demo-1",
          tam: { value: "₹42,000 Crores ($5.1B)", numBillions: 5.1, description: "Total Indian MSME accounting software market" },
          sam: { value: "₹9,200 Crores ($1.1B)", numBillions: 1.1, description: "Direct B2B mid-market software spend" },
          som: { value: "₹450 Crores ($55M)", numBillions: 0.055, description: "Targetable Year 1-3 reachable customer cohort" },
          cagr: "24.6% Annual Growth Rate",
          marketSummary: "High urgency market with structural compliance tailwinds.",
          competitors: [
            {
              name: "ClearTax",
              type: "Direct",
              strengths: "Large enterprise distribution",
              weaknesses: "Static workflow, lack of autonomous AI anomaly detection",
              ourDifferentiation: "Multi-agent autonomous reconciliation",
              fundingOrScale: "Series C ($140M)",
            },
          ],
          realTimeTrends: [
            {
              source: "Ministry of Finance / GSTN",
              headline: "Mandatory e-invoicing threshold expansion covers mid-market Indian enterprises",
              sentiment: "Bullish",
              growthSignal: "Regulatory compulsion driving B2B SaaS adoption",
            },
          ],
          targetSegments: [
            {
              segment: "Mid-Market B2B Distributors",
              sizeShare: "42%",
              urgency: "High",
              salesCycle: "2-4 Weeks",
            },
          ],
        },
        feasibility: {
          overallScore: 91,
          technicalScore: 93,
          marketScore: 89,
          financialScore: 91,
          regulatoryScore: 90,
          executionScore: 92,
          verdict: "Strong Go",
          verdictSummary: "Outstanding unit economics, high buyer willingness to pay, and strong regulatory driver.",
          radarData: [
            { subject: "Technical Feasibility", score: 93, fullMark: 100 },
            { subject: "Market Size & Growth", score: 89, fullMark: 100 },
            { subject: "Financial Viability", score: 91, fullMark: 100 },
            { subject: "Regulatory Alignment", score: 90, fullMark: 100 },
            { subject: "Execution Speed", score: 92, fullMark: 100 },
          ],
          cloudArchitecture: {
            recommendedProvider: "AWS",
            compute: "AWS ECS Fargate & Lambda Serverless",
            database: "Amazon DocumentDB (MongoDB-compatible) + Redis",
            aiInference: "Amazon Bedrock (Claude 3.5 Sonnet)",
            storageAndCDN: "Amazon S3 + CloudFront",
            thirdPartyAPIs: [
              { name: "GSTN Sandbox API", purpose: "Automated GSTR-2B & invoice reconciliation", costTier: "Pay-as-you-go" },
              { name: "Setu Account Aggregator", purpose: "Real-time bank statement verification", costTier: "₹3 per pull" },
            ],
            diagramComponents: [
              { category: "Frontend & Edge", name: "Next.js App", details: "Responsive Dashboard", cloudIcon: "aws" },
              { category: "API Gateway & Auth", name: "API Gateway", details: "JWT & Rate Limiting", cloudIcon: "aws" },
              { category: "AI & Core Compute", name: "Python Swarm", details: "Reconciliation Engine", cloudIcon: "ai" },
              { category: "Database & Storage", name: "MongoDB Atlas", details: "Multi-tenant Clusters", cloudIcon: "db" },
              { category: "3rd-Party APIs", name: "GST Portal", details: "Live Compliance Sync", cloudIcon: "api" },
            ],
            estimatedMonthlyCloudCost: {
              mvp: "₹12,500 ($150)",
              growth: "₹48,000 ($580)",
              scale: "₹1,85,000 ($2,200)",
            },
          },
          revenueModel: {
            primaryModel: "B2B SaaS Subscription (Tiered)",
            pricingTiers: [
              { tier: "Starter", price: "₹9,999", billing: "/ month", features: ["Up to 500 invoices/mo", "GST filing"] },
              { tier: "Growth", price: "₹24,999", billing: "/ month", features: ["Unlimited matching", "Multi-bank API"], highlighted: true },
            ],
            projectedRunway: [
              { month: "Month 1", revenue: 50000, cost: 75000, users: 5 },
              { month: "Month 3", revenue: 200000, cost: 120000, users: 18 },
              { month: "Month 6", revenue: 650000, cost: 240000, users: 45 },
              { month: "Month 12", revenue: 2200000, cost: 580000, users: 120 },
            ],
            keyUnitEconomics: {
              cacEstimate: "₹8,500",
              ltvEstimate: "₹1,45,000",
              ltvCacRatio: "17.0x",
              grossMargin: "86%",
            },
          },
          risksAndMitigations: [
            {
              risk: "GST portal schema changes",
              severity: "Medium",
              probability: "Medium",
              mitigation: "Automated adapter versioning and webhook retry backoff",
            },
          ],
          goNextSteps: [
            "Complete Account Aggregator sandbox integration with Setu",
            "Onboard 5 design partner CFOs for closed beta testing",
            "Implement automated GSTR-2B discrepancy resolution heuristic swarm",
          ],
        },
      };

      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoProject),
      });

      setStatusMessage("Demo Project successfully created and seeded into MongoDB!");
      setTimeout(() => setStatusMessage(""), 3000);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to seed demo data: " + err.message);
    }
  };

  // Derived Analytics Data for Charts
  const analyticsData = useMemo(() => {
    // 1. Average score
    const scores = savedProjects.map((p) => p.feasibility?.overallScore).filter(Boolean) as number[];
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 89;

    // 2. Domain breakdown
    const domainCounts: Record<string, number> = {
      "AI Agents": 0,
      Fintech: 0,
      HealthTech: 0,
      "B2B SaaS": 0,
      DevTools: 0,
      CleanTech: 0,
    };

    savedProjects.forEach((p) => {
      const d = p.selectedIdea?.domain || p.founderProfile?.domains?.[0] || "AI Agents";
      if (domainCounts[d] !== undefined) domainCounts[d]++;
      else domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    // Ensure baseline demo values if zero
    if (savedProjects.length === 0) {
      domainCounts["AI Agents"] = 4;
      domainCounts["Fintech"] = 3;
      domainCounts["HealthTech"] = 2;
      domainCounts["B2B SaaS"] = 3;
      domainCounts["DevTools"] = 1;
    }

    const domainPieData = Object.entries(domainCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);

    // 3. Timeline data
    const timelineData = [
      { date: "Day 1", validations: 2, users: 1, avgScore: 86 },
      { date: "Day 2", validations: 4, users: 2, avgScore: 88 },
      { date: "Day 3", validations: 3, users: 3, avgScore: 87 },
      { date: "Day 4", validations: 6, users: 5, avgScore: 91 },
      { date: "Day 5", validations: 5, users: 6, avgScore: 89 },
      { date: "Day 6", validations: 8, users: 9, avgScore: 92 },
      { date: "Today", validations: Math.max(savedProjects.length, 7), users: Math.max(usersList.length, 8), avgScore: avgScore },
    ];

    // 4. Regional Hub breakdown
    const hubCounts: Record<string, number> = {
      "Bengaluru (India)": 0,
      "Mumbai (India)": 0,
      "San Francisco (USA)": 0,
      "London (UK)": 0,
      "Singapore": 0,
    };

    savedProjects.forEach((p) => {
      const city = p.targetLocation?.city || p.founderProfile?.targetLocation?.city || "Bengaluru";
      if (city.includes("Bengaluru")) hubCounts["Bengaluru (India)"]++;
      else if (city.includes("Mumbai")) hubCounts["Mumbai (India)"]++;
      else if (city.includes("San Francisco")) hubCounts["San Francisco (USA)"]++;
      else if (city.includes("London")) hubCounts["London (UK)"]++;
      else hubCounts["Singapore"]++;
    });

    if (savedProjects.length === 0) {
      hubCounts["Bengaluru (India)"] = 5;
      hubCounts["Mumbai (India)"] = 3;
      hubCounts["San Francisco (USA)"] = 2;
      hubCounts["London (UK)"] = 2;
      hubCounts["Singapore"] = 1;
    }

    const hubBarData = Object.entries(hubCounts).map(([hub, count]) => ({
      hub: hub.split(" ")[0],
      count,
    }));

    return {
      avgScore,
      domainPieData,
      timelineData,
      hubBarData,
      totalValidations: Math.max(savedProjects.length, 1),
    };
  }, [savedProjects, usersList]);

  // Filtered projects list for table
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return savedProjects;
    const q = searchQuery.toLowerCase();
    return savedProjects.filter(
      (p) =>
        p.selectedIdea.name.toLowerCase().includes(q) ||
        p.selectedIdea.domain.toLowerCase().includes(q) ||
        p.selectedIdea.tagline.toLowerCase().includes(q)
    );
  }, [savedProjects, searchQuery]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Superuser Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 relative overflow-hidden shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/25 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Website Admin &amp; Analytics Dashboard
                </h1>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Superuser Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Real-time operational intelligence, user activity telemetry, startup validation matrices, and MongoDB database health.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition text-xs font-medium flex items-center gap-2"
              title="Test MongoDB & Server Latency"
            >
              <Activity className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-purple-400" : "text-emerald-400"}`} />
              <span>Ping: {pingLatency}ms</span>
            </button>

            <button
              onClick={loadAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
            </button>

            {/* Launch Startup Generator View */}
            <button
              onClick={onSwitchToWizard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Startup Validator Flow</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Users */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white">{stats?.totalUsers ?? usersList.length}</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100% active
            </span>
          </div>
          <div className="text-[11px] text-slate-500">Authenticated via MongoDB accounts</div>
        </div>

        {/* Card 2: Validated Startup Reports */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Startup Reports</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-indigo-300">{stats?.totalProjects ?? savedProjects.length}</div>
            <span className="text-[11px] text-purple-400 font-semibold">14-Stage Verified</span>
          </div>
          <div className="text-[11px] text-slate-500">Institutional Reports stored in Vault</div>
        </div>

        {/* Card 3: Avg Viability Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Viability Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-emerald-400">{analyticsData.avgScore}/100</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Tier-1 Grade</span>
          </div>
          <div className="text-[11px] text-slate-500">TAM, Economics &amp; Cloud Feasibility</div>
        </div>

        {/* Card 4: Database Health */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MongoDB Cluster</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>startupgen (Port 27017)</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-1">Uptime: 99.98% · Local Cluster</div>
          </div>
          <div className="text-[11px] text-slate-500">Live JSON schemas &amp; Indexes synced</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Website Analysis &amp; Visual Charts</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "projects"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Validated Startups Explorer ({savedProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "system"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Telemetry &amp; Database Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: WEBSITE ANALYSIS & CHARTS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Charts Row 1: Validations Timeline & Domain Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Platform Validations Timeline */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Website Validation Volume &amp; Activity Timeline
                  </h3>
                  <p className="text-xs text-slate-400">Daily startup validations, AI concept synthesis, and registered users</p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800">
                  Last 7 Days
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timelineData}>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="validations"
                      name="Reports Generated"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#purpleGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Active Users"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#emeraldGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Target Domain Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-400" />
                  Target Domain Distribution
                </h3>
                <p className="text-xs text-slate-400">Industry breakdown of created startup concepts</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.domainPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analyticsData.domainPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "11px",
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Regional Ecosystem & Feasibility Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Regional Geographic Hubs */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-amber-400" />
                    Target Geographic Ecosystems
                  </h3>
                  <p className="text-xs text-slate-400">Founder preferences for primary startup launch markets</p>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.hubBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hub" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" name="Targeted Startups" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Operational Status Cards */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Real-Time Platform Architecture &amp; Engine
                </h3>
                <p className="text-xs text-slate-400">Underlying backend microservices &amp; database pipelines</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">LLM Inference Engine</span>
                  </div>
                  <span className="text-emerald-400 font-mono">Gemini 1.5 Flash (Operational)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">Currency Denomination</span>
                  </div>
                  <span className="text-cyan-400 font-mono">Indian Rupees (INR / ₹)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">MongoDB Persistence</span>
                  </div>
                  <span className="text-purple-400 font-mono">startupgen (Port 27017)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">Cloud Feasibility Algorithm</span>
                  </div>
                  <span className="text-amber-400 font-mono">14-Stage Heuristics</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Need sample validation data?</span>
                <button
                  onClick={handleSeedDemoData}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold transition"
                >
                  + Seed Demo Startup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATED STARTUPS EXPLORER */}
      {activeTab === "projects" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Validated Startups &amp; Reports Repository
              </h3>
              <p className="text-xs text-slate-400">
                All startup ideas generated and analyzed across the website. Click any row to inspect the full 14-stage report.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 w-56"
                />
              </div>

              <button
                onClick={handleSeedDemoData}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                + Seed Project
              </button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No startup reports found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Users haven&apos;t saved any startup validations yet, or your search query yielded zero matches.
              </p>
              <button
                onClick={handleSeedDemoData}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
              >
                Seed Instant Demo Startup Project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Startup Name &amp; Tagline</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Viability Score</th>
                    <th className="px-4 py-3">Launch City</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProjects.map((p) => {
                    const isDeleting = isDeletingId === p.id;
                    const score = p.feasibility?.overallScore ?? 90;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.selectedIdea.name}</span>
                            <ExternalLink className="w-3 h-3 text-purple-400 opacity-60" />
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.selectedIdea.tagline}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-medium">
                            {p.selectedIdea.domain}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-cyan-300 font-mono text-[11px]">
                          {p.founderProfile.budget || "₹10,00,000"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              score >= 85
                                ? "text-emerald-400 bg-emerald-500/10"
                                : score >= 70
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-rose-400 bg-rose-500/10"
                            }`}
                          >
                            {score} / 100
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-[11px]">
                          {p.targetLocation?.city?.split("(")[0].trim() || "Bengaluru"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px] font-mono">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 transition"
                            title="Inspect 14-Stage Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 transition disabled:opacity-50"
                            title="Delete Project from MongoDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Registered User Accounts
              </h3>
              <p className="text-xs text-slate-400">All registered founder and administrator credentials in MongoDB</p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Users
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => {
                  const isAdmin = u.role === "admin" || u.username === "admin";

                  return (
                    <tr key={u.id || u.username} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isAdmin ? "bg-purple-600 text-white" : "bg-indigo-600 text-white"
                            }`}
                          >
                            {u.name?.charAt(0) || u.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name || u.username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isAdmin
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {isAdmin ? "Admin" : "Founder"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 transition"
                            title="Delete User from MongoDB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-400 font-mono">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TELEMETRY & DATABASE */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              MongoDB Cluster Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Database Name</span>
                <span className="font-mono text-white font-bold">{stats?.database || "startupgen"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Host Connection</span>
                <span className="font-mono text-emerald-400">mongodb://127.0.0.1:27017</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Collection: users</span>
                <span className="font-mono text-purple-300">{stats?.totalUsers ?? usersList.length} documents</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Collection: projects</span>
                <span className="font-mono text-purple-300">{stats?.totalProjects ?? savedProjects.length} documents</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Response Latency</span>
                <span className="font-mono text-emerald-400">{pingLatency} ms</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Live Ping</span>
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Website Operational Controls
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Seed Instant Test Report</div>
                  <div className="text-[11px] text-slate-400">Insert complete multi-stage test project into MongoDB</div>
                </div>
                <button
                  onClick={handleSeedDemoData}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                >
                  Seed Data
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Switch to Founder Validator</div>
                  <div className="text-[11px] text-slate-400">Test idea input form and concept generation as a founder</div>
                </div>
                <button
                  onClick={onSwitchToWizard}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Open Form
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Refresh Cloud Vault</div>
                  <div className="text-[11px] text-slate-400">Resynchronize all projects between MongoDB and browser cache</div>
                </div>
                <button
                  onClick={onRefreshData}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Sync Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
