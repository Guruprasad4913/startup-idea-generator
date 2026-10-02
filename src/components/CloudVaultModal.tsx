"use client";

import React, { useState } from "react";
import { X, Trash2, ExternalLink, Download, Sparkles, TrendingUp, ShieldAlert, Award, Scale, Database } from "lucide-react";
import { StartupProject, User } from "@/types";
import { deleteProjectFromVault, exportProjectAsMarkdown } from "@/lib/storage";

interface CloudVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StartupProject[];
  currentUser?: User | null;
  onSelectProject: (p: StartupProject) => void;
  onProjectDeleted: () => void;
  onOpenCompare?: () => void;
}

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentUser,
  onSelectProject,
  onProjectDeleted,
  onOpenCompare,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filtered = projects.filter(
    (p) =>
      p.selectedIdea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.selectedIdea.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.selectedIdea.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this validated startup report from your Cloud Vault?")) {
      deleteProjectFromVault(id, currentUser);
      onProjectDeleted();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">Cloud Storage Vault</h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                {projects.length} Saved Reports
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" /> MongoDB Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently preserved in MongoDB & local storage cache with live API market metrics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & Compare Trigger */}
        {projects.length > 0 && (
          <div className="my-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search saved startups by name, domain, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700/70 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {onOpenCompare && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCompare();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Ideas</span>
              </button>
            )}
          </div>
        )}

        {/* Projects list */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {projects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No saved startups yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Generate an idea and click &quot;Save to Cloud Vault&quot; in the final report to store it here for future reference and comparison.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">
              No startup concepts match your search criteria.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  onClose();
                }}
                className="group p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                      {p.selectedIdea.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {p.selectedIdea.domain}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {p.selectedIdea.tagline}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Award className="w-3.5 h-3.5" />
                      Score: {p.feasibility.overallScore}/100 ({p.feasibility.verdict})
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      TAM (Total Addressable Market): {p.validation.tam.value}
                    </span>
                    <span className="text-slate-500">
                      Provider: {p.feasibility.cloudArchitecture.recommendedProvider}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={(e) => handleDownloadMarkdown(p, e)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition"
                    title="Export Markdown Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
                  >
                    Load Report <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
