import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, MessageSquareWarning, Check, Calendar, Clock, ShieldCheck, ShieldAlert,
  Scale, User, Mail, Phone, MapPin, Hash, CreditCard, ExternalLink, ScrollText,
} from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { AdminNotes } from "@/admin/components/AdminNotes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminDisputeApi, updateAdminDisputeStatusApi, type AdminDisputeResponse, type AdminDisputeDecision } from "@/lib/api/admin/admin.api";
import { moneyInNaira } from "@/lib/utils";

type Step = { key: string; label: string; matches: string[] }

const STEPS: Step[] = [
  { key: "filed", label: "Dispute Filed", matches: ["Open", "UnderReview", "Resolved", "Rejected", "Closed"] },
  { key: "review", label: "Under Review", matches: ["UnderReview", "Resolved", "Rejected", "Closed"] },
  { key: "decision", label: "Decision", matches: ["Resolved", "Rejected", "Closed"] },
  { key: "closed", label: "Closed", matches: ["Closed"] },
]

function stepIdx(status?: string) {
  if (!status) return 0
  const s = status.toLowerCase()
  if (s === "closed") return 3
  if (s === "resolved" || s === "rejected") return 2
  if (s === "underreview") return 1
  return 0
}

function slaHours(d: AdminDisputeResponse): string {
  const due = d.dueAt ? new Date(d.dueAt).getTime() : NaN
  if (Number.isNaN(due)) return "—"
  const hrs = Math.ceil((due - Date.now()) / 3600000)
  if (hrs < 0) return `${Math.abs(hrs)}h overdue`
  if (hrs < 48) return `${hrs}h left`
  return `${Math.floor(hrs / 24)}d left`
}

const DECISIONS: { value: AdminDisputeDecision; label: string; hint: string; status: AdminDisputeResponse["status"]; tone: "buyer" | "seller" | "muted" }[] = [
  { value: "RefundBuyer", label: "Refund Buyer", hint: "Ruled in buyer's favour — full refund from escrow, seller is not paid.", status: "Resolved", tone: "buyer" },
  { value: "RuleForSeller", label: "Rule for Seller", hint: "Claim not substantiated — funds released to the seller.", status: "Rejected", tone: "seller" },
  { value: "Close", label: "Close Dispute", hint: "Dispute withdrawn or no action needed. Order returns to normal.", status: "Closed", tone: "muted" },
]

export default function DisputeDetail() {
  const { orderNumber: orderNumberParam } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderNumber = orderNumberParam ? decodeURIComponent(orderNumberParam) : "";

  const { data: dispute, isLoading, error } = useQuery({
    queryKey: ["admin-disputes", orderNumber],
    queryFn: () => getAdminDisputeApi(orderNumber),
    enabled: !!orderNumber,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [decision, setDecision] = useState<AdminDisputeDecision>("RefundBuyer");
  const [resolutionNote, setResolutionNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const updateDispute = useMutation({
    mutationFn: (body: { status: AdminDisputeResponse["status"]; decision?: AdminDisputeDecision; resolution?: string }) =>
      updateAdminDisputeStatusApi(orderNumber, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order", orderNumber] }),
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
      ]);
    },
  });

  const stepIdxVal = stepIdx(dispute?.status);
  const isTerminal = dispute?.status === "Resolved" || dispute?.status === "Rejected" || dispute?.status === "Closed";
  const decisionMeta = DECISIONS.find((d) => d.status === dispute?.status);

  const startReview = () => {
    setReviewing(true);
    updateDispute.mutate(
      { status: "UnderReview", resolution: "Moved to under review by admin." },
      { onSettled: () => { setReviewing(false); toast("Dispute moved to under review"); } },
    );
  };

  const submitDecision = () => {
    const meta = DECISIONS.find((d) => d.value === decision);
    if (!meta) return;
    const note = resolutionNote.trim() || meta.label;
    updateDispute.mutate(
      { status: meta.status, decision, resolution: note },
      {
        onSuccess: () => {
          toast(`${meta.label} — ${meta.status}`);
          setDialogOpen(false);
          setResolutionNote("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/disputes")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Loading dispute" description="Fetching dispute details..." />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/disputes")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Dispute not found" description="This dispute may have been resolved or the order removed." />
      </div>
    );
  }

  const evidence = dispute.evidence ?? [];
  const activity = dispute.activity ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/disputes")} className="w-fit gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Disputes
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {dispute.status === "Open" && (
            <Button variant="outline" onClick={startReview} disabled={reviewing} className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Start Review
            </Button>
          )}
          {!isTerminal && (
            <Button onClick={() => { setDecision("RefundBuyer"); setDialogOpen(true); }} className="gap-1.5">
              <Scale className="h-4 w-4" /> Resolve Dispute
            </Button>
          )}
          {isTerminal && (
            <Button variant="outline" onClick={() => { setDecision("RefundBuyer"); setDialogOpen(true); }} className="gap-1.5">
              <Scale className="h-4 w-4" /> Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Dispute header card */}
      <PageCard className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-foreground">Dispute {dispute.disputeNumber}</h2>
              <StatusBadge status={dispute.status ?? "Open"} />
              <Link
                to={`/admin/orders/${encodeURIComponent(dispute.orderNumber ?? "")}`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/40 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-secondary/50 hover:underline"
              >
                Order {dispute.orderNumber} <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Filed {new Date(dispute.filedAt ?? Date.now()).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              <span className="text-border">·</span>
              <Clock className="h-3.5 w-3.5" /> SLA: <span className={slaHours(dispute).includes("overdue") ? "font-semibold text-destructive" : ""}>{slaHours(dispute)}</span>
            </p>
            <p className="mt-2 max-w-2xl rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
              <span className="font-semibold text-warning">{dispute.filedBy}</span> says: “{dispute.reason}”
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Escrow Amount</p>
            <p className="font-display text-2xl font-bold text-foreground">₦{moneyInNaira(dispute.amount).toLocaleString()}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{dispute.bookTitle ?? "Book"} · {dispute.delivery}</p>
          </div>
        </div>

        {/* Horizontal stepper */}
        <div className="mt-6 -mx-1 overflow-x-auto pb-1">
          <div className="flex items-start gap-1 px-1 min-w-[520px]">
            {STEPS.map((s, i) => {
              const done = stepIdxVal > i;
              const active = stepIdxVal === i;
              return (
                <div key={s.key} className="flex flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs transition-all duration-300 ${
                        done ? "bg-success text-white shadow-soft" :
                        active ? "bg-primary text-primary-foreground shadow-glow ring-4 ring-primary/20 scale-110" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <p className={`mt-2 text-[11px] font-semibold leading-tight ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mt-[18px] h-0.5 flex-1 transition-colors ${done ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageCard>

      {/* Two-column grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left col - 2 wide */}
        <div className="space-y-5 lg:col-span-2">
          {/* Buyer's claim + evidence */}
          <PageCard title="Buyer's Claim" description={`Reason submitted by ${dispute.filedBy}`}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                  <MessageSquareWarning className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reason</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{dispute.reason}</p>
                </div>
              </div>

              {evidence.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence ({evidence.length})</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {evidence.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border/60 bg-muted">
                        <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground">
                  No photos uploaded with this dispute.
                </p>
              )}
            </div>
          </PageCard>

          {/* Order summary */}
          <PageCard
            title="Order Summary"
            description={`Money held in escrow for ${dispute.orderNumber} until this dispute is resolved`}
            action={
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => navigate(`/admin/orders/${encodeURIComponent(dispute.orderNumber ?? "")}`)}>
                <ExternalLink className="h-3.5 w-3.5" /> View Order
              </Button>
            }
          >
            <ul className="space-y-2.5 text-sm">
              <Row icon={Hash} label="Order Number" value={dispute.orderNumber ?? "—"} mono />
              <Row icon={ScrollText} label="Book" value={dispute.bookTitle ?? "—"} />
              <Row icon={CreditCard} label="Escrow Amount" value={`₦${moneyInNaira(dispute.amount).toLocaleString()}`} bold />
              <Row icon={MapPin} label="Fulfilment" value={dispute.delivery ?? "—"} />
              <li className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Funds status</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                  isTerminal
                    ? dispute.status === "Resolved"
                      ? "bg-success/10 text-success ring-success/20"
                      : dispute.status === "Rejected"
                        ? "bg-info/10 text-info ring-info/20"
                        : "bg-muted text-muted-foreground ring-border"
                    : "bg-warning/15 text-warning ring-warning/30"
                }`}>
                  {isTerminal
                    ? dispute.status === "Resolved"
                      ? "Refunded to buyer"
                      : dispute.status === "Rejected"
                        ? "Released to seller"
                        : "Released"
                    : "Held in escrow"}
                </span>
              </li>
            </ul>
          </PageCard>

          {/* Decision summary (terminal states) */}
          {isTerminal && (dispute.resolution || decisionMeta) && (
            <PageCard title="Decision" description={`${dispute.decidedBy ?? "Admin"} · ${dispute.decidedAt ? new Date(dispute.decidedAt).toLocaleString() : ""}`}>
              <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  dispute.status === "Resolved"
                    ? "bg-success/15 text-success"
                    : dispute.status === "Rejected"
                      ? "bg-info/15 text-info"
                      : "bg-muted text-foreground"
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{decisionMeta?.label ?? dispute.status}</p>
                  {decisionMeta?.hint && <p className="text-xs text-muted-foreground">{decisionMeta.hint}</p>}
                  {dispute.resolution && (
                    <p className="mt-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-foreground">{dispute.resolution}</p>
                  )}
                </div>
              </div>
            </PageCard>
          )}
        </div>

        {/* Right col - sidebar */}
        <div className="space-y-5">
          {/* Parties */}
          <PageCard title="Parties">
            <div className="space-y-3">
              <PartyCard
                label="Buyer"
                name={dispute.filedBy ?? "Buyer"}
                email={dispute.filedByEmail}
                icon={<User className="h-4 w-4" />}
              />
              <PartyCard
                label="Seller"
                name={dispute.sellerName ?? "Seller"}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
            </div>
          </PageCard>

          {/* Activity Timeline */}
          <PageCard title="Dispute Timeline" description="Filing, review and decision activity">
            <ol className="relative max-h-[380px] space-y-3 overflow-y-auto border-l border-border/70 pl-4 pr-1">
              {activity.slice().reverse().map((a, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${i === 0 ? "bg-primary shadow-glow" : "bg-muted-foreground/40"}`} />
                  <p className="text-sm font-medium text-foreground">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.ts ? new Date(a.ts).toLocaleString() : ""}</p>
                </li>
              ))}
              {activity.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
            </ol>
          </PageCard>

          {/* Admin Notes */}
          <AdminNotes entityId={`dispute:${dispute.orderNumber}`} title="Dispute Notes" description="Internal notes for your team" />
        </div>
      </div>

      {/* Resolution dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Scale className="h-4 w-4 text-primary" /> Resolve Dispute {dispute.disputeNumber}
            </DialogTitle>
            <DialogDescription>
              Decide how escrow of <span className="font-semibold text-foreground">₦{moneyInNaira(dispute.amount).toLocaleString()}</span> is released for order {dispute.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {DECISIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDecision(d.value)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  decision === d.value
                    ? "border-primary bg-secondary/30 ring-1 ring-primary/30"
                    : "border-border/70 bg-card hover:bg-muted/40"
                }`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  decision === d.value ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                }`}>
                  {decision === d.value && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${
                    d.tone === "buyer" ? "text-success" : d.tone === "seller" ? "text-info" : "text-foreground"
                  }`}>{d.label}</span>
                  <span className="block text-xs text-muted-foreground">{d.hint}</span>
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resolution note</p>
            <Textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Record the outcome and what was communicated to both parties…"
              className="min-h-[90px] resize-none rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitDecision} disabled={updateDispute.isPending}>
              {updateDispute.isPending ? "Applying…" : `Apply ${DECISIONS.find((d) => d.value === decision)?.label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon: Icon, label, value, bold, mono }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className={`text-right text-sm ${mono ? "font-mono" : ""} ${bold ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{value}</span>
    </li>
  );
}

function PartyCard({ label, name, email, icon }: { label: string; name: string; email?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold text-primary">
          {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="truncate font-semibold text-foreground">{name}</p>
          {email && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {email}</p>
          )}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/30 text-primary">{icon}</span>
      </div>
    </div>
  );
}
