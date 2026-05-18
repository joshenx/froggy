import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInitialMvpStore } from "@/lib/mvp/seed";
import type {
  AddStageInput,
  AtsConnection,
  AtsJobMapping,
  AtsProvider,
  AttachQuestionToStagesInput,
  CandidatePacket,
  CandidateWorkspace,
  Company,
  ConnectProviderInput,
  CreateCompanyInput,
  CreateInterviewSessionInput,
  CreateJobMappingInput,
  EvaluationAxis,
  ImportQuestionsResult,
  CreateQuestionInput,
  CreateRoleInput,
  CreateStageMappingInput,
  InterviewFlow,
  InterviewGuide,
  InterviewSession,
  InterviewSessionQuestionSnapshot,
  InterviewStage,
  MvpStore,
  Recommendation,
  Role,
  RoleLevel,
  Question,
  QuestionBankStageOption,
  Scorecard,
  SubmitScorecardInput,
  UpdateQuestionInput,
  UpdateFlowLayoutInput,
  User,
  WritebackMode,
} from "@/lib/mvp/types";

type GlobalQuestionBankWorkspace = {
  scope: "global";
  axes: EvaluationAxis[];
  companies: Company[];
  stages: QuestionBankStageOption[];
  questions: Question[];
};

type RoleQuestionBankWorkspace = {
  scope: "role";
  role: Role;
  flow: InterviewFlow;
  axes: EvaluationAxis[];
  companies: Company[];
  stages: QuestionBankStageOption[];
  questions: Question[];
};

const storePath =
  process.env.FROGGY_MVP_STORE ??
  path.join(/* turbopackIgnore: true */ process.cwd(), "data", "mvp-store.json");

async function ensureStoreFile() {
  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(createInitialMvpStore(), null, 2), "utf8");
  }
}

export async function readMvpStore(): Promise<MvpStore> {
  await ensureStoreFile();
  const raw = await readFile(storePath, "utf8");
  const parsed = JSON.parse(raw) as MvpStore & {
    flows?: Array<InterviewFlow & { targetAxisIds?: string[] }>;
    questions?: Array<Question & { roleId?: string; roleIds?: string[] }>;
    companies?: Company[];
    stages?: Array<InterviewStage & { canvasX?: number; canvasY?: number }>;
  };

  const normalizedQuestions = (parsed.questions ?? []).map((question) => {
    const legacyRoleId = (question as Question & { roleId?: string }).roleId;
    const attachedRoleIds = (question.stageIds ?? [])
      .map((stageId) => parsed.stages.find((stage) => stage.id === stageId))
      .map((stage) => (stage ? parsed.flows.find((flow) => flow.id === stage.flowId) : undefined))
      .map((flow) => flow?.roleId)
      .filter((roleId): roleId is string => Boolean(roleId));
    const roleIds = Array.from(
      new Set([...(question.roleIds ?? []), ...(legacyRoleId ? [legacyRoleId] : []), ...attachedRoleIds]),
    );
    const rest = { ...question };
    delete (rest as { roleId?: string }).roleId;

    return {
      ...rest,
      companyIds: Array.isArray(question.companyIds) ? question.companyIds : [],
      roleIds,
      stageIds: Array.isArray(question.stageIds) ? question.stageIds : [],
    } satisfies Question;
  });

  const normalizedStages = (parsed.stages ?? []).map((stage, index) => ({
    ...stage,
    canvasX:
      typeof stage.canvasX === "number" ? stage.canvasX : 40 + (index % 3) * 320,
    canvasY:
      typeof stage.canvasY === "number" ? stage.canvasY : 70 + Math.floor(index / 3) * 220,
  }));

  const normalizedFlows = (parsed.flows ?? []).map((flow) => {
    const derivedTargetAxisIds = Array.from(
      new Set(
        normalizedStages
          .filter((stage) => stage.flowId === flow.id)
          .flatMap((stage) => stage.axisIds ?? []),
      ),
    );

    return {
      ...flow,
      targetAxisIds:
        Array.isArray(flow.targetAxisIds) && flow.targetAxisIds.length > 0
          ? Array.from(new Set(flow.targetAxisIds.filter(Boolean)))
          : derivedTargetAxisIds,
    } satisfies InterviewFlow;
  });

  return {
    ...parsed,
    companies: parsed.companies ?? [],
    flows: normalizedFlows,
    stages: normalizedStages,
    questions: normalizedQuestions,
  };
}

async function writeMvpStore(store: MvpStore) {
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function resetMvpStore() {
  await writeMvpStore(createInitialMvpStore());
}

export async function mutateMvpStore<T>(mutator: (store: MvpStore) => T | Promise<T>) {
  const store = await readMvpStore();
  const result = await mutator(store);
  await writeMvpStore(store);
  return result;
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOrgId(store: MvpStore) {
  return store.organizations[0]?.id ?? "org_froggy";
}

function findUser(store: MvpStore, role: User["role"]) {
  return store.users.find((user) => user.role === role) ?? store.users[0];
}

function getRoleFlow(store: MvpStore, roleId: string) {
  return store.flows
    .filter((flow) => flow.roleId === roleId)
    .sort((left, right) => right.version - left.version)[0];
}

function getStageById(store: MvpStore, stageId: string) {
  return store.stages.find((stage) => stage.id === stageId);
}

function getFlowById(store: MvpStore, flowId: string) {
  return store.flows.find((flow) => flow.id === flowId);
}

function getRoleById(store: MvpStore, roleId: string) {
  return store.roles.find((role) => role.id === roleId);
}

function getDefaultTargetAxisIds(store: MvpStore) {
  const preferredAxisIds = [
    "axis_coding",
    "axis_system_design",
    "axis_ownership",
    "axis_communication",
    "axis_product_judgment",
  ];

  const preferred = preferredAxisIds.filter((axisId) =>
    store.axes.some((axis) => axis.id === axisId),
  );

  if (preferred.length > 0) {
    return preferred;
  }

  return store.axes.slice(0, 5).map((axis) => axis.id);
}

function getQuestionRoleIdsFromStageIds(store: MvpStore, stageIds: string[]) {
  return Array.from(
    new Set(
      stageIds
        .map((stageId) => getStageById(store, stageId))
        .map((stage) => (stage ? getFlowById(store, stage.flowId) : undefined))
        .map((flow) => flow?.roleId)
        .filter((roleId): roleId is string => Boolean(roleId)),
    ),
  );
}

function isQuestionRelevantToRole(store: MvpStore, question: Question, roleId: string) {
  return (
    question.roleIds.includes(roleId) ||
    getQuestionRoleIdsFromStageIds(store, question.stageIds).includes(roleId)
  );
}

function buildQuestionBankStages(
  store: MvpStore,
  stages: InterviewStage[],
): QuestionBankStageOption[] {
  return stages
    .map((stage) => {
      const flow = getFlowById(store, stage.flowId);
      const role = flow ? getRoleById(store, flow.roleId) : undefined;

      if (!flow || !role) {
        return null;
      }

      return {
        id: stage.id,
        name: stage.name,
        durationMinutes: stage.durationMinutes,
        canvasX: stage.canvasX,
        canvasY: stage.canvasY,
        flowId: stage.flowId,
        roleId: role.id,
        roleName: role.name,
        flowName: flow.name,
      } satisfies QuestionBankStageOption;
    })
    .filter((stage): stage is QuestionBankStageOption => Boolean(stage))
    .sort((left, right) =>
      `${left.roleName}:${left.flowName}:${left.name}`.localeCompare(
        `${right.roleName}:${right.flowName}:${right.name}`,
      ),
    );
}

function buildQuestionSnapshot(
  store: MvpStore,
  sessionId: string,
  questionId: string,
): InterviewSessionQuestionSnapshot | null {
  const question = store.questions.find((item) => item.id === questionId);
  if (!question) {
    return null;
  }

  return {
    id: makeId("snapshot"),
    sessionId,
    originalQuestionId: question.id,
    titleSnapshot: question.title,
    promptSnapshot: question.prompt,
    followUpsSnapshot: question.followUps,
    expectedSignalsSnapshot: question.expectedSignals,
    axisIdsSnapshot: question.axisIds,
    rubricSnapshots: store.rubrics
      .filter((rubric) => rubric.questionId === question.id)
      .map((rubric) => {
        const axis = store.axes.find((item) => item.id === rubric.axisId);
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
}

function buildStageSnapshots(store: MvpStore, sessionId: string, stageId: string) {
  const stage = getStageById(store, stageId);
  if (!stage) {
    return [];
  }

  return stage.questionIds
    .map((questionId) => buildQuestionSnapshot(store, sessionId, questionId))
    .filter((snapshot): snapshot is InterviewSessionQuestionSnapshot => snapshot !== null);
}

function getCandidateId(applicationExternalCandidateId: string) {
  return applicationExternalCandidateId;
}

function pickPrimaryLevel(levels: RoleLevel[]) {
  const levelOrder: RoleLevel[] = ["junior", "mid", "senior", "staff", "manager"];
  return [...levels].sort(
    (left, right) => levelOrder.indexOf(right) - levelOrder.indexOf(left),
  )[0] ?? "senior";
}

function normalizeQuestionInput(input: CreateQuestionInput | UpdateQuestionInput) {
  const levels = Array.from(new Set(input.levels?.filter(Boolean) ?? [input.seniority]));
  const axisIds = Array.from(new Set(input.axisIds.map((axisId) => axisId.trim()).filter(Boolean)));
  const companyIds = Array.from(
    new Set((input.companyIds ?? []).map((companyId) => companyId.trim()).filter(Boolean)),
  );

  return {
    title: input.title.trim(),
    prompt: input.prompt.trim(),
    difficulty: input.difficulty,
    seniority: pickPrimaryLevel(levels),
    levels,
    axisIds,
    companyIds,
    followUps: input.followUps.map((followUp) => followUp.trim()).filter(Boolean),
    expectedSignals: input.expectedSignals
      .map((signal) => signal.trim())
      .filter(Boolean),
    expectedDurationMinutes: input.expectedDurationMinutes,
    collection: input.collection.trim(),
    roleFamily: input.roleFamily.trim(),
    rationale: input.rationale?.trim() ?? "",
    anchors: input.anchors?.map((anchor) => anchor.trim()) as
      | [string, string, string]
      | undefined,
  };
}

function computeSignalScore(axisCount: number, difficulty: number) {
  return Number((0.68 + axisCount * 0.04 + difficulty * 0.02).toFixed(2));
}

function rebuildQuestionRubrics(store: MvpStore, questionId: string, axisIds: string[]) {
  store.rubrics = store.rubrics.filter((rubric) => rubric.questionId !== questionId);

  axisIds.forEach((axisId) => {
    const axis = store.axes.find((item) => item.id === axisId);
    if (!axis) {
      return;
    }

    store.rubrics.push({
      id: makeId("rubric"),
      questionId,
      axisId,
      score1: axis.anchoredBands[0],
      score2: axis.anchoredBands[1],
      score3: axis.anchoredBands[2],
      score4: axis.anchoredBands[3],
      score5: axis.anchoredBands[4],
    });
  });
}

function recomputeStageAxisIds(store: MvpStore, stageId: string) {
  const stage = getStageById(store, stageId);
  if (!stage) {
    return;
  }

  stage.axisIds = Array.from(
    new Set(
      stage.questionIds.flatMap((questionId) => {
        const question = store.questions.find((item) => item.id === questionId);
        return question?.axisIds ?? [];
      }),
    ),
  );
}

function getFlowCoverageSnapshot(
  store: MvpStore,
  targetAxisIds: string[],
  stages: Array<Pick<InterviewStage, "questionIds">>,
) {
  const axisQuestionCounts = new Map<string, number>();

  stages.forEach((stage) => {
    stage.questionIds.forEach((questionId) => {
      const question = store.questions.find((item) => item.id === questionId);
      if (!question) {
        return;
      }

      question.axisIds.forEach((axisId) => {
        axisQuestionCounts.set(axisId, (axisQuestionCounts.get(axisId) ?? 0) + 1);
      });
    });
  });

  const uniqueTargetAxisIds = Array.from(new Set(targetAxisIds.filter(Boolean)));
  const coveredAxisIds = uniqueTargetAxisIds.filter(
    (axisId) => (axisQuestionCounts.get(axisId) ?? 0) > 0,
  );
  const gapAxisIds = uniqueTargetAxisIds.filter(
    (axisId) => (axisQuestionCounts.get(axisId) ?? 0) === 0,
  );

  return {
    axisQuestionCounts,
    coveredAxisIds,
    gapAxisIds,
  };
}

function getFlowQuestionCount(stages: Array<Pick<InterviewStage, "questionIds">>) {
  return stages.reduce((sum, stage) => sum + stage.questionIds.length, 0);
}

function assertFlowCanPublish(
  store: MvpStore,
  flowName: string,
  targetAxisIds: string[],
  stages: Array<Pick<InterviewStage, "questionIds">>,
) {
  const questionCount = getFlowQuestionCount(stages);
  if (questionCount === 0) {
    throw new Error("Add at least one question before publishing this loop.");
  }

  const coverage = getFlowCoverageSnapshot(store, targetAxisIds, stages);
  if (coverage.gapAxisIds.length > 0) {
    const gapLabels = coverage.gapAxisIds
      .map((axisId) => store.axes.find((axis) => axis.id === axisId)?.name ?? axisId)
      .join(", ");
    throw new Error(`Cannot publish ${flowName} with uncovered target axes: ${gapLabels}.`);
  }
}

function isStageReferenced(store: MvpStore, stageId: string) {
  return (
    store.atsStageMappings.some((mapping) => mapping.froggyStageId === stageId) ||
    store.sessions.some((session) => session.froggyStageId === stageId)
  );
}

function ensureQuestionAttachedToStage(store: MvpStore, questionId: string, stageId: string) {
  const question = store.questions.find((item) => item.id === questionId);
  const stage = getStageById(store, stageId);
  if (!question || !stage) {
    return;
  }

  if (!question.stageIds.includes(stageId)) {
    question.stageIds.push(stageId);
  }
  if (!stage.questionIds.includes(questionId)) {
    stage.questionIds.push(questionId);
  }
  const flow = getFlowById(store, stage.flowId);
  if (flow && !question.roleIds.includes(flow.roleId)) {
    question.roleIds.push(flow.roleId);
  }
  recomputeStageAxisIds(store, stageId);
}

function createQuestionRecord(
  store: MvpStore,
  input: CreateQuestionInput,
  options?: { roleIds?: string[]; stageIds?: string[] },
) {
  const normalized = normalizeQuestionInput(input);
  const defaultAnchors = normalized.axisIds
    .map((axisId) => store.axes.find((axis) => axis.id === axisId))
    .filter((axis): axis is NonNullable<typeof axis> => Boolean(axis))[0]?.anchoredBands;

  const question: Question = {
    id: makeId("question"),
    orgId: getOrgId(store),
    roleIds: Array.from(new Set(options?.roleIds ?? [])),
    companyIds: normalized.companyIds,
    collection: normalized.collection,
    title: normalized.title,
    prompt: normalized.prompt,
    difficulty: normalized.difficulty,
    seniority: normalized.seniority,
    levels: normalized.levels,
    axisIds: normalized.axisIds,
    followUps: normalized.followUps,
    expectedSignals: normalized.expectedSignals,
    expectedDurationMinutes: normalized.expectedDurationMinutes,
    roleFamily: normalized.roleFamily,
    usedLastQuarter: 0,
    signalScore: computeSignalScore(normalized.axisIds.length, normalized.difficulty),
    stageIds: [],
    rationale: normalized.rationale,
    anchors: normalized.anchors ?? [
      defaultAnchors?.[0] ?? "A 1 looks like: misses the core signal or needs heavy prompting.",
      defaultAnchors?.[2] ?? "A 3 looks like: shows a workable baseline with some coaching.",
      defaultAnchors?.[4] ?? "A 5 looks like: demonstrates strong judgment, signal, and clarity.",
    ],
    createdAt: nowIso(),
  };

  store.questions.push(question);
  rebuildQuestionRubrics(store, question.id, question.axisIds);

  options?.stageIds?.forEach((stageId) => {
    ensureQuestionAttachedToStage(store, question.id, stageId);
  });

  return question;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvText(csvText: string) {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [] as string[], rows: [] as string[][] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { headers, rows };
}

function normalizeAxisKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function parseImportedLevels(raw: string): RoleLevel[] {
  const tokens = raw
    .split(/[|;/,]/)
    .map((token) => token.trim())
    .filter(Boolean);

  const mapped = tokens
    .map((token) => {
      const normalized = token.toLowerCase();
      if (normalized === "l3" || normalized === "junior") return "junior";
      if (normalized === "l4" || normalized === "mid") return "mid";
      if (normalized === "l5" || normalized === "senior") return "senior";
      if (normalized === "l6+" || normalized === "staff") return "staff";
      if (normalized === "manager" || normalized === "mgr") return "manager";
      return null;
    })
    .filter((level): level is RoleLevel => Boolean(level));

  return Array.from(new Set(mapped));
}

function parseDelimitedField(raw: string) {
  return raw
    .split(/[|;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function recommendationToNumber(recommendation: Recommendation) {
  switch (recommendation) {
    case "strong_no":
      return 1;
    case "no":
      return 2;
    case "lean_no":
      return 3;
    case "lean_yes":
      return 4;
    case "yes":
      return 5;
    case "strong_yes":
      return 6;
  }
}

function numberToRecommendation(score: number): Recommendation {
  if (score <= 1.5) {
    return "strong_no";
  }
  if (score <= 2.5) {
    return "no";
  }
  if (score <= 3.5) {
    return "lean_no";
  }
  if (score <= 4.5) {
    return "lean_yes";
  }
  if (score <= 5.5) {
    return "yes";
  }
  return "strong_yes";
}

function getWritebackMode(connection?: AtsConnection): WritebackMode {
  if (!connection) {
    return "copy_paste";
  }
  if (connection.capabilities.canSubmitStructuredFeedback) {
    return "structured_scorecard";
  }
  if (connection.capabilities.canCreateCandidateNote) {
    return "candidate_note";
  }
  if (connection.capabilities.canAttachPdf) {
    return "pdf_attachment";
  }
  return "copy_paste";
}

function appendAuditLog(
  store: MvpStore,
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
  actor = "Josh",
) {
  store.auditLogs.unshift({
    id: makeId("audit"),
    orgId: getOrgId(store),
    actor,
    action,
    entityType,
    entityId,
    detail,
    createdAt: nowIso(),
  });
}

export async function getProductOverview() {
  const store = await readMvpStore();

  const roleSummaries = store.roles.map((role) => {
    const flow = getRoleFlow(store, role.id);
    const flowStages = flow ? store.stages.filter((stage) => stage.flowId === flow.id) : [];
    const questionIds = new Set(flowStages.flatMap((stage) => stage.questionIds));
    const mappedJobs = store.atsJobMappings.filter((mapping) => mapping.froggyRoleId === role.id).length;
    const activeCandidates = store.applications.filter((application) =>
      store.atsJobMappings.some(
        (mapping) =>
          mapping.froggyRoleId === role.id && mapping.externalJobId === application.externalJobId,
      ),
    ).length;

    return {
      role,
      flow,
      stageCount: flowStages.length,
      questionCount: questionIds.size,
      mappedJobs,
      activeCandidates,
    };
  });

  return {
    stats: {
      roleCount: store.roles.length,
      activeFlowCount: store.flows.filter((flow) => flow.status === "active").length,
      openApplicationCount: store.applications.filter((application) => application.status === "active").length,
      pendingWritebacks: store.writebackJobs.filter((job) => job.status === "pending" || job.status === "retrying")
        .length,
    },
    roleSummaries,
    recentAuditLogs: store.auditLogs.slice(0, 8),
  };
}

export async function getRoleWorkspace(roleId: string) {
  const store = await readMvpStore();
  const role = getRoleById(store, roleId);
  const flow = getRoleFlow(store, roleId);

  if (!role || !flow) {
    return null;
  }

  const stages = store.stages
    .filter((stage) => stage.flowId === flow.id)
    .sort((left, right) => left.orderIndex - right.orderIndex);

  return {
    role,
    flow,
    stages: stages.map((stage) => ({
      ...stage,
      questions: stage.questionIds
        .map((questionId) => store.questions.find((question) => question.id === questionId))
        .filter((question): question is NonNullable<typeof question> => Boolean(question)),
      axes: stage.axisIds
        .map((axisId) => store.axes.find((axis) => axis.id === axisId))
        .filter((axis): axis is NonNullable<typeof axis> => Boolean(axis)),
    })),
    questionBank: store.questions.filter((question) => isQuestionRelevantToRole(store, question, roleId)),
    axes: store.axes,
  };
}

export async function getQuestionBankWorkspace(): Promise<GlobalQuestionBankWorkspace>;
export async function getQuestionBankWorkspace(
  roleId: string,
): Promise<RoleQuestionBankWorkspace | null>;
export async function getQuestionBankWorkspace(roleId?: string) {
  const store = await readMvpStore();
  if (!roleId) {
    return {
      scope: "global" as const,
      axes: store.axes,
      companies: store.companies,
      stages: buildQuestionBankStages(store, store.stages),
      questions: [...store.questions].sort(
        (left, right) => right.usedLastQuarter - left.usedLastQuarter,
      ),
    };
  }

  const role = getRoleById(store, roleId);
  const flow = getRoleFlow(store, roleId);

  if (!role || !flow) {
    return null;
  }

  const stages = store.stages
    .filter((stage) => stage.flowId === flow.id)
    .sort((left, right) => left.orderIndex - right.orderIndex);

  return {
    scope: "role" as const,
    role,
    flow,
    axes: store.axes,
    companies: store.companies,
    stages: buildQuestionBankStages(store, stages),
    questions: store.questions
      .filter((question) => isQuestionRelevantToRole(store, question, roleId))
      .sort((left, right) => right.usedLastQuarter - left.usedLastQuarter),
  };
}

export async function getQuestion(questionId: string): Promise<Question | null>;
export async function getQuestion(
  roleId: string,
  questionId: string,
): Promise<Question | null>;
export async function getQuestion(roleIdOrQuestionId: string, maybeQuestionId?: string) {
  const store = await readMvpStore();
  const roleId = maybeQuestionId ? roleIdOrQuestionId : undefined;
  const questionId = maybeQuestionId ?? roleIdOrQuestionId;
  const question = store.questions.find((item) => item.id === questionId);

  if (!question) {
    return null;
  }

  if (roleId) {
    const role = getRoleById(store, roleId);
    if (!role || !isQuestionRelevantToRole(store, question, roleId)) {
      return null;
    }
  }

  return question;
}

export async function getCompanies() {
  const store = await readMvpStore();
  return [...store.companies].sort((left, right) => left.name.localeCompare(right.name));
}

export async function getIntegrationsWorkspace() {
  const store = await readMvpStore();

  return {
    connections: store.atsConnections,
    providers: ["ashby", "greenhouse"] as const,
    jobs: store.atsJobs,
    applications: store.applications,
    sessions: store.sessions,
    jobMappings: store.atsJobMappings,
    stageMappings: store.atsStageMappings,
  };
}

export async function getMappingWorkspace(provider: AtsProvider) {
  const store = await readMvpStore();

  return {
    provider,
    connection: store.atsConnections.find((connection) => connection.provider === provider),
    jobs: store.atsJobs.filter((job) => job.provider === provider),
    stages: store.atsStages.filter((stage) => stage.provider === provider),
    jobMappings: store.atsJobMappings.filter((mapping) => mapping.provider === provider),
    stageMappings: store.atsStageMappings,
    roles: store.roles,
    flows: store.flows,
    froggyStages: store.stages,
  };
}

export async function getCandidatesWorkspace() {
  const store = await readMvpStore();

  return Promise.all(store.applications.map(async (application) => {
    const mapping = store.atsJobMappings.find(
      (jobMapping) =>
        jobMapping.provider === application.provider &&
        jobMapping.externalJobId === application.externalJobId,
    );
    const role = mapping ? store.roles.find((item) => item.id === mapping.froggyRoleId) : undefined;
    const sessions = store.sessions.filter((session) => session.applicationId === application.id);
    const latestScorecard = sessions
      .map((session) => store.scorecards.find((scorecard) => scorecard.sessionId === session.id))
      .filter((scorecard): scorecard is Scorecard => Boolean(scorecard))
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];
    const packet = await getPacket(application.id);
    const submittedSessionCount = sessions.filter((session) => session.status === "submitted").length;

    return {
      application,
      role,
      sessions,
      latestScorecard,
      packet,
      submittedSessionCount,
      packetHref: `/packets/${application.id}`,
      candidateHref: `/candidates/${application.externalCandidateId}`,
    };
  }));
}

export async function getCandidateWorkspace(candidateId: string): Promise<CandidateWorkspace | null> {
  const store = await readMvpStore();
  const applications = store.applications.filter(
    (application) => getCandidateId(application.externalCandidateId) === candidateId,
  );
  const application = applications[0];

  if (!application) {
    return null;
  }

  const mapping = store.atsJobMappings.find(
    (jobMapping) =>
      jobMapping.provider === application.provider &&
      jobMapping.externalJobId === application.externalJobId,
  );
  const role = mapping ? store.roles.find((item) => item.id === mapping.froggyRoleId) : undefined;
  const flow = mapping ? store.flows.find((item) => item.id === mapping.froggyFlowId) : undefined;
  const sessions = store.sessions
    .filter((session) => session.applicationId === application.id)
    .map((session) => ({
      session,
      stage: getStageById(store, session.froggyStageId),
      scorecard: store.scorecards.find((scorecard) => scorecard.sessionId === session.id),
    }));

  return {
    candidate: {
      id: candidateId,
      name: application.candidateName,
      email: application.candidateEmail,
    },
    application,
    role,
    flow,
    sessions,
    users: store.users,
    stages: flow
      ? store.stages.filter((stage) => stage.flowId === flow.id).sort((left, right) => left.orderIndex - right.orderIndex)
      : [],
    latestPacket: await getPacket(application.id),
  };
}

export async function getGuide(sessionId: string): Promise<InterviewGuide | null> {
  const store = await readMvpStore();
  const session = store.sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  const application = store.applications.find((item) => item.id === session.applicationId);
  const stage = getStageById(store, session.froggyStageId);
  if (!application || !stage) {
    return null;
  }

  const mapping = store.atsJobMappings.find(
    (jobMapping) =>
      jobMapping.provider === application.provider &&
      jobMapping.externalJobId === application.externalJobId,
  );
  const flow = mapping ? store.flows.find((item) => item.id === mapping.froggyFlowId) : undefined;
  const role = mapping ? store.roles.find((item) => item.id === mapping.froggyRoleId) : undefined;

  if (!flow || !role) {
    return null;
  }

  const existingScorecard = store.scorecards.find((scorecard) => scorecard.sessionId === session.id);

  return {
    candidate: {
      id: application.externalCandidateId,
      name: application.candidateName,
      email: application.candidateEmail,
    },
    session,
    application,
    stage,
    flow,
    role,
    interviewer: session.interviewerUserId
      ? store.users.find((user) => user.id === session.interviewerUserId)
      : undefined,
    questions: store.sessionQuestionSnapshots.filter((snapshot) => snapshot.sessionId === session.id),
    existingScorecard,
    existingAxisScores: existingScorecard
      ? store.scorecardAxisScores.filter((score) => score.scorecardId === existingScorecard.id)
      : [],
    existingQuestionNotes: existingScorecard
      ? store.scorecardQuestionNotes.filter((note) => note.scorecardId === existingScorecard.id)
      : [],
  };
}

export async function getPacket(applicationId: string): Promise<CandidatePacket | null> {
  const store = await readMvpStore();
  const application = store.applications.find((item) => item.id === applicationId);

  if (!application) {
    return null;
  }

  const mapping = store.atsJobMappings.find(
    (jobMapping) =>
      jobMapping.provider === application.provider &&
      jobMapping.externalJobId === application.externalJobId,
  );
  const role = mapping ? store.roles.find((item) => item.id === mapping.froggyRoleId) : undefined;
  const flow = mapping ? store.flows.find((item) => item.id === mapping.froggyFlowId) : undefined;
  const sessionEntries = store.sessions
    .filter((session) => session.applicationId === application.id)
    .map((session) => ({
      session,
      stage: getStageById(store, session.froggyStageId),
      scorecard: store.scorecards.find((scorecard) => scorecard.sessionId === session.id),
      writebackJob: store.writebackJobs.find((job) =>
        store.scorecards.some(
          (scorecard) => scorecard.id === job.scorecardId && scorecard.sessionId === session.id,
        ),
      ),
    }))
    .filter((entry) => entry.stage !== undefined);

  const sessions = sessionEntries.map((entry) => ({
    session: entry.session,
    stage: entry.stage as InterviewStage,
    scorecard: entry.scorecard,
    writebackJob: entry.writebackJob,
  }));

  const requiredAxisIds = new Set(
    sessions.flatMap((entry) => entry.stage.axisIds),
  );

  const scorecards = sessions
    .map((entry) => entry.scorecard)
    .filter((scorecard): scorecard is Scorecard => Boolean(scorecard));

  const axisSummary = Array.from(requiredAxisIds).map((axisId) => {
    const axis = store.axes.find((item) => item.id === axisId);
    const relatedScores = store.scorecardAxisScores.filter(
      (score) => score.axisId === axisId && scorecards.some((scorecard) => scorecard.id === score.scorecardId),
    );
    const averageScore = relatedScores.length
      ? Number(
          (
            relatedScores.reduce((sum, score) => sum + score.score, 0) / relatedScores.length
          ).toFixed(1),
        )
      : null;

    return {
      axisId,
      axis: axis?.name ?? axisId,
      averageScore,
      evidence: relatedScores.map((score) => score.evidence),
      covered: relatedScores.length > 0,
    };
  });

  const overallRecommendation = scorecards.length
    ? numberToRecommendation(
        scorecards.reduce((sum, scorecard) => sum + recommendationToNumber(scorecard.recommendation), 0) /
          scorecards.length,
      )
    : "pending";

  const strengths = axisSummary
    .filter((summary) => summary.averageScore !== null && summary.averageScore >= 4)
    .map((summary) => `${summary.axis} came through consistently across submitted feedback.`);

  const concerns = axisSummary
    .filter((summary) => summary.averageScore === null || summary.averageScore < 3.5)
    .map((summary) =>
      summary.averageScore === null
        ? `${summary.axis} has not been captured yet.`
        : `${summary.axis} needs more confidence before a final decision.`,
    );

  const missingSignals = axisSummary
    .filter((summary) => !summary.covered)
    .map((summary) => summary.axis);

  const atsSummary = [
    `Recommendation: ${overallRecommendation.replaceAll("_", " ")}`,
    axisSummary
      .filter((summary) => summary.averageScore !== null)
      .map((summary) => `${summary.axis} ${summary.averageScore}/5`)
      .join(" · "),
    strengths.length ? `Strengths: ${strengths.join(" ")}` : "",
    concerns.length ? `Concerns: ${concerns.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    candidate: {
      id: application.externalCandidateId,
      name: application.candidateName,
      email: application.candidateEmail,
    },
    application,
    role,
    flow,
    overallRecommendation,
    axisSummary,
    strengths,
    concerns,
    missingSignals,
    sessions,
    atsSummary,
  };
}

export async function createRoleWithFlow(input: CreateRoleInput) {
  return mutateMvpStore((store) => {
    const roleId = makeId("role");
    const flowId = makeId("flow");
    const actor = findUser(store, "hiring_manager")?.name ?? "Hiring manager";

    const role: Role = {
      id: roleId,
      orgId: getOrgId(store),
      name: input.name.trim(),
      level: input.level,
    };

    const flow: InterviewFlow = {
      id: flowId,
      orgId: getOrgId(store),
      roleId,
      name: input.flowName.trim(),
      version: 1,
      status: "draft",
      targetAxisIds: getDefaultTargetAxisIds(store),
      createdBy: findUser(store, "hiring_manager")?.id ?? store.users[0]?.id ?? "",
    };

    store.roles.push(role);
    store.flows.push(flow);

    input.stageNames.forEach((stageName, index) => {
      store.stages.push({
        id: makeId("stage"),
        flowId,
        name: stageName.trim(),
        description: "New stage awaiting questions, rubrics, and mappings.",
        orderIndex: index + 1,
        canvasX: 40 + index * 320,
        canvasY: 70,
        durationMinutes: 45,
        interviewerRole: "Interviewer",
        questionIds: [],
        axisIds: [],
        scoringRules: ["Every score must include evidence before submission."],
      });
    });

    appendAuditLog(store, "created_role_flow", "role", role.id, `Created ${role.name} with ${flow.name}.`, actor);

    return { role, flow };
  });
}

export async function addStage(roleId: string, input: AddStageInput) {
  return mutateMvpStore((store) => {
    const flow = getRoleFlow(store, roleId);
    if (!flow) {
      throw new Error("Role flow not found.");
    }

    const existingStages = store.stages.filter((stage) => stage.flowId === flow.id);
    const stage: InterviewStage = {
      id: makeId("stage"),
      flowId: flow.id,
      name: input.name.trim(),
      description: input.description?.trim(),
      orderIndex: existingStages.length + 1,
      canvasX: 40 + existingStages.length * 320,
      canvasY: 70 + Math.floor(existingStages.length / 3) * 220,
      durationMinutes: input.durationMinutes,
      interviewerRole: input.interviewerRole?.trim(),
      questionIds: [],
      axisIds: [],
      scoringRules: input.scoringRules.filter(Boolean),
    };

    store.stages.push(stage);
    appendAuditLog(
      store,
      "added_stage",
      "stage",
      stage.id,
      `Added ${stage.name} to ${flow.name}.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return stage;
  });
}

export async function createBankQuestion(
  input: CreateQuestionInput,
): Promise<Question>;
export async function createBankQuestion(
  roleId: string,
  input: CreateQuestionInput,
): Promise<Question>;
export async function createBankQuestion(
  roleIdOrInput: string | CreateQuestionInput,
  maybeInput?: CreateQuestionInput,
) {
  return mutateMvpStore((store) => {
    const roleIds =
      typeof roleIdOrInput === "string" ? [roleIdOrInput] : [];
    const input =
      typeof roleIdOrInput === "string" ? maybeInput : roleIdOrInput;

    if (!input) {
      throw new Error("Question input is required.");
    }

    const roles = roleIds
      .map((roleId) => getRoleById(store, roleId))
      .filter((role): role is Role => Boolean(role));
    if (roleIds.length > 0 && roles.length !== roleIds.length) {
      throw new Error("Role not found.");
    }

    const question = createQuestionRecord(store, input, {
      roleIds: roles.map((role) => role.id),
    });
    const scopeLabel =
      roles.length > 0
        ? `${roles.map((role) => role.name).join(", ")} bank`
        : "question bank";
    appendAuditLog(
      store,
      "created_question",
      "question",
      question.id,
      `Added ${question.title} to the ${scopeLabel}.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return question;
  });
}

export async function createQuestion(stageId: string, input: CreateQuestionInput) {
  return mutateMvpStore((store) => {
    const stage = getStageById(store, stageId);
    if (!stage) {
      throw new Error("Stage not found.");
    }

    const flow = getFlowById(store, stage.flowId);
    if (!flow) {
      throw new Error("Flow not found.");
    }

    const question = createQuestionRecord(store, input, {
      roleIds: [flow.roleId],
      stageIds: [stageId],
    });

    appendAuditLog(
      store,
      "created_question",
      "question",
      question.id,
      `Added ${question.title} to ${stage.name}.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return question;
  });
}

export async function updateQuestion(questionId: string, input: UpdateQuestionInput) {
  return mutateMvpStore((store) => {
    const question = store.questions.find((item) => item.id === questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    const normalized = normalizeQuestionInput(input);
    const defaultAnchors = normalized.axisIds
      .map((axisId) => store.axes.find((axis) => axis.id === axisId))
      .filter((axis): axis is NonNullable<typeof axis> => Boolean(axis))[0]?.anchoredBands;

    question.title = normalized.title;
    question.prompt = normalized.prompt;
    question.difficulty = normalized.difficulty;
    question.seniority = normalized.seniority;
    question.levels = normalized.levels;
    question.axisIds = normalized.axisIds;
    question.companyIds = normalized.companyIds;
    question.followUps = normalized.followUps;
    question.expectedSignals = normalized.expectedSignals;
    question.expectedDurationMinutes = normalized.expectedDurationMinutes;
    question.collection = normalized.collection;
    question.roleFamily = normalized.roleFamily;
    question.rationale = normalized.rationale;
    question.anchors = normalized.anchors ?? [
      defaultAnchors?.[0] ?? question.anchors[0],
      defaultAnchors?.[2] ?? question.anchors[1],
      defaultAnchors?.[4] ?? question.anchors[2],
    ];
    question.signalScore = computeSignalScore(question.axisIds.length, question.difficulty);

    rebuildQuestionRubrics(store, question.id, question.axisIds);
    question.stageIds.forEach((stageId) => recomputeStageAxisIds(store, stageId));

    appendAuditLog(
      store,
      "updated_question",
      "question",
      question.id,
      `Updated ${question.title}.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return question;
  });
}

export async function attachQuestionToStages(
  questionId: string,
  input: AttachQuestionToStagesInput,
) {
  return mutateMvpStore((store) => {
    const question = store.questions.find((item) => item.id === questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    const uniqueStageIds = Array.from(new Set(input.stageIds.filter(Boolean)));
    if (uniqueStageIds.length === 0) {
      throw new Error("Select at least one stage.");
    }

    uniqueStageIds.forEach((stageId) => {
      const stage = getStageById(store, stageId);
      if (!stage) {
        throw new Error("Choose valid stages from the active flow.");
      }

      ensureQuestionAttachedToStage(store, question.id, stageId);
    });

    appendAuditLog(
      store,
      "attached_question",
      "question",
      question.id,
      `Attached ${question.title} to ${uniqueStageIds.length} stage${uniqueStageIds.length === 1 ? "" : "s"}.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return {
      question,
      attachedStageIds: uniqueStageIds,
    };
  });
}

export async function importQuestionsFromCsv(
  csvText: string,
): Promise<ImportQuestionsResult>;
export async function importQuestionsFromCsv(
  roleId: string,
  csvText: string,
): Promise<ImportQuestionsResult>;
export async function importQuestionsFromCsv(
  roleIdOrCsvText: string,
  maybeCsvText?: string,
): Promise<ImportQuestionsResult> {
  return mutateMvpStore((store) => {
    const roleId = maybeCsvText ? roleIdOrCsvText : undefined;
    const csvText = maybeCsvText ?? roleIdOrCsvText;
    const role = roleId ? getRoleById(store, roleId) : undefined;
    if (roleId && !role) {
      throw new Error("Role not found.");
    }

    const { headers, rows } = parseCsvText(csvText);
    const requiredHeaders = [
      "prompt",
      "collection",
      "roleFamily",
      "levels",
      "difficulty",
      "expectedDurationMinutes",
      "axisTags",
    ];

    if (headers.length === 0) {
      throw new Error("CSV file is empty.");
    }

    const headerIndex = new Map(headers.map((header, index) => [header, index]));
    const missingHeaders = requiredHeaders.filter((header) => !headerIndex.has(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}.`);
    }

    const axisLookup = new Map(
      store.axes.map((axis) => [normalizeAxisKey(axis.name), axis.id] as const),
    );
    const result: ImportQuestionsResult = {
      importedCount: 0,
      failedCount: 0,
      questionIds: [],
      errors: [],
    };

    rows.forEach((row, rowIndex) => {
      const value = (header: string) => row[headerIndex.get(header) ?? -1]?.trim() ?? "";
      const prompt = value("prompt");
      const collection = value("collection");
      const roleFamily = value("roleFamily");
      const levels = parseImportedLevels(value("levels"));
      const difficulty = Number(value("difficulty"));
      const expectedDurationMinutes = Number(value("expectedDurationMinutes"));
      const axisTagValues = value("axisTags")
        .split(/[|;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      const axisIds = Array.from(
        new Set(
          axisTagValues
            .map((tag) => axisLookup.get(normalizeAxisKey(tag)) ?? null)
            .filter((axisId): axisId is string => Boolean(axisId)),
        ),
      );

      if (
        !prompt ||
        !collection ||
        !roleFamily ||
        levels.length === 0 ||
        !Number.isFinite(difficulty) ||
        difficulty < 1 ||
        difficulty > 5 ||
        !Number.isFinite(expectedDurationMinutes) ||
        expectedDurationMinutes <= 0 ||
        axisIds.length === 0
      ) {
        result.failedCount += 1;
        result.errors.push({
          row: rowIndex + 2,
          message: "Row is missing required values or uses unknown level/tag values.",
        });
        return;
      }

      const question = createQuestionRecord(store, {
        title: prompt.split(/[.?!]/)[0]?.trim() || prompt,
        prompt,
        difficulty: difficulty as CreateQuestionInput["difficulty"],
        seniority: pickPrimaryLevel(levels),
        levels,
        axisIds,
        followUps: parseDelimitedField(value("followUps")),
        expectedSignals: axisIds
          .map((axisId) => store.axes.find((axis) => axis.id === axisId)?.name ?? axisId),
        expectedDurationMinutes,
        collection,
        roleFamily,
        rationale: value("rationale"),
        anchors:
          value("anchor1") || value("anchor3") || value("anchor5")
            ? [value("anchor1"), value("anchor3"), value("anchor5")]
            : undefined,
      }, {
        roleIds: role ? [role.id] : [],
      });

      result.importedCount += 1;
      result.questionIds.push(question.id);
    });

    appendAuditLog(
      store,
      "imported_questions",
      "question_bank",
      role?.id ?? getOrgId(store),
      role
        ? `Imported ${result.importedCount} question${result.importedCount === 1 ? "" : "s"} into the ${role.name} bank.`
        : `Imported ${result.importedCount} question${result.importedCount === 1 ? "" : "s"} into the question bank.`,
      findUser(store, "hiring_manager")?.name ?? "Hiring manager",
    );

    return result;
  });
}

export async function createCompany(input: CreateCompanyInput) {
  return mutateMvpStore((store) => {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Company name is required.");
    }

    const slugBase = slugify(name);
    let slug = slugBase || `company-${store.companies.length + 1}`;
    let suffix = 2;
    while (store.companies.some((company) => company.slug === slug)) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const company: Company = {
      id: makeId("company"),
      orgId: getOrgId(store),
      name,
      slug,
      logoUrl: input.logoUrl?.trim() || undefined,
      website: input.website?.trim() || undefined,
      createdAt: nowIso(),
    };

    store.companies.push(company);
    appendAuditLog(
      store,
      "created_company",
      "company",
      company.id,
      `Added company reference ${company.name}.`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return company;
  });
}

export async function updateCompanyLogo(companyId: string, logoUrl: string) {
  return mutateMvpStore((store) => {
    const company = store.companies.find((item) => item.id === companyId);
    if (!company) {
      throw new Error("Company not found.");
    }

    company.logoUrl = logoUrl.trim() || undefined;
    appendAuditLog(
      store,
      "updated_company_logo",
      "company",
      company.id,
      `Updated logo for ${company.name}.`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return company;
  });
}

export async function saveFlowLayout(roleId: string, input: UpdateFlowLayoutInput) {
  return mutateMvpStore((store) => {
    const flow = getRoleFlow(store, roleId);
    if (!flow) {
      throw new Error("Role flow not found.");
    }

    const actor = findUser(store, "hiring_manager")?.name ?? "Hiring manager";
    const flowStages = store.stages.filter((stage) => stage.flowId === flow.id);
    const flowStageIds = new Set(flowStages.map((stage) => stage.id));
    const knownAxisIds = new Set(store.axes.map((axis) => axis.id));
    const nextTargetAxisIds = input.targetAxisIds
      ? Array.from(new Set(input.targetAxisIds.filter(Boolean)))
      : flow.targetAxisIds;
    const unknownAxisIds = nextTargetAxisIds.filter((axisId) => !knownAxisIds.has(axisId));

    if (unknownAxisIds.length > 0) {
      throw new Error("Choose valid target axes for this flow.");
    }

    const nextFlowName = input.flowName?.trim() || flow.name;
    const stageRecords = input.stages.map((stageInput, index) => {
      const nextQuestionIds = Array.from(
        new Set((stageInput.questionIds ?? []).map((questionId) => questionId.trim()).filter(Boolean)),
      );
      const unknownQuestionId = nextQuestionIds.find(
        (questionId) => !store.questions.some((question) => question.id === questionId),
      );

      if (unknownQuestionId) {
        throw new Error("Choose valid questions from the question bank.");
      }

      const existingStage =
        stageInput.id && flowStageIds.has(stageInput.id)
          ? getStageById(store, stageInput.id)
          : undefined;

      const stage =
        existingStage ??
        ({
          id: makeId("stage"),
          flowId: flow.id,
          name: "",
          description: "",
          orderIndex: index + 1,
          canvasX: stageInput.canvasX,
          canvasY: stageInput.canvasY,
          durationMinutes: stageInput.durationMinutes,
          interviewerRole: "",
          questionIds: [],
          axisIds: [],
          scoringRules: [],
        } satisfies InterviewStage);

      stage.name = stageInput.name.trim();
      stage.description = stageInput.description?.trim();
      stage.durationMinutes = stageInput.durationMinutes;
      stage.interviewerRole = stageInput.interviewerRole?.trim();
      stage.scoringRules = stageInput.scoringRules.map((rule) => rule.trim()).filter(Boolean);
      stage.canvasX = stageInput.canvasX;
      stage.canvasY = stageInput.canvasY;
      stage.orderIndex = index + 1;

      return {
        clientStageId: stageInput.id,
        stage,
        nextQuestionIds,
        isNew: !existingStage,
      };
    });

    const nextStageIds = new Set(stageRecords.map(({ stage }) => stage.id));
    const removedStages = flowStages.filter((stage) => !nextStageIds.has(stage.id));
    const blockedStage = removedStages.find((stage) => isStageReferenced(store, stage.id));

    if (blockedStage) {
      throw new Error(
        `${blockedStage.name} cannot be removed because it is mapped in ATS or already has interview sessions.`,
      );
    }

    stageRecords
      .filter(({ isNew }) => isNew)
      .forEach(({ stage }) => {
        store.stages.push(stage);
      });

    removedStages.forEach((stage) => {
      [...stage.questionIds].forEach((questionId) => {
        const question = store.questions.find((item) => item.id === questionId);
        if (question) {
          question.stageIds = question.stageIds.filter((stageId) => stageId !== stage.id);
        }
      });
    });

    store.stages = store.stages.filter(
      (stage) => stage.flowId !== flow.id || nextStageIds.has(stage.id),
    );

    stageRecords.forEach(({ stage, nextQuestionIds }) => {
      const previousQuestionIds = [...stage.questionIds];

      previousQuestionIds.forEach((questionId) => {
        if (!nextQuestionIds.includes(questionId)) {
          const question = store.questions.find((item) => item.id === questionId);
          if (question) {
            question.stageIds = question.stageIds.filter((stageId) => stageId !== stage.id);
          }
        }
      });

      stage.questionIds = [];
      nextQuestionIds.forEach((questionId) => {
        ensureQuestionAttachedToStage(store, questionId, stage.id);
      });
      stage.questionIds = [...nextQuestionIds];
      recomputeStageAxisIds(store, stage.id);
    });

    flow.name = nextFlowName;
    flow.targetAxisIds = nextTargetAxisIds;

    if (input.status === "active") {
      assertFlowCanPublish(store, flow.name, flow.targetAxisIds, stageRecords.map(({ stage }) => stage));
      flow.status = "active";
    } else if (input.status) {
      flow.status = input.status;
    }

    appendAuditLog(
      store,
      input.status === "active" ? "published_flow" : "updated_flow_layout",
      "flow",
      flow.id,
      input.status === "active"
        ? `Published ${flow.name}.`
        : `Saved stage layout for ${flow.name}.`,
      actor,
    );

    return {
      flowId: flow.id,
      stageCount: stageRecords.length,
      status: flow.status,
      stageIdMap: Object.fromEntries(
        stageRecords
          .filter(({ isNew, clientStageId }) => isNew && clientStageId && clientStageId !== "")
          .map(({ clientStageId, stage }) => [clientStageId, stage.id]),
      ),
    };
  });
}

export async function upsertConnection(provider: AtsProvider, input: ConnectProviderInput) {
  return mutateMvpStore((store) => {
    const existing = store.atsConnections.find((connection) => connection.provider === provider);
    const encryptedCredential = `enc:${input.apiKey.trim().slice(0, 4)}••••`;

    if (existing) {
      existing.status = "active";
      existing.encryptedCredential = encryptedCredential;
      existing.lastSyncedAt = nowIso();
      appendAuditLog(
        store,
        "connected_provider",
        "integration",
        existing.id,
        `Connected ${provider} integration.`,
        findUser(store, "admin")?.name ?? "Admin",
      );
      return existing;
    }

    const connection: AtsConnection = {
      id: makeId("conn"),
      orgId: getOrgId(store),
      provider,
      encryptedCredential,
      status: "active",
      lastSyncedAt: nowIso(),
      capabilities: {
        canReadJobs: true,
        canReadApplications: true,
        canReadInterviews: true,
        canSubmitStructuredFeedback: provider === "greenhouse",
        canCreateCandidateNote: true,
        canAttachPdf: true,
      },
    };

    store.atsConnections.push(connection);
    appendAuditLog(
      store,
      "connected_provider",
      "integration",
      connection.id,
      `Connected ${provider} integration.`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return connection;
  });
}

export async function syncProvider(provider: AtsProvider) {
  return mutateMvpStore((store) => {
    const connection = store.atsConnections.find((item) => item.provider === provider);
    if (!connection || connection.status !== "active") {
      throw new Error("Connect the provider before syncing.");
    }

    connection.lastSyncedAt = nowIso();
    let createdSessions = 0;

    store.applications
      .filter((application) => application.provider === provider)
      .forEach((application) => {
        const jobMapping = store.atsJobMappings.find(
          (mapping) =>
            mapping.provider === provider && mapping.externalJobId === application.externalJobId,
        );
        if (!jobMapping) {
          return;
        }

        const stageMapping = store.atsStageMappings.find(
          (mapping) =>
            mapping.atsJobMappingId === jobMapping.id &&
            mapping.externalStageId === application.externalStageId,
        );
        if (!stageMapping) {
          return;
        }

        const existing = store.sessions.find(
          (session) =>
            session.applicationId === application.id &&
            session.froggyStageId === stageMapping.froggyStageId,
        );
        if (existing) {
          return;
        }

        const flow = getFlowById(store, jobMapping.froggyFlowId);
        const sessionId = makeId("session");
        store.sessions.push({
          id: sessionId,
          orgId: getOrgId(store),
          applicationId: application.id,
          froggyStageId: stageMapping.froggyStageId,
          status: "scheduled",
          flowVersion: flow?.version ?? 1,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
        store.sessionQuestionSnapshots.push(...buildStageSnapshots(store, sessionId, stageMapping.froggyStageId));
        createdSessions += 1;
      });

    appendAuditLog(
      store,
      "synced_provider",
      "integration",
      connection.id,
      `Synced ${provider} jobs and applications. Created ${createdSessions} session(s).`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return {
      synced: store.atsJobs.filter((job) => job.provider === provider).length,
      failed: 0,
      createdSessions,
    };
  });
}

export async function saveJobMapping(provider: AtsProvider, input: CreateJobMappingInput) {
  return mutateMvpStore((store) => {
    const existing = store.atsJobMappings.find(
      (mapping) =>
        mapping.provider === provider && mapping.externalJobId === input.externalJobId,
    );

    if (existing) {
      existing.froggyRoleId = input.froggyRoleId;
      existing.froggyFlowId = input.froggyFlowId;
      appendAuditLog(
        store,
        "updated_job_mapping",
        "job_mapping",
        existing.id,
        `Updated ${provider} job mapping for ${input.externalJobId}.`,
        findUser(store, "admin")?.name ?? "Admin",
      );
      return existing;
    }

    const mapping: AtsJobMapping = {
      id: makeId("job_mapping"),
      orgId: getOrgId(store),
      provider,
      externalJobId: input.externalJobId,
      froggyRoleId: input.froggyRoleId,
      froggyFlowId: input.froggyFlowId,
    };

    store.atsJobMappings.push(mapping);
    appendAuditLog(
      store,
      "created_job_mapping",
      "job_mapping",
      mapping.id,
      `Mapped ${provider} job ${input.externalJobId}.`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return mapping;
  });
}

export async function saveStageMapping(provider: AtsProvider, input: CreateStageMappingInput) {
  return mutateMvpStore((store) => {
    const jobMapping = store.atsJobMappings.find(
      (mapping) => mapping.id === input.atsJobMappingId && mapping.provider === provider,
    );
    if (!jobMapping) {
      throw new Error("Job mapping not found.");
    }

    const existing = store.atsStageMappings.find(
      (mapping) =>
        mapping.atsJobMappingId === input.atsJobMappingId &&
        mapping.externalStageId === input.externalStageId,
    );

    if (existing) {
      existing.froggyStageId = input.froggyStageId;
      appendAuditLog(
        store,
        "updated_stage_mapping",
        "stage_mapping",
        existing.id,
        `Updated stage mapping for ${input.externalStageId}.`,
        findUser(store, "admin")?.name ?? "Admin",
      );
      return existing;
    }

    const mapping = {
      id: makeId("stage_mapping"),
      atsJobMappingId: input.atsJobMappingId,
      externalStageId: input.externalStageId,
      froggyStageId: input.froggyStageId,
    };

    store.atsStageMappings.push(mapping);
    appendAuditLog(
      store,
      "created_stage_mapping",
      "stage_mapping",
      mapping.id,
      `Mapped ATS stage ${input.externalStageId}.`,
      findUser(store, "admin")?.name ?? "Admin",
    );

    return mapping;
  });
}

export async function createInterviewSession(input: CreateInterviewSessionInput) {
  return mutateMvpStore((store) => {
    const application = store.applications.find((item) => item.id === input.applicationId);
    if (!application) {
      throw new Error("Application not found.");
    }

    const duplicate = store.sessions.find(
      (session) =>
        (input.externalInterviewId && session.externalInterviewId === input.externalInterviewId) ||
        (session.applicationId === input.applicationId && session.froggyStageId === input.froggyStageId),
    );

    if (duplicate) {
      return duplicate;
    }

    const mapping = store.atsJobMappings.find(
      (jobMapping) =>
        jobMapping.provider === application.provider &&
        jobMapping.externalJobId === application.externalJobId,
    );
    const flow = mapping ? store.flows.find((item) => item.id === mapping.froggyFlowId) : undefined;
    const session: InterviewSession = {
      id: makeId("session"),
      orgId: getOrgId(store),
      applicationId: input.applicationId,
      froggyStageId: input.froggyStageId,
      externalInterviewId: input.externalInterviewId,
      interviewerUserId: input.interviewerUserId,
      scheduledAt: input.scheduledAt,
      status: "scheduled",
      flowVersion: flow?.version ?? 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    store.sessions.push(session);
    store.sessionQuestionSnapshots.push(...buildStageSnapshots(store, session.id, session.froggyStageId));
    appendAuditLog(
      store,
      "created_session",
      "session",
      session.id,
      `Created interview session for ${application.candidateName}.`,
      findUser(store, "recruiter")?.name ?? "Recruiter",
    );

    return session;
  });
}

export async function submitScorecard(sessionId: string, input: SubmitScorecardInput) {
  return mutateMvpStore((store) => {
    const session = store.sessions.find((item) => item.id === sessionId);
    if (!session) {
      throw new Error("Interview session not found.");
    }

    const existing = store.scorecards.find((scorecard) => scorecard.sessionId === sessionId);
    if (existing?.locked) {
      throw new Error("Feedback is already locked for this interview.");
    }

    const stage = getStageById(store, session.froggyStageId);
    const application = store.applications.find((item) => item.id === session.applicationId);
    if (!stage || !application) {
      throw new Error("Interview context is incomplete.");
    }

    const requiredAxes = stage.axisIds;
    const submittedAxisIds = new Set(input.axisScores.map((axisScore) => axisScore.axisId));

    requiredAxes.forEach((axisId) => {
      if (!submittedAxisIds.has(axisId)) {
        const axis = store.axes.find((item) => item.id === axisId);
        throw new Error(`Missing required score for ${axis?.name ?? axisId}.`);
      }
    });

    input.axisScores.forEach((axisScore) => {
      if (!axisScore.evidence.trim()) {
        const axis = store.axes.find((item) => item.id === axisScore.axisId);
        throw new Error(`Evidence is required for ${axis?.name ?? axisScore.axisId}.`);
      }
    });

    const scorecardId = existing?.id ?? makeId("scorecard");
    const submittedAt = nowIso();

    if (existing) {
      existing.recommendation = input.recommendation;
      existing.confidence = input.confidence;
      existing.overallNotes = input.overallNotes.trim();
      existing.submittedAt = submittedAt;
      existing.locked = true;
    } else {
      store.scorecards.push({
        id: scorecardId,
        sessionId,
        submittedByUserId: findUser(store, "interviewer")?.id ?? store.users[0]?.id ?? "",
        recommendation: input.recommendation,
        confidence: input.confidence,
        overallNotes: input.overallNotes.trim(),
        submittedAt,
        locked: true,
      });
    }

    store.scorecardAxisScores = store.scorecardAxisScores.filter((score) => score.scorecardId !== scorecardId);
    store.scorecardQuestionNotes = store.scorecardQuestionNotes.filter((note) => note.scorecardId !== scorecardId);

    input.axisScores.forEach((axisScore) => {
      store.scorecardAxisScores.push({
        id: makeId("axis_score"),
        scorecardId,
        axisId: axisScore.axisId,
        score: axisScore.score,
        evidence: axisScore.evidence.trim(),
      });
    });

    input.questionNotes
      .filter((note) => note.notes.trim())
      .forEach((note) => {
        store.scorecardQuestionNotes.push({
          id: makeId("question_note"),
          scorecardId,
          questionId: note.questionId,
          notes: note.notes.trim(),
        });
      });

    session.status = "submitted";
    session.updatedAt = submittedAt;

    const connection = store.atsConnections.find((item) => item.provider === application.provider);
    const mode = getWritebackMode(connection);
    store.writebackJobs.push({
      id: makeId("writeback"),
      orgId: getOrgId(store),
      provider: application.provider,
      scorecardId,
      externalCandidateId: application.externalCandidateId,
      externalApplicationId: application.externalApplicationId,
      status: mode === "copy_paste" ? "pending" : "success",
      attempts: 1,
      mode,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    });

    appendAuditLog(
      store,
      "submitted_scorecard",
      "scorecard",
      scorecardId,
      `Submitted and locked scorecard for ${application.candidateName}.`,
      findUser(store, "interviewer")?.name ?? "Interviewer",
    );

    return {
      status: "submitted",
      scorecardId,
    };
  });
}
