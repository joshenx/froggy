import EvaluationExplorer from "@/components/evaluation-explorer";
import WaitlistForm from "@/components/waitlist-form";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Question banks", href: "#question-banks" },
  { label: "Evaluation axes", href: "#evaluation-axes" },
  { label: "Pricing", href: "#pricing" },
];

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
              <a key={item.href} href={item.href} className="transition hover:text-black">
                {item.label}
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

      <section id="evaluation-axes" className="scroll-mt-24 border-y border-black/[0.06] bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <EvaluationExplorer />
        </div>
      </section>

      <section id="product" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#17663a]">Product</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              The interview system between a spreadsheet and an ATS
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article id={feature.title === "Collaborative banks" ? "question-banks" : undefined} key={feature.title} className="scroll-mt-24 rounded-3xl border border-black/[0.06] bg-white p-7 shadow-[0_24px_80px_rgba(16,19,15,0.06)]">
                <div className="mb-8 h-28 rounded-2xl border border-black/[0.05] bg-[linear-gradient(135deg,#f6fff8,#e9fff0)] p-3">
                  <div className="grid h-full place-items-center rounded-xl bg-white/70 text-3xl">✦</div>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-3 leading-7 text-neutral-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 border-t border-black/[0.06] bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-black/[0.06] bg-[#10130f] p-8 text-white sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:p-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5fe08a]">Pricing</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Early teams get founder pricing.</h2>
          </div>
          <div className="max-w-2xl text-neutral-300">
            <p className="text-lg leading-8">
              Froggy is opening with a small design-partner cohort. Join the waitlist and we’ll invite early teams to shape the product before public pricing launches.
            </p>
            <a href="#waitlist" className="mt-7 inline-flex rounded-lg bg-[#5fe08a] px-5 py-3 text-sm font-semibold text-[#10130f] transition hover:bg-[#8af0a8]">
              Join early access
            </a>
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
    <div className="pointer-events-none absolute inset-y-0 hidden w-64 opacity-70 sm:block" aria-hidden="true">
      {positions.map((position, index) => (
        <div
          key={`${side}-${position}`}
          className={`absolute ${position} h-14 w-14 rounded-sm border border-[#9be6b3]/60 shadow-sm ${
            index % 2 === 0
              ? "bg-[linear-gradient(135deg,#eaffef,#5fe08a)]"
              : "bg-[linear-gradient(135deg,#f6fff8,#baf7c9)]"
          }`}
        >
          <div className="h-full w-full bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.55)_50%,transparent_52%)]" />
        </div>
      ))}
    </div>
  );
}

