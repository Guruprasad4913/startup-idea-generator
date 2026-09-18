"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { StartupProject } from "@/types";

interface CompareProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StartupProject[];
  currentProject?: StartupProject | null;
}

export const CompareProjectsModal: React.FC<CompareProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProject,
}) => {
  // Merge all available projects (saved + currently active if not already in list)
  const allProjects = [...projects];
  if (currentProject && !allProjects.some((p) => p.id === currentProject.id)) {
    allProjects.unshift(currentProject);
  }

  // Pre-select first 2 or 3 projects
  const [selectedIds, setSelectedIds] = useState<string[]>(
    allProjects.slice(0, 3).map((p) => p.id)
  );

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

  // Determine highest viability score
  const highestScore = Math.max(...comparedProjects.map((p) => p.feasibility.overallScore || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Startup Concept Comparison Matrix</h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Side-by-Side Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compare up to 3 validated startup concepts across viability scores, unit economics, market size, and execution timelines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Selection Chips (if more than 2 projects available) */}
        {allProjects.length > 2 && (
          <div className="py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold whitespace-nowrap">Select to Compare:</span>
            {allProjects.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleSelectProject(p.id)}
                  className={`px-3 py-1.5 rounded-xl transition border text-xs whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-semibold">{p.selectedIdea.name}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Comparison Grid */}
        <div className="overflow-y-auto overflow-x-auto flex-1 py-4">
          {comparedProjects.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Please select at least one startup concept to compare.
            </div>
          ) : (
            <div
              className="grid gap-4 min-w-[700px]"
              style={{
                gridTemplateColumns: `repeat(${comparedProjects.length}, minmax(0, 1fr))`,
              }}
            >
              {comparedProjects.map((p) => {
                const isWinner = p.feasibility.overallScore === highestScore && comparedProjects.length > 1;
                const loc = p.targetLocation || p.founderProfile.targetLocation;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-5 glass-panel border flex flex-col justify-between space-y-5 transition ${
                      isWinner
                        ? "border-emerald-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/20 shadow-xl shadow-emerald-500/10"
                        : "border-slate-800 bg-slate-950/70"
                    }`}
                  >
                    {/* Header: Name, Badge, Score */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {p.selectedIdea.domain}
                        </span>
                        {isWinner && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-md flex items-center gap-1">
                            <Award className="w-3 h-3" /> Top Pick
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-white tracking-tight">
                          {p.selectedIdea.name}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                          {p.selectedIdea.tagline}
                        </p>
                      </div>

                      {/* Score Gauge Pill */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-400">Viability Score</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-emerald-400">
                            {p.feasibility.overallScore}
                          </span>
                          <span className="text-xs text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Metric Rows */}
                    <div className="space-y-3 text-xs border-t border-slate-800/80 pt-3">
                      {/* Launch Hub */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> Target Launch Hub
                        </span>
                        <div className="text-white font-medium">
                          {loc ? `${loc.city}, ${loc.country}` : "San Francisco / Silicon Valley"}
                        </div>
                      </div>

                      {/* TAM / SAM / SOM */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Market Sizing — TAM (Total Addressable) / SOM (Serviceable Target)
                        </span>
                        <div className="text-white font-medium">
                          {p.validation.tam.value} · SOM: {p.validation.som.value}
                        </div>
                      </div>

                      {/* Unit Economics */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Unit Economics — LTV : CAC (Lifetime Value to Acquisition Ratio)
                        </span>
                        <div className="text-emerald-400 font-bold">
                          {p.feasibility.revenueModel.keyUnitEconomics.ltvCacRatio} (Margin: {p.feasibility.revenueModel.keyUnitEconomics.grossMargin})
                        </div>
                      </div>

                      {/* MVP Sprint Scope */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                          <Rocket className="w-3.5 h-3.5 text-purple-400" /> MVP (Minimum Viable Product) Launch Timeline
                        </span>
                        <div className="text-purple-300 font-medium">
                          {p.feasibility.mvpRecommendation?.timelineWeeks || 4} Weeks ({p.feasibility.cloudArchitecture.estimatedMonthlyCloudCost.mvp} cloud/mo)
                        </div>
                      </div>

                      {/* Defensible Moat */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-cyan-400" /> Defensible Moat
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
                        {p.feasibility.verdict}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
