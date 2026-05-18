import Link from "next/link";
import { MetricCard, PageHeader, Pill, SectionCard, WorkspacePage } from "@/components/ui";
import CreateRoleForm from "@/features/roles/components/create-role-form";
import { getProductOverview } from "@/lib/mvp/store";

export default async function RolesPage() {
  const overview = await getProductOverview();

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Barebones MVP"
        title="Role-specific interview flows"
        description="Create and evolve role loops with stages, reusable questions, evaluation axes, and scoring rules. This MVP uses a local JSON store so the product behaves like a real workspace."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Roles" value={overview.stats.roleCount} detail="Draft and active role definitions" />
        <MetricCard label="Active flows" value={overview.stats.activeFlowCount} detail="Versioned interview loops" />
        <MetricCard label="Open candidates" value={overview.stats.openApplicationCount} detail="Imported from seeded ATS data" />
        <MetricCard label="Pending write-backs" value={overview.stats.pendingWritebacks} detail="Queued after scorecard submission" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Current role workspaces"
          description="Each workspace owns a role, its active flow version, the attached question bank, and ATS mappings."
        >
          <div className="grid gap-4">
            {overview.roleSummaries.map(({ role, flow, stageCount, questionCount, mappedJobs, activeCandidates }) => (
              <div
                key={role.id}
                className="rounded-3xl border p-5"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{role.name}</h2>
                      <Pill tone={flow?.status === "active" ? "success" : "warning"}>
                        {flow?.status ?? "no flow"}
                      </Pill>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                      {flow?.name ?? "No flow yet"} · {role.level} level
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/roles/${role.id}/flow`}
                      className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                      style={{ background: "var(--moss)", color: "var(--paper)" }}
                    >
                      Open flow
                    </Link>
                    <Link
                      href={`/roles/${role.id}/questions`}
                      className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                    >
                      Open question bank
                    </Link>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 sm:grid-cols-4">
                  <MetricTile label="Stages" value={stageCount} />
                  <MetricTile label="Questions" value={questionCount} />
                  <MetricTile label="Mapped ATS jobs" value={mappedJobs} />
                  <MetricTile label="Active candidates" value={activeCandidates} />
                </dl>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Create a new role"
          description="This seeds a draft flow and takes you straight into the flow builder so you can add questions, rubrics, and mappings."
        >
          <CreateRoleForm />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent audit trail"
        description="The MVP records who changed flows, mappings, and scorecards so interview design stays auditable."
      >
        <div className="grid gap-3">
          {overview.recentAuditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <div>
                <p className="text-sm font-semibold">{log.detail}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {log.actor} · {log.action.replaceAll("_", " ")}
                </p>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </WorkspacePage>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.2)" }}
    >
      <dt className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </dt>
      <dd className="mt-2 text-xl font-semibold">{value}</dd>
    </div>
  );
}
