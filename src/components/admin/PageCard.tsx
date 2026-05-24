import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function PageCard({ title, description, action, children, className, bodyClassName }: PageCardProps) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            {title && <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
