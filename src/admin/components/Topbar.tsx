import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsPanel, useNotifications } from "./NotificationsPanel";

interface TopbarProps {
  onMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export function Topbar({ onMobileMenu, title, subtitle }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { unread } = useNotifications();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden flex-col md:flex">
          <h1 className="font-display text-xl font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <GlobalSearch />

          <button
            onClick={() => setNotifOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:text-foreground hover:shadow-soft"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-sm">
            <Avatar className="h-8 w-8 ring-2 ring-secondary">
              <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">AK</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-semibold text-foreground">Akin O.</span>
              <Badge variant="outline" className="h-4 w-fit border-secondary/40 bg-secondary/20 px-1.5 text-[9px] font-semibold text-primary">
                SUPER ADMIN
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
    </header>
  );
}
