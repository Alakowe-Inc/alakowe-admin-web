import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, MoreHorizontal } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminStore } from "@/admin/store/adminStore";
import { toast } from "react-toastify";

export default function Payments() {
  const navigate = useNavigate();
  const payouts = useAdminStore((s) => s.payouts);
  const markPaid = useAdminStore((s) => s.markPayoutPaid);
  const markUnsuccessful = useAdminStore((s) => s.markPayoutUnsuccessful);
  const notifySeller = useAdminStore((s) => s.notifySeller);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const STATUSES = ["All", "Pending", "Processing", "Paid", "Unsuccessful"];

  const data = payouts.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (q && !`${p.id} ${p.seller}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Payments & Payouts</h1>
        <p className="text-sm text-muted-foreground">Manage seller payouts manually until automated rails are live.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search seller or payout ID…" className="h-10 rounded-xl pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              status === s ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
            }`}>{s}</button>
          ))}
        </div>
      </div>

      <PageCard title="All Payouts" description="Click any row for full bank details" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/admin/payments/${p.id}`)} className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{p.id}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{p.seller}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.bank?.bankName}</td>
                  <td className="px-5 py-3 font-semibold text-foreground">₦{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/payments/${p.id}`)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { markPaid(p.id); toast("Payment marked as paid"); }}>Payment Made</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { markUnsuccessful(p.id); toast("Payment unsuccessful"); }}>Payment Unsuccessful</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { notifySeller(p.seller); toast(`Notified ${p.seller}`); }}>Notify Seller</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
