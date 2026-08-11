import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Flag, AlertTriangle, Ban, Trash2, Mail, Phone,
  MapPin, Calendar, Store, BookOpen, ShoppingBag, FileText, Activity,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { useAdminStore } from "@/admin/store/adminStore";
import {
  useAdminCustomer, useVerifyCustomer, useFlagCustomer,
  useWarnCustomer, useSuspendCustomer, useBanCustomer,
} from "@/lib/api/admin/admin.hooks";
import { toAdminCustomerDetail } from "@/lib/api/admin/admin-adapter";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

export default function UserProfile() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const listings = useAdminStore((s) => s.listings);
  const orders = useAdminStore((s) => s.orders);
  const requests = useAdminStore((s) => s.requests);

  const { data: detail, isLoading } = useAdminCustomer(Number(id));
  const verify = useVerifyCustomer();
  const flag = useFlagCustomer();
  const warn = useWarnCustomer();
  const suspend = useSuspendCustomer();
  const ban = useBanCustomer();

  const user = useMemo(() => (detail ? toAdminCustomerDetail(detail) : null), [detail]);

  const [warnOpen, setWarnOpen] = useState(false);
  const [warnText, setWarnText] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);
  const [banOpen, setBanOpen] = useState(false);

  const userListings = useMemo(() => user ? listings.filter((l) => l.seller === user.name) : [], [user, listings]);
  const sales = useMemo(() => user ? orders.filter((o) => o.seller === user.name) : [], [user, orders]);
  const purchases = useMemo(() => user ? orders.filter((o) => o.buyer === user.name) : [], [user, orders]);
  const userRequests = useMemo(() => user ? requests.filter((r) => r.user === user.name) : [], [user, requests]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Loading user…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/admin/users">Back to users</Link></Button>
      </div>
    );
  }

  const storeUrl = `/store/${user.email}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <PageCard>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-secondary/40">
              <AvatarFallback className="bg-gradient-primary text-xl font-bold text-primary-foreground">{user.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-foreground">{user.name}</h2>
                {user.verified && <ShieldCheck className="h-5 w-5 text-info" />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={user.status} />
                <span className="text-xs text-muted-foreground"><Calendar className="mr-1 inline h-3 w-3" /> Joined {user.joined}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!user.verified && (
              <Button variant="outline" size="sm" onClick={() => { verify.mutate(Number(user.id)); toast("Verified"); }}>
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Verify
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => { flag.mutate(Number(user.id)); toast("Flagged"); }}>
              <Flag className="mr-1.5 h-4 w-4" /> Flag
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWarnOpen(true)}>
              <AlertTriangle className="mr-1.5 h-4 w-4" /> Warn
            </Button>
            <Button variant="outline" size="sm" className="text-warning" onClick={() => setSuspendOpen(true)}>
              <Ban className="mr-1.5 h-4 w-4" /> Suspend
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBanOpen(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Ban
            </Button>
          </div>
        </div>
      </PageCard>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Listings" value={user.listingsCount} icon={BookOpen} />
        <Stat label="Total Sales" value={user.salesCount} icon={Store} />
        <Stat label="Total Purchases" value={user.purchasesCount} icon={ShoppingBag} />
        <Stat label="Total Requests" value={user.requestsCount} icon={FileText} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PageCard title="Profile" description="Contact and account details" className="lg:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            <Info icon={Mail} label="Email" value={user.email} />
            <Info icon={Phone} label="Phone" value={user.phone || "—"} />
            <Info icon={MapPin} label="Address" value={user.address || "—"} />
            <Info icon={Store} label="Bookstore" value={
              <Link to={storeUrl} className="text-primary hover:underline">{storeUrl}</Link>
            } />
            <Info icon={Calendar} label="Joined" value={user.joined} />
            <Info icon={Activity} label="Last active" value={user.lastActive ? new Date(user.lastActive).toLocaleString() : "—"} />
          </ul>
          {user.bio && <p className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">{user.bio}</p>}
        </PageCard>

        <PageCard title="Moderation" description="Warnings and suspensions">
          {(user.warnings?.length ?? 0) === 0 && (user.suspensionHistory?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No moderation history.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.warnings?.map((w, i) => (
                <li key={`w${i}`} className="rounded-lg border border-warning/30 bg-warning/5 p-2">
                  <span className="font-semibold text-warning">Warning</span> · {w.date} — {w.reason}
                </li>
              ))}
              {user.suspensionHistory?.map((w, i) => (
                <li key={`s${i}`} className="rounded-lg border border-destructive/30 bg-destructive/5 p-2">
                  <span className="font-semibold text-destructive">Suspended</span> · {w.date} ({w.durationDays}d) — {w.reason}
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Order history</TabsTrigger>
          <TabsTrigger value="requests">Request history</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="activity">Activity timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-3">
          <PageCard bodyClassName="p-0">
            <SimpleTable
              empty="No orders yet."
              rows={[...sales, ...purchases].sort((a, b) => b.date.localeCompare(a.date)).map((o) => ({
                key: o.id,
                onClick: () => navigate(`/admin/orders/${o.id}`),
                cells: [o.id, o.book, `₦${o.amount.toLocaleString()}`, o.status, o.date],
              }))}
              headers={["Order", "Book", "Amount", "Status", "Date"]}
            />
          </PageCard>
        </TabsContent>
        <TabsContent value="requests" className="mt-3">
          <PageCard bodyClassName="p-0">
            <SimpleTable
              empty="No requests submitted."
              headers={["Request", "Title", "Category", "Status", "Date"]}
              rows={userRequests.map((r) => ({
                key: r.id,
                cells: [r.id, r.title, r.category, r.status, r.date],
              }))}
            />
          </PageCard>
        </TabsContent>
        <TabsContent value="listings" className="mt-3">
          <PageCard bodyClassName="p-0">
            <SimpleTable
              empty="No listings yet."
              headers={["ID", "Title", "Price", "Condition", "Status", "Date"]}
              rows={userListings.map((l) => ({
                key: l.id,
                onClick: () => navigate(`/admin/listings/${l.id}`),
                cells: [l.id, l.title, `₦${l.price.toLocaleString()}`, l.condition, l.status, l.date],
              }))}
            />
          </PageCard>
        </TabsContent>
        <TabsContent value="activity" className="mt-3">
          <PageCard>
            <ol className="relative space-y-3 border-l border-border/70 pl-4">
              {[
                { ts: user.lastActive, text: "Last active on the marketplace" },
                ...sales.slice(0, 3).map((o) => ({ ts: o.date, text: `Sold ${o.book} (₦${o.amount.toLocaleString()})` })),
                ...purchases.slice(0, 3).map((o) => ({ ts: o.date, text: `Purchased ${o.book}` })),
                ...userListings.slice(0, 3).map((l) => ({ ts: l.date, text: `Listed ${l.title}` })),
                { ts: user.joined, text: "Joined ALÁKÒWÉ" },
              ].filter((x) => x.ts).map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-foreground">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.ts ? new Date(a.ts).toLocaleString() : ""}</p>
                </li>
              ))}
            </ol>
          </PageCard>
        </TabsContent>
      </Tabs>

      {/* Warning modal */}
      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send warning to {user.name}</DialogTitle>
            <DialogDescription>This will be added to the user's moderation history.</DialogDescription>
          </DialogHeader>
          <Textarea value={warnText} onChange={(e) => setWarnText(e.target.value)} placeholder="Reason…" className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              warn.mutate({ id: Number(user.id), reason: warnText || "Policy reminder" });
              toast("Warning sent");
              setWarnOpen(false); setWarnText("");
            }}>Send warning</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend modal */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend {user.name}</DialogTitle>
            <DialogDescription>Specify a reason and duration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="mt-1.5 min-h-[80px]" />
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input type="number" min={1} value={suspendDays} onChange={(e) => setSuspendDays(+e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              suspend.mutate({ id: Number(user.id), reason: suspendReason || "Policy violation", durationDays: suspendDays });
              toast("Suspended");
              setSuspendOpen(false); setSuspendReason("");
            }}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban confirm */}
      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently disables the account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { ban.mutate(Number(user.id)); toast("Banned"); setBanOpen(false); }}
            >Ban user</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/30 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </li>
  );
}

function SimpleTable({ headers, rows, empty }: {
  headers: string[];
  rows: { key: string; cells: React.ReactNode[]; onClick?: () => void }[];
  empty: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            {headers.map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</td></tr>
          ) : rows.map((r) => (
            <tr key={r.key}
              onClick={r.onClick}
              className={`border-b border-border/40 transition-colors ${r.onClick ? "cursor-pointer hover:bg-muted/40" : ""}`}>
              {r.cells.map((c, i) => <td key={i} className="px-5 py-3 text-sm">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
