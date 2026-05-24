import type { ListingResponse } from "../types"

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
