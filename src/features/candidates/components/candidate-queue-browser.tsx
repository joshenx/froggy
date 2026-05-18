"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { EmptyState, Pill } from "@/components/ui";

type CandidateQueueItem = {
  application: {
    id: string;
    provider: string;
    status: string;
    candidateName: string;
    externalStageId: string;
    externalApplicationId: string;
  };
  role?: {
    name: string;
  };
  sessions: Array<{ id: string; status: string }>;
  latestScorecard?: {
    recommendation: string;
  };
  submittedSessionCount: number;
  packet?: {
    missingSignals: string[];
    overallRecommendation: string;
  } | null;
  packetHref: string;
  candidateHref: string;
};

export default function CandidateQueueBrowser({
  items,
}: {
  items: CandidateQueueItem[];
}) {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("all");
  const [feedbackState, setFeedbackState] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !deferredQuery.trim() ||
      `${item.application.candidateName} ${item.role?.name ?? ""} ${item.application.externalStageId}`.toLowerCase().includes(deferredQuery.trim().toLowerCase());
    const matchesProvider = provider === "all" || item.application.provider === provider;
    const statusValue =
      item.submittedSessionCount === 0 ? "needs_feedback" : item.packet?.missingSignals.length ? "missing_signals" : "ready";
    const matchesFeedback = feedbackState === "all" || statusValue === feedbackState;

    return matchesQuery && matchesProvider && matchesFeedback;
  });

  const providers = Array.from(new Set(items.map((item) => item.application.provider))).sort();

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 rounded-3xl border p-5 md:grid-cols-3" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold" htmlFor="candidate-search">
            Search candidates or roles
          </label>
          <input
            id="candidate-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by candidate, role, or ATS stage"
            className="h-12 w-full rounded-2xl border px-4 outline-none"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          <SelectFilter
            id="candidate-provider-filter"
            label="Provider"
            value={provider}
            onChange={setProvider}
            options={[{ value: "all", label: "All providers" }, ...providers.map((item) => ({ value: item, label: item }))]}
          />
          <SelectFilter
            id="candidate-feedback-filter"
            label="Feedback state"
            value={feedbackState}
            onChange={setFeedbackState}
            options={[
              { value: "all", label: "All states" },
              { value: "needs_feedback", label: "Needs feedback" },
              { value: "missing_signals", label: "Missing signals" },
              { value: "ready", label: "Ready for review" },
            ]}
          />
        </div>
      </div>

      {filteredItems.length ? (
        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const feedbackStateValue =
              item.submittedSessionCount === 0
                ? { label: "Needs feedback", tone: "warning" as const }
                : item.packet?.missingSignals.length
                  ? { label: `${item.packet.missingSignals.length} missing signal${item.packet.missingSignals.length === 1 ? "" : "s"}`, tone: "warning" as const }
                  : { label: "Ready for review", tone: "success" as const };

            return (
              <div
                key={item.application.id}
                className="rounded-3xl border p-5"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{item.application.candidateName}</h2>
                      <Pill tone={item.application.status === "active" ? "success" : "warning"}>
                        {item.application.status}
                      </Pill>
                      <Pill tone={feedbackStateValue.tone}>{feedbackStateValue.label}</Pill>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                      {item.role?.name ?? "Unmapped role"} · ATS stage {item.application.externalStageId}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {item.application.provider} / {item.application.externalApplicationId}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={item.candidateHref}
                      className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                    >
                      Candidate detail
                    </Link>
                    <Link
                      href={item.packetHref}
                      className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
                      style={{ background: "var(--moss)", color: "var(--paper)" }}
                    >
                      Candidate packet
                    </Link>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-4">
                  <QueueMetric label="Sessions" value={String(item.sessions.length)} />
                  <QueueMetric label="Submitted" value={String(item.submittedSessionCount)} />
                  <QueueMetric
                    label="Latest recommendation"
                    value={item.latestScorecard ? item.latestScorecard.recommendation.replaceAll("_", " ") : "Pending"}
                  />
                  <QueueMetric
                    label="Packet recommendation"
                    value={item.packet?.overallRecommendation.replaceAll("_", " ") ?? "pending"}
                  />
                </div>
                {item.packet?.missingSignals.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.packet.missingSignals.map((signal) => (
                      <Pill key={signal} tone="warning">
                        Missing: {signal}
                      </Pill>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No candidates match the current filters"
          body="Try a broader search or switch the feedback state filter."
        />
      )}
    </div>
  );
}

function SelectFilter({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border px-4 outline-none"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function QueueMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.2)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold capitalize">{value}</p>
    </div>
  );
}
