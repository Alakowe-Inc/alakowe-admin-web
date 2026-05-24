import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  className?: string;
}

export function Paginator({ page, pageSize, total, onPageChange, className }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const pages = useMemo(() => {
    const arr: (number | "…")[] = [];
    const add = (n: number) => arr.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (safePage > 3) arr.push("…");
      const s = Math.max(2, safePage - 1);
      const e = Math.min(totalPages - 1, safePage + 1);
      for (let i = s; i <= e; i++) add(i);
      if (safePage < totalPages - 2) arr.push("…");
      add(totalPages);
    }
    return arr;
  }, [safePage, totalPages]);

  if (total === 0) return null;
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-xs", className)}>
      <span className="text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{from}–{to}</span> of <span className="font-semibold text-foreground">{total}</span>
      </span>
      <nav className="inline-flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 font-medium transition-all hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1.5 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-all",
                p === safePage
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 font-medium transition-all hover:bg-muted disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}

export function usePaginated<T>(items: T[], page: number, pageSize: number): T[] {
  return useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);
}
