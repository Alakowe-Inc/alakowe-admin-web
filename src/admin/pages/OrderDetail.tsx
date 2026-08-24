import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, CreditCard, Truck, Calendar, MoreHorizontal, Zap,
  Package, User, Mail, Phone, ShieldCheck, Hash, Check, MessageSquareWarning, Scale,
  LinkIcon,
} from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { AdminNotes } from "@/admin/components/AdminNotes";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { SpeedafLogisticsPanel } from "@/admin/components/SpeedafLogisticsPanel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrderApi, updateAdminOrderStatusApi } from "@/lib/api/admin/admin.api";
import { moneyInNaira } from "@/lib/utils";

const COURIER_STATUSES = [
  "Pending",
  "Confirmed",
  "AwaitingInbound",
  "InboundBooked",
  "InTransitToHub",
  "AtHub",
  "Sorted",
  "OutboundBooked",
  "OutForDelivery",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const

const PICKUP_STATUSES = [
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled",
] as const

type Step = { key: string; label: string; matches: string[] }

const COURIER_STEPS: Step[] = [
  { key: "payment", label: "Payment Received", matches: ["Paid", "Confirmed", "AwaitingInbound", "InboundBooked", "InTransitToHub", "AtHub", "Sorted", "OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "awaiting", label: "Awaiting Seller Action", matches: ["Confirmed", "AwaitingInbound", "InboundBooked", "InTransitToHub", "AtHub", "Sorted", "OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "scheduled", label: "Inbound Booked", matches: ["InboundBooked", "InTransitToHub", "AtHub", "Sorted", "OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "dropped", label: "At Alakowe Hub", matches: ["AtHub", "Sorted", "OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "processing", label: "Sorted", matches: ["Sorted", "OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "dispatched", label: "Outbound", matches: ["OutboundBooked", "OutForDelivery", "Shipped", "Delivered"] },
  { key: "delivered", label: "Delivered", matches: ["Delivered"] },
]

const PICKUP_STEPS: Step[] = [
  { key: "payment", label: "Payment Received", matches: ["Paid", "Pending", "Confirmed", "Delivered"] },
  { key: "ready", label: "Ready for pickup", matches: ["Confirmed", "Delivered"] },
  { key: "picked", label: "Picked up", matches: ["Delivered"] },
]

function currentStepIndex(status: string, steps: Step[]) {
  if (status === "Cancelled") return -1
  let last = 0
  steps.forEach((s, i) => { if (s.matches.includes(status)) last = i })
  return last
}

function isPickupOrder(order: { fulfillmentType?: string; delivery?: string }) {
  const type = (order.fulfillmentType || order.delivery || "").toLowerCase()
  return type === "pickup"
}

function formatPickupDates(dates?: string[] | null): string {
  if (!dates?.length) return ""
  return dates
    .map((d) => {
      const parsed = new Date(d)
      if (Number.isNaN(parsed.getTime())) return d
      return parsed.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    })
    .join("; ")
}

export default function OrderDetail() {
  const { id: orderNumberParam } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderNumber = orderNumberParam ? decodeURIComponent(orderNumberParam) : "";
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-order", orderNumber],
    queryFn: () => getAdminOrderApi(orderNumber),
    enabled: !!orderNumber,
  });
  const updateStatus = useMutation({
    mutationFn: ({ status, force }: { status: string; force?: boolean }) =>
      updateAdminOrderStatusApi(orderNumber, status, force ? "Force update from admin dashboard" : undefined),
    onSuccess: async () => {
      toast("Order updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order", orderNumber] }),
      ]);
    },
  });
  const [next, setNext] = useState<string>("");

  const pickup = !!order && isPickupOrder(order)
  const steps = pickup ? PICKUP_STEPS : COURIER_STEPS
  const statuses = pickup ? PICKUP_STATUSES : COURIER_STATUSES
  const stepIdx = useMemo(
    () => (order ? currentStepIndex(order.status, steps) : 0),
    [order, steps],
  )
  const pickupDatesLabel = order ? formatPickupDates(order.pickupPreferredDates) : ""

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/orders")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Loading order" description="Fetching order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/orders")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Order not found" description="This order may have been removed." />
      </div>
    );
  }

  const items = order.items ?? [];

  const apply = (force: boolean) => {
    if (!next) return;
    updateStatus.mutate({ status: next, force });
    setNext("");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/orders")} className="w-fit gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={next} onValueChange={setNext}>
            <SelectTrigger className="h-9 w-[180px] rounded-xl"><SelectValue placeholder="Change status…" /></SelectTrigger>
            <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => apply(false)} disabled={!next || updateStatus.isPending}>Update Status</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => apply(true)} disabled={!next || updateStatus.isPending}>
                <Zap className="mr-2 h-4 w-4" /> Force Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Invoice resent")}>Resend Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Buyer notified")}>Contact Buyer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Seller notified")}>Contact Seller</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => updateStatus.mutate({ status: "Cancelled", force: true })}>
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Order header card */}
      <PageCard className="overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-foreground">Order {order.orderNumber}</h2>
              <StatusBadge status={order.status} />
              {pickup && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                  Pickup
                </span>
              )}
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Placed {new Date(order.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Order Total</p>
            <p className="font-display text-2xl font-bold text-foreground">₦{moneyInNaira(order.amount).toLocaleString()}</p>
          </div>
        </div>

        {/* Horizontal stepper */}
        <div className="mt-6 -mx-1 overflow-x-auto pb-1">
          <div className={`flex items-start gap-1 px-1 ${pickup ? "min-w-[420px]" : "min-w-[720px]"}`}>
            {steps.map((s, i) => {
              const done = stepIdx > i;
              const active = stepIdx === i && order.status !== "Cancelled";
              const cancelled = order.status === "Cancelled";
              return (
                <div key={s.key} className="flex flex-1 items-start">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs transition-all duration-300 ${
                        cancelled ? "bg-destructive/10 text-destructive ring-2 ring-destructive/30" :
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
                  {i < steps.length - 1 && (
                    <div className={`mt-[18px] h-0.5 flex-1 transition-colors ${
                      cancelled ? "bg-destructive/20" : done ? "bg-success" : "bg-border"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageCard>

      {/* Disputed order banner */}
      {order.status === "Disputed" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <MessageSquareWarning className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">This order has an open dispute</p>
              <p className="text-xs text-muted-foreground">
                The buyer did not confirm delivery. Escrow for this order is on hold until the dispute is resolved.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1.5 border-destructive/40 bg-card text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => navigate(`/admin/disputes/${encodeURIComponent(order.orderNumber)}`)}
          >
            <Scale className="h-4 w-4" /> Review Dispute
          </Button>
        </div>
      )}

      {/* Related Orders from same checkout session */}
      {(order.relatedOrdersCount ?? 0) > 1 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-soft animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <LinkIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  This checkout produced {order.relatedOrdersCount} orders
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.checkoutSessionGuid ? `Session: ${order.checkoutSessionGuid.slice(0, 8)}...` : "Orders from the same checkout session"}
                </p>
              </div>
            </div>
            {order.checkoutSessionId && (
              <Button
                variant="outline"
                className="gap-1.5 border-primary/30 bg-card text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate(`/admin/checkout-sessions/${order.checkoutSessionId}`)}
              >
                <LinkIcon className="h-4 w-4" /> View All Orders
              </Button>
            )}
          </div>
          {order.relatedOrders && order.relatedOrders.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-primary/10 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Order</th>
                    <th className="pb-2 pr-4 font-semibold">Seller</th>
                    <th className="pb-2 pr-4 font-semibold">Amount</th>
                    <th className="pb-2 pr-4 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {order.relatedOrders.map((ro) => (
                    <tr
                      key={ro.orderNumber}
                      onClick={() => navigate(`/admin/orders/${encodeURIComponent(ro.orderNumber)}`)}
                      className={`cursor-pointer transition-colors hover:bg-primary/10 ${ro.orderNumber === order.orderNumber ? "bg-primary/5" : ""}`}
                    >
                      <td className="py-2 pr-4 font-mono font-semibold text-primary">
                        {ro.orderNumber}
                        {ro.orderNumber === order.orderNumber && (
                          <span className="ml-1.5 text-[10px] text-muted-foreground">(current)</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{ro.sellerName}</td>
                      <td className="py-2 pr-4 font-medium text-foreground">₦{moneyInNaira(ro.amount).toLocaleString()}</td>
                      <td className="py-2 pr-4"><StatusBadge status={ro.status} /></td>
                      <td className="py-2 text-muted-foreground">{new Date(ro.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left col - 2 wide */}
        <div className="space-y-5 lg:col-span-2">
          {/* Order items */}
          <PageCard
            title={items.length === 1 ? "Book Details" : `Books (${items.length})`}
            description={items.length === 1 ? "Product information for this order" : "Line items in this order"}
          >
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items on this order.</p>
            ) : (
              <div className="space-y-5">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-5 sm:flex-row sm:border-b sm:border-border/50 sm:pb-5 last:sm:border-0 last:sm:pb-0">
                    {item.coverImageUrl ? (
                      <img src={item.coverImageUrl} alt={item.title} className="aspect-[3/4] w-full max-w-[140px] rounded-xl object-cover shadow-soft" />
                    ) : (
                      <div className="aspect-[3/4] w-full max-w-[140px] rounded-xl bg-muted" />
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
                        <p className="font-display text-lg font-bold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">by {item.author ?? "Unknown author"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Field label="Category" value={item.category ?? "—"} />
                        <Field label="Format" value={item.format ?? "Paperback"} />
                        <Field label="Quantity" value={String(item.quantity ?? 1)} />
                        <Field label="Condition" value={item.condition ?? "—"} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                        <Money label="Unit Price" value={moneyInNaira(item.unitPrice)} />
                        <Money label="Buyer Price" value={moneyInNaira(item.buyerPrice)} />
                        <Money label="Seller Payout" value={moneyInNaira(item.sellerPayout)} tone="success" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>

          {/* Buyer + Seller */}
          <div className="grid gap-5 md:grid-cols-2">
            <PartyCard title="Buyer Information" name={order.buyer.name} email={order.buyer.email} phone={order.buyer.phone} address={order.shippingAddress ?? order.buyer.address} link={order.buyer.id ? `/admin/users/${order.buyer.id}` : undefined} verified={order.buyer.verified} />
            <PartyCard title="Seller Information" name={order.seller.name} email={order.seller.email} phone={order.seller.phone} address={order.seller.address} link={order.seller.id ? `/admin/users/${order.seller.id}` : undefined} verified={order.seller.verified} />
          </div>

          {/* Payment + Delivery */}
          <div className="grid gap-5 md:grid-cols-2">
            <PageCard title="Payment Information">
              <ul className="space-y-2.5 text-sm">
                <Row icon={CreditCard} label="Method" value={order.payment.method ?? "Paystack"} />
                <Row icon={Hash} label="Transaction ID" value={order.payment.reference ?? "—"} />
                <Row icon={Calendar} label="Payment Date" value={new Date(order.payment.paidAt ?? order.paymentDate ?? order.date).toLocaleString()} />
                <Row icon={Package} label="Total Amount" value={`₦${moneyInNaira(order.amount).toLocaleString()}`} bold />
                <li className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">{order.payment.status ?? "Paid"}</span>
                </li>
              </ul>
            </PageCard>

            <PageCard title={pickup ? "Pickup Information" : "Delivery Information"}>
              <ul className="space-y-2.5 text-sm">
                <Row icon={Truck} label="Method" value={pickup ? "Buyer pickup" : order.delivery} />
                {pickup ? (
                  <>
                    <Row icon={MapPin} label="Pickup address" value={order.pickupAddress ?? "—"} />
                    <Row icon={Calendar} label="Preferred days" value={pickupDatesLabel || "—"} />
                  </>
                ) : (
                  <>
                    <Row icon={Hash} label="Tracking" value={order.shippingAddress ? "See Speedaf panel if booked" : "—"} />
                    <Row icon={MapPin} label="Address" value={order.shippingAddress ?? "—"} />
                    <Row icon={Calendar} label="Hub" value="14b Ikosi Road, Ketu, Lagos" />
                  </>
                )}
              </ul>
            </PageCard>
          </div>

          {!pickup && (
            <SpeedafLogisticsPanel
              orderNumber={order.orderNumber}
              orderStatus={order.status}
              sellerName={order.seller.name}
              sellerPhone={order.seller.phone}
              sellerAddress={order.seller.address}
              preferredStationId={order.preferredSpeedafStationId}
              preferredStationName={order.preferredSpeedafStationName}
              preferredStationAddress={order.preferredSpeedafStationAddress}
              preferredStationCity={order.preferredSpeedafStationCity}
              sellerDropoffScheduledAt={order.sellerDropoffScheduledAt}
              initialShipments={order.shipments}
              onChanged={() => refetch()}
            />
          )}
        </div>

        {/* Right col - sidebar */}
        <div className="space-y-5">
          {/* Activity Timeline */}
          <PageCard title="Activity Timeline" description="Status changes and admin actions">
            <ol className="relative max-h-[420px] space-y-3 overflow-y-auto border-l border-border/70 pl-4 pr-1">
              {(order.activity ?? []).slice().reverse().map((a, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${i === 0 ? "bg-primary shadow-glow" : "bg-muted-foreground/40"}`} />
                  <p className="text-sm font-medium text-foreground">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(a.ts).toLocaleString()}</p>
                </li>
              ))}
              {(order.activity ?? []).length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
            </ol>
          </PageCard>

          {/* Admin Notes */}
          <AdminNotes entityId={`order:${order.orderNumber}`} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Money({ label, value, note, tone }: { label: string; value: number; note?: string; tone?: "success" }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display text-base font-bold ${tone === "success" ? "text-success" : "text-foreground"}`}>₦{value.toLocaleString()}</p>
      {note && <p className="text-[10px] font-medium text-muted-foreground">{note}</p>}
    </div>
  );
}

function Row({ icon: Icon, label, value, bold }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; bold?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className={`text-right text-sm ${bold ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{value}</span>
    </li>
  );
}

function PartyCard({ title, name, email, phone, address, link, verified, badge }: {
  title: string; name: string; email?: string; phone?: string; address?: string; link?: string; verified?: boolean; badge?: string;
}) {
  return (
    <PageCard title={title}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold text-primary">
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {link ? (
                <Link to={link} className="truncate font-semibold text-foreground hover:text-primary">{name}</Link>
              ) : (
                <span className="truncate font-semibold text-foreground">{name}</span>
              )}
              {verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
            </div>
            {badge && <p className="text-[11px] font-medium text-amber-500">{badge}</p>}
          </div>
        </div>
        <ul className="space-y-1.5 text-xs">
          {email && <li className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3 w-3" /> {email}</li>}
          {phone && <li className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3 w-3" /> {phone}</li>}
          {address && <li className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {address}</li>}
        </ul>
        {link && (
          <Link to={link} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <User className="h-3 w-3" /> View profile →
          </Link>
        )}
      </div>
    </PageCard>
  );
}
