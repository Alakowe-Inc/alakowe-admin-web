export type BookCondition =
  | "New"
  | "LikeNew"
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor"

export type ListingStatus =
  | "PendingApproval"
  | "Approved"
  | "Rejected"
  | "Published"
  | "Unpublished"
  | "Sold"

export interface LoginRequestDto {
  emailAddress?: string | null
  password?: string | null
}

export interface EmailOnlyRequest {
  email?: string | null
}

export interface CompletePasswordResetRequestDto {
  token?: string | null
  newPassword?: string | null
  confirmNewPassword?: string | null
}

export interface ChangePasswordRequestDto {
  oldPassword?: string | null
  newPassword?: string | null
  confirmNewPassword?: string | null
}

export interface AddCategoryRequestDto {
  name?: string | null
  slug?: string | null
}

export interface UpdateCategoryRequestDto {
  name?: string | null
  slug?: string | null
  id?: number
}

export interface LoginResponse {
  userId?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phoneNumber?: string | null
  roleId?: number
  roleName?: string | null
  isActive?: boolean
  refreshToken?: string | null
  token?: string | null
  tokenExpiresAt?: string | null
}

export interface ListingResponse {
  id?: number
  title?: string | null
  isbn?: string | null
  description?: string | null
  conditionDetail?: string | null
  format?: string | null
  loveNote?: string | null
  price?: number
  priceOfNew?: number | null
  quantity?: number
  bookCondition?: BookCondition
  coverImageFileName?: string | null
  imageFileNames?: string[] | null
  author?: string | null
  categoryId?: number
  isPublished?: boolean
  isSoldOut?: boolean
  status?: ListingStatus
  categoryName?: string | null
  tags?: TagResponse[] | null
  createdBy?: string | null
  seller?: string | null
  dateCreated?: string | null
  dateModified?: string | null
  cartItemCount?: number
  wishlistItemCount?: number
  collectionPriority?: number | null
  discount?: number | null
  isDiscountApplied?: boolean
  buyerPrice?: number
  stateId?: number | null
  areaId?: number | null
  location?: string | null
  storeProfileId?: number | null
  storeName?: string | null
  storeSlug?: string | null
        sellerUserName?: string | null
        isSellerOnVacation?: boolean
        sellerVacationMessage?: string | null
        fulfillmentOption?: string | null
        pickupAddressLine?: string | null
        pickupCity?: string | null
        pickupState?: string | null
        priority?: number
    }

export interface PageLinks {
  firstPage?: string | null
  currentPage?: string | null
  nextPage?: string | null
  lastPage?: string | null
}

export interface ListingResponsePagedResult {
  result?: ListingResponse[] | null
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  links?: PageLinks
}

export interface CategoryResponse {
  id?: number
  name?: string | null
  slug?: string | null
}

export interface AddStateRequestDto {
  name?: string | null
}

export interface UpdateStateRequestDto {
  id?: number
  name?: string | null
}

export interface StateResponse {
  id?: number
  name?: string | null
}

export interface AddAreaRequestDto {
  stateId?: number
  name?: string | null
}

export interface UpdateAreaRequestDto {
  id?: number
  stateId?: number
  name?: string | null
}

export interface AreaResponse {
  id?: number
  stateId?: number
  name?: string | null
}

/* ───────── Admin Fee Configurations (Delivery + Platform) ───────── */

export interface CreateDeliveryFeeConfigurationRequestDto {
  originStateId?: number | null
  originAreaId?: number | null
  destinationStateId?: number | null
  destinationAreaId?: number | null
  minWeightGrams?: number
  maxWeightGrams?: number
  fee?: number
  cap?: number | null
  priority?: number
}

export interface UpdateDeliveryFeeConfigurationRequestDto extends CreateDeliveryFeeConfigurationRequestDto {
  id?: number
}

export interface DeliveryFeeConfigurationResponse {
  id?: number
  originStateId?: number | null
  originAreaId?: number | null
  destinationStateId?: number | null
  destinationAreaId?: number | null
  minWeightGrams?: number
  maxWeightGrams?: number
  fee?: number
  cap?: number | null
  priority?: number
}

export interface CreatePlatformFeeConfigRequestDto {
  markupPercent?: number
  markupCap?: number | null
  commissionPercent?: number
  commissionCap?: number | null
  isActive?: boolean
  effectiveFrom?: string
  effectiveTo?: string | null
}

export interface UpdatePlatformFeeConfigRequestDto extends CreatePlatformFeeConfigRequestDto {
  id?: number
}

export interface PlatformFeeConfigResponse {
  id?: number
  markupPercent?: number
  markupCap?: number | null
  commissionPercent?: number
  commissionCap?: number | null
  isActive?: boolean
  effectiveFrom?: string
  effectiveTo?: string | null
  dateCreated?: string
}

/* ───────── Admin Vouchers ───────── */

export interface CreateVoucherRequestDto {
  code?: string | null
  description?: string | null
  discountPercent?: number
  amountCap?: number | null
  minOrderAmount?: number | null
  maxUses?: number | null
  perUserLimit?: number | null
  validFrom?: string
  validTo?: string | null
  isActive?: boolean
}

export interface UpdateVoucherRequestDto extends CreateVoucherRequestDto {
  id?: number
}

export interface VoucherResponse {
  id?: number
  code?: string | null
  description?: string | null
  discountPercent?: number
  amountCap?: number | null
  minOrderAmount?: number | null
  maxUses?: number | null
  perUserLimit?: number | null
  validFrom?: string
  validTo?: string | null
  isActive?: boolean
  usageCount?: number
  createdBy?: string | null
  dateCreated?: string
}

export interface VoucherUsageResponse {
  id?: number
  voucherCode?: string | null
  userId?: number
  userEmail?: string | null
  userFullName?: string | null
  orderId?: number
  orderNumber?: string | null
  discountAmount?: number
  usedAt?: string
}

/* ───────── Catalogue & Discovery: Tags ───────── */

export interface AddTagRequestDto {
  name?: string | null
  slug?: string | null
  categoryId?: number | null
}

export interface UpdateTagRequestDto {
  id?: number
  name?: string | null
  slug?: string | null
  categoryId?: number | null
}

export interface TagResponse {
  id?: number
  name?: string | null
  slug?: string | null
  categoryId?: number | null
  categoryName?: string | null
}

/* ───────── Catalogue & Discovery: Collections ───────── */

export interface AddCollectionRequestDto {
  name?: string | null
  slug?: string | null
  description?: string | null
}

export interface UpdateCollectionRequestDto {
  id?: number
  name?: string | null
  slug?: string | null
  description?: string | null
}

export interface CollectionResponse {
  id?: number
  name?: string | null
  slug?: string | null
  description?: string | null
  isActive?: boolean
}

export interface AssignListingDto {
  listingId?: number
  priority?: number | null
}

export interface AssignListingsToCollectionDto {
  collectionId?: number
  listings?: AssignListingDto[] | null
}

export interface RemoveListingsFromCollectionDto {
  collectionId?: number
  listingIds?: number[] | null
}

export interface UpdateCollectionPriorityDto {
  collectionId?: number
  listingId?: number
  priority?: number
}

/* ───────── Catalogue & Discovery: Landing Page ───────── */

export type LandingPageSectionType = "Category" | "Collection" | "Tag"

export interface AddLandingPageSectionRequestDto {
  displayOrder?: number
  sectionType?: LandingPageSectionType
  referenceId?: number
  titleOverride?: string | null
}

export interface UpdateLandingPageSectionRequestDto {
  id?: number
  displayOrder?: number
  titleOverride?: string | null
}

export interface LandingPageSectionResponse {
  id?: number
  title?: string | null
  sectionType?: string | null
  filterParam?: any
  listings?: ListingResponse[] | null
}

/* ───────── Admin Customer Management ───────── */

export type CustomerStatus =
  | "Active"
  | "Verified"
  | "Flagged"
  | "Suspended"
  | "Banned"
  | "Pending"

export interface CustomerModerationRecordResponse {
  reason?: string | null
  durationDays?: number | null
  date?: string
}

export interface AdminCustomerResponse {
  id?: number
  name?: string | null
  email?: string | null
  phoneNumber?: string | null
  avatar?: string | null
  role?: string | null
  verified?: boolean
  status?: CustomerStatus
  listingsCount?: number
  joined?: string | null
  lastActive?: string | null
}

export interface AdminCustomerDetailResponse extends AdminCustomerResponse {
  address?: string | null
  bio?: string | null
  storeName?: string | null
  storeSlug?: string | null
  salesCount?: number
  purchasesCount?: number
  requestsCount?: number
  warnings?: CustomerModerationRecordResponse[] | null
  suspensionHistory?: CustomerModerationRecordResponse[] | null
}

export interface AdminCustomerPagedResult {
  result?: AdminCustomerResponse[] | null
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  links?: PageLinks
}

export interface CustomerFilterParams {
  Search?: string
  Status?: CustomerStatus
  PageNumber?: number
  PageSize?: number
}

export interface FlagCustomerRequest {
  reason?: string | null
}

export interface WarnCustomerRequest {
  reason?: string | null
}

export interface SuspendCustomerRequest {
  reason?: string | null
  durationDays?: number
}
export interface PayoutRequestResponse {
  id?: number
  requestNumber?: string | null
  orderId?: number
  orderNumber?: string | null
  sellerEmail?: string | null
  sellerName?: string | null
  amount?: number
  status?: string | null
  requestedAt?: string | null
  bankName?: string | null
  accountName?: string | null
  accountNumber?: string | null
  approvedAt?: string | null
  paidAt?: string | null
  note?: string | null
  linkedOrders?: number[] | null
}

export interface PayoutRequestResponsePagedResult {
  result?: PayoutRequestResponse[] | null
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  links?: PageLinks
}

/* ───────── Admin Order Disputes ───────── */

export type AdminDisputeStatus =
  | "Open"
  | "UnderReview"
  | "Resolved"
  | "Rejected"
  | "Closed"

export type AdminDisputeDecision =
  | "RefundBuyer"
  | "RuleForSeller"
  | "Close"

export interface AdminDisputeActivityResponse {
  ts?: string
  text?: string | null
}

export interface AdminDisputeResponse {
  id?: number
  disputeNumber?: string | null
  orderId?: number
  orderNumber?: string | null
  status?: AdminDisputeStatus
  reason?: string | null
  filedBy?: string | null
  filedByEmail?: string | null
  sellerName?: string | null
  amount?: number
  delivery?: string | null
  bookTitle?: string | null
  filedAt?: string
  dueAt?: string | null
  evidence?: string[] | null
  decision?: AdminDisputeDecision | null
  resolution?: string | null
  decidedBy?: string | null
  decidedAt?: string | null
  activity?: AdminDisputeActivityResponse[] | null
}