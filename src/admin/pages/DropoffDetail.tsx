import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, BookOpen, User, Hash, Check, X, Building2 } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { AdminNotes } from "@/admin/components/AdminNotes";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/admin/store/adminStore";
import { COVER_IMAGES } from "@/lib/covers";
import { toast } from "react-toastify";

const STAGES = ["Pending Verification", "Verified", "In Transit", "Delivered"] as const;

export default function DropoffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const drop = useAdminStore((s) => s.dropoffBooks.find((d) => d.id === id));
  const seller = useAdminStore((s) => s.users.find((u) => u.name === drop?.seller));
  const centre = useAdminStore((s) => s.dropoffCentres.find((c) => c.id === drop?.centreId));
  const verify = useAdminStore((s) => s.verifyDropoffBook);
  const reject = useAdminStore((s) => s.rejectDropoffBook);

  if (!drop) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/dropoffs/books")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Drop-off not found" />
      </div>
    );
  }

  const cover = COVER_IMAGES[drop.book];
  const stageIdx = drop.status === "Rejected" ? -1 : Math.max(0, STAGES.indexOf(drop.status as typeof STAGES[number]));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/dropoffs/books")} className="w-fit gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Drop-offs
        </Button>
        <div className="flex flex-wrap gap-2">
          {drop.status === "Pending Verification" && (
            <>
              <Button size="sm" onClick={() => { verify(drop.id); toast("Drop-off verified"); }}>
                <Check className="mr-1.5 h-4 w-4" /> Verify
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { reject(drop.id); toast("Drop-off rejected"); }}>
                <X className="mr-1.5 h-4 w-4" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <PageCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">Drop-off {drop.id}</h2>
              <StatusBadge status={drop.status} />
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {new Date(drop.date).toLocaleDateString()}
              <span>·</span><Hash className="h-3.5 w-3.5" /> {drop.tracking}
            </p>
          </div>
        </div>

        {/* Delivery progress */}
        <div className="mt-5 -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-[480px] items-start gap-1 px-1">
            {STAGES.map((s, i) => {
              const done = stageIdx > i;
              const active = stageIdx === i && drop.status !== "Rejected";
              const rejected = drop.status === "Rejected";
              return (
                <div key={s} className="flex flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      rejected ? "bg-destructive/10 text-destructive ring-2 ring-destructive/30" :
                      done ? "bg-success text-white shadow-soft" :
                      active ? "bg-primary text-primary-foreground shadow-glow ring-4 ring-primary/20 scale-110" :
                      "bg-muted text-muted-foreground"
                    }`}>{done ? <Check className="h-4 w-4" /> : i + 1}</div>
                    <p className={`mt-2 text-[11px] font-semibold ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`mt-[18px] h-0.5 flex-1 ${rejected ? "bg-destructive/20" : done ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <PageCard title="Book">
            <div className="flex flex-col gap-4 sm:flex-row">
              {cover ? <img src={cover} alt={drop.book} className="aspect-[3/4] w-full max-w-[140px] rounded-xl object-cover shadow-soft" />
                : <div className="aspect-[3/4] w-full max-w-[140px] rounded-xl bg-muted" />}
              <div className="flex-1 space-y-2">
                <p className="font-display text-lg font-bold text-foreground">{drop.book}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Condition: <span className="font-medium text-foreground">{drop.condition}</span></li>
                  <li className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Tracking: <span className="font-mono font-medium text-foreground">{drop.tracking}</span></li>
                </ul>
              </div>
            </div>
          </PageCard>

          <div className="grid gap-5 md:grid-cols-2">
            <PageCard title="Seller">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold text-primary">
                  {drop.seller.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  {seller ? (
                    <Link to={`/admin/users/${seller.id}`} className="font-semibold text-foreground hover:text-primary">{drop.seller}</Link>
                  ) : <p className="font-semibold text-foreground">{drop.seller}</p>}
                  {seller?.email && <p className="text-xs text-muted-foreground">{seller.email}</p>}
                </div>
              </div>
            </PageCard>

            <PageCard title="Drop-off Centre">
              <div className="space-y-1.5 text-sm">
                <p className="inline-flex items-center gap-2 font-semibold text-foreground"><Building2 className="h-4 w-4 text-primary" /> {drop.centre}</p>
                {centre && <>
                  <p className="inline-flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {centre.address}</p>
                  <p className="text-xs text-muted-foreground">Hours: {centre.hours}</p>
                  <p className="text-xs text-muted-foreground">Contact: <span className="font-medium text-foreground">{centre.contactPerson}</span> · {centre.phone}</p>
                </>}
              </div>
            </PageCard>
          </div>
        </div>

        <AdminNotes entityId={`dropoff:${drop.id}`} />
      </div>
    </div>
  );
}
