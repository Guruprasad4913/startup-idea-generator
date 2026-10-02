"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Mail,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Rocket,
  Milestone,
  MessageSquare,
  Compass,
  DollarSign,
  Layers,
  FileText,
  MapPin,
  Users,
} from "lucide-react";

export interface PartnerContact {
  id: string;
  name: string;
  email: string;
}

const DEFAULT_PARTNERS: PartnerContact[] = [
  {
    id: "partner-1",
    name: "Abhijith",
    email: "abhijithmachkure@gmail.com",
  },
  {
    id: "partner-2",
    name: "bazila",
    email: "bazilabatul5@gmail.com",
  },
  {
    id: "partner-3",
    name: "Guruprasad Dhabade",
    email: "guruprasaddhabade@gmail.com",
  },
  {
    id: "partner-4",
    name: "Suhani Khemane",
    email: "suhanikhemane@gmail.com",
  },
];

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  founderEmailContact?: string;
}

const STAGES_GUIDE = [
  {
    step: "1. Founder & Vision Mapping",
    description: "Captures your domain, skills, available budget in INR, and target launch timeframe.",
    icon: Compass,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    step: "2. Geographic Ecosystem Signals",
    description: "Evaluates city-specific talent indices, angel/VC funding climate, and local CAC benchmarks.",
    icon: MapPin,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    step: "3. AI Concept & Moat Discovery",
    description: "Synthesizes high-conviction startup ideas with proprietary architectural and network moats.",
    icon: Sparkles,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    step: "4. Problem & Solution Architecture",
    description: "Defines acute customer pain points, target buyer persona, and the 'Why Now?' timing catalyst.",
    icon: FileText,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    step: "5. TAM / SAM / SOM Telemetry",
    description: "Quantifies Total, Serviceable, and Obtainable market sizes with CAGR expansion rates.",
    icon: TrendingUp,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    step: "6. Customer Segmentation & Beachhead",
    description: "Segments the market by share, problem urgency, sales cycle, and beachhead priority.",
    icon: TrendingUp,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    step: "7. Competitor Vulnerability Analysis",
    description: "Maps direct and indirect competitors, uncovering incumbent weaknesses and differentiation.",
    icon: ShieldCheck,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    step: "8. Competitor Feature Battlecard",
    description: "Compares your native AI/cloud capabilities against incumbents in a structured matrix.",
    icon: ShieldCheck,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    step: "9. Target Persona & Acquisition Channels",
    description: "Identifies buyer titles, buying triggers, decision-makers, and estimated CAC per channel.",
    icon: MessageSquare,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    step: "10. Unit Economics & Pricing Model",
    description: "Simulates CAC, LTV, LTV:CAC health ratio, gross margins, and multi-month financial projections.",
    icon: DollarSign,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    step: "11. Cloud Architecture Blueprint",
    description: "Recommends compute, database, vector store, AI models, and monthly cloud run-rate tiers.",
    icon: Layers,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    step: "12. 5-Factor Viability Scoring Engine",
    description: "Calculates an objective score (/100) across Technical, Market, Financial, Regulatory, and Founder readiness.",
    icon: Award,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    step: "13. MoSCoW MVP Scope & Sprints",
    description: "Aligns Must-Have, Should-Have, and Could-Have feature backlogs with your specific launch timeframe.",
    icon: Rocket,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    step: "14. 12-Month Phased Business Roadmap",
    description: "4-phase growth milestones covering LOI targets, ARR goals, and financing rounds.",
    icon: Milestone,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
];

const FAQS = [
  {
    q: "Can I validate an existing startup idea instead of generating new ones?",
    a: "Yes! On Step 1 (Founder Profile), you can enter your exact Startup Name and describe your specific Problem Statement in the text area. You can also click 'Validate Exact Idea Now' to skip ideation and jump directly to Deep Market Validation.",
  },
  {
    q: "How does the MVP Scope adapt to my chosen timeframe?",
    a: "When you select a timeframe in Step 1 (e.g., 2-Week Rapid MVP, 30-Day Pilot, 1–3 Months Beta, or 6 Months Enterprise), Step 5 dynamically calibrates the MoSCoW scope, sprint deliverables, and business roadmap phases to match that exact duration.",
  },
  {
    q: "How is the 5-Factor Viability Score calculated?",
    a: "The engine runs a weighted algorithm evaluating Technical Feasibility (20%), Market Opportunity (25%), Financial Viability (20%), Regulatory/Risk (15%), and Founder Execution Readiness (20%) to produce an institutional score out of 100.",
  },
  {
    q: "Can I save, export, and compare my validation reports?",
    a: "Absolutely. In Step 6 (Institutional Venture Memo), you can save your report directly to your Cloud Vault / MongoDB portfolio, export a print-ready PDF, copy markdown to clipboard, or compare multiple ideas side-by-side.",
  },
  {
    q: "What if I enter my founder Gmail?",
    a: "Entering your founder Gmail on Step 1 associates your executive dossier and validation report with your email, ensuring it is preserved in your portfolio and accessible across sessions.",
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  founderEmailContact = "founder.startupgen@gmail.com",
}) => {
  const [activeTab, setActiveTab] = useState<"stages" | "faqs" | "partners">("partners");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Help &amp; Founder Support</h3>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  14-Stage Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">Everything you need to navigate the validation pipeline and connect with partners</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("stages")}
            className={`py-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === "stages"
              ? "border-indigo-500 text-indigo-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>14-Stage Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("faqs")}
            className={`py-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === "faqs"
              ? "border-indigo-500 text-indigo-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs</span>
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`py-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === "partners"
              ? "border-emerald-500 text-emerald-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Need help? Contact our team</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* TAB 1: 14-STAGE GUIDE */}
          {activeTab === "stages" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  The StartupGen engine runs your venture concept through <strong className="text-white">14 institutional validation stages</strong> before generating your exportable executive memorandum.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STAGES_GUIDE.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition"
                    >
                      <div className={`p-2 rounded-lg border flex-shrink-0 ${stage.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs">{stage.step}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{stage.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FAQS */}
          {activeTab === "faqs" && (
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs font-semibold text-white hover:bg-slate-900/60 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-indigo-400" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-slate-300 text-xs leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: 4 PARTNER GMAILS & SUPPORT */}
          {activeTab === "partners" && (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-emerald-950/30 border border-indigo-500/30 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Need help? Contact our team</h4>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Direct Support
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect directly with the founding partners for venture inquiries, technical advisory, and platform support.
                  </p>
                </div>
              </div>

              {/* 4 Partner Cards Grid (2x2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_PARTNERS.map((partner) => {
                  const isCopied = copiedId === partner.id;

                  return (
                    <div
                      key={partner.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between gap-3.5 shadow-md"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {partner.name.charAt(0) || "P"}
                        </div>
                        <h5 className="font-bold text-white text-sm">{partner.name}</h5>
                      </div>

                      {/* Gmail Address Box */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="font-mono text-xs text-emerald-300 font-bold truncate">{partner.email}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase flex-shrink-0">Gmail</span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopyEmail(partner.id, partner.email)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                          <span>{isCopied ? "Copied!" : "Copy Gmail"}</span>
                        </button>

                        <a
                          href={`mailto:${partner.email}?subject=StartupGen%20Partner%20Inquiry&body=Hi%20${encodeURIComponent(partner.name)},%0D%0A%0D%0AI%20am%20validating%20a%20startup%20concept%20and%20wanted%20to%20connect:`}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Email Partner</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Inquiries Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-white font-bold block">General Founder Contact</span>
                  <span className="text-slate-400 text-[11px]">Direct inbox: {founderEmailContact}</span>
                </div>
                <button
                  onClick={() => handleCopyEmail("general", founderEmailContact)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  {copiedId === "general" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{copiedId === "general" ? "Copied!" : "Copy General Gmail"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>StartupGen · 14-Stage Institutional Startup Validation Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
