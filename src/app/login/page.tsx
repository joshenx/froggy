import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/login-form";
import { getAppSession, getDevUsers } from "@/lib/auth/session";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAppSession();
  const { next } = await searchParams;
  const nextHref = next?.startsWith("/") ? next : "/questions";

  if (session?.hasWorkspaceAccess) {
    redirect(nextHref);
  }

  const supabaseAuthEnabled = isSupabaseAuthConfigured();
  const devUsers = getDevUsers();

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section
          className="rounded-[30px] border p-8 sm:p-10"
          style={{ borderColor: "var(--line)", background: "linear-gradient(160deg, var(--paper), var(--cream-2))" }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: "var(--moss)" }}
          >
            Invite-only beta
          </p>
          <h1
            className="mt-4 text-[34px] font-semibold leading-tight sm:text-[42px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in to the Froggy workspace
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7" style={{ color: "var(--muted)" }}>
            Landing pages stay public. Product routes are locked to invited workspace members so
            interview flows, question banks, and candidate packets stay private.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Question bank" value="Tagged" />
            <Metric label="Flows" value="Saved" />
            <Metric label="Candidates" value="Private" />
          </div>
        </section>

        <section
          className="rounded-[30px] border p-8 sm:p-10"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <h2 className="text-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {supabaseAuthEnabled ? "Use your invited work email" : "Local workspace access"}
          </h2>
          <p className="mt-2 text-[14px]" style={{ color: "var(--muted)" }}>
            {supabaseAuthEnabled
              ? "We’ll send a magic link. After sign-in, Froggy checks your workspace membership before opening the product."
              : "Supabase auth is not configured locally, so the app exposes seeded workspace personas for development and testing."}
          </p>

          <div className="mt-8">
            {supabaseAuthEnabled ? (
              <LoginForm next={nextHref} />
            ) : (
              <div className="grid gap-3">
                {devUsers.map((user) => (
                  <form key={user.id} action="/auth/dev-login" method="post" className="grid gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="next" value={nextHref} />
                    <button
                      type="submit"
                      className="flex items-center justify-between rounded-2xl border px-4 py-4 text-left"
                      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{user.name}</span>
                        <span className="block text-xs" style={{ color: "var(--muted)" }}>
                          {user.organizationName} · {user.role.replaceAll("_", " ")}
                        </span>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                        Continue
                      </span>
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[18px] border px-4 py-4"
      style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-[22px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}
