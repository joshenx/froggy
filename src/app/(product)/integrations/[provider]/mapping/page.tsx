import { notFound } from "next/navigation";
import { MetricCard, PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import { JobMappingForm, StageMappingForm } from "@/features/integrations/components/mapping-forms";
import { getMappingWorkspace } from "@/lib/mvp/store";

export default async function ProviderMappingPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  if (provider !== "ashby" && provider !== "greenhouse") {
    notFound();
  }

  const workspace = await getMappingWorkspace(provider);
  const providerStageMappings = workspace.stageMappings.filter((mapping) =>
    workspace.jobMappings.some((jobMapping) => jobMapping.id === mapping.atsJobMappingId),
  );

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow={`${provider} mappings`}
        title="Map ATS jobs and stages to Froggy flows"
        description="Jobs map to role-level flows first, then ATS stages map to Froggy stages so sessions can be created automatically without duplicate interviews."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Imported jobs"
          value={workspace.jobs.length}
          detail="Jobs synced from the selected provider"
        />
        <MetricCard
          label="Imported stages"
          value={workspace.stages.length}
          detail="Available ATS stages that can trigger Froggy sessions"
        />
        <MetricCard
          label="Job mappings"
          value={workspace.jobMappings.length}
          detail="Role and flow mappings already saved"
        />
        <MetricCard
          label="Stage mappings"
          value={providerStageMappings.length}
          detail="Stage-level mappings the sync worker can resolve"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Job to flow mapping"
          description="Choose which Froggy role and flow should handle an ATS job."
        >
          <JobMappingForm
            provider={workspace.provider}
            jobs={workspace.jobs}
            roles={workspace.roles}
            flows={workspace.flows}
          />
          <div className="mt-5 grid gap-3">
            {workspace.jobMappings.map((mapping) => {
              const role = workspace.roles.find((item) => item.id === mapping.froggyRoleId);
              const flow = workspace.flows.find((item) => item.id === mapping.froggyFlowId);
              const job = workspace.jobs.find(
                (item) => item.externalJobId === mapping.externalJobId,
              );
              return (
                <div
                  key={mapping.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="success">{job?.name ?? mapping.externalJobId}</Pill>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      → {role?.name} / {flow?.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Stage to stage mapping"
          description="These mappings are what the sync worker uses to create or deduplicate interview sessions."
        >
          <StageMappingForm
            provider={workspace.provider}
            jobMappings={workspace.jobMappings}
            atsStages={workspace.stages}
            froggyStages={workspace.froggyStages}
          />
          <div className="mt-5 grid gap-3">
            {providerStageMappings.map((mapping) => {
                const atsStage = workspace.stages.find((item) => item.externalStageId === mapping.externalStageId);
                const froggyStage = workspace.froggyStages.find((item) => item.id === mapping.froggyStageId);
                const jobMapping = workspace.jobMappings.find(
                  (item) => item.id === mapping.atsJobMappingId,
                );
                const job = workspace.jobs.find(
                  (item) => item.externalJobId === jobMapping?.externalJobId,
                );
                return (
                  <div
                    key={mapping.id}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "var(--line)", background: "var(--paper)" }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill>{atsStage?.name ?? mapping.externalStageId}</Pill>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>
                        → {froggyStage?.name ?? mapping.froggyStageId}
                      </span>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                      {job?.name ?? jobMapping?.externalJobId ?? "Unknown job"}
                    </p>
                  </div>
                );
              })}
          </div>
        </SectionCard>
      </div>
    </WorkspacePage>
  );
}
