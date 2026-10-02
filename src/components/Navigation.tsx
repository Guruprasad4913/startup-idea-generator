"use client";

import React from "react";
import {
  Sparkles,
  Cloud,
  Database,
  Cpu,
  Settings,
  FolderHeart,
  Zap,
  Scale,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  HelpCircle,
} from "lucide-react";
import { User } from "@/types";

interface NavigationProps {
  onOpenSettings: () => void;
  onOpenVault?: () => void;
  onOpenCompare?: () => void;
  vaultCount?: number;
  onSelectPreset: (presetName: string) => void;
  currentUser: User | null;
  onSignOut: () => void;
  onOpenAdminPortal?: () => void;
  adminView?: "dashboard" | "wizard";
  onSetAdminView?: (view: "dashboard" | "wizard") => void;
  userView?: "reports" | "wizard";
  onSetUserView?: (view: "reports" | "wizard") => void;
  userReportsCount?: number;
  onOpenHelp?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenSettings,
  onOpenVault: _onOpenVault,
  onOpenCompare,
  vaultCount: _vaultCount,
  onSelectPreset,
  currentUser,
  onSignOut,
  onOpenAdminPortal,
  adminView = "dashboard",
  onSetAdminView,
  userView = "reports",
  onSetUserView,
  userReportsCount = 0,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-indigo-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Startup<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400 font-extrabold">Gen</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
                Multi-Sector Validation
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block">
              14-Stage Institutional Idea Validation Engine
            </p>
          </div>
        </div>

        {/* Action Buttons & User Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin View Switcher (If user is Admin) */}
          {currentUser?.role === "admin" && onSetAdminView && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-indigo-500/30 shadow-md">
              <button
                type="button"
                onClick={() => onSetAdminView("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  adminView === "dashboard"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => onSetAdminView("wizard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  adminView === "wizard"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 border border-cyan-400/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Validator Flow</span>
              </button>
            </div>
          )}

          {/* Founder View Switcher (If user is regular Founder) */}
          {currentUser?.role !== "admin" && onSetUserView && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-indigo-500/30 shadow-md">
              <button
                type="button"
                onClick={() => onSetUserView("reports")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  userView === "reports"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="View All Previously Generated Reports"
              >
                <FolderHeart className="w-3.5 h-3.5 text-emerald-300" />
                <span>My Reports</span>
                {typeof userReportsCount === "number" && userReportsCount > 0 && (
                  <span className="bg-emerald-400/30 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-300/40">
                    {userReportsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSetUserView("wizard")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  userView === "wizard"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30 border border-cyan-400/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Start a New 14-Stage Startup Validation"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Validation</span>
              </button>
            </div>
          )}

          {/* MongoDB Live Status Pill (Admin Dashboard only) */}
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs hover:bg-emerald-900/60 hover:border-emerald-400 transition font-mono shadow-md shadow-emerald-950/30 cursor-pointer"
              title="MongoDB Connected: 127.0.0.1:27017 / startupgen (Admin: Click to configure)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-sans font-bold text-emerald-300">
                startupgen
              </span>
            </button>
          )}

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-indigo-500/30 hover:border-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Compare Saved Startup Concepts"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          {/* Help & Support Button (Only for founders, hidden in admin portal) */}
          {onOpenHelp && currentUser?.role !== "admin" && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-indigo-500/30 hover:border-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="14-Stage Guide, FAQs & Founder Support"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}

          {/* Setting button: Only visible for Admin login */}
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 transition"
              title="Admin Settings: Configure AI API & Cloud Providers"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Pill & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l border-slate-800">
              <div
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                title={`Signed in as ${currentUser.username}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${currentUser.role === "admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                >
                  {currentUser.username.substring(0, 1).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white leading-tight">
                    {currentUser.username}
                  </div>
                  <div
                    className={`text-[9px] font-bold uppercase ${currentUser.role === "admin" ? "text-amber-400" : "text-emerald-400"
                      }`}
                  >
                    {currentUser.role === "admin" ? "Admin" : "Founder"}
                  </div>
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-500/30 border border-slate-800 transition"
                title="Sign Out / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
