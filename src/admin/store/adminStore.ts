import { create } from "zustand";
import {
  users as seedUsers,
  listings as seedListings,
  orders as seedOrders,
  activityFeed as seedFeed,
  pickupRequests as seedPickups,
  dropoffBooks as seedDropoffBooks,
  dropoffCentres as seedDropoffCentres,
  payouts as seedPayouts,
  bookRequests as seedRequests,
  adminMembers as seedAdmins,
  type UserRow,
  type Listing,
  type Order,
  type Pickup,
  type DropoffBook,
  type DropoffCentre,
  type Payout,
  type BookRequest,
  type AdminMember,
} from "@/lib/mock-data";

export type FeedItem = {
  id: string;
  type: "user" | "listing" | "order" | "flag" | "seller" | "approval" | "payout" | "pickup" | "dropoff" | "request" | "admin";
  text: string;
  time: string;
  link?: string;
};

interface AdminState {
  users: UserRow[];
  listings: Listing[];
  orders: Order[];
  pickups: Pickup[];
  dropoffBooks: DropoffBook[];
  dropoffCentres: DropoffCentre[];
  payouts: Payout[];
  requests: BookRequest[];
  admins: AdminMember[];
  feed: FeedItem[];

  // Users
  setRole: (id: string, role: "User" | "Seller") => void;
  verifyUser: (id: string) => void;
  flagUser: (id: string, reason?: string) => void;
  warnUser: (id: string, reason: string) => void;
  suspendUser: (id: string, reason: string, durationDays: number) => void;
  banUser: (id: string) => void;
  reactivateUser: (id: string) => void;

  // Listings
  approveListing: (id: string, reviewer?: string) => void;
  rejectListing: (id: string, reason: string, reviewer?: string) => void;
  requestCorrection: (id: string, note: string, reviewer?: string) => void;
  flagListing: (id: string, reason?: string) => void;
  suspendListing: (id: string) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;

  // Orders
  setOrderStatus: (id: string, status: Order["status"], note?: string) => void;
  forceUpdateOrder: (id: string, status: Order["status"]) => void;

  // Pickups
  approvePickup: (id: string) => void;
  markPickedUp: (id: string) => void;
  cancelPickup: (id: string) => void;

  // Drop-off books
  verifyDropoffBook: (id: string) => void;
  rejectDropoffBook: (id: string) => void;

  // Drop-off centres
  addCentre: (c: Omit<DropoffCentre, "id">) => void;
  updateCentre: (id: string, patch: Partial<DropoffCentre>) => void;
  toggleCentreHidden: (id: string) => void;
  deleteCentre: (id: string) => void;

  // Payouts
  markPayoutPaid: (id: string) => void;
  markPayoutUnsuccessful: (id: string) => void;
  notifySeller: (sellerName: string) => void;

  // Admins
  addAdmin: (a: Omit<AdminMember, "id" | "lastLogin">) => void;
  updateAdmin: (id: string, patch: Partial<AdminMember>) => void;
  removeAdmin: (id: string) => void;
  toggleAdminActive: (id: string) => void;

  pushFeed: (item: Omit<FeedItem, "id" | "time">) => void;
}

const REVIEWER = "Akin O.";
const now = () => new Date().toISOString();
const ago = () => "just now";
const fid = () => `F-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const useAdminStore = create<AdminState>((set) => ({
  users: seedUsers,
  listings: seedListings,
  orders: seedOrders,
  pickups: seedPickups,
  dropoffBooks: seedDropoffBooks,
  dropoffCentres: seedDropoffCentres,
  payouts: seedPayouts,
  requests: seedRequests,
  admins: seedAdmins,
  feed: seedFeed.map((f, i) => ({ ...f, id: `F-${i}`, type: f.type as FeedItem["type"] })),

  // ───── Users
  setRole: (id, role) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
    feed: [{ id: fid(), type: "user", text: `Role changed to ${role}`, time: ago() }, ...s.feed],
  })),
  verifyUser: (id) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, verified: true, status: "Verified" } : u)),
    feed: [{ id: fid(), type: "approval", text: `User ${id} verified`, time: ago() }, ...s.feed],
  })),
  flagUser: (id, reason) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, status: "Flagged" } : u)),
    feed: [{ id: fid(), type: "flag", text: `User ${id} flagged${reason ? `: ${reason}` : ""}`, time: ago() }, ...s.feed],
  })),
  warnUser: (id, reason) => set((s) => ({
    users: s.users.map((u) => u.id === id
      ? { ...u, warnings: [...(u.warnings ?? []), { reason, date: now().slice(0, 10) }] }
      : u),
    feed: [{ id: fid(), type: "flag", text: `Warning sent to ${id}`, time: ago() }, ...s.feed],
  })),
  suspendUser: (id, reason, durationDays) => set((s) => ({
    users: s.users.map((u) => u.id === id
      ? { ...u, status: "Suspended", suspensionHistory: [...(u.suspensionHistory ?? []), { reason, durationDays, date: now().slice(0, 10) }] }
      : u),
    feed: [{ id: fid(), type: "flag", text: `User ${id} suspended (${durationDays}d)`, time: ago() }, ...s.feed],
  })),
  banUser: (id) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, status: "Banned" } : u)),
    feed: [{ id: fid(), type: "flag", text: `User ${id} banned`, time: ago() }, ...s.feed],
  })),
  reactivateUser: (id) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, status: "Active" } : u)),
    feed: [{ id: fid(), type: "approval", text: `User ${id} reactivated`, time: ago() }, ...s.feed],
  })),

  // ───── Listings
  approveListing: (id, reviewer = REVIEWER) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, status: "Approved", reviewedBy: reviewer, reviewedAt: now() } : l),
    feed: [{ id: fid(), type: "approval", text: `Listing ${id} approved`, time: ago(), link: `/admin/listings/${id}` }, ...s.feed],
  })),
  rejectListing: (id, reason, reviewer = REVIEWER) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, status: "Rejected", reviewedBy: reviewer, reviewedAt: now(), rejectionReason: reason } : l),
    feed: [{ id: fid(), type: "listing", text: `Listing ${id} rejected`, time: ago() }, ...s.feed],
  })),
  requestCorrection: (id, note, reviewer = REVIEWER) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, status: "Needs Correction", reviewedBy: reviewer, reviewedAt: now(), correctionNote: note } : l),
    feed: [{ id: fid(), type: "listing", text: `Correction requested on ${id}`, time: ago() }, ...s.feed],
  })),
  flagListing: (id, reason) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, status: "Flagged", flagReason: reason } : l),
    feed: [{ id: fid(), type: "flag", text: `Listing ${id} flagged${reason ? `: ${reason}` : ""}`, time: ago() }, ...s.feed],
  })),
  suspendListing: (id) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, status: "Suspended" } : l),
    feed: [{ id: fid(), type: "listing", text: `Listing ${id} suspended`, time: ago() }, ...s.feed],
  })),
  updateListing: (id, patch) => set((s) => ({
    listings: s.listings.map((l) => l.id === id ? { ...l, ...patch } : l),
  })),

  // ───── Orders
  setOrderStatus: (id, status, note) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? {
      ...o, status,
      activity: [...(o.activity ?? []), { ts: now(), text: `Status → ${status}${note ? ` · ${note}` : ""}` }],
    } : o),
    feed: [{ id: fid(), type: "order", text: `Order ${id} → ${status}`, time: ago(), link: `/admin/orders/${id}` }, ...s.feed],
  })),
  forceUpdateOrder: (id, status) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? {
      ...o, status,
      activity: [...(o.activity ?? []), { ts: now(), text: `[Force update] Status → ${status}` }],
    } : o),
    feed: [{ id: fid(), type: "order", text: `Order ${id} force-updated to ${status}`, time: ago() }, ...s.feed],
  })),

  // ───── Pickups
  approvePickup: (id) => set((s) => ({
    pickups: s.pickups.map((p) => p.id === id ? {
      ...p, status: "Approved",
      timeline: [...(p.timeline ?? []), { ts: now(), text: "Pickup approved" }],
    } : p),
    feed: [{ id: fid(), type: "pickup", text: `Pickup ${id} approved`, time: ago() }, ...s.feed],
  })),
  markPickedUp: (id) => set((s) => ({
    pickups: s.pickups.map((p) => p.id === id ? {
      ...p, status: "Picked Up",
      timeline: [...(p.timeline ?? []), { ts: now(), text: "Marked as picked up" }],
    } : p),
    feed: [{ id: fid(), type: "pickup", text: `Pickup ${id} collected`, time: ago() }, ...s.feed],
  })),
  cancelPickup: (id) => set((s) => ({
    pickups: s.pickups.map((p) => p.id === id ? {
      ...p, status: "Cancelled",
      timeline: [...(p.timeline ?? []), { ts: now(), text: "Pickup cancelled" }],
    } : p),
    feed: [{ id: fid(), type: "pickup", text: `Pickup ${id} cancelled`, time: ago() }, ...s.feed],
  })),

  // ───── Drop-off books
  verifyDropoffBook: (id) => set((s) => ({
    dropoffBooks: s.dropoffBooks.map((d) => d.id === id ? { ...d, status: "Verified" } : d),
    feed: [{ id: fid(), type: "dropoff", text: `Drop-off ${id} verified`, time: ago() }, ...s.feed],
  })),
  rejectDropoffBook: (id) => set((s) => ({
    dropoffBooks: s.dropoffBooks.map((d) => d.id === id ? { ...d, status: "Rejected" } : d),
    feed: [{ id: fid(), type: "dropoff", text: `Drop-off ${id} rejected`, time: ago() }, ...s.feed],
  })),

  // ───── Drop-off centres
  addCentre: (c) => set((s) => ({
    dropoffCentres: [...s.dropoffCentres, { ...c, id: `DC-${Math.random().toString(36).slice(2, 6).toUpperCase()}` }],
    feed: [{ id: fid(), type: "dropoff", text: `New centre added: ${c.name}`, time: ago() }, ...s.feed],
  })),
  updateCentre: (id, patch) => set((s) => ({
    dropoffCentres: s.dropoffCentres.map((c) => c.id === id ? { ...c, ...patch } : c),
  })),
  toggleCentreHidden: (id) => set((s) => ({
    dropoffCentres: s.dropoffCentres.map((c) => c.id === id ? { ...c, hidden: !c.hidden } : c),
  })),
  deleteCentre: (id) => set((s) => ({
    dropoffCentres: s.dropoffCentres.filter((c) => c.id !== id),
    feed: [{ id: fid(), type: "dropoff", text: `Centre ${id} removed`, time: ago() }, ...s.feed],
  })),

  // ───── Payouts
  markPayoutPaid: (id) => set((s) => ({
    payouts: s.payouts.map((p) => p.id === id ? {
      ...p, status: "Paid",
      history: [...(p.history ?? []), { ts: now(), text: "Marked as paid" }],
    } : p),
    feed: [{ id: fid(), type: "payout", text: `Payout ${id} marked paid`, time: ago() }, ...s.feed],
  })),
  markPayoutUnsuccessful: (id) => set((s) => ({
    payouts: s.payouts.map((p) => p.id === id ? {
      ...p, status: "Unsuccessful",
      history: [...(p.history ?? []), { ts: now(), text: "Payment unsuccessful" }],
    } : p),
    feed: [{ id: fid(), type: "payout", text: `Payout ${id} unsuccessful`, time: ago() }, ...s.feed],
  })),
  notifySeller: (sellerName) => set((s) => ({
    feed: [{ id: fid(), type: "payout", text: `Notification sent to ${sellerName}`, time: ago() }, ...s.feed],
  })),

  // ───── Admins
  addAdmin: (a) => set((s) => ({
    admins: [...s.admins, { ...a, id: `AD-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, lastLogin: now() }],
    feed: [{ id: fid(), type: "admin", text: `New admin added: ${a.name}`, time: ago() }, ...s.feed],
  })),
  updateAdmin: (id, patch) => set((s) => ({
    admins: s.admins.map((a) => a.id === id ? { ...a, ...patch } : a),
  })),
  removeAdmin: (id) => set((s) => ({
    admins: s.admins.filter((a) => a.id !== id),
    feed: [{ id: fid(), type: "admin", text: `Admin ${id} removed`, time: ago() }, ...s.feed],
  })),
  toggleAdminActive: (id) => set((s) => ({
    admins: s.admins.map((a) => a.id === id ? { ...a, active: !a.active } : a),
  })),

  pushFeed: (item) => set((s) => ({ feed: [{ ...item, id: fid(), time: ago() }, ...s.feed] })),
}));
