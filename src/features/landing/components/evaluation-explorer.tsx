"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";

type CoverageAxis = {
  axis: string;
  amount: number;
  note: string;
  color: string;
};

type LoopQuestion = {
  id: string;
  label: string;
  text: string;
  highlight: string;
  summary: string;
  values: CoverageAxis[];
};

const questions: LoopQuestion[] = [
  {
    id: "debugging",
    label: "Infra debugging",
    text: "Debug a service where p99 latency tripled overnight with no deploys.",
    highlight: "Heavy on debugging and incident judgment",
    summary:
      "This question creates deep signal on debugging and incident judgment, but leaves collaboration and communication light if the rest of the loop leans similarly.",
    values: [
      {
        axis: "Debugging",
        amount: 94,
        note: "Best used when you need direct evidence of root-cause reasoning under pressure.",
        color: "#2D5F3F",
      },
      {
        axis: "Incident judgment",
        amount: 82,
        note: "Covers prioritization and escalation decisions during ambiguous outages.",
        color: "#5A8B4B",
      },
      {
        axis: "Communication",
        amount: 44,
        note: "Surfaces explanation quality, but it is not enough for a full communication read.",
        color: "#7FB069",
      },
      {
        axis: "Collaboration",
        amount: 36,
        note: "Light touch on stakeholder work, so pair it with a cross-functional prompt.",
        color: "#CFE1C3",
      },
    ],
  },
  {
    id: "metrics",
    label: "Platform metrics",
    text: "What would you measure in the first 30 days of a new internal developer platform?",
    highlight: "Adds product judgment without duplicating systems time",
    summary:
      "This question broadens the loop into product judgment and analytics without repeating a pure systems design exercise, which helps rebalance overly technical loops.",
    values: [
      {
        axis: "Product judgment",
        amount: 88,
        note: "Strong signal on whether the interviewer can connect developer value to adoption metrics.",
        color: "#2D5F3F",
      },
      {
        axis: "Analytics",
        amount: 80,
        note: "Useful for understanding how a candidate chooses baselines and leading indicators.",
        color: "#5A8B4B",
      },
      {
        axis: "Prioritization",
        amount: 66,
        note: "Shows sequencing instincts, though it should be paired with an execution-heavy stage.",
        color: "#7FB069",
      },
      {
        axis: "Communication",
        amount: 52,
        note: "Good for clarity of thought, but not enough to replace a collaboration prompt.",
        color: "#CFE1C3",
      },
    ],
  },
  {
    id: "bar",
    label: "Bar-raiser judgment",
    text: "What signal would make you reject a technically excellent engineer?",
    highlight: "Protects values clarity and the hiring bar",
    summary:
      "This question helps the panel protect the bar and surface values alignment, but it should complement, not replace, hands-on technical evidence in the loop.",
    values: [
      {
        axis: "Values alignment",
        amount: 84,
        note: "Strongest when you need a principled read on team standards beyond raw technical output.",
        color: "#2D5F3F",
      },
      {
        axis: "Hiring judgment",
        amount: 78,
        note: "Covers whether the interviewer can defend a no with consistent, rubric-based reasoning.",
        color: "#5A8B4B",
      },
      {
        axis: "Tradeoffs",
        amount: 71,
        note: "Useful for seeing how the candidate weighs technical excellence against team health.",
        color: "#7FB069",
      },
      {
        axis: "Leadership",
        amount: 56,
        note: "Offers some signal on leadership range, but not enough for an org-building read alone.",
        color: "#CFE1C3",
      },
    ],
  },
];

export default function EvaluationExplorer() {
  const [activeId, setActiveId] = useState(questions[0].id);
  const activeQuestion = questions.find((question) => question.id === activeId) ?? questions[0];
  const strongestAxis = activeQuestion.values.reduce((currentBest, axis) =>
    axis.amount > currentBest.amount ? axis : currentBest,
  );
  const weakestAxis = activeQuestion.values.reduce((currentLowest, axis) =>
    axis.amount < currentLowest.amount ? axis : currentLowest,
  );
  const coverageAverage = Math.round(
    activeQuestion.values.reduce((total, axis) => total + axis.amount, 0) /
      activeQuestion.values.length,
  );

  return (
    <div
      className="overflow-hidden rounded-[2rem] border lg:grid lg:grid-cols-[0.42fr_0.58fr]"
      style={{ borderColor: "var(--line)", background: "var(--paper)" }}
    >
      <div
        className="p-8 text-white sm:p-12 lg:p-14"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--moss) 92%, black) 0%, var(--moss) 100%)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--leaf-soft)" }}>
          Coverage analysis
        </p>
        <h2
          className="mt-5 max-w-sm text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          See where each question adds coverage.
        </h2>
        <p className="mt-5 max-w-sm leading-7" style={{ color: "rgba(251,248,239,0.75)" }}>
          Click through a loop and watch estimated competency coverage shift. The goal is not more
          questions. It is fewer blind spots, less over-indexing, and a cleaner hiring signal.
        </p>
        <div className="mt-10 space-y-3" role="tablist" aria-label="Loop questions">
          {questions.map((question, index) => {
            const active = question.id === activeId;

            return (
              <button
                key={question.id}
                id={`tab-${question.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${question.id}`}
                onClick={() => setActiveId(question.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active ? "bg-white shadow-lg" : "hover:bg-white/10"
                }`}
                style={
                  active
                    ? {
                        borderColor: "var(--leaf)",
                        color: "var(--ink)",
                        boxShadow: "0 18px 50px rgba(127,176,105,0.18)",
                      }
                    : {
                        borderColor: "rgba(255,255,255,0.15)",
                        color: "rgba(251,248,239,0.8)",
                        background: "rgba(255,255,255,0.04)",
                      }
                }
              >
                <span
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] opacity-60"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Question {index + 1}
                </span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-sm font-semibold leading-6">{question.label}</span>
                    <span className="mt-2 block text-sm leading-6">{question.text}</span>
                  </div>
                  <span
                    className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={
                      active
                        ? {
                            background: "color-mix(in oklab, var(--leaf) 18%, white)",
                            color: "var(--moss)",
                          }
                        : {
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(251,248,239,0.85)",
                          }
                    }
                  >
                    {question.values.length} competencies
                  </span>
                </div>
                <span
                  className="mt-4 block text-xs leading-5"
                  style={{ color: active ? "var(--ink-soft)" : "rgba(251,248,239,0.68)" }}
                >
                  {question.highlight}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`panel-${activeQuestion.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeQuestion.id}`}
        className="p-6 sm:p-10 lg:p-14"
        style={{ background: "var(--paper)" }}
      >
        <div
          className="rounded-[1.75rem] border p-5 sm:p-6"
          style={{
            borderColor: "var(--line-soft)",
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--paper) 86%, white) 0%, white 100%)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}
          >
            Active question
          </p>
          <h3 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
            &ldquo;{activeQuestion.text}&rdquo;
          </h3>
          <p className="mt-3 max-w-2xl leading-7" style={{ color: "var(--ink-soft)" }}>
            {activeQuestion.summary}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Most covered",
                value: strongestAxis.axis,
                meta: `${strongestAxis.amount}% estimated coverage`,
              },
              {
                label: "Average coverage",
                value: `${coverageAverage}%`,
                meta: "Across all tagged competencies",
              },
              {
                label: "Least covered",
                value: weakestAxis.axis,
                meta: `${weakestAxis.amount}% estimated coverage`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border px-4 py-4"
                style={{ borderColor: "var(--line-soft)", background: "var(--paper)" }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  {item.label}
                </p>
                <p className="mt-2 text-base font-semibold" style={{ color: "var(--ink)" }}>
                  {item.value}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  {item.meta}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-6 rounded-[1.75rem] border p-5 sm:p-6"
          style={{
            borderColor: "var(--line-soft)",
            background: "white",
            boxShadow: "0 24px 80px rgba(45,95,63,0.06)",
          }}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}
              >
                Estimated loop share
              </p>
              <h4 className="mt-2 text-lg font-semibold" style={{ color: "var(--ink)" }}>
                How this question distributes competency coverage
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeQuestion.values.map((value) => (
                <span
                  key={value.axis}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: "var(--line-soft)", color: "var(--ink-soft)" }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: value.color }} />
                  {value.axis}
                </span>
              ))}
            </div>
          </div>

          <div id="axis-chart" className="h-[320px] min-w-0" data-testid="axis-chart">
            <BarChart
              data={activeQuestion.values}
              layout="vertical"
              responsive
              style={{ width: "100%", height: "100%" }}
              margin={{ top: 6, right: 8, left: 8, bottom: 6 }}
              barCategoryGap={16}
            >
              <CartesianGrid stroke="#E5DFCC" vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#6B7A72", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="axis"
                width={132}
                tick={{ fill: "#3A4B42", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(127,176,105,0.10)" }}
                formatter={(value) => [`${value}%`, "Estimated coverage"]}
                contentStyle={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  boxShadow: "0 16px 40px rgba(45,95,63,0.08)",
                }}
              />
              <Bar
                dataKey="amount"
                radius={[0, 10, 10, 0]}
                animationDuration={650}
                animationEasing="ease-out"
              >
                {activeQuestion.values.map((entry) => (
                  <Cell key={entry.axis} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[0.58fr_0.42fr]">
          <div
            className="overflow-hidden rounded-[1.5rem] border"
            style={{ borderColor: "var(--line-soft)", background: "white" }}
            data-testid="axes-table"
          >
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Coverage estimates for the selected question</caption>
              <thead
                className="text-xs uppercase tracking-[0.16em]"
                style={{ background: "var(--cream-2)", color: "var(--moss)" }}
              >
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Competency
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Estimated coverage
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    What this adds
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white" style={{ borderColor: "var(--line-soft)" }}>
                {activeQuestion.values.map((value) => (
                  <tr key={value.axis} style={{ borderColor: "var(--line-soft)" }}>
                    <th
                      scope="row"
                      className="px-4 py-3 align-top font-medium"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: value.color }} />
                        {value.axis}
                      </span>
                    </th>
                    <td
                      className="px-4 py-3 align-top text-right font-semibold"
                      style={{ color: "var(--moss)" }}
                    >
                      {value.amount}%
                    </td>
                    <td className="px-4 py-3 leading-6" style={{ color: "var(--ink-soft)" }}>
                      {value.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="rounded-[1.5rem] border p-5 sm:p-6"
            style={{ borderColor: "var(--line-soft)", background: "var(--cream-2)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}
            >
              Gap detection
            </p>
            <h4
              className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {activeQuestion.highlight}
            </h4>
            <p className="mt-4 leading-7" style={{ color: "var(--ink-soft)" }}>
              Coverage analysis helps teams catch missing competencies before the loop ships. If one
              question over-indexes on a single tag, you can rebalance with another prompt instead
              of discovering the gap in debrief.
            </p>
            <div
              className="mt-5 rounded-2xl border px-4 py-4"
              style={{ borderColor: "rgba(45,95,63,0.12)", background: "rgba(251,248,239,0.8)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Coverage gap to watch
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                {weakestAxis.axis} sits at {weakestAxis.amount}% for this question, so the loop
                still needs another stage that carries that competency more deliberately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
