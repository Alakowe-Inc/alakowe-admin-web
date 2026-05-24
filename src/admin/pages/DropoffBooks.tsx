import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, X, Eye } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paginator, usePaginated } from "@/admin/components/Paginator";
import { useAdminStore } from "@/admin/store/adminStore";
import { COVER_IMAGES } from "@/lib/covers";
import { toast } from "react-toastify";

const FILTERS = ["All", "Pending Verification", "Verified", "In Transit", "Delivered", "Rejected"] as const;

export default function DropoffBooks() {
  const navigate = useNavigate();
  const books = useAdminStore((s) => s.dropoffBooks);
  const verify = useAdminStore((s) => s.verifyDropoffBook);
  const reject = useAdminStore((s) => s.rejectDropoffBook);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [page, setPage] = useState(1);

  const data = useMemo(() => books.filter((b) => {
    if (filter !== "All" && b.status !== filter) return false;
    if (query && !`${b.book} ${b.seller} ${b.centre} ${b.id}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [books, query, filter]);
  const paged = usePaginated(data, page, 8);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Drop-off Books</h1>
        <p className="text-sm text-muted-foreground">Books delivered by sellers to partner drop-off centres.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search book, seller, centre…" className="h-10 rounded-xl pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <PageCard title="All Drop-offs" description={`${data.length} drop-off${data.length === 1 ? "" : "s"}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Centre</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">Tracking</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => {
                const cover = COVER_IMAGES[b.book];
                return (
                  <tr key={b.id} onClick={() => navigate(`/admin/dropoffs/books/${b.id}`)} className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{b.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        {cover ? <img src={cover} alt={b.book} className="h-10 w-7 rounded object-cover" />
                          : <div className="h-10 w-7 rounded bg-muted" />}
                        <span className="font-medium text-foreground">{b.book}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{b.seller}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.centre}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.condition}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{b.tracking}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.date}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        {b.status === "Pending Verification" && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { verify(b.id); toast("Verified"); }}>
                              <Check className="h-3.5 w-3.5" /> Verify
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { reject(b.id); toast("Rejected"); }}>
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => navigate(`/admin/dropoffs/books/${b.id}`)}>
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-muted-foreground">No drop-offs match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/50 px-4">
          <Paginator page={page} pageSize={8} total={data.length} onPageChange={setPage} />
        </div>
      </PageCard>
    </div>
  );
}
