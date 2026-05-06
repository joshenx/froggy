"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const questions = [
  {
    id: "roadmap",
    text: "Tell us about a time you changed your roadmap after learning something uncomfortable.",
    values: [
      { axis: "Customer empathy", amount: 92 },
      { axis: "Judgment", amount: 78 },
      { axis: "Ownership", amount: 70 },
      { axis: "Communication", amount: 48 },
    ],
  },
  {
    id: "metrics",
    text: "Design the first 30 days of metrics for a new collaborative hiring product.",
    values: [
      { axis: "Product sense", amount: 88 },
      { axis: "Analytics", amount: 82 },
      { axis: "Execution", amount: 62 },
      { axis: "Communication", amount: 55 },
    ],
  },
  {
    id: "reject",
    text: "What signal would make you reject a technically excellent candidate?",
    values: [
      { axis: "Bar clarity", amount: 84 },
      { axis: "Team values", amount: 76 },
      { axis: "Tradeoffs", amount: 72 },
      { axis: "Leadership", amount: 50 },
    ],
  },
];

export default function EvaluationExplorer() {
  const [activeId, setActiveId] = useState(questions[0].id);
  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeId) ?? questions[0],
    [activeId],
  );

  return (
    <div className="grid overflow-hidden rounded-[2rem] lg:grid-cols-[0.42fr_0.58fr]" style={{ border: "1px solid var(--line)", background: "var(--paper)" }}>
      <div className="p-8 text-white sm:p-12 lg:p-16" style={{ background: "var(--moss)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--leaf-soft)" }}>Question → evaluation axes</p>
        <h2 className="mt-5 max-w-sm text-4xl font-semibold tracking-[-0.04em] sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          See exactly what each question tests
        </h2>
        <p className="mt-5 max-w-sm leading-7" style={{ color: "rgba(251,248,239,0.75)" }}>
          Click a question to watch Froggy re-map the evaluation axes. Teams can spot over-tested skills, missing competencies, and weak prompts before interviews begin.
        </p>
        <div className="mt-10 space-y-3" role="tablist" aria-label="Interview questions">
          {questions.map((question, index) => {
            const active = question.id === activeId;
            return (
              <button
                key={question.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="axis-chart"
                onClick={() => setActiveId(question.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? "bg-white shadow-lg"
                    : "hover:bg-white/10"
                }`}
                style={active ? {
                  borderColor: "var(--leaf)",
                  color: "var(--ink)",
                  boxShadow: "0 18px 50px rgba(127,176,105,0.18)",
                } : {
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(251,248,239,0.8)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] opacity-60" style={{ fontFamily: "var(--font-mono)" }}>Question {index + 1}</span>
                <span className="block text-sm font-medium leading-6">{question.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-10 lg:p-14" style={{ background: "var(--paper)" }}>
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}>Active question</p>
            <h3 className="mt-2 max-w-xl text-xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>"{activeQuestion.text}"</h3>
          </div>
          <span className="w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "color-mix(in oklab, var(--leaf) 15%, transparent)", color: "var(--moss)", outline: "1px solid var(--leaf-soft)" }}>
            Animated axes
          </span>
        </div>

        <div id="axis-chart" className="min-w-0 rounded-3xl border p-4 sm:p-6" style={{ borderColor: "var(--line-soft)", background: "white", boxShadow: "0 24px 80px rgba(45,95,63,0.06)" }}>
          <div className="overflow-x-auto" data-testid="axis-chart">
            <BarChart width={680} height={320} data={activeQuestion.values} margin={{ top: 18, right: 10, left: -18, bottom: 44 }}>
              <CartesianGrid stroke="#E5DFCC" vertical={false} />
              <XAxis
                dataKey="axis"
                interval={0}
                angle={-18}
                textAnchor="end"
                height={72}
                tick={{ fill: "#6B7A72", fontSize: 12 }}
                axisLine={{ stroke: "#D9D2BF" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#6B7A72", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ fill: "rgba(127,176,105,0.12)" }}
                formatter={(value) => [`${value}%`, "Tests"]}
                contentStyle={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  boxShadow: "0 16px 40px rgba(45,95,63,0.08)",
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={650} animationEasing="ease-out">
                {activeQuestion.values.map((entry, index) => (
                  <Cell key={entry.axis} fill={index === 0 ? "#2D5F3F" : index === 1 ? "#7FB069" : index === 2 ? "#A8C99A" : "#DCE7D5"} />
                ))}
              </Bar>
            </BarChart>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--line-soft)" }} data-testid="axes-table">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Evaluation axes and amount tested by the selected question</caption>
              <thead className="text-xs uppercase tracking-[0.16em]" style={{ background: "var(--cream-2)", color: "var(--moss)" }}>
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Evaluation axis</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount tested</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white" style={{ borderColor: "var(--line-soft)" }}>
                {activeQuestion.values.map((value) => (
                  <tr key={value.axis} style={{ borderColor: "var(--line-soft)" }}>
                    <th scope="row" className="px-4 py-3 font-medium" style={{ color: "var(--ink-soft)" }}>{value.axis}</th>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--moss)" }}>{value.amount}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
