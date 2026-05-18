"use client";

import type {
  AddStageInput,
  AttachQuestionToStagesInput,
  AtsProvider,
  ConnectProviderInput,
  CreateCompanyInput,
  CreateInterviewSessionInput,
  CreateJobMappingInput,
  ImportQuestionsInput,
  ImportQuestionsResult,
  CreateQuestionInput,
  CreateRoleInput,
  CreateStageMappingInput,
  FlowStatus,
  SubmitScorecardInput,
  UpdateQuestionInput,
  UpdateFlowLayoutInput,
} from "@/lib/mvp/types";

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong.");
  }

  return body;
}

export function createRole(input: CreateRoleInput) {
  return requestJson<{ roleId: string; flowId: string }>("/api/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function addStage(roleId: string, input: AddStageInput) {
  return requestJson<{ stageId: string }>(`/api/roles/${roleId}/flows`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function saveFlow(roleId: string, input: UpdateFlowLayoutInput) {
  return requestJson<{ flowId: string; stageCount: number; status: FlowStatus; stageIdMap?: Record<string, string> }>(
    `/api/roles/${roleId}/flows`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function createQuestion(stageId: string, input: CreateQuestionInput) {
  return requestJson<{ questionId: string }>(`/api/stages/${stageId}/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createBankQuestion(roleId: string, input: CreateQuestionInput) {
  return requestJson<{ questionId: string }>(`/api/roles/${roleId}/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createGlobalBankQuestion(input: CreateQuestionInput) {
  return requestJson<{ questionId: string }>("/api/questions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBankQuestion(questionId: string, input: UpdateQuestionInput) {
  return requestJson<{ questionId: string }>(`/api/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function attachQuestionToStages(
  questionId: string,
  input: AttachQuestionToStagesInput,
) {
  return requestJson<{ questionId: string; attachedStageIds: string[] }>(
    `/api/questions/${questionId}/attachments`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function importQuestions(roleId: string, input: ImportQuestionsInput) {
  return requestJson<ImportQuestionsResult>(`/api/roles/${roleId}/questions/import`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function importGlobalQuestions(input: ImportQuestionsInput) {
  return requestJson<ImportQuestionsResult>("/api/questions/import", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createCompany(input: CreateCompanyInput) {
  return requestJson<{ companyId: string }>("/api/companies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadCompanyLogo(companyId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/companies/${companyId}/logo`, {
    method: "POST",
    body: formData,
  });

  const body = (await response.json().catch(() => ({}))) as { error?: string; logoUrl?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "Unable to upload company logo.");
  }

  return body;
}

export function connectProvider(provider: AtsProvider, input: ConnectProviderInput) {
  return requestJson<{ connectionId: string; status: string }>(
    `/api/integrations/${provider}/connect`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function syncProvider(provider: AtsProvider) {
  return requestJson<{ synced: number; failed: number; createdSessions: number }>(
    `/api/integrations/${provider}/sync/jobs`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function saveJobMapping(provider: AtsProvider, input: CreateJobMappingInput) {
  return requestJson<{ mappingId: string }>(`/api/integrations/${provider}/job-mappings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function saveStageMapping(provider: AtsProvider, input: CreateStageMappingInput) {
  return requestJson<{ mappingId: string }>(`/api/integrations/${provider}/stage-mappings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createInterviewSession(input: CreateInterviewSessionInput) {
  return requestJson<{ sessionId: string }>("/api/interview-sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function submitInterviewScorecard(sessionId: string, input: SubmitScorecardInput) {
  return requestJson<{ status: string; scorecardId: string }>(
    `/api/interview-sessions/${sessionId}/scorecard`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function resetMvpState() {
  return requestJson<{ ok: true }>("/api/testing/reset-mvp", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
