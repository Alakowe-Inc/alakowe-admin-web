import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, Hash, MapPin, Truck, ShoppingCart, Package } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAdminCheckoutSessionApi, type AdminCheckoutSessionDetailDto } from "@/lib/api/admin/admin.api";
import { moneyInNaira } from "@/lib/utils";

function statusBadgeColor(status: string): string {
  switch (status) {
    case "Paid": return "bg-success/10 text-success ring-success/20";
    case "Pending": return "bg-amber-500/10 text-amber-500 ring-amber-500/20";
    case "PaymentInitiated": return "bg-blue-500/10 text-blue-500 ring-blue-500/20";
    case "Failed": return "bg-destructive/10 text-destructive ring-destructive/20";
    case "Expired": return "bg-muted text-muted-foreground ring-border";
    default: return "bg-muted text-muted-foreground ring-border";
  }
}

export default function CheckoutSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = id ? parseInt(id, 10) : 0;

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["admin-checkout-sessions", sessionId],
    queryFn: () => getAdminCheckoutSessionApi(sessionId),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/checkout-sessions")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Loading session" description="Fetching checkout session details..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/checkout-sessions")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Session not found" description="This checkout session may have been removed." />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/checkout-sessions")} className="w-fit gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Checkout Sessions
        </Button>
      </div>

      {/* Session header card */}
      <PageCard className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-foreground">Checkout Session</h2>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusBadgeColor(session.status)}`}>
                {session.status}
              </span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="h-3.5 w-3.5" /> {session.sessionGuid}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Created {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Amount</p>
            <p className="font-display text-2xl font-bold text-foreground">₦{moneyInNaira(session.totalAmount).toLocaleString()}</p>
            {session.deliveryFee != null && session.deliveryFee > 0 && (
              <p className="text-xs text-muted-foreground">Incl. ₦{moneyInNaira(session.deliveryFee).toLocaleString()} delivery</p>
            )}
          </div>
        </div>
      </PageCard>

      {/* Two-column grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-5 lg:col-span-2">
          {/* Orders from this session */}
          <PageCard
            title={`Orders (${session.orders.length})`}
            description="Orders created from this checkout session"
          >
            {session.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders found for this session.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-4 font-semibold">Order</th>
                      <th className="pb-2 pr-4 font-semibold">Seller</th>
                      <th className="pb-2 pr-4 font-semibold">Books</th>
                      <th className="pb-2 pr-4 font-semibold">Amount</th>
                      <th className="pb-2 pr-4 font-semibold">Status</th>
                      <th className="pb-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.orders.map((o) => (
                      <tr
                        key={o.orderNumber}
                        onClick={() => navigate(`/admin/orders/${encodeURIComponent(o.orderNumber)}`)}
                        className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-primary">{o.orderNumber}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{o.sellerName}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {(o.bookTitles ?? []).length === 0 ? "—" :
                            (o.bookTitles ?? []).length === 1 ? o.bookTitles![0] :
                            `${o.bookTitles![0]} +${o.bookTitles!.length - 1} more`}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-foreground">₦{moneyInNaira(o.amount).toLocaleString()}</td>
                        <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                        <td className="py-3 text-muted-foreground">{new Date(o.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PageCard>

          {/* Items */}
          <PageCard
            title={`Session Items (${session.items.length})`}
            description="All items in this checkout session"
          >
            {session.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this session.</p>
            ) : (
              <div className="space-y-4">
                {session.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 sm:flex-row sm:border-b sm:border-border/50 sm:pb-4 last:sm:border-0 last:sm:pb-0">
                    {item.coverImageUrl ? (
                      <img src={item.coverImageUrl} alt={item.title} className="aspect-[3/4] w-full max-w-[100px] rounded-xl object-cover shadow-soft" />
                    ) : (
                      <div className="aspect-[3/4] w-full max-w-[100px] rounded-xl bg-muted" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">by {item.author ?? "Unknown author"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-muted-foreground">Qty: <span className="font-medium text-foreground">{item.quantity}</span></span>
                        <span className="text-muted-foreground">Unit: <span className="font-medium text-foreground">₦{moneyInNaira(item.unitPrice).toLocaleString()}</span></span>
                        <span className="text-muted-foreground">Buyer: <span className="font-medium text-foreground">₦{moneyInNaira(item.buyerPrice).toLocaleString()}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Seller:</span>
                        <span className="text-xs font-medium text-foreground">{item.sellerName || item.sellerEmail}</span>
                        <span className="inline-flex rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {item.fulfillmentType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </div>

        {/* Right col - sidebar */}
        <div className="space-y-5">
          {/* Buyer Info */}
          <PageCard title="Buyer Information">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold text-primary">
                  {session.buyer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{session.buyer.name}</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs">
                {session.buyer.email && <li className="flex items-center gap-1.5 text-muted-foreground"><span className="h-3 w-3">@</span> {session.buyer.email}</li>}
                {session.buyer.phone && <li className="flex items-center gap-1.5 text-muted-foreground"><span className="h-3 w-3">#</span> {session.buyer.phone}</li>}
                {session.shippingAddress && <li className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {session.shippingAddress}</li>}
              </ul>
            </div>
          </PageCard>

          {/* Payment Info */}
          <PageCard title="Payment Information">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CreditCard className="h-3.5 w-3.5" /> Method</span>
                <span className="text-right text-sm font-medium text-foreground">{session.payment.method}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Hash className="h-3.5 w-3.5" /> Reference</span>
                <span className="text-right text-sm font-medium text-foreground font-mono">{session.payment.reference ?? "—"}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Paid At</span>
                <span className="text-right text-sm font-medium text-foreground">{session.payment.paidAt ? new Date(session.payment.paidAt).toLocaleString() : "—"}</span>
              </li>
              <li className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">{session.payment.status ?? "Paid"}</span>
              </li>
            </ul>
          </PageCard>

          {/* Summary */}
          <PageCard title="Session Summary">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ShoppingCart className="h-3.5 w-3.5" /> Orders</span>
                <span className="text-right text-sm font-bold text-foreground">{session.orders.length}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Package className="h-3.5 w-3.5" /> Items</span>
                <span className="text-right text-sm font-bold text-foreground">{session.items.length}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5" /> Delivery Fee</span>
                <span className="text-right text-sm font-medium text-foreground">{session.deliveryFee != null ? `₦${moneyInNaira(session.deliveryFee).toLocaleString()}` : "—"}</span>
              </li>
              {session.expiresAt && (
                <li className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Expires</span>
                  <span className="text-right text-sm font-medium text-foreground">{new Date(session.expiresAt).toLocaleString()}</span>
                </li>
              )}
            </ul>
          </PageCard>
        </div>
      </div>
    </div>
  );
}
