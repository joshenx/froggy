"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./workspace-shell.module.css";

const navItems = [
  { href: "/roles", label: "Dashboard", icon: <HomeIcon />, match: /^\/roles(?:\/[^/]+\/flow)?$/ },
  { href: "/questions", label: "Question bank", icon: <FolderIcon />, match: /^\/(?:questions|roles\/[^/]+\/questions)(?:\/.*)?$/ },
  { href: "/companies", label: "Companies", icon: <BuildingIcon />, match: /^\/companies(?:\/.*)?$/ },
  { href: "/candidates", label: "Candidates", icon: <UserIcon />, match: /^\/(?:candidates|interviews|packets)(?:\/.*)?$/ },
  { href: "/settings/integrations", label: "Integrations", icon: <PlugIcon />, match: /^\/(?:settings\/integrations|integrations)(?:\/.*)?$/ },
] as const;

type WorkspaceShellProps = {
  children: ReactNode;
  currentUser?: {
    name: string;
    email: string;
    role?: string;
    organizationName?: string;
  };
};

export default function WorkspaceShell({ children, currentUser }: WorkspaceShellProps) {
  const pathname = usePathname();
  const initials = currentUser?.name
    .split(/\s+/)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("") || "FR";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/roles" className={styles.brand}>
          <span className={styles.brandMark}>
            <FrogMark />
          </span>
          Froggy
        </Link>

        <section>
          <p className={styles.sectionTitle}>Workspace</p>
          <div className={styles.sideList}>
            {navItems.map((item) => {
              const active = item.match.test(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.sideLink} ${active ? styles.sideActive : ""}`}
                >
                  <span className={styles.sideIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className={styles.sidebarFoot}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.whoName}>{currentUser?.name ?? "Froggy user"}</div>
            <div className={styles.whoRole}>
              {[currentUser?.organizationName, currentUser?.role?.replaceAll("_", " ")]
                .filter(Boolean)
                .join(" · ") || currentUser?.email}
            </div>
          </div>
          <form action="/auth/logout" method="post">
            <button type="submit" className={styles.signOut}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}

function FrogMark() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="11" rx="9" ry="4" fill="#7FB069" />
      <circle cx="6" cy="5" r="3" fill="#7FB069" />
      <circle cx="14" cy="5" r="3" fill="#7FB069" />
      <circle cx="6" cy="5" r="1.2" fill="#1A2B22" />
      <circle cx="14" cy="5" r="1.2" fill="#1A2B22" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8L8 2L14 8L14 13L9 13L9 9L7 9L7 13L2 13Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4A1 1 0 0 1 3 3H6L8 5H13A1 1 0 0 1 14 6V12A1 1 0 0 1 13 13H3A1 1 0 0 1 2 12V4Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 14A6 6 0 0 1 14 14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2V6M10 2V6M4 6H12V8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 12V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13V4.5L8 2L13 4.5V13M6 13V10H10V13M6 6H6.01M10 6H10.01M6 8H6.01M10 8H10.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
