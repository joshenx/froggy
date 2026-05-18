import { describe, expect, test } from "vitest";
import { makeJsonRequest, withMvpTestContext } from "./helpers/mvp-test-harness";

describe("MVP API routes", () => {
  test("POST /api/roles validates payloads and creates a role flow", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidResponse = await modules.rolesRoute.POST(
        makeJsonRequest({
          name: "",
          flowName: "",
          level: "senior",
          stageNames: [],
        }),
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Role name and flow name are required.",
      });

      const validResponse = await modules.rolesRoute.POST(
        makeJsonRequest({
          name: "Platform Engineer",
          flowName: "Platform Loop",
          level: "staff",
          stageNames: ["Screen", "Onsite"],
        }),
      );

      expect(validResponse.status).toBe(201);
      const body = await validResponse.json();
      const store = await modules.store.readMvpStore();

      expect(body.roleId).toBeTruthy();
      expect(store.roles.some((role) => role.id === body.roleId)).toBe(true);
    });
  });

  test("POST /api/stages/:stageId/questions validates axes and creates a stage-attached question", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidResponse = await modules.stageQuestionRoute.POST(
        makeJsonRequest({
          title: "Missing axes",
          prompt: "Prompt",
          difficulty: 3,
          seniority: "senior",
          axisIds: [],
        }),
        { params: Promise.resolve({ stageId: "stage_frontend_coding" }) },
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Select at least one evaluation axis.",
      });

      const validResponse = await modules.stageQuestionRoute.POST(
        makeJsonRequest({
          title: "Investigate a production queue backlog",
          prompt: "Walk through the investigation path.",
          difficulty: 4,
          seniority: "senior",
          axisIds: ["axis_ownership", "axis_communication"],
          expectedDurationMinutes: 20,
        }),
        { params: Promise.resolve({ stageId: "stage_frontend_coding" }) },
      );

      expect(validResponse.status).toBe(201);
      const body = await validResponse.json();
      const store = await modules.store.readMvpStore();

      expect(store.questions.some((question) => question.id === body.questionId)).toBe(true);
      const question = store.questions.find((item) => item.id === body.questionId);
      expect(store.stages.find((stage) => stage.id === "stage_frontend_coding")?.questionIds).toContain(
        body.questionId,
      );
      expect(question?.stageIds).toEqual(["stage_frontend_coding"]);
    });
  });

  test("PATCH /api/roles/:roleId/flows validates payloads and saves full loop drafts", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidResponse = await modules.roleFlowRoute.PATCH(
        makeJsonRequest({ stages: [] }, { method: "PATCH" }),
        { params: Promise.resolve({ roleId: "role_frontend_senior" }) },
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Add at least one stage to save the flow.",
      });

      const successResponse = await modules.roleFlowRoute.PATCH(
        makeJsonRequest(
          {
            flowName: "Staff Backend Loop v2",
            targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
            stages: [
              {
                id: "stage_backend_architecture",
                name: "Architecture deep dive",
                durationMinutes: 60,
                interviewerRole: "Staff backend engineer",
                scoringRules: ["Every score must include evidence."],
                questionIds: ["question_claims_dashboard"],
                canvasX: 140,
                canvasY: 210,
                orderIndex: 1,
              },
              {
                id: "temp-stage-past-projects",
                name: "Past projects",
                durationMinutes: 45,
                interviewerRole: "Hiring manager",
                scoringRules: ["Probe ownership."],
                questionIds: ["question_stakeholder_tradeoffs"],
                canvasX: 480,
                canvasY: 210,
                orderIndex: 2,
              },
            ],
          },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ roleId: "role_backend_staff" }) },
      );

      expect(successResponse.status).toBe(200);
      const body = await successResponse.json();
      const store = await modules.store.readMvpStore();
      const flow = store.flows.find((item) => item.id === "flow_backend_loop_v1");
      const stage = store.stages.find((item) => item.id === "stage_backend_architecture");
      const createdStageId = body.stageIdMap?.["temp-stage-past-projects"];
      const createdStage = store.stages.find((item) => item.id === createdStageId);

      expect(body.status).toBe("draft");
      expect(flow?.name).toBe("Staff Backend Loop v2");
      expect(flow?.targetAxisIds).toEqual([
        "axis_system_design",
        "axis_ownership",
        "axis_communication",
      ]);
      expect(stage?.name).toBe("Architecture deep dive");
      expect(stage?.questionIds).toEqual(["question_claims_dashboard"]);
      expect(stage?.canvasX).toBe(140);
      expect(stage?.canvasY).toBe(210);
      expect(createdStage?.questionIds).toEqual(["question_stakeholder_tradeoffs"]);
    });
  });

  test("PATCH /api/roles/:roleId/flows enforces publish validation", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const gapResponse = await modules.roleFlowRoute.PATCH(
        makeJsonRequest(
          {
            flowName: "Staff Backend Loop",
            status: "active",
            targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
            stages: [
              {
                id: "stage_backend_architecture",
                name: "Distributed systems architecture",
                durationMinutes: 60,
                interviewerRole: "Staff backend engineer",
                scoringRules: ["Draft stage awaiting question assignment."],
                questionIds: ["question_claims_dashboard"],
                canvasX: 60,
                canvasY: 90,
                orderIndex: 1,
              },
            ],
          },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ roleId: "role_backend_staff" }) },
      );

      expect(gapResponse.status).toBe(400);
      await expect(gapResponse.json()).resolves.toEqual({
        error: "Cannot publish Staff Backend Loop with uncovered target axes: Ownership.",
      });

      const publishResponse = await modules.roleFlowRoute.PATCH(
        makeJsonRequest(
          {
            flowName: "Staff Backend Loop",
            status: "active",
            targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
            stages: [
              {
                id: "stage_backend_architecture",
                name: "Distributed systems architecture",
                durationMinutes: 60,
                interviewerRole: "Staff backend engineer",
                scoringRules: ["Draft stage awaiting question assignment."],
                questionIds: ["question_claims_dashboard", "question_stakeholder_tradeoffs"],
                canvasX: 60,
                canvasY: 90,
                orderIndex: 1,
              },
            ],
          },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ roleId: "role_backend_staff" }) },
      );

      expect(publishResponse.status).toBe(200);
      const body = await publishResponse.json();
      const store = await modules.store.readMvpStore();
      const flow = store.flows.find((item) => item.id === "flow_backend_loop_v1");

      expect(body.status).toBe("active");
      expect(flow?.status).toBe("active");
    });
  });

  test("POST /api/roles/:roleId/questions validates payloads and creates an unattached bank question", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidResponse = await modules.bankQuestionRoute.POST(
        makeJsonRequest({
          title: "Missing prompt",
          prompt: "",
          difficulty: 3,
          seniority: "senior",
          axisIds: ["axis_communication"],
        }),
        { params: Promise.resolve({ roleId: "role_frontend_senior" }) },
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Question title and prompt are required.",
      });

      const validResponse = await modules.bankQuestionRoute.POST(
        makeJsonRequest({
          title: "Question bank only prompt",
          prompt: "Tell me about a time you changed course after new evidence.",
          difficulty: 3,
          seniority: "senior",
          axisIds: ["axis_product_judgment", "axis_communication"],
          levels: ["mid", "senior"],
          followUps: ["What was the new evidence?"],
          expectedSignals: ["Updated judgment"],
          expectedDurationMinutes: 20,
          collection: "Leadership",
          roleFamily: "Frontend engineering",
          rationale: "Tests whether candidates update a decision responsibly.",
          anchors: [
            "A 1 looks like: digs in despite the new evidence.",
            "A 3 looks like: adjusts the plan after some prompting.",
            "A 5 looks like: reframes the decision with evidence and alignment.",
          ],
        }),
        { params: Promise.resolve({ roleId: "role_frontend_senior" }) },
      );

      expect(validResponse.status).toBe(201);
      const body = await validResponse.json();
      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === body.questionId);

      expect(question?.stageIds).toEqual([]);
      expect(question?.roleIds).toEqual(["role_frontend_senior"]);
      expect(question?.collection).toBe("Leadership");
    });
  });

  test("POST /api/questions creates an unattached global bank question", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const response = await modules.globalBankQuestionRoute.POST(
        makeJsonRequest({
          title: "Global bank prompt",
          prompt: "Tell me about a product decision you changed after customer evidence.",
          difficulty: 3,
          seniority: "senior",
          axisIds: ["axis_product_judgment", "axis_communication"],
          levels: ["mid", "senior"],
          followUps: ["What changed your mind?"],
          expectedSignals: ["Product judgment", "Communication"],
          expectedDurationMinutes: 20,
          collection: "Leadership",
          roleFamily: "Engineering",
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === body.questionId);

      expect(question?.stageIds).toEqual([]);
      expect(question?.roleIds).toEqual([]);
    });
  });

  test("POST /api/companies creates a company catalog entry", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const response = await modules.companyRoute.POST(
        makeJsonRequest({
          name: "Ramp",
          website: "https://ramp.com",
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      const store = await modules.store.readMvpStore();
      const company = store.companies.find((item) => item.id === body.companyId);

      expect(company?.slug).toBe("ramp");
      expect(company?.website).toBe("https://ramp.com");
    });
  });

  test("PATCH /api/questions/:questionId updates a bank question and GET returns it for prefills", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const getResponse = await modules.questionDetailRoute.GET(new Request("http://localhost"), {
        params: Promise.resolve({ questionId: "question_claims_dashboard" }),
      });

      expect(getResponse.status).toBe(200);
      await expect(getResponse.json()).resolves.toMatchObject({
        id: "question_claims_dashboard",
      });

      const patchResponse = await modules.questionDetailRoute.PATCH(
        makeJsonRequest(
          {
            title: "Design a claims dashboard",
            prompt:
              "Design a frontend system for reviewing employee claims across large lists, multiple states, and role-based permissions with audit history.",
            difficulty: 5,
            seniority: "senior",
            levels: ["senior", "staff"],
            axisIds: ["axis_system_design", "axis_communication"],
            followUps: ["How would you expose audit history?"],
            expectedSignals: ["Architecture clarity", "Communication"],
            expectedDurationMinutes: 35,
            collection: "Engineering",
            roleFamily: "Frontend engineering",
            rationale: "Updated rationale.",
            anchors: [
              "A 1 looks like: misses the data model and user flow.",
              "A 3 looks like: covers the main path with some gaps.",
              "A 5 looks like: balances data flow, permissions, and auditability.",
            ],
          },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ questionId: "question_claims_dashboard" }) },
      );

      expect(patchResponse.status).toBe(200);
      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === "question_claims_dashboard");

      expect(question?.prompt).toContain("audit history");
      expect(question?.axisIds).toEqual(["axis_system_design", "axis_communication"]);
    });
  });

  test("POST /api/questions/:questionId/attachments validates stages and attaches to the active flow", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const created = await modules.store.createBankQuestion({
        title: "Question bank only prompt",
        prompt: "How do you align a technical strategy change across functions?",
        difficulty: 4,
        seniority: "senior",
        axisIds: ["axis_communication", "axis_system_design"],
        followUps: [],
        expectedSignals: ["Alignment", "Tradeoff clarity"],
        expectedDurationMinutes: 25,
        collection: "Leadership",
        roleFamily: "Frontend engineering",
      });

      const invalidResponse = await modules.questionAttachmentsRoute.POST(
        makeJsonRequest({ stageIds: [] }),
        { params: Promise.resolve({ questionId: created.id }) },
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Select at least one stage.",
      });

      const successResponse = await modules.questionAttachmentsRoute.POST(
        makeJsonRequest({ stageIds: ["stage_frontend_coding", "stage_hiring_manager"] }),
        { params: Promise.resolve({ questionId: created.id }) },
      );

      expect(successResponse.status).toBe(201);
      await expect(successResponse.json()).resolves.toEqual({
        questionId: created.id,
        attachedStageIds: ["stage_frontend_coding", "stage_hiring_manager"],
      });

      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === created.id);

      expect(question?.stageIds).toEqual(["stage_frontend_coding", "stage_hiring_manager"]);
    });
  });

  test("POST /api/roles/:roleId/questions/import imports valid CSV rows into the bank", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const response = await modules.importQuestionsRoute.POST(
        makeJsonRequest({
          csvText: [
            "prompt,collection,roleFamily,levels,difficulty,expectedDurationMinutes,axisTags,rationale,followUps,anchor1,anchor3,anchor5",
            "\"Walk me through a product bet that failed.\",Leadership,Frontend engineering,\"L4|L5\",3,20,\"product judgment|communication\",\"Tests reflection and product reasoning.\",\"What changed after launch?|How did you communicate the miss?\",\"A 1 looks like: stays generic.\",\"A 3 looks like: explains the tradeoff and the miss.\",\"A 5 looks like: reframes the bet with evidence.\"",
          ].join("\n"),
        }),
        { params: Promise.resolve({ roleId: "role_frontend_senior" }) },
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === body.questionIds[0]);

      expect(body).toMatchObject({
        importedCount: 1,
        failedCount: 0,
      });
      expect(question?.stageIds).toEqual([]);
      expect(question?.roleIds).toEqual(["role_frontend_senior"]);
    });
  });

  test("POST /api/questions/import imports valid CSV rows into the global bank", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const response = await modules.globalImportQuestionsRoute.POST(
        makeJsonRequest({
          csvText: [
            "prompt,collection,roleFamily,levels,difficulty,expectedDurationMinutes,axisTags",
            "\"Walk me through a hiring decision that changed late.\",Leadership,Engineering,\"L4|L5\",3,20,\"communication|ownership\"",
          ].join("\n"),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      const store = await modules.store.readMvpStore();
      const question = store.questions.find((item) => item.id === body.questionIds[0]);

      expect(body).toMatchObject({
        importedCount: 1,
        failedCount: 0,
      });
      expect(question?.roleIds).toEqual([]);
    });
  });

  test("POST /api/interview-sessions validates required fields and deduplicates sessions", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidResponse = await modules.sessionRoute.POST(
        makeJsonRequest({
          applicationId: "",
          froggyStageId: "",
        }),
      );

      expect(invalidResponse.status).toBe(400);
      await expect(invalidResponse.json()).resolves.toEqual({
        error: "Application and Froggy stage are required.",
      });

      const firstResponse = await modules.sessionRoute.POST(
        makeJsonRequest({
          applicationId: "app_sarah_frontend",
          froggyStageId: "stage_hiring_manager",
          externalInterviewId: "ashby_interview_manual_2",
        }),
      );
      const secondResponse = await modules.sessionRoute.POST(
        makeJsonRequest({
          applicationId: "app_sarah_frontend",
          froggyStageId: "stage_hiring_manager",
        }),
      );

      const firstBody = await firstResponse.json();
      const secondBody = await secondResponse.json();
      const store = await modules.store.readMvpStore();

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(201);
      expect(secondBody.sessionId).toBe(firstBody.sessionId);
      expect(
        store.sessions.filter(
          (session) =>
            session.applicationId === "app_sarah_frontend" &&
            session.froggyStageId === "stage_hiring_manager",
        ),
      ).toHaveLength(1);
    });
  });

  test("POST /api/interview-sessions/:sessionId/scorecard validates body and evidence", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const invalidBodyResponse = await modules.scorecardRoute.POST(
        makeJsonRequest({
          recommendation: "",
          confidence: 0,
          overallNotes: "",
          axisScores: [],
        }),
        { params: Promise.resolve({ sessionId: "session_sarah_sysdesign" }) },
      );

      expect(invalidBodyResponse.status).toBe(400);
      await expect(invalidBodyResponse.json()).resolves.toEqual({
        error: "Recommendation, confidence, and summary notes are required.",
      });

      const missingEvidenceResponse = await modules.scorecardRoute.POST(
        makeJsonRequest({
          recommendation: "lean_yes",
          confidence: 4,
          overallNotes: "Strong interview.",
          axisScores: [
            {
              axisId: "axis_system_design",
              score: 4,
              evidence: "Strong architecture reasoning.",
            },
            {
              axisId: "axis_product_judgment",
              score: 3,
              evidence: "",
            },
            {
              axisId: "axis_communication",
              score: 4,
              evidence: "Clear communication.",
            },
          ],
          questionNotes: [],
        }),
        { params: Promise.resolve({ sessionId: "session_sarah_sysdesign" }) },
      );

      expect(missingEvidenceResponse.status).toBe(400);
      await expect(missingEvidenceResponse.json()).resolves.toEqual({
        error: "Evidence is required for Product judgment.",
      });

      const successResponse = await modules.scorecardRoute.POST(
        makeJsonRequest({
          recommendation: "lean_yes",
          confidence: 4,
          overallNotes: "Strong interview.",
          axisScores: [
            {
              axisId: "axis_system_design",
              score: 4,
              evidence: "Strong architecture reasoning.",
            },
            {
              axisId: "axis_product_judgment",
              score: 3,
              evidence: "Balanced UX and engineering tradeoffs.",
            },
            {
              axisId: "axis_communication",
              score: 4,
              evidence: "Clear communication.",
            },
          ],
          questionNotes: [],
        }),
        { params: Promise.resolve({ sessionId: "session_sarah_sysdesign" }) },
      );

      expect(successResponse.status).toBe(201);
      await expect(successResponse.json()).resolves.toMatchObject({
        status: "submitted",
      });
    });
  });

  test("POST /api/integrations/:provider/sync/jobs rejects inactive providers and syncs mapped sessions", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const inactiveResponse = await modules.syncJobsRoute.POST(new Request("http://localhost"), {
        params: Promise.resolve({ provider: "greenhouse" }),
      });

      expect(inactiveResponse.status).toBe(400);
      await expect(inactiveResponse.json()).resolves.toEqual({
        error: "Connect the provider before syncing.",
      });

      await modules.store.saveJobMapping("ashby", {
        externalJobId: "ashby_job_backend",
        froggyRoleId: "role_backend_staff",
        froggyFlowId: "flow_backend_loop_v1",
      });
      const jobMapping = (await modules.store.readMvpStore()).atsJobMappings.find(
        (item) => item.externalJobId === "ashby_job_backend" && item.provider === "ashby",
      );
      if (!jobMapping) {
        throw new Error("Expected job mapping for backend Ashby job.");
      }

      await modules.store.createQuestion("stage_backend_architecture", {
        title: "Design a backend architecture",
        prompt: "Walk through the queue, storage, and retry model.",
        difficulty: 4,
        seniority: "staff",
        axisIds: ["axis_system_design"],
        followUps: [],
        expectedSignals: ["System boundaries"],
        expectedDurationMinutes: 25,
        collection: "Engineering",
        roleFamily: "Backend engineering",
      });
      await modules.store.saveStageMapping("ashby", {
        atsJobMappingId: jobMapping.id,
        externalStageId: "ashby_stage_backend_design",
        froggyStageId: "stage_backend_architecture",
      });

      const successResponse = await modules.syncJobsRoute.POST(new Request("http://localhost"), {
        params: Promise.resolve({ provider: "ashby" }),
      });

      expect(successResponse.status).toBe(200);
      await expect(successResponse.json()).resolves.toMatchObject({
        createdSessions: 1,
        failed: 0,
      });
    });
  });
});
