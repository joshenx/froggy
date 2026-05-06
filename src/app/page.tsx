import EvaluationExplorer from "@/components/evaluation-explorer";
import WaitlistForm from "@/components/waitlist-form";

export default function Home() {
  return (
    <main style={{ background: "var(--cream)", color: "var(--ink)" }}>
      <SvgDefs />
      <Nav />
      <Hero />
      <LogoStrip />
      <QuestionBank />
      <RubricSection />
      <EvalExplorerSection />
      <HowItWorks />
      <Testimonials />
      <FaqAndCta />
      <Footer />
    </main>
  );
}

/* ── SVG symbol defs ── */
function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="lily-pad" viewBox="0 0 100 100">
          <path d="M50,8 a42,42 0 1 1 -38,42 L50,50 Z" fill="#7FB069" />
          <path d="M50,8 a42,42 0 1 1 -38,42 L50,50 Z" fill="#2D5F3F" opacity=".18" />
          <path d="M50,12 a38,38 0 1 1 -34,38" fill="none" stroke="#2D5F3F" strokeOpacity=".22" strokeWidth="1.2" />
          <path d="M50,22 L50,50 L24,55" fill="none" stroke="#2D5F3F" strokeOpacity=".25" strokeWidth="1.2" />
        </symbol>
        <symbol id="froggy" viewBox="0 0 120 100">
          <ellipse cx="60" cy="62" rx="46" ry="30" fill="#7FB069" />
          <ellipse cx="60" cy="62" rx="46" ry="30" fill="#2D5F3F" opacity=".15" />
          <circle cx="40" cy="32" r="14" fill="#7FB069" />
          <circle cx="80" cy="32" r="14" fill="#7FB069" />
          <circle cx="40" cy="32" r="14" fill="#2D5F3F" opacity=".1" />
          <circle cx="80" cy="32" r="14" fill="#2D5F3F" opacity=".1" />
          <circle cx="40" cy="34" r="6" fill="#FBF8EF" />
          <circle cx="80" cy="34" r="6" fill="#FBF8EF" />
          <circle cx="41" cy="35" r="3" fill="#1A2B22" />
          <circle cx="81" cy="35" r="3" fill="#1A2B22" />
          <path d="M44 70 Q60 80 76 70" stroke="#1F4A2F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="72" r="3" fill="#E8985E" opacity=".7" />
          <circle cx="84" cy="72" r="3" fill="#E8985E" opacity=".7" />
        </symbol>
        <symbol id="reed" viewBox="0 0 20 80">
          <rect x="9" y="20" width="2" height="60" fill="#2D5F3F" />
          <ellipse cx="10" cy="14" rx="6" ry="14" fill="#2D5F3F" />
        </symbol>
        <symbol id="check" viewBox="0 0 16 16">
          <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="plus" viewBox="0 0 16 16">
          <path d="M8 3 V13 M3 8 H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="folder" viewBox="0 0 16 16">
          <path d="M2 4 a1 1 0 0 1 1-1 H6 L8 5 H13 a1 1 0 0 1 1 1 V12 a1 1 0 0 1 -1 1 H3 a1 1 0 0 1 -1 -1 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </symbol>
        <symbol id="grip" viewBox="0 0 16 16">
          <circle cx="6" cy="4" r="1.2" fill="currentColor" />
          <circle cx="10" cy="4" r="1.2" fill="currentColor" />
          <circle cx="6" cy="8" r="1.2" fill="currentColor" />
          <circle cx="10" cy="8" r="1.2" fill="currentColor" />
          <circle cx="6" cy="12" r="1.2" fill="currentColor" />
          <circle cx="10" cy="12" r="1.2" fill="currentColor" />
        </symbol>
      </defs>
    </svg>
  );
}

/* ── Navigation ── */
function Nav() {
  return (
    <nav
      className="sticky top-0 z-30"
      style={{
        backdropFilter: "saturate(140%) blur(8px)",
        WebkitBackdropFilter: "saturate(140%) blur(8px)",
        background: "color-mix(in oklab, var(--cream) 82%, transparent)",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1256px] items-center justify-between px-7">
        <a
          href="#top"
          className="flex items-center gap-2.5"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: "var(--ink)", textDecoration: "none" }}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-[10px]"
            style={{ background: "var(--moss)", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.18)" }}
          >
            <svg width="20" height="16" viewBox="0 0 20 16">
              <ellipse cx="10" cy="11" rx="9" ry="4" fill="#7FB069" />
              <circle cx="6" cy="5" r="3" fill="#7FB069" />
              <circle cx="14" cy="5" r="3" fill="#7FB069" />
              <circle cx="6" cy="5" r="1.2" fill="#1A2B22" />
              <circle cx="14" cy="5" r="1.2" fill="#1A2B22" />
            </svg>
          </span>
          Froggy
        </a>
        <div className="hidden items-center gap-8 md:flex" style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>
          {[
            { label: "Question bank", href: "#bank" },
            { label: "Evaluation", href: "#axes" },
            { label: "How it works", href: "#how" },
            { label: "Customers", href: "#customers" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="font-medium transition hover:text-[#2D5F3F]" style={{ textDecoration: "none" }}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="#waitlist"
            className="hidden rounded-[10px] border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 sm:block"
            style={{ borderColor: "var(--line)", color: "var(--ink)", textDecoration: "none" }}
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: "var(--moss)", color: "var(--paper)", boxShadow: "0 1px 0 rgba(0,0,0,.06), inset 0 -2px 0 rgba(0,0,0,.18)", textDecoration: "none" }}
          >
            Start free
            <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8 H12 M8 4 L12 8 L8 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section id="top" style={{ padding: "84px 0 96px", overflow: "hidden" }}>
      <div className="mx-auto grid max-w-[1256px] items-center gap-16 px-7 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium"
            style={{ background: "var(--cream-2)", borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--leaf)", boxShadow: "0 0 0 3px color-mix(in oklab, var(--leaf) 30%, transparent)" }}
            />
            New · Loop templates for Series&nbsp;A teams
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(44px, 5.5vw, 76px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.02,
              margin: "18px 0",
            }}
          >
            Build interviews that{" "}
            <span className="relative inline-block" style={{ color: "var(--moss)" }}>
              find your people
              <span
                className="absolute -z-10 rounded-[4px]"
                style={{ left: -2, right: -2, bottom: 6, height: 14, background: "var(--leaf-soft)", transform: "rotate(-.6deg)" }}
              />
            </span>
            .
          </h1>
          <p className="mb-7 max-w-[520px] text-[19px]" style={{ color: "var(--ink-soft)" }}>
            Froggy is the shared workspace for hiring teams to write better questions, agree on what &ldquo;good&rdquo; looks like, and design interview loops with a clearer signal — not a louder gut feel.
          </p>
          <div id="waitlist" className="max-w-xl">
            <WaitlistForm />
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-[13.5px]" style={{ color: "var(--muted)" }}>
            {["Free for teams of 5", "SOC 2 Type II", "Greenhouse + Ashby"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" style={{ color: "var(--moss)" }}><use href="#check" /></svg>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Pond illustration */}
        <div className="relative hidden h-[520px] lg:block" aria-hidden="true">
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl"
            style={{ border: "1px solid var(--line)", background: "var(--paper)", boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 24px 48px -28px rgba(45,95,63,.25)" }}
          >
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: "55%", background: "linear-gradient(180deg, transparent, var(--pond) 30%, var(--water))" }}
            />
            <svg className="absolute" style={{ left: "6%", top: "14%", width: 90, height: 90, transform: "rotate(-12deg)" }}>
              <use href="#lily-pad" />
            </svg>
            <svg className="absolute" style={{ right: "8%", top: "30%", width: 140, height: 140, transform: "rotate(18deg)" }}>
              <use href="#lily-pad" />
            </svg>
            <svg className="absolute" style={{ left: "38%", bottom: "8%", width: 110, height: 110, transform: "rotate(-4deg)", opacity: 0.85 }}>
              <use href="#lily-pad" />
            </svg>
            <svg className="absolute" style={{ right: 24, bottom: 24, width: 24, height: 96 }}>
              <use href="#reed" />
            </svg>
            <svg className="absolute" style={{ right: 60, bottom: 18, width: 18, height: 70, opacity: 0.7 }}>
              <use href="#reed" />
            </svg>
            <svg className="absolute" style={{ right: "14%", top: "34%", width: 64, height: 54, opacity: 0.85 }}>
              <use href="#froggy" />
            </svg>
            <HeroCard style={{ top: "8%", left: "10%", transform: "rotate(-3.5deg)" }}>
              <CardTag color="moss">
                <svg width="10" height="10" viewBox="0 0 16 16"><use href="#folder" /></svg>
                Senior PM Loop
              </CardTag>
              <div className="mt-2 text-sm font-semibold leading-snug" style={{ color: "var(--ink)" }}>Tell me about a roadmap you killed.</div>
              <div className="mt-1 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>PRODUCT · 18 min · L5+</div>
            </HeroCard>
            <HeroCard style={{ top: "34%", right: "6%", transform: "rotate(3deg)", width: 240 }}>
              <CardTag color="terra">Rubric · Staff Eng</CardTag>
              <div className="mt-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>System Design · Distributed</div>
              <div className="mt-2 flex flex-col gap-1.5">
                {[{ label: "Tradeoff reasoning", pct: 78 }, { label: "Failure modes", pct: 62 }, { label: "Communication", pct: 88 }].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-2 text-[11.5px]">
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: "var(--leaf-soft)", color: "var(--moss)" }}>A</div>
                    <span style={{ color: "var(--ink-soft)" }}>{label}</span>
                    <div className="ml-auto h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "var(--cream-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--moss)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </HeroCard>
            <HeroCard style={{ bottom: "14%", left: "18%", transform: "rotate(-1deg)", width: 260 }}>
              <CardTag color="leaf">Loop · 5 stages</CardTag>
              <div className="mt-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>Engineering Manager — Infra</div>
              <div className="mt-1 text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>SCREEN → CRAFT → SYS → PEOPLE → BAR</div>
              <div className="mt-2 flex gap-1">
                {["var(--moss)", "var(--moss)", "var(--terra)", "var(--leaf)", "var(--cream-2)"].map((bg, i) => (
                  <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: bg }} />
                ))}
              </div>
            </HeroCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-[14px] p-3.5 transition hover:-translate-y-1"
      style={{ width: 230, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "0 12px 24px -16px rgba(31,74,47,.35)", ...style }}
    >
      {children}
    </div>
  );
}

function CardTag({ children, color }: { children: React.ReactNode; color: "moss" | "terra" | "leaf" }) {
  const styles = {
    moss: { background: "color-mix(in oklab, #2D5F3F 12%, transparent)", color: "#2D5F3F" },
    terra: { background: "color-mix(in oklab, #E8985E 18%, transparent)", color: "#a4571f" },
    leaf: { background: "color-mix(in oklab, #7FB069 22%, transparent)", color: "#3d6c2c" },
  };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]" style={styles[color]}>
      {children}
    </span>
  );
}

/* ── Logo strip ── */
function LogoStrip() {
  const logos = [
    { name: "Heronbrook", swatch: { background: "var(--moss)", borderRadius: 5, width: 18, height: 18 } },
    { name: "Mossfield", swatch: { background: "var(--terra)", borderRadius: "50%", width: 18, height: 18 } },
    { name: "Sycamore", swatch: { width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: "16px solid var(--moss)", borderRadius: 0 } },
    { name: "Tidewater", swatch: { background: "var(--terra)", borderRadius: 5, width: 18, height: 18 } },
    { name: "Ledger.io", swatch: { background: "var(--moss)", borderRadius: "50%", width: 18, height: 18 } },
    { name: "Pinegrove", swatch: { background: "var(--moss)", borderRadius: 5, width: 18, height: 18 } },
  ];

  return (
    <section style={{ borderTop: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)", background: "var(--paper)", padding: "28px 0" }}>
      <div className="mx-auto flex max-w-[1256px] flex-wrap items-center justify-between gap-5 px-7">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.05em]" style={{ color: "var(--muted)" }}>
          Hiring teams using Froggy
        </p>
        <div className="flex flex-wrap items-center gap-10" style={{ opacity: 0.78 }}>
          {logos.map(({ name, swatch }) => (
            <div key={name} className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink-soft)" }}>
              <span style={{ display: "inline-block", flexShrink: 0, ...swatch }} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Question Bank ── */
function QuestionBank() {
  const collections = [
    { name: "All questions", count: 218, active: true },
    { name: "Engineering", count: 94 },
    { name: "Product", count: 42 },
    { name: "Design", count: 27 },
    { name: "Leadership", count: 31 },
    { name: "Archived", count: 24 },
  ];

  type PillColor = "moss" | "terra" | "leaf" | undefined;
  const questions: Array<{
    text: string;
    pills: Array<{ label: string; color?: PillColor }>;
    difficulty: number;
    difficultyColor?: string;
  }> = [
    {
      text: "Walk me through a time you disagreed with your manager and stayed.",
      pills: [{ label: "leadership", color: "moss" }, { label: "behavioral" }, { label: "L4–L6", color: "leaf" }, { label: "used 32×" }],
      difficulty: 2,
    },
    {
      text: "Design a rate limiter for an API serving 50K req/s with bursty traffic.",
      pills: [{ label: "system-design", color: "moss" }, { label: "tradeoffs", color: "terra" }, { label: "L5+", color: "leaf" }, { label: "used 19×" }],
      difficulty: 4,
      difficultyColor: "terra",
    },
    {
      text: "A teammate ships a feature you think is wrong. The data is ambiguous. What do you do?",
      pills: [{ label: "leadership", color: "moss" }, { label: "judgment" }, { label: "L3–L5", color: "leaf" }, { label: "used 48×" }],
      difficulty: 3,
    },
    {
      text: "Pick a product you use daily. Tell me what you'd cut and why.",
      pills: [{ label: "craft", color: "moss" }, { label: "product-sense" }, { label: "all levels", color: "leaf" }, { label: "used 56×" }],
      difficulty: 2,
    },
    {
      text: "Debug a service where p99 latency tripled overnight, no deploys.",
      pills: [{ label: "debugging", color: "moss" }, { label: "depth", color: "terra" }, { label: "L5+", color: "leaf" }, { label: "used 11×" }],
      difficulty: 5,
      difficultyColor: "terra",
    },
  ];

  const pillStyle = (color?: PillColor) => {
    if (color === "moss") return { background: "color-mix(in oklab, var(--moss) 12%, transparent)", color: "var(--moss)" };
    if (color === "terra") return { background: "color-mix(in oklab, var(--terra) 22%, transparent)", color: "#a4571f" };
    if (color === "leaf") return { background: "color-mix(in oklab, var(--leaf) 24%, transparent)", color: "#3d6c2c" };
    return { background: "var(--cream-2)", color: "var(--muted)" };
  };

  return (
    <section id="bank" className="scroll-mt-24" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="Question Bank"
          title="A library, not a folder of Notion pages."
          sub="Every question lives in one place — tagged by role, level, axis, and difficulty. Reuse what works, retire what doesn't, and stop reinventing the loop every quarter."
        />

        <div
          className="grid overflow-hidden rounded-[18px]"
          style={{ gridTemplateColumns: "300px 1fr", border: "1px solid var(--line)", background: "var(--paper)", boxShadow: "0 24px 60px -40px rgba(31,74,47,.3)" }}
        >
          <aside style={{ background: "var(--cream-2)", borderRight: "1px solid var(--line)", padding: "22px 18px" }}>
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Collections</h4>
            <ul className="mb-5 flex flex-col gap-0.5 p-0" style={{ listStyle: "none", margin: "0 0 20px" }}>
              {collections.map(({ name, count, active }) => (
                <li
                  key={name}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
                  style={active
                    ? { background: "var(--paper)", color: "var(--ink)", fontWeight: 500, boxShadow: "inset 0 0 0 1px var(--line)" }
                    : { color: "var(--ink-soft)" }
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: "var(--moss)", flexShrink: 0 }}><use href="#folder" /></svg>
                  {name}
                  <span className="ml-auto text-[11.5px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{count}</span>
                </li>
              ))}
            </ul>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {["behavioral", "system-design", "tradeoffs", "leadership", "debugging", "craft"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium"
                  style={tag === "leadership"
                    ? { background: "var(--moss)", color: "var(--paper)", borderColor: "var(--moss)" }
                    : { background: "var(--cream-2)", borderColor: "var(--line)", color: "var(--ink-soft)" }
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          </aside>

          <div style={{ padding: "24px 28px" }}>
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex flex-1 items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-sm"
                style={{ background: "var(--cream)", borderColor: "var(--line)", color: "var(--muted)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Search questions, axes, or competencies…
              </div>
              <button
                className="flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-sm font-semibold"
                style={{ background: "var(--terra)", color: "#3a2615", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)" }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16"><use href="#plus" /></svg>
                Add question
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {questions.map(({ text, pills, difficulty, difficultyColor }) => (
                <div
                  key={text}
                  className="grid items-center gap-3.5 rounded-xl px-4 py-3.5 transition hover:translate-x-0.5"
                  style={{ gridTemplateColumns: "auto 1fr auto", border: "1px solid var(--line)", background: "var(--paper)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" style={{ color: "var(--muted)", cursor: "grab" }}><use href="#grip" /></svg>
                  <div>
                    <div className="mb-1 text-[15px] font-medium" style={{ color: "var(--ink)" }}>{text}</div>
                    <div className="flex flex-wrap gap-2">
                      {pills.map(({ label, color }) => (
                        <span key={label} className="rounded-[5px] px-1.5 py-0.5 text-[11px]" style={{ fontFamily: "var(--font-mono)", ...pillStyle(color) }}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-[3px]">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className="h-3.5 w-1.5 rounded-[2px]"
                        style={{ background: i < difficulty ? (difficultyColor === "terra" ? "var(--terra)" : "var(--moss)") : "var(--cream-2)" }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Static Rubric ── */
function RubricSection() {
  const axes = [
    { name: "Technical depth", sub: "debugging · tradeoffs", score: 4, color: "moss" },
    { name: "System design", sub: "scope · failure modes", score: 5, color: "leaf" },
    { name: "Communication", sub: "clarity · listening", score: 3, color: "moss" },
    { name: "Ownership", sub: "scope of impact", score: 4, color: "terra" },
  ];

  return (
    <section id="axes" className="scroll-mt-24" style={{ padding: "96px 0", background: "var(--paper)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <div className="grid items-center gap-9 lg:grid-cols-2">
          <div>
            <SectionEyebrow>Evaluation Axes</SectionEyebrow>
            <h2
              className="mb-4 mt-3"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 42px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--ink)" }}
            >
              Score the right things. Not the loud things.
            </h2>
            <p className="mb-5 text-[17px]" style={{ color: "var(--ink-soft)" }}>
              Define the axes that matter for each role, set what each band looks like, and watch every interviewer score the same candidate against the same ruler.
            </p>
            <ul className="flex flex-col gap-3.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { title: "Calibrated bands.", body: "Anchor every score with concrete evidence and example responses." },
                { title: "Inter-rater drift detection.", body: "Spot the panelist who's two bands off — before it ships an offer." },
                { title: "Weighted by stage.", body: "The screen weighs craft. The bar-raiser weighs judgment. Loops can finally agree." },
              ].map(({ title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px]" style={{ background: "var(--leaf-soft)" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: "var(--moss)" }}><use href="#check" /></svg>
                  </span>
                  <div className="text-[14.5px]">
                    <strong style={{ color: "var(--ink)" }}>{title}</strong>{" "}
                    <span style={{ color: "var(--muted)" }}>{body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-[18px] p-7"
            style={{ background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "0 16px 40px -28px rgba(31,74,47,.3)" }}
          >
            <div className="mb-2.5 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>Rubric · Senior Backend</div>
                <div className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>Maya Okafor — Round 3</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "var(--moss)" }}>
                4.1<span style={{ color: "var(--muted)", fontSize: 18, fontWeight: 400 }}>/5</span>
              </div>
            </div>

            {axes.map(({ name, sub, score, color }, i) => (
              <div
                key={name}
                className="grid items-center gap-3.5 py-3.5"
                style={{
                  gridTemplateColumns: "160px 1fr 60px",
                  borderBottom: i < axes.length - 1 ? "1px dashed var(--line-soft)" : "none",
                }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{name}</div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--muted)" }}>{sub}</div>
                </div>
                <div className="flex h-[30px] overflow-hidden rounded-lg" style={{ background: "var(--cream-2)" }}>
                  {Array.from({ length: 5 }, (_, si) => (
                    <div
                      key={si}
                      className="flex flex-1 items-center justify-center text-[11px]"
                      style={{
                        borderRight: si < 4 ? "1px solid var(--line-soft)" : "none",
                        background: si < score
                          ? color === "leaf" ? "var(--leaf)" : color === "terra" ? "var(--terra)" : "var(--moss)"
                          : "transparent",
                        color: si < score
                          ? color === "leaf" ? "var(--moss-deep)" : color === "terra" ? "#3a2615" : "var(--paper)"
                          : "var(--muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {si + 1}
                    </div>
                  ))}
                </div>
                <div className="text-right" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>
                  {score} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>/5</span>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-[10px] p-3.5 text-[13.5px]" style={{ background: "var(--cream-2)", color: "var(--ink-soft)" }}>
              <strong style={{ color: "var(--moss)" }}>Recommendation:</strong> Strong hire. Panel agreement{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--moss)" }}>87%</span> — one drift flag on Communication.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Interactive Evaluation Explorer ── */
function EvalExplorerSection() {
  return (
    <section id="evaluation-axes" className="scroll-mt-24" style={{ padding: "96px 0", borderTop: "1px solid var(--line-soft)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="Question → Axes"
          title="See exactly what each question tests."
          sub="Click a question to watch Froggy re-map the evaluation axes in real time."
        />
        <EvaluationExplorer />
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="How it works"
          title="Three steps to a louder hiring signal."
          sub="Most teams skip step two. That's why their loops feel random."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              num: 1, color: "moss", numBg: "var(--moss)", numFg: "var(--paper)",
              title: "Write the bank.",
              body: "Pull from 400+ vetted starter questions or write your own. Tag by competency, level, and the axes they're meant to test.",
              art: (
                <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
                  <rect x="20" y="22" width="240" height="22" rx="6" fill="#FBF8EF" stroke="#D9D2BF" />
                  <rect x="28" y="30" width="60" height="6" rx="3" fill="#2D5F3F" />
                  <rect x="94" y="30" width="40" height="6" rx="3" fill="#E8985E" />
                  <rect x="20" y="52" width="240" height="22" rx="6" fill="#FBF8EF" stroke="#D9D2BF" />
                  <rect x="28" y="60" width="80" height="6" rx="3" fill="#2D5F3F" />
                  <rect x="114" y="60" width="30" height="6" rx="3" fill="#7FB069" />
                  <rect x="20" y="82" width="240" height="22" rx="6" fill="#2D5F3F" />
                  <rect x="28" y="90" width="70" height="6" rx="3" fill="#A8C99A" />
                  <rect x="104" y="90" width="40" height="6" rx="3" fill="#E8985E" />
                </svg>
              ),
            },
            {
              num: 2, numBg: "var(--terra)", numFg: "#3a2615",
              title: "Calibrate the axes.",
              body: "Define what a 1, 3 and 5 actually mean — with examples — so every interviewer scores from the same ruler.",
              art: (
                <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
                  <g transform="translate(20,30)"><rect width="240" height="14" rx="4" fill="#EDE8D8" /><rect width="48" height="14" rx="4" fill="#7FB069" /><rect x="48" width="48" height="14" fill="#2D5F3F" /><rect x="96" width="144" height="14" fill="#EDE8D8" /></g>
                  <g transform="translate(20,60)"><rect width="240" height="14" rx="4" fill="#EDE8D8" /><rect width="144" height="14" rx="4" fill="#E8985E" /></g>
                  <g transform="translate(20,90)"><rect width="240" height="14" rx="4" fill="#EDE8D8" /><rect width="192" height="14" rx="4" fill="#2D5F3F" /></g>
                </svg>
              ),
            },
            {
              num: 3, numBg: "var(--leaf)", numFg: "var(--moss-deep)",
              title: "Ship the loop.",
              body: "Drag stages into a loop, assign axes per stage, and sync to Greenhouse or Ashby. Every interviewer gets the same scorecard, every time.",
              art: (
                <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
                  <rect x="14" y="50" width="44" height="32" rx="6" fill="#FBF8EF" stroke="#D9D2BF" /><rect x="22" y="62" width="28" height="4" rx="2" fill="#2D5F3F" /><rect x="22" y="70" width="18" height="4" rx="2" fill="#E8985E" />
                  <line x1="58" y1="66" x2="76" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
                  <rect x="76" y="50" width="44" height="32" rx="6" fill="#2D5F3F" /><rect x="84" y="62" width="28" height="4" rx="2" fill="#A8C99A" /><rect x="84" y="70" width="18" height="4" rx="2" fill="#E8985E" />
                  <line x1="120" y1="66" x2="138" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
                  <rect x="138" y="50" width="44" height="32" rx="6" fill="#FBF8EF" stroke="#D9D2BF" /><rect x="146" y="62" width="28" height="4" rx="2" fill="#2D5F3F" /><rect x="146" y="70" width="18" height="4" rx="2" fill="#7FB069" />
                  <line x1="182" y1="66" x2="200" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
                  <rect x="200" y="50" width="44" height="32" rx="6" fill="#E8985E" /><rect x="208" y="62" width="28" height="4" rx="2" fill="#FBF8EF" /><rect x="208" y="70" width="18" height="4" rx="2" fill="#2D5F3F" />
                </svg>
              ),
            },
          ].map(({ num, numBg, numFg, title, body, art }) => (
            <div
              key={num}
              className="relative rounded-[18px] border p-7 transition hover:-translate-y-1"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div
                className="absolute -top-3.5 left-6 grid h-9 w-9 place-items-center rounded-[10px] text-[18px] font-bold"
                style={{ fontFamily: "var(--font-display)", background: numBg, color: numFg, boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)" }}
              >
                {num}
              </div>
              <h4 className="mb-2 mt-2 text-[22px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>{title}</h4>
              <p className="mb-4 text-[14.5px]" style={{ color: "var(--ink-soft)" }}>{body}</p>
              <div className="relative h-32 overflow-hidden rounded-xl" style={{ background: "var(--cream-2)", border: "1px solid var(--line-soft)" }}>
                {art}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  return (
    <section id="customers" className="scroll-mt-24" style={{ padding: "96px 0", background: "var(--paper)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="From the lily pad"
          title="Hiring teams that stopped guessing."
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div
            className="relative flex flex-col gap-4 overflow-hidden rounded-[18px] p-7"
            style={{ background: "var(--moss)", color: "var(--paper)", border: "1px solid var(--moss)" }}
          >
            <div className="ov-lilies pointer-events-none absolute inset-0" style={{ opacity: 0.9 }} aria-hidden="true" />
            <div className="relative z-10 flex flex-col gap-4">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 0.4, color: "var(--terra-soft)" }}>&ldquo;</div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, lineHeight: 1.25 }}>
                We cut our time-to-decision in half and our offer-accept rate went up 22%. Turns out interviewers like having a ruler.
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold" style={{ background: "var(--terra)", color: "var(--paper)" }}>PS</div>
                <div>
                  <div className="text-sm font-semibold">Priya Shah</div>
                  <div className="text-[12.5px]" style={{ color: "rgba(251,248,239,0.65)" }}>Head of Talent · Heronbrook</div>
                </div>
              </div>
            </div>
          </div>

          {[
            {
              quote: "The first time three interviewers gave the same candidate the same score, I almost cried. We're never going back to scattered Google Docs.",
              initials: "JM", avatarStyle: { background: "var(--terra-soft)", color: "#7a4118" },
              name: "Jordan Marsh", role: "VP Engineering · Mossfield",
            },
            {
              quote: "The drift detection alone is worth it. We caught a panelist who'd been scoring a full band high for six months.",
              initials: "RC", avatarStyle: { background: "var(--leaf-soft)", color: "var(--moss)" },
              name: "Rita Chen", role: "Recruiting Lead · Sycamore",
            },
          ].map(({ quote, initials, avatarStyle, name, role }) => (
            <div key={name} className="flex flex-col gap-4 rounded-[18px] border p-7" style={{ background: "var(--paper)", borderColor: "var(--line)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 0.4, color: "var(--leaf-soft)" }}>&ldquo;</div>
              <p className="text-[17px]" style={{ color: "var(--ink)", lineHeight: 1.5 }}>{quote}</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold" style={avatarStyle}>{initials}</div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{name}</div>
                  <div className="text-[12.5px]" style={{ color: "var(--muted)" }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ + CTA Band ── */
function FaqAndCta() {
  const faqs = [
    { q: "Does Froggy replace our ATS?", a: "No — Froggy lives upstream of your ATS. We sync loops, scorecards, and final recommendations to Greenhouse, Ashby, Lever, and Workable. Your ATS keeps owning the candidate record; Froggy owns the signal." },
    { q: "How long does setup actually take?", a: "Most teams ship their first loop in an afternoon using our starter packs. Calibrating axes for a brand-new role takes about a week with two reviewers — but you only do it once per role family." },
    { q: "What about candidate experience?", a: "Candidates never see Froggy. They see a faster, more consistent interview where every panelist asked considered questions and gave clearer feedback. Your NPS goes up. Your loops get shorter." },
    { q: "Is there a free tier?", a: "Yes. Free for teams of up to 5, with unlimited questions and one active loop. Paid plans add unlimited loops, drift detection, ATS sync, and SSO." },
    { q: "How do you handle bias?", a: "Calibrated rubrics + drift detection + structured scorecards is the most evidence-backed playbook for reducing bias in interviews. We won't promise it's gone — but we'll show you where it's leaking." },
  ];

  return (
    <section id="faq" className="scroll-mt-24" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead eyebrow="FAQ" title="Questions, ribbited at us often." />

        <div className="mx-auto max-w-[780px]">
          {faqs.map(({ q, a }, i) => (
            <details
              key={q}
              className="group cursor-pointer py-5"
              style={{ borderBottom: "1px solid var(--line)", borderTop: i === 0 ? "1px solid var(--line)" : undefined }}
            >
              <summary
                className="flex items-center justify-between gap-4"
                style={{ listStyle: "none", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}
              >
                {q}
                <span
                  className="grid h-7 w-7 flex-none place-items-center rounded-full border transition group-open:rotate-45"
                  style={{ borderColor: "var(--line)", background: "var(--cream-2)", flexShrink: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16"><use href="#plus" /></svg>
                </span>
              </summary>
              <p className="mt-3.5 text-[15.5px]" style={{ color: "var(--ink-soft)", maxWidth: 680 }}>{a}</p>
            </details>
          ))}
        </div>

        {/* CTA Band */}
        <div
          className="relative mt-16 grid overflow-hidden rounded-3xl"
          style={{ background: "var(--terra)", boxShadow: "0 24px 48px -32px rgba(232,152,94,.6)", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "center", padding: "56px 48px" }}
        >
          <div className="ov-ripples pointer-events-none absolute inset-0" style={{ opacity: 0.85 }} aria-hidden="true" />
          <div className="relative z-10">
            <h3
              className="mb-3"
              style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, lineHeight: 1.05, color: "#3a2615" }}
            >
              Hop in. Hire better.
            </h3>
            <p className="mb-5 text-[17px]" style={{ color: "#5a3e26" }}>
              Start free for teams of 5. No card. No 14-day countdown. Bring your worst loop and we&rsquo;ll show you the leaks in 10 minutes.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="#waitlist"
                className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ background: "var(--moss-deep)", color: "var(--paper)", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)", textDecoration: "none" }}
              >
                Start free
                <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8 H12 M8 4 L12 8 L8 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a
                href="#waitlist"
                className="flex items-center rounded-[10px] border px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: "#a4571f", color: "#3a2615", textDecoration: "none" }}
              >
                Book a demo
              </a>
            </div>
          </div>
          <div className="relative z-10 hidden h-[170px] lg:block" aria-hidden="true">
            <svg className="absolute" style={{ right: 0, top: 0, width: 170, height: 170, opacity: 0.55 }}><use href="#lily-pad" /></svg>
            <svg className="absolute" style={{ right: 80, bottom: 0, width: 110, height: 110, opacity: 0.4 }}><use href="#lily-pad" /></svg>
            <svg className="absolute" style={{ right: 30, bottom: 20, width: 90, height: 74 }}><use href="#froggy" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const columns = [
    {
      heading: "Product",
      links: [{ label: "Question bank", href: "#bank" }, { label: "Evaluation axes", href: "#axes" }, { label: "Loop builder", href: "#how" }, { label: "Integrations", href: "#" }, { label: "Changelog", href: "#" }],
    },
    {
      heading: "Company",
      links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }, { label: "Hiring playbook", href: "#" }],
    },
    {
      heading: "Resources",
      links: [{ label: "Docs", href: "#" }, { label: "Security", href: "#" }, { label: "Privacy", href: "#" }, { label: "Status", href: "#" }],
    },
  ];

  return (
    <footer style={{ padding: "60px 0 40px", background: "var(--paper)", borderTop: "1px solid var(--line-soft)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--ink)", textDecoration: "none" }}>
              <span className="grid h-8 w-8 place-items-center rounded-[10px]" style={{ background: "var(--moss)", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.18)" }}>
                <svg width="20" height="16" viewBox="0 0 20 16">
                  <ellipse cx="10" cy="11" rx="9" ry="4" fill="#7FB069" />
                  <circle cx="6" cy="5" r="3" fill="#7FB069" />
                  <circle cx="14" cy="5" r="3" fill="#7FB069" />
                  <circle cx="6" cy="5" r="1.2" fill="#1A2B22" />
                  <circle cx="14" cy="5" r="1.2" fill="#1A2B22" />
                </svg>
              </span>
              Froggy
            </a>
            <p className="mt-3.5 max-w-[300px] text-sm" style={{ color: "var(--muted)" }}>
              Build interviews that find your ideal candidate. From the team that got tired of bad loops.
            </p>
          </div>

          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h5 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--font-display)", color: "var(--muted)" }}>
                {heading}
              </h5>
              <ul className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm transition hover:text-[#2D5F3F]" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-[13px]"
          style={{ borderColor: "var(--line-soft)", color: "var(--muted)" }}
        >
          <span>© 2026 Froggy Labs · Built on a lily pad</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>v1.4.0 · made with 🌿</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Shared helpers ── */
function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-[680px] text-center">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2
        className="mt-3 mb-3.5"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1.06 }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mx-auto max-w-[560px] text-[18px]" style={{ color: "var(--ink-soft)" }}>{sub}</p>
      )}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--moss)" }}>
      <span style={{ width: 18, height: 1, background: "currentColor", opacity: 0.5, display: "inline-block" }} />
      {children}
      <span style={{ width: 18, height: 1, background: "currentColor", opacity: 0.5, display: "inline-block" }} />
    </div>
  );
}
