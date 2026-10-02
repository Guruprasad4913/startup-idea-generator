export interface MapLocation {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  ecosystemScore: number; // 0 - 100
  talentIndex: string; // e.g., "9.4/10 Tier-1"
  vcFundingClimate: string; // e.g., "Hyperactive ($14.2B Early-Stage)"
  regulatoryFriendliness: string; // e.g., "Favorable Sandbox (Fast-Track)"
  avgCustomerAcquisitionCost: string; // e.g., "$140 - $280"
  keyHubs: string[];
}

export interface FounderProfile {
  domains: string[];
  skills: string[];
  businessType?: string;
  interests?: string[];
  targetAudience: string;
  budget: string;
  timeframe: string;
  customContext?: string;
  targetLocation?: MapLocation;
  founderEmail?: string;
}

export interface StartupIdea {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  businessType?: string;
  problemStatement: string;
  solution: string;
  targetPersona: {
    title: string;
    painPoints: string[];
    willingnessToPay: string;
  };
  whyNow: string;
  innovationMoat: string;
  tags: string[];
  initialFeasibilityScore?: number;
}

export interface TargetUserAnalysis {
  personaName: string;
  roleTitle: string;
  organizationType: string;
  acutePainPoints: string[];
  buyingTriggerMoments: string[];
  willingnessToPayRange: string;
  decisionMakers: string[];
  acquisitionChannels: Array<{
    channel: string;
    effectiveness: "High" | "Medium" | "Experimental";
    estimatedCac: string;
  }>;
  adoptionFriction: string;
  retentionDrivers: string[];
}

export interface CompetitorFeatureComparison {
  features: string[];
  competitors: Array<{
    name: string;
    scores: Record<string, boolean | string>;
  }>;
  ourProduct: {
    name: string;
    scores: Record<string, boolean | string>;
  };
}

export interface MarketValidation {
  ideaId: string;
  marketSummary: string;
  regionalMarketDynamics?: string;
  tavilyResearchSummary?: string;
  usedTavily?: boolean;
  tam: {
    value: string;
    numBillions: number;
    description: string;
  };
  sam: {
    value: string;
    numBillions: number;
    description: string;
  };
  som: {
    value: string;
    numBillions: number;
    description: string;
  };
  cagr: string;
  competitors: Array<{
    name: string;
    type: "Direct" | "Indirect";
    strengths: string;
    weaknesses: string;
    ourDifferentiation: string;
    fundingOrScale: string;
  }>;
  competitorComparisonMatrix?: CompetitorFeatureComparison;
  targetUserAnalysis?: TargetUserAnalysis;
  realTimeTrends: Array<{
    source: string;
    headline: string;
    sentiment: "Bullish" | "Neutral" | "Competitive";
    growthSignal: string;
    url?: string;
    points?: number;
  }>;
  targetSegments: Array<{
    segment: string;
    sizeShare: string;
    urgency: "High" | "Medium" | "Critical";
    salesCycle: string;
  }>;
}

export interface CloudArchitectureComponent {
  category: "Frontend & Edge" | "API Gateway & Auth" | "AI & Core Compute" | "Database & Storage" | "3rd-Party APIs";
  name: string;
  details: string;
  cloudIcon: "aws" | "gcp" | "azure" | "api" | "db" | "ai";
}

export interface ScoringFactor {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // 0 - 100 percent
  impact: "Positive" | "Neutral" | "Risk";
  rationale: string;
}

export interface ScoringEngineBreakdown {
  viabilityScore: number;
  verdict: "Strong Go" | "Conditional Go" | "High Risk Pivot";
  verdictSummary: string;
  percentileRank: string;
  factors: ScoringFactor[];
}

export interface MVPRecommendation {
  mvpName: string;
  timelineWeeks: number;
  timeframe?: string;
  coreValueProposition: string;
  featureBacklog: {
    mustHave: string[];
    shouldHave: string[];
    couldHave: string[];
  };
  recommendedStack: {
    frontend: string;
    backend: string;
    database: string;
    aiModel: string;
    lowCodeAccelerators: string[];
  };
  fourWeekSprintPlan: Array<{
    week: number;
    title: string;
    periodLabel?: string;
    daysLabel?: string;
    goals: string[];
    deliverable: string;
  }>;
}

export interface BusinessRoadmap {
  phases: Array<{
    phase: number;
    title: string;
    timeframe: string;
    milestones: string[];
    keyMetrics: string;
    fundingGoal: string;
    status: "Completed" | "Active" | "Upcoming" | "Planned";
  }>;
}

export interface FeasibilityReport {
  overallScore: number;
  technicalScore: number;
  marketScore: number;
  financialScore: number;
  regulatoryScore: number;
  executionScore: number;
  verdict: "Strong Go" | "Conditional Go" | "High Risk Pivot";
  verdictSummary: string;
  radarData: Array<{
    subject: string;
    score: number;
    fullMark: number;
  }>;
  scoringEngine?: ScoringEngineBreakdown;
  mvpRecommendation?: MVPRecommendation;
  businessRoadmap?: BusinessRoadmap;
  cloudArchitecture: {
    recommendedProvider: "AWS" | "Google Cloud" | "Microsoft Azure" | "Hybrid Cloud";
    compute: string;
    database: string;
    aiInference: string;
    storageAndCDN: string;
    thirdPartyAPIs: Array<{
      name: string;
      purpose: string;
      costTier: string;
    }>;
    diagramComponents: CloudArchitectureComponent[];
    estimatedMonthlyCloudCost: {
      mvp: string;
      growth: string;
      scale: string;
    };
  };
  revenueModel: {
    primaryModel: string;
    pricingTiers: Array<{
      tier: string;
      price: string;
      billing: string;
      features: string[];
      highlighted?: boolean;
    }>;
    projectedRunway: Array<{
      month: string;
      revenue: number;
      cost: number;
      users: number;
    }>;
    keyUnitEconomics: {
      cacEstimate: string;
      ltvEstimate: string;
      ltvCacRatio: string;
      grossMargin: string;
    };
  };
  risksAndMitigations: Array<{
    risk: string;
    severity: "High" | "Medium" | "Low";
    probability: "High" | "Medium" | "Low";
    mitigation: string;
  }>;
  goNextSteps: string[];
}

export interface StartupProject {
  id: string;
  createdAt: string;
  userId?: string;
  username?: string;
  founderProfile: FounderProfile;
  selectedIdea: StartupIdea;
  allIdeas: StartupIdea[];
  validation: MarketValidation;
  feasibility: FeasibilityReport;
  targetLocation?: MapLocation;
}

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  name?: string;
  role: "admin" | "user";
  createdAt?: string;
  updatedAt?: string;
  isNewUser?: boolean;
}

export interface AuthSession {
  user: User;
  token?: string;
  loggedInAt: string;
}

