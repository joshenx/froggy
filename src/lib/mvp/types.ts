export type UserRole = "admin" | "hiring_manager" | "interviewer" | "recruiter";
export type RoleLevel = "junior" | "mid" | "senior" | "staff" | "manager";
export type FlowStatus = "draft" | "active" | "archived";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type AtsProvider = "ashby" | "greenhouse";
export type AtsStatus = "active" | "error" | "disabled";
export type ApplicationStatus = "active" | "rejected" | "hired" | "withdrawn";
export type SessionStatus = "scheduled" | "in_progress" | "submitted" | "cancelled";
export type Recommendation =
  | "strong_no"
  | "no"
  | "lean_no"
  | "lean_yes"
  | "yes"
  | "strong_yes";
export type WritebackStatus = "pending" | "success" | "failed" | "retrying";
export type WritebackMode =
  | "structured_scorecard"
  | "candidate_note"
  | "pdf_attachment"
  | "copy_paste";

export type Organization = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
};

export type Role = {
  id: string;
  orgId: string;
  name: string;
  level: RoleLevel;
};

export type InterviewFlow = {
  id: string;
  orgId: string;
  roleId: string;
  name: string;
  version: number;
  status: FlowStatus;
  targetAxisIds: string[];
  createdBy: string;
};

export type InterviewStage = {
  id: string;
  flowId: string;
  name: string;
  description?: string;
  orderIndex: number;
  canvasX: number;
  canvasY: number;
  durationMinutes: number;
  interviewerRole?: string;
  questionIds: string[];
  axisIds: string[];
  scoringRules: string[];
};

export type EvaluationAxis = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  positiveSignals: string[];
  negativeSignals: string[];
  anchoredBands: [string, string, string, string, string];
};

export type Question = {
  id: string;
  orgId: string;
  roleIds: string[];
  companyIds: string[];
  collection: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  seniority: RoleLevel;
  levels: RoleLevel[];
  axisIds: string[];
  followUps: string[];
  expectedSignals: string[];
  expectedDurationMinutes: number;
  roleFamily: string;
  usedLastQuarter: number;
  signalScore: number;
  stageIds: string[];
  rationale: string;
  anchors: [string, string, string];
  createdAt: string;
};

export type QuestionBankStageOption = {
  id: string;
  name: string;
  durationMinutes: number;
  canvasX: number;
  canvasY: number;
  flowId: string;
  roleId: string;
  roleName: string;
  flowName: string;
};

export type Company = {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  createdAt: string;
};

export type Rubric = {
  id: string;
  questionId: string;
  axisId: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
  score5: string;
};

export type AtsCapabilities = {
  canReadJobs: boolean;
  canReadApplications: boolean;
  canReadInterviews: boolean;
  canSubmitStructuredFeedback: boolean;
  canCreateCandidateNote: boolean;
  canAttachPdf: boolean;
};

export type AtsConnection = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  encryptedCredential: string;
  status: AtsStatus;
  lastSyncedAt?: string;
  capabilities: AtsCapabilities;
};

export type AtsJob = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  externalJobId: string;
  name: string;
  status: "open" | "closed" | "draft";
};

export type AtsStage = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  externalStageId: string;
  externalJobId: string;
  name: string;
  orderIndex?: number;
};

export type AtsJobMapping = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  externalJobId: string;
  froggyRoleId: string;
  froggyFlowId: string;
};

export type AtsStageMapping = {
  id: string;
  atsJobMappingId: string;
  externalStageId: string;
  froggyStageId: string;
};

export type CandidateApplication = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  externalCandidateId: string;
  externalApplicationId: string;
  externalJobId: string;
  externalStageId: string;
  candidateName: string;
  candidateEmail?: string;
  status: ApplicationStatus;
};

export type RubricSnapshot = {
  axisId: string;
  axisName: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
  score5: string;
};

export type InterviewSession = {
  id: string;
  orgId: string;
  applicationId: string;
  froggyStageId: string;
  externalInterviewId?: string;
  interviewerUserId?: string;
  scheduledAt?: string;
  status: SessionStatus;
  flowVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type InterviewSessionQuestionSnapshot = {
  id: string;
  sessionId: string;
  originalQuestionId: string;
  titleSnapshot: string;
  promptSnapshot: string;
  followUpsSnapshot: string[];
  expectedSignalsSnapshot: string[];
  axisIdsSnapshot: string[];
  rubricSnapshots: RubricSnapshot[];
};

export type Scorecard = {
  id: string;
  sessionId: string;
  submittedByUserId: string;
  recommendation: Recommendation;
  confidence: 1 | 2 | 3 | 4 | 5;
  overallNotes: string;
  submittedAt: string;
  locked: boolean;
};

export type ScorecardAxisScore = {
  id: string;
  scorecardId: string;
  axisId: string;
  score: 1 | 2 | 3 | 4 | 5;
  evidence: string;
};

export type ScorecardQuestionNote = {
  id: string;
  scorecardId: string;
  questionId: string;
  notes: string;
};

export type AtsWritebackJob = {
  id: string;
  orgId: string;
  provider: AtsProvider;
  scorecardId: string;
  externalCandidateId: string;
  externalApplicationId: string;
  status: WritebackStatus;
  attempts: number;
  mode: WritebackMode;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  orgId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  createdAt: string;
};

export type MvpStore = {
  organizations: Organization[];
  users: User[];
  companies: Company[];
  roles: Role[];
  flows: InterviewFlow[];
  stages: InterviewStage[];
  axes: EvaluationAxis[];
  questions: Question[];
  rubrics: Rubric[];
  atsConnections: AtsConnection[];
  atsJobs: AtsJob[];
  atsStages: AtsStage[];
  atsJobMappings: AtsJobMapping[];
  atsStageMappings: AtsStageMapping[];
  applications: CandidateApplication[];
  sessions: InterviewSession[];
  sessionQuestionSnapshots: InterviewSessionQuestionSnapshot[];
  scorecards: Scorecard[];
  scorecardAxisScores: ScorecardAxisScore[];
  scorecardQuestionNotes: ScorecardQuestionNote[];
  writebackJobs: AtsWritebackJob[];
  auditLogs: AuditLog[];
};

export type InterviewGuide = {
  candidate: {
    id: string;
    name: string;
    email?: string;
  };
  session: InterviewSession;
  application: CandidateApplication;
  stage: InterviewStage;
  flow: InterviewFlow;
  role: Role;
  interviewer?: User;
  questions: InterviewSessionQuestionSnapshot[];
  existingScorecard?: Scorecard;
  existingAxisScores: ScorecardAxisScore[];
  existingQuestionNotes: ScorecardQuestionNote[];
};

export type CandidatePacket = {
  candidate: {
    id: string;
    name: string;
    email?: string;
  };
  application: CandidateApplication;
  role?: Role;
  flow?: InterviewFlow;
  overallRecommendation: Recommendation | "pending";
  axisSummary: Array<{
    axisId: string;
    axis: string;
    averageScore: number | null;
    evidence: string[];
    covered: boolean;
  }>;
  strengths: string[];
  concerns: string[];
  missingSignals: string[];
  sessions: Array<{
    session: InterviewSession;
    stage: InterviewStage;
    scorecard?: Scorecard;
    writebackJob?: AtsWritebackJob;
  }>;
  atsSummary: string;
};

export type CandidateWorkspace = {
  candidate: {
    id: string;
    name: string;
    email?: string;
  };
  application: CandidateApplication;
  role?: Role;
  flow?: InterviewFlow;
  sessions: Array<{
    session: InterviewSession;
    stage?: InterviewStage;
    scorecard?: Scorecard;
  }>;
  users: User[];
  stages: InterviewStage[];
  latestPacket: CandidatePacket | null;
};

export type CreateRoleInput = {
  name: string;
  level: RoleLevel;
  flowName: string;
  stageNames: string[];
};

export type AddStageInput = {
  name: string;
  description?: string;
  durationMinutes: number;
  interviewerRole?: string;
  scoringRules: string[];
};

export type CreateQuestionInput = {
  title: string;
  prompt: string;
  difficulty: Difficulty;
  seniority: RoleLevel;
  levels?: RoleLevel[];
  axisIds: string[];
  companyIds?: string[];
  followUps: string[];
  expectedSignals: string[];
  expectedDurationMinutes: number;
  collection: string;
  roleFamily: string;
  rationale?: string;
  anchors?: [string, string, string];
};

export type UpdateQuestionInput = CreateQuestionInput;

export type CreateCompanyInput = {
  name: string;
  website?: string;
  logoUrl?: string;
};

export type UpdateFlowLayoutInput = {
  flowName?: string;
  status?: FlowStatus;
  targetAxisIds?: string[];
  stages: Array<{
    id?: string;
    name: string;
    description?: string;
    durationMinutes: number;
    interviewerRole?: string;
    scoringRules: string[];
    questionIds?: string[];
    canvasX: number;
    canvasY: number;
    orderIndex: number;
  }>;
};

export type AttachQuestionToStagesInput = {
  stageIds: string[];
};

export type ImportQuestionsInput = {
  csvText: string;
};

export type ImportQuestionsResult = {
  importedCount: number;
  failedCount: number;
  questionIds: string[];
  errors: Array<{
    row: number;
    message: string;
  }>;
};

export type ConnectProviderInput = {
  apiKey: string;
};

export type CreateJobMappingInput = {
  externalJobId: string;
  froggyRoleId: string;
  froggyFlowId: string;
};

export type CreateStageMappingInput = {
  atsJobMappingId: string;
  externalStageId: string;
  froggyStageId: string;
};

export type CreateInterviewSessionInput = {
  applicationId: string;
  froggyStageId: string;
  interviewerUserId?: string;
  scheduledAt?: string;
  externalInterviewId?: string;
};

export type SubmitScorecardInput = {
  recommendation: Recommendation;
  confidence: 1 | 2 | 3 | 4 | 5;
  overallNotes: string;
  axisScores: Array<{
    axisId: string;
    score: 1 | 2 | 3 | 4 | 5;
    evidence: string;
  }>;
  questionNotes: Array<{
    questionId: string;
    notes: string;
  }>;
};
