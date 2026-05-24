import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, BookPlus, CheckCircle2, Flag, ShoppingBag, BellOff, Truck, PackageOpen, Boxes, MessageSquareWarning } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = "user" | "listing" | "approved" | "flag" | "order" | "pickup" | "dropoff" | "inventory" | "dispute";

export type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  ts: number;
  read: boolean;
};

const ICONS: Record<NotifType, React.ComponentType<{ className?: string }>> = {
  user: UserPlus,
  listing: BookPlus,
  approved: CheckCircle2,
  flag: Flag,
  order: ShoppingBag,
  pickup: Truck,
  dropoff: PackageOpen,
  inventory: Boxes,
  dispute: MessageSquareWarning,
};

const ACCENTS: Record<NotifType, string> = {
  user: "bg-secondary/40 text-primary",
  listing: "bg-primary/10 text-primary",
  approved: "bg-success/15 text-success",
  flag: "bg-destructive/15 text-destructive",
  order: "bg-warning/15 text-warning",
  pickup: "bg-info/15 text-info",
  dropoff: "bg-secondary/40 text-primary",
  inventory: "bg-muted text-foreground",
  dispute: "bg-destructive/15 text-destructive",
};

const STORAGE_KEY = "alakowe.notifications.v2";
const SEED_KEY = "alakowe.notifications.seed";

const TEMPLATES: Omit<Notif, "id" | "ts" | "read">[] = [
  { type: "listing", title: "New listing awaiting approval", body: "A new book has been submitted by a seller and needs review." },
  { type: "pickup", title: "Seller requested pickup", body: "A pickup has been scheduled and needs an admin approval." },
  { type: "order", title: "Order confirmed", body: "Order #ORD-2026-{n} has been confirmed and paid." },
  { type: "dispute", title: "New dispute submitted", body: "A buyer opened a dispute. Please review the details." },
  { type: "inventory", title: "Book inventory updated", body: "Stock counts were synced across {n} listings." },
  { type: "dropoff", title: "Drop-off request scheduled", body: "A new drop-off has been recorded at the Yaba Hub." },
  { type: "approved", title: "Listing approved", body: "BK-{n} is now live on the marketplace." },
  { type: "flag", title: "User flagged for review", body: "A user account triggered a moderation rule." },
  { type: "user", title: "New user registered", body: "A new account just joined ALÁKÒWÉ." },
];

const now = () => Date.now();

function load(): Notif[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return [];
}
function save(items: Notif[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 60))); } catch { /* noop */ }
}

function seedFresh(count = 5): Notif[] {
  const out: Notif[] = [];
  for (let i = 0; i < count; i++) {
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const n = Math.floor(100 + Math.random() * 900);
    out.push({
      id: `N-${now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      type: tpl.type,
      title: tpl.title,
      body: tpl.body.replace(/\{n\}/g, String(n)),
      ts: now() - i * 1000 * 60 * Math.floor(Math.random() * 30 + 5),
      read: false,
    });
  }
  return out;
}

function relTime(ts: number) {
  const diff = now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * useNotifications — load from localStorage, auto-seed every 24h, expose unread count + actions.
 * Listens to a custom event so multiple components stay in sync.
 */
export function useNotifications() {
  const [items, setItems] = useState<Notif[]>(() => load());

  useEffect(() => {
    const lastSeed = Number(localStorage.getItem(SEED_KEY) || "0");
    const day = 24 * 60 * 60 * 1000;
    if (!lastSeed || now() - lastSeed > day || items.length === 0) {
      const fresh = seedFresh(5);
      const merged = [...fresh, ...items].slice(0, 60);
      save(merged);
      localStorage.setItem(SEED_KEY, String(now()));
      setItems(merged);
    }
    const handler = () => setItems(load());
    window.addEventListener("alakowe:notifications", handler);
    return () => window.removeEventListener("alakowe:notifications", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (next: Notif[]) => {
    save(next);
    setItems(next);
    window.dispatchEvent(new Event("alakowe:notifications"));
  };

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  return {
    items,
    unread,
    markAllRead: () => update(items.map((x) => ({ ...x, read: true }))),
    markRead: (id: string) => update(items.map((x) => x.id === id ? { ...x, read: true } : x)),
    clearAll: () => update([]),
  };
}

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, unread, markAllRead, markRead, clearAll } = useNotifications();

  // Mark all read shortly after opening for premium UX (badge clears)
  useEffect(() => {
    if (open && unread > 0) {
      const t = setTimeout(() => markAllRead(), 350);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display">Notifications</SheetTitle>
            {unread > 0 && (
              <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unread} new
              </span>
            )}
          </div>
          <SheetDescription className="text-xs">Live activity from across the platform.</SheetDescription>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={markAllRead} disabled={unread === 0}>
              Mark all read
            </Button>
            <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs" onClick={clearAll} disabled={items.length === 0}>
              Clear all
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <BellOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-display text-base font-semibold">All caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">You have no new notifications.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {items.map((n, i) => {
                const Icon = ICONS[n.type];
                return (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "group flex cursor-pointer gap-3 px-5 py-4 transition-colors animate-fade-in hover:bg-muted/50",
                      !n.read && "bg-secondary/10"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ACCENTS[n.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{relTime(n.ts)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
