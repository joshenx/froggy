import WaitlistForm from "@/components/waitlist-form";

const navItems = ["Product", "Question banks", "Evaluation axes", "Pricing"];

const features = [
  {
    title: "Collaborative banks",
    description:
      "Centralize role-specific questions, rubrics, and follow-ups so every interviewer starts from the same bar.",
  },
  {
    title: "Evaluation tagging",
    description:
      "Tag each prompt by what it measures: product sense, debugging, judgment, communication, leadership, and more.",
  },
  {
    title: "Candidate-fit design",
    description:
      "Work backwards from your ideal candidate profile and assemble loops that reveal the traits your team needs.",
  },
];

const tiles = [
  "Product sense",
  "Debugging",
  "Ownership",
  "Collaboration",
  "Judgment",
  "Domain depth",
  "Communication",
  "Execution",
];

const bars = [
  { label: "Question coverage", froggy: 86, docs: 42, adHoc: 33 },
  { label: "Interviewer alignment", froggy: 78, docs: 45, adHoc: 29 },
  { label: "Signal quality", froggy: 84, docs: 52, adHoc: 38 },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbf8] text-[#10130f]">
      <div className="border-b border-black/[0.06] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-[#155e36]/20 bg-[#e9fff0] text-base">🐸</span>
            <span>froggy</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
            {navItems.map((item) => (
              <a key={item} href="#waitlist" className="transition hover:text-black">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#waitlist" className="hidden rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200 sm:block">
              Contact
            </a>
            <a href="#waitlist" className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
              Join waitlist
            </a>
          </div>
        </div>
      </div>

      <section id="top" className="relative min-h-[720px] px-5 pb-20 pt-20 sm:px-8 lg:px-10">
        <FloatingTiles side="left" />
        <FloatingTiles side="right" />

        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 rounded-full border border-[#d8efe0] bg-[#f2fff5] px-4 py-1.5 text-sm font-medium text-[#17663a]">
            Interview questions that map to the candidate you actually want
          </div>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.055em] text-black sm:text-7xl lg:text-[86px] lg:leading-[0.95]">
            Build interviews that find your ideal candidate
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-neutral-600">
            Froggy gives teams a shared place to create question banks, tag evaluation axes, and design interview loops with clearer hiring signal.
          </p>
          <div id="waitlist" className="mt-8 w-full max-w-2xl">
            <WaitlistForm />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-neutral-500">
            {tiles.slice(0, 5).map((tile) => (
              <span key={tile} className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 shadow-sm">
                {tile}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[#fbfbf8] lg:grid-cols-[0.42fr_0.58fr]">
            <div className="bg-[#10130f] p-8 text-white sm:p-12 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Interview quality</p>
              <h2 className="mt-5 max-w-sm text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Higher signal across every hiring loop
              </h2>
              <p className="mt-5 max-w-sm leading-7 text-neutral-400">
                Replace scattered docs and improvised interviews with question design your whole team can inspect, reuse, and improve.
              </p>
              <div className="mt-12 space-y-7 text-sm">
                <MetricItem active label="Coverage" text="Know which competencies your loop actually evaluates." />
                <MetricItem label="Consistency" text="Give interviewers shared prompts and rubrics." />
                <MetricItem label="Iteration" text="Keep improving your bank as you learn what predicts success." />
              </div>
            </div>
            <div className="bg-[#fbfbf8] p-6 sm:p-10 lg:p-14">
              <div className="mb-8 flex items-center justify-end gap-5 text-xs font-semibold text-neutral-500">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#084ee8]" /> Froggy</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#d9d6cf]" /> Shared docs</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#efeae3]" /> Ad hoc</span>
              </div>
              <div className="space-y-10">
                {bars.map((bar) => (
                  <BenchmarkRow key={bar.label} {...bar} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17663a]">Product</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              The interview system between a spreadsheet and an ATS
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-black/[0.06] bg-white p-7 shadow-[0_24px_80px_rgba(16,19,15,0.06)]">
                <div className="mb-8 h-28 rounded-2xl border border-black/[0.05] bg-[linear-gradient(135deg,#f6fff8,#eef2ff)] p-3">
                  <div className="grid h-full place-items-center rounded-xl bg-white/70 text-3xl">✦</div>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-3 leading-7 text-neutral-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FloatingTiles({ side }: { side: "left" | "right" }) {
  const positions =
    side === "left"
      ? ["top-24 -left-4", "top-40 left-12", "top-60 -left-2", "bottom-40 left-16", "bottom-24 -left-5"]
      : ["top-28 -right-4", "top-48 right-14", "top-72 -right-2", "bottom-44 right-20", "bottom-28 -right-6"];

  return (
    <div className="pointer-events-none absolute inset-y-0 hidden w-64 opacity-80 sm:block" aria-hidden="true">
      {positions.map((position, index) => (
        <div
          key={`${side}-${position}`}
          className={`absolute ${position} h-14 w-14 rounded-sm border border-[#9fc9ff]/40 shadow-sm ${
            index % 2 === 0
              ? "bg-[linear-gradient(135deg,#dff5ff,#73a7ff)]"
              : "bg-[linear-gradient(135deg,#efffea,#b8f3cb)]"
          }`}
        >
          <div className="h-full w-full bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.55)_50%,transparent_52%)]" />
        </div>
      ))}
    </div>
  );
}

function MetricItem({ label, text, active = false }: { label: string; text: string; active?: boolean }) {
  return (
    <div className={`${active ? "border-l-2 border-white pl-5" : "pl-5 text-neutral-500"}`}>
      <p className="font-semibold text-white">{label}</p>
      <p className="mt-2 max-w-xs leading-6">{text}</p>
    </div>
  );
}

function BenchmarkRow({ label, froggy, docs, adHoc }: { label: string; froggy: number; docs: number; adHoc: number }) {
  const items = [
    { name: "Froggy", value: froggy, className: "bg-[#084ee8] text-white" },
    { name: "Docs", value: docs, className: "bg-[#d9d6cf] text-neutral-900" },
    { name: "Ad hoc", value: adHoc, className: "bg-[#efeae3] text-neutral-900" },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="text-neutral-400">Signal score</span>
      </div>
      <div className="flex h-48 items-end gap-3 border-b border-l border-neutral-200 pl-5">
        {items.map((item) => (
          <div key={item.name} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-sm font-semibold">{item.value}%</span>
            <div className={`w-full max-w-16 ${item.className}`} style={{ height: `${item.value * 1.75}px` }} />
            <span className="text-xs text-neutral-500">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
