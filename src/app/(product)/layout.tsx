import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
import { getAppSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <WorkspaceShell
      currentUser={{
        name: session.name,
        email: session.email,
        role: session.role,
        organizationName: session.organizationName,
      }}
    >
      {session.hasWorkspaceAccess ? (
        children
      ) : (
        <div className="px-8 py-10">
          <div
            className="mx-auto max-w-2xl rounded-[28px] border p-8"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--moss)" }}>
              Access pending
            </p>
            <h1 className="mt-4 text-[30px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              You’re signed in, but this workspace has not granted access yet.
            </h1>
            <p className="mt-4 text-[15px] leading-7" style={{ color: "var(--muted)" }}>
              Froggy is invite-only right now. Ask a workspace admin to add your email to an
              organization membership, then refresh this page.
            </p>
            <form action="/auth/logout" method="post" className="mt-6">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
