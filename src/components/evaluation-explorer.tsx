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
    <div className="grid overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[#fbfbf8] lg:grid-cols-[0.42fr_0.58fr]">
      <div className="bg-[#10130f] p-8 text-white sm:p-12 lg:p-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Question → evaluation axes</p>
        <h2 className="mt-5 max-w-sm text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          See exactly what each question tests
        </h2>
        <p className="mt-5 max-w-sm leading-7 text-neutral-400">
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
                    ? "border-[#5fe08a]/70 bg-white text-[#10130f] shadow-[0_18px_50px_rgba(95,224,138,0.18)]"
                    : "border-white/10 bg-white/[0.04] text-neutral-300 hover:border-white/25 hover:bg-white/[0.08]"
                }`}
              >
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] opacity-60">Question {index + 1}</span>
                <span className="block text-sm font-medium leading-6">{question.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#fbfbf8] p-6 sm:p-10 lg:p-14">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#17663a]">Active question</p>
            <h3 className="mt-2 max-w-xl text-xl font-semibold tracking-tight text-black">“{activeQuestion.text}”</h3>
          </div>
          <span className="w-fit rounded-full bg-[#e9fff0] px-3 py-1 text-xs font-semibold text-[#17663a] ring-1 ring-[#bdecc9]">
            Animated axes
          </span>
        </div>

        <div id="axis-chart" className="min-w-0 rounded-3xl border border-black/[0.06] bg-white p-4 shadow-[0_24px_80px_rgba(16,19,15,0.06)] sm:p-6">
          <div className="overflow-x-auto" data-testid="axis-chart">
            <BarChart width={680} height={320} data={activeQuestion.values} margin={{ top: 18, right: 10, left: -18, bottom: 44 }}>
              <CartesianGrid stroke="#ecece7" vertical={false} />
              <XAxis
                dataKey="axis"
                interval={0}
                angle={-18}
                textAnchor="end"
                height={72}
                tick={{ fill: "#5f655d", fontSize: 12 }}
                axisLine={{ stroke: "#e5e5df" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#8b9088", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ fill: "rgba(95, 224, 138, 0.12)" }}
                formatter={(value) => [`${value}%`, "Tests"]}
                contentStyle={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={650} animationEasing="ease-out">
                {activeQuestion.values.map((entry, index) => (
                  <Cell key={entry.axis} fill={index === 0 ? "#12a150" : index === 1 ? "#40c96d" : index === 2 ? "#85e59f" : "#baf7c9"} />
                ))}
              </Bar>
            </BarChart>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#e0f5e6]" data-testid="axes-table">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Evaluation axes and amount tested by the selected question</caption>
              <thead className="bg-[#f6fff8] text-xs uppercase tracking-[0.16em] text-[#17663a]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Evaluation axis</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount tested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0f5e6] bg-white">
                {activeQuestion.values.map((value) => (
                  <tr key={value.axis}>
                    <th scope="row" className="px-4 py-3 font-medium text-neutral-700">{value.axis}</th>
                    <td className="px-4 py-3 text-right font-semibold text-[#17663a]">{value.amount}%</td>
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
