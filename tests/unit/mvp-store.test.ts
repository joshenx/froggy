import { describe, expect, test } from "vitest";
import { withMvpTestContext } from "./helpers/mvp-test-harness";

describe("MVP store", () => {
  test("createRoleWithFlow trims input, creates stages, and records an audit log", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const result = await modules.store.createRoleWithFlow({
        name: "  Platform Engineer  ",
        level: "staff",
        flowName: "  Platform Loop  ",
        stageNames: ["  Recruiter screen  ", "  Architecture  "],
      });

      const store = await modules.store.readMvpStore();
      const createdStages = store.stages
        .filter((stage) => stage.flowId === result.flow.id)
        .sort((left, right) => left.orderIndex - right.orderIndex);

      expect(result.role.name).toBe("Platform Engineer");
      expect(result.flow.name).toBe("Platform Loop");
      expect(createdStages.map((stage) => stage.name)).toEqual(["Recruiter screen", "Architecture"]);
      expect(store.auditLogs[0]?.detail).toContain("Created Platform Engineer with Platform Loop.");
    });
  });

  test("addStage appends order and removes empty scoring rules", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const stage = await modules.store.addStage("role_frontend_senior", {
        name: "Offer panel",
        description: "Final exec alignment",
        durationMinutes: 30,
        interviewerRole: "VP Engineering",
        scoringRules: ["Keep notes concise.", "", "Every score must include evidence."],
      });

      const store = await modules.store.readMvpStore();
      const flowStages = store.stages
        .filter((item) => item.flowId === "flow_frontend_loop_v1")
        .sort((left, right) => left.orderIndex - right.orderIndex);

      expect(stage.orderIndex).toBe(flowStages.length);
      expect(stage.scoringRules).toEqual(["Keep notes concise.", "Every score must include evidence."]);
      expect(flowStages.at(-1)?.name).toBe("Offer panel");
    });
  });

  test("createQuestion updates the stage and creates rubrics for every axis", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.createQuestion("stage_backend_architecture", {
        title: "Design a queue fan-out pipeline",
        prompt: "Walk through the read, write, and retry boundaries for a queue fan-out system.",
        difficulty: 5,
        seniority: "staff",
        axisIds: ["axis_system_design", "axis_ownership"],
        followUps: ["How do you retry safely?"],
        expectedSignals: ["System boundaries", "Operational follow-through"],
        expectedDurationMinutes: 35,
        collection: "Engineering",
        roleFamily: "Backend engineering",
      });

      const store = await modules.store.readMvpStore();
      const stage = store.stages.find((item) => item.id === "stage_backend_architecture");
      const rubrics = store.rubrics.filter((rubric) => rubric.questionId === question.id);

      expect(stage?.questionIds).toContain(question.id);
      expect(stage?.axisIds).toEqual(expect.arrayContaining(["axis_system_design", "axis_ownership"]));
      expect(rubrics).toHaveLength(2);
    });
  });

  test("createBankQuestion creates an unattached bank question", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.createBankQuestion("role_frontend_senior", {
        title: "Question bank only prompt",
        prompt: "Tell me about a product tradeoff you would revisit after launch.",
        difficulty: 3,
        seniority: "senior",
        axisIds: ["axis_product_judgment", "axis_communication"],
        companyIds: ["company_stripe"],
        followUps: ["What changed after launch?"],
        expectedSignals: ["Product tradeoffs", "Clear communication"],
        expectedDurationMinutes: 20,
        collection: "Product",
        roleFamily: "Frontend engineering",
        rationale: "Keeps a behavioral prompt in the bank until the loop team decides where it belongs.",
        anchors: [
          "A 1 looks like: stays generic and never names a tradeoff.",
          "A 3 looks like: explains the tradeoff and names a reasonable follow-up.",
          "A 5 looks like: reframes the decision with evidence and shows strong product judgment.",
        ],
      });

      const store = await modules.store.readMvpStore();
      const stageMentions = store.stages.filter((stage) => stage.questionIds.includes(question.id));

      expect(question.stageIds).toEqual([]);
      expect(question.roleIds).toEqual(["role_frontend_senior"]);
      expect(question.companyIds).toEqual(["company_stripe"]);
      expect(stageMentions).toHaveLength(0);
      expect(store.auditLogs[0]?.detail).toContain("Added Question bank only prompt to the Senior Frontend Engineer bank.");
    });
  });

  test("createCompany adds a company reference and saveFlowLayout persists full loop drafts including inline-added stages", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const company = await modules.store.createCompany({
        name: "Ramp",
        website: "https://ramp.com",
      });

      expect(company.slug).toBe("ramp");

      const result = await modules.store.saveFlowLayout("role_backend_staff", {
        flowName: "Staff Backend Loop v2",
        targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
        stages: [
          {
            id: "stage_backend_architecture",
            name: "Architecture deep dive",
            description: "Updated stage copy.",
            durationMinutes: 60,
            interviewerRole: "Staff backend engineer",
            scoringRules: [
              "Spend the first five minutes clarifying requirements.",
              "Every score must include evidence.",
            ],
            questionIds: ["question_claims_dashboard"],
            canvasX: 40,
            canvasY: 60,
            orderIndex: 1,
          },
          {
            id: "temp-stage-past-projects",
            name: "Past projects",
            description: "Probe ownership in ambiguous cross-functional launches.",
            durationMinutes: 45,
            interviewerRole: "Hiring manager",
            scoringRules: [
              "Use follow-ups to test prioritization under conflict.",
              "Block submission if recommendation and evidence do not match.",
            ],
            questionIds: ["question_stakeholder_tradeoffs"],
            canvasX: 500,
            canvasY: 90,
            orderIndex: 2,
          },
        ],
      });

      const store = await modules.store.readMvpStore();
      const updatedStage = store.stages.find((stage) => stage.id === "stage_backend_architecture");
      const createdStageId = result.stageIdMap["temp-stage-past-projects"];
      const createdStage = createdStageId
        ? store.stages.find((stage) => stage.id === createdStageId)
        : undefined;
      const flow = store.flows.find((item) => item.id === "flow_backend_loop_v1");

      expect(store.companies.some((item) => item.id === company.id)).toBe(true);
      expect(flow?.name).toBe("Staff Backend Loop v2");
      expect(flow?.targetAxisIds).toEqual([
        "axis_system_design",
        "axis_ownership",
        "axis_communication",
      ]);
      expect(updatedStage?.name).toBe("Architecture deep dive");
      expect(updatedStage?.questionIds).toEqual(["question_claims_dashboard"]);
      expect(updatedStage?.canvasX).toBe(40);
      expect(updatedStage?.canvasY).toBe(60);
      expect(updatedStage?.orderIndex).toBe(1);
      expect(createdStage?.name).toBe("Past projects");
      expect(createdStage?.questionIds).toEqual(["question_stakeholder_tradeoffs"]);
      expect(store.questions.find((question) => question.id === "question_stakeholder_tradeoffs")?.stageIds).toContain(
        createdStageId,
      );
    });
  });

  test("saveFlowLayout rejects removing referenced stages from an active loop", async () => {
    await withMvpTestContext(async ({ modules }) => {
      await expect(
        modules.store.saveFlowLayout("role_frontend_senior", {
          flowName: "Senior Frontend Loop",
          targetAxisIds: [
            "axis_coding",
            "axis_system_design",
            "axis_ownership",
            "axis_communication",
            "axis_product_judgment",
          ],
          stages: [
            {
              id: "stage_frontend_coding",
              name: "Frontend coding",
              description: "Debug and extend a real UI scenario with evidence-based scoring.",
              durationMinutes: 60,
              interviewerRole: "Senior frontend engineer",
              scoringRules: [
                "Every axis score must include evidence.",
                "Candidate should leave with at least one code path or experiment plan.",
              ],
              questionIds: ["question_latency_debug", "question_incident_ownership"],
              canvasX: 40,
              canvasY: 70,
              orderIndex: 1,
            },
            {
              id: "stage_hiring_manager",
              name: "Hiring manager",
              description: "Probe ownership, communication, and product tradeoffs in ambiguous work.",
              durationMinutes: 45,
              interviewerRole: "Hiring manager",
              scoringRules: [
                "Use follow-ups to test prioritization under conflict.",
                "Block submission if recommendation and evidence do not match.",
              ],
              questionIds: ["question_stakeholder_tradeoffs"],
              canvasX: 680,
              canvasY: 70,
              orderIndex: 2,
            },
          ],
        }),
      ).rejects.toThrow(/cannot be removed/i);
    });
  });

  test("saveFlowLayout validates publish requirements and activates publishable loops", async () => {
    await withMvpTestContext(async ({ modules }) => {
      await expect(
        modules.store.saveFlowLayout("role_backend_staff", {
          flowName: "Staff Backend Loop",
          status: "active",
          targetAxisIds: ["axis_system_design", "axis_ownership"],
          stages: [
            {
              id: "stage_backend_architecture",
              name: "Distributed systems architecture",
              description: "Draft stage for the next role family.",
              durationMinutes: 60,
              interviewerRole: "Staff backend engineer",
              scoringRules: ["Draft stage awaiting question assignment."],
              questionIds: [],
              canvasX: 60,
              canvasY: 90,
              orderIndex: 1,
            },
          ],
        }),
      ).rejects.toThrow(/at least one question/i);

      await expect(
        modules.store.saveFlowLayout("role_backend_staff", {
          flowName: "Staff Backend Loop",
          status: "active",
          targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
          stages: [
            {
              id: "stage_backend_architecture",
              name: "Distributed systems architecture",
              description: "Draft stage for the next role family.",
              durationMinutes: 60,
              interviewerRole: "Staff backend engineer",
              scoringRules: ["Draft stage awaiting question assignment."],
              questionIds: ["question_claims_dashboard"],
              canvasX: 60,
              canvasY: 90,
              orderIndex: 1,
            },
          ],
        }),
      ).rejects.toThrow(/uncovered target axes/i);

      const result = await modules.store.saveFlowLayout("role_backend_staff", {
        flowName: "Staff Backend Loop",
        status: "active",
        targetAxisIds: ["axis_system_design", "axis_ownership", "axis_communication"],
        stages: [
          {
            id: "stage_backend_architecture",
            name: "Distributed systems architecture",
            description: "Draft stage for the next role family.",
            durationMinutes: 60,
            interviewerRole: "Staff backend engineer",
            scoringRules: ["Draft stage awaiting question assignment."],
            questionIds: ["question_claims_dashboard", "question_stakeholder_tradeoffs"],
            canvasX: 60,
            canvasY: 90,
            orderIndex: 1,
          },
        ],
      });

      const store = await modules.store.readMvpStore();
      const flow = store.flows.find((item) => item.id === "flow_backend_loop_v1");

      expect(result.status).toBe("active");
      expect(flow?.status).toBe("active");
      expect(store.auditLogs[0]?.action).toBe("published_flow");
    });
  });

  test("createBankQuestion supports a global question with no role context", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.createBankQuestion({
        title: "Global bank prompt",
        prompt: "Tell me about a disagreement you resolved with new evidence.",
        difficulty: 3,
        seniority: "senior",
        axisIds: ["axis_communication"],
        followUps: [],
        expectedSignals: ["Communication"],
        expectedDurationMinutes: 15,
        collection: "Leadership",
        roleFamily: "Engineering",
      });

      expect(question.stageIds).toEqual([]);
      expect(question.roleIds).toEqual([]);
    });
  });

  test("updateQuestion preserves attachments and rebuilds rubric coverage", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.createQuestion("stage_backend_architecture", {
        title: "Design a queue fan-out pipeline",
        prompt: "Walk through a queue fan-out system.",
        difficulty: 4,
        seniority: "staff",
        axisIds: ["axis_system_design", "axis_ownership"],
        followUps: ["Where would retries live?"],
        expectedSignals: ["System boundaries"],
        expectedDurationMinutes: 30,
        collection: "Engineering",
        roleFamily: "Backend engineering",
      });

      const updated = await modules.store.updateQuestion(question.id, {
        title: "Design a queue fan-out pipeline",
        prompt: "Walk through a queue fan-out system when downstream consumers fail intermittently.",
        difficulty: 5,
        seniority: "staff",
        levels: ["staff"],
        axisIds: ["axis_communication"],
        followUps: ["How do you explain the failure mode to partner teams?"],
        expectedSignals: ["Clear communication"],
        expectedDurationMinutes: 35,
        collection: "Engineering",
        roleFamily: "Backend engineering",
        rationale: "Tests whether staff candidates stay crisp while the system is unstable.",
        anchors: [
          "A 1 looks like: speaks vaguely about the failure mode.",
          "A 3 looks like: explains the failure and names a reasonable recovery path.",
          "A 5 looks like: keeps the design and communication paths equally clear under failure.",
        ],
      });

      const store = await modules.store.readMvpStore();
      const stage = store.stages.find((item) => item.id === "stage_backend_architecture");
      const rubrics = store.rubrics.filter((rubric) => rubric.questionId === question.id);

      expect(updated.stageIds).toEqual(["stage_backend_architecture"]);
      expect(stage?.questionIds).toContain(question.id);
      expect(stage?.axisIds).toEqual(["axis_communication"]);
      expect(rubrics).toHaveLength(1);
      expect(rubrics[0]?.axisId).toBe("axis_communication");
    });
  });

  test("attachQuestionToStages adds a bank question to multiple stages in the active flow", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.createBankQuestion({
        title: "Cross-functional tradeoff prompt",
        prompt: "Tell me about a time you had to align stakeholders around a technical tradeoff.",
        difficulty: 4,
        seniority: "senior",
        axisIds: ["axis_system_design", "axis_communication"],
        followUps: ["What changed the decision?"],
        expectedSignals: ["Tradeoff framing", "Clear alignment"],
        expectedDurationMinutes: 25,
        collection: "Leadership",
        roleFamily: "Frontend engineering",
      });

      const result = await modules.store.attachQuestionToStages(question.id, {
        stageIds: ["stage_frontend_coding", "stage_hiring_manager"],
      });

      const store = await modules.store.readMvpStore();
      const attachedQuestion = store.questions.find((item) => item.id === question.id);
      const codingStage = store.stages.find((stage) => stage.id === "stage_frontend_coding");
      const managerStage = store.stages.find((stage) => stage.id === "stage_hiring_manager");

      expect(result.attachedStageIds).toEqual(["stage_frontend_coding", "stage_hiring_manager"]);
      expect(attachedQuestion?.stageIds).toEqual(["stage_frontend_coding", "stage_hiring_manager"]);
      expect(attachedQuestion?.roleIds).toContain("role_frontend_senior");
      expect(codingStage?.questionIds).toContain(question.id);
      expect(managerStage?.questionIds).toContain(question.id);
      expect(codingStage?.axisIds).toContain("axis_system_design");
      expect(managerStage?.axisIds).toContain("axis_system_design");
    });
  });

  test("getQuestion exposes an existing question for duplicate and edit prefills", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const question = await modules.store.getQuestion(
        "role_frontend_senior",
        "question_claims_dashboard",
      );

      expect(question?.prompt).toContain("Design a frontend system for reviewing employee claims");
      expect(question?.followUps).toEqual(
        expect.arrayContaining(["How would you handle permission-based views?"]),
      );
      expect(question?.anchors[2]).toContain("A 5 looks like");
    });
  });

  test("importQuestionsFromCsv imports unattached questions and reports invalid rows", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const csv = [
        "prompt,collection,roleFamily,levels,difficulty,expectedDurationMinutes,axisTags,rationale,followUps,anchor1,anchor3,anchor5",
        "\"Walk me through a product bet that failed.\",Leadership,Frontend engineering,\"L4|L5\",3,20,\"product judgment|communication\",\"Tests reflection and product reasoning.\",\"What changed after launch?|How did you communicate the miss?\",\"A 1 looks like: stays generic.\",\"A 3 looks like: explains the tradeoff and the miss.\",\"A 5 looks like: reframes the bet with evidence.\"",
        "\"Broken import row\",Leadership,Frontend engineering,,6,0,\"unknown-tag\",,,,,",
      ].join("\n");

      const result = await modules.store.importQuestionsFromCsv("role_frontend_senior", csv);
      const store = await modules.store.readMvpStore();
      const imported = store.questions.find((item) => item.id === result.questionIds[0]);

      expect(result.importedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors[0]).toEqual({
        row: 3,
        message: "Row is missing required values or uses unknown level/tag values.",
      });
      expect(imported?.stageIds).toEqual([]);
      expect(imported?.usedLastQuarter).toBe(0);
      expect(imported?.signalScore).toBeGreaterThan(0);
    });
  });

  test("upsertConnection activates greenhouse and masks the stored credential", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const connection = await modules.store.upsertConnection("greenhouse", {
        apiKey: "gh_test_secret",
      });

      expect(connection.status).toBe("active");
      expect(connection.encryptedCredential).toBe("enc:gh_t••••");

      const store = await modules.store.readMvpStore();
      expect(store.atsConnections.find((item) => item.provider === "greenhouse")?.status).toBe("active");
    });
  });

  test("saveJobMapping creates and then updates a mapping without duplication", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const created = await modules.store.saveJobMapping("ashby", {
        externalJobId: "ashby_job_backend",
        froggyRoleId: "role_backend_staff",
        froggyFlowId: "flow_backend_loop_v1",
      });

      const updated = await modules.store.saveJobMapping("ashby", {
        externalJobId: "ashby_job_backend",
        froggyRoleId: "role_frontend_senior",
        froggyFlowId: "flow_frontend_loop_v1",
      });

      const store = await modules.store.readMvpStore();
      const mappings = store.atsJobMappings.filter((item) => item.externalJobId === "ashby_job_backend");

      expect(created.id).toBe(updated.id);
      expect(mappings).toHaveLength(1);
      expect(mappings[0]?.froggyRoleId).toBe("role_frontend_senior");
    });
  });

  test("saveStageMapping creates and then updates a stage mapping without duplication", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const createdJobMapping = await modules.store.saveJobMapping("ashby", {
        externalJobId: "ashby_job_backend",
        froggyRoleId: "role_backend_staff",
        froggyFlowId: "flow_backend_loop_v1",
      });

      const created = await modules.store.saveStageMapping("ashby", {
        atsJobMappingId: createdJobMapping.id,
        externalStageId: "ashby_stage_backend_design",
        froggyStageId: "stage_backend_architecture",
      });

      const updated = await modules.store.saveStageMapping("ashby", {
        atsJobMappingId: createdJobMapping.id,
        externalStageId: "ashby_stage_backend_design",
        froggyStageId: "stage_frontend_system_design",
      });

      const store = await modules.store.readMvpStore();
      const mappings = store.atsStageMappings.filter(
        (item) =>
          item.atsJobMappingId === createdJobMapping.id &&
          item.externalStageId === "ashby_stage_backend_design",
      );

      expect(created.id).toBe(updated.id);
      expect(mappings).toHaveLength(1);
      expect(mappings[0]?.froggyStageId).toBe("stage_frontend_system_design");
    });
  });

  test("syncProvider creates a mapped session with snapshots and does not duplicate on a second run", async () => {
    await withMvpTestContext(async ({ modules }) => {
      await modules.store.saveJobMapping("ashby", {
        externalJobId: "ashby_job_backend",
        froggyRoleId: "role_backend_staff",
        froggyFlowId: "flow_backend_loop_v1",
      });
      await modules.store.createQuestion("stage_backend_architecture", {
        title: "Design a queue fan-out pipeline",
        prompt: "Walk through the read, write, and retry boundaries for a queue fan-out system.",
        difficulty: 5,
        seniority: "staff",
        axisIds: ["axis_system_design"],
        followUps: ["How do you retry safely?"],
        expectedSignals: ["System boundaries"],
        expectedDurationMinutes: 35,
        collection: "Engineering",
        roleFamily: "Backend engineering",
      });
      const jobMapping = (await modules.store.readMvpStore()).atsJobMappings.find(
        (item) => item.externalJobId === "ashby_job_backend" && item.provider === "ashby",
      );
      if (!jobMapping) {
        throw new Error("Expected job mapping for backend Ashby job.");
      }
      await modules.store.saveStageMapping("ashby", {
        atsJobMappingId: jobMapping.id,
        externalStageId: "ashby_stage_backend_design",
        froggyStageId: "stage_backend_architecture",
      });

      const first = await modules.store.syncProvider("ashby");
      const second = await modules.store.syncProvider("ashby");
      const store = await modules.store.readMvpStore();
      const ivySessions = store.sessions.filter((session) => session.applicationId === "app_ivy_backend");
      const ivySnapshots = store.sessionQuestionSnapshots.filter(
        (snapshot) => ivySessions.some((session) => session.id === snapshot.sessionId),
      );

      expect(first.createdSessions).toBe(1);
      expect(second.createdSessions).toBe(0);
      expect(ivySessions).toHaveLength(1);
      expect(ivySnapshots).toHaveLength(1);
    });
  });

  test("createInterviewSession deduplicates by external interview id and by application plus stage", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const first = await modules.store.createInterviewSession({
        applicationId: "app_sarah_frontend",
        froggyStageId: "stage_hiring_manager",
        externalInterviewId: "ashby_interview_manual_1",
      });
      const duplicateByExternalId = await modules.store.createInterviewSession({
        applicationId: "app_marcus_frontend",
        froggyStageId: "stage_hiring_manager",
        externalInterviewId: "ashby_interview_manual_1",
      });
      const duplicateByStage = await modules.store.createInterviewSession({
        applicationId: "app_sarah_frontend",
        froggyStageId: "stage_hiring_manager",
      });

      const store = await modules.store.readMvpStore();
      const hmSessions = store.sessions.filter(
        (session) =>
          session.applicationId === "app_sarah_frontend" && session.froggyStageId === "stage_hiring_manager",
      );

      expect(duplicateByExternalId.id).toBe(first.id);
      expect(duplicateByStage.id).toBe(first.id);
      expect(hmSessions).toHaveLength(1);
    });
  });

  test("submitScorecard validates required axes and evidence", async () => {
    await withMvpTestContext(async ({ modules }) => {
      await expect(
        modules.store.submitScorecard("session_sarah_sysdesign", {
          recommendation: "lean_yes",
          confidence: 4,
          overallNotes: "Solid interview.",
          axisScores: [
            {
              axisId: "axis_system_design",
              score: 4,
              evidence: "Strong architectural framing.",
            },
          ],
          questionNotes: [],
        }),
      ).rejects.toThrow("Missing required score for Product judgment.");

      await expect(
        modules.store.submitScorecard("session_sarah_sysdesign", {
          recommendation: "lean_yes",
          confidence: 4,
          overallNotes: "Solid interview.",
          axisScores: [
            {
              axisId: "axis_system_design",
              score: 4,
              evidence: "Strong architectural framing.",
            },
            {
              axisId: "axis_product_judgment",
              score: 3,
              evidence: "",
            },
            {
              axisId: "axis_communication",
              score: 4,
              evidence: "Clear communication throughout.",
            },
          ],
          questionNotes: [],
        }),
      ).rejects.toThrow("Evidence is required for Product judgment.");
    });
  });

  test("submitScorecard locks feedback, creates a write-back job, and blocks resubmission", async () => {
    await withMvpTestContext(async ({ modules }) => {
      const result = await modules.store.submitScorecard("session_sarah_sysdesign", {
        recommendation: "lean_yes",
        confidence: 4,
        overallNotes: "Strong system design and product framing.",
        axisScores: [
          {
            axisId: "axis_system_design",
            score: 4,
            evidence: "Clarified boundaries and proposed sensible tradeoffs.",
          },
          {
            axisId: "axis_product_judgment",
            score: 3,
            evidence: "Balanced candidate experience and implementation scope.",
          },
          {
            axisId: "axis_communication",
            score: 4,
            evidence: "Stayed structured and adapted to follow-ups.",
          },
        ],
        questionNotes: [
          {
            questionId: "question_claims_dashboard",
            notes: "Strong architecture reasoning.",
          },
        ],
      });

      const store = await modules.store.readMvpStore();
      const scorecard = store.scorecards.find((item) => item.id === result.scorecardId);
      const writeback = store.writebackJobs.find((item) => item.scorecardId === result.scorecardId);
      const session = store.sessions.find((item) => item.id === "session_sarah_sysdesign");

      expect(scorecard?.locked).toBe(true);
      expect(writeback?.status).toBe("success");
      expect(writeback?.mode).toBe("candidate_note");
      expect(session?.status).toBe("submitted");

      await expect(
        modules.store.submitScorecard("session_sarah_sysdesign", {
          recommendation: "yes",
          confidence: 5,
          overallNotes: "Trying to resubmit.",
          axisScores: [
            {
              axisId: "axis_system_design",
              score: 5,
              evidence: "Updated evidence.",
            },
            {
              axisId: "axis_product_judgment",
              score: 5,
              evidence: "Updated evidence.",
            },
            {
              axisId: "axis_communication",
              score: 5,
              evidence: "Updated evidence.",
            },
          ],
          questionNotes: [],
        }),
      ).rejects.toThrow("Feedback is already locked for this interview.");
    });
  });

  test("getGuide and getPacket expose snapped questions, computed averages, and ATS summary output", async () => {
    await withMvpTestContext(async ({ modules }) => {
      await modules.store.createInterviewSession({
        applicationId: "app_sarah_frontend",
        froggyStageId: "stage_hiring_manager",
      });
      await modules.store.submitScorecard("session_sarah_sysdesign", {
        recommendation: "lean_yes",
        confidence: 4,
        overallNotes: "Strong system design and product framing.",
        axisScores: [
          {
            axisId: "axis_system_design",
            score: 4,
            evidence: "Clarified boundaries and proposed sensible tradeoffs.",
          },
          {
            axisId: "axis_product_judgment",
            score: 3,
            evidence: "Balanced candidate experience and implementation scope.",
          },
          {
            axisId: "axis_communication",
            score: 4,
            evidence: "Stayed structured and adapted to follow-ups.",
          },
        ],
        questionNotes: [
          {
            questionId: "question_claims_dashboard",
            notes: "Strong architecture reasoning.",
          },
        ],
      });

      const guide = await modules.store.getGuide("session_sarah_sysdesign");
      const packet = await modules.store.getPacket("app_sarah_frontend");

      expect(guide?.questions).toHaveLength(2);
      expect(guide?.existingScorecard?.locked).toBe(true);
      expect(packet?.overallRecommendation).toBe("lean_yes");
      expect(packet?.axisSummary.find((axis) => axis.axis === "System design")?.averageScore).toBe(4);
      expect(packet?.missingSignals).toContain("Ownership");
      expect(packet?.atsSummary).toContain("Recommendation: lean yes");
    });
  });
});
