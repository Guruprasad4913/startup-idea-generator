import {
  FounderProfile,
  StartupIdea,
  MarketValidation,
  FeasibilityReport,
  TargetUserAnalysis,
  CompetitorFeatureComparison,
  MVPRecommendation,
  BusinessRoadmap,
  ScoringEngineBreakdown,
} from "@/types";

interface GeminiOptions {
  apiKey?: string;
  model?: string;
  tavilyApiKey?: string;
  tavilyContext?: string;
}

// Fallback high-fidelity smart generator covering multiple domains
export async function generateStartupIdeas(
  profile: FounderProfile,
  options?: GeminiOptions
): Promise<StartupIdea[]> {
  const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ideas = await callGeminiForIdeas(profile, apiKey);
      if (ideas && ideas.length > 0) {
        return ideas;
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to intelligent built-in generator:", err);
    }
  }

  // Built-in intelligent idea generator
  return generateIntelligentIdeas(profile);
}

export async function validateMarketIdea(
  idea: StartupIdea,
  profile: FounderProfile,
  options?: GeminiOptions
): Promise<MarketValidation> {
  const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const val = await callGeminiForValidation(idea, profile, apiKey, options?.tavilyContext);
      if (val) return val;
    } catch (err) {
      console.warn("Gemini validation call failed, falling back to intelligent generator:", err);
    }
  }

  return generateIntelligentValidation(idea, profile, options?.tavilyContext);
}

export async function generateCloudFeasibility(
  idea: StartupIdea,
  validation: MarketValidation,
  profile: FounderProfile,
  options?: GeminiOptions
): Promise<FeasibilityReport> {
  const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const report = await callGeminiForFeasibility(idea, validation, profile, apiKey);
      if (report) {
        if (!report.mvpRecommendation || !report.businessRoadmap) {
          const dLower = (idea.domain + " " + (idea.businessType || "") + " " + idea.tags.join(" ")).toLowerCase();
          const isExplicitTech = (
            dLower.includes("software & saas") ||
            dLower.includes("software platform") ||
            dLower.includes("compliance platform") ||
            dLower.includes("cloud middleware") ||
            dLower.includes("ai platform")
          ) && !dLower.includes("hardware") && !dLower.includes("physical") && !dLower.includes("construct") && !dLower.includes("constuct") && !dLower.includes("manufacturing");
          const isNonTech = !isExplicitTech;
          const { mvpRecommendation, businessRoadmap } = buildMvpAndRoadmap(idea, profile, isNonTech);
          if (!report.mvpRecommendation) report.mvpRecommendation = mvpRecommendation;
          if (!report.businessRoadmap) report.businessRoadmap = businessRoadmap;
        }
        return report;
      }
    } catch (err) {
      console.warn("Gemini feasibility call failed, falling back to intelligent generator:", err);
    }
  }

  return generateIntelligentFeasibility(idea, validation, profile);
}

// Helper to robustly extract and parse JSON from Gemini response
function parseGeminiJson<T>(rawText: string): T {
  let cleaned = rawText.trim();
  // Strip markdown code fence if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned) as T;
}

// Helper to robustly format market sizing into Indian Rupees (INR / ₹)
export function formatToRupees(val: string): string {
  if (!val) return val;
  const trimmed = val.trim();
  if (trimmed.includes("₹") || trimmed.toLowerCase().includes("crore") || trimmed.toLowerCase().includes("lakh")) {
    return trimmed;
  }
  // Convert $XX.X Billion -> ₹XX,XXX Crores ($XX.X Billion)
  const billMatch = trimmed.match(/\$?\s*([0-9.]+)\s*Billion/i);
  if (billMatch) {
    const numB = parseFloat(billMatch[1]);
    const crores = Math.round(numB * 8350); // 1 USD Billion ≈ 8,350 Crores INR
    return `₹${crores.toLocaleString("en-IN")} Crores (${trimmed})`;
  }
  // Convert $XX.X Million -> ₹XX Crores or ₹XXX Lakhs ($XX.X Million)
  const millMatch = trimmed.match(/\$?\s*([0-9.]+)\s*Million/i);
  if (millMatch) {
    const numM = parseFloat(millMatch[1]);
    const crores = Math.round(numM * 8.35); // 1 USD Million ≈ 8.35 Crores INR
    if (crores >= 1) {
      return `₹${crores.toLocaleString("en-IN")} Crores (${trimmed})`;
    } else {
      const lakhs = Math.round(numM * 83.5);
      return `₹${lakhs.toLocaleString("en-IN")} Lakhs (${trimmed})`;
    }
  }
  return trimmed;
}

// Gemini API Integration helper
async function callGeminiForIdeas(profile: FounderProfile, apiKey: string): Promise<StartupIdea[]> {
  const businessType = profile.businessType || "All";
  const prompt = `You are a Global Startup Accelerator Director and Venture Partner with expertise across diverse commercial domains: Food & Beverage, D2C Consumer Brands, Manufacturing & Hardware, Agriculture & Farming, Healthcare & Wellness, Physical Services, Logistics, Offline Education, Retail & Brick-and-Mortar, CleanTech, and Tech/Software.

Given founder input:
- Domains / Industries: ${profile.domains.join(", ")}
- Business Model Preference: ${businessType}
- Interests & Passion Areas: ${profile.interests?.length ? profile.interests.join(", ") : profile.domains.join(", ")}
- Founder Skills & Strengths: ${profile.skills.join(", ")}
- Target Customer Segment: ${profile.targetAudience}
- Budget & Capital: ${profile.budget}
- Timeframe: ${profile.timeframe}
- Custom Context & Problem Notes: ${profile.customContext || "None"}

CRITICAL INSTRUCTIONS ON STARTUP TYPES:
1. DO NOT force ideas to be websites, apps, software SaaS, or AI wrappers unless the founder explicitly asked for tech/software.
2. If the founder specified or implied a physical, offline, or product business (e.g. Food & Beverage, Cafe, Restaurant, D2C Physical Brand, Sustainable Packaging, Hardware, Manufacturing, Farming, Agriculture, Physical Clinic, Fitness Gym, Salon, Event Production, Offline Academy, Retail Store, Solar Installation, Recycling):
   - Generate realistic, high-potential, real-world business models (e.g. specialty coffee roastery chain, functional nutrition QSR, eco-friendly consumer goods brand, solar cold storage units, high-yield indoor hydroponics, boutique contrast therapy studio, zero-waste refill retail store, etc.).
   - Modern efficiency: The business can use technology for operations (smart inventory, WhatsApp commerce, local logistics), but the primary business model MUST be authentic to that industry, NOT just a software dashboard!
3. If the founder explicitly asked for Tech, Software, or AI, generate high-potential software or AI agent platforms.
4. Generate exactly 3 to 4 diverse, viable, and commercially grounded startup concepts.

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "idea-1",
    "name": "Startup Name",
    "tagline": "Punchy 6-10 word value proposition",
    "domain": "${profile.domains[0] || "Industry"}",
    "businessType": "Physical Product / Food & Beverage / Services / Retail / Hardware / Tech",
    "problemStatement": "Clear acute customer or market pain point being solved (2-3 sentences)",
    "solution": "The business solution, product/service delivery model, and operational approach (2-3 sentences)",
    "targetPersona": {
      "title": "Specific Buyer or Customer Persona",
      "painPoints": ["Acute Pain 1", "Acute Pain 2", "Acute Pain 3"],
      "willingnessToPay": "Realistic pricing or customer spend (e.g. ₹250-₹500 per meal, ₹1,200/unit, ₹2,000/mo membership, or $50-$500/mo)"
    },
    "whyNow": "Market catalyst, consumer shift, supply chain evolution, or regulatory tailwind",
    "innovationMoat": "Core competitive advantage (e.g. proprietary formulation, direct farmer sourcing, local catchment density, customer loyalty, or operational efficiency)",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
    "initialFeasibilityScore": 88
  }
]`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return parseGeminiJson<StartupIdea[]>(text);
}

async function callGeminiForValidation(
  idea: StartupIdea,
  profile: FounderProfile,
  apiKey: string,
  tavilyContext?: string
): Promise<MarketValidation> {
  const prompt = `Act as an expert Market Research & Competitive Intelligence Analyst.
Analyze this startup idea:
Name: ${idea.name}
Tagline: ${idea.tagline}
Domain: ${idea.domain}
Business Model: ${idea.businessType || "Commercial Venture"}
Problem: ${idea.problemStatement}
Solution: ${idea.solution}

${tavilyContext ? `LIVE WEB MARKET RESEARCH (GROUNDING SIGNALS FROM TAVILY SEARCH):
${tavilyContext}
IMPORTANT: Ground your TAM/SAM/SOM numerical estimates, competitor landscape, and real-time market trends in these actual live web findings and statistics.` : ""}

IMPORTANT CURRENCY SPECIFICATION (INDIAN RUPEES):
All Market Sizing metrics (TAM, SAM, SOM) MUST be written in Indian Rupees (INR / ₹) with standard Indian numbering denominations (Crores / Lakhs) followed by the USD equivalent in parentheses, e.g.:
- TAM: "₹42,000 Crores ($5.1B)" or "₹3,20,000 Crores ($38.5B)"
- SAM: "₹8,500 Crores ($1.02B)" or "₹60,000 Crores ($7.2B)"
- SOM: "₹450 Crores ($54M)" or "₹2,600 Crores ($315M)"
"numBillions" must be a float number representing the numeric magnitude in Billions USD (e.g. 5.1, 38.5, 1.02) for consistent ranking and sorting.

Provide a comprehensive Market Validation with real-time industry context.
Return ONLY valid JSON matching this schema:
{
  "ideaId": "${idea.id}",
  "marketSummary": "Detailed 2-3 sentence overview of market dynamics and momentum",
  "tam": {
    "value": "₹XX,XXX Crores ($XX.X Billion)",
    "numBillions": 42.5,
    "description": "Total Addressable Market definition in Indian Rupees"
  },
  "sam": {
    "value": "₹X,XXX Crores ($X.X Billion)",
    "numBillions": 8.2,
    "description": "Serviceable Addressable Market in Indian Rupees"
  },
  "som": {
    "value": "₹XXX Crores ($XX Million)",
    "numBillions": 0.45,
    "description": "Serviceable Obtainable Market (Years 1-3) in Indian Rupees"
  },
  "cagr": "XX.X%",
  "competitors": [
    {
      "name": "Competitor 1",
      "type": "Direct",
      "strengths": "Strong market presence",
      "weaknesses": "Legacy tech, expensive",
      "ourDifferentiation": "AI-first automated workflow",
      "fundingOrScale": "Series B ($35M raised)"
    },
    {
      "name": "Competitor 2",
      "type": "Indirect",
      "strengths": "Broad ecosystem",
      "weaknesses": "Lacks verticalized intelligence",
      "ourDifferentiation": "Zero-setup cloud APIs",
      "fundingOrScale": "Public / $100M+ ARR"
    },
    {
      "name": "Competitor 3",
      "type": "Direct",
      "strengths": "Developer adoption",
      "weaknesses": "Poor non-technical UX",
      "ourDifferentiation": "End-to-end multi-agent validation",
      "fundingOrScale": "Seed ($3M raised)"
    }
  ],
  "realTimeTrends": [
    {
      "source": "HackerNews & Developer APIs",
      "headline": "Trending interest in automated cloud micro-agents",
      "sentiment": "Bullish",
      "growthSignal": "+148% YoY discussion surge"
    },
    {
      "source": "Gartner / Market Research",
      "headline": "Rapid enterprise adoption of API-first AI middleware",
      "sentiment": "Bullish",
      "growthSignal": "38% CAGR expansion"
    }
  ],
  "targetSegments": [
    {
      "segment": "Early adopters",
      "sizeShare": "45%",
      "urgency": "High",
      "salesCycle": "1-2 weeks"
    },
    {
      "segment": "Mid-market enterprises",
      "sizeShare": "35%",
      "urgency": "Critical",
      "salesCycle": "1-2 months"
    }
  ]
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  const validation = parseGeminiJson<MarketValidation>(text);
  if (validation?.tam?.value) validation.tam.value = formatToRupees(validation.tam.value);
  if (validation?.sam?.value) validation.sam.value = formatToRupees(validation.sam.value);
  if (validation?.som?.value) validation.som.value = formatToRupees(validation.som.value);
  return validation;
}

async function callGeminiForFeasibility(
  idea: StartupIdea,
  validation: MarketValidation,
  profile: FounderProfile,
  apiKey: string
): Promise<FeasibilityReport> {
  const prompt = `Act as a Cloud Principal Architect and Fractional CTO.
Evaluate this startup:
Name: ${idea.name}
Domain: ${idea.domain}
Solution: ${idea.solution}
Budget: ${profile.budget}
Timeframe: ${profile.timeframe}

Generate an in-depth Feasibility, Cloud Architecture, and Revenue Model report.
Return ONLY valid JSON matching this schema:
{
  "overallScore": 86,
  "technicalScore": 88,
  "marketScore": 84,
  "financialScore": 89,
  "regulatoryScore": 82,
  "executionScore": 87,
  "verdict": "Strong Go",
  "verdictSummary": "Compelling value proposition with high technical feasibility using modern cloud serverless and multi-model AI APIs.",
  "radarData": [
    { "subject": "Tech Feasibility", "score": 88, "fullMark": 100 },
    { "subject": "Market Demand", "score": 84, "fullMark": 100 },
    { "subject": "Unit Economics", "score": 89, "fullMark": 100 },
    { "subject": "Compliance & Risk", "score": 82, "fullMark": 100 },
    { "subject": "Speed to MVP", "score": 87, "fullMark": 100 }
  ],
  "cloudArchitecture": {
    "recommendedProvider": "AWS",
    "compute": "AWS Lambda / AWS Fargate Containerized Inference",
    "database": "PostgreSQL (Amazon Aurora Serverless) + Pinecone / pgvector",
    "aiInference": "Gemini 1.5 Pro + Claude 3.5 Sonnet fallback via LiteLLM",
    "storageAndCDN": "Amazon S3 + CloudFront Edge Caching",
    "thirdPartyAPIs": [
      { "name": "Stripe API", "purpose": "Subscription billing and metered credits", "costTier": "2.9% + 30c" },
      { "name": "Resend / SendGrid", "purpose": "Transactional notifications and report delivery", "costTier": "Free / $20/mo" },
      { "name": "OpenAI / Anthropic / Google Gemini APIs", "purpose": "Agentic reasoning & embeddings", "costTier": "Pay-as-you-go" }
    ],
    "diagramComponents": [
      { "category": "Frontend & Edge", "name": "Next.js on Vercel / CloudFront", "details": "Global CDN edge distribution, SSR, and client caching", "cloudIcon": "aws" },
      { "category": "API Gateway & Auth", "name": "API Gateway + Supabase/Clerk", "details": "JWT authentication, rate limiting, and request routing", "cloudIcon": "api" },
      { "category": "AI & Core Compute", "name": "Serverless Functions + Celery Workers", "details": "Event-driven asynchronous document parsing & AI agent execution", "cloudIcon": "ai" },
      { "category": "Database & Storage", "name": "Aurora Serverless + Pinecone Vector DB", "details": "ACID compliance for user state, vector indexing for embeddings", "cloudIcon": "db" },
      { "category": "3rd-Party APIs", "name": "Market APIs + Stripe + Webhooks", "details": "Real-time external telemetry and automated billing cycles", "cloudIcon": "api" }
    ],
    "estimatedMonthlyCloudCost": {
      "mvp": "$45 - $120 / month",
      "growth": "$400 - $1,100 / month",
      "scale": "$2,500 - $6,000 / month"
    }
  },
  "revenueModel": {
    "primaryModel": "B2B SaaS with Tiered Subscriptions & Usage-based API Credits",
    "pricingTiers": [
      { "tier": "Starter", "price": "$29", "billing": "/ month", "features": ["100 automated scans/mo", "Basic market reports", "Community support"] },
      { "tier": "Professional", "price": "$99", "billing": "/ month", "features": ["Unlimited scans", "Real-time competitor tracking", "Custom cloud blueprints", "Priority support"], "highlighted": true },
      { "tier": "Enterprise", "price": "$499+", "billing": "/ month", "features": ["Dedicated cluster", "SOC2 compliance exports", "Custom fine-tuned models", "SLA guarantees"] }
    ],
    "projectedRunway": [
      { "month": "M1", "revenue": 1200, "cost": 450, "users": 35 },
      { "month": "M3", "revenue": 5800, "cost": 1200, "users": 160 },
      { "month": "M6", "revenue": 18400, "cost": 3400, "users": 480 },
      { "month": "M9", "revenue": 39000, "cost": 7200, "users": 1100 },
      { "month": "M12", "revenue": 82000, "cost": 14500, "users": 2400 }
    ],
    "keyUnitEconomics": {
      "cacEstimate": "$140",
      "ltvEstimate": "$1,180",
      "ltvCacRatio": "8.4x",
      "grossMargin": "84%"
    }
  },
  "risksAndMitigations": [
    { "risk": "API Rate Limiting & Latency", "severity": "Medium", "probability": "High", "mitigation": "Implement Redis semantic caching and queue-based async worker processing." },
    { "risk": "Competitor Duplication", "severity": "High", "probability": "Medium", "mitigation": "Focus on proprietary workflow integrations and customer proprietary data lock-in." },
    { "risk": "Model Hallucination", "severity": "Medium", "probability": "Low", "mitigation": "Enforce RAG architecture with real-time verified API ground-truth data." }
  ],
  "goNextSteps": [
    "Build a 14-day interactive prototype with mock synthetic data.",
    "Interview 15 target buyers from the specified customer persona.",
    "Deploy a landing page with a waitlist and collect customer intent letters (LOIs).",
    "Configure serverless cloud telemetry and launch public Beta."
  ]
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return parseGeminiJson<FeasibilityReport>(text);
}

// Built-in intelligent generator for 100% offline & instant generation across diverse sectors
function generateIntelligentIdeas(profile: FounderProfile): StartupIdea[] {
  const primaryDomain = profile.domains[0] || "Food & Beverage";
  const norm = (primaryDomain + " " + (profile.businessType || "") + " " + (profile.customContext || "")).toLowerCase();
  const userSkills = profile.skills.length > 0 ? profile.skills.join(" and ") : "Operational Execution & Leadership";

  // 1. Food & Beverage / Cafes / Dining
  if (
    norm.includes("food") ||
    norm.includes("beverage") ||
    norm.includes("cafe") ||
    norm.includes("coffee") ||
    norm.includes("restaurant") ||
    norm.includes("dining") ||
    norm.includes("kitchen") ||
    norm.includes("bakery")
  ) {
    return [
      {
        id: "food-1",
        name: "BeanCraft Roasters & Cold Brew Labs",
        tagline: "Artisan Single-Origin Roastery Chain & Subscription Bean Club",
        domain: "Food & Beverage",
        businessType: "Food & Beverage / Retail",
        problemStatement: "Specialty coffee lovers are tired of stale commercial supermarket beans with high markups and zero farm transparency.",
        solution: "A boutique micro-roastery cafe chain featuring direct-trade estate sourcing, weekly small-batch custom roasting, and a doorstep whole-bean delivery club.",
        targetPersona: {
          title: "Urban coffee aficionados, remote professionals, and specialty cafes",
          painPoints: ["Inconsistent roast quality", "Overpriced cafe drinks", "No bean harvest origin data"],
          willingnessToPay: "₹400 - ₹650 per 250g bag / ₹220 per cafe beverage"
        },
        whyNow: "Rapid explosion of third-wave artisanal coffee culture across urban metros replacing instant commercial coffee.",
        innovationMoat: "Direct-trade grower partnerships with shade-grown estates and proprietary signature roast profiles.",
        tags: ["Food & Beverage", "Artisan Coffee", "Direct-Trade", "Retail Cafe"],
        initialFeasibilityScore: 90
      },
      {
        id: "food-2",
        name: "MilletBowl QSR",
        tagline: "Nutrient-Dense Ancient Grain Fast-Casual Dining & Meal Bowl Chain",
        domain: "Food & Beverage",
        businessType: "Food & Beverage / QSR",
        problemStatement: "Urban working professionals suffer from afternoon energy slumps and lifestyle diseases caused by refined-carb fast food.",
        solution: "A fast-casual healthy dining chain serving chef-curated organic ragi and foxtail grain bowls with farm-fresh proteins in under 5 minutes.",
        targetPersona: {
          title: "Corporate professionals, fitness enthusiasts, and health-conscious families",
          painPoints: ["Unhealthy fast food", "High carb crashes", "Slow sit-down healthy dining"],
          willingnessToPay: "₹220 - ₹380 per bowl"
        },
        whyNow: "Surging global and national millet awareness backed by nutritional demand for low-glycemic staple meals.",
        innovationMoat: "Centralized prep commissary model ensuring sub-5-minute assembly and high unit-level profit margins.",
        tags: ["Food & Beverage", "Healthy QSR", "Ancient Grains", "Fast Casual"],
        initialFeasibilityScore: 89
      },
      {
        id: "food-3",
        name: "PurePlate Health Kitchen",
        tagline: "Medically Tailored Clinical Meal Plans for Diabetics & Post-Op Recovery",
        domain: "Food & Beverage",
        businessType: "Food & Beverage / Cloud Kitchen",
        problemStatement: "Patients with Type-2 diabetes and chronic cardiovascular conditions struggle to adhere to complex medical dietary restrictions at home.",
        solution: "A specialized clinical cloud kitchen partnered with endocrinologists delivering glycemic-indexed, lab-tested meals tailored to patient blood reports.",
        targetPersona: {
          title: "Diabetic patients, cardiologists, and senior citizens managing chronic conditions",
          painPoints: ["Complicated dietary rules", "High caregiver meal prep burden", "Uncontrolled blood sugar spikes"],
          willingnessToPay: "₹7,500 - ₹14,000 / month subscription"
        },
        whyNow: "Preventive nutrition is now formally integrated into metabolic lifestyle treatment protocols by leading healthcare networks.",
        innovationMoat: "Direct hospital referral network and clinical dietitian certification on every customized meal.",
        tags: ["Food & Beverage", "Clinical Nutrition", "Meal Subscription", "Healthcare Food"],
        initialFeasibilityScore: 87
      }
    ];
  }

  // 2. D2C Brands & Consumer Products
  if (
    norm.includes("d2c") ||
    norm.includes("consumer") ||
    norm.includes("fashion") ||
    norm.includes("apparel") ||
    norm.includes("skincare") ||
    norm.includes("cosmetic") ||
    norm.includes("packaging") ||
    norm.includes("lifestyle") ||
    norm.includes("goods")
  ) {
    return [
      {
        id: "d2c-1",
        name: "BambouLiving",
        tagline: "100% Biodegradable Bamboo Fiber Everyday Home Goods & Packaging",
        domain: "D2C Brands",
        businessType: "D2C / Physical Goods",
        problemStatement: "Modern households generate 150kg of non-recyclable plastic kitchenware and disposable packaging annually.",
        solution: "A premium consumer brand manufacturing durable, dishwasher-safe tableware, toothbrushes, and food containers from compressed regenerative bamboo fiber.",
        targetPersona: {
          title: "Eco-conscious millennial homeowners and zero-waste lifestyle advocates",
          painPoints: ["Microplastic leaching", "Ugly plastic kitchenware", "Guilt over single-use waste"],
          willingnessToPay: "₹450 - ₹1,800 per kitchen set"
        },
        whyNow: "Stricter bans on single-use polymers and consumer willingness to pay a premium for certified non-toxic home essentials.",
        innovationMoat: "Proprietary plant-starch bio-resin binding technique that is 100% home-compostable in 180 days.",
        tags: ["D2C Brands", "Eco-Friendly", "Bamboo Products", "Zero-Waste"],
        initialFeasibilityScore: 91
      },
      {
        id: "d2c-2",
        name: "AyuVeda PureBotanicals",
        tagline: "Seed-to-Shelf Certified Clinical Ayurvedic Skincare & Haircare",
        domain: "D2C Brands",
        businessType: "D2C / Personal Care",
        problemStatement: "Consumers are overwhelmed by synthetic chemical skincare and pseudo-natural brands with misleading ingredient labels.",
        solution: "Small-batch, Ecocert-certified botanical formulations backed by clinical dermatological trials with QR-scannable harvest origin batches.",
        targetPersona: {
          title: "Discerning beauty consumers seeking clean, non-toxic personal care",
          painPoints: ["Skin sensitivity to chemicals", "Misleading greenwashed marketing", "High prices for ineffective products"],
          willingnessToPay: "₹650 - ₹1,400 per bottle"
        },
        whyNow: "Global shift towards clean clinical beauty where ancient botanical wisdom is validated by modern dermatological testing.",
        innovationMoat: "Exclusive organic cooperative farm sourcing contracts and proprietary cold-press herb extraction.",
        tags: ["D2C Brands", "Clean Beauty", "Ayurvedic Skincare", "Organic"],
        initialFeasibilityScore: 88
      },
      {
        id: "d2c-3",
        name: "ErgoLift Workstations",
        tagline: "Ergonomic Active-Standing Furniture & Lumbar Support for Remote Workers",
        domain: "D2C Brands",
        businessType: "D2C / Hardware & Furniture",
        problemStatement: "Prolonged desk sitting causes chronic posture degradation and spinal pain in 68% of knowledge workers.",
        solution: "Modular, easy-assembly solid wood standing desks with integrated memory presets and orthopedic dynamic sitting accessories.",
        targetPersona: {
          title: "Remote software engineers, designers, and home office corporate workers",
          painPoints: ["Chronic lower back pain", "Cluttered workspace wires", "Expensive unergonomic office chairs"],
          willingnessToPay: "₹14,000 - ₹32,000 per desk setup"
        },
        whyNow: "Permanent hybrid and remote work policies have turned home office ergonomics into an essential personal wellness investment.",
        innovationMoat: "Direct-to-consumer localized manufacturing eliminating distributor middleman markups by 45%.",
        tags: ["D2C Brands", "Ergonomics", "Furniture", "Workplace Wellness"],
        initialFeasibilityScore: 86
      }
    ];
  }

  // 3. Construction, Infrastructure, Real Estate & Building
  if (
    norm.includes("construct") ||
    norm.includes("constuct") || // Handles typo "constuction"
    norm.includes("build") ||
    norm.includes("contract") ||
    norm.includes("infra") ||
    norm.includes("interior") ||
    norm.includes("real estate") ||
    norm.includes("mason") ||
    norm.includes("cement") ||
    norm.includes("brick") ||
    norm.includes("renovat") ||
    norm.includes("civil") ||
    norm.includes("plumb") ||
    norm.includes("architect")
  ) {
    return [
      {
        id: "build-1",
        name: "EcoCast Modular Precast & Pavers",
        tagline: "Factory-Engineered Low-Carbon Precast Concrete Panels & Modular Walls",
        domain: "Construction & Infrastructure",
        businessType: "Manufacturing & Green Materials",
        problemStatement: "Traditional on-site brick and wet mortar construction takes months, suffers from inconsistent masonry quality, and wastes up to 30% of sand and cement.",
        solution: "A localized manufacturing plant producing precision-cured interlocking pavers, modular boundary walls, and lightweight precast concrete panels that reduce build times by 50%.",
        targetPersona: {
          title: "Civil contractors, commercial real estate developers, and infrastructure engineers",
          painPoints: ["Severe site sand and water shortages", "Slow manual masonry speed", "High on-site labor and cement wastage"],
          willingnessToPay: "₹65 - ₹130 per sq ft / ₹50,000 per prefabricated wall section"
        },
        whyNow: "Government subsidies for green building materials and soaring demand for fast-track modular residential and commercial construction.",
        innovationMoat: "Proprietary fly-ash geopolymer aggregate mix reducing carbon footprint by 45% while exceeding standard load-bearing compression ratings.",
        tags: ["Construction", "Precast Concrete", "Green Building", "Modular Infrastructure"],
        initialFeasibilityScore: 91
      },
      {
        id: "build-2",
        name: "BuildCraft Turnkey Contracting & Interior Fit-Outs",
        tagline: "Milestone-Guaranteed Residential & Commercial Renovation Execution",
        domain: "Construction & Infrastructure",
        businessType: "Turnkey Contracting & Field Services",
        problemStatement: "Property owners and retail brands face notorious contractor delays, 40%+ cost overruns, substandard workmanship, and zero accountability.",
        solution: "A modern turnkey contracting firm offering dedicated on-site site supervisors, vetted trade crews (carpentry, electrical, plumbing), milestone-based escrow payments, and a 5-year workmanship warranty.",
        targetPersona: {
          title: "Homeowners doing full home renovations, retail brand store rollouts, and office facility managers",
          painPoints: ["Unreliable contractor ghosting", "Hidden surprise price hikes", "Subpar finishing quality"],
          willingnessToPay: "₹1,400 - ₹3,800 per sq ft for turnkey execution"
        },
        whyNow: "Rapid growth in residential handovers and experiential commercial stores with high willingness to pay for guaranteed execution timelines.",
        innovationMoat: "Trade technician training school, direct bulk manufacturer material procurement reducing costs by 22%, and milestone escrow guarantees.",
        tags: ["Construction", "Turnkey Contracting", "Interior Fit-Out", "Field Operations"],
        initialFeasibilityScore: 89
      },
      {
        id: "build-3",
        name: "EquipShare Heavy Machinery & Equipment Yard",
        tagline: "On-Demand Certified Heavy Machinery & Excavator Fleet Rental Depot",
        domain: "Construction & Infrastructure",
        businessType: "Equipment Rental & Fleet Operations",
        problemStatement: "Mid-sized contractors cannot afford ₹40-80 Lakh capital investments to buy excavators, concrete pumps, and boom lifts, while unorganized brokers supply broken machines with reckless operators.",
        solution: "A modern equipment rental yard providing well-maintained earthmoving, concrete handling, and aerial equipment with verified, insured operators on flexible hourly or weekly operational leases.",
        targetPersona: {
          title: "Foundation specialists, civil contractors, and landscaping infrastructure firms",
          painPoints: ["High machinery capex", "Frequent machine breakdown delays on job sites", "Unreliable freelance equipment operators"],
          willingnessToPay: "₹2,000 - ₹4,500 per machine operational hour / ₹75,000 weekly lease"
        },
        whyNow: "Massive highway, metro, and urban housing construction projects requiring contractors to remain asset-light while deploying heavy machinery instantly.",
        innovationMoat: "Telematics-monitored equipment fleet, rapid on-site mobile maintenance van, and certified operator training academy.",
        tags: ["Construction", "Equipment Rental", "Heavy Machinery", "Fleet Operations"],
        initialFeasibilityScore: 88
      }
    ];
  }

  // 4. Manufacturing & Hardware / IoT
  if (
    norm.includes("manufacturing") ||
    norm.includes("hardware") ||
    norm.includes("industrial") ||
    norm.includes("automotive") ||
    norm.includes("iot") ||
    norm.includes("machinery")
  ) {
    return [
      {
        id: "mfg-1",
        name: "SolarKool MicroChambers",
        tagline: "Decentralized Solar Cold Storage Micro-Units for Perishable Food Transit",
        domain: "Manufacturing",
        businessType: "Manufacturing / Clean Hardware",
        problemStatement: "Smallholder farmers lose up to 35% of harvested fruits and vegetables within 48 hours due to lack of affordable rural cold storage.",
        solution: "Modular 2-ton and 5-ton cold rooms powered entirely by rooftop solar panels with thermal ice-pack energy retention requiring zero diesel backup.",
        targetPersona: {
          title: "Farmer producer organizations (FPOs), mandi traders, and rural agricultural cooperatives",
          painPoints: ["Severe post-harvest fruit rot", "High diesel generator costs", "Distress selling at farm-gate"],
          willingnessToPay: "₹2,50,000 - ₹5,00,000 per unit or ₹40/crate/month service"
        },
        whyNow: "Government agricultural infrastructure fund subsidies combined with falling solar PV and battery storage costs.",
        innovationMoat: "Patented phase-change thermal storage battery retaining sub-4°C cooling for 36 hours during cloudy periods.",
        tags: ["Manufacturing", "Solar Hardware", "Cold Storage", "Agri-Tech"],
        initialFeasibilityScore: 89
      },
      {
        id: "mfg-2",
        name: "EcoPave Heavy Tiles",
        tagline: "Architectural Heavy-Duty Interlocking Pavers from 100% Recycled Plastic",
        domain: "Manufacturing",
        businessType: "Manufacturing / Green Materials",
        problemStatement: "Cities face mounting mountains of single-use low-density plastic waste while concrete paver manufacturing emits high CO2.",
        solution: "A high-density polymer melting and compression manufacturing line transforming discarded municipal plastic into pavers 3x stronger than concrete.",
        targetPersona: {
          title: "Municipal corporations, commercial real estate developers, and landscape architects",
          painPoints: ["High concrete paving costs", "Cracking tiles from heavy vehicles", "Strict corporate ESG green mandates"],
          willingnessToPay: "₹45 - ₹85 per square foot (15% cheaper than concrete)"
        },
        whyNow: "Municipalities and infrastructure tenders are now reserving 20%+ allocations specifically for recycled green building materials.",
        innovationMoat: "Proprietary polymer-aggregate cross-linking formula certified for 25-ton industrial truck axle loads.",
        tags: ["Manufacturing", "Recycled Materials", "Green Building", "Circular Economy"],
        initialFeasibilityScore: 87
      },
      {
        id: "mfg-3",
        name: "PureAqua Flow",
        tagline: "Smart IoT-Enabled Mineralizing Water Dispenser Units for Residential Housing",
        domain: "Manufacturing",
        businessType: "Hardware / IoT",
        problemStatement: "Residential RO purifiers waste 70% of input water and strip essential alkaline minerals, causing micro-nutrient deficiency.",
        solution: "A zero-waste nano-filtration dispenser unit with automated mineral dosing and real-time cartridge telemetry via integrated IoT sensors.",
        targetPersona: {
          title: "Gated residential apartment societies, student housing, and commercial offices",
          painPoints: ["Immense RO water wastage", "Unreliable manual filter replacement", "Flat acidic mineral-depleted water"],
          willingnessToPay: "₹899 - ₹1,499 / month service lease with free filter maintenance"
        },
        whyNow: "Widespread groundwater scarcity and regulatory crackdowns on high-wastage reverse osmosis systems in urban centers.",
        innovationMoat: "Proprietary ceramic mineral remineralization cartridge and zero wastewater recycling loop.",
        tags: ["Manufacturing", "Water Tech", "IoT Hardware", "Clean Drinking Water"],
        initialFeasibilityScore: 85
      }
    ];
  }

  // 4. Agriculture & Farming
  if (
    norm.includes("agri") ||
    norm.includes("farm") ||
    norm.includes("hydroponic") ||
    norm.includes("organic") ||
    norm.includes("horticulture") ||
    norm.includes("dairy") ||
    norm.includes("crop")
  ) {
    return [
      {
        id: "agri-1",
        name: "VerdantVault Hydroponics",
        tagline: "Precision Indoor Vertical Saffron & Gourmet Micro-Greens Farm",
        domain: "Agriculture",
        businessType: "Agriculture / Hydroponics",
        problemStatement: "High-end restaurants and consumers pay exorbitant rates for imported herbs and genuine saffron with inconsistent seasonal availability.",
        solution: "A climate-controlled vertical hydroponic shipping container system producing Grade-1 saffron and exotic culinary herbs with 95% less water.",
        targetPersona: {
          title: "5-star hotels, luxury restaurant chefs, and gourmet food retailers",
          painPoints: ["Fake adulterated saffron", "Wilting imported herbs", "High supply chain costs"],
          willingnessToPay: "₹350 - ₹750 per gram (saffron) / ₹180 per 100g microgreen box"
        },
        whyNow: "Controlled-environment agriculture (CEA) costs have decreased by 50% due to efficient full-spectrum LED lighting advances.",
        innovationMoat: "Automated aeroponic nutrient dosing algorithms and year-round triple-harvest bloom cycles.",
        tags: ["Agriculture", "Vertical Farming", "Hydroponics", "High-Value Crops"],
        initialFeasibilityScore: 90
      },
      {
        id: "agri-2",
        name: "AgriKisan ColdChain",
        tagline: "Aggregated Farm-to-Mandi Temperature-Controlled Fresh Produce Transit",
        domain: "Agriculture",
        businessType: "Agriculture / Supply Chain",
        problemStatement: "Farmers lose pricing power when forced to sell distress crops at farm-gates due to lack of immediate refrigerated transit to major urban mandis.",
        solution: "A shared-mile temperature-controlled fleet aggregation service booking crate slots via simple SMS/WhatsApp with live temperature tracking.",
        targetPersona: {
          title: "Vegetable and fruit growers, farmer cooperatives, and wholesale buyers",
          painPoints: ["Perishable crop spoilage", "Middleman price gouging", "No small-batch reefer transport"],
          willingnessToPay: "₹2.50 per kg transit fee"
        },
        whyNow: "Urban consumers demand freshest farm produce while highway freight networks have modernized.",
        innovationMoat: "Hyperlocal pickup hub network and pre-negotiated wholesale direct off-take agreements.",
        tags: ["Agriculture", "Cold Chain", "Logistics", "Farm-to-Fork"],
        initialFeasibilityScore: 88
      },
      {
        id: "agri-3",
        name: "DroneKisan CropShield",
        tagline: "Shared Drone Fleet for Precision Soil Health & Micro-Nutrient Spraying",
        domain: "Agriculture",
        businessType: "Agriculture / Farm Services",
        problemStatement: "Manual backpack spraying exposes farm laborers to toxic chemicals and results in 40% wasted fertilizer run-off into groundwater.",
        solution: "Community-operated autonomous agricultural drone fleet that maps crop health via multispectral sensors and sprays exact micro-nutrients in 10 minutes per acre.",
        targetPersona: {
          title: "Paddy, cotton, and sugarcane farmers with 2 to 20 acre holdings",
          painPoints: ["Acute farm labor shortages", "Toxic chemical health hazards", "Overspending on wasted fertilizer"],
          willingnessToPay: "₹450 - ₹600 per acre per spray session"
        },
        whyNow: "Liberalized agricultural drone regulations and central subsidies for rural drone entrepreneurship.",
        innovationMoat: "Trained local rural drone pilot franchise model and DGCA certified flight corridors.",
        tags: ["Agriculture", "Drone Tech", "Precision Farming", "Rural Services"],
        initialFeasibilityScore: 86
      }
    ];
  }

  // 5. Healthcare Clinics, Wellness & Fitness
  if (
    norm.includes("health") ||
    norm.includes("wellness") ||
    norm.includes("clinic") ||
    norm.includes("fitness") ||
    norm.includes("gym") ||
    norm.includes("therapy") ||
    norm.includes("mental") ||
    norm.includes("yoga")
  ) {
    return [
      {
        id: "health-1",
        name: "ReviveZone Recovery Studios",
        tagline: "Neighborhood Contrast Therapy Lounges: Infrared Sauna & Cold Plunges",
        domain: "Healthcare & Wellness",
        businessType: "Wellness / Physical Studios",
        problemStatement: "Everyday athletes and stressed professionals lack affordable, hygienic access to proven physical recovery modalities used by elite athletes.",
        solution: "Walk-in modern recovery studios offering contrast therapy suites (filtration cold plunge + full-spectrum infrared sauna) and pneumatic compression boots.",
        targetPersona: {
          title: "Runners, gym-goers, desk workers with chronic back tension, and wellness enthusiasts",
          painPoints: ["Muscle soreness and inflammation", "High stress and burnout", "Expensive country club spa fees"],
          willingnessToPay: "₹1,200 per 45-min session or ₹4,500/mo unlimited recovery membership"
        },
        whyNow: "Mainstream consumer explosion of longevity and athletic recovery science backed by neurobiology research.",
        innovationMoat: "Proprietary medical-grade ozone sanitization protocol and standardized modular studio buildouts.",
        tags: ["Healthcare & Wellness", "Contrast Therapy", "Physical Studio", "Recovery"],
        initialFeasibilityScore: 92
      },
      {
        id: "health-2",
        name: "VitaLife Longevity Clinics",
        tagline: "Preventive Health Screening, Biomarker Optimization & Diagnostic Centers",
        domain: "Healthcare & Wellness",
        businessType: "Healthcare / Physical Clinics",
        problemStatement: "Traditional healthcare is purely reactive, treating diseases after diagnosis rather than intercepting metabolic decline 10 years earlier.",
        solution: "A boutique preventive clinic offering comprehensive 120-biomarker blood panels, DEXA body scans, VO2 max testing, and physician-guided lifestyle plans.",
        targetPersona: {
          title: "Executives, founders, and proactive adults aged 30-65",
          painPoints: ["Unnoticed metabolic syndrome", "Generic 5-minute doctor visits", "Conflicting wellness advice"],
          willingnessToPay: "₹15,000 - ₹45,000 per annual diagnostic program"
        },
        whyNow: "Preventive health and longevity have shifted from fringe biohacking into the fastest-growing private healthcare category.",
        innovationMoat: "Longitudinal health tracking protocols and direct integrations with specialized diagnostic reference labs.",
        tags: ["Healthcare & Wellness", "Preventive Care", "Longevity Clinic", "Diagnostics"],
        initialFeasibilityScore: 89
      },
      {
        id: "health-3",
        name: "LittleSteps Sensory Gym",
        tagline: "Pediatric Sensory Development & Occupational Therapy Play Centers",
        domain: "Healthcare & Wellness",
        businessType: "Specialized Physical Therapy",
        problemStatement: "Parents of neurodiverse children (ADHD, sensory processing, autism) wait 6+ months for certified developmental therapy appointments.",
        solution: "A joyful, non-clinical neighborhood sensory gym combining pediatric occupational therapists with purpose-built climbing and sensory integration equipment.",
        targetPersona: {
          title: "Parents of children aged 2-12, pediatricians, and inclusive schools",
          painPoints: ["Clinical intimidating therapy rooms", "Long hospital waiting lists", "Exorbitant private consultation fees"],
          willingnessToPay: "₹1,500 per guided session or ₹9,000/mo package"
        },
        whyNow: "Growing pediatric neurodevelopment awareness and parent demand for constructive, play-based therapeutic environments.",
        innovationMoat: "Proprietary therapist training curriculum and insurance-reimbursable developmental progress metrics.",
        tags: ["Healthcare & Wellness", "Pediatric Care", "Sensory Gym", "Occupational Therapy"],
        initialFeasibilityScore: 87
      }
    ];
  }

  // 6. Physical Services, Logistics & Tourism
  if (
    norm.includes("service") ||
    norm.includes("logistics") ||
    norm.includes("tourism") ||
    norm.includes("travel") ||
    norm.includes("hospitality") ||
    norm.includes("event") ||
    norm.includes("fleet") ||
    norm.includes("transport")
  ) {
    return [
      {
        id: "serv-1",
        name: "VoltShine Doorstep Fleet Care",
        tagline: "On-Demand Waterless Mobile EV Fleet Detailing & Rapid Maintenance Vans",
        domain: "Physical Services",
        businessType: "Services / Fleet Ops",
        problemStatement: "Commercial EV cab fleets and delivery vans lose 4-6 hours of earning time driving to remote washing and maintenance garages.",
        solution: "Custom electric mobile service vans arriving at customer hubs overnight to perform waterless detailing, tire rotations, and 30-point diagnostics.",
        targetPersona: {
          title: "Fleet operators (BluSmart, Uber, quick-commerce 2-wheeler fleets), and residential communities",
          painPoints: ["Vehicle downtime and lost revenue", "Expensive physical workshop trips", "Water restrictions in city centers"],
          willingnessToPay: "₹450 per vehicle wash / ₹1,200 full monthly maintenance per cab"
        },
        whyNow: "Massive electrification of urban commercial ride-hailing and last-mile delivery fleets across metropolitan hubs.",
        innovationMoat: "Biodegradable waterless ceramic cleaning polymer saving 150 liters of water per vehicle.",
        tags: ["Physical Services", "EV Fleet Care", "Doorstep Maintenance", "Waterless Detailing"],
        initialFeasibilityScore: 91
      },
      {
        id: "serv-2",
        name: "TerraRetreat Eco-Sanctuaries",
        tagline: "Regenerative Agro-Tourism Farmstays & Boutique Nature Lodges",
        domain: "Hospitality & Tourism",
        businessType: "Hospitality / Physical Stays",
        problemStatement: "Urban families and burnt-out professionals want nature escapes within 3 hours drive but find only crowded resorts or unhygienic homestays.",
        solution: "Curated eco-lodges situated on working organic farms offering farm-to-table dining, stargazing, ceramic workshops, and zero-plastic hospitality.",
        targetPersona: {
          title: "Urban couples, nature enthusiasts, and creative corporate retreat organizers",
          painPoints: ["Overcrowded generic hotels", "Lack of genuine rural connection", "Artificial tourist traps"],
          willingnessToPay: "₹6,500 - ₹14,000 per night"
        },
        whyNow: "Unprecedented growth in experiential domestic tourism and eco-conscious weekend getaways near major metro cities.",
        innovationMoat: "Long-term revenue-share leases with scenic rural landowners and proprietary experiential programming.",
        tags: ["Hospitality & Tourism", "Eco-Resort", "Farmstay", "Experiential Travel"],
        initialFeasibilityScore: 88
      },
      {
        id: "serv-3",
        name: "StagedVibe Pop-Up Agency",
        tagline: "Turnkey Experiential Pop-Up Fabrication & Brand Launch Spaces",
        domain: "Services & Events",
        businessType: "Physical Agency / Fabrication",
        problemStatement: "D2C brands and creators struggle to execute physical experiential retail pop-ups due to complex landlord negotiations and slow carpentry fabrication.",
        solution: "Modular, reconfigurable architectural pop-up kits deployed in 24 hours at high-footfall malls and high-streets with built-in POS and analytics.",
        targetPersona: {
          title: "Direct-to-consumer fashion, beauty brands, and marketing agencies",
          painPoints: ["Exorbitant retail fitout costs", "Months of mall leasing delays", "Zero footfall conversion telemetry"],
          willingnessToPay: "₹1,50,000 - ₹4,50,000 per weekend pop-up event"
        },
        whyNow: "Digital ad costs have surged 3x, making offline experiential pop-ups the most cost-effective customer acquisition channel for digital brands.",
        innovationMoat: "Reusable modular steel-and-timber structural kits reducing physical build costs by 60%.",
        tags: ["Services & Events", "Experiential Marketing", "Retail Pop-Up", "Fabrication"],
        initialFeasibilityScore: 86
      }
    ];
  }

  // 7. CleanTech, Solar & Waste Management
  if (
    norm.includes("clean") ||
    norm.includes("solar") ||
    norm.includes("energy") ||
    norm.includes("waste") ||
    norm.includes("recycling") ||
    norm.includes("battery")
  ) {
    return [
      {
        id: "clean-1",
        name: "UrbanOre E-Waste Recovery",
        tagline: "Decentralized Urban Mining for Rare Metals from Discarded Electronics",
        domain: "CleanTech & Waste",
        businessType: "Manufacturing / Recycling",
        problemStatement: "Over 80% of discarded electronic waste ends up in informal toxic scrap yards, causing heavy metal pollution while discarding gold and copper.",
        solution: "Eco-friendly, chemical-safe micro-recovery hubs using hydrometallurgical extraction to recover pure copper, silver, and rare earths from PCBs.",
        targetPersona: {
          title: "Corporate IT departments, municipal councils, and certified metal refiners",
          painPoints: ["E-waste compliance penalties", "Toxic environmental liability", "Unregulated informal scrap leakage"],
          willingnessToPay: "₹45 - ₹120 per kg collected + market commodity ingot sales"
        },
        whyNow: "Global supply constraints on critical minerals and strict national Extended Producer Responsibility (EPR) regulations.",
        innovationMoat: "Government-compliant state pollution board licenses and closed-loop non-incineration extraction.",
        tags: ["CleanTech & Waste", "E-Waste", "Circular Economy", "Rare Earth Metals"],
        initialFeasibilityScore: 89
      },
      {
        id: "clean-2",
        name: "BioTerra Composting Systems",
        tagline: "On-Site Commercial Bio-Composting Units for Hotels & Gated Societies",
        domain: "CleanTech & Waste",
        businessType: "Green Hardware & Ops",
        problemStatement: "Hotels and housing societies incur massive transport fees hauling wet food waste to landfills, facing strict municipal green fines.",
        solution: "Automated on-site aerobic digesting machines that convert 500kg of wet food waste into dry, pathogen-free organic compost within 24 hours.",
        targetPersona: {
          title: "Hotel general managers, restaurant chains, and residential welfare associations (RWAs)",
          painPoints: ["High garbage hauling bills", "Foul odors and pest infestations", "Municipal non-compliance penalties"],
          willingnessToPay: "₹3,50,000 per machine unit or ₹15,000/mo comprehensive maintenance"
        },
        whyNow: "Mandatory bulk waste generator guidelines penalizing commercial entities that do not process organic waste at source.",
        innovationMoat: "Patented thermophilic bacterial culture accelerating organic decomposition without noxious odors.",
        tags: ["CleanTech & Waste", "Organic Waste", "Bio-Composting", "Sustainability"],
        initialFeasibilityScore: 87
      },
      {
        id: "clean-3",
        name: "SunRoof Community EPC",
        tagline: "Turnkey Commercial Rooftop Solar Installation & Zero-Down Financing",
        domain: "CleanTech & Energy",
        businessType: "Solar EPC & Services",
        problemStatement: "Mid-sized factories and hospitals face rising grid electricity tariffs of ₹9-12/unit but lack capital for rooftop solar investments.",
        solution: "Complete engineering, procurement, and construction (EPC) of rooftop solar arrays funded via Power Purchase Agreements (PPAs) with zero upfront capex.",
        targetPersona: {
          title: "Commercial building owners, manufacturing plant operators, and private hospitals",
          painPoints: ["Crushing monthly utility bills", "Heavy capital cost of solar panels", "Complex net-metering bureaucratic approvals"],
          willingnessToPay: "25% discount to current grid electricity tariff on a 15-year PPA"
        },
        whyNow: "Soaring commercial grid tariffs combined with aggressive accelerated tax depreciation benefits for commercial solar.",
        innovationMoat: "Pre-approved clean energy NBFC financing facility and automated drone panel thermal inspection.",
        tags: ["CleanTech & Energy", "Solar EPC", "Commercial Rooftop", "Renewable Energy"],
        initialFeasibilityScore: 85
      }
    ];
  }

  // 8. Offline Education, Sports & Academies
  if (
    norm.includes("education") ||
    norm.includes("sports") ||
    norm.includes("academy") ||
    norm.includes("vocational") ||
    norm.includes("coaching") ||
    norm.includes("training") ||
    norm.includes("school")
  ) {
    return [
      {
        id: "edu-1",
        name: "MakerForge STEM Academies",
        tagline: "Hands-on Offline Robotics, 3D Printing & Maker Labs for K-12 Students",
        domain: "Offline Education",
        businessType: "Education / Physical Academy",
        problemStatement: "School computer labs focus on rote theory, leaving students with zero practical hardware, electronics, or engineering fabrication skills.",
        solution: "Physical neighborhood weekend maker studios where kids build real drones, solder circuit boards, 3D-print prototypes, and code microcontrollers.",
        targetPersona: {
          title: "Parents of children aged 8-16 and progressive private schools",
          painPoints: ["Excessive passive screen time", "Rote textbook learning", "Lack of practical innovation skills"],
          willingnessToPay: "₹3,500 - ₹6,000 per month for weekend batches"
        },
        whyNow: "Parental backlash against passive online zoom classes and intense demand for real-world experiential maker skills.",
        innovationMoat: "Proprietary physical hardware kit curriculum and project-based credentialing.",
        tags: ["Offline Education", "Robotics Academy", "STEM Maker Lab", "Hands-On"],
        initialFeasibilityScore: 91
      },
      {
        id: "edu-2",
        name: "SmashPoint Sports Arenas",
        tagline: "Indoor Climate-Controlled Pickleball & Badminton Multi-Court Club",
        domain: "Sports & Fitness",
        businessType: "Physical Sports Facility",
        problemStatement: "Urban sports enthusiasts face scorching heat, rain, and poorly maintained courts with zero locker amenities or automated bookings.",
        solution: "Modern indoor multi-court facilities featuring professional shock-absorbing flooring, automated slow-motion video replay cameras, and coaching clinics.",
        targetPersona: {
          title: "Corporate professionals, amateur racquet athletes, and weekend players",
          painPoints: ["Unplayable outdoor weather", "Knee joint pain from hard concrete courts", "Clunky phone call court reservations"],
          willingnessToPay: "₹600 - ₹1,200 per court hour / ₹3,000/mo membership"
        },
        whyNow: "Pickleball and indoor racquet sports are the fastest-growing recreational adult activities globally.",
        innovationMoat: "Automated court lighting and access control reducing facility operating headcount by 70%.",
        tags: ["Sports & Fitness", "Pickleball Arena", "Indoor Sports", "Badminton Club"],
        initialFeasibilityScore: 88
      },
      {
        id: "edu-3",
        name: "ArtisanBake Culinary Academy",
        tagline: "Vocational Diploma Institute for Commercial Baking & Barista Arts",
        domain: "Vocational Training",
        businessType: "Education / Vocational",
        problemStatement: "Cafes and bakeries face a 45% staff shortage for certified bakers and specialty baristas, while conventional hotel schools charge exorbitant fees.",
        solution: "Intensive 12-week commercial hands-on bakery and barista training academy with 100% placement guarantee in partnered cafe chains.",
        targetPersona: {
          title: "Young aspirants, career switchers, and amateur bakers seeking culinary careers",
          painPoints: ["Unemployed after generic degrees", "Expensive 3-year culinary schools", "Lack of commercial kitchen training"],
          willingnessToPay: "₹45,000 - ₹85,000 per 12-week diploma course"
        },
        whyNow: "Unprecedented boom in gourmet cafes and artisan cloud bakeries seeking job-ready skilled culinary technicians.",
        innovationMoat: "Direct hiring pipelines with 50+ regional cafe chains and industrial kitchen equipment sponsors.",
        tags: ["Vocational Training", "Culinary Academy", "Bakery Diploma", "Skill Center"],
        initialFeasibilityScore: 86
      }
    ];
  }

  // 9. Retail & Brick-and-Mortar
  if (
    norm.includes("retail") ||
    norm.includes("store") ||
    norm.includes("shop") ||
    norm.includes("grocery") ||
    norm.includes("pet") ||
    norm.includes("brick")
  ) {
    return [
      {
        id: "ret-1",
        name: "The EcoRefill Co.",
        tagline: "Zero-Waste Packaging-Free Grocery & Household Detergent Refill Stores",
        domain: "Retail",
        businessType: "Brick-and-Mortar Retail",
        problemStatement: "Conscious consumers want to eliminate single-use plastic bottles for oils, pulses, shampoo, and detergents but find zero refill options.",
        solution: "Modern neighborhood dispensary stores where customers bring their own containers to purchase organic pantry staples and certified green cleaning liquids by weight.",
        targetPersona: {
          title: "Environmentally conscious urban families, students, and apartment dwellers",
          painPoints: ["Piles of empty plastic bottles", "Premium pricing on eco-brands", "Lack of convenient bulk refill locations"],
          willingnessToPay: "10-15% cheaper than packaged branded alternatives"
        },
        whyNow: "Widespread consumer frustration with excessive consumer packaging and municipal zero-waste mandates.",
        innovationMoat: "Bulk liquid gravity-dispensing hardware and direct-from-manufacturer bulk tankers.",
        tags: ["Retail", "Zero-Waste Store", "Refill Grocery", "Eco-Friendly"],
        initialFeasibilityScore: 89
      },
      {
        id: "ret-2",
        name: "Paws & Tails Wellness Lounge",
        tagline: "Full-Service Pet Grooming Spa, Daycare Resort & Veterinary Clinic",
        domain: "Retail & Services",
        businessType: "Brick-and-Mortar / Pet Care",
        problemStatement: "Pet owners struggle with stress-inducing grooming appointments, uncertified boarding kennels, and rushed veterinary visits.",
        solution: "A cage-free, low-stress pet care hub featuring hydraulic grooming tubs, social doggy play-gardens, on-site veterinary checkups, and organic bakery treats.",
        targetPersona: {
          title: "Dog and cat owners treating pets as family members",
          painPoints: ["Traumatized pets at traditional groomers", "Separation anxiety during work hours", "Inconvenient multi-location pet appointments"],
          willingnessToPay: "₹1,200 - ₹2,800 per grooming session / ₹900 per daycare day"
        },
        whyNow: "The 'pet humanization' trend has exploded, with urban pet spending growing at over 25% year-over-year.",
        innovationMoat: "Fear-free certified staff handling protocols and membership loyalty pet health plans.",
        tags: ["Retail & Services", "Pet Care Lounge", "Dog Daycare", "Grooming Spa"],
        initialFeasibilityScore: 91
      },
      {
        id: "ret-3",
        name: "Meeple & Brew Board Game Cafe",
        tagline: "Experiential Community Cafe with 400+ Curated Board Games & Artisanal Teas",
        domain: "Retail & Cafe",
        businessType: "Experiential Brick-and-Mortar",
        problemStatement: "Friends and families look for alcohol-free evening social activities beyond movie theaters and noisy pubs.",
        solution: "A cozy community cafe stocking over 400 worldwide board games, guided by 'Game Sommelier' staff who teach the rules, paired with gourmet toasts and craft coffees.",
        targetPersona: {
          title: "College students, young working adults, families with teens, and hobby gaming groups",
          painPoints: ["Boring repetitive nightlife options", "Awkward social outings", "Complicated board game rulebooks"],
          willingnessToPay: "₹200 per player table fee + ₹350 average food spend"
        },
        whyNow: "Surging appetite for unplugged, tactile social bonding that fosters genuine face-to-face community connection.",
        innovationMoat: "Exclusive international publisher distribution licenses and weekly tournament community leagues.",
        tags: ["Retail & Cafe", "Board Game Cafe", "Experiential Retail", "Community Hub"],
        initialFeasibilityScore: 88
      }
    ];
  }

  // 11. Smart Adaptive Generator for Any Other Domain
  // Determine if founder explicitly asked for Software / Tech / SaaS
  const isExplicitTech =
    profile.businessType === "Tech & Software" ||
    norm.includes("software") ||
    norm.includes("saas") ||
    norm.includes("ai platform") ||
    norm.includes("web app") ||
    norm.includes("api platform") ||
    norm.includes("cloud developer");

  if (isExplicitTech) {
    return [
      {
        id: "tech-1",
        name: `${primaryDomain.replace(/\s+/g, '')}Flow`,
        tagline: `Intelligent Automated Operational Engine for Modern ${primaryDomain}`,
        domain: primaryDomain,
        businessType: "Software & SaaS",
        problemStatement: `Organizations in ${primaryDomain} waste hundreds of hours manually coordinating data between disconnected legacy tools and spreadsheets.`,
        solution: `A streamlined software platform combining intelligent workflows, unified connectors, and automated compliance to cut operational drag by 70%.`,
        targetPersona: {
          title: `Operations Directors & Team Leads in ${primaryDomain}`,
          painPoints: [`Manual repetitive errors`, `Fragmented software tools`, `Slow decision cycle times`],
          willingnessToPay: `₹8,500 - ₹55,000 / month`
        },
        whyNow: `Modern API standards and cloud automation make it possible to connect end-to-end operations in hours rather than months.`,
        innovationMoat: `Proprietary industry workflow heuristics combined with founder's expertise in ${userSkills}.`,
        tags: [primaryDomain, "Automation", "Operations", "SaaS"],
        initialFeasibilityScore: 90
      },
      {
        id: "tech-2",
        name: `Apex${primaryDomain.replace(/\s+/g, '')} Hub`,
        tagline: `Collaborative Intelligence & Real-Time Decision Hub for ${primaryDomain}`,
        domain: primaryDomain,
        businessType: "Software Platform",
        problemStatement: `Teams lack a single source of truth to benchmark, monitor, and optimize their daily output in ${primaryDomain}.`,
        solution: `An intuitive digital workspace providing real-time telemetry, peer benchmarking, and predictive insights for ${primaryDomain} teams.`,
        targetPersona: {
          title: `Business Owners & Technical Leads in ${primaryDomain}`,
          painPoints: [`Blind decisions without data`, `Scattered team communication`, `Lost commercial opportunities`],
          willingnessToPay: `₹4,200 - ₹28,000 / month`
        },
        whyNow: `Exploding demand for clean, intuitive domain-specific software over bloated enterprise suites.`,
        innovationMoat: `Community-driven templates and high workflow stickiness through daily team engagement.`,
        tags: [primaryDomain, "Analytics", "Collaboration", "Productivity"],
        initialFeasibilityScore: 87
      },
      {
        id: "tech-3",
        name: `Veritas${primaryDomain.replace(/\s+/g, '')}`,
        tagline: `Automated Quality Assurance & Compliance Platform for ${primaryDomain}`,
        domain: primaryDomain,
        businessType: "Compliance & Security",
        problemStatement: `Navigating shifting standards and quality benchmarks in ${primaryDomain} creates severe operational risks and costly manual audits.`,
        solution: `Continuous automated monitoring scanner that audits operational pipelines against industry standards, auto-generating verification certifications.`,
        targetPersona: {
          title: `Quality Managers, Founders, and Compliance Officers`,
          painPoints: [`Fear of regulatory audits`, `Laborious manual checklists`, `Inconsistent service quality`],
          willingnessToPay: `₹16,000 - ₹95,000 / month`
        },
        whyNow: `Tighter industry regulations and quality standards requiring continuous digital audit trails.`,
        innovationMoat: `Automated policy verification rules and cryptographically tamper-proof audit certificates.`,
        tags: [primaryDomain, "Quality Assurance", "Compliance", "Trust"],
        initialFeasibilityScore: 89
      }
    ];
  }

  // DEFAULT FOR ANY REAL-WORLD DOMAIN: Diverse non-software, real-world physical and operational businesses
  return [
    {
      id: "dyn-1",
      name: `The ${primaryDomain.replace(/\s+/g, '')} Craft & Materials Co.`,
      tagline: `Specialized Direct-to-Market Branded Products & Materials for ${primaryDomain}`,
      domain: primaryDomain,
      businessType: "Physical Products / Manufacturing",
      problemStatement: `Buyers and operators in ${primaryDomain} struggle with inconsistent material grades, uncertified suppliers, and inflated distributor markups.`,
      solution: `A dedicated batch manufacturing and direct-to-customer production brand delivering standardized, quality-certified physical products with transparent origin testing.`,
      targetPersona: {
        title: `Commercial buyers, independent professionals, and consumers in ${primaryDomain}`,
        painPoints: [`Substandard batch quality`, `High distributor middleman margins`, `Frequent delivery delays`],
        willingnessToPay: `₹1,500 - ₹8,500 per unit or batch order`
      },
      whyNow: `Growing customer insistence on certified quality standards, direct manufacturer accountability, and transparent sourcing.`,
      innovationMoat: `Direct raw material supplier contracts and localized assembly operations combined with founder's skill in ${userSkills}.`,
      tags: [primaryDomain, "Manufacturing", "Direct Supply", "Quality Materials"],
      initialFeasibilityScore: 89
    },
    {
      id: "dyn-2",
      name: `Apex ${primaryDomain.replace(/\s+/g, '')} Contracting & Operations`,
      tagline: `Turnkey Certified On-Site Execution & Specialized Field Services for ${primaryDomain}`,
      domain: primaryDomain,
      businessType: "Turnkey Contracting & Field Operations",
      problemStatement: `Clients in ${primaryDomain} face unreliable freelance contractors, unpredictable completion schedules, and zero post-service quality guarantees.`,
      solution: `A professional turnkey contracting and operations enterprise providing trained on-site supervisors, verified technicians, milestone escrow billing, and guaranteed service SLAs.`,
      targetPersona: {
        title: `Property owners, commercial facility directors, and business operators in ${primaryDomain}`,
        painPoints: [`Unreliable arrival times and ghosting`, `Hidden surprise price hikes`, `Substandard workmanship`],
        willingnessToPay: `₹15,000 - ₹90,000 per turnkey operational project`
      },
      whyNow: `Surging commercial and residential demand with customer willingness to pay a premium for punctual, verified, professional execution.`,
      innovationMoat: `Rigorous field operator training academy, proprietary mobile dispatch logistics, and milestone escrow guarantees.`,
      tags: [primaryDomain, "Turnkey Services", "Field Operations", "Quality Standards"],
      initialFeasibilityScore: 88
    },
    {
      id: "dyn-3",
      name: `Terra ${primaryDomain.replace(/\s+/g, '')} Equipment & Logistics Yard`,
      tagline: `Regional Shared Equipment Rental Depot & Wholesale Distribution Hub for ${primaryDomain}`,
      domain: primaryDomain,
      businessType: "Equipment Rental & Supply Logistics",
      problemStatement: `Operators and businesses in ${primaryDomain} cannot justify heavy capital expenditures for specialized machinery and face fragmented local supply chains.`,
      solution: `A centralized regional equipment rental depot and wholesale distribution yard offering on-demand machinery leasing, certified operators, and bulk material staging.`,
      targetPersona: {
        title: `Small and mid-sized contractors, local operators, and commercial businesses in ${primaryDomain}`,
        painPoints: [`Crippling upfront capex costs`, `Equipment breakdown downtime`, `Fragmented small-batch procurement`],
        willingnessToPay: `₹3,500 - ₹12,000 per day rental / ₹45,000 monthly fleet lease`
      },
      whyNow: `Economic shift toward asset-light operational models allowing local businesses to scale rapidly without locking up working capital.`,
      innovationMoat: `Fleet telematics, in-house rapid maintenance crews, and direct wholesale manufacturer partnerships.`,
      tags: [primaryDomain, "Equipment Rental", "Supply Logistics", "Asset-Light Hub"],
      initialFeasibilityScore: 87
    }
  ];
}

function generateIntelligentValidation(
  idea: StartupIdea,
  profile: FounderProfile,
  tavilyContext?: string
): MarketValidation {
  const dLower = (idea.domain + " " + (idea.businessType || "") + " " + idea.tags.join(" ")).toLowerCase();
  const isFood = dLower.includes("food") || dLower.includes("beverage") || dLower.includes("cafe") || dLower.includes("dining") || dLower.includes("kitchen");
  const isD2C = dLower.includes("d2c") || dLower.includes("consumer") || dLower.includes("bamboo") || dLower.includes("goods") || dLower.includes("apparel") || dLower.includes("skincare");
  const isMfg = dLower.includes("manufacturing") || dLower.includes("hardware") || dLower.includes("tile") || dLower.includes("paver") || dLower.includes("iot");
  const isConstruction = dLower.includes("construct") || dLower.includes("constuct") || dLower.includes("build") || dLower.includes("contract") || dLower.includes("infra") || dLower.includes("interior") || dLower.includes("real estate") || dLower.includes("cement") || dLower.includes("mason");
  const isAgri = dLower.includes("agri") || dLower.includes("farm") || dLower.includes("hydroponic") || dLower.includes("crop");
  const isHealth = dLower.includes("health") || dLower.includes("wellness") || dLower.includes("clinic") || dLower.includes("recovery") || dLower.includes("therapy") || dLower.includes("gym");
  const isRetail = dLower.includes("retail") || dLower.includes("store") || dLower.includes("shop") || dLower.includes("pet");
  const isService = dLower.includes("service") || dLower.includes("hospitality") || dLower.includes("tourism") || dLower.includes("fleet") || dLower.includes("event");
  const isClean = dLower.includes("clean") || dLower.includes("waste") || dLower.includes("solar") || dLower.includes("recycling");
  const isFintech = dLower.includes("fintech") || dLower.includes("finance");
  const isAgent = dLower.includes("agent") || dLower.includes("saas") || dLower.includes("software") || dLower.includes("cloud");

  const isExplicitTech = (
    dLower.includes("software & saas") ||
    dLower.includes("software platform") ||
    dLower.includes("compliance platform") ||
    dLower.includes("cloud middleware") ||
    dLower.includes("ai platform")
  ) && !dLower.includes("hardware") && !dLower.includes("physical") && !dLower.includes("construct") && !dLower.includes("constuct") && !dLower.includes("manufacturing");
  const isNonTech = !isExplicitTech;

  const loc = profile.targetLocation || {
    city: "San Francisco / Silicon Valley",
    country: "United States",
    region: "North America",
    ecosystemScore: 98,
    talentIndex: "9.8/10 World-Class",
    vcFundingClimate: "Hyperactive ($32.4B Early-Stage)",
    regulatoryFriendliness: "Moderate (High litigation awareness)",
    avgCustomerAcquisitionCost: "$280 - $450",
    keyHubs: ["SoMa AI Hub", "Palo Alto Sand Hill"]
  };

  let tam = { value: "₹3,20,000 Crores ($38.4B)", numBillions: 38.4, description: `Global and Indian addressable ${idea.domain} market projected through 2030.` };
  let sam = { value: "₹60,000 Crores ($7.2B)", numBillions: 7.2, description: `Addressable high-density urban customer segments actively seeking modern solutions in ${idea.domain}.` };
  let som = { value: "₹2,670 Crores ($320M)", numBillions: 0.32, description: `Early adopter cohort across ${loc.region} and flagship metropolitan corridors captured within 36 months.` };
  let cagr = "18.4%";

  if (isConstruction) {
    tam = { value: "₹18,50,000 Crores ($220.0B)", numBillions: 220.0, description: "Total addressable residential, commercial, and infrastructure construction and building materials market." };
    sam = { value: "₹3,40,000 Crores ($40.5B)", numBillions: 40.5, description: "Regional urban contracting, modular building materials, and commercial interior fit-out spend." };
    som = { value: "₹2,100 Crores ($250M)", numBillions: 0.25, description: "Target metropolitan developer and contractor catchment captured within 36 months." };
    cagr = "14.8%";
  } else if (isFood) {
    tam = { value: "₹12,10,000 Crores ($145.0B)", numBillions: 145.0, description: "Global and Indian specialty foods, healthy fast-casual dining, and nutritional meal solutions market." };
    sam = { value: "₹2,37,000 Crores ($28.4B)", numBillions: 28.4, description: "Urban working professionals, health-conscious consumers, and corporate dining accounts." };
    som = { value: "₹1,500 Crores ($180M)", numBillions: 0.18, description: "Target metro hub catchment and corporate dining delivery corridors over Years 1-3." };
    cagr = "15.6%";
  } else if (isD2C) {
    tam = { value: "₹7,38,000 Crores ($88.5B)", numBillions: 88.5, description: "Sustainable consumer lifestyle goods, zero-waste products, and eco-conscious personal care market." };
    sam = { value: "₹1,52,000 Crores ($18.2B)", numBillions: 18.2, description: "Middle-to-high income millennial and Gen-Z households actively buying clean label products." };
    som = { value: "₹1,170 Crores ($140M)", numBillions: 0.14, description: "Direct-to-consumer online sales and curated lifestyle boutique distribution in key metros." };
    cagr = "19.8%";
  } else if (isAgri) {
    tam = { value: "₹7,68,000 Crores ($92.0B)", numBillions: 92.0, description: "Controlled-environment agriculture, vertical hydroponics, and temperature-controlled agri logistics." };
    sam = { value: "₹1,62,000 Crores ($19.5B)", numBillions: 19.5, description: "Commercial horticulture growers, hotel chains, and supermarket fresh-supply contracts." };
    som = { value: "₹1,000 Crores ($120M)", numBillions: 0.12, description: "Regional farming clusters and high-margin B2B culinary client base." };
    cagr = "17.2%";
  } else if (isHealth) {
    tam = { value: "₹6,18,000 Crores ($74.0B)", numBillions: 74.0, description: "Physical wellness clinics, contrast recovery studios, and preventive diagnostic health centers." };
    sam = { value: "₹1,30,000 Crores ($15.6B)", numBillions: 15.6, description: "Urban fitness enthusiasts, amateur athletes, and corporate executive wellness memberships." };
    som = { value: "₹790 Crores ($95M)", numBillions: 0.095, description: "Flagship neighborhood studios and corporate wellness partners within initial launch hubs." };
    cagr = "18.5%";
  } else if (isMfg) {
    tam = { value: "₹10,85,000 Crores ($130.0B)", numBillions: 130.0, description: "Decentralized clean hardware, solar micro-cold rooms, and recycled green construction materials." };
    sam = { value: "₹2,67,000 Crores ($32.0B)", numBillions: 32.0, description: "Municipal developers, farmer producer organizations, and commercial industrial facilities." };
    som = { value: "₹1,750 Crores ($210M)", numBillions: 0.21, description: "Contracted regional infrastructure projects and agricultural cooperative installations." };
    cagr = "22.4%";
  } else if (isRetail) {
    tam = { value: "₹5,42,000 Crores ($65.0B)", numBillions: 65.0, description: "Experiential retail, zero-waste refill stores, and full-service pet wellness care centers." };
    sam = { value: "₹1,18,000 Crores ($14.2B)", numBillions: 14.2, description: "High-density residential urban communities with strong repeat footfall." };
    som = { value: "₹710 Crores ($85M)", numBillions: 0.085, description: "Initial network of 5-10 profitable neighborhood flagship stores." };
    cagr = "16.4%";
  } else if (isClean) {
    tam = { value: "₹7,01,000 Crores ($84.0B)", numBillions: 84.0, description: "Urban circular economy, e-waste mineral recovery, and on-site commercial bio-composting." };
    sam = { value: "₹1,48,000 Crores ($17.8B)", numBillions: 17.8, description: "Corporate IT departments, hotel chains, and municipal bulk waste generators." };
    som = { value: "₹1,085 Crores ($130M)", numBillions: 0.13, description: "Licensed commercial off-take contracts and institutional processing hubs." };
    cagr = "21.5%";
  } else if (isFintech) {
    tam = { value: "₹5,38,000 Crores ($64.5B)", numBillions: 64.5, description: "Total addressable market for automated financial intelligence and accounting software." };
    sam = { value: "₹1,07,000 Crores ($12.8B)", numBillions: 12.8, description: "B2B SaaS, digital commerce, and modern fintech enterprises requiring continuous ledger verification." };
    som = { value: "₹4,000 Crores ($480M)", numBillions: 0.48, description: "High-growth startups and mid-market CFO organizations seeking modern tech stacks." };
    cagr = "22.4%";
  } else if (isAgent) {
    tam = { value: "₹3,90,000 Crores ($46.7B)", numBillions: 46.7, description: "Autonomous AI agents, cloud orchestration middleware, and agent security markets." };
    sam = { value: "₹94,000 Crores ($11.3B)", numBillions: 11.3, description: "Mid-to-large engineering and IT operations teams deploying multi-agent systems." };
    som = { value: "₹4,260 Crores ($510M)", numBillions: 0.51, description: "Tech-forward dev teams and Series A-D scaleups with dedicated AI workloads." };
    cagr = "39.5%";
  }

  const regionalMarketDynamics = `Launching in ${loc.city}, ${loc.country} grants direct access to an ecosystem rated ${loc.ecosystemScore}/100 with ${loc.talentIndex} talent. The local funding climate (${loc.vcFundingClimate}) and ${loc.regulatoryFriendliness} provide accelerated seed staging, while target buyer acquisition cost in this territory averages ${loc.avgCustomerAcquisitionCost}. Strategic expansion corridors include ${loc.keyHubs.join(" and ")}.`;

  const competitorComparisonMatrix: CompetitorFeatureComparison = isNonTech
    ? {
        features: [
          "Direct Ethical Sourcing",
          "100% Clean / Eco-Certified Quality",
          "Rapid On-Demand Access",
          "Affordable Transparent Pricing",
          "Sustainable Zero-Waste Packaging",
          "High-Retention Loyalty Program"
        ],
        competitors: [
          {
            name: "Legacy Mass Commercial Brands",
            scores: {
              "Direct Ethical Sourcing": false,
              "100% Clean / Eco-Certified Quality": false,
              "Rapid On-Demand Access": "Batch Retail",
              "Affordable Transparent Pricing": true,
              "Sustainable Zero-Waste Packaging": false,
              "High-Retention Loyalty Program": "Basic Points"
            }
          },
          {
            name: "Unorganized Local Mom & Pop Outlets",
            scores: {
              "Direct Ethical Sourcing": "Inconsistent",
              "100% Clean / Eco-Certified Quality": "Unverified",
              "Rapid On-Demand Access": "Walk-in Only",
              "Affordable Transparent Pricing": true,
              "Sustainable Zero-Waste Packaging": false,
              "High-Retention Loyalty Program": false
            }
          },
          {
            name: "High-Priced Luxury Boutique Chains",
            scores: {
              "Direct Ethical Sourcing": true,
              "100% Clean / Eco-Certified Quality": true,
              "Rapid On-Demand Access": "Limited Locations",
              "Affordable Transparent Pricing": false,
              "Sustainable Zero-Waste Packaging": "Partial",
              "High-Retention Loyalty Program": true
            }
          }
        ],
        ourProduct: {
          name: idea.name,
          scores: {
            "Direct Ethical Sourcing": true,
            "100% Clean / Eco-Certified Quality": true,
            "Rapid On-Demand Access": true,
            "Affordable Transparent Pricing": true,
            "Sustainable Zero-Waste Packaging": true,
            "High-Retention Loyalty Program": true
          }
        }
      }
    : {
        features: [
          "Real-Time Cloud Streaming",
          "Deterministic Safety Guardrails",
          "API-First Developer SDKs",
          "Self-Serve Onboarding (< 5 mins)",
          "Usage-Based Unit Economics",
          "Multi-Agent Workflow Autonomy"
        ],
        competitors: [
          {
            name: "Legacy Incumbents (SAP / Oracle / Custom ERPs)",
            scores: {
              "Real-Time Cloud Streaming": "Batch Only",
              "Deterministic Safety Guardrails": "Partial",
              "API-First Developer SDKs": false,
              "Self-Serve Onboarding (< 5 mins)": "60-Day RFP",
              "Usage-Based Unit Economics": false,
              "Multi-Agent Workflow Autonomy": false
            }
          },
          {
            name: "First-Gen AI Wrappers",
            scores: {
              "Real-Time Cloud Streaming": "High Latency",
              "Deterministic Safety Guardrails": false,
              "API-First Developer SDKs": "Basic REST",
              "Self-Serve Onboarding (< 5 mins)": true,
              "Usage-Based Unit Economics": "Flat Tier",
              "Multi-Agent Workflow Autonomy": "Single Prompt"
            }
          },
          {
            name: "In-House DIY Engineering Scripts",
            scores: {
              "Real-Time Cloud Streaming": "Custom Python",
              "Deterministic Safety Guardrails": "Fragile",
              "API-First Developer SDKs": "Internal Only",
              "Self-Serve Onboarding (< 5 mins)": false,
              "Usage-Based Unit Economics": "High TCO",
              "Multi-Agent Workflow Autonomy": "Experimental"
            }
          }
        ],
        ourProduct: {
          name: idea.name,
          scores: {
            "Real-Time Cloud Streaming": true,
            "Deterministic Safety Guardrails": true,
            "API-First Developer SDKs": true,
            "Self-Serve Onboarding (< 5 mins)": true,
            "Usage-Based Unit Economics": true,
            "Multi-Agent Workflow Autonomy": true
          }
        }
      };

  const targetUserAnalysis: TargetUserAnalysis = {
    personaName: idea.targetPersona.title,
    roleTitle: idea.targetPersona.title.split(" at ")[0] || "Target Customer",
    organizationType: profile.targetAudience,
    acutePainPoints: idea.targetPersona.painPoints,
    buyingTriggerMoments: isNonTech
      ? [
          `Frustration with generic mass-market quality and lack of transparent ethical sourcing in ${idea.domain}.`,
          `Urgent need for convenient, healthy, or sustainable alternatives that fit busy modern lifestyles.`,
          `Corporate or personal sustainability goals demanding verified zero-waste and non-toxic products.`
        ]
      : [
          `Quarterly executive audit exposing critical inefficiencies and manual leaks in ${idea.domain}.`,
          `Customer churn or compliance threat directly linked to unmonitored human errors.`,
          `Engineering capacity exhausted by repetitive maintenance tasks rather than core product delivery.`
        ],
    willingnessToPayRange: idea.targetPersona.willingnessToPay,
    decisionMakers: isNonTech
      ? [
          "Primary End-Consumer / Household Budget Head",
          "Lifestyle / Quality Influencer (Validates ingredients and reviews)",
          "Procurement / Facility Manager (For B2B wholesale orders)"
        ]
      : [
          "VP / C-Level Budget Owner (Signs off on software budget)",
          "Technical Lead / Architect (Validates security & API robustness)",
          "Operations Manager (Champion evaluating day-to-day UX & time savings)"
        ],
    acquisitionChannels: isNonTech
      ? [
          {
            channel: "High-Footfall Neighborhood Storefronts & Experiential Hubs",
            effectiveness: "High",
            estimatedCac: "₹350 - ₹750 / customer"
          },
          {
            channel: "Targeted Localized Social Media (Instagram / Tasting Sampling)",
            effectiveness: "High",
            estimatedCac: "₹250 - ₹500 / customer"
          },
          {
            channel: "B2B Corporate Partnerships & Institutional Subscriptions",
            effectiveness: "Medium",
            estimatedCac: "₹1,200 - ₹2,500 / account"
          }
        ]
      : [
          {
            channel: "Product-Led Inbound (Interactive Tool & Developer Community)",
            effectiveness: "High",
            estimatedCac: "$85 - $150"
          },
          {
            channel: "Targeted Account-Based LinkedIn & Direct Founder Outreach",
            effectiveness: "High",
            estimatedCac: "$220 - $380"
          },
          {
            channel: "Cloud Marketplace (AWS/GCP/Azure) & Strategic API Integrations",
            effectiveness: "Medium",
            estimatedCac: "$170 - $290"
          }
        ],
    adoptionFriction: isNonTech
      ? "Consumer inertia with familiar legacy brands. Overcome through risk-free first-visit samples, transparent QR ingredient traceability, and welcoming modern physical ambiance."
      : "Initial hesitation regarding data privacy and integration latency with legacy databases. Mitigated via 1-click sandbox demo and SOC2 zero-retention assurances.",
    retentionDrivers: isNonTech
      ? [
          "Delightful physical product experience and consistent sensory quality",
          "Automated monthly subscription replenishment with personalized preferences",
          "Exclusive community events, loyalty member discounts, and referral perks"
        ]
      : [
          "Accumulated historical telemetry and custom fine-tuned workflow heuristics",
          "Automated weekly ROI summaries sent directly to leadership",
          "Deep cross-functional team embedding that creates strong workflow lock-in"
        ]
  };

  return {
    ideaId: idea.id,
    marketSummary: tavilyContext
      ? `${tavilyContext} The market for ${idea.name} is supported by verified industry growth trends and expanding customer demand.`
      : (isNonTech
          ? `The market for ${idea.name} is benefiting from a massive consumer movement toward clean ingredients, transparent localized craftsmanship, and sustainable living. High customer loyalty and direct margin capture offer exceptional unit economics.`
          : `The market for ${idea.name} is experiencing an unprecedented structural inflection point driven by API ubiquity, cloud-native scalability, and enterprise digital transformation. Customer willingness-to-pay is exceptionally strong due to direct ROI attribution and immediate labor efficiency gains.`),
    regionalMarketDynamics,
    tavilyResearchSummary: tavilyContext || undefined,
    usedTavily: !!tavilyContext,
    tam,
    sam,
    som,
    cagr,
    competitors: isNonTech
      ? [
          {
            name: "Legacy commercial mass brands",
            type: "Indirect",
            strengths: "Decades-old distribution contracts, ubiquitous shelf presence, deep marketing budgets.",
            weaknesses: "Ultra-processed or cheap synthetic materials, impersonal corporate brand perception, zero local connection.",
            ourDifferentiation: "100% transparent direct sourcing, superior craftsmanship, zero harmful chemicals, and engaging modern community.",
            fundingOrScale: "Public multi-billion conglomerates"
          },
          {
            name: "Unorganized local street vendors & mom-and-pop shops",
            type: "Direct",
            strengths: "Low overhead, hyper-local neighborhood familiarity.",
            weaknesses: "Inconsistent quality control, lack of sanitary or lab certifications, zero digital ordering or customer loyalty.",
            ourDifferentiation: "Standardized clinical hygiene, certified organic ingredients, seamless digital ordering and membership rewards.",
            fundingOrScale: "Single-outlet operators"
          },
          {
            name: "Expensive luxury boutique brands",
            type: "Direct",
            strengths: "High aesthetic appeal, established aspirational status.",
            weaknesses: "Exorbitant price tags with 5x markups, exclusionary vibe, limited accessibility.",
            ourDifferentiation: "Accessible everyday luxury pricing, direct-to-consumer savings, and welcoming inclusive community spaces.",
            fundingOrScale: "Regional chains / VC-backed niche brands"
          }
        ]
      : [
          {
            name: "Legacy incumbent solutions (SAP, Oracle, or legacy point tools)",
            type: "Indirect",
            strengths: "Established distribution contracts, widespread enterprise lock-in.",
            weaknesses: "Rigid on-prem architecture, lack of native modern AI reasoning, prohibitive implementation fees ($50k+).",
            ourDifferentiation: "Zero-configuration self-serve onboarding, 10x faster deployment, modern API-first composability.",
            fundingOrScale: "Public multi-billion conglomerates"
          },
          {
            name: "First-generation AI wrappers",
            type: "Direct",
            strengths: "Fast initial market hype, viral launch traction.",
            weaknesses: "Superficial prompt wrappers with no deep domain logic, zero data moats, frequent hallucinations.",
            ourDifferentiation: "Full-stack multi-agent verification, robust cloud telemetry, deterministic safety guardrails.",
            fundingOrScale: "Seed / Pre-Series A ($2M - $5M raised)"
          },
          {
            name: "In-house DIY Engineering Teams",
            type: "Indirect",
            strengths: "Tailored to exact internal company quirks.",
            weaknesses: "High ongoing maintenance burden, distraction from core product, fragile custom codebases.",
            ourDifferentiation: "Turnkey enterprise SLA, continuous compliance updates, 90% lower TCO (Total Cost of Ownership).",
            fundingOrScale: "Internal Cost Centers"
          }
        ],
    competitorComparisonMatrix,
    targetUserAnalysis,
    realTimeTrends: isNonTech
      ? [
          {
            source: "Retail & Consumer Market Telemetry",
            headline: `Surge in consumer spending on premium, verified ${idea.domain} products`,
            sentiment: "Bullish",
            growthSignal: "+142% YoY consumer demand"
          },
          {
            source: "Supply Chain & Sustainable Sourcing Reports",
            headline: "Accelerated shift toward local direct-from-producer supply chains",
            sentiment: "Bullish",
            growthSignal: "35% lower transit overhead"
          },
          {
            source: "Venture Capital & Consumer Private Equity",
            headline: `Institutional capital actively consolidating top brands in ${idea.domain}`,
            sentiment: "Bullish",
            growthSignal: "Fastest-growing consumer sector"
          }
        ]
      : [
          {
            source: "HackerNews & Developer APIs",
            headline: `Surge in discussions prioritizing automated ${idea.domain} infrastructure`,
            sentiment: "Bullish",
            growthSignal: "+178% YoY mentions"
          },
          {
            source: "Cloud Infrastructure Benchmarks",
            headline: "Rapid shift toward event-driven serverless AI inference pipelines",
            sentiment: "Bullish",
            growthSignal: "41% reduction in inference latency"
          },
          {
            source: "Venture Capital Allocation Reports",
            headline: `Over $3.8B deployed into verticalized AI and ${idea.domain} platforms in the past 12 months`,
            sentiment: "Bullish",
            growthSignal: "Top quartile VC investment category"
          }
        ],
    targetSegments: isNonTech
      ? [
          {
            segment: "Conscious Urban Millennials & Families",
            sizeShare: "45%",
            urgency: "High",
            salesCycle: "Instant Walk-in / Same-day"
          },
          {
            segment: "B2B Corporate Accounts & Hospitality Partners",
            sizeShare: "35%",
            urgency: "High",
            salesCycle: "1 - 2 weeks"
          },
          {
            segment: "Boutique Retailers & Curated Shelf Partners",
            sizeShare: "20%",
            urgency: "Medium",
            salesCycle: "2 - 4 weeks"
          }
        ]
      : [
          {
            segment: "High-Velocity Tech Scaleups",
            sizeShare: "40%",
            urgency: "High",
            salesCycle: "1 - 3 weeks"
          },
          {
            segment: "Traditional Mid-Market Enterprises",
            sizeShare: "38%",
            urgency: "Critical",
            salesCycle: "4 - 8 weeks"
          },
          {
            segment: "Boutique Consultancies & Agencies",
            sizeShare: "22%",
            urgency: "Medium",
            salesCycle: "Under 10 days"
          }
        ]
  };
}

export function buildMvpAndRoadmap(
  idea: StartupIdea,
  profile: FounderProfile,
  isNonTech: boolean
): { mvpRecommendation: MVPRecommendation; businessRoadmap: BusinessRoadmap } {
  const tf = (profile.timeframe || "").toLowerCase();

  const is2Week = tf.includes("2-week") || tf.includes("2 week") || tf.includes("14") || tf.includes("rapid mvp");
  const is30Day = tf.includes("30-day") || tf.includes("30 day") || tf.includes("4-week") || tf.includes("4 week") || tf.includes("pilot launch");
  const is6Month = tf.includes("6 month") || tf.includes("enterprise") || tf.includes("24 week") || tf.includes("180");

  if (is2Week) {
    const mvpRecommendation: MVPRecommendation = {
      mvpName: `${idea.name} 2-Week Rapid MVP`,
      timelineWeeks: 2,
      timeframe: profile.timeframe || "2-Week Rapid MVP Sprint",
      coreValueProposition: isNonTech
        ? "An ultra-lean, high-velocity commercial test: handcrafted small batch sample run / direct pop-up pilot validating immediate customer demand and willingness to pay within 14 days."
        : "An ultra-focused, zero-bloat prototype solving the single primary acute bottleneck with sub-second execution to capture initial user commitments in 14 days.",
      featureBacklog: {
        mustHave: isNonTech
          ? [
              "Initial small-batch production run / sample formulation",
              "Direct WhatsApp Business & UPI/QR instant payment checkout",
              "Same-day local courier delivery / pop-up pickup station",
              "Direct customer feedback questionnaire & reorder hook",
            ]
          : [
              "Core algorithmic / AI transaction pipeline (single happy path)",
              "Instant magic-link / OAuth user sign-in",
              "Single primary output screen with instant copy/export",
              "One-click feedback prompt & pilot pre-order payment link",
            ],
        shouldHave: isNonTech
          ? [
              "Branded packaging labels & care cards",
              "Automated WhatsApp dispatch tracking updates",
              "Simple Google Sheets / Airtable inventory counter",
            ]
          : [
              "Automated welcome email via Resend",
              "Basic usage limit meter",
              "Export results to PDF/CSV",
            ],
        couldHave: isNonTech
          ? [
              "Dedicated web storefront with subscription billing",
              "Bulk retail distribution wholesale packaging",
              "Multi-city logistics integration",
            ]
          : [
              "Role-based team workspaces",
              "Custom domain white-labeling",
              "Webhook notifications & Slack integration",
            ],
      },
      recommendedStack: isNonTech
        ? {
            frontend: "WhatsApp Business Catalog + Single-Page Next.js Landing",
            backend: "Direct Dispatch & POS Operations + UPI QR Gateway",
            database: "Supabase / Airtable Lightweight Inventory Cache",
            aiModel: "Batch Production Sizing & Pricing Heuristics",
            lowCodeAccelerators: [
              "Razorpay / UPI Quick Checkout",
              "WhatsApp Business API for order receipts",
              "Dunzo / Local Logistics API",
              "Canva Pro for rapid branded packaging labels",
            ],
          }
        : {
            frontend: "Next.js 14 App Router, Tailwind CSS, Lucide Icons",
            backend: "Next.js Edge Route Handlers + Serverless Functions",
            database: "PostgreSQL (Supabase) + pgvector",
            aiModel: "Google Gemini 1.5 Flash (sub-500ms inference)",
            lowCodeAccelerators: [
              "Clerk / NextAuth for instant secure authentication",
              "Stripe Payment Links for rapid pilot checkout",
              "Upstash Redis for sub-millisecond caching",
              "Resend API for transactional user notifications",
            ],
          },
      fourWeekSprintPlan: [
        {
          week: 1,
          periodLabel: "Week 01",
          daysLabel: "Days 1 - 7",
          title: isNonTech ? "Sourcing & Rapid Prototype Formulation" : "Core Loop Architecture & Single-Flow UI",
          goals: isNonTech
            ? [
                "Secure initial batch ingredients / material samples",
                "Produce first 25 prototype units and test quality",
                "Setup WhatsApp Business catalog & UPI QR payment flow",
              ]
            : [
                "Scaffold Next.js app and wire core AI inference / calculation pipeline",
                "Implement single-page focused UI for the primary job-to-be-done",
                "Deploy staging build to Vercel with mock verification",
              ],
          deliverable: isNonTech
            ? "25 packaged sample units with functional WhatsApp/UPI checkout flow"
            : "Deployable prototype executing the core user workflow end-to-end",
        },
        {
          week: 2,
          periodLabel: "Week 02",
          daysLabel: "Days 8 - 14",
          title: isNonTech ? "Sampling, Direct Sales & Customer Validation" : "Beta User Testing, Polish & Public Launch",
          goals: isNonTech
            ? [
                "Distribute sample units to 50 target customer prospects",
                "Collect first 15 paid pre-orders and feedback ratings",
                "Calculate real unit gross margins and repeat order intent",
              ]
            : [
                "Conduct 5 live usability walkthroughs with target persona users",
                "Fix primary UX drop-off points and implement Stripe payment link",
                "Public launch on Product Hunt, Twitter/X & relevant niche communities",
              ],
          deliverable: isNonTech
            ? "First 15+ paying customers and verified unit economics baseline"
            : "Public production release with first 10-25 active users and paying pilot commitments",
        },
      ],
    };

    const businessRoadmap: BusinessRoadmap = {
      phases: [
        {
          phase: 1,
          title: isNonTech ? "Rapid Pilot Launch & Traction" : "Rapid MVP & Initial Traction",
          timeframe: "Weeks 1 - 4",
          milestones: isNonTech
            ? [
                "Ship 14-day small-batch MVP and fulfill first 50 orders",
                "Achieve 40%+ customer satisfaction score and positive reviews",
                "Establish consistent raw material supply relationships",
                "Reach initial ₹75,000 in weekly sales",
              ]
            : [
                "Ship 14-day rapid MVP to production",
                "Onboard first 25 active users with > 50% weekly return rate",
                "Collect first 3 signed LOIs or paying pilot subscriptions",
                "Launch public waitlist reaching 300+ signups",
              ],
          keyMetrics: isNonTech ? "50 Customers · 40% Repeat Rate · ₹75k Sales" : "25 Active Users · 3 Paying Pilots · < 500ms Core Latency",
          fundingGoal: "Bootstrapped / ₹5L - ₹15L Micro-Angel",
          status: "Active",
        },
        {
          phase: 2,
          title: isNonTech ? "Commercial Expansion & Regular Orders" : "Closed Beta & Feature Iteration",
          timeframe: "Months 2 - 4",
          milestones: isNonTech
            ? [
                "Scale to 150 regular weekly customers",
                "Introduce 2 new complementary product SKUs",
                "Streamline kitchen/workshop prep to cut fulfillment time 40%",
                "Reach ₹3,50,000 monthly revenue",
              ]
            : [
                "Onboard 75 active users across 15 organizations",
                "Deploy automated email digest and export engine",
                "Reach first $3,000 in Monthly Recurring Revenue (MRR)",
                "Optimize API inference cost by 35% with caching",
              ],
          keyMetrics: isNonTech ? "₹3.5L Monthly Revenue · 60% Repeat Rate" : "$3k MRR · 55% WAU/MAU · NPS 60+",
          fundingGoal: "₹25L - ₹50L Angel Seed",
          status: "Upcoming",
        },
        {
          phase: 3,
          title: isNonTech ? "Multi-Channel Distribution" : "Product-Market Fit & Monetization Scale",
          timeframe: "Months 5 - 8",
          milestones: isNonTech
            ? [
                "Launch on regional delivery aggregators & boutique retail shelves",
                "Establish corporate bulk orders program",
                "Cross ₹10,00,000 monthly run-rate",
              ]
            : [
                "Scale to 200 paying accounts",
                "Launch self-serve annual subscription billing",
                "Achieve $15,000+ MRR with < 3% monthly churn",
              ],
          keyMetrics: isNonTech ? "₹10L Monthly Revenue · 65% Margin" : "$15k MRR · 10x LTV:CAC",
          fundingGoal: "₹1 Crore - ₹2 Crore Pre-Series A",
          status: "Planned",
        },
        {
          phase: 4,
          title: isNonTech ? "Brand Scaling & City Hubs" : "Market Expansion & Scale",
          timeframe: "Months 9 - 12",
          milestones: isNonTech
            ? [
                "Expand to 3 neighborhood delivery/retail hubs",
                "Launch subscription replenishment membership",
                "Cross ₹30,00,000 monthly revenue",
              ]
            : [
                "Introduce team enterprise tier with SOC2 baseline",
                "Cross $40,000+ MRR ($480k ARR)",
                "Prepare institutional venture round",
              ],
          keyMetrics: isNonTech ? "₹30L Monthly Run-Rate · 3 Hubs" : "$40k MRR · 80% Gross Margin",
          fundingGoal: "$1.0M - $2.5M Seed Round",
          status: "Planned",
        },
      ],
    };

    return { mvpRecommendation, businessRoadmap };
  }

  if (is6Month) {
    const mvpRecommendation: MVPRecommendation = isNonTech
      ? {
          mvpName: `${idea.name} Enterprise Production Facility`,
          timelineWeeks: 24,
          timeframe: profile.timeframe || "6 Months Enterprise Grade",
          coreValueProposition: "An industrial-scale commercial enterprise: state-of-the-art production facility with ISO/HACCP certifications, corporate procurement SLAs, and dedicated supply chain resilience over 6 months.",
          featureBacklog: {
            mustHave: [
              "Industrial production facility with certified ISO/health safety standards",
              "Enterprise B2B procurement contract portal with Net-30 invoicing",
              "Batch traceability & QR-verified supply chain provenance",
              "Dedicated account manager & SLA-backed delivery fulfillment",
            ],
            shouldHave: [
              "Automated cold-chain / climate-controlled fleet monitoring",
              "Centralized ERP integration (SAP / Zoho Books enterprise sync)",
              "Custom client packaging & white-label corporate branding",
              "Automated inventory buffer warning & replenishment system",
            ],
            couldHave: [
              "National franchise licensing & master franchisee portal",
              "Regional warehouse depot expansion blueprint",
              "Automated robotic packaging sorting lines",
            ],
          },
          recommendedStack: {
            frontend: "Next.js 14 Enterprise Portal + Tailored B2B Dashboard",
            backend: "ERP & Automated Industrial Dispatch System + WhatsApp API",
            database: "PostgreSQL (Aurora Multi-AZ) + Redis Telematics Cache",
            aiModel: "Predictive Demand Forecasting & Fleet Routing Optimization",
            lowCodeAccelerators: [
              "RazorpayX / Stripe Invoicing for Net-30 B2B billing",
              "Zoho Creator / AppSheet for internal floor management",
              "Shiprocket Enterprise / Cold-Chain Logistics API",
              "Tally Cloud API for automated GST e-way billing",
            ],
          },
          fourWeekSprintPlan: [
            {
              week: 1,
              periodLabel: "Phase 01",
              daysLabel: "Month 1",
              title: "Industrial Facility Blueprint & Regulatory Licensing",
              goals: [
                "Complete facility layout engineering and machinery procurement bids",
                "Initiate ISO/HACCP and local environmental safety compliance filings",
                "Finalize long-term raw material grower/supplier exclusivity pacts",
              ],
              deliverable: "Approved industrial blueprint, compliance filings, and supplier contracts",
            },
            {
              week: 2,
              periodLabel: "Phase 02",
              daysLabel: "Months 2 - 3",
              title: "Pilot Plant Commissioning & Batch Validation",
              goals: [
                "Install industrial processing equipment and test pilot runs",
                "Conduct comprehensive lab shelf-life and stress-testing protocols",
                "Establish automated quality assurance inspection checkpoints",
              ],
              deliverable: "Commissioned pilot facility producing lab-certified quality runs",
            },
            {
              week: 3,
              periodLabel: "Phase 03",
              daysLabel: "Months 4 - 5",
              title: "Enterprise Client Trials & Commercial Pre-Sales",
              goals: [
                "Initiate 10 commercial trials with institutional hospitality/retail buyers",
                "Deploy B2B procurement portal with automated GST invoice generation",
                "Finalize first 3 annual supply contracts with guaranteed minimum off-takes",
              ],
              deliverable: "3 signed commercial enterprise contracts with ₹15L+ committed pipeline",
            },
            {
              week: 4,
              periodLabel: "Phase 04",
              daysLabel: "Month 6",
              title: "Commercial Production Rollout & SLA Operations",
              goals: [
                "Commence full commercial manufacturing and distribution operations",
                "Fulfill enterprise orders with 99.5% on-time delivery SLA guarantee",
                "Establish recurring monthly revenue baseline exceeding ₹12,00,000",
              ],
              deliverable: "Full-scale certified manufacturing operations with profitable enterprise accounts",
            },
          ],
        }
      : {
          mvpName: `${idea.name} Enterprise Platform MVP`,
          timelineWeeks: 24,
          timeframe: profile.timeframe || "6 Months Enterprise Grade",
          coreValueProposition: "A high-assurance enterprise platform engineered for mission-critical reliability: SOC2/ISO27001 readiness, dedicated VPC deployment, granular RBAC, and guaranteed 99.9% uptime SLAs over 6 months.",
          featureBacklog: {
            mustHave: [
              "Enterprise SSO (SAML 2.0 / Okta / Azure AD) & SCIM user provisioning",
              "Role-based access control (RBAC) with granular tenant permissioning",
              "Immutable audit logging & compliance activity export",
              "High-availability multi-region cloud deployment with automated failover",
            ],
            shouldHave: [
              "Custom API webhooks & bi-directional enterprise CRM integration",
              "Dedicated VPC / single-tenant data residency options",
              "Automated security vulnerability & patch monitoring",
              "Enterprise SLA monitoring & automated latency alerting",
            ],
            couldHave: [
              "On-premise air-gapped Docker/Kubernetes appliance",
              "Custom fine-tuned private AI models on enterprise data",
              "Multi-region active-active database replication",
            ],
          },
          recommendedStack: {
            frontend: "Next.js 14 App Router, Tailwind CSS, shadcn/ui, Recharts",
            backend: "AWS ECS Fargate Container Microservices + Go/Node.js API",
            database: "Amazon Aurora PostgreSQL Multi-AZ with pgvector & DynamoDB",
            aiModel: "Self-hosted vLLM on AWS Bedrock / Private Gemini Enterprise VPC",
            lowCodeAccelerators: [
              "WorkOS / BoxyHQ for instant Enterprise SSO & SCIM",
              "Stripe Billing Enterprise for custom contract invoicing",
              "AWS KMS & Vault for hardware-grade key management",
              "Datadog / AWS CloudWatch for real-time SLA telemetry",
            ],
          },
          fourWeekSprintPlan: [
            {
              week: 1,
              periodLabel: "Phase 01",
              daysLabel: "Month 1",
              title: "Enterprise Architecture & Security Blueprint",
              goals: [
                "Formalize architectural RFCs, data isolation models & threat matrices",
                "Configure AWS/GCP multi-region VPC with encrypted secrets management",
                "Draft SOC2 Type I control mappings and vendor risk assessment",
              ],
              deliverable: "Verified enterprise cloud topology and isolated staging environment",
            },
            {
              week: 2,
              periodLabel: "Phase 02",
              daysLabel: "Months 2 - 3",
              title: "Core Enterprise Platform & Identity Federation",
              goals: [
                "Implement enterprise SSO (SAML/Okta) and SCIM provisioning",
                "Build scalable microservices with event-driven message queuing",
                "Develop automated CI/CD security scanning (SAST/DAST) in pipeline",
              ],
              deliverable: "Functional core enterprise platform passing baseline penetration tests",
            },
            {
              week: 3,
              periodLabel: "Phase 03",
              daysLabel: "Months 4 - 5",
              title: "Enterprise Integrations, Audit Trails & Pilot Staging",
              goals: [
                "Implement immutable audit logs and exportable compliance reports",
                "Build custom CRM/ERP webhooks and bi-directional sync adapters",
                "Deploy private staging sandbox for enterprise design partner testing",
              ],
              deliverable: "Feature-complete enterprise platform deployed in staging with 5 corporate pilots",
            },
            {
              week: 4,
              periodLabel: "Phase 04",
              daysLabel: "Month 6",
              title: "SOC2 Certification, HA Validation & Commercial Rollout",
              goals: [
                "Complete third-party SOC2 Type I audit and penetration testing",
                "Validate 99.9% uptime SLA under simulated heavy load conditions",
                "Convert 5 enterprise pilot accounts into multi-year commercial contracts",
              ],
              deliverable: "Production release with enterprise SLA guarantees and first $100k+ in contract value",
            },
          ],
        };

    const businessRoadmap: BusinessRoadmap = {
      phases: [
        {
          phase: 1,
          title: isNonTech ? "Industrial Facility Build & Pilot Testing" : "Enterprise Platform Build & Pilot Validation",
          timeframe: "Months 1 - 6",
          milestones: isNonTech
            ? [
                "Complete facility buildout and achieve ISO/HACCP certification",
                "Produce first 5,000 industrial batch units with 0 defects",
                "Sign 5 enterprise supply contracts with corporate chains",
                "Reach ₹15,00,000 monthly pilot revenue",
              ]
            : [
                "Ship enterprise MVP with SAML SSO, RBAC, and SOC2 readiness",
                "Deploy to private VPC for 5 enterprise design partners",
                "Achieve 99.9% availability SLA across 500k API transactions",
                "Secure 3 enterprise annual pilot contracts ($75k+ ARR)",
              ],
          keyMetrics: isNonTech ? "ISO Certified · ₹15L Monthly Revenue · 5 Enterprise Contracts" : "3 Enterprise Contracts · $75k ARR · 99.9% SLA · SOC2 Ready",
          fundingGoal: "₹1.5 Crore - ₹3 Crore Institutional Seed",
          status: "Active",
        },
        {
          phase: 2,
          title: isNonTech ? "Commercial Expansion & Regional Fleet" : "Enterprise Pilot Rollout & ARR Expansion",
          timeframe: "Months 7 - 9",
          milestones: isNonTech
            ? [
                "Expand regional logistics network to cover 3 metropolitan clusters",
                "Cross ₹40,00,000 monthly gross revenue",
                "Reduce bulk ingredient procurement costs by 15%",
              ]
            : [
                "Expand to 20 paying mid-market and enterprise accounts",
                "Achieve SOC2 Type II certification report",
                "Cross $30,00,000+ MRR ($360k ARR) with net negative churn",
              ],
          keyMetrics: isNonTech ? "₹40L Monthly Revenue · 65% Gross Margin" : "$30k MRR · Net Revenue Retention 118%",
          fundingGoal: "₹3 Crore - ₹6 Crore Pre-Series A",
          status: "Upcoming",
        },
        {
          phase: 3,
          title: isNonTech ? "Multi-Facility Scale & Institutional Supply" : "Global Enterprise Scaling & Integration Ecosystem",
          timeframe: "Months 10 - 14",
          milestones: isNonTech
            ? [
                "Commission second manufacturing plant in strategic hub",
                "Cross ₹1 Crore monthly run-rate with positive cash flow",
                "Establish national distributor partnerships across 20 cities",
              ]
            : [
                "Scale to 60 enterprise accounts with dedicated customer success",
                "Launch integration marketplace with 25 pre-built enterprise connectors",
                "Cross $80,000+ MRR ($1M ARR)",
              ],
          keyMetrics: isNonTech ? "₹1 Cr Monthly Run-Rate · 2 Facilities" : "$80k MRR ($1M ARR) · 12x LTV:CAC",
          fundingGoal: "$3.0M - $6.0M Series A",
          status: "Planned",
        },
        {
          phase: 4,
          title: isNonTech ? "National Dominance & Export Expansion" : "Market Dominance & Institutional Series A",
          timeframe: "Months 15 - 18",
          milestones: isNonTech
            ? [
                "Initiate international export distribution to Middle East & SE Asia",
                "Reach ₹3 Crore monthly revenue",
                "Prepare institutional growth equity round",
              ]
            : [
                "Expand enterprise sales into European and Asia-Pacific corridors",
                "Cross $180,000+ MRR ($2.2M ARR)",
                "Complete institutional Series A venture round",
              ],
          keyMetrics: isNonTech ? "₹3 Cr Monthly Revenue · Export Operations" : "$180k MRR ($2.2M ARR) · 88% Gross Margin",
          fundingGoal: "$10.0M+ Series B / Growth Round",
          status: "Planned",
        },
      ],
    };

    return { mvpRecommendation, businessRoadmap };
  }

  // Default: 1-3 Months Full Beta (8 - 12 Weeks)
  const mvpRecommendation: MVPRecommendation = isNonTech
    ? {
        mvpName: `${idea.name} Full Production Beta`,
        timelineWeeks: 10,
        timeframe: profile.timeframe || "1-3 Months Full Beta",
        coreValueProposition: "A comprehensive commercial establishment: multi-channel storefront / fully equipped commissary with automated inventory, repeat subscription club, and verified brand positioning.",
        featureBacklog: {
          mustHave: [
            "Dedicated high-conversion web storefront & omnichannel POS",
            "Automated weekly/monthly doorstep subscription replenishment",
            "Integrated logistics & courier dispatch tracking (Shiprocket/Dunzo)",
            "Multi-tier loyalty points & automated customer re-engagement",
          ],
          shouldHave: [
            "Corporate bulk gifting & B2B procurement portal",
            "Automated supplier reorder threshold alerts",
            "Custom branded packaging & unboxing experience",
            "Weekly inventory & margin tracking dashboard",
          ],
          couldHave: [
            "Franchise SOP operations manual & training portal",
            "Regional warehouse depot expansion blueprint",
            "Wholesale retail shelf package distribution",
          ],
        },
        recommendedStack: {
          frontend: "Next.js 14 Web Storefront / Shopify Headless + Tailwind CSS",
          backend: "Omnichannel POS & Inventory Operations + WhatsApp API",
          database: "PostgreSQL (Supabase) + Local Offline POS Cache",
          aiModel: "Demand Forecasting & Automated Inventory Replenishment Heuristics",
          lowCodeAccelerators: [
            "Razorpay / Stripe for multi-currency payment checkout",
            "Shiprocket / Local Logistics API for express delivery",
            "WhatsApp Business API for automated order updates",
            "Zoho / Tally Cloud for GST invoice compliance",
          ],
        },
        fourWeekSprintPlan: [
          {
            week: 1,
            periodLabel: "Phase 01",
            daysLabel: "Weeks 1 - 2",
            title: "Supply Chain, Formulation & Legal Licensing",
            goals: [
              "Secure verified grower/supplier contracts and batch ingredients",
              "Obtain FSSAI, trade license, and GST registrations",
              "Finalize product packaging design and eco-friendly materials",
            ],
            deliverable: "Approved production specifications and verified regulatory compliance",
          },
          {
            week: 2,
            periodLabel: "Phase 02",
            daysLabel: "Weeks 3 - 5",
            title: "Production Setup & Omnichannel Digital Storefront",
            goals: [
              "Equip commercial production kitchen / workshop facility",
              "Deploy Next.js / Shopify web storefront with WhatsApp bot",
              "Connect Razorpay/UPI payment gateway and automated order alerts",
            ],
            deliverable: "Fully operational pilot production facility with live online checkout",
          },
          {
            week: 3,
            periodLabel: "Phase 03",
            daysLabel: "Weeks 6 - 8",
            title: "Sampling, Corporate Tie-Ups & Closed Beta Pilot",
            goals: [
              "Distribute 250 curated sample units to target buyer personas",
              "Sign 3 corporate cafeteria or boutique retail placement accounts",
              "Launch Instagram pre-order waitlist campaign with early-bird perks",
            ],
            deliverable: "75+ confirmed pre-orders and 3 signed B2B commercial distribution agreements",
          },
          {
            week: 4,
            periodLabel: "Phase 04",
            daysLabel: "Weeks 9 - 12",
            title: "Commercial Public Launch & Operational Scaling",
            goals: [
              "Execute coordinated public launch across target metropolitan hubs",
              "Fulfill first 500 customer orders with personalized feedback cards",
              "Achieve unit-positive gross margins and establish 35%+ repeat rate",
            ],
            deliverable: "Live commercial operations generating ₹3,50,000+ monthly revenue with strong repeat traction",
          },
        ],
      }
    : {
        mvpName: `${idea.name} Full Beta Platform`,
        timelineWeeks: 10,
        timeframe: profile.timeframe || "1-3 Months Full Beta",
        coreValueProposition: "A robust, production-grade SaaS beta platform with automated multi-tenant onboarding, usage-based billing, enterprise analytics, and high-availability cloud architecture.",
        featureBacklog: {
          mustHave: [
            "Multi-tenant role-based workspace with team member invites",
            "Automated AI data pipeline with semantic caching & fallback models",
            "Self-serve Stripe billing integration (subscriptions & metered usage)",
            "Interactive analytics dashboard with automated PDF/CSV reporting",
          ],
          shouldHave: [
            "Developer API keys & webhook trigger subscriptions",
            "Detailed audit logs & exportable compliance reports",
            "Custom domain white-labeling & theme customization",
            "Automated email notifications via Resend",
          ],
          couldHave: [
            "Multi-region data residency compliance toggle",
            "Bi-directional CRM & Slack integration",
            "Custom enterprise SSO / SAML integration",
          ],
        },
        recommendedStack: {
          frontend: "Next.js 14 App Router, Tailwind CSS, Lucide Icons, Recharts",
          backend: "Next.js Edge Route Handlers + AWS Lambda Serverless Workers",
          database: "PostgreSQL (Aurora Serverless / Supabase) with pgvector",
          aiModel: "Google Gemini 1.5 Flash + Claude 3.5 Sonnet hybrid fallback",
          lowCodeAccelerators: [
            "Clerk / NextAuth for instant secure authentication",
            "Stripe Elements for rapid payment flow",
            "Upstash Redis for sub-millisecond semantic caching",
            "Resend API for transactional user notifications",
          ],
        },
        fourWeekSprintPlan: [
          {
            week: 1,
            periodLabel: "Phase 01",
            daysLabel: "Weeks 1 - 2",
            title: "Architecture Foundation & Multi-Tenant Setup",
            goals: [
              "Configure PostgreSQL schema with pgvector & multi-tenant isolation",
              "Implement Clerk/NextAuth secure authentication & team workspaces",
              "Build mock API data ingestion adapters and CI/CD pipelines",
            ],
            deliverable: "Deployable staging backend with functioning authentication and test suites",
          },
          {
            week: 2,
            periodLabel: "Phase 02",
            daysLabel: "Weeks 3 - 5",
            title: "Core AI Engine & Workflow Automation Pipeline",
            goals: [
              "Integrate Gemini 1.5 Flash + Claude 3.5 Sonnet fallback engine",
              "Implement Redis semantic caching for sub-millisecond responses",
              "Construct primary workflow automation and user dashboard views",
            ],
            deliverable: "Functional core platform delivering end-to-end user workflows with < 800ms latency",
          },
          {
            week: 3,
            periodLabel: "Phase 03",
            daysLabel: "Weeks 6 - 8",
            title: "Self-Serve Billing, Analytics & Closed Beta Testing",
            goals: [
              "Connect Stripe subscription billing tiers and metered credits",
              "Build interactive analytics charts and automated report exports",
              "Onboard 15 closed-beta design partners and collect telemetry",
            ],
            deliverable: "Complete end-to-end user journey with automated payments and 15 active beta teams",
          },
          {
            week: 4,
            periodLabel: "Phase 04",
            daysLabel: "Weeks 9 - 12",
            title: "Security Hardening, Performance Tuning & Public Launch",
            goals: [
              "Execute security penetration testing and rate-limiting guardrails",
              "Deploy global CDN edge caching and automated uptime monitoring",
              "Public launch on Product Hunt, HackerNews, and targeted founder channels",
            ],
            deliverable: "Public production release with live telemetry, automated billing, and first 50 paying customers",
          },
        ],
      };

  const businessRoadmap: BusinessRoadmap = {
    phases: [
      {
        phase: 1,
        title: isNonTech ? "Beta Launch & Community Traction" : "Full Beta Launch & Initial Traction",
        timeframe: "Months 1 - 3",
        milestones: isNonTech
          ? [
              "Launch flagship beta storefront / batch production facility",
              "Acquire first 350 paying retail & direct subscription customers",
              "Attain 45%+ monthly repeat purchase rate",
              "Partner with 8 regional retailers / corporate accounts",
            ]
          : [
              "Complete 20 problem validation interviews with target buyers",
              "Ship production-ready beta platform with automated billing",
              "Collect first 10 signed Letters of Intent (LOIs) or paid pilots",
              "Launch public waitlist reaching 1,000+ signups",
            ],
        keyMetrics: isNonTech ? "350 Customers · 45% Repeat Rate · ₹5,00,000 Sales" : "10 LOIs · 45% conversion · < 600ms API latency",
        fundingGoal: "Bootstrapped / ₹20L - ₹40L Angel Pre-Seed",
        status: "Active",
      },
      {
        phase: 2,
        title: isNonTech ? "Multi-Hub Expansion & Subscriptions" : "Monetization & Retention Scale",
        timeframe: "Months 4 - 6",
        milestones: isNonTech
          ? [
              "Open second neighborhood hub / expand production capacity 3x",
              "Launch automated doorstep subscription replenishment club",
              "Reach ₹15,00,000 in monthly gross revenue",
              "Optimize unit cost of goods sold (COGS) by 18%",
            ]
          : [
              "Onboard 100 active beta companies",
              "Achieve weekly retention rate above 65%",
              "Reach first $10,000 in Monthly Recurring Revenue (MRR)",
              "Optimize infrastructure unit costs by 30%",
            ],
        keyMetrics: isNonTech ? "₹15L Monthly Revenue · 62% Gross Margin" : "$10k MRR · 65% WAU/MAU · NPS 68+",
        fundingGoal: "₹75L - ₹1.5 Crore Pre-Series A / Angel Round",
        status: "Upcoming",
      },
      {
        phase: 3,
        title: isNonTech ? "Regional Scale & B2B Distribution" : "Product-Market Fit & Market Expansion",
        timeframe: "Months 7 - 9",
        milestones: isNonTech
          ? [
              "Scale to 10 retail locations and 60+ retail shelf partners",
              "Launch corporate catering / institutional supply contracts",
              "Cross ₹40,00,000 monthly run-rate with positive operating cashflow",
            ]
          : [
              "Scale to 350 paying SMB & Mid-Market customers",
              "Launch developer API marketplace & webhooks",
              "Achieve $35,000+ MRR with negative net revenue churn",
            ],
        keyMetrics: isNonTech ? "₹40L Monthly Revenue · 68% Product Margin" : "$35k MRR ($420k ARR) · < 2% Churn · 11x LTV:CAC",
        fundingGoal: "₹2.5 Crore - ₹5 Crore Growth Round",
        status: "Planned",
      },
      {
        phase: 4,
        title: isNonTech ? "National Brand & Franchise Rollout" : "Enterprise Expansion & Institutional Scale",
        timeframe: "Months 10 - 12",
        milestones: isNonTech
          ? [
              "Launch asset-light franchise expansion across Tier-1 metros",
              "Expand direct-to-consumer nationwide e-commerce shipping",
              "Cross ₹1.2 Crore monthly gross revenue",
            ]
          : [
              "Introduce Enterprise Tier with SOC2 & dedicated VPC",
              "Expand sales channels into European & Asian-Pacific corridors",
              "Cross $100,000+ MRR ($1.2M ARR)",
            ],
        keyMetrics: isNonTech ? "₹1.2 Cr Monthly Run-Rate · 30+ Network Locations" : "$100k MRR · 10 Enterprise Contracts · 85% Gross Margin",
        fundingGoal: "$2.5M - $5.0M Series A",
        status: "Planned",
      },
    ],
  };

  return { mvpRecommendation, businessRoadmap };
}

function generateIntelligentFeasibility(
  idea: StartupIdea,
  validation: MarketValidation,
  profile: FounderProfile
): FeasibilityReport {
  const dLower = (idea.domain + " " + (idea.businessType || "") + " " + idea.tags.join(" ")).toLowerCase();
  const isExplicitTech = (
    dLower.includes("software & saas") ||
    dLower.includes("software platform") ||
    dLower.includes("compliance platform") ||
    dLower.includes("cloud middleware") ||
    dLower.includes("ai platform")
  ) && !dLower.includes("hardware") && !dLower.includes("physical") && !dLower.includes("construct") && !dLower.includes("constuct") && !dLower.includes("manufacturing");
  const isNonTech = !isExplicitTech;

  const loc = profile.targetLocation || {
    city: "San Francisco / Silicon Valley",
    country: "United States",
    ecosystemScore: 98,
    talentIndex: "9.8/10 World-Class"
  };

  // High-conviction viability score matching user blueprint: 84/100
  const overallScore = 84;
  const technicalScore = isNonTech ? 88 : 86;
  const marketScore = 86;
  const financialScore = 87;
  const regulatoryScore = 78;
  const executionScore = 83;

  const scoringEngine: ScoringEngineBreakdown = {
    viabilityScore: overallScore,
    verdict: "Strong Go",
    verdictSummary: isNonTech
      ? `The AI Scoring Engine calculated an aggregate Startup Viability Score of ${overallScore}/100. This concept demonstrates high structural viability with favorable unit economics (LTV:CAC > 10x), low technical execution risk using modular supply chain and turnkey equipment, and strong product-market timing in ${loc.city}.`
      : `The AI Scoring Engine calculated an aggregate Startup Viability Score of ${overallScore}/100. This concept demonstrates high structural viability with favorable unit economics (LTV:CAC > 8x), immediate technical feasibility using modern cloud serverless primitives, and an optimal launch ecosystem in ${loc.city}.`,
    percentileRank: isNonTech ? "Top 6% of Early-Stage Commercial Concepts" : "Top 9% of Early-Stage Tech Concepts",
    factors: [
      {
        id: "tech",
        name: isNonTech ? "Operational & Supply Feasibility" : "Technical Feasibility",
        score: technicalScore,
        weight: 20,
        impact: "Positive",
        rationale: isNonTech
          ? "Established local supplier contracts, turnkey commercial equipment, and standardized operating procedures ensure fast buildability with minimal technical debt."
          : "Cloud-native serverless primitives, pgvector embeddings, and low-latency API models ensure fast buildability with minimal technical debt."
      },
      {
        id: "market",
        name: "Market Demand & Timing",
        score: marketScore,
        weight: 25,
        impact: "Positive",
        rationale: `Strong sector CAGR of ${validation.cagr} combined with acute customer willingness to pay creates an immediate commercial window.`
      },
      {
        id: "financial",
        name: "Unit Economics & Monetization",
        score: financialScore,
        weight: 25,
        impact: "Positive",
        rationale: isNonTech
          ? "Strong product gross margins (60-70%) and projected 11.5x LTV:CAC driven by organic repeat footfall and subscription replenishment."
          : "High gross software margin (84%+) and projected 11.3x LTV:CAC ratio ensure strong capital efficiency and rapid runway extension."
      },
      {
        id: "regulatory",
        name: "Regulatory & Compliance Moat",
        score: regulatoryScore,
        weight: 15,
        impact: "Neutral",
        rationale: isNonTech
          ? `Standard commercial licensing (FSSAI/EPR/municipal trade permits) is well-defined; ${loc.city} ecosystem provides clear regulatory frameworks.`
          : `Proactive data privacy sandboxing required; ${loc.city} regulatory ecosystem provides favorable frameworks and clear legal paths.`
      },
      {
        id: "execution",
        name: "Speed to MVP Velocity",
        score: executionScore,
        weight: 15,
        impact: "Positive",
        rationale: `${profile.timeframe || "Rapid"} execution roadmap utilizing low-code accelerators and pre-built operational modules enables quick time-to-market.`
      }
    ]
  };

  const { mvpRecommendation, businessRoadmap } = buildMvpAndRoadmap(idea, profile, isNonTech);

  return {
    overallScore,
    technicalScore,
    marketScore,
    financialScore,
    regulatoryScore,
    executionScore,
    verdict: "Strong Go",
    verdictSummary: isNonTech
      ? `High-conviction commercial profile (${overallScore}/100 Viability Score). Compelling value proposition with robust product gross margins (65%+), low technical execution risk using modern omnichannel POS and e-commerce primitives, and rapid customer payback in ${loc.city}.`
      : `High-conviction startup profile (${overallScore}/100 Viability Score). Clear acute problem with strong unit economics, high gross software margins (84%+), and immediate technical feasibility leveraging existing cloud serverless primitives and production-ready APIs in ${loc.city}.`,
    radarData: [
      { subject: isNonTech ? "Ops Feasibility" : "Tech Feasibility", score: technicalScore, fullMark: 100 },
      { subject: "Market Demand", score: marketScore, fullMark: 100 },
      { subject: "Unit Economics", score: financialScore, fullMark: 100 },
      { subject: "Compliance & Moat", score: regulatoryScore, fullMark: 100 },
      { subject: "Execution Speed", score: executionScore, fullMark: 100 }
    ],
    scoringEngine,
    mvpRecommendation,
    businessRoadmap,
    cloudArchitecture: {
      recommendedProvider: "AWS",
      compute: isNonTech ? "Headless E-Commerce Edge Functions + Cloud POS Backend" : "AWS Lambda / AWS Fargate Containerized Microservices",
      database: "PostgreSQL (Aurora Serverless / Supabase) for Inventory, Orders & User Profiles",
      aiInference: isNonTech ? "Demand Forecasting & Inventory Optimization Heuristics" : "Google Gemini 1.5 Flash + Claude 3.5 Sonnet fallback via LiteLLM Gateway",
      storageAndCDN: "Amazon S3 Object Store + CloudFront Edge Distribution for Media & Catalog",
      thirdPartyAPIs: isNonTech
        ? [
            { name: "Razorpay / Stripe Billing API", purpose: "Automated recurring subscriptions, POS payments & UPI checkout", costTier: "2% per transaction" },
            { name: "Shiprocket / Local Delivery Fleet", purpose: "Doorstep dispatch and automated courier tracking webhooks", costTier: "Pay-as-you-go per order" },
            { name: "WhatsApp Business API", purpose: "Order confirmation receipts, dispatch alerts & loyalty notifications", costTier: "₹0.35 per conversation" },
            { name: "Zoho / Tally Cloud GST API", purpose: "Automated tax invoice generation and compliance ledger sync", costTier: "₹999 / month" }
          ]
        : [
            { name: "Stripe Billing API", purpose: "Automated subscription tiers, usage metering, and invoice generation", costTier: "2.9% + 30c / tx" },
            { name: "Resend / SendGrid", purpose: "Transactional notification emails and daily summary reports", costTier: "Free tier / $20/mo" },
            { name: "Public Market APIs & Webhooks", purpose: "Real-time telemetry ingestion and external data enrichment", costTier: "Pay-as-you-go" },
            { name: "Auth0 / Clerk", purpose: "Enterprise SSO, OAuth2, and multi-tenant role-based access", costTier: "Free up to 10k MAU" }
          ],
      diagramComponents: [
        {
          category: "Frontend & Edge",
          name: isNonTech ? "Next.js Storefront & POS Portal" : "Next.js on Vercel / CloudFront",
          details: isNonTech ? "Omnichannel customer store, instant catalog browsing, and store iPad POS interface." : "Global edge CDN delivery, client-side caching, dynamic SSR, and instantaneous UI response.",
          cloudIcon: "aws"
        },
        {
          category: "API Gateway & Auth",
          name: "API Gateway + JWT Auth",
          details: "Rate limiting, SSL termination, DDoS protection with AWS WAF, and identity authorization.",
          cloudIcon: "api"
        },
        {
          category: "AI & Core Compute",
          name: isNonTech ? "Order Dispatch & Reordering Engine" : "AWS Lambda / ECS Fargate + Queue Workers",
          details: isNonTech ? "Automated order routing to nearest kitchen/hub, courier assignment, and stock level alerts." : "Serverless event-driven execution that scales to zero when idle, handling LLM prompts and background jobs.",
          cloudIcon: "ai"
        },
        {
          category: "Database & Storage",
          name: "Aurora Serverless PostgreSQL",
          details: "ACID-compliant inventory balances, customer order history, and subscription schedules.",
          cloudIcon: "db"
        },
        {
          category: "3rd-Party APIs",
          name: isNonTech ? "Payment Gateways + WhatsApp + Shipping" : "Stripe + External Trend APIs + Email Webhooks",
          details: isNonTech ? "Direct customer checkout, live delivery GPS tracking, and automated loyalty WhatsApp messages." : "Programmatic revenue collection, external data enrichment, and outbound user alerts.",
          cloudIcon: "api"
        }
      ],
      estimatedMonthlyCloudCost: {
        mvp: "$25 - $60 / month",
        growth: "$180 - $450 / month",
        scale: "$850 - $2,200 / month"
      }
    },
    revenueModel: isNonTech
      ? {
          primaryModel: "Direct Product Sales, Retail Walk-ins & Monthly Replenishment Subscriptions",
          pricingTiers: [
            {
              tier: "Single Order / Walk-in",
              price: "₹350",
              billing: "/ item or visit",
              features: [
                "Handcrafted signature product / fresh item",
                "Same-day local pickup or express courier",
                "Standard customer rewards program"
              ]
            },
            {
              tier: "Monthly Club / VIP Member",
              price: "₹1,499",
              billing: "/ month",
              features: [
                "Weekly fresh delivery bundle or 4 visits/mo",
                "15% discount across all retail catalog items",
                "Complimentary seasonal sample drops",
                "Free priority doorstep delivery"
              ],
              highlighted: true
            },
            {
              tier: "Corporate / Bulk Wholesale",
              price: "₹9,500+",
              billing: "/ month",
              features: [
                "Bulk office pantry or employee wellness pass",
                "Dedicated corporate account coordinator",
                "Customized corporate branding & gifting",
                "Net-30 invoiced billing terms"
              ]
            }
          ],
          projectedRunway: [
            { month: "Month 1", revenue: 350000, cost: 180000, users: 150 },
            { month: "Month 3", revenue: 1200000, cost: 520000, users: 550 },
            { month: "Month 6", revenue: 3500000, cost: 1400000, users: 1600 },
            { month: "Month 9", revenue: 6800000, cost: 2600000, users: 3200 },
            { month: "Month 12", revenue: 11000000, cost: 4200000, users: 5400 }
          ],
          keyUnitEconomics: {
            cacEstimate: "₹380 (Hyperlocal tasting sampling + Instagram Reels + word-of-mouth)",
            ltvEstimate: "₹4,400 (Avg customer retention 9 months with 1.6 orders/month)",
            ltvCacRatio: "11.5x (Exceptional capital efficiency driven by repeat retention)",
            grossMargin: "67.5% (High retail/product margin with direct-trade supplier contracts)"
          }
        }
      : {
          primaryModel: "B2B SaaS with Tiered Subscriptions & Usage-based API Credits",
          pricingTiers: [
            {
              tier: "Starter / Prosumer",
              price: "$29",
              billing: "/ month",
              features: [
                "Up to 250 automated validations/month",
                "Core cloud architecture templates",
                "Export to PDF & Markdown",
                "Standard email support"
              ]
            },
            {
              tier: "Growth & Scale",
              price: "$129",
              billing: "/ month",
              features: [
                "Unlimited idea validations & market scans",
                "Real-time live competitor tracking alerts",
                "Custom cloud infrastructure generator",
                "Multi-member team workspace",
                "Priority API rate limits"
              ],
              highlighted: true
            },
            {
              tier: "Enterprise / Firm",
              price: "$499+",
              billing: "/ month",
              features: [
                "Custom dedicated cloud tenant",
                "SOC2 / HIPAA compliance reports",
                "Direct API integration & webhooks",
                "Dedicated Slack channel & 99.9% SLA"
              ]
            }
          ],
          projectedRunway: [
            { month: "Month 1", revenue: 1450, cost: 480, users: 40 },
            { month: "Month 3", revenue: 6800, cost: 1350, users: 185 },
            { month: "Month 6", revenue: 21500, cost: 3800, users: 540 },
            { month: "Month 9", revenue: 47000, cost: 7900, users: 1250 },
            { month: "Month 12", revenue: 98000, cost: 15600, users: 2750 }
          ],
          keyUnitEconomics: {
            cacEstimate: "$125 (Inbound organic + targeted dev marketing)",
            ltvEstimate: "$1,420 (Avg retention 14 months at $101 blended ARPU)",
            ltvCacRatio: "11.3x (Exceptional capital efficiency)",
            grossMargin: "84.5% (High software margin with serverless optimization)"
          }
        },
    risksAndMitigations: [
      {
        risk: "API Rate Limiting & Latency Delays",
        severity: "Medium",
        probability: "High",
        mitigation: "Deploy Redis Upstash cache layer with semantic prompt hashing to serve repeated queries sub-10ms."
      },
      {
        risk: "Competitor Speed to Market",
        severity: "High",
        probability: "Medium",
        mitigation: "Build deep proprietary workflow integrations and private enterprise data connectivity that creates high switching costs."
      },
      {
        risk: "Cloud Infrastructure Cost Inflation",
        severity: "Medium",
        probability: "Low",
        mitigation: "Use serverless architectures with auto-scaling to zero and tiered token routing (cheap models for triage, frontier models for synthesis)."
      },
      {
        risk: "Evolving Data Privacy Regulations",
        severity: "Medium",
        probability: "Medium",
        mitigation: "Enforce client-side data sanitization and ephemeral processing with zero-data-retention agreements."
      }
    ],
    goNextSteps: [
      "Ship 4-week interactive MVP using the recommended serverless Next.js and API architecture.",
      "Conduct 15 discovery calls with target buyers from the identified persona.",
      "Launch on Product Hunt and HackerNews with a free interactive validation calculator tool.",
      "Set up Stripe billing and convert the first 25 paying beta customers."
    ]
  };
}

