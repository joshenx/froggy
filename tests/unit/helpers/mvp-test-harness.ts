import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";

type MvpModules = {
  store: typeof import("@/lib/mvp/store");
  rolesRoute: typeof import("@/app/api/roles/route");
  roleFlowRoute: typeof import("@/app/api/roles/[roleId]/flows/route");
  stageQuestionRoute: typeof import("@/app/api/stages/[stageId]/questions/route");
  globalBankQuestionRoute: typeof import("@/app/api/questions/route");
  bankQuestionRoute: typeof import("@/app/api/roles/[roleId]/questions/route");
  globalImportQuestionsRoute: typeof import("@/app/api/questions/import/route");
  importQuestionsRoute: typeof import("@/app/api/roles/[roleId]/questions/import/route");
  questionDetailRoute: typeof import("@/app/api/questions/[questionId]/route");
  questionAttachmentsRoute: typeof import("@/app/api/questions/[questionId]/attachments/route");
  companyRoute: typeof import("@/app/api/companies/route");
  sessionRoute: typeof import("@/app/api/interview-sessions/route");
  scorecardRoute: typeof import("@/app/api/interview-sessions/[sessionId]/scorecard/route");
  syncJobsRoute: typeof import("@/app/api/integrations/[provider]/sync/jobs/route");
};

export async function withMvpTestContext<T>(
  run: (context: {
    storePath: string;
    modules: MvpModules;
  }) => Promise<T>,
) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "froggy-vitest-"));
  const storePath = path.join(tempDir, "mvp-store.json");
  const originalStorePath = process.env.FROGGY_MVP_STORE;

  process.env.FROGGY_MVP_STORE = storePath;
  vi.resetModules();

  try {
    const modules: MvpModules = {
      store: await import("@/lib/mvp/store"),
      rolesRoute: await import("@/app/api/roles/route"),
      roleFlowRoute: await import("@/app/api/roles/[roleId]/flows/route"),
      stageQuestionRoute: await import("@/app/api/stages/[stageId]/questions/route"),
      globalBankQuestionRoute: await import("@/app/api/questions/route"),
      bankQuestionRoute: await import("@/app/api/roles/[roleId]/questions/route"),
      globalImportQuestionsRoute: await import("@/app/api/questions/import/route"),
      importQuestionsRoute: await import("@/app/api/roles/[roleId]/questions/import/route"),
      questionDetailRoute: await import("@/app/api/questions/[questionId]/route"),
      questionAttachmentsRoute: await import("@/app/api/questions/[questionId]/attachments/route"),
      companyRoute: await import("@/app/api/companies/route"),
      sessionRoute: await import("@/app/api/interview-sessions/route"),
      scorecardRoute: await import("@/app/api/interview-sessions/[sessionId]/scorecard/route"),
      syncJobsRoute: await import("@/app/api/integrations/[provider]/sync/jobs/route"),
    };

    return await run({ storePath, modules });
  } finally {
    vi.resetModules();
    if (originalStorePath === undefined) {
      delete process.env.FROGGY_MVP_STORE;
    } else {
      process.env.FROGGY_MVP_STORE = originalStorePath;
    }
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function makeJsonRequest(body: unknown, init?: RequestInit) {
  return new Request("http://localhost", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    ...init,
  });
}
