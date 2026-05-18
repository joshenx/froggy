"use client";

import { useState } from "react";
import { MetricCard, Pill } from "@/components/ui";
import type {
  CandidatePacket,
  WritebackMode,
  WritebackStatus,
} from "@/lib/mvp/types";

export default function PacketActionPanel({ packet }: { packet: CandidatePacket }) {
  const [copied, setCopied] = useState(false);
  const modes = Array.from(
    new Set(
      packet.sessions
        .map((entry) => entry.writebackJob?.mode)
        .filter((mode): mode is WritebackMode => mode !== undefined),
    ),
  );
  const statuses = Array.from(
    new Set(
      packet.sessions
        .map((entry) => entry.writebackJob?.status)
        .filter((status): status is WritebackStatus => status !== undefined),
    ),
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Sessions"
          value={packet.sessions.length}
          detail="Interview sessions aggregated into this packet"
        />
        <MetricCard
          label="Covered axes"
          value={packet.axisSummary.filter((axis) => axis.covered).length}
          detail="Axes with at least one submitted score"
        />
        <MetricCard
          label="Missing signals"
          value={packet.missingSignals.length}
          detail="Signals still not captured by submitted feedback"
        />
      </div>

      <div className="rounded-3xl border p-5" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-lg font-semibold">ATS handoff</p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Share the compact summary below or push the packet through the configured write-back mode later.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(packet.atsSummary);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
            style={{ background: "var(--moss)", color: "var(--paper)" }}
          >
            {copied ? "Copied summary" : "Copy ATS summary"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {modes.length
            ? modes.map((mode) => <Pill key={mode}>{mode.replaceAll("_", " ")}</Pill>)
            : <Pill tone="warning">No write-back mode yet</Pill>}
          {statuses.map((status) => (
            <Pill key={status} tone={status === "success" ? "success" : "warning"}>
              {status}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
