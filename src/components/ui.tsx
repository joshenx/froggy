import type { ReactNode } from "react";

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <div className="space-y-6 px-6 py-6 sm:px-8">{children}</div>;
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="border-b pb-5" style={{ borderColor: "var(--line-soft)" }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--moss)" }}>
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[32px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section
      className="rounded-[18px] border p-5 sm:p-6"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <div className="mb-5">
        <h2 className="text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div
      className="rounded-[14px] border p-4"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-3 text-[26px] font-semibold" style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

type PillProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
};

export function Pill({ children, tone = "neutral" }: PillProps) {
  const colors =
    tone === "success"
      ? { background: "rgba(127,176,105,0.18)", color: "var(--moss)" }
      : tone === "warning"
        ? { background: "rgba(232,152,94,0.16)", color: "#9a4d1d" }
        : { background: "rgba(197,216,192,0.28)", color: "var(--ink-soft)" };

  return (
    <span
      className="inline-flex rounded-[8px] px-3 py-[5px] text-[11.5px] font-semibold"
      style={colors}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-[18px] border border-dashed px-5 py-8 text-center"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.28)" }}
    >
      <p className="text-base font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </p>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        {body}
      </p>
    </div>
  );
}
