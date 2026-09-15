import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, Eye, ShieldCheck, ChevronDown } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Paginator } from "@/admin/components/Paginator";
import { useAdminCustomers } from "@/lib/api/admin/admin.hooks";
import { toAdminCustomer } from "@/lib/api/admin/admin-adapter";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

interface Props { title: string; description: string; }

const DEFAULT_PAGE_SIZE = 30;
const STATUS_FILTERS = ["All", "Active", "Verified", "Flagged", "Suspended", "Banned", "Pending"] as const;

export function UsersTable({ title, description }: Props) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<typeof STATUS_FILTERS[number]>("All");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const { data: pagedResult, isLoading } = useAdminCustomers({
    ...(status !== "All" ? { Status: status } : {}),
    ...(debouncedQuery ? { Search: debouncedQuery } : {}),
    PageNumber: page,
    PageSize: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => { setPage(1); }, [debouncedQuery, status]);

  const customers = useMemo(
    () => (pagedResult?.result ?? []).map(toAdminCustomer),
    [pagedResult]
  );

  const totalCount = pagedResult?.totalCount ?? 0;
  const pageSize = pagedResult?.pageSize ?? DEFAULT_PAGE_SIZE;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name, email or ID…"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl">
                <Filter className="h-4 w-4" /> {status} <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-[10px] uppercase">Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={status} onValueChange={(v) => setStatus(v as typeof STATUS_FILTERS[number])}>
                {STATUS_FILTERS.map((f) => <DropdownMenuRadioItem key={f} value={f}>{f}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl" onClick={() => toast("Export queued")}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <PageCard title="All Users" description="Buyers and sellers across the marketplace." bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Listings</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No users match your filters.</td></tr>
              ) : customers.map((u) => (
                <tr
                  key={u.id}
                  className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40 animate-fade-in"
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-border">
                        <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">{u.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground">{u.name}</p>
                          {u.verified && <ShieldCheck className="h-3.5 w-3.5 text-info" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">{u.listingsCount}</td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => navigate(`/admin/users/${u.id}`)}>
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/60 px-4">
          <Paginator page={page} pageSize={pageSize} total={totalCount} onPageChange={setPage} />
        </div>
      </PageCard>
    </div>
  );
}
