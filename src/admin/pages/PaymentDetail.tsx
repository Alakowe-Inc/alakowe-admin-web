import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Hash, User, Bell, Check, X, Loader2 } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/admin/store/adminStore";
import { useAdminPayoutRequest, useUpdatePayoutRequestStatus } from "@/lib/api/admin/admin.hooks";
import type { PayoutRequestResponse } from "@/lib/api/types";
import { toast } from "react-toastify";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notifySeller = useAdminStore((s) => s.notifySeller);

  const { data: payout, isLoading } = useAdminPayoutRequest(Number(id));
  const updateStatus = useUpdatePayoutRequestStatus();

  const bank = payout
    ? { accountName: payout.accountName, bankName: payout.bankName, accountNumber: payout.accountNumber }
    : undefined;

  const linkedOrders = payout?.linkedOrders?.length
    ? payout.linkedOrders
    : payout?.orderId
      ? [payout.orderId]
      : [];

  const history = buildHistory(payout);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading payout…</p>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/payments")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Payout not found" />
      </div>
    );
  }

  const setStatus = (next: "Processing" | "Paid" | "Unsuccessful", msg: string) => {
    updateStatus.mutate({ id: Number(payout.id), status: next });
    toast(msg);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/payments")} className="gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Payments
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { notifySeller(payout.sellerName ?? ""); toast(`Notified ${payout.sellerName}`); }}>
            <Bell className="h-3.5 w-3.5" /> Notify Seller
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStatus("Unsuccessful", "Marked unsuccessful")}>
            <X className="h-3.5 w-3.5" /> Payment Unsuccessful
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setStatus("Paid", "Payment confirmed")}>
            <Check className="h-3.5 w-3.5" /> Payment Made
          </Button>
        </div>
      </div>

      <PageCard
        title={`Payout ${payout.requestNumber ?? payout.id}`}
        description={`To ${payout.sellerName}`}
        action={<StatusBadge status={payout.status ?? "Pending"} />}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Account name">{bank?.accountName ?? "—"}</Field>
              <Field icon={Building2} label="Bank name">{bank?.bankName ?? "—"}</Field>
              <Field icon={Hash} label="Account number"><span className="font-mono">{bank?.accountNumber ?? "—"}</span></Field>
              <Field icon={CreditCard} label="Payable amount"><span className="font-display text-xl font-bold text-primary">₦{(payout.amount ?? 0).toLocaleString()}</span></Field>
            </div>

            <PageCard title="Linked orders" bodyClassName="p-0">
              <ul className="divide-y divide-border/60">
                {linkedOrders.map((oid) => (
                  <li key={oid} className="flex items-center justify-between px-5 py-3">
                    <span className="font-mono text-sm font-semibold text-primary">{oid}</span>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/orders/${oid}`)}>View →</Button>
                  </li>
                ))}
                {linkedOrders.length === 0 && (
                  <li className="px-5 py-4 text-sm text-muted-foreground">No linked orders.</li>
                )}
              </ul>
            </PageCard>
          </div>

          <PageCard title="History" bodyClassName="p-0">
            <ol className="space-y-3 px-5 py-4">
              {history.slice().reverse().map((h, i) => (
                <li key={i} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-sm font-medium">{h.text}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(h.ts).toLocaleString()}</p>
                </li>
              ))}
              {history.length === 0 && (
                <li className="text-sm text-muted-foreground">No history yet.</li>
              )}
            </ol>
          </PageCard>
        </div>
      </PageCard>
    </div>
  );
}

function buildHistory(payout?: PayoutRequestResponse) {
  const history: { ts: string; text: string }[] = [];
  if (!payout) return history;
  if (payout.requestedAt) history.push({ ts: payout.requestedAt, text: "Payout requested" });
  if (payout.approvedAt) history.push({ ts: payout.approvedAt, text: "Approved for processing" });
  if (payout.paidAt) history.push({ ts: payout.paidAt, text: "Marked as paid" });
  if (payout.note) history.push({ ts: new Date().toISOString(), text: payout.note });
  return history;
}

function Field({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
