import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Copy, MapPin, User, BookOpen, Truck, Calendar, Check, X, RotateCcw } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { AdminNotes } from "@/admin/components/AdminNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminStore } from "@/admin/store/adminStore";
import { toast } from "react-toastify";

export default function PickupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pickup = useAdminStore((s) => s.pickups.find((p) => p.id === id));
  const seller = useAdminStore((s) => s.users.find((u) => u.name === pickup?.user));
  const markPicked = useAdminStore((s) => s.markPickedUp);
  const cancel = useAdminStore((s) => s.cancelPickup);
  const approve = useAdminStore((s) => s.approvePickup);
  const [reschedule, setReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");

  if (!pickup) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/pickups")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Pickup not found" />
      </div>
    );
  }

  const copyCode = () => { navigator.clipboard?.writeText(pickup.code); toast("Pickup code copied"); };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/pickups")} className="w-fit gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Pickups
        </Button>
        <div className="flex flex-wrap gap-2">
          {pickup.status === "Requested" && (
            <Button size="sm" onClick={() => { approve(pickup.id); toast("Pickup approved"); }}>
              <Check className="mr-1.5 h-4 w-4" /> Approve
            </Button>
          )}
          {pickup.status !== "Picked Up" && pickup.status !== "Cancelled" && pickup.status !== "Completed" && (
            <Button size="sm" variant="outline" onClick={() => { markPicked(pickup.id); toast("Marked as picked up"); }}>
              <Truck className="mr-1.5 h-4 w-4" /> Picked Up
            </Button>
          )}
          {pickup.status !== "Cancelled" && pickup.status !== "Completed" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setReschedule(true)}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Reschedule
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { cancel(pickup.id); toast("Pickup cancelled"); }}>
                <X className="mr-1.5 h-4 w-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <PageCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">Pickup {pickup.id}</h2>
              <StatusBadge status={pickup.status} />
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Scheduled {new Date(pickup.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
          <button onClick={copyCode} className="group inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3.5 py-2 transition-all hover:bg-primary/10">
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup Code</p>
              <p className="font-mono text-lg font-bold text-primary">{pickup.code}</p>
            </div>
            <Copy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>
        </div>
      </PageCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PageCard title="Seller">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold text-primary">
                {pickup.user.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                {seller ? (
                  <Link to={`/admin/users/${seller.id}`} className="font-semibold text-foreground hover:text-primary">{pickup.user}</Link>
                ) : <p className="font-semibold text-foreground">{pickup.user}</p>}
                {seller?.email && <p className="text-xs text-muted-foreground">{seller.email}</p>}
              </div>
            </div>
          </PageCard>

          <div className="grid gap-5 md:grid-cols-2">
            <PageCard title="Pickup Address">
              <p className="inline-flex items-start gap-2 text-sm text-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {pickup.address}</p>
            </PageCard>
            <PageCard title="Book Info">
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2 text-foreground"><BookOpen className="h-4 w-4 text-primary" /> {pickup.book}</li>
                <li className="flex items-center gap-2 text-muted-foreground"><User className="h-3.5 w-3.5" /> {pickup.books} item(s)</li>
                <li className="text-xs text-muted-foreground">Rider: <span className="font-medium text-foreground">{pickup.rider}</span></li>
              </ul>
            </PageCard>
          </div>

          <PageCard title="Pickup Timeline">
            <ol className="space-y-3 border-l border-border/70 pl-4">
              {(pickup.timeline ?? []).slice().reverse().map((t, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <p className="text-sm font-medium">{t.text}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(t.ts).toLocaleString()}</p>
                </li>
              ))}
              {(pickup.timeline ?? []).length === 0 && <p className="text-xs text-muted-foreground">No timeline events.</p>}
            </ol>
          </PageCard>
        </div>

        <AdminNotes entityId={`pickup:${pickup.id}`} />
      </div>

      <Dialog open={reschedule} onOpenChange={setReschedule}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reschedule pickup</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>New pickup date</Label>
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedule(false)}>Cancel</Button>
            <Button onClick={() => { setReschedule(false); toast("Pickup rescheduled"); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
