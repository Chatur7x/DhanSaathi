"use client";

import type { LucideIcon } from "lucide-react";

/** Minimal, consistent page header: eyebrow → title → subtitle. */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  right,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon size={19} className="text-primary" />
        </div>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="text-xl font-semibold tracking-tight mt-0.5">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2.5 shrink-0">{right}</div>}
    </div>
  );
}
