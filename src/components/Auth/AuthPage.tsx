"use client";

import React, { useState } from "react";
import {
  Zap,
  Shield,
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Database,
  Globe,
  TrendingUp,
  BarChart3,
  Layers,
  Cpu,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Award,
  Compass,
} from "lucide-react";
import { User as UserType } from "@/types";

interface AuthPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "admin">("signin");

  // Form fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetForm = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleModeChange = (mode: "signin" | "signup" | "admin") => {
    setAuthMode(mode);
    resetForm();
    if (mode === "admin") {
      setUsername("admin");
      setPassword("admin");
    } else if (mode === "signin" && username === "admin") {
      setUsername("Guruprasad");
      setPassword("Guru@4913");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (authMode === "signin") {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            username: username.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Invalid username or password");
        }

        setSuccessMsg(`Welcome back, ${data.user.name || data.user.username}!`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 500);
      } else if (authMode === "signup") {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            username: username.trim(),
            name: name.trim() || username.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to register account");
        }

        setSuccessMsg("Account registered successfully in MongoDB!");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 600);
      } else if (authMode === "admin") {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "admin-login",
            username: username.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Invalid Admin authorization");
        }

        setSuccessMsg("Elevated Administrator Access Granted!");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: "admin" | "guru" | "new") => {
    if (type === "admin") {
      setAuthMode("admin");
      setUsername("admin");
      setPassword("admin");
      resetForm();
    } else if (type === "guru") {
      setAuthMode("signin");
      setUsername("Guruprasad");
      setPassword("Guru@4913");
      resetForm();
    } else {
      setAuthMode("signup");
      setUsername("Founder_" + Math.floor(100 + Math.random() * 900));
      setName("Alex Rivera");
      setEmail(`alex.${Math.floor(Math.random() * 1000)}@venturelab.io`);
      setPassword("startup2026");
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[25%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Zap className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Startup<span className="text-indigo-400">Gen</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  AI + API + Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                14-Stage Institutional Startup Validation Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">MongoDB Connected:</span>
              <span className="font-mono text-emerald-300 font-semibold">startupgen</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Arena */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-6xl">
          
          {/* Left Column: Platform Showcase */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Full-Stack Venture Intelligence Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Validate Venture Ideas with <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                Institutional AI Precision
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Step through our end-to-end 14-stage engine: from geographic ecosystem signals and competitor battlecards to the 82/100 AI Viability Score, MoSCoW MVP sprints, and cloud architecture blueprints.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl glass-panel border border-slate-800 backdrop-blur-md flex items-start gap-3 hover:border-indigo-500/40 transition group">
                <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 group-hover:scale-105 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">TAM / SAM / SOM Funnel</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Live CAGR &amp; market sizing hierarchy</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 backdrop-blur-md flex items-start gap-3 hover:border-emerald-500/40 transition group">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 group-hover:scale-105 transition">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">82/100 Viability Engine</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">5-factor algorithmic scoring &amp; verdict</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 backdrop-blur-md flex items-start gap-3 hover:border-cyan-500/40 transition group">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 group-hover:scale-105 transition">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">MoSCoW MVP &amp; Sprints</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">28-day launch plan &amp; 12-mo milestones</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 backdrop-blur-md flex items-start gap-3 hover:border-amber-500/40 transition group">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 group-hover:scale-105 transition">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Global Ecosystem Hubs</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">14 regional startup talent indices</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Login Credentials helper */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 1-Click Demo Accounts:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin")}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-900/50 hover:border-purple-400 transition flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin Demo (admin / admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("guru")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:border-indigo-400 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Founder Demo (Guruprasad)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login / Sign Up Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
              {/* Header Gradient Stripe */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleModeChange("signin")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    authMode === "signin"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    authMode === "signup"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("admin")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    authMode === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                      : "text-slate-400 hover:text-purple-300"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Header Titles */}
              <div className="mb-6 text-left">
                {authMode === "signin" && (
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Sign In to Platform
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Access your validated startup vault and AI synthesis engines.
                    </p>
                  </div>
                )}

                {authMode === "signup" && (
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Create Founder Account
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Register as a founder to generate and save unlimited venture reports.
                    </p>
                  </div>
                )}

                {authMode === "admin" && (
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Administrator Portal</h2>
                      <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/40">
                        Elevated Access
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      System dashboard, user management, and MongoDB collection oversight.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name for Sign Up */}
                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Username or Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {authMode === "admin"
                      ? "Admin Identifier / Username"
                      : authMode === "signup"
                      ? "Username"
                      : "Username or Email"}
                  </label>
                  <div className="relative">
                    {authMode === "admin" ? (
                      <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                    ) : (
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    )}
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={
                        authMode === "admin"
                          ? "admin"
                          : authMode === "signup"
                          ? "founder_guru"
                          : "Guruprasad or email"
                      }
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition ${
                        authMode === "admin"
                          ? "border-purple-500/50 focus:border-purple-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Email for Sign Up */}
                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@venturelab.io"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    {authMode === "signin" && (
                      <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">
                        Preset: Guru@4913
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition ${
                        authMode === "admin"
                          ? "border-purple-500/50 focus:border-purple-400"
                          : "border-slate-700 focus:border-indigo-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 ${
                    authMode === "admin"
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30"
                      : authMode === "signup"
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating with MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === "signin"
                          ? "Sign In to Validation Engine"
                          : authMode === "signup"
                          ? "Create & Launch Account"
                          : "Unlock Administrator Portal"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Footer Notice */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted Session</span>
                </span>
                <span>MongoDB v7.6 Synced</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 relative z-20 bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>StartupGen · AI + API + Cloud Multi-Sector Startup Validator Engine</div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>14-Stage Institutional Pipeline</span>
            <span>·</span>
            <span>Real-Time Cloud Blueprints</span>
            <span>·</span>
            <span>Zero Hallucination Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
