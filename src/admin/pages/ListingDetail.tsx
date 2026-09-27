import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, X, Ban, Edit, Bell, User, Calendar, Tag, Heart, FileText, BookOpen, Hash, TrendingUp, Wallet, Receipt, MapPin, Store, BookMarked, Package, BadgeCheck, Star } from "lucide-react";
import { PageCard } from "@/admin/components/PageCard";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminListing, useApproveListing, useDeclineListing, usePublishListing, useUnpublishListing, useAllCollections, useAssignListingsToCollection, useSetListingPriority } from "@/lib/api/admin/admin.hooks";
import { toAdminListing } from "@/lib/api/admin/admin-adapter";
import { useState } from "react";
import { toast } from "react-toastify";
import { AdminNote } from "@/admin/components/AdminNote";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listingResponse } = useAdminListing(Number(id));
  const listing = listingResponse ? toAdminListing(listingResponse) : null;
  const approve = useApproveListing();
  const decline = useDeclineListing();
  const publish = usePublishListing();
  const unpublish = useUnpublishListing();
  const priorityMutation = useSetListingPriority();
  const { data: collections, isLoading: collectionsLoading } = useAllCollections();
  const assignListings = useAssignListingsToCollection();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [priority, setPriorityValue] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isMock = import.meta.env.VITE_USE_MOCK === "true";

  if (!listing) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="outline" onClick={() => navigate("/admin/listings")} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <PageCard title="Listing not found" />
      </div>
    );
  }

  const cover = selectedImage ?? listing.coverImage;
  const allImages = listing.coverImage
    ? [listing.coverImage, ...listing.images.filter((u) => u !== listing.coverImage)]
    : listing.images;
  const locked = listing.status !== "Pending";

  function resetApproveForm() {
    setNewPrice("");
    setPriorityValue("");
    setSelectedCollectionIds(new Set());
  }

  function handleApprovingChange(open: boolean) {
    setApproving(open);
    if (!open) resetApproveForm();
  }

  function toggleCollection(collectionId: number) {
    setSelectedCollectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
  }

  async function confirmApprove() {
    try {
      const raw = newPrice.trim();
      let parsed: number | undefined;
      if (raw !== "") {
        parsed = Math.round(parseFloat(raw) * 100);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          toast.error("Enter a valid new price (₦)");
          return;
        }
      }
      const listingId = Number(id);
      const parsedPriority = priority !== "" ? parseInt(priority, 10) : undefined;
      await approve.mutateAsync({ id: listingId, newPrice: parsed, priority: parsedPriority });

       if (selectedCollectionIds.size > 0) {
         try {
           await Promise.all(
             Array.from(selectedCollectionIds).map((collectionId) =>
               assignListings.mutateAsync({
                 collectionId,
                 listings: [{ listingId }],
               }),
             ),
           );
           toast.success(
             parsed !== undefined || parsedPriority !== undefined
               ? `Listing approved with new price${parsedPriority !== undefined ? ` and priority ${parsedPriority}` : ""} and added to ${selectedCollectionIds.size} collection(s)`
               : `Listing approved and added to ${selectedCollectionIds.size} collection(s)`,
           );
         } catch {
           toast.success("Listing approved");
           toast.error("Approved, but failed to add to collection(s). Retry from Catalogue > Collections.");
           return;
         }
       } else {
         toast.success(parsed !== undefined || parsedPriority !== undefined ? `Listing approved${parsed !== undefined ? ` with new price` : ""}${parsedPriority !== undefined ? ` with priority ${parsedPriority}` : ""}` : "Listing approved");
       }
      setApproving(false);
      resetApproveForm();
    } catch {
      toast.error("Failed to approve listing");
    }
  }

  async function handleReject() {
    try {
      await decline.mutateAsync({ id: Number(id), reason });
      toast.success("Listing declined");
      setRejecting(false);
      setReason("");
    } catch {
      toast.error("Failed to decline listing");
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/listings")} className="gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Notification sent")}>
            <Bell className="h-3.5 w-3.5" /> Notify seller
          </Button>
          {!isMock && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Edit mode")} disabled>
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {!locked && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRejecting(true)}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setApproving(true)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
            </>
          )}
          {listing.status === "Approved" && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => unpublish.mutateAsync(Number(id))} disabled={unpublish.isPending}>
              <Ban className="h-3.5 w-3.5" /> Unpublish
            </Button>
          )}
          {listing.status === "Suspended" && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => publish.mutateAsync(Number(id))} disabled={publish.isPending}>
              <Check className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
          {!isMock && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Edit mode")} disabled>
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      <PageCard
        title={listing.title}
        description={`Submitted by ${listing.seller} · ${listing.id}`}
        action={<StatusBadge status={listing.status} />}
      >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            {cover ? <img src={cover} alt={listing.title} className="aspect-[3/4] w-full rounded-xl object-cover shadow-elegant" />
              : <div className="aspect-[3/4] rounded-xl bg-muted" />}
            {allImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {allImages.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImage(url)} className={`aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${url === (selectedImage ?? listing.coverImage) ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"}`}>
                    <img src={url} alt={`${listing.title} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 shadow-soft">
              <p className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Receipt className="h-3 w-3" /> Price breakdown
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 shadow-glow">
                  <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <Wallet className="h-3 w-3" /> Seller Price
                  </p>
                  <p className="mt-1.5 font-display text-3xl font-extrabold text-primary">₦{listing.price.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">Original price seller entered</p>
                </div>
                {listing.priceOfNew != null && (
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <BadgeCheck className="h-3 w-3" /> Admin Price
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-bold text-primary">₦{listing.priceOfNew.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Price set at approval</p>
                  </div>
                )}
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> Buyer Price
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-foreground">₦{(listing.buyerPrice || Math.round(listing.price * 1.15)).toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">What the buyer pays (incl. markup)</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-success">
                    <Wallet className="h-3 w-3" /> Seller Payout
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-success">₦{Math.round(listing.price * 0.85).toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">Seller receives (−15% fee)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Author">{listing.author}</Field>
              <Field icon={Tag} label="Category">{listing.category}</Field>
              <Field icon={BookMarked} label="Format">{listing.format || "—"}</Field>
              <Field icon={Hash} label="ISBN">{listing.isbn || "—"}</Field>
              <Field icon={Hash} label="Quantity">{listing.quantity}</Field>
              <Field icon={Tag} label="Condition">{listing.condition}</Field>
              <Field icon={MapPin} label="Location">{listing.location || "—"}</Field>
              <Field icon={Calendar} label="Submitted">{listing.date.slice(0, 10)}</Field>
              {listing.dateModified && (
                <Field icon={Calendar} label="Last updated">{listing.dateModified.slice(0, 10)}</Field>
              )}
            </div>

            {listing.tags.length > 0 && (
              <Field icon={Tag} label="Tags" full>{listing.tags.join(", ")}</Field>
            )}

            {listing.description && (
              <Field icon={FileText} label="Description" full>{listing.description}</Field>
            )}
            {listing.conditionDetail && (
              <Field icon={FileText} label="Condition note" full>{listing.conditionDetail}</Field>
            )}
            {listing.loveNote && (
              <Field icon={Heart} label="Love note" full>{listing.loveNote}</Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Store className="h-3 w-3" /> Store
                </p>
                <p className="text-sm font-semibold text-foreground">{listing.storeName || "—"}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Package className="h-3 w-3" /> Fulfillment
                </p>
                <p className="text-sm text-foreground">{listing.fulfillmentOption || "—"}</p>
                {listing.pickupAddress && <p className="text-xs text-muted-foreground">{listing.pickupAddress}</p>}
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4 sm:col-span-2">
                <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <BadgeCheck className="h-3 w-3" /> Seller
                </p>
                <p className="font-semibold text-foreground">{listing.seller}</p>
              </div>
            </div>
          </div>
        </div>
      </PageCard>

      <AdminNote entityId={`listing:${listing.id}`} />

      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject listing</DialogTitle></DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain to the seller why…" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={decline.isPending}>
              {decline.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approving} onOpenChange={handleApprovingChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve listing</DialogTitle>
            <DialogDescription>Optionally set a new price, assign a priority, and add this listing to collections.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="approve-new-price">New price (₦)</Label>
              <Input
                id="approve-new-price"
                type="number"
                min={0}
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Optional — leave blank to keep current"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approve-priority">Priority</Label>
              <Input
                id="approve-priority"
                type="number"
                min={0}
                step="1"
                value={priority}
                onChange={(e) => setPriorityValue(e.target.value)}
                placeholder="Optional — 0 = default, higher = more important"
              />
            </div>
            <div className="space-y-2">
              <Label>Add to collections (optional)</Label>
              {collectionsLoading ? (
                <p className="text-sm text-muted-foreground">Loading collections...</p>
              ) : !collections || collections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collections yet. Create one under Catalogue &gt; Collections.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                  {collections.map((c) => {
                    const collectionId = c.id!;
                    const checked = selectedCollectionIds.has(collectionId);
                    return (
                      <label
                        key={collectionId}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/60 ${checked ? "bg-primary/5" : ""}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleCollection(collectionId)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{c.name}</span>
                          <span className="block truncate font-mono text-[11px] text-muted-foreground">/{c.slug}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedCollectionIds.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCollectionIds.size} collection(s) selected. The listing is approved first, then added.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleApprovingChange(false)}>Cancel</Button>
            <Button onClick={confirmApprove} disabled={approve.isPending || assignListings.isPending}>
              {approve.isPending ? "Approving…" : assignListings.isPending ? "Adding to collection…" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ icon: Icon, label, children, full }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card p-3 ${full ? "sm:col-span-2" : ""}`}>
      <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  );
}
