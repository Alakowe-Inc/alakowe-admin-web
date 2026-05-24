import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AdminSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": { title: "Dashboard", subtitle: "Welcome back, here's what's happening today." },
  "/admin/users": { title: "Users", subtitle: "Manage all platform users and their access." },
  "/admin/sellers": { title: "Sellers", subtitle: "Approve, verify and monitor sellers." },
  "/admin/listings": { title: "Listings", subtitle: "Review, approve and moderate book listings." },
  "/admin/orders": { title: "Orders", subtitle: "Track every transaction across the marketplace." },
  "/admin/inventory": { title: "Inventory", subtitle: "Marketplace-wide book inventory overview." },
  "/admin/payments": { title: "Payments", subtitle: "Revenue, transactions and seller payouts." },
  "/admin/pickups": { title: "Pickup Requests", subtitle: "Schedule and approve seller pickups." },
  "/admin/drop-offs": { title: "Drop-off Books", subtitle: "Verify books dropped off at hubs." },
  "/admin/analytics": { title: "Analytics", subtitle: "Traffic, growth and conversion insights." },
  "/admin/reports": { title: "Reports", subtitle: "Export and review platform reports." },
  "/admin/settings": { title: "Settings", subtitle: "Configure platform behaviour and policies." },
  "/admin/insights": { title: "AI Insights", subtitle: "Auto-generated trends, alerts and opportunities." },
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = TITLES[pathname] ?? { title: "Admin", subtitle: "" };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[260px]"
        )}
      >
        <Topbar
          onMobileMenu={() => setMobileOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main key={pathname} className="flex-1 animate-fade-in px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
