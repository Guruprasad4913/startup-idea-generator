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
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
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
                Multi-Sector Validation
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              14-Stage Institutional Idea Validation Engine
            </p>
          </div>
        </div>

        {/* Action Buttons & User Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin View Switcher (If user is Admin) */}
          {currentUser?.role === "admin" && onSetAdminView && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-purple-500/40">
              <button
                type="button"
                onClick={() => onSetAdminView("dashboard")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  adminView === "dashboard"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => onSetAdminView("wizard")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  adminView === "wizard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
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
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-indigo-500/40">
              <button
                type="button"
                onClick={() => onSetUserView("reports")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  userView === "reports"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="View All Previously Generated Reports"
              >
                <FolderHeart className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Reports</span>
                {typeof userReportsCount === "number" && userReportsCount > 0 && (
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                    {userReportsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onSetUserView("wizard")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  userView === "wizard"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Start a New 14-Stage Startup Validation"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Validation</span>
              </button>
            </div>
          )}

          {/* MongoDB Live Status Pill */}
          {currentUser?.role === "admin" ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-900/40 hover:border-emerald-500/50 transition font-mono shadow-sm cursor-pointer"
              title="MongoDB Connected: 127.0.0.1:27017 / startupgen (Admin: Click to configure)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-sans font-medium text-emerald-300">
                startupgen
              </span>
            </button>
          ) : (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono shadow-sm cursor-default"
              title="MongoDB Connected: 127.0.0.1:27017 / startupgen"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-sans font-medium text-emerald-300">
                startupgen
              </span>
            </div>
          )}

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700/80 hover:border-indigo-400 hover:text-white transition flex items-center gap-1.5 text-sm font-medium shadow-sm"
              title="Compare Saved Startup Concepts"
            >
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}

          {/* Setting button: Only visible for Admin login */}
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 text-purple-400 hover:text-purple-200 border border-purple-500/40 hover:border-purple-400 transition"
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
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
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
                    className={`text-[9px] font-bold uppercase ${currentUser.role === "admin" ? "text-purple-400" : "text-emerald-400"
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
