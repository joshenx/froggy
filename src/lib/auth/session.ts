import { cookies } from "next/headers";
import { createInitialMvpStore } from "@/lib/mvp/seed";
import type { UserRole } from "@/lib/mvp/types";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DEV_AUTH_COOKIE = "froggy-dev-user";

const devStore = createInitialMvpStore();

export type AppSession = {
  mode: "dev" | "supabase";
  userId: string;
  email: string;
  name: string;
  role?: UserRole;
  organizationId?: string;
  organizationName?: string;
  hasWorkspaceAccess: boolean;
};

export function getDevUsers() {
  return devStore.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName:
      devStore.organizations.find((organization) => organization.id === user.orgId)?.name ??
      "Froggy Labs",
  }));
}

export async function getAppSession(): Promise<AppSession | null> {
  if (!isSupabaseAuthConfigured()) {
    const cookieStore = await cookies();
    const userId = cookieStore.get(DEV_AUTH_COOKIE)?.value;
    if (!userId) {
      return null;
    }

    const user = devStore.users.find((candidate) => candidate.id === userId);
    if (!user) {
      return null;
    }

    const organization = devStore.organizations.find((candidate) => candidate.id === user.orgId);
    return {
      mode: "dev",
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: organization?.id,
      organizationName: organization?.name,
      hasWorkspaceAccess: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("role, organization:organizations(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const organizationRaw =
    membership && typeof membership.organization === "object" && membership.organization !== null
      ? membership.organization
      : null;
  const organization = Array.isArray(organizationRaw) ? organizationRaw[0] : organizationRaw;

  return {
    mode: "supabase",
    userId: user.id,
    email: user.email ?? "",
    name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      user.email ||
      "Froggy user",
    role: membership?.role as UserRole | undefined,
    organizationId: organization?.id,
    organizationName: organization?.name,
    hasWorkspaceAccess: Boolean(membership && organization),
  };
}
