import type {
  AuditLog,
  Company,
  CandidateApplication,
  EvaluationAxis,
  InterviewFlow,
  InterviewSession,
  InterviewSessionQuestionSnapshot,
  InterviewStage,
  MvpStore,
  Organization,
  Question,
  Role,
  Rubric,
  Scorecard,
  ScorecardAxisScore,
  ScorecardQuestionNote,
  User,
  AtsConnection,
  AtsJob,
  AtsJobMapping,
  AtsStage,
  AtsStageMapping,
  AtsWritebackJob,
} from "@/lib/mvp/types";

const organization: Organization = {
  id: "org_froggy",
  name: "Froggy Labs",
};

const users: User[] = [
  {
    id: "user_josh",
    orgId: organization.id,
    email: "josh@froggy.dev",
    name: "Josh",
    role: "admin",
  },
  {
    id: "user_priya",
    orgId: organization.id,
    email: "priya@froggy.dev",
    name: "Priya Raman",
    role: "hiring_manager",
  },
  {
    id: "user_maya",
    orgId: organization.id,
    email: "maya@froggy.dev",
    name: "Maya Ortiz",
    role: "interviewer",
  },
  {
    id: "user_eli",
    orgId: organization.id,
    email: "eli@froggy.dev",
    name: "Eli Chen",
    role: "recruiter",
  },
];

const companies: Company[] = [
  {
    id: "company_stripe",
    orgId: organization.id,
    name: "Stripe",
    slug: "stripe",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Stripe_logo%2C_revised_2016.svg/512px-Stripe_logo%2C_revised_2016.svg.png",
    website: "https://stripe.com",
    createdAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: "company_airbnb",
    orgId: organization.id,
    name: "Airbnb",
    slug: "airbnb",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/512px-Airbnb_Logo_B%C3%A9lo.svg.png",
    website: "https://airbnb.com",
    createdAt: "2026-05-01T08:05:00.000Z",
  },
  {
    id: "company_notion",
    orgId: organization.id,
    name: "Notion",
    slug: "notion",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Notion_app_logo.png/512px-Notion_app_logo.png",
    website: "https://notion.so",
    createdAt: "2026-05-01T08:10:00.000Z",
  },
];

const axes: EvaluationAxis[] = [
  {
    id: "axis_coding",
    orgId: organization.id,
    name: "Coding",
    description: "Writes clear, correct code and debugs methodically under time pressure.",
    positiveSignals: ["Finds a correct core approach quickly", "Explains tradeoffs while coding"],
    negativeSignals: ["Gets stuck on syntax details", "Leaves obvious bugs unresolved"],
    anchoredBands: [
      "Needs heavy prompting and cannot reach a working shape.",
      "Reaches parts of the solution but leaves major gaps.",
      "Produces a workable baseline with some coaching.",
      "Solves the core problem cleanly and checks edge cases.",
      "Solves efficiently, communicates tradeoffs, and improves the design under pressure.",
    ],
  },
  {
    id: "axis_system_design",
    orgId: organization.id,
    name: "System design",
    description: "Designs durable architectures with clear boundaries, tradeoffs, and scale awareness.",
    positiveSignals: ["Clarifies requirements early", "Uses appropriate APIs and data flows"],
    negativeSignals: ["Skips requirements", "Misses operational or scale constraints"],
    anchoredBands: [
      "Jumps into a design without structure or requirements.",
      "Names pieces of a design but leaves major gaps in data flow or scale.",
      "Builds a functional design that covers the happy path.",
      "Balances architecture, user experience, and tradeoffs well.",
      "Designs with clarity, prioritization, resilience, and strong tradeoff reasoning.",
    ],
  },
  {
    id: "axis_communication",
    orgId: organization.id,
    name: "Communication",
    description: "Explains reasoning clearly, adapts to follow-ups, and keeps interviewers aligned.",
    positiveSignals: ["Uses structure", "Responds well to ambiguity"],
    negativeSignals: ["Answers wander", "Struggles to align on tradeoffs"],
    anchoredBands: [
      "Difficult to follow and misses core questions.",
      "Some signal is present, but the answer stays disorganized.",
      "Communicates clearly enough to collaborate on the problem.",
      "Explains tradeoffs and incorporates feedback smoothly.",
      "Leads a crisp, high-signal conversation that improves the final answer.",
    ],
  },
  {
    id: "axis_ownership",
    orgId: organization.id,
    name: "Ownership",
    description: "Takes responsibility for ambiguous work, follow-through, and operational outcomes.",
    positiveSignals: ["Names monitoring and follow-up steps", "Pushes on root causes"],
    negativeSignals: ["Stops at the first fix", "Avoids tradeoffs and accountability"],
    anchoredBands: [
      "Avoids ownership and focuses only on the narrow prompt.",
      "Can name actions but not the follow-through plan.",
      "Shows reasonable responsibility for delivery and quality.",
      "Connects technical decisions to operational outcomes and follow-up.",
      "Shows strong initiative, risk management, and end-to-end accountability.",
    ],
  },
  {
    id: "axis_product_judgment",
    orgId: organization.id,
    name: "Product judgment",
    description: "Balances candidate experience, user needs, and product tradeoffs in technical decisions.",
    positiveSignals: ["Prioritizes user impact", "Makes tradeoffs explicit"],
    negativeSignals: ["Optimizes only for engineering convenience", "Misses user risk"],
    anchoredBands: [
      "Misses the user problem and cannot prioritize tradeoffs.",
      "Shows some intuition but does not connect choices to users.",
      "Balances user and engineering concerns on the main path.",
      "Makes thoughtful tradeoffs grounded in product impact.",
      "Frames the problem exceptionally well and drives toward the highest-value decision.",
    ],
  },
];

const roles: Role[] = [
  {
    id: "role_frontend_senior",
    orgId: organization.id,
    name: "Senior Frontend Engineer",
    level: "senior",
  },
  {
    id: "role_backend_staff",
    orgId: organization.id,
    name: "Staff Backend Engineer",
    level: "staff",
  },
];

const flows: InterviewFlow[] = [
  {
    id: "flow_frontend_loop_v1",
    orgId: organization.id,
    roleId: "role_frontend_senior",
    name: "Senior Frontend Loop",
    version: 1,
    status: "active",
    targetAxisIds: [
      "axis_coding",
      "axis_system_design",
      "axis_ownership",
      "axis_communication",
      "axis_product_judgment",
    ],
    createdBy: "user_priya",
  },
  {
    id: "flow_backend_loop_v1",
    orgId: organization.id,
    roleId: "role_backend_staff",
    name: "Staff Backend Loop",
    version: 1,
    status: "draft",
    targetAxisIds: ["axis_system_design", "axis_ownership"],
    createdBy: "user_priya",
  },
];

const stages: InterviewStage[] = [
  {
    id: "stage_frontend_coding",
    flowId: "flow_frontend_loop_v1",
    name: "Frontend coding",
    description: "Debug and extend a real UI scenario with evidence-based scoring.",
    orderIndex: 1,
    canvasX: 40,
    canvasY: 70,
    durationMinutes: 60,
    interviewerRole: "Senior frontend engineer",
    questionIds: ["question_latency_debug", "question_incident_ownership"],
    axisIds: ["axis_coding", "axis_ownership", "axis_communication"],
    scoringRules: [
      "Every axis score must include evidence.",
      "Candidate should leave with at least one code path or experiment plan.",
    ],
  },
  {
    id: "stage_frontend_system_design",
    flowId: "flow_frontend_loop_v1",
    name: "Frontend system design",
    description: "Evaluate architecture, tradeoffs, and collaboration on a product-facing scenario.",
    orderIndex: 2,
    canvasX: 360,
    canvasY: 70,
    durationMinutes: 60,
    interviewerRole: "Tech lead",
    questionIds: ["question_claims_dashboard", "question_access_model"],
    axisIds: ["axis_system_design", "axis_product_judgment", "axis_communication"],
    scoringRules: [
      "Spend the first five minutes clarifying requirements.",
      "Score product judgment separately from architecture quality.",
    ],
  },
  {
    id: "stage_hiring_manager",
    flowId: "flow_frontend_loop_v1",
    name: "Hiring manager",
    description: "Probe ownership, communication, and product tradeoffs in ambiguous work.",
    orderIndex: 3,
    canvasX: 680,
    canvasY: 70,
    durationMinutes: 45,
    interviewerRole: "Hiring manager",
    questionIds: ["question_stakeholder_tradeoffs"],
    axisIds: ["axis_ownership", "axis_communication", "axis_product_judgment"],
    scoringRules: [
      "Use follow-ups to test prioritization under conflict.",
      "Block submission if recommendation and evidence do not match.",
    ],
  },
  {
    id: "stage_backend_architecture",
    flowId: "flow_backend_loop_v1",
    name: "Distributed systems architecture",
    description: "Draft stage for the next role family.",
    orderIndex: 1,
    canvasX: 60,
    canvasY: 90,
    durationMinutes: 60,
    interviewerRole: "Staff backend engineer",
    questionIds: [],
    axisIds: ["axis_system_design", "axis_ownership"],
    scoringRules: ["Draft stage awaiting question assignment."],
  },
];

const questions: Question[] = [
  {
    id: "question_latency_debug",
    orgId: organization.id,
    roleIds: ["role_frontend_senior"],
    companyIds: ["company_stripe"],
    collection: "Engineering",
    title: "Debug a p99 regression with no deploy",
    prompt:
      "A critical dashboard tripled in p99 latency overnight without a deploy. Walk through how you would debug, instrument, and stabilize the experience.",
    difficulty: 4,
    seniority: "senior",
    levels: ["senior", "staff"],
    axisIds: ["axis_coding", "axis_ownership", "axis_communication"],
    followUps: [
      "What would you inspect first if logs are incomplete?",
      "How would you balance user mitigation with root-cause analysis?",
    ],
    expectedSignals: ["Structured debugging", "Operational ownership", "Clear communication"],
    expectedDurationMinutes: 25,
    roleFamily: "Frontend engineering",
    usedLastQuarter: 9,
    signalScore: 0.86,
    stageIds: ["stage_frontend_coding"],
    rationale:
      "High-signal debugging probe that shows whether a candidate forms hypotheses, sequences investigations, and communicates tradeoffs under pressure.",
    anchors: [
      "A 1 looks like: jumps straight into random fixes without narrowing the problem.",
      "A 3 looks like: checks the main signals, forms a plausible hypothesis, and stabilizes the user path.",
      "A 5 looks like: builds a crisp hypothesis tree, prioritizes tests, and balances mitigation with durable follow-through.",
    ],
    createdAt: "2026-05-04T09:15:00.000Z",
  },
  {
    id: "question_incident_ownership",
    orgId: organization.id,
    roleIds: ["role_frontend_senior"],
    companyIds: ["company_airbnb"],
    collection: "Engineering",
    title: "Recover a broken release with an upset internal team",
    prompt:
      "A release introduced a subtle data mismatch. Explain how you would stabilize the issue, coordinate stakeholders, and prevent repeat incidents.",
    difficulty: 3,
    seniority: "senior",
    levels: ["mid", "senior"],
    axisIds: ["axis_ownership", "axis_communication"],
    followUps: [
      "How would you document the incident afterward?",
      "When would you roll back versus hotfix?",
    ],
    expectedSignals: ["Judgment under pressure", "Cross-functional coordination"],
    expectedDurationMinutes: 20,
    roleFamily: "Frontend engineering",
    usedLastQuarter: 6,
    signalScore: 0.73,
    stageIds: ["stage_frontend_coding"],
    rationale:
      "Useful for separating candidates who only coordinate the immediate fix from candidates who actually own recovery, communication, and prevention.",
    anchors: [
      "A 1 looks like: focuses only on the technical patch and ignores communication or follow-through.",
      "A 3 looks like: sequences the rollback or hotfix, keeps stakeholders informed, and closes the loop.",
      "A 5 looks like: drives stabilization, communicates crisply across functions, and names the prevention plan with clear ownership.",
    ],
    createdAt: "2026-04-28T11:20:00.000Z",
  },
  {
    id: "question_claims_dashboard",
    orgId: organization.id,
    roleIds: ["role_frontend_senior"],
    companyIds: ["company_notion", "company_airbnb"],
    collection: "Engineering",
    title: "Design a claims dashboard",
    prompt:
      "Design a frontend system for reviewing employee claims across large lists, multiple states, and role-based permissions.",
    difficulty: 5,
    seniority: "senior",
    levels: ["senior", "staff"],
    axisIds: ["axis_system_design", "axis_product_judgment", "axis_communication"],
    followUps: [
      "How would you handle permission-based views?",
      "How would you prioritize data freshness versus load time?",
    ],
    expectedSignals: ["Architecture clarity", "Product tradeoffs", "Communication"],
    expectedDurationMinutes: 30,
    roleFamily: "Frontend engineering",
    usedLastQuarter: 11,
    signalScore: 0.91,
    stageIds: ["stage_frontend_system_design"],
    rationale:
      "A durable frontend system-design prompt that reveals requirements clarity, architectural judgment, and whether the candidate thinks about real user risks.",
    anchors: [
      "A 1 looks like: sketches a UI without clarifying data flow, permissions, or scale.",
      "A 3 looks like: covers the main architecture, names key states, and makes a few explicit tradeoffs.",
      "A 5 looks like: structures the problem well, balances UX and technical constraints, and reasons clearly about permissions, freshness, and resilience.",
    ],
    createdAt: "2026-05-05T08:45:00.000Z",
  },
  {
    id: "question_access_model",
    orgId: organization.id,
    roleIds: ["role_frontend_senior"],
    companyIds: ["company_notion"],
    collection: "Engineering",
    title: "Model access control for a shared workspace",
    prompt:
      "You need to support admins, reviewers, and requesters in a shared workspace. Sketch the access model, edge cases, and interface risks.",
    difficulty: 4,
    seniority: "senior",
    levels: ["senior", "staff", "manager"],
    axisIds: ["axis_system_design", "axis_product_judgment"],
    followUps: [
      "What would you do if backend permissions lag the UI?",
      "How would you test role transitions safely?",
    ],
    expectedSignals: ["Data model thinking", "Risk identification"],
    expectedDurationMinutes: 20,
    roleFamily: "Frontend engineering",
    usedLastQuarter: 5,
    signalScore: 0.77,
    stageIds: ["stage_frontend_system_design"],
    rationale:
      "Good second-stage design probe for candidates who need to show risk identification and product judgment around permissions and edge cases.",
    anchors: [
      "A 1 looks like: treats permissions as a simple UI toggle and misses failure modes.",
      "A 3 looks like: models the main roles correctly and identifies a few risky transitions.",
      "A 5 looks like: captures the access model cleanly, calls out stale-state risks, and proposes strong testing and recovery strategies.",
    ],
    createdAt: "2026-04-23T16:05:00.000Z",
  },
  {
    id: "question_stakeholder_tradeoffs",
    orgId: organization.id,
    roleIds: ["role_frontend_senior"],
    companyIds: ["company_airbnb", "company_stripe"],
    collection: "Leadership",
    title: "Navigate a high-stakes stakeholder conflict",
    prompt:
      "Product wants speed, compliance wants safeguards, and support wants fewer escalations. How would you drive a decision and keep the launch on track?",
    difficulty: 4,
    seniority: "senior",
    levels: ["senior", "staff", "manager"],
    axisIds: ["axis_ownership", "axis_communication", "axis_product_judgment"],
    followUps: [
      "How would you communicate the tradeoff to leadership?",
      "What would change if the decision affected an enterprise customer?",
    ],
    expectedSignals: ["Prioritization", "Executive communication", "User empathy"],
    expectedDurationMinutes: 25,
    roleFamily: "Frontend engineering",
    usedLastQuarter: 8,
    signalScore: 0.82,
    stageIds: ["stage_hiring_manager"],
    rationale:
      "Strong hiring-manager prompt for ambiguous tradeoffs where candidates need to align speed, safeguards, and customer impact without hand-waving.",
    anchors: [
      "A 1 looks like: picks a side quickly and does not surface the tradeoff explicitly.",
      "A 3 looks like: frames the competing needs, makes a reasonable call, and communicates it clearly.",
      "A 5 looks like: builds alignment around a principled decision, protects user risk, and keeps execution moving with explicit tradeoff language.",
    ],
    createdAt: "2026-05-01T13:30:00.000Z",
  },
];

function buildRubric(questionId: string, axisId: string): Rubric {
  const axis = axes.find((item) => item.id === axisId);
  if (!axis) {
    throw new Error(`Missing axis ${axisId}`);
  }

  return {
    id: `rubric_${questionId}_${axisId}`,
    questionId,
    axisId,
    score1: axis.anchoredBands[0],
    score2: axis.anchoredBands[1],
    score3: axis.anchoredBands[2],
    score4: axis.anchoredBands[3],
    score5: axis.anchoredBands[4],
  };
}

const rubrics: Rubric[] = questions.flatMap((question) =>
  question.axisIds.map((axisId) => buildRubric(question.id, axisId)),
);

const atsConnections: AtsConnection[] = [
  {
    id: "conn_ashby",
    orgId: organization.id,
    provider: "ashby",
    encryptedCredential: "enc:ashby-demo",
    status: "active",
    lastSyncedAt: "2026-05-05T02:45:00.000Z",
    capabilities: {
      canReadJobs: true,
      canReadApplications: true,
      canReadInterviews: true,
      canSubmitStructuredFeedback: false,
      canCreateCandidateNote: true,
      canAttachPdf: true,
    },
  },
  {
    id: "conn_greenhouse",
    orgId: organization.id,
    provider: "greenhouse",
    encryptedCredential: "",
    status: "disabled",
    capabilities: {
      canReadJobs: true,
      canReadApplications: true,
      canReadInterviews: true,
      canSubmitStructuredFeedback: false,
      canCreateCandidateNote: true,
      canAttachPdf: true,
    },
  },
];

const atsJobs: AtsJob[] = [
  {
    id: "job_ashby_frontend",
    orgId: organization.id,
    provider: "ashby",
    externalJobId: "ashby_job_frontend",
    name: "Senior Frontend Engineer",
    status: "open",
  },
  {
    id: "job_ashby_backend",
    orgId: organization.id,
    provider: "ashby",
    externalJobId: "ashby_job_backend",
    name: "Staff Backend Engineer",
    status: "open",
  },
  {
    id: "job_greenhouse_mobile",
    orgId: organization.id,
    provider: "greenhouse",
    externalJobId: "greenhouse_job_mobile",
    name: "Senior Mobile Engineer",
    status: "draft",
  },
];

const atsStages: AtsStage[] = [
  {
    id: "ats_stage_ashby_coding",
    orgId: organization.id,
    provider: "ashby",
    externalStageId: "ashby_stage_coding",
    externalJobId: "ashby_job_frontend",
    name: "Frontend coding",
    orderIndex: 1,
  },
  {
    id: "ats_stage_ashby_sysdesign",
    orgId: organization.id,
    provider: "ashby",
    externalStageId: "ashby_stage_sysdesign",
    externalJobId: "ashby_job_frontend",
    name: "Frontend system design",
    orderIndex: 2,
  },
  {
    id: "ats_stage_ashby_hm",
    orgId: organization.id,
    provider: "ashby",
    externalStageId: "ashby_stage_hm",
    externalJobId: "ashby_job_frontend",
    name: "Hiring manager",
    orderIndex: 3,
  },
  {
    id: "ats_stage_ashby_backend_design",
    orgId: organization.id,
    provider: "ashby",
    externalStageId: "ashby_stage_backend_design",
    externalJobId: "ashby_job_backend",
    name: "Architecture",
    orderIndex: 1,
  },
];

const atsJobMappings: AtsJobMapping[] = [
  {
    id: "job_mapping_frontend",
    orgId: organization.id,
    provider: "ashby",
    externalJobId: "ashby_job_frontend",
    froggyRoleId: "role_frontend_senior",
    froggyFlowId: "flow_frontend_loop_v1",
  },
];

const atsStageMappings: AtsStageMapping[] = [
  {
    id: "stage_mapping_coding",
    atsJobMappingId: "job_mapping_frontend",
    externalStageId: "ashby_stage_coding",
    froggyStageId: "stage_frontend_coding",
  },
  {
    id: "stage_mapping_sysdesign",
    atsJobMappingId: "job_mapping_frontend",
    externalStageId: "ashby_stage_sysdesign",
    froggyStageId: "stage_frontend_system_design",
  },
  {
    id: "stage_mapping_hm",
    atsJobMappingId: "job_mapping_frontend",
    externalStageId: "ashby_stage_hm",
    froggyStageId: "stage_hiring_manager",
  },
];

const applications: CandidateApplication[] = [
  {
    id: "app_sarah_frontend",
    orgId: organization.id,
    provider: "ashby",
    externalCandidateId: "cand_sarah_lee",
    externalApplicationId: "ashby_app_001",
    externalJobId: "ashby_job_frontend",
    externalStageId: "ashby_stage_sysdesign",
    candidateName: "Sarah Lee",
    candidateEmail: "sarah.lee@example.com",
    status: "active",
  },
  {
    id: "app_marcus_frontend",
    orgId: organization.id,
    provider: "ashby",
    externalCandidateId: "cand_marcus_diaz",
    externalApplicationId: "ashby_app_002",
    externalJobId: "ashby_job_frontend",
    externalStageId: "ashby_stage_coding",
    candidateName: "Marcus Diaz",
    candidateEmail: "marcus.diaz@example.com",
    status: "active",
  },
  {
    id: "app_ivy_backend",
    orgId: organization.id,
    provider: "ashby",
    externalCandidateId: "cand_ivy_chen",
    externalApplicationId: "ashby_app_003",
    externalJobId: "ashby_job_backend",
    externalStageId: "ashby_stage_backend_design",
    candidateName: "Ivy Chen",
    candidateEmail: "ivy.chen@example.com",
    status: "active",
  },
];

const sessions: InterviewSession[] = [
  {
    id: "session_sarah_sysdesign",
    orgId: organization.id,
    applicationId: "app_sarah_frontend",
    froggyStageId: "stage_frontend_system_design",
    externalInterviewId: "ashby_interview_4001",
    interviewerUserId: "user_maya",
    scheduledAt: "2026-05-08T10:00:00.000Z",
    status: "scheduled",
    flowVersion: 1,
    createdAt: "2026-05-05T03:10:00.000Z",
    updatedAt: "2026-05-05T03:10:00.000Z",
  },
  {
    id: "session_marcus_coding",
    orgId: organization.id,
    applicationId: "app_marcus_frontend",
    froggyStageId: "stage_frontend_coding",
    externalInterviewId: "ashby_interview_4002",
    interviewerUserId: "user_maya",
    scheduledAt: "2026-05-05T08:00:00.000Z",
    status: "submitted",
    flowVersion: 1,
    createdAt: "2026-05-04T11:15:00.000Z",
    updatedAt: "2026-05-05T09:05:00.000Z",
  },
];

function buildSessionSnapshots(): InterviewSessionQuestionSnapshot[] {
  return sessions.flatMap((session) => {
    const stage = stages.find((item) => item.id === session.froggyStageId);
    if (!stage) {
      return [];
    }

    return stage.questionIds.map((questionId) => {
      const question = questions.find((item) => item.id === questionId);
      if (!question) {
        return null;
      }

      return {
        id: `snapshot_${session.id}_${question.id}`,
        sessionId: session.id,
        originalQuestionId: question.id,
        titleSnapshot: question.title,
        promptSnapshot: question.prompt,
        followUpsSnapshot: question.followUps,
        expectedSignalsSnapshot: question.expectedSignals,
        axisIdsSnapshot: question.axisIds,
        rubricSnapshots: rubrics
          .filter((rubric) => rubric.questionId === question.id)
          .map((rubric) => {
            const axis = axes.find((item) => item.id === rubric.axisId);
            return {
              axisId: rubric.axisId,
              axisName: axis?.name ?? rubric.axisId,
              score1: rubric.score1,
              score2: rubric.score2,
              score3: rubric.score3,
              score4: rubric.score4,
              score5: rubric.score5,
            };
          }),
      };
    });
  }).filter((snapshot): snapshot is InterviewSessionQuestionSnapshot => snapshot !== null);
}

const sessionQuestionSnapshots = buildSessionSnapshots();

const scorecards: Scorecard[] = [
  {
    id: "scorecard_marcus_coding",
    sessionId: "session_marcus_coding",
    submittedByUserId: "user_maya",
    recommendation: "lean_yes",
    confidence: 4,
    overallNotes:
      "Marcus debugged systematically and handled rollback tradeoffs well. He could have gone deeper on communication to non-engineering stakeholders.",
    submittedAt: "2026-05-05T09:05:00.000Z",
    locked: true,
  },
];

const scorecardAxisScores: ScorecardAxisScore[] = [
  {
    id: "axis_score_marcus_coding_1",
    scorecardId: "scorecard_marcus_coding",
    axisId: "axis_coding",
    score: 4,
    evidence:
      "Started with monitoring, narrowed hypotheses quickly, and described a safe experiment sequence before proposing a fix.",
  },
  {
    id: "axis_score_marcus_coding_2",
    scorecardId: "scorecard_marcus_coding",
    axisId: "axis_ownership",
    score: 4,
    evidence:
      "Balanced mitigation, incident follow-up, and prevention. Named clear postmortem and rollback criteria.",
  },
  {
    id: "axis_score_marcus_coding_3",
    scorecardId: "scorecard_marcus_coding",
    axisId: "axis_communication",
    score: 3,
    evidence:
      "Explained his steps, but some stakeholder updates stayed high level until prompted.",
  },
];

const scorecardQuestionNotes: ScorecardQuestionNote[] = [
  {
    id: "note_marcus_q1",
    scorecardId: "scorecard_marcus_coding",
    questionId: "question_latency_debug",
    notes: "Strong instrumentation thinking and a clear debug order.",
  },
  {
    id: "note_marcus_q2",
    scorecardId: "scorecard_marcus_coding",
    questionId: "question_incident_ownership",
    notes: "Good rollback judgment and follow-through plan.",
  },
];

const writebackJobs: AtsWritebackJob[] = [
  {
    id: "writeback_marcus",
    orgId: organization.id,
    provider: "ashby",
    scorecardId: "scorecard_marcus_coding",
    externalCandidateId: "cand_marcus_diaz",
    externalApplicationId: "ashby_app_002",
    status: "success",
    attempts: 1,
    mode: "candidate_note",
    createdAt: "2026-05-05T09:05:10.000Z",
    updatedAt: "2026-05-05T09:05:25.000Z",
  },
];

const auditLogs: AuditLog[] = [
  {
    id: "audit_flow_1",
    orgId: organization.id,
    actor: "Priya Raman",
    action: "created_flow",
    entityType: "flow",
    entityId: "flow_frontend_loop_v1",
    detail: "Created Senior Frontend Loop v1.",
    createdAt: "2026-05-01T03:00:00.000Z",
  },
  {
    id: "audit_mapping_1",
    orgId: organization.id,
    actor: "Josh",
    action: "mapped_ats_job",
    entityType: "job_mapping",
    entityId: "job_mapping_frontend",
    detail: "Mapped Ashby Senior Frontend Engineer to Senior Frontend Loop.",
    createdAt: "2026-05-03T06:00:00.000Z",
  },
  {
    id: "audit_scorecard_1",
    orgId: organization.id,
    actor: "Maya Ortiz",
    action: "submitted_scorecard",
    entityType: "scorecard",
    entityId: "scorecard_marcus_coding",
    detail: "Submitted locked scorecard for Marcus Diaz.",
    createdAt: "2026-05-05T09:05:00.000Z",
  },
];

export function createInitialMvpStore(): MvpStore {
  return {
    organizations: [organization],
    users: structuredClone(users),
    companies: structuredClone(companies),
    roles: structuredClone(roles),
    flows: structuredClone(flows),
    stages: structuredClone(stages),
    axes: structuredClone(axes),
    questions: structuredClone(questions),
    rubrics: structuredClone(rubrics),
    atsConnections: structuredClone(atsConnections),
    atsJobs: structuredClone(atsJobs),
    atsStages: structuredClone(atsStages),
    atsJobMappings: structuredClone(atsJobMappings),
    atsStageMappings: structuredClone(atsStageMappings),
    applications: structuredClone(applications),
    sessions: structuredClone(sessions),
    sessionQuestionSnapshots: structuredClone(sessionQuestionSnapshots),
    scorecards: structuredClone(scorecards),
    scorecardAxisScores: structuredClone(scorecardAxisScores),
    scorecardQuestionNotes: structuredClone(scorecardQuestionNotes),
    writebackJobs: structuredClone(writebackJobs),
    auditLogs: structuredClone(auditLogs),
  };
}
