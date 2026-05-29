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
