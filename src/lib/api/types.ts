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
}

export interface UpdateCategoryRequestDto {
  name?: string | null
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
  loveNote?: string | null
  price?: number
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
  createdBy?: string | null
  seller?: string | null
  dateCreated?: string | null
  dateModified?: string | null
  cartItemCount?: number
  wishlistItemCount?: number
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
