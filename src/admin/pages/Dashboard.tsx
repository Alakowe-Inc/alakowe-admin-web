import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, ShoppingBag, DollarSign, MailQuestion, ArrowUpRight, Eye,
} from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/admin/store/adminStore";
import { COVER_IMAGES } from "@/lib/covers";

export default function Dashboard() {
  const navigate = useNavigate();
  const orders = useAdminStore((s) => s.orders);
  const listings = useAdminStore((s) => s.listings);
  const payouts = useAdminStore((s) => s.payouts);
  const requests = useAdminStore((s) => s.requests);

  const pendingListings = useMemo(() => listings.filter((l) => l.status === "Pending").length, [listings]);
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "Paid" || o.status === "Processing" || o.status === "Confirmed").length, [orders]);
  const pendingPayouts = useMemo(() => payouts.filter((p) => p.status === "Pending" || p.status === "Processing").length, [payouts]);
  const unmatched = useMemo(() => requests.filter((r) => r.status === "Open").length, [requests]);

  const tiles = [
    { key: "listings", label: "Pending Listings", value: pendingListings, sub: "awaiting review", icon: BookOpen, tone: "warning", to: "/admin/listings?status=Pending" },
    { key: "orders", label: "Pending Orders", value: pendingOrders, sub: "need fulfilment", icon: ShoppingBag, tone: "info", to: "/admin/orders?filter=waiting" },
    { key: "payouts", label: "Pending Payouts", value: pendingPayouts, sub: "ready for release", icon: DollarSign, tone: "primary", to: "/admin/payments" },
    { key: "requests", label: "Unmatched Requests", value: unmatched, sub: "open book requests", icon: MailQuestion, tone: "success", to: "/admin/insights?filter=open" },
  ] as const;

  const recentOrders = orders.slice(0, 6);
  const recentListings = [...listings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const toneClass = (t: string) =>
    t === "warning" ? "bg-warning/15 text-warning"
    : t === "info" ? "bg-info/10 text-info"
    : t === "primary" ? "bg-primary/10 text-primary"
    : "bg-success/15 text-success";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">Everything that needs your attention right now.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <button
            key={t.key}
            onClick={() => navigate(t.to)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass(t.tone)}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-bold text-foreground">{t.value}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PageCard
          title="Recent Orders"
          description="Latest activity on the marketplace"
          action={<Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/orders")}>View all →</Button>}
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{o.id}</td>
                    <td className="px-5 py-3 text-foreground">{o.buyer}</td>
                    <td className="px-5 py-3 font-semibold">₦{o.amount.toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Eye className="h-3.5 w-3.5" /> View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>

        <PageCard
          title="Recent Listings"
          description="Newest books submitted by sellers"
          action={<Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/listings")}>View all →</Button>}
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Condition</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentListings.map((l) => {
                  const cover = COVER_IMAGES[l.title];
                  return (
                    <tr key={l.id} onClick={() => navigate(`/admin/listings/${l.id}`)}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {cover ? <img src={cover} alt={l.title} className="h-10 w-7 rounded object-cover" />
                            : <div className="h-10 w-7 rounded bg-muted" />}
                          <span className="font-medium text-foreground">{l.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{l.seller}</td>
                      <td className="px-5 py-3 text-muted-foreground">{l.condition}</td>
                      <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{l.location}</td>
                      <td className="px-5 py-3 text-muted-foreground">{l.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PageCard>
      </div>
    </div>
  );
}
