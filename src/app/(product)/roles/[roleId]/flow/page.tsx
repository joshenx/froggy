import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspacePage } from "@/components/ui";
import FlowCanvasEditor from "@/features/roles/components/flow-canvas-editor";
import StackedLoopBuilder from "@/features/roles/components/stacked-loop-builder";
import { getRoleWorkspace } from "@/lib/mvp/store";

export default async function RoleFlowPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { roleId } = await params;
  const { view } = await searchParams;
  const workspace = await getRoleWorkspace(roleId);

  if (!workspace) {
    notFound();
  }

  const builderHref = `/roles/${workspace.role.id}/flow`;
  const canvasHref = `/roles/${workspace.role.id}/flow?view=canvas`;
  const questionBankHref = `/roles/${workspace.role.id}/questions`;
  const newQuestionHref = `/roles/${workspace.role.id}/questions/new`;
  const mode = view === "canvas" ? "canvas" : "builder";

  return (
    <WorkspacePage>
      {mode === "canvas" ? (
        <>
          <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--line-soft)" }}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--moss)" }}>
                Flow v{workspace.flow.version}
              </p>
              <h1 className="mt-2 text-[30px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {workspace.flow.name}
              </h1>
              <p className="mt-2 max-w-3xl text-[14px] leading-6" style={{ color: "var(--muted)" }}>
                Canvas mode is kept as a secondary layout editor for stage metadata and saved positions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex rounded-full border p-1"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <Link
                  href={builderHref}
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  Builder
                </Link>
                <span
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold"
                  style={{ background: "var(--moss)", color: "var(--paper)" }}
                >
                  Canvas
                </span>
              </div>

              <Link
                href={questionBankHref}
                className="inline-flex h-10 items-center justify-center rounded-full border px-4 text-[13px] font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
              >
                Question bank
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <FlowCanvasEditor
              roleId={workspace.role.id}
              flowId={workspace.flow.id}
              roleName={workspace.role.name}
              stages={workspace.stages}
            />
          </div>
        </>
      ) : (
        <StackedLoopBuilder
          roleId={workspace.role.id}
          roleName={workspace.role.name}
          flowName={workspace.flow.name}
          flowVersion={workspace.flow.version}
          flowStatus={workspace.flow.status}
          targetAxisIds={workspace.flow.targetAxisIds}
          axes={workspace.axes.map((axis) => ({
            id: axis.id,
            name: axis.name,
          }))}
          stages={workspace.stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            description: stage.description,
            durationMinutes: stage.durationMinutes,
            interviewerRole: stage.interviewerRole,
            scoringRules: stage.scoringRules,
            questionIds: stage.questionIds,
            axisIds: stage.axisIds,
            orderIndex: stage.orderIndex,
            canvasX: stage.canvasX,
            canvasY: stage.canvasY,
          }))}
          questionBank={workspace.questionBank.map((question) => ({
            id: question.id,
            title: question.title,
            prompt: question.prompt,
            axisIds: question.axisIds,
            expectedDurationMinutes: question.expectedDurationMinutes,
            usedLastQuarter: question.usedLastQuarter,
            signalScore: question.signalScore,
          }))}
          builderHref={builderHref}
          canvasHref={canvasHref}
          questionBankHref={questionBankHref}
          newQuestionHref={newQuestionHref}
        />
      )}
    </WorkspacePage>
  );
}
