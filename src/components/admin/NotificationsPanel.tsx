import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, BookPlus, CheckCircle2, Flag, ShoppingBag, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  type: "user" | "listing" | "approved" | "flag" | "order";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const ICONS = {
  user: UserPlus,
  listing: BookPlus,
  approved: CheckCircle2,
  flag: Flag,
  order: ShoppingBag,
} as const;

const ACCENTS: Record<Notif["type"], string> = {
  user: "bg-secondary/40 text-primary",
  listing: "bg-primary/10 text-primary",
  approved: "bg-success/15 text-success",
  flag: "bg-destructive/15 text-destructive",
  order: "bg-warning/15 text-warning",
};

const SEED: Notif[] = [
  { id: "n1", type: "user", title: "New user registered", body: "Adaeze Okonkwo just joined ALÁKÒWÉ.", time: "2m ago", read: false },
  { id: "n2", type: "listing", title: "Book listed", body: "Tunde Ojo posted Half of a Yellow Sun.", time: "8m ago", read: false },
  { id: "n3", type: "approved", title: "Listing approved", body: "BK-5503 Purple Hibiscus is now live.", time: "21m ago", read: false },
  { id: "n4", type: "flag", title: "User flagged", body: "Yusuf Bello flagged for suspicious activity.", time: "42m ago", read: true },
  { id: "n5", type: "order", title: "Order placed", body: "ORD-20489 — ₦8,400 by Folake Adeyemi.", time: "1h ago", read: true },
  { id: "n6", type: "listing", title: "Book listed", body: "Kemi Bankole posted Americanah.", time: "3h ago", read: true },
];

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [items, setItems] = useState<Notif[]>(SEED);
  const unread = items.filter((i) => !i.read).length;

  const markAll = () => setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  const clearAll = () => setItems([]);
  const toggle = (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));

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
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={markAll} disabled={unread === 0}>
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
                    onClick={() => toggle(n.id)}
                    className={cn(
                      "group flex cursor-pointer gap-3 px-5 py-4 transition-colors animate-fade-in hover:bg-muted/50",
                      !n.read && "bg-secondary/10"
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
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
                      <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
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
