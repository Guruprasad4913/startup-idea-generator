"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SettingsModal } from "@/components/SettingsModal";
import { CloudVaultModal } from "@/components/CloudVaultModal";
import { CompareProjectsModal } from "@/components/CompareProjectsModal";
import { AdminPortalModal } from "@/components/Admin/AdminPortalModal";
import { AdminDashboard } from "@/components/Admin/AdminDashboard";
import { UserReportsDashboard } from "@/components/Dashboard/UserReportsDashboard";
import { AuthPage } from "@/components/Auth/AuthPage";
import { StepInput } from "@/components/Wizard/StepInput";
import { StepIdeaSelection } from "@/components/Wizard/StepIdeaSelection";
import { StepMarketValidation } from "@/components/Wizard/StepMarketValidation";
import { StepCloudFeasibility } from "@/components/Wizard/StepCloudFeasibility";
import { StepMvpAndRoadmap } from "@/components/Wizard/StepMvpAndRoadmap";
import { DossierExport } from "@/components/Wizard/DossierExport";
import {
  FounderProfile,
  StartupIdea,
  MarketValidation,
  FeasibilityReport,
  StartupProject,
  User,
} from "@/types";
import { getSavedProjects, syncVaultWithDatabase, saveProjectToVault } from "@/lib/storage";
import { getLocationByCity } from "@/lib/location-data";
import {
  Sparkles,
  Radio,
  Cloud,
  FileText,
  CheckCircle2,
  ChevronRight,
  Rocket,
  Milestone,
  Scale,
  Globe2,
  Activity,
  Award,
  ShieldCheck,
  FolderHeart,
} from "lucide-react";

export default function Home() {
  // Authentication state (First page opens with Login/Sign-up/Admin unless signed in)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<"dashboard" | "wizard">("dashboard");
  const [userView, setUserView] = useState<"reports" | "wizard">("reports");

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [apiKey, setApiKey] = useState<string>("");
  const [tavilyApiKey, setTavilyApiKey] = useState<string>("");
  const [cloudPreference, setCloudPreference] = useState<string>("AWS");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Core wizard data state
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<StartupIdea | null>(null);
  const [validation, setValidation] = useState<MarketValidation | null>(null);
  const [feasibility, setFeasibility] = useState<FeasibilityReport | null>(null);
  const [currentProject, setCurrentProject] = useState<StartupProject | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [savedProjects, setSavedProjects] = useState<StartupProject[]>([]);

  // Filter projects owned by current user (plus legacy reports without username tag)
  const userProjects = React.useMemo(() => {
    if (!currentUser) return [];
    return savedProjects.filter(
      (p) =>
        !p.username ||
        p.username.toLowerCase() === currentUser.username.toLowerCase() ||
        (currentUser.id && p.userId === currentUser.id) ||
        (currentUser._id && p.userId === currentUser._id)
    );
  }, [savedProjects, currentUser]);

  // Load user session, preferences, and saved vault items on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawUser = localStorage.getItem("startupgen_auth_user");
        if (rawUser) {
          const parsedUser = JSON.parse(rawUser);
          if (parsedUser && (parsedUser.username || parsedUser.email)) {
            setCurrentUser(parsedUser);
            if (parsedUser.role === "admin") {
              setAdminView("dashboard");
            } else {
              // For regular founders, if they have saved projects, default to reports hub
              const localProjects = getSavedProjects();
              const hasProjects = localProjects.some(
                (p) =>
                  !p.username ||
                  p.username.toLowerCase() === parsedUser.username.toLowerCase() ||
                  (parsedUser.id && p.userId === parsedUser.id)
              );
              setUserView(hasProjects ? "reports" : "wizard");
            }
          }
        }
      } catch (e) {
        console.warn("Session check error", e);
      } finally {
        setIsAuthChecking(false);
      }

      const savedKey = localStorage.getItem("startupgen_gemini_key") || "";
      const savedTavily = localStorage.getItem("startupgen_tavily_key") || "";
      const savedPref = localStorage.getItem("startupgen_cloud_pref") || "AWS";
      setApiKey(savedKey);
      setTavilyApiKey(savedTavily);
      setCloudPreference(savedPref);
      setSavedProjects(getSavedProjects());

      // Hydrate with MongoDB database
      syncVaultWithDatabase().then((projects) => {
        if (projects && projects.length > 0) {
          setSavedProjects(projects);
        }
      });
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      setAdminView("dashboard");
    } else {
      const localProjects = getSavedProjects();
      const hasProjects = localProjects.some(
        (p) =>
          !p.username ||
          p.username.toLowerCase() === user.username.toLowerCase() ||
          (user.id && p.userId === user.id)
      );
      setUserView(hasProjects ? "reports" : "wizard");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_auth_user", JSON.stringify(user));
    }
    // Refresh vault from MongoDB
    syncVaultWithDatabase().then((projects) => {
      if (projects) {
        setSavedProjects(projects);
        if (user.role !== "admin") {
          const has = projects.some(
            (p) =>
              !p.username ||
              p.username.toLowerCase() === user.username.toLowerCase() ||
              (user.id && p.userId === user.id)
          );
          if (has) setUserView("reports");
        }
      }
    });
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("startupgen_auth_user");
    }
    setUserView("reports");
    handleRestart();
  };

  const refreshVault = () => {
    setSavedProjects(getSavedProjects());
    syncVaultWithDatabase().then((projects) => {
      if (projects) setSavedProjects(projects);
    });
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_gemini_key", key);
    }
  };

  const handleSaveTavilyKey = (key: string) => {
    setTavilyApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_tavily_key", key);
    }
  };

  const handleSaveCloudPref = (pref: string) => {
    setCloudPreference(pref);
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_cloud_pref", pref);
    }
  };

  // Preset triggers with regional hub targeting
  const handleSelectPreset = (presetKey: string) => {
    let presetProfile: FounderProfile;

    if (presetKey === "food") {
      presetProfile = {
        domains: ["Food & Beverage", "Hospitality"],
        businessType: "Food & Beverage / Cafe",
        interests: ["Artisan Coffee", "Direct Farm Sourcing", "Quick Service"],
        skills: ["Culinary Operations", "Hospitality Management", "Local Marketing"],
        targetAudience: "Urban Professionals & Coffee Enthusiasts",
        budget: "₹5,00,000 - ₹25,00,000 (Seed Angel)",
        timeframe: "1-3 Months Full Beta",
        customContext: "Specialty single-origin micro-roastery cafe chain with zero-waste cold brew taprooms.",
        targetLocation: getLocationByCity("Bengaluru") || getLocationByCity("London"),
      };
    } else if (presetKey === "d2c") {
      presetProfile = {
        domains: ["D2C Consumer Brands", "Sustainable Lifestyle"],
        businessType: "Physical Products / D2C",
        interests: ["Eco-friendly Materials", "Circular Economy", "E-commerce"],
        skills: ["Brand Design", "Supply Chain Sourcing", "Performance Marketing"],
        targetAudience: "Eco-Conscious Urban Millennials & Gen-Z",
        budget: "₹5,00,000 - ₹25,00,000 (Seed Angel)",
        timeframe: "1-3 Months Full Beta",
        customContext: "Plastic-free 100% biodegradable bamboo fiber home essentials with closed-loop refill pods.",
        targetLocation: getLocationByCity("Mumbai") || getLocationByCity("San Francisco / Silicon Valley"),
      };
    } else if (presetKey === "agri") {
      presetProfile = {
        domains: ["Agriculture & Farming", "CleanTech"],
        businessType: "Agriculture & Green Ops",
        interests: ["Post-Harvest Storage", "Renewable Solar Cold Rooms", "Farmer Collectives"],
        skills: ["Agronomy & Cold Chain", "Operations", "Farmer Relations"],
        targetAudience: "Farmer Producer Organizations (FPOs) & Rural APMC Mandis",
        budget: "₹10,00,000 - ₹50,00,000 (Seed Angel)",
        timeframe: "3-6 Months Enterprise Pilot",
        customContext: "Decentralized solar-powered micro cold storage hubs for smallholder horticulture farmers reducing spoilage by 80%.",
        targetLocation: getLocationByCity("Bengaluru") || getLocationByCity("Toronto"),
      };
    } else if (presetKey === "fintech") {
      presetProfile = {
        domains: ["Fintech", "B2B SaaS"],
        businessType: "Tech & Software",
        interests: ["Fintech & Open Banking", "Workflow Automation & RPA"],
        skills: ["Full-Stack Dev", "Domain Specialist", "Cloud & DevOps"],
        targetAudience: "B2B Enterprise",
        budget: "₹10,00,000 - ₹50,00,000 (Seed Angel)",
        timeframe: "1-3 Months Pilot Launch",
        customContext: "Automated real-time accounting audit and cashflow anomaly detector for remote businesses.",
        targetLocation: getLocationByCity("London"),
      };
    } else if (presetKey === "healthtech") {
      presetProfile = {
        domains: ["HealthTech", "AI Agents"],
        businessType: "Healthcare & Wellness",
        interests: ["Healthcare & Clinical AI", "Enterprise Productivity"],
        skills: ["Machine Learning / AI", "Full-Stack Dev"],
        targetAudience: "B2B Enterprise",
        budget: "₹25,00,000 - ₹1,00,00,000 (Pre-Seed Fund)",
        timeframe: "1-3 Months Pilot Launch",
        customContext: "Ambient clinical SOAP notes transcriber and insurance prior-authorization engine.",
        targetLocation: getLocationByCity("Toronto"),
      };
    } else {
      // AI Agents
      presetProfile = {
        domains: ["AI Agents", "Cybersecurity", "DevTools"],
        businessType: "Tech & Software",
        interests: ["Autonomous AI Agents", "Developer Tools & APIs"],
        skills: ["Machine Learning / AI", "Cloud & DevOps", "Full-Stack Dev"],
        targetAudience: "Mid-Market SMBs",
        budget: "< ₹5,00,000 (Bootstrapped)",
        timeframe: "2-Week Rapid MVP",
        customContext: "Autonomous enterprise security gateway and rate-limiting proxy for multi-agent LLM teams.",
        targetLocation: getLocationByCity("San Francisco / Silicon Valley"),
      };
    }

    setProfile(presetProfile);
    setUserView("wizard");
    handleGenerateIdeas(presetProfile);
  };

  // Step 1 -> 2: Generate Ideas
  const handleGenerateIdeas = async (founderProfile: FounderProfile) => {
    setProfile(founderProfile);
    setIsLoading(true);
    setLoadingText("Synthesizing tailored startup concepts with regional market algorithms...");

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: founderProfile, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate concepts");

      setIdeas(data.ideas || []);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      alert(`Error generating ideas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> 3: Select Idea & Generate Market Validation
  const handleSelectIdeaAndValidate = async (idea: StartupIdea) => {
    if (!profile) return;
    setSelectedIdea(idea);
    setIsLoading(true);
    setLoadingText(`Validating "${idea.name}" with Market Sizing, Competitor Matrix & User Personas...`);

    try {
      const res = await fetch("/api/validate-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, profile, apiKey, tavilyApiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to validate market");

      setValidation(data.validation);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      alert(`Market validation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Manual Idea Validation (Bypass Step 2 AI Concept Generation)
  const handleDirectValidateIdea = async (idea: StartupIdea, founderProfile: FounderProfile) => {
    setProfile(founderProfile);
    setIdeas([idea]);
    setSelectedIdea(idea);
    setIsLoading(true);
    setLoadingText(`Directly validating "${idea.name}" with Market Sizing, Competitor Matrix & User Personas...`);

    try {
      const res = await fetch("/api/validate-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, profile: founderProfile, apiKey, tavilyApiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to validate market");

      setValidation(data.validation);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      alert(`Market validation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 -> 4: Generate Cloud Feasibility Blueprint & Scoring Engine
  const handleProceedToCloudFeasibility = async () => {
    if (!profile || !selectedIdea || !validation) return;
    setIsLoading(true);
    setLoadingText("Constructing Cloud Topologies, Running AI Scoring Engine & Simulating Unit Economics...");

    try {
      const res = await fetch("/api/cloud-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: selectedIdea, validation, profile, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate cloud blueprint");

      setFeasibility(data.feasibility);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      alert(`Feasibility error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 -> 5: Proceed to MVP Recommendation & Business Roadmap
  const handleProceedToMvpAndRoadmap = () => {
    if (!profile || !selectedIdea || !validation || !feasibility) return;
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 5 -> 6: View Final Executive Report
  const handleViewDossier = () => {
    if (!profile || !selectedIdea || !validation || !feasibility) return;

    const project: StartupProject = {
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser?.id || currentUser?._id,
      username: currentUser?.username,
      founderProfile: profile,
      selectedIdea,
      allIdeas: ideas,
      validation,
      feasibility,
      targetLocation: profile.targetLocation,
    };

    setCurrentProject(project);
    // Auto-persist directly into MongoDB & local vault
    saveProjectToVault(project);
    syncVaultWithDatabase().then((projects) => setSavedProjects(projects));
    setCurrentStep(6);
    setUserView("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load from Cloud Vault or User Reports Dashboard
  const handleSelectVaultProject = (p: StartupProject) => {
    setProfile(p.founderProfile);
    setIdeas(p.allIdeas || [p.selectedIdea]);
    setSelectedIdea(p.selectedIdea);
    setValidation(p.validation);
    setFeasibility(p.feasibility);
    setCurrentProject(p);
    setCurrentStep(6);
    setUserView("wizard");
    if (currentUser?.role === "admin") {
      setAdminView("wizard");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Restart flow
  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedIdea(null);
    setValidation(null);
    setFeasibility(null);
    setCurrentProject(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start new validation from User Reports Dashboard
  const handleStartNewValidation = () => {
    handleRestart();
    setUserView("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If loading session, show subtle spinner
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="text-xs text-slate-400 font-mono">Initializing StartupGen...</div>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, render Login / Sign-up / Admin Portal page first!
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. If authenticated, render full 14-Stage Validation Platform
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <Navigation
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        vaultCount={savedProjects.length}
        onSelectPreset={handleSelectPreset}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAdminPortal={() => {
          if (currentUser?.role === "admin") {
            setAdminView("dashboard");
          } else {
            setIsAdminPortalOpen(true);
          }
        }}
        adminView={adminView}
        onSetAdminView={setAdminView}
        userView={userView}
        onSetUserView={(v) => {
          setUserView(v);
          if (v === "wizard" && currentStep === 6 && !currentProject) {
            setCurrentStep(1);
          }
        }}
        userReportsCount={userProjects.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser?.role === "admin" && adminView === "dashboard" ? (
          <AdminDashboard
            currentUser={currentUser}
            savedProjects={savedProjects}
            onSelectProject={handleSelectVaultProject}
            onSwitchToWizard={() => setAdminView("wizard")}
            onSignOut={handleSignOut}
            onRefreshData={refreshVault}
          />
        ) : currentUser?.role !== "admin" && userView === "reports" && currentStep === 1 ? (
          <UserReportsDashboard
            currentUser={currentUser}
            projects={userProjects}
            onSelectProject={handleSelectVaultProject}
            onStartNewValidation={handleStartNewValidation}
            onOpenCompare={() => setIsCompareOpen(true)}
            onRefreshData={refreshVault}
          />
        ) : (
          <>
            {/* If regular founder has saved reports and is on step 1 of wizard, show quick banner to return to My Reports */}
            {currentUser?.role !== "admin" && userProjects.length > 0 && currentStep === 1 && (
              <div className="no-print max-w-5xl mx-auto mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/40 border border-indigo-500/30 flex items-center justify-between text-xs backdrop-blur-md shadow-lg shadow-indigo-950/20">
                <div className="flex items-center gap-2.5 text-indigo-200">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                    <FolderHeart className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span>
                    You have <strong>{userProjects.length}</strong> saved startup report(s) in your portfolio.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserView("reports");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <FolderHeart className="w-3.5 h-3.5" />
                  <span>View My Reports ({userProjects.length}) →</span>
                </button>
              </div>
            )}

            {/* If admin is viewing validator flow, provide a top banner to easily return to Admin Analytics */}
            {currentUser?.role === "admin" && (
              <div className="no-print max-w-5xl mx-auto mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/60 border border-purple-500/40 flex items-center justify-between text-xs backdrop-blur-md shadow-lg shadow-purple-950/20">
                <div className="flex items-center gap-2.5 text-purple-200">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
                    ⚡
                  </div>
                  <span>
                    Operating in <strong>Validator Flow Mode</strong>. You can switch back to website analytics at any time.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminView("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Return to Admin Analytics →</span>
                </button>
              </div>
            )}

            {/* Step Progression Breadcrumb (Shown on steps 2-6) */}
            {currentStep > 1 && (
              <div className="no-print max-w-5xl mx-auto mb-8 p-3 sm:p-4 rounded-3xl glass-panel border border-slate-800/90 shadow-xl flex items-center justify-between text-xs overflow-x-auto gap-2.5">
                {[
                  { num: 1, label: "Vision & Map", active: currentStep === 1, done: currentStep > 1 },
                  { num: 2, label: "AI Concepts", active: currentStep === 2, done: currentStep > 2 },
                  { num: 3, label: "Market & Users", active: currentStep === 3, done: currentStep > 3 },
                  { num: 4, label: "Feasibility & Score", active: currentStep === 4, done: currentStep > 4 },
                  { num: 5, label: "MVP & Roadmap", active: currentStep === 5, done: currentStep > 5 },
                  { num: 6, label: "Final Report", active: currentStep === 6, done: currentStep === 6 },
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (step.done) {
                          setCurrentStep(step.num as any);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={!step.done && !step.active}
                      className={`flex items-center gap-2 transition px-2.5 py-1.5 rounded-xl ${
                        step.active
                          ? "bg-indigo-950/60 border border-indigo-500/40 text-white shadow-md shadow-indigo-950/50"
                          : step.done
                          ? "cursor-pointer hover:bg-slate-900/60 text-slate-300"
                          : "cursor-default text-slate-500 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] font-mono transition-all ${
                          step.done
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                            : step.active
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-400/40 shadow-sm shadow-indigo-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {step.done ? "✓" : step.num}
                      </div>
                      <span
                        className={`font-semibold tracking-tight text-xs ${
                          step.active ? "text-white" : step.done ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {idx < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-700 ml-1 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}

            {/* Global Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center mb-5">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 absolute flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{loadingText}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">Synthesizing real-time market data &amp; cloud topologies...</p>
              </div>
            )}

            {/* Step Views */}
            {currentStep === 1 && (
              <StepInput
                onGenerate={handleGenerateIdeas}
                onDirectValidateIdea={handleDirectValidateIdea}
                isLoading={isLoading}
                initialProfile={profile || undefined}
              />
            )}

            {currentStep === 2 && (
              <StepIdeaSelection
                ideas={ideas}
                onSelectIdea={handleSelectIdeaAndValidate}
                onBack={() => setCurrentStep(1)}
                isValidating={isLoading}
              />
            )}

            {currentStep === 3 && selectedIdea && validation && (
              <StepMarketValidation
                idea={selectedIdea}
                validation={validation}
                onNext={handleProceedToCloudFeasibility}
                onBack={() => setCurrentStep(2)}
                isEvaluatingCloud={isLoading}
              />
            )}

            {currentStep === 4 && selectedIdea && feasibility && (
              <StepCloudFeasibility
                idea={selectedIdea}
                feasibility={feasibility}
                onNext={handleProceedToMvpAndRoadmap}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && selectedIdea && feasibility && (
              <StepMvpAndRoadmap
                idea={selectedIdea}
                feasibility={feasibility}
                onNext={handleViewDossier}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 6 && currentProject && (
              <DossierExport
                project={currentProject}
                onRestart={handleRestart}
                onProjectSaved={refreshVault}
                onBack={() => setCurrentStep(5)}
                onOpenCompare={() => setIsCompareOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">StartupGen</span>
            <span>— AI Idea Generation, Live API Market Validation & Cloud Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Built-in Heuristic & Gemini AI</span>
            <span>·</span>
            <span>Global Ecosystem Map</span>
            <span>·</span>
            <span>MoSCoW Backlog & Roadmap</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {currentUser?.role === "admin" && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          tavilyApiKey={tavilyApiKey}
          onSaveTavilyApiKey={handleSaveTavilyKey}
          cloudPreference={cloudPreference}
          onSaveCloudPreference={handleSaveCloudPref}
        />
      )}

      <CloudVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        projects={savedProjects}
        onSelectProject={handleSelectVaultProject}
        onProjectDeleted={refreshVault}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      <CompareProjectsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        projects={savedProjects}
        currentProject={currentProject}
      />

      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        currentUser={currentUser}
        savedProjects={savedProjects}
        onSelectProject={handleSelectVaultProject}
      />
    </div>
  );
}
