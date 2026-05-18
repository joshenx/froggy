import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricCard, PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import ScorecardForm from "@/features/interviews/components/scorecard-form";
import { getGuide } from "@/lib/mvp/store";

export default async function InterviewGuidePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const guide = await getGuide(sessionId);

  if (!guide) {
    notFound();
  }

  const submittedAxisCount = guide.existingAxisScores.filter(
    (score) => score.evidence.trim().length > 0,
  ).length;
  const scheduledAtLabel = guide.session.scheduledAt
    ? new Date(guide.session.scheduledAt).toLocaleString()
    : "Not scheduled";

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow={guide.application.externalApplicationId}
        title={`${guide.stage.name} · ${guide.candidate.name}`}
        description="Interviewers work here instead of relying on the ATS scorecard alone. The guide includes snapped questions, rubric anchors, and a locked evidence-based submission flow."
        actions={
          <div className="flex flex-wrap gap-3">
            <Pill tone={guide.existingScorecard?.locked ? "success" : "warning"}>
              {guide.existingScorecard?.locked ? "Submitted" : "Draft"}
            </Pill>
            <Link
              href={`/packets/${guide.application.id}`}
              className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              Open packet
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Session status"
          value={guide.session.status.replaceAll("_", " ")}
          detail={`Flow version ${guide.session.flowVersion}`}
        />
        <MetricCard
          label="Interviewer"
          value={guide.interviewer?.name ?? "Unassigned"}
          detail="Assigned interviewer for this session"
        />
        <MetricCard
          label="Scheduled at"
          value={guide.session.scheduledAt ? "Set" : "Pending"}
          detail={scheduledAtLabel}
        />
        <MetricCard
          label="Snapped questions"
          value={guide.questions.length}
          detail={`${submittedAxisCount} of ${guide.stage.axisIds.length} axis score${guide.stage.axisIds.length === 1 ? "" : "s"} already documented`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Interview guide"
          description={`${guide.role.name} · ${guide.flow.name} · ${guide.stage.durationMinutes} minutes`}
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <GuideMeta label="Candidate" value={guide.candidate.email ?? guide.candidate.name} />
            <GuideMeta label="Provider" value={guide.application.provider} />
            <GuideMeta label="ATS stage" value={guide.application.externalStageId} />
            <GuideMeta label="Stage" value={guide.stage.name} />
          </div>

          <div className="grid gap-4">
            {guide.questions.map((question) => (
              <div
                key={question.id}
                className="rounded-3xl border p-5"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <p className="text-lg font-semibold">{question.titleSnapshot}</p>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {question.promptSnapshot}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.rubricSnapshots.map((rubric) => (
                    <Pill key={rubric.axisId}>{rubric.axisName}</Pill>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                      Expected signals
                    </p>
                    <ul className="mt-2 grid gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                      {question.expectedSignalsSnapshot.length ? (
                        question.expectedSignalsSnapshot.map((signal) => <li key={signal}>{signal}</li>)
                      ) : (
                        <li>No expected signals saved on this snapshot.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                      Follow-ups
                    </p>
                    <ul className="mt-2 grid gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                      {question.followUpsSnapshot.length ? (
                        question.followUpsSnapshot.map((followUp) => <li key={followUp}>{followUp}</li>)
                      ) : (
                        <li>No follow-ups saved on this snapshot.</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    Rubric anchors
                  </p>
                  <div className="mt-3 grid gap-3">
                    {question.rubricSnapshots.map((rubric) => (
                      <div
                        key={rubric.axisId}
                        className="rounded-2xl border px-4 py-3"
                        style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
                      >
                        <p className="text-sm font-semibold">{rubric.axisName}</p>
                        <div className="mt-3 grid gap-2 text-xs" style={{ color: "var(--muted)" }}>
                          <AnchorLine label="1/5 anchor" value={rubric.score1} />
                          <AnchorLine label="3/5 anchor" value={rubric.score3} />
                          <AnchorLine label="5/5 anchor" value={rubric.score5} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Structured scorecard"
          description="Evidence is required for every axis, and the scorecard becomes immutable after submission."
        >
          <ScorecardForm sessionId={sessionId} guide={guide} />
        </SectionCard>
      </div>
    </WorkspacePage>
  );
}

function GuideMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function AnchorLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold" style={{ color: "var(--ink)" }}>
        {label}:
      </span>{" "}
      {value}
    </p>
  );
}
