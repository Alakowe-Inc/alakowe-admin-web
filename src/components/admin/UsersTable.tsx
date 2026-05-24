import { useState } from "react";
import { Search, Filter, Download, MoreHorizontal, Flag, Ban, ShieldCheck, Trash2, AlertTriangle, Eye } from "lucide-react";
import { PageCard } from "@/components/admin/PageCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { users, type UserRow } from "@/lib/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

type ConfirmAction = "flag" | "suspend" | "ban" | null;

interface Props {
  roleFilter?: "User" | "Seller";
  title: string;
  description: string;
}

export function UsersTable({ roleFilter, title, description }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ action: ConfirmAction; user: UserRow | null }>({
    action: null,
    user: null,
  });

  const data = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (status !== "All" && u.status !== status) return false;
    if (query && !(`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const allChecked = data.length > 0 && selected.length === data.length;
  const toggleAll = () => setSelected(allChecked ? [] : data.map((d) => d.id));
  const toggleOne = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const filters = ["All", "Active", "Verified", "Flagged", "Suspended", "Banned"];

  const confirmCopy: Record<Exclude<ConfirmAction, null>, { title: string; desc: string; cta: string; destructive?: boolean }> = {
    flag: { title: "Flag this user?", desc: "They'll be marked for admin review. You can unflag at any time.", cta: "Flag user" },
    suspend: { title: "Suspend this user?", desc: "They'll lose access until you reinstate the account.", cta: "Suspend", destructive: true },
    ban: { title: "Ban this user?", desc: "This is permanent. The user will be removed from the platform.", cta: "Ban user", destructive: true },
  };

  const runConfirm = () => {
    if (!confirm.action || !confirm.user) return;
    const map = { flag: "flagged", suspend: "suspended", ban: "banned" } as const;
    toast(`User ${map[confirm.action]}`);
    setConfirm({ action: null, user: null });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or ID…"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 md:flex">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  status === f
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary/50 bg-secondary/20 px-4 py-3 shadow-soft animate-fade-in">
          <p className="text-sm font-semibold text-primary">
            {selected.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Warn</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Approve</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5"><Flag className="h-3.5 w-3.5" /> Suspend</Button>
            <Button size="sm" variant="destructive" className="h-8 gap-1.5"><Ban className="h-3.5 w-3.5" /> Ban</Button>
          </div>
        </div>
      )}

      <PageCard title={title} description={description} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Books</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u: UserRow) => (
                <tr key={u.id} className="border-b border-border/40 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3"><Checkbox checked={selected.includes(u.id)} onCheckedChange={() => toggleOne(u.id)} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-border">
                        <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">{u.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${u.role === "Seller" ? "bg-secondary/40 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{u.books || "—"}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{u.orders}</td>
                  <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => toast("Opening profile")}>
                          <Eye className="mr-2 h-4 w-4" /> View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Marked verified")}>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Mark verified
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirm({ action: "flag", user: u })}>
                          <Flag className="mr-2 h-4 w-4" /> Flag user
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Warning sent")}>
                          <AlertTriangle className="mr-2 h-4 w-4" /> Send warning
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-warning" onClick={() => setConfirm({ action: "suspend", user: u })}>
                          <Ban className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirm({ action: "ban", user: u })}>
                          <Trash2 className="mr-2 h-4 w-4" /> Ban
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {data.length} of {users.length} {roleFilter ? roleFilter.toLowerCase() + "s" : "users"}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">Previous</Button>
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">Next</Button>
          </div>
        </div>
      </PageCard>

      <AlertDialog open={!!confirm.action} onOpenChange={(o) => !o && setConfirm({ action: null, user: null })}>
        <AlertDialogContent>
          {confirm.action && confirm.user && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirmCopy[confirm.action].title}</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-semibold text-foreground">{confirm.user.name}</span> · {confirm.user.email}
                  <br />
                  {confirmCopy[confirm.action].desc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={runConfirm}
                  className={confirmCopy[confirm.action].destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                >
                  {confirmCopy[confirm.action].cta}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
