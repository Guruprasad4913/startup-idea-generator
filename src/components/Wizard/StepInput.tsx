import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Rocket,
  IndianRupee,
  Users,
  Clock,
  Globe2,
  Lightbulb,
  Zap,
  Coffee,
  Package,
  Factory,
  Sprout,
  HeartPulse,
  Truck,
  Store,
  GraduationCap,
  Leaf,
  Cpu,
  Check,
  HardHat,
  Mail,
  HelpCircle,
} from "lucide-react";
import { FounderProfile, MapLocation, StartupIdea } from "@/types";
import { GLOBAL_STARTUP_HUBS, DEFAULT_LOCATION } from "@/lib/location-data";

interface StepInputProps {
  onGenerate: (profile: FounderProfile) => void;
  onDirectValidateIdea?: (idea: StartupIdea, profile: FounderProfile) => void;
  isLoading: boolean;
  initialProfile?: FounderProfile;
  defaultEmail?: string;
  onOpenHelp?: () => void;
}

const BUDGET_PRESETS = [
  { label: "< ₹5 Lakhs", value: "< ₹5,00,000 (Bootstrapped Lean MVP)" },
  { label: "₹5L - ₹25L", value: "₹5,00,000 - ₹25,00,000 (Angel Seed)" },
  { label: "₹25L - ₹1 Crore", value: "₹25,00,000 - ₹1,00,00,000 (Pre-Seed Fund)" },
  { label: "₹1 Crore+", value: "₹1,00,00,000+ (Institutional Venture)" },
];

const TIMEFRAME_OPTIONS = [
  "1-3 Months Full Beta",
  "30-Day Pilot Launch",
  "2-Week Rapid MVP (Minimum Viable Product) Sprint",
  "6 Months Enterprise Grade",
];

const INDUSTRY_CATEGORIES = [
  {
    id: "food",
    label: "Food & Beverage",
    domain: "Food & Beverage",
    businessType: "Food & Beverage / Cafe",
    badge: "Cafe & Dining",
    icon: Coffee,
    color: "hover:border-amber-500/50 hover:bg-amber-500/5",
    activeColor: "border-amber-500 bg-amber-500/10 text-amber-300",
    exampleProblem: "Specialty single-origin micro-roastery cafe chain with whole-bean monthly doorstep subscription club",
    skills: "Culinary Operations, Supply Chain & Hospitality",
    audience: "Urban Professionals & Coffee Enthusiasts",
  },
  {
    id: "d2c",
    label: "D2C (Direct-to-Consumer)",
    domain: "D2C (Direct-to-Consumer) Brands",
    businessType: "Physical Products / D2C (Direct-to-Consumer)",
    badge: "Consumer Products",
    icon: Package,
    color: "hover:border-pink-500/50 hover:bg-pink-500/5",
    activeColor: "border-pink-500 bg-pink-500/10 text-pink-300",
    exampleProblem: "100% biodegradable bamboo fiber everyday kitchenware and home essentials brand",
    skills: "Product Design, Brand Marketing & Vendor Sourcing",
    audience: "Eco-Conscious Millennial Households",
  },
  {
    id: "manufacturing",
    label: "Manufacturing & Hardware",
    domain: "Manufacturing",
    businessType: "Manufacturing & Hardware",
    badge: "Hardware & Production",
    icon: Factory,
    color: "hover:border-blue-500/50 hover:bg-blue-500/5",
    activeColor: "border-blue-500 bg-blue-500/10 text-blue-300",
    exampleProblem: "Modular decentralized solar cold storage rooms for rural agricultural mandis to prevent crop rot",
    skills: "Mechanical Engineering, Production Ops & Logistics",
    audience: "Commercial Facilities, Mandi Traders & FPOs (Farmer Producer Organizations)",
  },
  {
    id: "construction",
    label: "Construction & Infra",
    domain: "Construction & Infrastructure",
    businessType: "Construction & Infrastructure",
    badge: "Building & Materials",
    icon: HardHat,
    color: "hover:border-amber-500/50 hover:bg-amber-500/5",
    activeColor: "border-amber-500 bg-amber-500/10 text-amber-300",
    exampleProblem: "Factory-manufactured precast modular wall panels and turnkey commercial interior fit-out contracting company",
    skills: "Civil Engineering, Site Contracting & Materials Supply",
    audience: "Contractors, Commercial Developers & Property Owners",
  },
  {
    id: "agriculture",
    label: "Agriculture & Farming",
    domain: "Agriculture",
    businessType: "Agriculture & Green Ops",
    badge: "Agri-Supply",
    icon: Sprout,
    color: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    activeColor: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
    exampleProblem: "Vertical climate-controlled indoor hydroponic farm producing high-yield saffron and culinary microgreens",
    skills: "Horticulture, Agribusiness & Farm Operations",
    audience: "Luxury Hotels, Restaurants & Supermarkets",
  },
  {
    id: "wellness",
    label: "Healthcare & Wellness",
    domain: "Healthcare & Wellness",
    businessType: "Healthcare & Wellness",
    badge: "Clinics & Studios",
    icon: HeartPulse,
    color: "hover:border-red-500/50 hover:bg-red-500/5",
    activeColor: "border-red-500 bg-red-500/10 text-red-300",
    exampleProblem: "Boutique contrast recovery studio offering infrared saunas, cold plunge suites and pneumatic compression",
    skills: "Physiotherapy, Wellness Operations & Studio Management",
    audience: "Everyday Athletes, Gym-Goers & Stressed Executives",
  },
  {
    id: "services",
    label: "Physical Services",
    domain: "Physical Services",
    businessType: "Services & Operations",
    badge: "Operations & Fleet",
    icon: Truck,
    color: "hover:border-yellow-500/50 hover:bg-yellow-500/5",
    activeColor: "border-yellow-500 bg-yellow-500/10 text-yellow-300",
    exampleProblem: "Waterless on-demand mobile EV fleet detailing and doorstep rapid maintenance vans",
    skills: "Fleet Operations, Vendor Management & Dispatch",
    audience: "Commercial Fleet Operators & Vehicle Owners",
  },
  {
    id: "retail",
    label: "Retail & Stores",
    domain: "Retail",
    businessType: "Retail & Storefront",
    badge: "Stores & Experiences",
    icon: Store,
    color: "hover:border-teal-500/50 hover:bg-teal-500/5",
    activeColor: "border-teal-500 bg-teal-500/10 text-teal-300",
    exampleProblem: "Zero-waste packaging-free bulk grocery and natural detergent refill dispensary stores",
    skills: "Retail Merchandising & Community Building",
    audience: "Urban Apartment Dwellers & Zero-Waste Families",
  },
  {
    id: "education",
    label: "Education & Sports",
    domain: "Offline Education",
    businessType: "Offline Education & Sports",
    badge: "Academies & Clubs",
    icon: GraduationCap,
    color: "hover:border-cyan-500/50 hover:bg-cyan-500/5",
    activeColor: "border-cyan-500 bg-cyan-500/10 text-cyan-300",
    exampleProblem: "Hands-on weekend robotics, 3D printing and electronics maker labs for K-12 students",
    skills: "Curriculum Design, Coaching & Studio Operations",
    audience: "Parents of K-12 Students & Progressive Schools",
  },
  {
    id: "cleantech",
    label: "CleanTech & Waste",
    domain: "CleanTech & Waste Management",
    businessType: "CleanTech & Green Ops",
    badge: "Clean Energy",
    icon: Leaf,
    color: "hover:border-green-500/50 hover:bg-green-500/5",
    activeColor: "border-green-500 bg-green-500/10 text-green-300",
    exampleProblem: "Decentralized hydrometallurgical micro-hubs recovering pure copper and gold from discarded e-waste",
    skills: "Chemical Engineering & Environmental Compliance",
    audience: "Corporate IT Offices & Municipal Councils",
  },
  {
    id: "tech",
    label: "Tech & Software",
    domain: "B2B (Business-to-Business) SaaS (Software as a Service) & Tech",
    businessType: "Tech & Software",
    badge: "Digital Platforms",
    icon: Cpu,
    color: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
    activeColor: "border-indigo-500 bg-indigo-500/10 text-indigo-300",
    exampleProblem: "API (Application Programming Interface)-first automated real-time accounting audit and dynamic cashflow forecasting",
    skills: "Full-Stack Dev, Machine Learning & Product",
    audience: "Mid-Market SMBs (Small & Midsize Businesses) & B2B (Business-to-Business) Enterprise",
  },
  {
    id: "others",
    label: "Others / Custom",
    domain: "Custom Industry & New Markets",
    businessType: "Others",
    badge: "Flexible Model",
    icon: Sparkles,
    color: "hover:border-pink-500/50 hover:bg-pink-500/5",
    activeColor: "border-pink-500 bg-pink-500/10 text-pink-300",
    exampleProblem: "Fragmented market inefficiencies and underserved customer segments seeking modern innovative alternatives",
    skills: "Domain Expertise & Agile Execution",
    audience: "Target Market Customers & Specialized Segments",
  },
];

export const StepInput: React.FC<StepInputProps> = ({
  onGenerate,
  onDirectValidateIdea,
  isLoading,
  initialProfile,
  defaultEmail,
  onOpenHelp,
}) => {
  // Founder's Email / Gmail
  const [founderEmail, setFounderEmail] = useState<string>(
    initialProfile?.founderEmail || defaultEmail || ""
  );

  // Selected category preset (empty by default)
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Business Type
  const [businessType, setBusinessType] = useState<string>(
    initialProfile?.businessType || ""
  );

  // Custom business model specification (when Others is selected)
  const [customBusinessType, setCustomBusinessType] = useState<string>("");

  // 1. Startup Concept or Problem Statement
  const [customContext, setCustomContext] = useState<string>(
    initialProfile?.customContext || ""
  );

  // Optional exact startup name
  const [startupName, setStartupName] = useState<string>("");

  // 2. Target Industry / Domains (comma-separated or text)
  const [domainsInput, setDomainsInput] = useState<string>(
    initialProfile?.domains?.join(", ") || ""
  );

  // 3. Founder Skills & Strengths
  const [skillsInput, setSkillsInput] = useState<string>(
    initialProfile?.skills?.join(", ") || ""
  );

  // 4. Initial Budget in Indian Rupees
  const [budget, setBudget] = useState<string>(
    initialProfile?.budget || ""
  );

  // 5. Target Customer Audience
  const [targetAudience, setTargetAudience] = useState<string>(
    initialProfile?.targetAudience || ""
  );

  // 6. Launch Timeframe
  const [timeframe, setTimeframe] = useState<string>(
    initialProfile?.timeframe || ""
  );

  // 7. Target Location / Hub
  const [targetLocation, setTargetLocation] = useState<MapLocation | null>(
    initialProfile?.targetLocation || null
  );

  const parseList = (str: string, fallback: string[]): string[] => {
    const list = str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length > 0 ? list : fallback;
  };

  const handleSelectCategory = (cat: typeof INDUSTRY_CATEGORIES[0]) => {
    if (selectedCategory === cat.id) {
      setSelectedCategory("");
      setDomainsInput("");
      setBusinessType("");
      setCustomBusinessType("");
      setCustomContext("");
      setSkillsInput("");
      setTargetAudience("");
      return;
    }
    setSelectedCategory(cat.id);
    setDomainsInput(cat.domain);
    setBusinessType(cat.businessType);
    if (cat.id === "others") {
      setCustomBusinessType("");
    }
    if (!customContext || customContext.length < 10) {
      setCustomContext(cat.exampleProblem);
    }
    setSkillsInput(cat.skills);
    setTargetAudience(cat.audience);
  };

  // Submit profile to synthesize tailored concepts
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainsInput.trim()) {
      alert("Please enter at least one target domain or industry.");
      return;
    }
    const domains = parseList(domainsInput, ["Commercial Venture"]);
    const skills = parseList(skillsInput, ["Business Operations & Execution"]);

    const resolvedBusinessType = businessType === "Others"
      ? (customBusinessType.trim() || "Others / Custom Model")
      : (businessType || "Commercial Venture");

    const profile: FounderProfile = {
      domains,
      skills,
      businessType: resolvedBusinessType,
      interests: domains,
      targetAudience: targetAudience.trim() || "Target Customers",
      budget: budget.trim() || "₹5,00,000 - ₹25,00,000",
      timeframe: timeframe.trim() || "1-3 Months Full Beta",
      customContext: customContext.trim(),
      targetLocation: targetLocation || DEFAULT_LOCATION,
      founderEmail: founderEmail.trim() || undefined,
    };

    onGenerate(profile);
  };

  // Directly validate exact idea if provided
  const handleDirectValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainsInput.trim() && !startupName.trim() && !customContext.trim()) {
      alert("Please provide a Startup Name, Domain, or Problem Statement.");
      return;
    }
    const domains = parseList(domainsInput, ["Commercial Venture"]);
    const skills = parseList(skillsInput, ["Business Operations & Execution"]);

    const resolvedBusinessType = businessType === "Others"
      ? (customBusinessType.trim() || "Others / Custom Model")
      : (businessType || "Commercial Venture");

    const profile: FounderProfile = {
      domains,
      skills,
      businessType: resolvedBusinessType,
      interests: domains,
      targetAudience: targetAudience.trim() || "Target Customers",
      budget: budget.trim() || "₹5,00,000 - ₹25,00,000",
      timeframe: timeframe.trim() || "1-3 Months Full Beta",
      customContext: customContext.trim(),
      targetLocation: targetLocation || DEFAULT_LOCATION,
      founderEmail: founderEmail.trim() || undefined,
    };

    const finalName = startupName.trim() || `${domains[0] || "NextGen"} Venture`;
    const finalProblem = customContext.trim() || `Lack of high-quality, transparent, and sustainable solutions in ${domains.join(", ")}`;

    const directIdea: StartupIdea = {
      id: `idea-${Date.now()}`,
      name: finalName,
      tagline: `High-Impact Solution for ${domains[0] || "Market"}`,
      domain: domains[0] || "Commerce",
      businessType: resolvedBusinessType,
      problemStatement: finalProblem,
      solution: `An innovative and operationally grounded business model delivering direct customer value for ${domains.join(", ")}...`,
      targetPersona: {
        title: targetAudience.trim() || "Target Customer",
        painPoints: ["High operational overhead", "Fragmented legacy options", "Lack of verified quality"],
        willingnessToPay: "₹500 - ₹2,500 / order or monthly service",
      },
      whyNow: "Changing consumer preferences toward authentic quality, local sustainability, and transparent supply chains",
      innovationMoat: "Proprietary formulation/operations, direct grower/producer partnerships, and customer loyalty retention",
      tags: [...domains, businessType || "Commercial"],
      initialFeasibilityScore: 90,
    };

    if (onDirectValidateIdea) {
      onDirectValidateIdea(directIdea, profile);
    } else {
      onGenerate(profile);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Neat, Clean Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-blue-500/15 to-emerald-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Step 1 of 6: Founder Profile, Location Map &amp; Venture Vision</span>
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className="ml-2 pl-2 border-l border-indigo-500/40 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-[11px] transition"
              title="Open 14-Stage Platform Help & Founder Support"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Need Help?</span>
            </button>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Launch &amp; Validate Any <span className="gradient-text">Startup Concept</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          From Food &amp; Dining, D2C (Direct-to-Consumer) Physical Brands, Manufacturing, and Agriculture to Healthcare Clinics and Enterprise AI (Artificial Intelligence) Software — get institutional market sizing: TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market), competitor feature battlecards, and cloud architecture blueprints.
        </p>
      </div>

      {/* 1. Industry Category Picker Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Select Industry Sector (Tech &amp; Real-World Commercial)</span>
          </label>
          <span className="text-[11px] text-slate-400">Click to auto-populate domain, skills &amp; problem template</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {INDUSTRY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2.5 cursor-pointer group ${
                  isSelected
                    ? `${cat.activeColor} shadow-xl ring-2 ring-indigo-500/50 scale-[1.02]`
                    : `bg-slate-900/90 border-slate-800 text-slate-300 ${cat.color} hover:bg-slate-800/80`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:scale-105 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight text-white group-hover:text-indigo-300 transition">{cat.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Neat & Clean Form Container */}
      <form
        onSubmit={handleGenerate}
        className="glass-panel rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl border border-slate-700/80 bg-slate-950/80 backdrop-blur-2xl relative"
      >
        {/* Decorative subtle ambient glow */}
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Core Idea / Problem Statement (Full Width) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Startup Idea or Problem to Solve
            </span>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">Optional / Leave blank for AI (Artificial Intelligence) synthesis</span>
          </label>
          <textarea
            rows={3}
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            placeholder="Describe what you want to build or the problem you are solving (e.g. Specialty single-origin micro-roastery cafe chain, bamboo tableware brand, solar cold storage for farmers, or B2B (Business-to-Business) SaaS (Software as a Service))..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none leading-relaxed shadow-inner"
          />
        </div>

        {/* 2-Column Clean Entries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Target Industry & Domains */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Target Domain &amp; Industry *
            </label>
            <input
              type="text"
              required
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              placeholder="e.g. Food & Beverage, D2C (Direct-to-Consumer), Agriculture, Healthcare"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner"
            />
            <span className="text-[10px] text-slate-500">Industry or product category</span>
          </div>

          {/* Business Model / Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              Business Model Type *
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner cursor-pointer"
            >
              <option value="" disabled className="text-slate-500">
                Select business model type...
              </option>
              <option value="Food & Beverage / Cafe" className="bg-slate-950 text-slate-200">
                🍽️ Food &amp; Beverage / Cafe / Dining
              </option>
              <option value="Construction & Infrastructure" className="bg-slate-950 text-slate-200">
                🏗️ Construction &amp; Infrastructure
              </option>
              <option value="Turnkey Contracting & Field Services" className="bg-slate-950 text-slate-200">
                🔨 Turnkey Contracting &amp; Field Services
              </option>
              <option value="Physical Products / D2C" className="bg-slate-950 text-slate-200">
                📦 Physical Products &amp; D2C (Direct-to-Consumer) Brand
              </option>
              <option value="Manufacturing & Hardware" className="bg-slate-950 text-slate-200">
                🏭 Manufacturing &amp; Hardware
              </option>
              <option value="Agriculture & Green Ops" className="bg-slate-950 text-slate-200">
                🌾 Agriculture &amp; Farming
              </option>
              <option value="Healthcare & Wellness" className="bg-slate-950 text-slate-200">
                🏥 Healthcare Clinics &amp; Wellness
              </option>
              <option value="Services & Operations" className="bg-slate-950 text-slate-200">
                🚚 Physical Services &amp; Logistics
              </option>
              <option value="Retail & Storefront" className="bg-slate-950 text-slate-200">
                🛍️ Retail &amp; Brick-and-Mortar Store
              </option>
              <option value="Offline Education & Sports" className="bg-slate-950 text-slate-200">
                🎓 Offline Education &amp; Sports
              </option>
              <option value="CleanTech & Green Ops" className="bg-slate-950 text-slate-200">
                ♻️ CleanTech &amp; Waste Management
              </option>
              <option value="Tech & Software" className="bg-slate-950 text-slate-200">
                💻 Tech, Software &amp; AI (Artificial Intelligence)
              </option>
              <option value="Others" className="bg-slate-950 text-indigo-300 font-semibold">
                ✨ Others / Custom Business Model
              </option>
            </select>
            {businessType === "Others" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  placeholder="Specify custom model (e.g. Media &amp; Publishing, Agency, Franchise, Real Estate, Consulting)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/50 text-xs text-indigo-200 placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                />
              </div>
            )}
            <span className="text-[10px] text-slate-500">Core operational model</span>
          </div>

          {/* Founder Skills & Strengths */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              Founder Skills &amp; Capabilities *
            </label>
            <input
              type="text"
              required
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Culinary Ops, Sourcing, Marketing, Sales, Engineering"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-inner"
            />
            <span className="text-[10px] text-slate-500">Execution strengths of your team</span>
          </div>

          {/* Target Customer Segment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Target Customer Segment *
            </label>
            <input
              type="text"
              required
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Urban Professionals, Homeowners, Gym-Goers, FPOs (Farmer Producer Organizations)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
            />
            <span className="text-[10px] text-slate-500">Primary buyer persona</span>
          </div>

          {/* Founder's Email / Gmail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Founder&apos;s Email / Gmail
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono">For Dossier &amp; Alerts</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                placeholder="founder@gmail.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-inner"
              />
              <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <span className="text-[10px] text-slate-500">Associated with your 14-stage validation dossier</span>
          </div>

          {/* Launch Timeframe */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              MVP (Minimum Viable Product) Launch Timeframe *
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition shadow-inner cursor-pointer"
            >
              <option value="" disabled className="text-slate-500">
                Select launch timeframe...
              </option>
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-950 text-slate-200">
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500">Target sprint duration</span>
          </div>

          {/* Budget in Indian Rupees */}
          <div className="space-y-2 sm:col-span-2 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
                Initial Budget &amp; Runway (in ₹ Rupees) *
              </label>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">INR (Indian Rupee - ₹)</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₹5,00,000 Bootstrapped, ₹25,00,000 Seed Angel, ₹10 Lakhs..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition font-medium"
              />
              <IndianRupee className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {/* Rupee Quick Pill Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Presets:</span>
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setBudget(p.value)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 border ${
                    budget === p.value
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/50"
                      : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Launch Hub / Ecosystem */}
          <div className="space-y-2 sm:col-span-2 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                Target Launch Hub &amp; Geographic Market *
              </label>
              {targetLocation && (
                <span className="text-[10px] text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  Ecosystem Score: {targetLocation.ecosystemScore}/100
                </span>
              )}
            </div>
            <select
              value={targetLocation?.city || ""}
              onChange={(e) => {
                const found = GLOBAL_STARTUP_HUBS.find((h) => h.city === e.target.value);
                if (found) setTargetLocation(found);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
            >
              <option value="" disabled className="text-slate-500">
                Select target launch market / hub...
              </option>
              {GLOBAL_STARTUP_HUBS.map((hub) => (
                <option key={hub.city} value={hub.city} className="bg-slate-950 text-slate-200">
                  {hub.city}, {hub.country} (Score: {hub.ecosystemScore}/100)
                </option>
              ))}
            </select>
            {targetLocation ? (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">Talent Index</span>
                  <span className="text-slate-200 font-semibold">{targetLocation.talentIndex}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">VC (Venture Capital) Climate</span>
                  <span className="text-slate-200 font-semibold">{targetLocation.vcFundingClimate}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">Avg CAC (Customer Acquisition Cost)</span>
                  <span className="text-emerald-400 font-semibold">{targetLocation.avgCustomerAcquisitionCost}</span>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-500">
                Select an ecosystem hub to benchmark regional talent index, VC (Venture Capital) investment, and CAC (Customer Acquisition Cost)
              </div>
            )}
          </div>

          {/* Optional: Startup Name (if already decided) */}
          <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Startup Name (Optional)
              </span>
              <span className="text-[10px] text-slate-500">Leave blank if exploring concepts</span>
            </label>
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. LedgerPulse AI, OmniCare Health, DevPulse"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner"
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          {/* Direct validation button if user entered a specific name/problem */}
          {customContext.trim().length > 10 && (
            <button
              type="button"
              onClick={handleDirectValidate}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-emerald-950/50"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Validate This Exact Concept Directly</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 border border-indigo-400/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Market &amp; Cloud Feasibility...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate Startup Validation &amp; Market Output</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
