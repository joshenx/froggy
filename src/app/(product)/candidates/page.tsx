import { MetricCard, PageHeader, SectionCard, WorkspacePage } from "@/components/ui";
import CandidateQueueBrowser from "@/features/candidates/components/candidate-queue-browser";
import { getCandidatesWorkspace } from "@/lib/mvp/store";

export default async function CandidatesPage() {
  const candidates = await getCandidatesWorkspace();
  const sessionCount = candidates.reduce((sum, candidate) => sum + candidate.sessions.length, 0);
  const submittedCount = candidates.reduce(
    (sum, candidate) => sum + candidate.submittedSessionCount,
    0,
  );
  const readyForReviewCount = candidates.filter(
    (candidate) =>
      candidate.submittedSessionCount > 0 &&
      (candidate.packet?.missingSignals.length ?? 0) === 0,
  ).length;
  const missingSignalCount = candidates.filter(
    (candidate) => (candidate.packet?.missingSignals.length ?? 0) > 0,
  ).length;

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Candidate operations"
        title="Synced candidates and interview sessions"
        description="Candidates arrive from the ATS, Froggy creates or deduplicates interview sessions, and every submitted scorecard becomes a packet and write-back event."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Applications"
          value={candidates.length}
          detail="Synced candidate applications across connected providers"
        />
        <MetricCard
          label="Sessions"
          value={sessionCount}
          detail="Interview sessions generated from mappings or manual fallback"
        />
        <MetricCard
          label="Submitted scorecards"
          value={submittedCount}
          detail="Evidence-based interview submissions locked in Froggy"
        />
        <MetricCard
          label="Review-ready packets"
          value={readyForReviewCount}
          detail={`${missingSignalCount} packet${missingSignalCount === 1 ? "" : "s"} still missing signals`}
        />
      </div>

      <SectionCard
        title="Candidate queue"
        description="Filter by provider, readiness, or candidate name to move from synced ATS applicants into interviewer guides and final packets."
      >
        <CandidateQueueBrowser items={candidates} />
      </SectionCard>
    </WorkspacePage>
  );
}
