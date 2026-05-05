import WaitlistForm from "@/components/waitlist-form";

const features = [
  {
    title: "Question banks teams trust",
    description:
      "Build shared libraries of role-specific prompts, follow-ups, and rubrics instead of starting every interview from a blank doc.",
  },
  {
    title: "Tag every evaluation axis",
    description:
      "Map questions to skills like product sense, debugging, systems thinking, collaboration, ownership, and domain depth.",
  },
  {
    title: "Design for the ideal candidate",
    description:
      "Work backwards from the candidate profile you actually want, then assemble interviews that reveal those traits consistently.",
  },
];

const tags = [
  "Structured thinking",
  "Role depth",
  "Collaboration",
  "Execution",
  "Taste",
  "Debugging",
  "Leadership",
  "Domain fluency",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#eef8ef] text-slate-950">
      <section className="relative isolate px-6 py-8 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#b7f7c4_0,transparent_34%),radial-gradient(circle_at_top_right,#d9ffc7_0,transparent_28%),linear-gradient(135deg,#f7fff8,#e6f7ea_48%,#d7f2df)]" />
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-2xl shadow-lg shadow-emerald-700/20">
              🐸
            </div>
            <span className="text-xl font-black tracking-tight">Froggy</span>
          </div>
          <a
            href="#waitlist"
            className="rounded-full border border-emerald-900/10 bg-white/70 px-5 py-2 text-sm font-bold text-emerald-950 shadow-sm backdrop-blur transition hover:bg-white"
          >
            Join waitlist
          </a>
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-900 shadow-sm backdrop-blur">
              Interview design for teams that know who they want.
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
              Write interview questions that find your ideal candidate.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Froggy helps hiring teams collaborate on question banks, tag each question by evaluation axis, and turn a candidate profile into a sharper, fairer interview loop.
            </p>
            <div id="waitlist" className="mt-9 max-w-xl">
              <WaitlistForm />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Early access for founders, recruiters, hiring managers, and interview-heavy engineering teams.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lime-300/40 blur-3xl" />
            <div className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Question bank</p>
                    <h2 className="mt-1 text-2xl font-black">Senior Product Manager</h2>
                  </div>
                  <div className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">8 axes</div>
                </div>
                <div className="space-y-3">
                  <QuestionCard
                    question="Tell us about a time you changed your roadmap after learning something uncomfortable."
                    labels={["Customer empathy", "Judgment", "Ownership"]}
                  />
                  <QuestionCard
                    question="Design the first 30 days of metrics for a new collaborative hiring product."
                    labels={["Product sense", "Analytics", "Communication"]}
                  />
                  <QuestionCard
                    question="What signal would make you reject a technically excellent candidate?"
                    labels={["Bar clarity", "Team values", "Tradeoffs"]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-emerald-900/10 bg-white/75 p-7 shadow-sm">
                <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-650">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-emerald-950 p-8 text-white shadow-2xl shadow-emerald-950/20 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">Evaluation axes</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Make every question earn its place.</h2>
              <p className="mt-4 text-lg leading-8 text-emerald-50/80">
                Tag questions by what they evaluate, spot gaps in the loop, and align interviewers before candidates ever enter the room.
              </p>
            </div>
            <div className="flex flex-wrap content-start gap-3">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-emerald-50 ring-1 ring-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function QuestionCard({ question, labels }: { question: string; labels: string[] }) {
  return (
    <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
      <p className="font-semibold leading-6 text-white">“{question}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span key={label} className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-200">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
