import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import ManualSessionForm from "@/features/candidates/components/manual-session-form";
import { getCandidateWorkspace } from "@/lib/mvp/store";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const workspace = await getCandidateWorkspace(candidateId);

  if (!workspace) {
    notFound();
  }

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow={workspace.application.externalApplicationId}
        title={workspace.candidate.name}
        description="Review synced ATS context, create a manual interview session if the automation missed one, and move from individual feedback into the final packet."
        actions={
          <Link
            href={`/packets/${workspace.application.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
            style={{ background: "var(--moss)", color: "var(--paper)" }}
          >
            Open packet
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          title="Candidate context"
          description="Froggy reads pipeline state from the ATS but keeps interview quality artifacts and packet assembly here."
        >
          <dl className="grid gap-4 text-sm">
            <Field label="Email" value={workspace.candidate.email ?? "Not provided"} />
            <Field label="Provider" value={workspace.application.provider} />
            <Field label="Role" value={workspace.role?.name ?? "Unmapped"} />
            <Field label="Current ATS stage" value={workspace.application.externalStageId} />
            <Field label="Flow" value={workspace.flow?.name ?? "No mapped flow"} />
          </dl>
        </SectionCard>

        <SectionCard
          title="Manual session fallback"
          description="Use this when polling or mappings are incomplete. Duplicate stage sessions are deduplicated automatically."
        >
          <ManualSessionForm
            applicationId={workspace.application.id}
            stages={workspace.stages}
            users={workspace.users}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Interview sessions"
        description="Sessions stay immutable once the scorecard is submitted, and each one links into the interviewer guide."
      >
        <div className="grid gap-4">
          {workspace.sessions.map(({ session, stage, scorecard }) => (
            <div
              key={session.id}
              className="flex flex-col gap-4 rounded-3xl border p-5 lg:flex-row lg:items-start lg:justify-between"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{stage?.name ?? session.froggyStageId}</p>
                  <Pill tone={session.status === "submitted" ? "success" : "warning"}>
                    {session.status.replaceAll("_", " ")}
                  </Pill>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Scheduled: {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : "Not scheduled"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  {scorecard ? `Recommendation: ${scorecard.recommendation.replaceAll("_", " ")}` : "Scorecard not submitted yet"}
                </p>
              </div>
              <Link
                href={`/interviews/${session.id}`}
                className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
              >
                Open interviewer guide
              </Link>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Packet snapshot"
        description="This is the live aggregate that hiring reviewers eventually use instead of piecing together ATS scorecards."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Recommendation" value={workspace.latestPacket?.overallRecommendation.replaceAll("_", " ") ?? "pending"} />
          <MetricCard label="Missing signals" value={String(workspace.latestPacket?.missingSignals.length ?? 0)} />
          <MetricCard label="Captured axes" value={String(workspace.latestPacket?.axisSummary.filter((axis) => axis.covered).length ?? 0)} />
        </div>
      </SectionCard>
    </WorkspacePage>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-3xl border p-5"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold capitalize">{value}</p>
    </div>
  );
}
