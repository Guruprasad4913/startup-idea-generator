import { StartupProject, User } from "@/types";

const VAULT_STORAGE_KEY_LEGACY = "startup_validator_cloud_vault_v1";

export function getVaultStorageKey(username?: string): string {
  if (username && username.trim()) {
    return `startup_validator_vault_user_${username.trim().toLowerCase()}`;
  }
  return VAULT_STORAGE_KEY_LEGACY;
}

export function getSavedProjects(username?: string): StartupProject[] {
  if (typeof window === "undefined") return [];
  try {
    const cleanUser = username?.trim().toLowerCase();
    const userKey = getVaultStorageKey(cleanUser);
    const raw = localStorage.getItem(userKey);

    let projects: StartupProject[] = [];
    if (raw) {
      try {
        projects = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse user vault", err);
      }
    }

    // If cleanUser is provided, filter strictly to this user
    if (cleanUser) {
      // Also check legacy key if user vault is empty, and migrate this user's projects only
      if (projects.length === 0) {
        const legacyRaw = localStorage.getItem(VAULT_STORAGE_KEY_LEGACY);
        if (legacyRaw) {
          try {
            const legacyList: StartupProject[] = JSON.parse(legacyRaw);
            const userOwned = legacyList.filter(
              (p) => p.username && p.username.toLowerCase().trim() === cleanUser
            );
            if (userOwned.length > 0) {
              localStorage.setItem(userKey, JSON.stringify(userOwned));
              return userOwned;
            }
          } catch (e) {
            // ignore
          }
        }
      }
      return projects.filter(
        (p) => p.username && p.username.toLowerCase().trim() === cleanUser
      );
    }

    return projects;
  } catch (e) {
    console.error("Failed to load saved projects from vault", e);
    return [];
  }
}

export async function saveProjectToVault(
  project: StartupProject,
  currentUser?: User | null
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // Determine active username/userId
    let activeUsername = project.username || currentUser?.username;
    let activeUserId = project.userId || currentUser?.id || currentUser?._id;

    // Fallback to localStorage session if not provided in arguments
    if (!activeUsername) {
      try {
        const rawUser = localStorage.getItem("startupgen_auth_user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u?.username) activeUsername = u.username;
          if (u?.id || u?._id) activeUserId = u.id || u._id;
        }
      } catch (e) {
        // ignore
      }
    }

    const enrichedProject: StartupProject = {
      ...project,
      username: activeUsername || "founder",
      userId: activeUserId || `usr-${activeUsername || "founder"}`,
    };

    // 1. Instant local persistence in user-scoped key
    const userKey = getVaultStorageKey(enrichedProject.username);
    const existing = getSavedProjects(enrichedProject.username);
    const filtered = existing.filter((p) => p.id !== enrichedProject.id);
    const updated = [enrichedProject, ...filtered];
    localStorage.setItem(userKey, JSON.stringify(updated));

    // 2. Persist to MongoDB backend asynchronously with user tagging
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: enrichedProject,
        username: enrichedProject.username,
        userId: enrichedProject.userId,
      }),
    }).catch((err) => {
      console.warn("MongoDB background sync note:", err?.message || err);
    });
  } catch (e) {
    console.error("Failed to save project to vault", e);
  }
}

export async function deleteProjectFromVault(
  id: string,
  currentUser?: User | null
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    let username = currentUser?.username;
    let userId = currentUser?.id || currentUser?._id;
    let role = currentUser?.role || "user";

    if (!username) {
      try {
        const rawUser = localStorage.getItem("startupgen_auth_user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          username = parsed.username;
          userId = parsed.id || parsed._id;
          role = parsed.role || "user";
        }
      } catch (e) {
        // ignore
      }
    }

    // 1. Instant local removal from user key
    if (username) {
      const userKey = getVaultStorageKey(username);
      const existing = getSavedProjects(username);
      const updated = existing.filter((p) => p.id !== id);
      localStorage.setItem(userKey, JSON.stringify(updated));
    }

    // Also remove from legacy key if present
    const legacyRaw = localStorage.getItem(VAULT_STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw);
        const updatedLegacy = legacy.filter((p: StartupProject) => p.id !== id);
        localStorage.setItem(VAULT_STORAGE_KEY_LEGACY, JSON.stringify(updatedLegacy));
      } catch (e) {
        // ignore
      }
    }

    // 2. Delete from MongoDB backend asynchronously
    const query = new URLSearchParams({
      id,
      username: username || "",
      userId: userId || "",
      role,
    });
    fetch(`/api/projects?${query.toString()}`, {
      method: "DELETE",
    }).catch((err) => {
      console.warn("MongoDB delete sync note:", err?.message || err);
    });
  } catch (e) {
    console.error("Failed to delete project from vault", e);
  }
}

export async function syncVaultWithDatabase(
  currentUser?: User | null
): Promise<StartupProject[]> {
  if (typeof window === "undefined") return [];
  try {
    let user = currentUser;
    if (!user) {
      try {
        const raw = localStorage.getItem("startupgen_auth_user");
        if (raw) {
          user = JSON.parse(raw);
        }
      } catch (e) {
        // ignore
      }
    }

    if (!user || (!user.username && user.role !== "admin")) {
      return [];
    }

    const params = new URLSearchParams();
    if (user.username) params.set("username", user.username);
    if (user.id || user._id) params.set("userId", user.id || user._id || "");
    if (user.role) params.set("role", user.role);

    const res = await fetch(`/api/projects?${params.toString()}`);
    if (!res.ok) return getSavedProjects(user.username);

    const data = await res.json();
    if (data.success && Array.isArray(data.projects)) {
      const local = getSavedProjects(user.username);
      const projectMap = new Map<string, StartupProject>();
      local.forEach((p) => projectMap.set(p.id, p));
      data.projects.forEach((p: StartupProject) => projectMap.set(p.id, p));

      const merged = Array.from(projectMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const userKey = getVaultStorageKey(user.username);
      localStorage.setItem(userKey, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn("Could not sync with MongoDB database, using local cache:", err);
  }
  return currentUser?.username ? getSavedProjects(currentUser.username) : [];
}

export function exportProjectAsMarkdown(project: StartupProject): string {
  const { selectedIdea, validation, feasibility, founderProfile } = project;
  const loc = project.targetLocation || founderProfile.targetLocation;

  return `# ${selectedIdea.name} — Institutional Startup Validation Report
*Generated by AI + API + Cloud Startup Validator on ${new Date(project.createdAt).toLocaleDateString()}*

> **Tagline:** ${selectedIdea.tagline}
> **Domain:** ${selectedIdea.domain} | **Interests:** ${founderProfile.interests?.join(", ") || "AI & Cloud SaaS"}
> **Skills:** ${founderProfile.skills.join(", ")} | **Budget:** ${founderProfile.budget}
> **Founder Email:** ${founderProfile.founderEmail || "Confidential"} | **Launch Ecosystem:** ${loc ? `${loc.city}, ${loc.country} (Ecosystem Score: ${loc.ecosystemScore}/100)` : "Global"}
> **Startup Viability Score:** **${feasibility.overallScore}/100 (${feasibility.verdict})**

---

## 1. Executive Summary & Problem-Solution
- **Problem Statement:** ${selectedIdea.problemStatement}
- **Solution Overview:** ${selectedIdea.solution}
- **Target Persona:** ${selectedIdea.targetPersona.title}
- **Core Pain Points:**
${selectedIdea.targetPersona.painPoints.map((p) => `  - ${p}`).join("\n")}
- **Willingness to Pay:** ${selectedIdea.targetPersona.willingnessToPay}
- **Why Now / Catalyst:** ${selectedIdea.whyNow}
- **Innovation Moat:** ${selectedIdea.innovationMoat}

---

## 2. Market Sizing & Opportunity (TAM / SAM / SOM)
- **TAM (Total Addressable Market):** ${validation.tam.value} — *${validation.tam.description}*
- **SAM (Serviceable Addressable Market):** ${validation.sam.value} — *${validation.sam.description}*
- **SOM (Serviceable Obtainable Market):** ${validation.som.value} — *${validation.som.description}*
- **Market Growth (CAGR - Compound Annual Growth Rate):** ${validation.cagr}

### Market Dynamics Overview
${validation.marketSummary}

${validation.regionalMarketDynamics ? `### Regional Geographic Ecosystem\n${validation.regionalMarketDynamics}\n` : ""}

---

## 3. Competitive Intelligence & Moat Analysis
| Competitor | Type | Strengths | Weaknesses | Our Differentiation | Funding / Scale |
|---|---|---|---|---|---|
${validation.competitors
  .map(
    (c) =>
      `| **${c.name}** | ${c.type} | ${c.strengths} | ${c.weaknesses} | **${c.ourDifferentiation}** | ${c.fundingOrScale} |`
  )
  .join("\n")}

${validation.competitorComparisonMatrix ? `
### Feature Comparison Battlecard
| Key Capability | ${selectedIdea.name} (Our Product) | ${validation.competitorComparisonMatrix.competitors.map((c) => c.name.split("(")[0].trim()).join(" | ")} |
|---|---|${validation.competitorComparisonMatrix.competitors.map(() => "---").join("|")}|
${validation.competitorComparisonMatrix.features
  .map(
    (f) =>
      `| ${f} | **Supported** | ${validation.competitorComparisonMatrix?.competitors
        .map((c) => (typeof c.scores[f] === "boolean" ? (c.scores[f] ? "Yes" : "No") : c.scores[f]))
        .join(" | ")} |`
  )
  .join("\n")}
` : ""}

---

## 4. Target User Analysis & Buying Journey
${validation.targetUserAnalysis ? `
- **Primary Persona:** ${validation.targetUserAnalysis.personaName} (${validation.targetUserAnalysis.roleTitle})
- **Organization Type:** ${validation.targetUserAnalysis.organizationType}
- **Willingness to Pay Range:** ${validation.targetUserAnalysis.willingnessToPayRange}

### Acute Pain Points
${validation.targetUserAnalysis.acutePainPoints.map((p) => `- ${p}`).join("\n")}

### Buying Trigger Moments (Purchase Catalysts)
${validation.targetUserAnalysis.buyingTriggerMoments.map((t) => `- ${t}`).join("\n")}

### Customer Acquisition Channels
${validation.targetUserAnalysis.acquisitionChannels.map((c) => `- **${c.channel}**: ${c.effectiveness} ROI (Estimated CAC: ${c.estimatedCac})`).join("\n")}

### Adoption Friction & Retention Drivers
- **Adoption Barrier:** ${validation.targetUserAnalysis.adoptionFriction}
- **Retention Drivers:**
${validation.targetUserAnalysis.retentionDrivers.map((r) => `  - ${r}`).join("\n")}
` : "Standard profile aligned with target persona."}

---

## 5. Financial & Revenue Model
- **Primary Revenue Model:** ${feasibility.revenueModel.primaryModel}
- **CAC (Customer Acquisition Cost):** ${feasibility.revenueModel.keyUnitEconomics.cacEstimate}
- **LTV (Customer Lifetime Value):** ${feasibility.revenueModel.keyUnitEconomics.ltvEstimate}
- **LTV : CAC Ratio (Lifetime Value to Acquisition Cost):** ${feasibility.revenueModel.keyUnitEconomics.ltvCacRatio}
- **Gross Margin:** ${feasibility.revenueModel.keyUnitEconomics.grossMargin}

### Pricing Tiers
${feasibility.revenueModel.pricingTiers
  .map(
    (tier) =>
      `### ${tier.tier} — ${tier.price} ${tier.billing}\n${tier.features
        .map((f) => `- ${f}`)
        .join("\n")}`
  )
  .join("\n\n")}

---

## 6. Technical Feasibility & Cloud Architecture
- **Overall Feasibility Score:** ${feasibility.overallScore} / 100
  - Technical Feasibility: ${feasibility.technicalScore}/100
  - Market Demand: ${feasibility.marketScore}/100
  - Financial Unit Economics: ${feasibility.financialScore}/100
  - Regulatory & Compliance: ${feasibility.regulatoryScore}/100
  - Speed to MVP: ${feasibility.executionScore}/100

### Cloud Infrastructure Blueprint
- **Recommended Cloud Provider:** ${feasibility.cloudArchitecture.recommendedProvider}
- **Compute Tier:** ${feasibility.cloudArchitecture.compute}
- **Database & Storage:** ${feasibility.cloudArchitecture.database}
- **AI Inference Pipeline:** ${feasibility.cloudArchitecture.aiInference}
- **Global CDN & Edge:** ${feasibility.cloudArchitecture.storageAndCDN}

### Cloud Cost Projections
- **MVP (Minimum Viable Product) Stage:** ${feasibility.cloudArchitecture.estimatedMonthlyCloudCost.mvp}
- **Growth Stage:** ${feasibility.cloudArchitecture.estimatedMonthlyCloudCost.growth}
- **Scale Stage:** ${feasibility.cloudArchitecture.estimatedMonthlyCloudCost.scale}

### Third-Party APIs Integrated
${feasibility.cloudArchitecture.thirdPartyAPIs
  .map((api) => `- **${api.name}**: ${api.purpose} (*${api.costTier}*)`)
  .join("\n")}

---

## 7. AI Scoring Engine Breakdown
${feasibility.scoringEngine ? `
- **Startup Viability Score:** ${feasibility.scoringEngine.viabilityScore} / 100
- **Verdict:** **${feasibility.scoringEngine.verdict}**
- **Percentile Ranking:** ${feasibility.scoringEngine.percentileRank}

| Evaluation Dimension | Score | Weight | Impact | Rationale |
|---|---|---|---|---|
${feasibility.scoringEngine.factors
  .map(
    (f) =>
      `| **${f.name}** | ${f.score}% | ${f.weight}% | ${f.impact} | ${f.rationale} |`
  )
  .join("\n")}
` : `Viability Score: ${feasibility.overallScore}/100`}

---

## 8. MVP (Minimum Viable Product) Recommendation & Execution Sprint Plan
${feasibility.mvpRecommendation ? `
- **MVP Scope:** ${feasibility.mvpRecommendation.mvpName} (${feasibility.mvpRecommendation.timelineWeeks} Weeks to Launch)
- **Core Value Proposition:** ${feasibility.mvpRecommendation.coreValueProposition}

### Must-Have Core Features (P0)
${feasibility.mvpRecommendation.featureBacklog.mustHave.map((f) => `- [x] ${f}`).join("\n")}

### Phased Execution Sprint Plan
${feasibility.mvpRecommendation.fourWeekSprintPlan
  .map(
    (s) =>
      `#### ${s.periodLabel || `Week ${s.week}`}${s.daysLabel ? ` (${s.daysLabel})` : ""}: ${s.title}\n- **Deliverable:** ${s.deliverable}\n${s.goals
        .map((g) => `  - ${g}`)
        .join("\n")}`
  )
  .join("\n\n")}
` : ""}

---

## 9. 12-Month Business Roadmap
${feasibility.businessRoadmap ? `
${feasibility.businessRoadmap.phases
  .map(
    (p) =>
      `### Phase ${p.phase}: ${p.title} (${p.timeframe}) — Status: ${p.status}\n- **Funding Target:** ${p.fundingGoal}\n- **Success KPIs (Key Performance Indicators):** ${p.keyMetrics}\n- **Milestones:**\n${p.milestones
        .map((m) => `  - [ ] ${m}`)
        .join("\n")}`
  )
  .join("\n\n")}
` : ""}

---

## 10. Risk Analysis & Mitigation Matrix
| Risk Vector | Probability | Severity | Mitigation Strategy |
|---|---|---|---|
${feasibility.risksAndMitigations
  .map(
    (r) =>
      `| **${r.risk}** | ${r.probability} | ${r.severity} | ${r.mitigation} |`
  )
  .join("\n")}

---

## 11. Immediate Founder Next Steps
${feasibility.goNextSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
`;
}
