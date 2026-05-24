import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Copy, MapPin, BookOpen, User, LayoutGrid, List, Eye } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paginator, usePaginated } from "@/admin/components/Paginator";
import { useAdminStore } from "@/admin/store/adminStore";
import { toast } from "react-toastify";

const FILTERS = ["All", "Requested", "Approved", "Picked Up", "Cancelled", "Scheduled", "Completed"] as const;
const PAGE_SIZE = 8;

export default function Pickups() {
  const navigate = useNavigate();
  const pickups = useAdminStore((s) => s.pickups);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const data = useMemo(() => pickups.filter((p) => {
    if (filter !== "All" && p.status !== filter) return false;
    if (q && !`${p.id} ${p.code} ${p.user} ${p.address}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [pickups, q, filter]);

  const paged = usePaginated(data, page, PAGE_SIZE);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast("Pickup code copied");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Pickup Requests</h1>
        <p className="text-sm text-muted-foreground">Coordinate book pickups from sellers' locations.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search code, seller, address…" className="h-10 rounded-xl pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
            }`}>{f}</button>
          ))}
          <div className="ml-1 inline-flex rounded-xl border border-border bg-muted/40 p-0.5">
            <button onClick={() => setView("list")} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all ${view === "list" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`} title="List">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView("grid")} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all ${view === "grid" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`} title="Grid">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <PageCard title="All Pickups" description={`${data.length} request${data.length === 1 ? "" : "s"}`} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Pickup Code</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3">Books</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/admin/pickups/${p.id}`)} className="cursor-pointer border-b border-border/40 hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{p.id}</td>
                    <td className="px-5 py-3" onClick={(e) => { e.stopPropagation(); copyCode(p.code); }}>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-1 font-mono text-xs font-bold text-primary">
                        {p.code} <Copy className="h-3 w-3" />
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{p.user}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.address}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.books}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => navigate(`/admin/pickups/${p.id}`)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">No pickups match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/50 px-4">
            <Paginator page={page} pageSize={PAGE_SIZE} total={data.length} onPageChange={setPage} />
          </div>
        </PageCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.map((p) => (
              <PageCard key={p.id} title={p.id} description={p.date} action={<StatusBadge status={p.status} />}>
                <div className="space-y-3">
                  <button onClick={() => copyCode(p.code)} className="group flex w-full items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 transition-all hover:bg-primary/10">
                    <div className="text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup code</p>
                      <p className="font-mono text-base font-bold text-primary">{p.code}</p>
                    </div>
                    <Copy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-start gap-2 text-muted-foreground"><User className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.user}</li>
                    <li className="flex items-start gap-2 text-muted-foreground"><BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.book} · {p.books} item(s)</li>
                    <li className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.address}</li>
                  </ul>
                  <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => navigate(`/admin/pickups/${p.id}`)}>
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Button>
                </div>
              </PageCard>
            ))}
          </div>
          <Paginator page={page} pageSize={PAGE_SIZE} total={data.length} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
