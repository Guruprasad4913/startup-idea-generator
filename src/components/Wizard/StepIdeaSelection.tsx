"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check, Zap, Target, Shield, Clock, TrendingUp, PenTool, X, Plus } from "lucide-react";
import { StartupIdea } from "@/types";

interface StepIdeaSelectionProps {
  ideas: StartupIdea[];
  onSelectIdea: (idea: StartupIdea) => void;
  onBack: () => void;
  isValidating: boolean;
}

export const StepIdeaSelection: React.FC<StepIdeaSelectionProps> = ({
  ideas: initialIdeas,
  onSelectIdea,
  onBack,
  isValidating,
}) => {
  const [ideas, setIdeas] = useState<StartupIdea[]>(initialIdeas);
  const [selectedId, setSelectedId] = useState<string>(initialIdeas[0]?.id || "");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom concept form state
  const [customName, setCustomName] = useState("");
  const [customTagline, setCustomTagline] = useState("");
  const [customDomain, setCustomDomain] = useState("AI Agents");
  const [customProblem, setCustomProblem] = useState("");
  const [customSolution, setCustomSolution] = useState("");
  const [customPersona, setCustomPersona] = useState("Operations Director");

  const currentSelectedIdea = ideas.find((i) => i.id === selectedId) || ideas[0];

  const handleAddCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customProblem.trim()) return;

    const newIdea: StartupIdea = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      tagline: customTagline.trim() || `Next-Gen AI + Cloud Platform for ${customDomain}`,
      domain: customDomain.trim(),
      problemStatement: customProblem.trim(),
      solution: customSolution.trim() || `An automated AI-native cloud workflow application solving ${customProblem.substring(0, 70)}...`,
      targetPersona: {
        title: customPersona.trim() || "Operations & Product Lead",
        painPoints: ["High manual overhead", "Lack of real-time insights"],
        willingnessToPay: "$199 - $900/month",
      },
      whyNow: "Rapid proliferation of generative AI APIs and automated cloud serverless infrastructure",
      innovationMoat: "Proprietary workflow graph heuristics and domain integration",
      tags: [customDomain, "Custom", "AI", "Cloud"],
      initialFeasibilityScore: 92,
    };

    setIdeas([newIdea, ...ideas]);
    setSelectedId(newIdea.id);
    setIsCustomModalOpen(false);
    // Reset fields
    setCustomName("");
    setCustomTagline("");
    setCustomProblem("");
    setCustomSolution("");
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Step 2 of 6: AI (Artificial Intelligence) Concept Selection
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Select Your Startup Concept to Validate
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Our AI (Artificial Intelligence) engine generated {ideas.length} tailored opportunities. Choose one to perform deep real-time API (Application Programming Interface) market scans &amp; cloud blueprinting.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>+ Enter Custom Idea</span>
          </button>

          <button
            onClick={onBack}
            disabled={isValidating}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition text-xs font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Adjust Inputs</span>
          </button>
        </div>
      </div>

      {/* Idea Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const isSelected = idea.id === selectedId;
          return (
            <div
              key={idea.id}
              onClick={() => setSelectedId(idea.id)}
              className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900/95 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/30 -translate-y-1"
                  : "glass-panel-subtle hover:border-slate-700 hover:bg-slate-900/80 hover:-translate-y-1"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3.5 right-5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/40 ring-2 ring-slate-950">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected Concept
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {idea.domain}
                    </span>
                    {idea.businessType && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {idea.businessType}
                      </span>
                    )}
                  </div>
                  {idea.initialFeasibilityScore && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      {idea.initialFeasibilityScore}/100
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300">
                    {idea.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed line-clamp-2">
                    {idea.tagline}
                  </p>
                </div>

                {/* Problem & Solution Mini */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Problem</span>
                    <p className="text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{idea.problemStatement}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Solution Strategy</span>
                    <p className="text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{idea.solution}</p>
                  </div>
                </div>

                {/* Target persona preview */}
                <div className="pt-2 border-t border-slate-800/80 text-xs flex items-center gap-2 text-slate-400">
                  <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate font-medium text-slate-300">{idea.targetPersona.title}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/70 text-slate-400 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Idea Detailed Preview Drawer */}
      {currentSelectedIdea && (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-500/30 space-y-5 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Concept Blueprint Selected
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentSelectedIdea.name}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{currentSelectedIdea.tagline}</p>
            </div>
            <button
              onClick={() => onSelectIdea(currentSelectedIdea)}
              disabled={isValidating}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Market &amp; Cloud Blueprint...</span>
                </>
              ) : (
                <>
                  <span>Deep Validate This Concept</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Target Buyer Persona
              </span>
              <p className="text-slate-100 font-semibold text-sm">{currentSelectedIdea.targetPersona.title}</p>
              <div className="text-slate-400 pt-1 border-t border-slate-900">
                Willingness to Pay: <strong className="text-emerald-400 font-mono">{currentSelectedIdea.targetPersona.willingnessToPay}</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Why Now / Timing Catalyst
              </span>
              <p className="text-slate-300 leading-relaxed">{currentSelectedIdea.whyNow}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Innovation Moat
              </span>
              <p className="text-slate-300 leading-relaxed">{currentSelectedIdea.innovationMoat}</p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Custom Concept Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-indigo-500/40 p-6 sm:p-7 space-y-5 bg-slate-900/95 shadow-2xl shadow-indigo-950/50 relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Enter Custom Startup Concept</h3>
                  <p className="text-[11px] text-slate-400">Add your bespoke venture idea into the AI validation funnel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomIdea} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Startup Name *</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. LedgerPulse AI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Domain / Vertical</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. Food & Beverage, D2C (Direct-to-Consumer), Farming, Healthcare, SaaS (Software as a Service)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Tagline / One-Liner</label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  placeholder="e.g. Specialty single-origin roastery, or sustainable bamboo packaging"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Customer Problem Statement *</label>
                <textarea
                  rows={2}
                  required
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="What acute customer or market problem are you solving?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Business &amp; Value Solution *</label>
                <textarea
                  rows={2}
                  value={customSolution}
                  onChange={(e) => setCustomSolution(e.target.value)}
                  placeholder="How does your product, service, or business model operate?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
