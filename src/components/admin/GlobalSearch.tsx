import { useEffect, useMemo, useRef, useState } from "react";
import { Search, User, Store, BookOpen, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { users, listings, orders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  label: string;
  hint: string;
  group: "Users" | "Sellers" | "Books" | "Orders";
  to: string;
};

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-secondary/60 px-0.5 text-primary">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const ICONS = { Users: User, Sellers: Store, Books: BookOpen, Orders: ShoppingBag } as const;

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: Result[] = [];
    users
      .filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.id.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach((u) =>
        out.push({
          id: u.id,
          label: u.name,
          hint: `${u.email} · ${u.id}`,
          group: u.role === "Seller" ? "Sellers" : "Users",
          to: u.role === "Seller" ? "/sellers" : "/users",
        })
      );
    listings
      .filter((l) => l.title.toLowerCase().includes(query) || l.seller.toLowerCase().includes(query) || l.id.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach((l) => out.push({ id: l.id, label: l.title, hint: `by ${l.seller} · ₦${l.price.toLocaleString()}`, group: "Books", to: "/listings" }));
    orders
      .filter((o) => o.id.toLowerCase().includes(query) || o.buyer.toLowerCase().includes(query) || o.book.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach((o) => out.push({ id: o.id, label: o.id, hint: `${o.buyer} · ${o.book}`, group: "Orders", to: "/orders" }));
    return out;
  }, [q]);

  useEffect(() => setActive(0), [q]);

  const groups = useMemo(() => {
    const g: Record<string, Result[]> = {};
    results.forEach((r) => ((g[r.group] ||= []).push(r)));
    return g;
  }, [results]);

  const flat = results;

  const go = (r: Result) => {
    setOpen(false);
    setQ("");
    navigate(r.to);
  };

  return (
    <div ref={ref} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, flat.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && flat[active]) {
            go(flat[active]);
          }
        }}
        placeholder="Search users, orders, books…"
        className="h-10 w-[280px] rounded-xl border-border bg-card pl-9 text-sm shadow-sm transition-all focus-visible:w-[360px] focus-visible:ring-secondary/60 lg:w-[340px]"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-block">
        ⌘K
      </kbd>

      {open && q && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-elegant animate-fade-in">
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for <span className="font-semibold text-foreground">"{q}"</span>
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => {
              const Icon = ICONS[group as keyof typeof ICONS];
              return (
                <div key={group} className="px-1 py-1.5">
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  {items.map((r) => {
                    const isActive = flat.indexOf(r) === active;
                    return (
                      <button
                        key={r.group + r.id}
                        onMouseEnter={() => setActive(flat.indexOf(r))}
                        onClick={() => go(r)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                          isActive ? "bg-secondary/30" : "hover:bg-muted/60"
                        )}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{highlight(r.label, q)}</p>
                          <p className="truncate text-xs text-muted-foreground">{highlight(r.hint, q)}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
