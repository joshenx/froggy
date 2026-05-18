import EvaluationExplorer from "@/features/landing/components/evaluation-explorer";
import WaitlistForm from "@/features/landing/components/waitlist-form";

export default function Home() {
  return (
    <main style={{ background: "var(--cream)", color: "var(--ink)" }}>
      <SvgDefs />
      <Nav />
      <Hero />
      <AudienceAndGoals />
      <QuestionBank />
      <RubricSection />
      <CoverageSection />
      <ProductScope />
      <PricingAndLaunch />
      <FaqAndCta />
      <Footer />
    </main>
  );
}

function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="lily-pad" viewBox="0 0 100 100">
          <path d="M50,8 a42,42 0 1 1 -38,42 L50,50 Z" fill="#7FB069" />
          <path d="M50,8 a42,42 0 1 1 -38,42 L50,50 Z" fill="#2D5F3F" opacity=".18" />
          <path
            d="M50,12 a38,38 0 1 1 -34,38"
            fill="none"
            stroke="#2D5F3F"
            strokeOpacity=".22"
            strokeWidth="1.2"
          />
          <path
            d="M50,22 L50,50 L24,55"
            fill="none"
            stroke="#2D5F3F"
            strokeOpacity=".25"
            strokeWidth="1.2"
          />
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
          <path
            d="M44 70 Q60 80 76 70"
            stroke="#1F4A2F"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="36" cy="72" r="3" fill="#E8985E" opacity=".7" />
          <circle cx="84" cy="72" r="3" fill="#E8985E" opacity=".7" />
        </symbol>
        <symbol id="reed" viewBox="0 0 20 80">
          <rect x="9" y="20" width="2" height="60" fill="#2D5F3F" />
          <ellipse cx="10" cy="14" rx="6" ry="14" fill="#2D5F3F" />
        </symbol>
        <symbol id="check" viewBox="0 0 16 16">
          <path
            d="M3 8.5 L6.5 12 L13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="plus" viewBox="0 0 16 16">
          <path d="M8 3 V13 M3 8 H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="folder" viewBox="0 0 16 16">
          <path
            d="M2 4 a1 1 0 0 1 1-1 H6 L8 5 H13 a1 1 0 0 1 1 1 V12 a1 1 0 0 1 -1 1 H3 a1 1 0 0 1 -1 -1 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
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

function Nav() {
  const links = [
    { label: "Question bank", href: "#bank" },
    { label: "Rubrics", href: "#rubrics" },
    { label: "Coverage", href: "#coverage" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

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
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            textDecoration: "none",
          }}
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
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-medium transition hover:text-[#2D5F3F]"
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="#pricing"
            className="hidden rounded-[10px] border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 sm:block"
            style={{ borderColor: "var(--line)", color: "var(--ink)", textDecoration: "none" }}
          >
            View pricing
          </a>
          <a
            href="#waitlist"
            className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{
              background: "var(--moss)",
              color: "var(--paper)",
              boxShadow: "0 1px 0 rgba(0,0,0,.06), inset 0 -2px 0 rgba(0,0,0,.18)",
              textDecoration: "none",
            }}
          >
            Join waitlist
            <svg width="13" height="13" viewBox="0 0 16 16">
              <path
                d="M3 8 H12 M8 4 L12 8 L8 12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const proofPoints = [
    ">=30% faster time-to-decision",
    ">=80% inter-rater agreement on calibrated loops",
    "<20 min prep for a new interviewer",
  ];

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
              style={{
                background: "var(--leaf)",
                boxShadow: "0 0 0 3px color-mix(in oklab, var(--leaf) 30%, transparent)",
              }}
            />
            Draft v0.4 · Private beta · Target launch: Summer 2026
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
            Design interview loops with a{" "}
            <span className="relative inline-block" style={{ color: "var(--moss)" }}>
              clear, calibrated hiring signal
              <span
                className="absolute -z-10 rounded-[4px]"
                style={{
                  left: -2,
                  right: -2,
                  bottom: 6,
                  height: 14,
                  background: "var(--leaf-soft)",
                  transform: "rotate(-.6deg)",
                }}
              />
            </span>
            .
          </h1>
          <p className="mb-7 max-w-[560px] text-[19px]" style={{ color: "var(--ink-soft)" }}>
            Froggy gives engineering hiring teams a structured question bank, reusable rubrics, and
            coverage analysis so every interview loop produces consistent evidence instead of
            duplicated questions and calibration drift.
          </p>
          <div id="waitlist" className="max-w-xl">
            <WaitlistForm />
          </div>
          <p className="mt-4 max-w-[520px] text-[13.5px]" style={{ color: "var(--muted)" }}>
            Private beta for engineering hiring owners, heads of engineering, and recruiting ops
            partners preparing for Summer 2026 early access.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[13.5px]" style={{ color: "var(--muted)" }}>
            {proofPoints.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" style={{ color: "var(--moss)" }}>
                  <use href="#check" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden h-[520px] lg:block" aria-hidden="true">
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl"
            style={{
              border: "1px solid var(--line)",
              background: "var(--paper)",
              boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 24px 48px -28px rgba(45,95,63,.25)",
            }}
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
                <svg width="10" height="10" viewBox="0 0 16 16">
                  <use href="#folder" />
                </svg>
                Question Bank
              </CardTag>
              <div className="mt-2 text-sm font-semibold leading-snug" style={{ color: "var(--ink)" }}>
                Debug a service where p99 latency tripled overnight with no deploys.
              </div>
              <div className="mt-1 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                BACKEND · L5+ · 25 min · version 4
              </div>
            </HeroCard>

            <HeroCard style={{ top: "34%", right: "6%", transform: "rotate(3deg)", width: 250 }}>
              <CardTag color="terra">Rubric · Staff Platform</CardTag>
              <div className="mt-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Anchored bands for systems thinking
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {[
                  { label: "1 vague failure model", pct: 30 },
                  { label: "3 identifies tradeoffs", pct: 62 },
                  { label: "5 prioritizes risks clearly", pct: 88 },
                ].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-2 text-[11.5px]">
                    <div
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: "var(--leaf-soft)", color: "var(--moss)" }}
                    >
                      A
                    </div>
                    <span style={{ color: "var(--ink-soft)" }}>{label}</span>
                    <div className="ml-auto h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "var(--cream-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--moss)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </HeroCard>

            <HeroCard style={{ bottom: "14%", left: "18%", transform: "rotate(-1deg)", width: 272 }}>
              <CardTag color="leaf">Loop Builder · Platform</CardTag>
              <div className="mt-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Staff Backend hiring loop
              </div>
              <div className="mt-1 text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                SCREEN → DEBUG → SYSTEM → VALUES → DEBRIEF
              </div>
              <div className="mt-3 grid gap-2 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                <div className="flex items-center justify-between">
                  <span>Questions assigned</span>
                  <strong style={{ color: "var(--ink)" }}>12</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rubric axes covered</span>
                  <strong style={{ color: "var(--ink)" }}>6</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gap warnings</span>
                  <strong style={{ color: "var(--terra)" }}>1 to review</strong>
                </div>
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
      style={{
        width: 230,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        boxShadow: "0 12px 24px -16px rgba(31,74,47,.35)",
        ...style,
      }}
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
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]"
      style={styles[color]}
    >
      {children}
    </span>
  );
}

function AudienceAndGoals() {
  const audiences = [
    {
      label: "Primary",
      title: "Engineering hiring owner",
      body: "Engineering managers and tech leads who own the loop, the question set, and the final signal quality.",
    },
    {
      label: "Secondary",
      title: "Head or VP of Engineering",
      body: "Executive sponsors who need a hiring system that scales across teams without calibration drift.",
    },
    {
      label: "Tertiary",
      title: "Recruiting Ops or Talent Ops",
      body: "Process owners who need structured handoffs, reusable templates, and a source of truth for interview design.",
    },
  ];

  const goals = [
    ">=30% faster time-to-decision",
    ">=80% inter-rater agreement",
    "<20 min prep for a new interviewer",
    "System of record for interview design",
  ];

  return (
    <section
      style={{
        borderTop: "1px solid var(--line-soft)",
        borderBottom: "1px solid var(--line-soft)",
        background: "var(--paper)",
        padding: "32px 0 40px",
      }}
    >
      <div className="mx-auto max-w-[1256px] px-7">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionEyebrow>Who It&apos;s For</SectionEyebrow>
            <h2
              className="mt-3 text-[32px] font-semibold tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1.08 }}
            >
              Built for the hiring team that owns interview design.
            </h2>
            <p className="mt-4 max-w-[520px] text-[16px]" style={{ color: "var(--ink-soft)" }}>
              Froggy is not an ATS replacement. It is the place your team creates the question
              bank, calibrates rubrics, and checks loop coverage before a candidate ever reaches
              debrief.
            </p>
            <p className="mt-4 text-[13px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Draft v0.4 · Updated May 2026
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {audiences.map(({ label, title, body }) => (
              <div
                key={title}
                className="rounded-[18px] border p-5"
                style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}
                >
                  {label}
                </p>
                <h3
                  className="mt-2 text-[18px] font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-[14.5px]" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {goals.map((goal) => (
            <div
              key={goal}
              className="rounded-[16px] border px-4 py-4"
              style={{ borderColor: "var(--line)", background: "var(--cream)" }}
            >
              <div className="flex items-center gap-2 text-[13.5px]" style={{ color: "var(--ink-soft)" }}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" style={{ color: "var(--moss)" }}>
                  <use href="#check" />
                </svg>
                {goal}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestionBank() {
  const collections = [
    { name: "All questions", count: 428, active: true },
    { name: "Engineering", count: 211 },
    { name: "Leadership", count: 74 },
    { name: "Platform", count: 58 },
    { name: "Behavioral", count: 46 },
    { name: "Archived", count: 39 },
  ];

  type PillColor = "moss" | "terra" | "leaf" | undefined;
  const questions: Array<{
    text: string;
    pills: Array<{ label: string; color?: PillColor }>;
    difficulty: number;
    difficultyColor?: string;
  }> = [
    {
      text: "Debug a service where p99 latency tripled overnight with no deploys.",
      pills: [
        { label: "backend", color: "moss" },
        { label: "debugging" },
        { label: "L5+", color: "leaf" },
        { label: "25 min", color: "terra" },
        { label: "used 18x last qtr" },
      ],
      difficulty: 5,
      difficultyColor: "terra",
    },
    {
      text: "Tell me about a time you changed an interview question after it produced bad signal.",
      pills: [
        { label: "calibration", color: "moss" },
        { label: "behavioral" },
        { label: "L6+", color: "leaf" },
        { label: "20 min", color: "terra" },
        { label: "version 3" },
      ],
      difficulty: 3,
    },
    {
      text: "Design a migration plan for a platform dependency used by every product team.",
      pills: [
        { label: "system-design", color: "moss" },
        { label: "execution" },
        { label: "L5-L6", color: "leaf" },
        { label: "35 min", color: "terra" },
        { label: "used 9x last qtr" },
      ],
      difficulty: 4,
      difficultyColor: "terra",
    },
    {
      text: "How would you coach a new interviewer who scores every candidate the same?",
      pills: [
        { label: "people-leadership", color: "moss" },
        { label: "drift" },
        { label: "M1+", color: "leaf" },
        { label: "20 min", color: "terra" },
        { label: "used 14x last qtr" },
      ],
      difficulty: 2,
    },
    {
      text: "What would you measure in the first 30 days of a new internal developer tool?",
      pills: [
        { label: "product-judgment", color: "moss" },
        { label: "metrics" },
        { label: "L4-L6", color: "leaf" },
        { label: "25 min", color: "terra" },
        { label: "used 11x last qtr" },
      ],
      difficulty: 3,
    },
  ];

  const pillStyle = (color?: PillColor) => {
    if (color === "moss") {
      return { background: "color-mix(in oklab, var(--moss) 12%, transparent)", color: "var(--moss)" };
    }
    if (color === "terra") {
      return { background: "color-mix(in oklab, var(--terra) 22%, transparent)", color: "#a4571f" };
    }
    if (color === "leaf") {
      return { background: "color-mix(in oklab, var(--leaf) 24%, transparent)", color: "#3d6c2c" };
    }
    return { background: "var(--cream-2)", color: "var(--muted)" };
  };

  return (
    <section id="bank" className="scroll-mt-24" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="Question Bank"
          title="Structured question bank with audit history."
          sub="Create, search, collect, version, and soft-delete questions without losing the institutional memory behind past hiring decisions."
        />

        <div
          className="grid overflow-hidden rounded-[18px]"
          style={{
            gridTemplateColumns: "300px 1fr",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            boxShadow: "0 24px 60px -40px rgba(31,74,47,.3)",
          }}
        >
          <aside
            style={{
              background: "var(--cream-2)",
              borderRight: "1px solid var(--line)",
              padding: "22px 18px",
            }}
          >
            <h4
              className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              Collections
            </h4>
            <ul className="mb-5 flex flex-col gap-0.5 p-0" style={{ listStyle: "none", margin: "0 0 20px" }}>
              {collections.map(({ name, count, active }) => (
                <li
                  key={name}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
                  style={
                    active
                      ? {
                          background: "var(--paper)",
                          color: "var(--ink)",
                          fontWeight: 500,
                          boxShadow: "inset 0 0 0 1px var(--line)",
                        }
                      : { color: "var(--ink-soft)" }
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: "var(--moss)", flexShrink: 0 }}>
                    <use href="#folder" />
                  </svg>
                  {name}
                  <span
                    className="ml-auto text-[11.5px]"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {count}
                  </span>
                </li>
              ))}
            </ul>

            <h4
              className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              Fields
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {["role family", "level range", "competency", "difficulty", "duration", "versioned"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium"
                  style={
                    tag === "competency"
                      ? { background: "var(--moss)", color: "var(--paper)", borderColor: "var(--moss)" }
                      : { background: "var(--cream-2)", borderColor: "var(--line)", color: "var(--ink-soft)" }
                  }
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-[12px] border p-3.5 text-[13px]" style={{ borderColor: "var(--line)", background: "var(--paper)", color: "var(--ink-soft)" }}>
              Questions used in decisions stay auditable forever through version history and soft-delete.
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
                Search by text, tag, role, level, or used last quarter...
              </div>
              <button
                className="flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-sm font-semibold"
                style={{ background: "var(--terra)", color: "#3a2615", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.15)" }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16">
                  <use href="#plus" />
                </svg>
                Add question
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {questions.map(({ text, pills, difficulty, difficultyColor }) => (
                <div
                  key={text}
                  className="grid items-center gap-3.5 rounded-xl px-4 py-3.5 transition hover:translate-x-0.5"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" style={{ color: "var(--muted)", cursor: "grab" }}>
                    <use href="#grip" />
                  </svg>
                  <div>
                    <div className="mb-1 text-[15px] font-medium" style={{ color: "var(--ink)" }}>
                      {text}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pills.map(({ label, color }) => (
                        <span
                          key={label}
                          className="rounded-[5px] px-1.5 py-0.5 text-[11px]"
                          style={{ fontFamily: "var(--font-mono)", ...pillStyle(color) }}
                        >
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
                        style={{
                          background:
                            i < difficulty
                              ? difficultyColor === "terra"
                                ? "var(--terra)"
                                : "var(--moss)"
                              : "var(--cream-2)",
                        }}
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

function RubricSection() {
  const axes = [
    { name: "Technical judgment", sub: "tradeoffs · debugging", score: 4, color: "moss" },
    { name: "Systems thinking", sub: "scope · failure modes", score: 5, color: "leaf" },
    { name: "Communication", sub: "clarity · alignment", score: 4, color: "moss" },
    { name: "Ownership", sub: "ambiguity · follow-through", score: 4, color: "terra" },
  ];

  return (
    <section id="rubrics" className="scroll-mt-24" style={{ padding: "96px 0", background: "var(--paper)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <div className="grid items-center gap-9 lg:grid-cols-2">
          <div>
            <SectionEyebrow>Rubrics</SectionEyebrow>
            <h2
              className="mb-4 mt-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(30px, 3.5vw, 42px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--ink)",
              }}
            >
              Reusable rubrics with anchored 1-5 bands.
            </h2>
            <p className="mb-5 text-[17px]" style={{ color: "var(--ink-soft)" }}>
              Define the axes that matter for each role, attach anchored bands and example evidence,
              and reuse the same rubric across loops without mutating historical decisions.
            </p>
            <ul className="flex flex-col gap-3.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                {
                  title: "Anchored scoring.",
                  body: "Write what a 1, 3, and 5 look like so every interviewer grades against the same ruler.",
                },
                {
                  title: "Reusable axes.",
                  body: "Treat competencies as first-class objects that can travel across roles and templates.",
                },
                {
                  title: "Drift detection.",
                  body: "Flag sustained scoring variance when a reviewer is more than one band away from the median.",
                },
              ].map(({ title, body }) => (
                <li key={title} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px]"
                    style={{ background: "var(--leaf-soft)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: "var(--moss)" }}>
                      <use href="#check" />
                    </svg>
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
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              boxShadow: "0 16px 40px -28px rgba(31,74,47,.3)",
            }}
          >
            <div className="mb-2.5 flex items-end justify-between">
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
                >
                  Rubric · Staff Platform
                </div>
                <div className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  Loop calibration snapshot
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, color: "var(--moss)" }}>
                4.2<span style={{ color: "var(--muted)", fontSize: 18, fontWeight: 400 }}>/5</span>
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
                  <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {name}
                  </div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
                    {sub}
                  </div>
                </div>
                <div className="flex h-[30px] overflow-hidden rounded-lg" style={{ background: "var(--cream-2)" }}>
                  {Array.from({ length: 5 }, (_, si) => (
                    <div
                      key={si}
                      className="flex flex-1 items-center justify-center text-[11px]"
                      style={{
                        borderRight: si < 4 ? "1px solid var(--line-soft)" : "none",
                        background:
                          si < score
                            ? color === "leaf"
                              ? "var(--leaf)"
                              : color === "terra"
                                ? "var(--terra)"
                                : "var(--moss)"
                            : "transparent",
                        color:
                          si < score
                            ? color === "leaf"
                              ? "var(--moss-deep)"
                              : color === "terra"
                                ? "#3a2615"
                                : "var(--paper)"
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
              <strong style={{ color: "var(--moss)" }}>Calibration health:</strong> Median agreement{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--moss)" }}>82%</span> -
              one reviewer on a communication drift watch after three candidates.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverageSection() {
  return (
    <section id="coverage" className="scroll-mt-24" style={{ padding: "96px 0", borderTop: "1px solid var(--line-soft)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <EvaluationExplorer />
      </div>
    </section>
  );
}

function ProductScope() {
  const cards = [
    {
      num: 1,
      numBg: "var(--moss)",
      numFg: "var(--paper)",
      title: "Loop Builder",
      body: "Create stage-based loops, assign questions and rubric axes, set weights, and save templates by role family.",
      art: (
        <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
          <rect x="14" y="50" width="44" height="32" rx="6" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="22" y="62" width="28" height="4" rx="2" fill="#2D5F3F" />
          <rect x="22" y="70" width="18" height="4" rx="2" fill="#E8985E" />
          <line x1="58" y1="66" x2="76" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="76" y="50" width="44" height="32" rx="6" fill="#2D5F3F" />
          <rect x="84" y="62" width="28" height="4" rx="2" fill="#A8C99A" />
          <rect x="84" y="70" width="18" height="4" rx="2" fill="#E8985E" />
          <line x1="120" y1="66" x2="138" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="138" y="50" width="44" height="32" rx="6" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="146" y="62" width="28" height="4" rx="2" fill="#2D5F3F" />
          <rect x="146" y="70" width="18" height="4" rx="2" fill="#7FB069" />
          <line x1="182" y1="66" x2="200" y2="66" stroke="#2D5F3F" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="200" y="50" width="44" height="32" rx="6" fill="#E8985E" />
          <rect x="208" y="62" width="28" height="4" rx="2" fill="#FBF8EF" />
          <rect x="208" y="70" width="18" height="4" rx="2" fill="#2D5F3F" />
        </svg>
      ),
    },
    {
      num: 2,
      numBg: "var(--terra)",
      numFg: "#3a2615",
      title: "Live Scorecard",
      body: "Capture notes against assigned questions and axes, autosave drafts, and lock submissions after the interview is complete.",
      art: (
        <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
          <rect x="24" y="16" width="232" height="94" rx="10" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="40" y="34" width="72" height="6" rx="3" fill="#2D5F3F" />
          <rect x="40" y="48" width="182" height="4" rx="2" fill="#D9D2BF" />
          <rect x="40" y="62" width="182" height="4" rx="2" fill="#D9D2BF" />
          <rect x="40" y="80" width="78" height="16" rx="6" fill="#E8985E" />
          <rect x="132" y="80" width="90" height="16" rx="6" fill="#2D5F3F" />
        </svg>
      ),
    },
    {
      num: 3,
      numBg: "var(--leaf)",
      numFg: "var(--moss-deep)",
      title: "Debrief View",
      body: "Compare panel scorecards side by side, surface agreement and drift, and push or export the final recommendation back to your ATS.",
      art: (
        <svg width="100%" height="100%" viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="24" width="74" height="78" rx="8" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="102" y="24" width="74" height="78" rx="8" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="184" y="24" width="74" height="78" rx="8" fill="#FBF8EF" stroke="#D9D2BF" />
          <rect x="32" y="38" width="40" height="5" rx="2.5" fill="#2D5F3F" />
          <rect x="114" y="38" width="40" height="5" rx="2.5" fill="#2D5F3F" />
          <rect x="196" y="38" width="40" height="5" rx="2.5" fill="#2D5F3F" />
          <rect x="32" y="56" width="48" height="10" rx="5" fill="#7FB069" />
          <rect x="114" y="56" width="48" height="10" rx="5" fill="#E8985E" />
          <rect x="196" y="56" width="48" height="10" rx="5" fill="#7FB069" />
          <rect x="32" y="76" width="40" height="4" rx="2" fill="#D9D2BF" />
          <rect x="114" y="76" width="40" height="4" rx="2" fill="#D9D2BF" />
          <rect x="196" y="76" width="40" height="4" rx="2" fill="#D9D2BF" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="Product Scope"
          title="What ships in v1."
          sub="Loop Builder, Live Scorecard, and Debrief View round out the workflow without trying to replace your ATS."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map(({ num, numBg, numFg, title, body, art }) => (
            <div
              key={num}
              className="relative rounded-[18px] border p-7 transition hover:-translate-y-1"
              style={{ background: "var(--paper)", borderColor: "var(--line)" }}
            >
              <div
                className="absolute -top-3.5 left-6 grid h-9 w-9 place-items-center rounded-[10px] text-[18px] font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  background: numBg,
                  color: numFg,
                  boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)",
                }}
              >
                {num}
              </div>
              <h4
                className="mb-2 mt-2 text-[22px] font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {title}
              </h4>
              <p className="mb-4 text-[14.5px]" style={{ color: "var(--ink-soft)" }}>
                {body}
              </p>
              <div
                className="relative h-32 overflow-hidden rounded-xl"
                style={{ background: "var(--cream-2)", border: "1px solid var(--line-soft)" }}
              >
                {art}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingAndLaunch() {
  const tiers = [
    {
      name: "Free",
      price: "Free",
      detail: "5 seats",
      body: "1 active loop, 50 questions, and no ATS sync for teams getting their first calibrated process in place.",
    },
    {
      name: "Team",
      price: "$12",
      detail: "per seat / mo",
      body: "Unlimited loops, unlimited questions, ATS sync, and drift detection for growing engineering organizations.",
    },
    {
      name: "Scale",
      price: "$24",
      detail: "per seat / mo",
      body: "SAML, audit log, custom rubrics, coverage policies, and dedicated success for larger rollouts.",
    },
  ];

  const timeline = [
    {
      phase: "Private beta",
      when: "Now - Jun 2026",
      body: "25 design partners and weekly feedback loops while the core workflow hardens.",
    },
    {
      phase: "Public early access",
      when: "Summer 2026",
      body: "Waitlist onboarding at roughly 50 teams per week with Free and Team tiers live.",
    },
    {
      phase: "General availability",
      when: "Q4 2026",
      body: "Self-serve signup, Scale tier, and SOC 2 Type II as the broader launch milestone.",
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-24" style={{ padding: "96px 0", background: "var(--paper)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead
          eyebrow="Pricing & Launch"
          title="Pricing and launch."
          sub="Private beta is live now. Public early access opens in Summer 2026."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map(({ name, price, detail, body }) => (
            <div
              key={name}
              className="rounded-[20px] border p-7"
              style={{ borderColor: "var(--line)", background: name === "Team" ? "var(--cream)" : "var(--paper)" }}
            >
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--ink)" }}>
                  {name}
                </h3>
                {name === "Team" ? (
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ background: "var(--moss)", color: "var(--paper)" }}
                  >
                    Launch focus
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex items-end gap-2">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, color: "var(--moss)" }}>
                  {price}
                </div>
                <div className="pb-1 text-[13px]" style={{ color: "var(--muted)" }}>
                  {detail}
                </div>
              </div>
              <p className="mt-4 text-[15px]" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {timeline.map(({ phase, when, body }) => (
            <div
              key={phase}
              className="rounded-[18px] border p-6"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--moss)", fontFamily: "var(--font-mono)" }}
              >
                {phase}
              </p>
              <h4
                className="mt-2 text-[24px] font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {when}
              </h4>
              <p className="mt-3 text-[14.5px]" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqAndCta() {
  const faqs = [
    {
      q: "Does Froggy replace our ATS?",
      a: "No. Froggy is the system of record for interview design, loop coverage, scorecards, and debrief signal. Your ATS remains the source of truth for candidate records and scheduling.",
    },
    {
      q: "Who is Froggy for first?",
      a: "The first users are engineering hiring owners like engineering managers and tech leads, with heads of engineering and recruiting ops joining as sponsors and process owners.",
    },
    {
      q: "What ships in v1?",
      a: "Question Bank, Rubrics, Coverage Analysis, Loop Builder, Live Scorecard, and Debrief View are the core launch scope for the private beta and early-access rollout.",
    },
    {
      q: "Is there a free plan?",
      a: "Yes. Free includes 5 seats, 1 active loop, and 50 questions. Team adds unlimited loops and ATS sync, and Scale adds SAML, audit log, and coverage policies.",
    },
    {
      q: "What is not in scope for v1?",
      a: "Froggy is not replacing ATS, scheduling, or sourcing workflows. It also does not include candidate-facing AI interviewing or native mobile apps in v1.",
    },
  ];

  return (
    <section id="faq" className="scroll-mt-24" style={{ padding: "96px 0" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <SectionHead eyebrow="FAQ" title="Frequently asked questions." />

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
                  <svg width="12" height="12" viewBox="0 0 16 16">
                    <use href="#plus" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3.5 text-[15.5px]" style={{ color: "var(--ink-soft)", maxWidth: 680 }}>
                {a}
              </p>
            </details>
          ))}
        </div>

        <div
          className="relative mt-16 grid overflow-hidden rounded-3xl"
          style={{
            background: "var(--terra)",
            boxShadow: "0 24px 48px -32px rgba(232,152,94,.6)",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 32,
            alignItems: "center",
            padding: "56px 48px",
          }}
        >
          <div className="ov-ripples pointer-events-none absolute inset-0" style={{ opacity: 0.85 }} aria-hidden="true" />
          <div className="relative z-10">
            <h3
              className="mb-3"
              style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, lineHeight: 1.05, color: "#3a2615" }}
            >
              Join the private beta waitlist.
            </h3>
            <p className="mb-5 text-[17px]" style={{ color: "#5a3e26" }}>
              We&apos;re working with 25 design partners now and opening public early access in Summer
              2026. Join the waitlist to hear when Froggy is ready for your team.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="#waitlist"
                className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ background: "var(--moss-deep)", color: "var(--paper)", boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)", textDecoration: "none" }}
              >
                Join waitlist
                <svg width="13" height="13" viewBox="0 0 16 16">
                  <path
                    d="M3 8 H12 M8 4 L12 8 L8 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="#pricing"
                className="flex items-center rounded-[10px] border px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: "#a4571f", color: "#3a2615", textDecoration: "none" }}
              >
                See pricing
              </a>
            </div>
          </div>
          <div className="relative z-10 hidden h-[170px] lg:block" aria-hidden="true">
            <svg className="absolute" style={{ right: 0, top: 0, width: 170, height: 170, opacity: 0.55 }}>
              <use href="#lily-pad" />
            </svg>
            <svg className="absolute" style={{ right: 80, bottom: 0, width: 110, height: 110, opacity: 0.4 }}>
              <use href="#lily-pad" />
            </svg>
            <svg className="absolute" style={{ right: 30, bottom: 20, width: 90, height: 74 }}>
              <use href="#froggy" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Question bank", href: "#bank" },
        { label: "Rubrics", href: "#rubrics" },
        { label: "Coverage", href: "#coverage" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Private beta", href: "#waitlist" },
        { label: "Contact", href: "#waitlist" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Security", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Status", href: "#" },
        { label: "Support", href: "#" },
      ],
    },
  ];

  return (
    <footer style={{ padding: "60px 0 40px", background: "var(--paper)", borderTop: "1px solid var(--line-soft)" }}>
      <div className="mx-auto max-w-[1256px] px-7">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a
              href="#top"
              className="flex items-center gap-2.5"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--ink)", textDecoration: "none" }}
            >
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
            <p className="mt-3.5 max-w-[320px] text-sm" style={{ color: "var(--muted)" }}>
              Structured question banks, reusable rubrics, and coverage analysis for engineering
              interview loops.
            </p>
          </div>

          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h5
                className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.08em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--muted)" }}
              >
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
          <span>© 2026 Froggy Labs</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>Draft v0.4 · Updated May 2026</span>
        </div>
      </div>
    </footer>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-14 max-w-[680px] text-center">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2
        className="mb-3.5 mt-3"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(34px, 4vw, 52px)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          lineHeight: 1.06,
        }}
      >
        {title}
      </h2>
      {sub ? (
        <p className="mx-auto max-w-[560px] text-[18px]" style={{ color: "var(--ink-soft)" }}>
          {sub}
        </p>
      ) : null}
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
