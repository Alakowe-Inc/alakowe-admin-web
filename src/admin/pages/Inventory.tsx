import { useMemo, useState } from "react";
import { Boxes, BookOpen, Package, AlertTriangle, Search } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatCard } from "@/admin/components/StatCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { TimeRangeFilter, defaultRange, type RangeValue } from "@/admin/components/TimeRangeFilter";
import { Paginator, usePaginated } from "@/admin/components/Paginator";
import { useAdminStore } from "@/admin/store/adminStore";
import { COVER_IMAGES } from "@/lib/covers";

const PAGE_SIZE = 8;

export default function Inventory() {
  const listings = useAdminStore((s) => s.listings);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangeValue>(defaultRange());
  const [page, setPage] = useState(1);

  const data = useMemo(() => listings.filter((l) => {
    if (query && !`${l.title} ${l.author ?? ""} ${l.seller}`.toLowerCase().includes(query.toLowerCase())) return false;
    const d = new Date(l.date).getTime();
    if (d < range.from.getTime() || d > range.to.getTime()) return false;
    return true;
  }), [listings, query, range]);

  const paged = usePaginated(data, page, PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Books" value={18203} delta={4.6} icon={Boxes} accent="primary" />
        <StatCard label="Available Now" value={14820} delta={2.1} icon={BookOpen} accent="success" />
        <StatCard label="In Transit" value={642} delta={11.3} icon={Package} accent="secondary" />
        <StatCard label="Low Stock Alerts" value={28} delta={-5.4} icon={AlertTriangle} accent="warning" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search title, author or seller…" className="h-10 rounded-xl pl-9" />
        </div>
        <TimeRangeFilter value={range} onChange={(v) => { setRange(v); setPage(1); }} />
      </div>

      <PageCard title="Inventory Snapshot" description={`${data.length} item${data.length === 1 ? "" : "s"}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Book</th>
                <th className="px-5 py-3 font-medium">Seller</th>
                <th className="px-5 py-3 font-medium">Condition</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((l) => (
                <tr key={l.id} className="border-b border-border/40 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-7 overflow-hidden rounded ring-1 ring-border">
                        {COVER_IMAGES[l.title]
                          ? <img src={COVER_IMAGES[l.title]} alt={l.title} className="h-full w-full object-cover" />
                          : <div className={`h-full w-full bg-gradient-to-br ${l.cover}`} />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{l.title}</p>
                        <p className="text-[11px] text-muted-foreground">{l.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{l.seller}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.condition}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${
                      (l.quantity ?? 1) <= 1 ? "bg-warning/10 text-warning ring-1 ring-warning/20" : "bg-muted text-foreground"
                    }`}>{l.quantity ?? 1}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">₦{l.price.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No inventory matches your filters.</td></tr>
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
