import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, CreditCard, Truck, Calendar, MoreHorizontal, Zap,
  Package, BookOpen, User, Mail, Phone, ShieldCheck, Hash, Check,
} from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { AdminNotes } from "@/admin/components/AdminNotes";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/admin/store/adminStore";
import { COVER_IMAGES } from "@/lib/covers";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import type { Order } from "@/lib/mock-data";

const STATUSES: Order["status"][] = ["Pending", "Confirmed", "Paid", "Processing", "Dispatched", "In Transit", "Shipped", "Delivered", "Cancelled"];

type Step = { key: string; label: string; matches: Order["status"][] };
const STEPS: Step[] = [
  { key: "payment", label: "Payment Received", matches: ["Paid", "Confirmed", "Processing", "Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "awaiting", label: "Awaiting Seller Action", matches: ["Confirmed", "Processing", "Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "scheduled", label: "Drop-off Scheduled", matches: ["Processing", "Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "dropped", label: "Dropped Off", matches: ["Processing", "Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "processing", label: "Processing", matches: ["Processing", "Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "dispatched", label: "Dispatched", matches: ["Dispatched", "In Transit", "Shipped", "Delivered"] },
  { key: "delivered", label: "Delivered", matches: ["Delivered"] },
];

function currentStepIndex(status: Order["status"]) {
  if (status === "Cancelled") return -1;
  let last = 0;
  STEPS.forEach((s, i) => { if (s.matches.includes(status)) last = i; });
  return last;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = useAdminStore((s) => s.orders.find((o) => o.id === id));
  const listing = useAdminStore((s) => s.listings.find((l) => l.title === order?.book));
  const buyer = useAdminStore((s) => s.users.find((u) => u.name === order?.buyer));
  const seller = useAdminStore((s) => s.users.find((u) => u.name === order?.seller));
  const setStatus = useAdminStore((s) => s.setOrderStatus);
  const forceUpdate = useAdminStore((s) => s.forceUpdateOrder);
  const [next, setNext] = useState<Order["status"] | "">("");

  const stepIdx = useMemo(() => order ? currentStepIndex(order.status) : 0, [order]);

  if (!order) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/orders")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Order not found" description="This order may have been removed." />
      </div>
    );
  }

  const cover = COVER_IMAGES[order.book];
  const sellerPrice = listing?.price ?? Math.round(order.amount / 1.15);
  const listingPrice = Math.round(sellerPrice * 1.15);
  const sellerPayout = Math.round(sellerPrice * 0.85);

  const apply = (force: boolean) => {
    if (!next) return;
    (force ? forceUpdate : setStatus)(order.id, next);
    toast(force ? "Order force-updated" : "Order updated");
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
          <Select value={next} onValueChange={(v) => setNext(v as Order["status"])}>
            <SelectTrigger className="h-9 w-[180px] rounded-xl"><SelectValue placeholder="Change status…" /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => apply(false)} disabled={!next}>Update Status</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => apply(true)} disabled={!next}>
                <Zap className="mr-2 h-4 w-4" /> Force Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Invoice resent")}>Resend Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Buyer notified")}>Contact Buyer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Seller notified")}>Contact Seller</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => { setStatus(order.id, "Cancelled"); toast("Order cancelled"); }}>
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
              <h2 className="font-display text-xl font-bold text-foreground">Order {order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Placed {new Date(order.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Order Total</p>
            <p className="font-display text-2xl font-bold text-foreground">₦{order.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Horizontal stepper */}
        <div className="mt-6 -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-[720px] items-start gap-1 px-1">
            {STEPS.map((s, i) => {
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
                  {i < STEPS.length - 1 && (
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

      {/* Two-column grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left col - 2 wide */}
        <div className="space-y-5 lg:col-span-2">
          {/* Book Details */}
          <PageCard title="Book Details" description="Product information for this order">
            <div className="flex flex-col gap-5 sm:flex-row">
              {cover ? (
                <img src={cover} alt={order.book} className="aspect-[3/4] w-full max-w-[160px] rounded-xl object-cover shadow-soft" />
              ) : (
                <div className="aspect-[3/4] w-full max-w-[160px] rounded-xl bg-muted" />
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
                  <p className="font-display text-lg font-bold text-foreground">{order.book}</p>
                  <p className="text-sm text-muted-foreground">by {listing?.author ?? "Unknown author"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Category" value={listing?.category ?? "—"} />
                  <Field label="Format" value={listing?.format ?? "Paperback"} />
                  <Field label="Quantity" value={String(listing?.quantity ?? 1)} />
                  <Field label="Condition" value={listing?.condition ?? "—"} />
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <Money label="Seller Price" value={sellerPrice} />
                  <Money label="Listing Price" value={listingPrice} note="+15%" />
                  <Money label="Seller Payout" value={sellerPayout} note="-15%" tone="success" />
                </div>
              </div>
            </div>
          </PageCard>

          {/* Buyer + Seller */}
          <div className="grid gap-5 md:grid-cols-2">
            <PartyCard title="Buyer Information" name={order.buyer} email={buyer?.email} phone={buyer?.phone} address={order.shippingAddress} link={buyer ? `/admin/users/${buyer.id}` : undefined} verified={buyer?.verified} />
            <PartyCard title="Seller Information" name={order.seller} email={seller?.email} phone={seller?.phone} address={seller?.address} link={seller ? `/admin/users/${seller.id}` : undefined} verified={seller?.verified} badge={seller?.rating ? `★ ${seller.rating}` : undefined} />
          </div>

          {/* Payment + Delivery */}
          <div className="grid gap-5 md:grid-cols-2">
            <PageCard title="Payment Information">
              <ul className="space-y-2.5 text-sm">
                <Row icon={CreditCard} label="Method" value="Paystack · ****4421" />
                <Row icon={Hash} label="Transaction ID" value={`PSK-${order.id.slice(-6)}-${Math.abs(order.amount).toString(36).toUpperCase().slice(0,4)}`} />
                <Row icon={Calendar} label="Payment Date" value={new Date(order.date).toLocaleString()} />
                <Row icon={Package} label="Total Amount" value={`₦${order.amount.toLocaleString()}`} bold />
                <li className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/20">Paid</span>
                </li>
              </ul>
            </PageCard>

            <PageCard title="Delivery Information">
              <ul className="space-y-2.5 text-sm">
                <Row icon={Truck} label="Method" value={order.delivery} />
                <Row icon={Hash} label="Tracking" value={`GIG-${order.id.slice(-4)}`} />
                <Row icon={MapPin} label="Address" value={order.shippingAddress ?? "—"} />
                <Row icon={Calendar} label="ETA" value="2 days" />
              </ul>
            </PageCard>
          </div>
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
          <AdminNotes entityId={`order:${order.id}`} />
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
