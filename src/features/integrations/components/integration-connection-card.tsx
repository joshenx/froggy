"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { connectProvider, syncProvider } from "@/lib/mvp/client";
import { Pill } from "@/components/ui";
import type { AtsConnection, AtsProvider } from "@/lib/mvp/types";

type IntegrationConnectionCardProps = {
  provider: AtsProvider;
  connection?: AtsConnection;
};

type ConnectValues = {
  apiKey: string;
};

export default function IntegrationConnectionCard({
  provider,
  connection,
}: IntegrationConnectionCardProps) {
  const router = useRouter();
  const connectMutation = useMutation({
    mutationFn: (values: ConnectValues) => connectProvider(provider, values),
  });
  const syncMutation = useMutation({
    mutationFn: () => syncProvider(provider),
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConnectValues>({
    defaultValues: {
      apiKey: "",
    },
  });

  const message =
    errors.apiKey?.message ||
    (connectMutation.isError ? connectMutation.error.message : "") ||
    (syncMutation.isError ? syncMutation.error.message : "") ||
    "";

  return (
    <div
      data-testid={`integration-card-${provider}`}
      className="rounded-3xl border p-5"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold capitalize">{provider}</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Connect, sync jobs, and create interview sessions when mapped ATS stages are reached.
          </p>
        </div>
        <Pill tone={connection?.status === "active" ? "success" : "warning"}>
          {connection?.status ?? "not connected"}
        </Pill>
      </div>
      <dl className="mt-4 grid gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        <div className="flex items-center justify-between gap-3">
          <dt>Credential</dt>
          <dd>{connection?.encryptedCredential || "No credential saved yet"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Last sync</dt>
          <dd>{connection?.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString() : "Never"}</dd>
        </div>
      </dl>
      {connection ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            Capabilities
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {getCapabilities(connection.capabilities).map((capability) => (
              <Pill
                key={capability.label}
                tone={capability.enabled ? "success" : "warning"}
              >
                {capability.label}
              </Pill>
            ))}
          </div>
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit((values) =>
          connectMutation.mutate(values, {
            onSuccess: () => {
              reset();
              router.refresh();
            },
          }),
        )}
        className="mt-5 grid gap-3"
      >
        <label className="text-sm font-semibold" htmlFor={`${provider}-api-key`}>
          API key
        </label>
        <input
          id={`${provider}-api-key`}
          type="password"
          className="h-12 w-full rounded-2xl border px-4 outline-none"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          {...register("apiKey", { required: "API key is required." })}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={connectMutation.isPending}
            className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
            style={{ background: "var(--moss)", color: "var(--paper)" }}
          >
            {connectMutation.isPending ? "Saving..." : `Connect ${provider}`}
          </button>
          <button
            type="button"
            disabled={syncMutation.isPending || connection?.status !== "active"}
            className="inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            onClick={() =>
              syncMutation.mutate(undefined, {
                onSuccess: () => {
                  router.refresh();
                },
              })
            }
          >
            {syncMutation.isPending ? "Syncing..." : "Sync now"}
          </button>
        </div>
        {message ? (
          <p className="text-sm font-medium text-red-700">{message}</p>
        ) : connectMutation.isSuccess ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            Provider connected. Tokens stay server-side in this MVP shell.
          </p>
        ) : syncMutation.isSuccess ? (
          <p className="text-sm font-medium" style={{ color: "var(--moss)" }}>
            Sync finished and interview sessions were deduplicated.{" "}
            {syncMutation.data?.createdSessions ?? 0} new session(s) created.
          </p>
        ) : null}
      </form>
    </div>
  );
}

function getCapabilities(capabilities: NonNullable<AtsConnection["capabilities"]>) {
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
