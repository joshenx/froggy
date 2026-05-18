import Link from "next/link";
import { MetricCard, PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import IntegrationConnectionCard from "@/features/integrations/components/integration-connection-card";
import { getIntegrationsWorkspace } from "@/lib/mvp/store";

export default async function IntegrationsPage() {
  const workspace = await getIntegrationsWorkspace();
  const providerSummaries = workspace.providers.map((provider) => {
    const connection = workspace.connections.find(
      (item) => item.provider === provider,
    );
    const jobs = workspace.jobs.filter((job) => job.provider === provider);
    const applications = workspace.applications.filter(
      (application) => application.provider === provider,
    );
    const jobMappings = workspace.jobMappings.filter(
      (mapping) => mapping.provider === provider,
    );
    const stageMappings = workspace.stageMappings.filter((mapping) =>
      jobMappings.some((jobMapping) => jobMapping.id === mapping.atsJobMappingId),
    );
    const sessions = workspace.sessions.filter((session) =>
      applications.some((application) => application.id === session.applicationId),
    );

    return {
      provider,
      connection,
      jobs,
      applications,
      jobMappings,
      stageMappings,
      sessions,
    };
  });
  const activeConnections = providerSummaries.filter(
    ({ connection }) => connection?.status === "active",
  ).length;
  const mappedJobCount = workspace.jobMappings.length;
  const mappedStageCount = workspace.stageMappings.length;
  const pendingSessions = workspace.sessions.filter(
    (session) => session.status !== "submitted",
  ).length;

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="ATS integration"
        title="Connect Ashby and Greenhouse"
        description="The MVP stores encrypted-looking credentials server-side, syncs local ATS copies, and creates Froggy sessions when mapped applications hit a stage."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Active providers"
          value={activeConnections}
          detail="Connected ATS integrations with sync access"
        />
        <MetricCard
          label="Imported jobs"
          value={workspace.jobs.length}
          detail="Cached locally instead of fetched on every page load"
        />
        <MetricCard
          label="Job and stage mappings"
          value={`${mappedJobCount} / ${mappedStageCount}`}
          detail="Role-flow mappings first, stage mappings second"
        />
        <MetricCard
          label="Open sessions"
          value={pendingSessions}
          detail="Scheduled or in-progress sessions waiting on submission"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {workspace.providers.map((provider) => (
          <IntegrationConnectionCard
            key={provider}
            provider={provider}
            connection={workspace.connections.find((connection) => connection.provider === provider)}
          />
        ))}
      </div>

      <SectionCard
        title="Provider status and capabilities"
        description="Each integration advertises what Froggy can read from the ATS and how feedback can be written back after packet assembly."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {providerSummaries.map((summary) => (
            <div
              key={summary.provider}
              className="rounded-3xl border p-5"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold capitalize">{summary.provider}</p>
                    <Pill tone={summary.connection?.status === "active" ? "success" : "warning"}>
                      {summary.connection?.status ?? "not connected"}
                    </Pill>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                    {summary.connection
                      ? `Preferred write-back: ${getPreferredWritebackLabel(summary.connection.capabilities)}`
                      : "Connect the provider to unlock read and write-back capabilities."}
                  </p>
                </div>
                <Link
                  href={`/integrations/${summary.provider}/mapping`}
                  className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                >
                  Open mappings
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {summary.connection ? (
                  getCapabilityBadges(summary.connection.capabilities).map((capability) => (
                    <Pill key={capability.label} tone={capability.enabled ? "success" : "warning"}>
                      {capability.label}
                    </Pill>
                  ))
                ) : (
                  <Pill tone="warning">No ATS capabilities available yet</Pill>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <MiniMetric label="Jobs" value={summary.jobs.length} />
                <MiniMetric label="Applications" value={summary.applications.length} />
                <MiniMetric label="Sessions" value={summary.sessions.length} />
                <MiniMetric label="Stage mappings" value={summary.stageMappings.length} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Imported ATS jobs"
        description="Use provider-specific mapping pages to connect these jobs and stages to Froggy role flows."
      >
        <div className="grid gap-4">
          {workspace.jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{job.name}</p>
                  <Pill tone={job.status === "open" ? "success" : "warning"}>{job.status}</Pill>
                  <Pill
                    tone={workspace.jobMappings.some(
                      (mapping) =>
                        mapping.provider === job.provider &&
                        mapping.externalJobId === job.externalJobId,
                    )
                      ? "success"
                      : "warning"}
                  >
                    {workspace.jobMappings.some(
                      (mapping) =>
                        mapping.provider === job.provider &&
                        mapping.externalJobId === job.externalJobId,
                    )
                      ? "mapped"
                      : "unmapped"}
                  </Pill>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  {job.provider} · external id {job.externalJobId}
                </p>
              </div>
              <Link
                href={`/integrations/${job.provider}/mapping`}
                className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
              >
                Open mappings
              </Link>
            </div>
          ))}
        </div>
      </SectionCard>
    </WorkspacePage>
  );
}

function getCapabilityBadges(capabilities: {
  canReadJobs: boolean;
  canReadApplications: boolean;
  canReadInterviews: boolean;
  canSubmitStructuredFeedback: boolean;
  canCreateCandidateNote: boolean;
  canAttachPdf: boolean;
}) {
  return [
    { label: "Read jobs", enabled: capabilities.canReadJobs },
    { label: "Read applications", enabled: capabilities.canReadApplications },
    { label: "Read interviews", enabled: capabilities.canReadInterviews },
    {
      label: "Structured write-back",
      enabled: capabilities.canSubmitStructuredFeedback,
    },
    { label: "Candidate note", enabled: capabilities.canCreateCandidateNote },
    { label: "Attach PDF", enabled: capabilities.canAttachPdf },
  ];
}

function getPreferredWritebackLabel(capabilities: {
  canSubmitStructuredFeedback: boolean;
  canCreateCandidateNote: boolean;
  canAttachPdf: boolean;
}) {
  if (capabilities.canSubmitStructuredFeedback) {
    return "structured scorecard";
  }
  if (capabilities.canCreateCandidateNote) {
    return "candidate note";
  }
  if (capabilities.canAttachPdf) {
    return "PDF attachment";
  }
  return "copy-paste fallback";
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.2)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
