// Automated verification script for AI + API + Cloud Startup Generator & Validator

async function runTests() {
  console.log("=== STARTING AUTOMATED ENDPOINT VERIFICATION ===");
  const baseUrl = "http://localhost:3000";

  // Test 1: Check root page
  console.log("\n[Test 1] Testing Root Page (GET /)...");
  const rootRes = await fetch(`${baseUrl}/`);
  console.log(`Root status: ${rootRes.status} ${rootRes.statusText}`);
  if (rootRes.status !== 200) {
    throw new Error(`Root page returned non-200: ${rootRes.status}`);
  }
  const rootHtml = await rootRes.text();
  console.log(`✓ Root page delivered HTML (${rootHtml.length} bytes), contains title indicator: ${rootHtml.includes("StartupGen")}`);

  // Test 2: Generate Ideas API
  console.log("\n[Test 2] Testing /api/generate-ideas...");
  const mockProfile = {
    domains: ["AI Agents", "Fintech"],
    skills: ["Full-Stack Dev", "Machine Learning / AI"],
    targetAudience: "Mid-Market SMBs",
    budget: "< $5,000 (Bootstrapped)",
    timeframe: "1-3 Months Pilot Launch",
    customContext: "Autonomous financial audit and reconciliation agent for SaaS companies."
  };

  const ideasRes = await fetch(`${baseUrl}/api/generate-ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: mockProfile })
  });

  if (!ideasRes.ok) {
    throw new Error(`/api/generate-ideas failed with status ${ideasRes.status}`);
  }
  const ideasData = await ideasRes.json();
  console.log(`✓ Generated ${ideasData.ideas.length} ideas.`);
  const firstIdea = ideasData.ideas[0];
  console.log(`  Selected Idea: "${firstIdea.name}" - ${firstIdea.tagline}`);
  console.log(`  Feasibility Score: ${firstIdea.initialFeasibilityScore}/100`);

  // Test 3: Validate Market API
  console.log("\n[Test 3] Testing /api/validate-market...");
  const valRes = await fetch(`${baseUrl}/api/validate-market`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: firstIdea, profile: mockProfile })
  });

  if (!valRes.ok) {
    throw new Error(`/api/validate-market failed with status ${valRes.status}`);
  }
  const valData = await valRes.json();
  const validation = valData.validation;
  console.log(`✓ Market Validation Received:`);
  console.log(`  TAM: ${validation.tam.value} | SAM: ${validation.sam.value} | SOM: ${validation.som.value} | CAGR: ${validation.cagr}`);
  console.log(`  Competitors Analyzed: ${validation.competitors.length}`);
  console.log(`  Real-Time Trend Signals: ${validation.realTimeTrends.length}`);
  validation.realTimeTrends.forEach((t, idx) => {
    console.log(`    [Trend ${idx+1}] ${t.source}: "${t.headline}" (${t.sentiment})`);
  });

  // Test 4: Cloud Architecture & Feasibility Blueprint
  console.log("\n[Test 4] Testing /api/cloud-blueprint...");
  const cloudRes = await fetch(`${baseUrl}/api/cloud-blueprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea: firstIdea, validation, profile: mockProfile })
  });

  if (!cloudRes.ok) {
    throw new Error(`/api/cloud-blueprint failed with status ${cloudRes.status}`);
  }
  const cloudData = await cloudRes.json();
  const feasibility = cloudData.feasibility;
  console.log(`✓ Cloud Blueprint & Feasibility Report Received:`);
  console.log(`  Overall Score: ${feasibility.overallScore}/100 | Verdict: ${feasibility.verdict}`);
  console.log(`  Recommended Cloud Provider: ${feasibility.cloudArchitecture.recommendedProvider}`);
  console.log(`  Monthly Cloud Run-Rate (MVP): ${feasibility.cloudArchitecture.estimatedMonthlyCloudCost.mvp}`);
  console.log(`  Unit Economics -> CAC: ${feasibility.revenueModel.keyUnitEconomics.cacEstimate}, LTV: ${feasibility.revenueModel.keyUnitEconomics.ltvEstimate}, Ratio: ${feasibility.revenueModel.keyUnitEconomics.ltvCacRatio}`);
  console.log(`  Pricing Tiers: ${feasibility.revenueModel.pricingTiers.length}`);
  console.log(`  Identified Risks: ${feasibility.risksAndMitigations.length}`);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! PLATFORM IS FULLY OPERATIONAL ===");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
