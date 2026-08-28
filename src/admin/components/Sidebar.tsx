import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  Boxes,
  CreditCard,
  Truck,
  PackageOpen,
  Building2,
  BarChart3,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Coins,
  Tag,
  LayoutList,
  Layers,
  MessageSquareWarning,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "react-toastify"

const items = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },

  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Listings", to: "/admin/listings", icon: BookOpen },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Checkout Sessions", to: "/admin/checkout-sessions", icon: ShoppingCart },
  { label: "Disputes", to: "/admin/disputes", icon: MessageSquareWarning },
  { label: "Inventory", to: "/admin/inventory", icon: Boxes },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },

  { label: "Pickup Requests", to: "/admin/pickups", icon: Truck },
  { label: "Drop-off Books", to: "/admin/dropoffs/books", icon: PackageOpen },
  { label: "Drop-off Centres", to: "/admin/dropoffs/centres", icon: Building2 },

  { label: "Locations", to: "/admin/locations", icon: MapPin },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Feedback", to: "/admin/feedback", icon: MessageSquare },

  { label: "Settings", to: "/admin/settings", icon: Settings },

  // Configuration group
  { label: "Delivery Fees", to: "/admin/configuration/delivery-fees", icon: Truck },
  { label: "Platform Fees", to: "/admin/configuration/platform-fees", icon: Coins },

  // Catalogue & Discovery group
  { label: "Categories", to: "/admin/catalogue/categories", icon: Layers },
  { label: "Tags", to: "/admin/catalogue/tags", icon: Tag },
  { label: "Collections", to: "/admin/catalogue/collections", icon: LayoutList },
  { label: "Landing Page", to: "/admin/catalogue/landing-page", icon: LayoutDashboard },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground shadow-elegant transition-[width,transform] duration-300",
          collapsed ? "w-[78px]" : "w-[260px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-[68px] items-center justify-between border-b border-sidebar-border px-4">
          <Logo variant="light" collapsed={collapsed} />
          <button
            onClick={onToggle}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground/70 transition-all hover:bg-secondary hover:text-primary lg:flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-secondary text-primary shadow-glow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                  collapsed && "justify-center px-0"
                )}
              >
                {active && !collapsed && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-secondary" />
                )}
                <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground shadow-elegant group-hover:block">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-sidebar-border p-3", collapsed ? "space-y-2" : "space-y-1")}>
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-2.5 ring-1 ring-sidebar-border">
              <Avatar className="h-9 w-9 ring-2 ring-secondary/40">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">AK</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">Admin Kòwé</p>
                <p className="truncate text-[11px] text-sidebar-foreground/70">admin@alakowe.app</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="group relative mx-auto mb-1 flex justify-center">
              <Avatar className="h-9 w-9 ring-2 ring-secondary/40">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">AK</AvatarFallback>
              </Avatar>
            </div>
          )}

          <NavLink
            to="/"
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <ArrowLeft className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!collapsed && <span>Back to Site</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground shadow-elegant group-hover:block">
                Back to Site
              </span>
            )}
          </NavLink>

          <button
            onClick={() => {
              sessionStorage.removeItem("alakowe_admin_authed");
              sessionStorage.removeItem("alakowe_admin_token");
              sessionStorage.removeItem("alakowe_admin_role");
              sessionStorage.setItem("alakowe_admin_logged_out", "1");

              toast("Logged out");

              window.location.href = "/admin/login";
            }}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-destructive/15 hover:text-white",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:translate-x-0.5" />

            {!collapsed && <span>Logout</span>}

            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground shadow-elegant group-hover:block">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
