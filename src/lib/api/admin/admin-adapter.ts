import type { AdminCustomerDetailResponse, AdminCustomerResponse, ListingResponse } from "../types"

export interface AdminListingDisplay {
  id: string
  title: string
  author: string
  seller: string
  price: number
  category: string
  status: string
  condition: string
  quantity: number
  date: string
  description: string
  loveNote: string
  coverImage: string | null
  images: string[]
}

const statusMap: Record<string, string> = {
  PendingApproval: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Published: "Approved",
  Unpublished: "Suspended",
  Sold: "Approved",
}

export function toAdminListing(l: ListingResponse): AdminListingDisplay {
  return {
    id: String(l.id ?? ""),
    title: l.title ?? "",
    author: l.author ?? "",
    seller: l.seller ?? l.createdBy ?? "",
    price: Math.round((l.price ?? 0) / 100),
    category: l.categoryName ?? "",
    status: statusMap[l.status ?? ""] ?? l.status ?? "",
    condition: l.bookCondition ?? "",
    quantity: l.quantity ?? 1,
    date: l.dateCreated ?? "",
    description: l.description ?? "",
    loveNote: l.loveNote ?? "",
    coverImage: l.coverImageFileName ?? null,
    images: l.imageFileNames ?? [],
  }
}

export interface AdminCustomerDisplay {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: string
  verified: boolean
  status: string
  listingsCount: number
  joined: string
  lastActive: string | null
}

export interface AdminCustomerDetailDisplay extends AdminCustomerDisplay {
  address: string
  bio: string | null
  storeName: string | null
  storeSlug: string | null
  salesCount: number
  purchasesCount: number
  requestsCount: number
  warnings: Array<{ reason: string; date: string }>
  suspensionHistory: Array<{ reason: string; durationDays: number; date: string }>
}

export function toAdminCustomer(c: AdminCustomerResponse): AdminCustomerDisplay {
  return {
    id: String(c.id ?? ""),
    name: c.name ?? "",
    email: c.email ?? "",
    phone: c.phoneNumber ?? "",
    avatar: c.avatar ?? "?",
    role: c.role ?? "",
    verified: c.verified ?? false,
    status: c.status ?? "",
    listingsCount: c.listingsCount ?? 0,
    joined: (c.joined ?? "").slice(0, 10),
    lastActive: c.lastActive ?? null,
  }
}

export function toAdminCustomerDetail(d: AdminCustomerDetailResponse): AdminCustomerDetailDisplay {
  return {
    ...toAdminCustomer(d),
    address: d.address ?? "",
    bio: d.bio ?? null,
    storeName: d.storeName ?? null,
    storeSlug: d.storeSlug ?? null,
    salesCount: d.salesCount ?? 0,
    purchasesCount: d.purchasesCount ?? 0,
    requestsCount: d.requestsCount ?? 0,
    warnings: (d.warnings ?? []).map((w) => ({ reason: w.reason ?? "", date: w.date ?? "" })),
    suspensionHistory: (d.suspensionHistory ?? []).map((s) => ({
      reason: s.reason ?? "",
      durationDays: s.durationDays ?? 0,
      date: s.date ?? "",
    })),
  }
}
