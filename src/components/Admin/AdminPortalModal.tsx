"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  X,
  Users,
  Database,
  Layers,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  FileText,
  Key,
  ExternalLink,
} from "lucide-react";
import { User, StartupProject } from "@/types";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  savedProjects: StartupProject[];
  onSelectProject?: (p: StartupProject) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  savedProjects,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "projects" | "telemetry">("users");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalProjects: number;
    database: string;
    serverTime: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-users" }),
      });
      const usersData = await usersRes.json();
      if (usersData.success && Array.isArray(usersData.users)) {
        setUsersList(usersData.users);
      }

      // Fetch stats
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
      console.error("Admin fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteUser = async (u: User) => {
    if (u.username === "admin" || u.role === "admin") {
      alert("Master Administrator account cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${u.username}" from MongoDB?`)) {
      return;
    }

    setIsDeleting(u.id || u.username);
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
        setMessage(`User ${u.username} deleted.`);
        setTimeout(() => setMessage(""), 3000);
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      alert(err?.message || "Delete error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Administrator Command Center</h2>
                <span className="text-[10px] uppercase font-bold bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Superuser
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="text-amber-300 font-semibold">{currentUser?.username || "Admin"}</span> · MongoDB Database: <span className="font-mono text-emerald-400">startupgen</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Refresh Admin Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Registered Users</div>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers ?? usersList.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">MongoDB Reports</div>
              <div className="text-2xl font-bold text-emerald-400">
                {stats?.totalProjects ?? savedProjects.length}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Cluster Status</div>
              <div className="text-sm font-bold text-indigo-300 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>127.0.0.1:27017</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Validated Startups ({savedProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "telemetry"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & MongoDB</span>
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Contents: Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: USERS */}
          {activeTab === "users" && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Registered At</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {usersList.map((u) => (
                      <tr key={u.id || u.username} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                            {u.username.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.name || u.username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === "admin"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </td>
                        <td className="p-3 text-right">
                          {u.role === "admin" ? (
                            <span className="text-[10px] text-slate-500 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isDeleting === (u.id || u.username)}
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-3">
              {savedProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No validated projects found in database yet. Run the 14-stage wizard to generate one!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.selectedIdea.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Score: {p.feasibility.overallScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {p.selectedIdea.tagline}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{p.founderProfile.targetAudience}</span>
                        {onSelectProject && (
                          <button
                            onClick={() => {
                              onSelectProject(p);
                              onClose();
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Report</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TELEMETRY */}
          {activeTab === "telemetry" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>MongoDB Infrastructure Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Database Name</span>
                    <span className="font-mono text-emerald-400 font-semibold">startupgen</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Host</span>
                    <span className="font-mono text-indigo-300 font-semibold">127.0.0.1:27017</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Active Collections</span>
                    <span className="font-mono text-slate-200">projects, users, reports</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Sync Driver</span>
                    <span className="font-mono text-slate-200">mongodb@v7.6 (Native Node)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>StartupGen Administrator Security Suite</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition font-semibold"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
