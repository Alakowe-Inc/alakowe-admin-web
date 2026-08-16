import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Download, Eye, MessageSquareWarning } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimeRangeFilter, defaultRange, type RangeValue } from "@/admin/components/TimeRangeFilter";
import { Paginator, usePaginated } from "@/admin/components/Paginator";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getAdminDisputesApi, type AdminDisputeResponse } from "@/lib/api/admin/admin.api";
import { moneyInNaira } from "@/lib/utils";

const STATUSES = ["All", "Open", "UnderReview", "Resolved", "Rejected", "Closed"] as const;
const PAGE_SIZE = 8;

function slaLabel(d: AdminDisputeResponse): string {
  if (d.status === "Resolved" || d.status === "Rejected" || d.status === "Closed") return "—";
  const due = d.dueAt ? new Date(d.dueAt).getTime() : NaN;
  if (Number.isNaN(due)) return "—";
  const hrs = Math.ceil((due - Date.now()) / 3600000);
  if (hrs < 0) return "Overdue";
  if (hrs < 48) return `${hrs}h left`;
  return `${Math.floor(hrs / 24)}d left`;
}

export default function Disputes() {
  const navigate = useNavigate();
  const { data: disputes = [], isLoading, error } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => getAdminDisputesApi(),
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<typeof STATUSES[number]>(
    searchParams.get("filter") === "open" ? "Open" : "All"
  );
  const [range, setRange] = useState<RangeValue>(defaultRange());
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filter, query, range]);

  useEffect(() => {
    if (searchParams.get("filter") === "open") setFilter("Open");
  }, [searchParams]);

  const updateFilter = (f: typeof STATUSES[number]) => {
    setFilter(f);
    if (f === "Open") searchParams.set("filter", "open");
    else searchParams.delete("filter");
    setSearchParams(searchParams, { replace: true });
  };

  const openCount = disputes.filter((d) => d.status === "Open").length;

  const data = useMemo(() => disputes.filter((d) => {
    if (filter !== "All" && d.status !== filter) return false;
    const searchable = `${d.disputeNumber} ${d.orderNumber} ${d.filedBy ?? ""} ${d.sellerName ?? ""} ${d.bookTitle ?? ""} ${d.reason ?? ""}`.toLowerCase();
    if (query && !searchable.includes(query.toLowerCase())) return false;
    const filed = d.filedAt ? new Date(d.filedAt).getTime() : 0;
    if (filed < range.from.getTime() || filed > range.to.getTime()) return false;
    return true;
  }), [disputes, filter, query, range]);

  const paged = usePaginated(data, page, PAGE_SIZE);

  const exportCsv = () => {
    const rows = [["Dispute", "Order", "Buyer", "Seller", "Book", "Amount", "Status", "Filed"], ...data.map((d) => [
      d.disputeNumber, d.orderNumber, d.filedBy, d.sellerName, d.bookTitle, moneyInNaira(d.amount), d.status, d.filedAt?.slice(0, 10),
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `disputes-${Date.now()}.csv`; a.click();
    toast("Export ready");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Review buyer disputes on delivered orders and resolve the escrow.
            {openCount > 0 && (
              <span className="ml-2 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-semibold text-destructive ring-1 ring-destructive/30">
                {openCount} awaiting review
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft xl:flex-row xl:items-center xl:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dispute, order, buyer, seller or book…" className="h-10 rounded-xl pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => updateFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === s ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
            }`}>{s}</button>
          ))}
          <TimeRangeFilter value={range} onChange={setRange} />
          <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <PageCard
        title="All Disputes"
        description={isLoading ? "Loading disputes..." : `${data.length} dispute${data.length === 1 ? "" : "s"} match your filters`}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Dispute</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Filed</th>
                <th className="px-5 py-3">SLA</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading disputes...</td></tr>
              )}
              {error && !isLoading && (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-destructive">Unable to load disputes.</td></tr>
              )}
              {paged.map((d) => (
                <tr key={d.disputeNumber} onClick={() => navigate(`/admin/disputes/${encodeURIComponent(d.orderNumber ?? "")}`)} className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{d.disputeNumber}</td>
                  <td className="px-5 py-3 font-mono text-xs text-foreground">{d.orderNumber}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{d.filedBy}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.sellerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.bookTitle ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-foreground">₦{moneyInNaira(d.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.filedAt ? new Date(d.filedAt).toLocaleDateString() : "—"}</td>
                  <td className={`px-5 py-3 text-xs font-semibold ${slaLabel(d) === "Overdue" ? "text-destructive" : "text-muted-foreground"}`}>{slaLabel(d)}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status ?? "Open"} /></td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => navigate(`/admin/disputes/${encodeURIComponent(d.orderNumber ?? "")}`)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && data.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center">
                    <MessageSquareWarning className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No disputes match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/50 px-4">
          <Paginator page={page} pageSize={PAGE_SIZE} total={data.length} onPageChange={setPage} />
        </div>
      </PageCard>
    </div>
  );
}
