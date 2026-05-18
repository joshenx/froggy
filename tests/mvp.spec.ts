import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/testing/reset-mvp");
});

test.beforeEach(async ({ page }) => {
  await page.goto("/login?next=/questions");
  await page.getByRole("button", { name: /Priya Raman/i }).click();
  await expect(page).toHaveURL("/questions");
});

test("hiring manager can build a role flow, create a bank question, and use the stacked builder to save draft changes", async ({
  page,
}) => {
  await page.goto("/roles");

  await expect(page.getByRole("heading", { name: /Role-specific interview flows/i })).toBeVisible();

  await page.getByLabel(/Role/i).fill("Platform Engineer");
  await page.getByLabel(/Flow name/i).fill("Platform Loop");
  await page.getByLabel(/^Stages$/i).fill("Technical screen\nSystems design\nHiring manager");
  await page.getByRole("button", { name: /Create role and flow/i }).click();

  await expect(page).toHaveURL(/\/roles\/.+\/flow$/);
  const flowUrl = page.url();
  await expect(page.getByRole("heading", { name: "Platform Loop" })).toBeVisible();
  await expect(page.getByText(/Systems design/i)).toBeVisible();

  await page.getByRole("button", { name: /Add stage/i }).click();
  const stageCards = page.locator('[data-testid^="stage-card-"]');
  await expect(stageCards).toHaveCount(4);
  const valuesStage = stageCards.last();
  await valuesStage.locator('input[aria-label^="Stage name"]').fill("Values screen");

  await page.goto(flowUrl.replace(/\/flow$/, "/questions"));
  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();

  await page.getByRole("link", { name: /Add question/i }).click();
  await expect(page).toHaveURL(/\/roles\/.+\/questions\/new$/);
  await expect(page.getByRole("heading", { name: /New question/i })).toBeVisible();

  const prompt = "Resolve a reliability-versus-launch tradeoff.";
  const flowTitle = "Resolve a reliability-versus-launch tradeoff";
  await page.getByLabel(/^Question$/i).fill(prompt);
  await page.getByLabel(/Collection/i).fill("Leadership");
  await page.getByRole("button", { name: /^ownership$/i }).click();
  await page.getByRole("button", { name: /^communication$/i }).click();
  await page.getByRole("button", { name: /^Stripe$/i }).click();
  await page.getByRole("button", { name: /^L6\+ IC$/i }).click();
  await page.getByRole("button", { name: "4", exact: true }).click();
  await page.getByLabel(/Expected duration/i).fill("25");
  await page.getByLabel(/Why this question/i).fill(
    "Tests how candidates balance principles, urgency, and stakeholder clarity.",
  );
  await page.getByLabel(/Anchor 1/i).fill("Defaults to escalation without framing the tradeoff.");
  await page.getByLabel(/Anchor 3/i).fill("Balances risks but needs prompting to align stakeholders.");
  await page.getByLabel(/Anchor 5/i).fill("Frames the tradeoff crisply, sequences mitigation, and keeps everyone aligned.");
  await page.getByLabel(/Follow-up 1/i).fill("How would you keep partner teams aligned?");
  await page.getByRole("button", { name: /Add to bank/i }).click();

  await expect(page).toHaveURL(/\/roles\/.+\/questions$/);
  await expect(page.getByTestId("question-detail-title")).toHaveText(prompt);
  await expect(page.getByTestId("question-company-company_stripe")).toBeVisible();

  await page.goto(flowUrl);
  await expect(page.getByRole("heading", { name: "Platform Loop" })).toBeVisible();

  const refreshedStageCards = page.locator('[data-testid^="stage-card-"]');
  const refreshedValuesStage = refreshedStageCards.filter({ hasText: /Values screen/i }).first();
  await refreshedValuesStage.click();
  await page.getByRole("button", { name: /Library/i }).click();
  await page.getByPlaceholder(/Search the question bank/i).fill("reliability-versus-launch");
  await page.locator('[data-testid^="library-question-"]').first().click();
  await expect(page.getByText(/Added question to Values screen\./i)).toBeVisible();
  await expect(refreshedValuesStage).toContainText(flowTitle);

  await page.getByRole("button", { name: /Publish loop/i }).click();
  await expect(page.getByText(/uncovered target axes/i)).toBeVisible();

  const valuesReorderHandle = refreshedValuesStage.getByRole("button", { name: /Reorder Values screen/i });
  await valuesReorderHandle.dragTo(refreshedStageCards.first());

  await page.getByTestId("target-axis-axis_coding").click();
  await page.getByTestId("target-axis-axis_system_design").click();
  await page.getByTestId("target-axis-axis_product_judgment").click();
  await page.getByRole("button", { name: /Save draft/i }).click();
  await expect(page.getByText(/Draft saved\./i)).toBeVisible();
  await page.reload();

  const reloadedStageCards = page.locator('[data-testid^="stage-card-"]');
  await expect(reloadedStageCards.first().locator('input[aria-label^="Stage name"]')).toHaveValue("Values screen");
  await expect(reloadedStageCards.first()).toContainText(flowTitle);

  await page.getByRole("button", { name: /Publish loop/i }).click();
  await expect(page.getByText(/Loop published and ready for ATS mappings\./i)).toBeVisible();

  await page.goto("/roles");
  const platformCard = page.locator("div").filter({ hasText: /Platform Engineer/i }).first();
  await expect(platformCard.getByText(/^active$/i)).toBeVisible();
});

test("stacked builder can reorder questions within a stage and persist the order", async ({ page }) => {
  await page.goto("/roles/role_frontend_senior/flow");

  const systemDesignStage = page.getByTestId("stage-card-stage_frontend_system_design");
  const accessModelHandle = systemDesignStage.getByRole("button", {
    name: /Reorder Model access control for a shared workspace/i,
  });
  const claimsDashboardRow = page.getByTestId(
    "stage-question-stage_frontend_system_design-question_claims_dashboard",
  );

  await accessModelHandle.dragTo(claimsDashboardRow);
  await page.getByRole("button", { name: /Save changes/i }).click();
  await expect(page.getByText(/Published loop updated\./i)).toBeVisible();
  await page.reload();

  const firstQuestion = page
    .getByTestId("stage-card-stage_frontend_system_design")
    .locator('[data-testid^="stage-question-stage_frontend_system_design-"]')
    .first();
  await expect(firstQuestion).toContainText("shared workspace");
});

test("canvas mode saves stage positions without losing builder question assignments", async ({ page }) => {
  await page.goto("/roles/role_frontend_senior/flow?view=canvas");

  await expect(page.getByRole("heading", { name: /Senior Frontend Loop/i })).toBeVisible();
  const systemsNode = page.getByTestId("stage-node-stage_frontend_system_design");
  const targetNode = page.getByTestId("stage-node-stage_hiring_manager");

  await systemsNode.dragTo(targetNode);
  await page.getByRole("button", { name: /Save flow/i }).click();
  await expect(page.getByText(/Flow layout saved\./i)).toBeVisible();

  await page.getByRole("link", { name: /^Builder$/i }).click();
  await expect(page).toHaveURL("/roles/role_frontend_senior/flow");
  await expect(
    page.getByTestId("stage-card-stage_frontend_system_design"),
  ).toContainText("Design a frontend system for reviewing employee claims");
});

test("question bank can edit an existing question", async ({ page }) => {
  await page.goto("/questions");

  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();
  await page.getByTestId("question-row-question_claims_dashboard").click();
  await page.getByRole("link", { name: /^Edit$/i }).click();

  await expect(page).toHaveURL(/\/questions\/question_claims_dashboard\/edit$/);
  await expect(page.getByRole("heading", { name: /Edit question/i })).toBeVisible();

  const updatedPrompt =
    "Design a frontend system for reviewing employee claims, audits, and exception workflows.";
  await page.getByLabel(/^Question$/i).fill(updatedPrompt);
  await page.getByLabel(/Why this question/i).fill(
    "Tests system design depth once audit history and exception handling matter.",
  );
  await page.getByRole("button", { name: /Save question/i }).click();

  await expect(page).toHaveURL("/questions");
  await expect(page.getByTestId("question-detail-title")).toHaveText(updatedPrompt);
  await page.getByPlaceholder(/Search questions, tags, or competencies/i).fill("exception workflows");
  await expect(page.getByTestId("question-row-question_claims_dashboard")).toBeVisible();
});

test("question bank can duplicate an existing question into a prefilled composer", async ({ page }) => {
  await page.goto("/questions");

  await page.getByTestId("question-row-question_claims_dashboard").click();
  await page.getByRole("link", { name: /Duplicate/i }).click();

  await expect(page).toHaveURL(/\/questions\/new\?duplicateQuestionId=/);
  await expect(page.getByRole("heading", { name: /Duplicate question/i })).toBeVisible();
  await expect(page.getByLabel(/^Question$/i)).toHaveValue(
    /Design a frontend system for reviewing employee claims/i,
  );

  const duplicatePrompt =
    "Design a claims dashboard for cross-border reimbursement workflows.";
  await page.getByLabel(/^Question$/i).fill(duplicatePrompt);
  await page.getByRole("button", { name: /Add duplicate/i }).click();

  await expect(page).toHaveURL("/questions");
  await page.getByPlaceholder(/Search questions, tags, or competencies/i).fill("cross-border reimbursement");
  await expect(page.getByTestId("question-detail-title")).toHaveText(duplicatePrompt);
});

test("question bank can import csv questions into the bank", async ({ page }) => {
  await page.goto("/questions");

  const csv = [
    "prompt,collection,roleFamily,levels,difficulty,expectedDurationMinutes,axisTags,rationale,followUps,anchor1,anchor3,anchor5",
    "\"Walk me through a product bet that failed.\",Leadership,Frontend engineering,\"L4|L5\",3,20,\"product judgment|communication\",\"Tests reflection and product reasoning.\",\"What changed after launch?|How did you communicate the miss?\",\"A 1 looks like: stays generic.\",\"A 3 looks like: explains the tradeoff and the miss.\",\"A 5 looks like: reframes the bet with evidence.\"",
  ].join("\n");

  await page.locator('input[type="file"]').setInputFiles({
    name: "question-bank.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });

  await expect(page.getByText(/Imported 1 question into the bank\./i)).toBeVisible();
  await page.getByPlaceholder(/Search questions, tags, or competencies/i).fill("product bet that failed");
  await expect(page.getByTestId("question-detail-title")).toHaveText(
    "Walk me through a product bet that failed.",
  );
});

test("question bank can filter existing questions by reference company", async ({ page }) => {
  await page.goto("/questions");

  await page.getByLabel(/Company/i).selectOption({ label: "Notion" });
  await expect(page.getByTestId("question-row-question_claims_dashboard")).toBeVisible();
  await expect(page.getByTestId("question-detail-title")).toContainText("Design a frontend system");
});

test("admin can create a company catalog entry", async ({ page }) => {
  await page.goto("/companies");

  await expect(page.getByRole("heading", { name: /Company tags and logos/i })).toBeVisible();
  await page.getByLabel(/Company name/i).fill("Ramp");
  await page.getByLabel(/Website/i).fill("https://ramp.com");
  await page.getByRole("button", { name: /Add company/i }).click();

  await expect(page.getByText(/Company saved to the reference catalog\./i)).toBeVisible();
  await expect(page.getByText("Ramp", { exact: true })).toBeVisible();
});

test("question bank desktop layout stays aligned to the handoff", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.goto("/questions");

  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();
  const devtoolsButton = page.getByRole("button", { name: /Open Next\.js Dev Tools/i }).first();
  await expect(page).toHaveScreenshot("question-bank-shell-global.png", {
    animations: "disabled",
    fullPage: true,
    mask: [devtoolsButton],
    maxDiffPixels: 5000,
  });
});

test("new question desktop composer stays aligned to the handoff", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.goto("/questions/new");

  await expect(page.getByRole("heading", { name: /New question/i })).toBeVisible();
  const devtoolsButton = page.getByRole("button", { name: /Open Next\.js Dev Tools/i }).first();
  await expect(page).toHaveScreenshot("new-question-shell.png", {
    animations: "disabled",
    fullPage: true,
    mask: [devtoolsButton],
    maxDiffPixels: 5000,
  });
});

test("loop builder stacked desktop layout stays aligned to the handoff", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.goto("/roles/role_frontend_senior/flow");

  await expect(page.getByRole("heading", { name: /Senior Frontend Loop/i })).toBeVisible();
  const devtoolsButton = page.getByRole("button", { name: /Open Next\.js Dev Tools/i }).first();
  await expect(page).toHaveScreenshot("loop-builder-stacked.png", {
    animations: "disabled",
    fullPage: true,
    mask: [devtoolsButton],
    maxDiffPixels: 9000,
  });
});

test("role-scoped question bank stays contextual inside a role workspace", async ({ page }) => {
  await page.goto("/roles/role_frontend_senior/questions");

  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();
  await expect(page.getByText(/Senior Frontend Engineer/i).first()).toBeVisible();
  await page.getByRole("link", { name: /Add question/i }).click();
  await expect(page).toHaveURL("/roles/role_frontend_senior/questions/new");
});

test("role-scoped question bank desktop layout stays aligned in the shared shell", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.goto("/roles/role_frontend_senior/questions");

  await expect(page.getByRole("heading", { name: /Question bank/i })).toBeVisible();
  const devtoolsButton = page.getByRole("button", { name: /Open Next\.js Dev Tools/i }).first();
  await expect(page).toHaveScreenshot("question-bank-shell-role.png", {
    animations: "disabled",
    fullPage: true,
    mask: [devtoolsButton],
    maxDiffPixels: 5000,
  });
});

test("roles dashboard uses the shared workspace shell", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.goto("/roles");

  await expect(page.getByRole("heading", { name: /Role-specific interview flows/i })).toBeVisible();
  const devtoolsButton = page.getByRole("button", { name: /Open Next\.js Dev Tools/i }).first();
  await expect(page).toHaveScreenshot("roles-shell.png", {
    animations: "disabled",
    fullPage: true,
    mask: [devtoolsButton],
    maxDiffPixels: 5000,
  });
});

test("ATS admin can connect a provider, map stages, sync jobs, and avoid duplicate sessions", async ({ page }) => {
  await page.goto("/settings/integrations");

  const greenhouseCard = page.getByTestId("integration-card-greenhouse");
  await greenhouseCard.getByLabel(/API key/i).fill("gh_test_secret");
  await greenhouseCard.getByRole("button", { name: /Connect greenhouse/i }).click();
  await expect(greenhouseCard.getByText(/Provider connected/i)).toBeVisible();

  await page.goto("/integrations/ashby/mapping");
  const jobMappingForm = page.getByTestId("ashby-job-mapping-form");
  await jobMappingForm.getByLabel(/ATS job/i).selectOption({ label: "Staff Backend Engineer" });
  await jobMappingForm.getByLabel(/Froggy role/i).selectOption({ label: "Staff Backend Engineer" });
  await jobMappingForm.getByLabel(/Froggy flow/i).selectOption({ label: "Staff Backend Loop" });
  await jobMappingForm.getByRole("button", { name: /Save/i }).click();
  await expect(jobMappingForm.getByText(/Job mapping saved/i)).toBeVisible();

  const stageMappingForm = page.getByTestId("ashby-stage-mapping-form");
  await stageMappingForm.getByLabel(/Job mapping/i).selectOption({ label: "ashby_job_backend" });
  await stageMappingForm.getByLabel(/^ATS stage$/i).selectOption({ label: "Architecture" });
  await stageMappingForm.getByLabel(/Froggy stage/i).selectOption({
    label: "Distributed systems architecture",
  });
  await stageMappingForm.getByRole("button", { name: /Save/i }).click();
  await expect(stageMappingForm.getByText(/Stage mapping saved/i)).toBeVisible();

  await page.goto("/settings/integrations");
  const ashbyCard = page.getByTestId("integration-card-ashby");
  await ashbyCard.getByRole("button", { name: /Sync now/i }).click();
  await expect(ashbyCard.getByText(/Sync finished and interview sessions were deduplicated/i)).toBeVisible();

  await page.goto("/candidates/cand_ivy_chen");
  await expect(page.getByRole("heading", { name: /Ivy Chen/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open interviewer guide/i })).toHaveCount(1);

  await page.goto("/settings/integrations");
  await page.getByTestId("integration-card-ashby").getByRole("button", { name: /Sync now/i }).click();
  await expect(page.getByTestId("integration-card-ashby").getByText(/Sync finished and interview sessions were deduplicated/i)).toBeVisible();

  await page.goto("/candidates/cand_ivy_chen");
  await expect(page.getByRole("link", { name: /Open interviewer guide/i })).toHaveCount(1);
});

test("recruiter can create a manual session when automation has not created one yet", async ({ page }) => {
  await page.goto("/candidates/cand_sarah_lee");

  await expect(page.getByRole("heading", { name: /Sarah Lee/i })).toBeVisible();
  await page.getByLabel(/Froggy stage/i).selectOption({ label: "Hiring manager" });
  await page.getByLabel(/Interviewer/i).selectOption({ label: "Maya Ortiz" });
  await page.getByLabel(/Scheduled at/i).fill("2026-05-10T10:30");
  await page.getByRole("button", { name: /^Create$/i }).click();

  await expect(page).toHaveURL(/\/interviews\/.+$/);
  await expect(page.getByRole("heading", { name: /Hiring manager · Sarah Lee/i })).toBeVisible();
});

test("submits a structured scorecard and updates the packet", async ({ page }) => {
  await page.goto("/interviews/session_sarah_sysdesign");

  await expect(page.getByRole("heading", { name: /Frontend system design · Sarah Lee/i })).toBeVisible();
  await page.getByLabel("Evidence").nth(0).fill("Clarified scope, laid out component boundaries, and explained API tradeoffs.");
  await page.getByLabel("Evidence").nth(1).fill("Explained permission edges and weighed UX simplicity against implementation cost.");
  await page.getByLabel("Evidence").nth(2).fill("Stayed structured and adapted well to follow-ups.");
  await page.getByLabel("Question notes").nth(0).fill("Strong on list performance and data refresh strategy.");
  await page.getByLabel("Question notes").nth(1).fill("Noticed stale-permission risks quickly.");
  await page.getByLabel(/Final summary/i).fill(
    "Strong system design and product framing. Would move forward with a lean yes.",
  );

  await page.getByRole("button", { name: /Submit scorecard/i }).click();
  await expect(page.getByRole("button", { name: /Feedback locked/i })).toBeVisible();

  await page.goto("/packets/app_sarah_frontend");
  await expect(page.getByRole("heading", { name: /Sarah Lee · Senior Frontend Engineer/i })).toBeVisible();
  await expect(page.locator("pre")).toContainText("Recommendation: lean yes");
  await expect(page.getByText("System design", { exact: true })).toBeVisible();
  await expect(page.getByText("Product judgment", { exact: true })).toBeVisible();
});
