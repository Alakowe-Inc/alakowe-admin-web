import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  delta: number;
  icon: LucideIcon;
  currency?: boolean;
  accent?: "primary" | "secondary" | "success" | "warning";
}

function useCountUp(target: number, duration = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

const accentMap = {
  primary: "from-primary/15 to-primary/5 text-primary",
  secondary: "from-secondary/40 to-secondary/10 text-primary",
  success: "from-success/20 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-warning",
};

export function StatCard({ label, value, delta, icon: Icon, currency, accent = "secondary" }: StatCardProps) {
  const v = useCountUp(value);
  const positive = delta >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      {/* glow */}
      <div className="absolute inset-0 bg-gradient-glow opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            {currency && "₦"}
            {v.toLocaleString()}
          </p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-border", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}%
        </span>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </div>
    </div>
  );
}
