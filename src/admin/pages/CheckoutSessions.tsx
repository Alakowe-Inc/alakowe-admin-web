import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Eye, ShoppingCart } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimeRangeFilter, defaultRange, type RangeValue } from "@/admin/components/TimeRangeFilter";
import { useQuery } from "@tanstack/react-query";
import { getAdminCheckoutSessionsApi, type AdminCheckoutSessionSummaryDto } from "@/lib/api/admin/admin.api";
import { moneyInNaira } from "@/lib/utils";

const STATUSES = ["All", "Pending", "PaymentInitiated", "Paid", "Failed", "Expired"] as const;

function statusBadgeColor(status: string): string {
  switch (status) {
    case "Paid": return "bg-success/10 text-success ring-success/20";
    case "Pending": return "bg-amber-500/10 text-amber-500 ring-amber-500/20";
    case "PaymentInitiated": return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
    case "Failed": return "bg-destructive/10 text-destructive ring-destructive/20";
    case "Expired": return "bg-muted text-muted-foreground ring-border";
    default: return "bg-muted text-muted-foreground ring-border";
  }
}

export default function CheckoutSessions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<typeof STATUSES[number]>("All");
  const [range, setRange] = useState<RangeValue>(defaultRange());
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filter, query, range]);

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["admin-checkout-sessions", filter, query, range, page],
    queryFn: () => getAdminCheckoutSessionsApi({
      status: filter !== "All" ? filter : undefined,
      search: query || undefined,
      dateFrom: range.from.toISOString(),
      dateTo: range.to.toISOString(),
      page,
      pageSize: 20,
    }),
  });

  const exportCsv = () => {
    const rows = [["Session ID", "Buyer", "Email", "Orders", "Amount", "Payment Ref", "Status", "Created"], ...sessions.map((s) => [
      s.sessionGuid?.slice(0, 8) ?? "—", s.buyerName, s.buyerEmail, s.orderCount, moneyInNaira(s.totalAmount), s.paymentReference ?? "—", s.status, new Date(s.createdAt).toLocaleDateString(),
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `checkout-sessions-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Checkout Sessions</h1>
          <p className="text-sm text-muted-foreground">View all checkout sessions and their orders</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft xl:flex-row xl:items-center xl:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search session ID, buyer name or email…" className="h-10 rounded-xl pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === s ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
            }`}>{s}</button>
          ))}
          <TimeRangeFilter value={range} onChange={setRange} />
          <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <PageCard
        title="All Checkout Sessions"
        description={isLoading ? "Loading sessions..." : `${sessions.length} session${sessions.length === 1 ? "" : "s"} match your filters`}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {/* <th className="px-5 py-3">Session ID</th> */}
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Amount</th>
                {/* <th className="px-5 py-3">Payment Ref</th> */}
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading sessions...</td></tr>
              )}
              {error && !isLoading && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-destructive">Unable to load sessions.</td></tr>
              )}
              {!isLoading && !error && sessions.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">No checkout sessions match your filters.</td></tr>
              )}
              {sessions.map((s) => (
                <tr key={s.id} onClick={() => navigate(`/admin/checkout-sessions/${s.id}`)} className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                  {/* <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{(s.sessionGuid ?? "—").slice(0, 8)}...</td> */}
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{s.buyerName}</div>
                    <div className="text-xs text-muted-foreground">{s.buyerEmail}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-0.5 text-xs font-semibold text-foreground">
                      <ShoppingCart className="h-3 w-3" />
                      {s.orderCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">₦{moneyInNaira(s.totalAmount).toLocaleString()}</td>
                  {/* <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{s.paymentReference ?? "—"}</td> */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusBadgeColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => navigate(`/admin/checkout-sessions/${s.id}`)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
