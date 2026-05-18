import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricCard, PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import PacketActionPanel from "@/features/packets/components/packet-action-panel";
import { getPacket } from "@/lib/mvp/store";

export default async function PacketPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const packet = await getPacket(applicationId);

  if (!packet) {
    notFound();
  }

  const submittedSessions = packet.sessions.filter(
    ({ session }) => session.status === "submitted",
  ).length;
  const writebackSuccessCount = packet.sessions.filter(
    ({ writebackJob }) => writebackJob?.status === "success",
  ).length;

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Candidate packet"
        title={`${packet.candidate.name} · ${packet.role?.name ?? "Unmapped role"}`}
        description="This is the hiring packet Froggy assembles from submitted scorecards: axis coverage, evidence, strengths, risks, and the compact ATS summary."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/candidates/${packet.candidate.id}`}
              className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              Candidate detail
            </Link>
            <Pill tone={packet.overallRecommendation === "pending" ? "warning" : "success"}>
              {packet.overallRecommendation.replaceAll("_", " ")}
            </Pill>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Recommendation"
          value={packet.overallRecommendation.replaceAll("_", " ")}
          detail="Blended from submitted scorecards in this packet"
        />
        <MetricCard
          label="Submitted sessions"
          value={submittedSessions}
          detail={`${packet.sessions.length - submittedSessions} session${packet.sessions.length - submittedSessions === 1 ? "" : "s"} still open`}
        />
        <MetricCard
          label="Missing signals"
          value={packet.missingSignals.length}
          detail="Axes still missing evidence across the loop"
        />
        <MetricCard
          label="ATS write-backs"
          value={writebackSuccessCount}
          detail="Successful handoffs already prepared for the ATS"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Axis coverage"
          description="Missing signals are called out explicitly so the hiring team knows whether the loop actually measured the rubric."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {packet.axisSummary.map((summary) => (
              <div
                key={summary.axisId}
                className="rounded-3xl border p-5"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{summary.axis}</p>
                  <Pill tone={summary.covered ? "success" : "warning"}>
                    {summary.covered ? "covered" : "missing"}
                  </Pill>
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {summary.averageScore !== null ? `${summary.averageScore}/5` : "—"}
                </p>
                <div className="mt-3 grid gap-2 text-sm" style={{ color: "var(--muted)" }}>
                  {summary.evidence.length ? (
                    summary.evidence.slice(0, 2).map((evidence) => <p key={evidence}>{evidence}</p>)
                  ) : (
                    <p>No evidence submitted yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard
            title="ATS handoff"
            description="Froggy stores the full packet here, then chooses the best available write-back mode for each provider."
          >
            <PacketActionPanel packet={packet} />
          </SectionCard>

          <SectionCard
            title="Decision summary"
            description="Froggy keeps the detailed evidence, then prepares a concise summary for ATS write-back."
          >
            <SummaryList label="Strengths" items={packet.strengths} empty="No strengths captured yet." />
            <SummaryList label="Concerns" items={packet.concerns} empty="No concerns captured yet." />
            <SummaryList label="Missing signals" items={packet.missingSignals} empty="No missing signals." />
            <div className="mt-5 rounded-3xl border p-5" style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                ATS summary payload
              </p>
              <pre className="mt-3 whitespace-pre-wrap text-sm" style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>
                {packet.atsSummary}
              </pre>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Sessions and write-back state"
        description="Each session owns its locked scorecard, while the packet shows whether Froggy already prepared a write-back record."
      >
        <div className="grid gap-4">
          {packet.sessions.map(({ session, stage, scorecard, writebackJob }) => (
            <div
              key={session.id}
              className="rounded-3xl border p-5"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold">{stage.name}</p>
                    <Pill tone={session.status === "submitted" ? "success" : "warning"}>
                      {session.status.replaceAll("_", " ")}
                    </Pill>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                    {scorecard
                      ? `Recommendation: ${scorecard.recommendation.replaceAll("_", " ")} · confidence ${scorecard.confidence}/5`
                      : "Scorecard still pending"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                    Write-back: {writebackJob ? `${writebackJob.mode.replaceAll("_", " ")} / ${writebackJob.status}` : "not started"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </WorkspacePage>
  );
}

function SummaryList({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <div className="mt-3 grid gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p>{empty}</p>}
      </div>
    </div>
  );
}
