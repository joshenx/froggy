import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./question-bank.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type QuestionComposerShellProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
};

export default function QuestionComposerShell({
  title,
  breadcrumbs,
  actions,
  children,
}: QuestionComposerShellProps) {
  return (
    <div className={styles.main}>
      <div className={styles.topbar}>
        <div className={styles.crumb}>
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className={styles.crumbItem}>
              {index > 0 ? <span>&rsaquo;</span> : null}
              {index === breadcrumbs.length - 1 ? (
                <span>{item.label}</span>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
          <span>&rsaquo;</span>
          <h1 className={styles.crumbTitle}>{title}</h1>
        </div>
        {actions ? <div className={styles.topbarRight}>{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}
