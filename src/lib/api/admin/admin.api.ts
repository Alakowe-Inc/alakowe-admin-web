import client from "../client"
import type {
  LoginRequestDto,
  EmailOnlyRequest,
  CompletePasswordResetRequestDto,
  ChangePasswordRequestDto,
  AddCategoryRequestDto,
  UpdateCategoryRequestDto,
  LoginResponse,
  CategoryResponse,
  ListingResponse,
  ListingResponsePagedResult,
  ListingStatus,
  StateResponse,
  AddStateRequestDto,
  UpdateStateRequestDto,
  AreaResponse,
  UpdateAreaRequestDto,
  AddAreaRequestDto,
  CreateDeliveryFeeConfigurationRequestDto,
  UpdateDeliveryFeeConfigurationRequestDto,
  DeliveryFeeConfigurationResponse,
  CreatePlatformFeeConfigRequestDto,
  UpdatePlatformFeeConfigRequestDto,
  PlatformFeeConfigResponse,
  AddTagRequestDto,
  UpdateTagRequestDto,
  TagResponse,
  AddCollectionRequestDto,
  UpdateCollectionRequestDto,
  CollectionResponse,
  AssignListingsToCollectionDto,
  RemoveListingsFromCollectionDto,
  UpdateCollectionPriorityDto,
  AddLandingPageSectionRequestDto,
  UpdateLandingPageSectionRequestDto,
  LandingPageSectionResponse,
  AdminCustomerResponse,
  AdminCustomerDetailResponse,
  AdminCustomerPagedResult,
  CustomerFilterParams,
  FlagCustomerRequest,
  WarnCustomerRequest,
  SuspendCustomerRequest,
  PayoutRequestResponsePagedResult,
  PayoutRequestResponse,
  AdminDisputeResponse,
  AdminDisputeStatus,
  AdminDisputeDecision,
} from "../types"

export type { CustomerFilterParams } from "../types"
export type { AdminDisputeResponse, AdminDisputeStatus, AdminDisputeDecision } from "../types"

type LoginBody = LoginRequestDto
type EmailOnlyBody = EmailOnlyRequest
type CompletePasswordResetBody = CompletePasswordResetRequestDto
type ChangePasswordBody = ChangePasswordRequestDto
type AddCategoryBody = AddCategoryRequestDto
type UpdateCategoryBody = UpdateCategoryRequestDto

export interface AdminListingFilterParams {
  CategoryId?: number
  Title?: string
  Author?: string
  Status?: ListingStatus
  PageNumber?: number
  PageSize?: number
}

export async function adminLoginApi(body: LoginBody): Promise<LoginResponse> {
  const { data } = await client.post("/api/v1/admin/auth/login", body)
  return data as LoginResponse
}

export async function adminInitiatePasswordResetApi(body: EmailOnlyBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/initiate-password-reset", body)
  return data as boolean
}

export async function adminCompletePasswordResetApi(body: CompletePasswordResetBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/complete-password-reset", body)
  return data as boolean
}

export async function adminChangePasswordApi(body: ChangePasswordBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/change-password", body)
  return data as boolean
}

export async function createCategoryApi(body: AddCategoryBody): Promise<CategoryResponse> {
  const { data } = await client.post("/api/v1/AdminCategory/create", body)
  return data as CategoryResponse
}

export async function updateCategoryApi(body: UpdateCategoryBody): Promise<CategoryResponse> {
  const { data } = await client.post("/api/v1/AdminCategory/update", body)
  return data as CategoryResponse
}

export async function deleteCategoryApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminCategory/delete/${id}`)
  return data as boolean
}

export async function getCategoryByIdApi(id: number): Promise<CategoryResponse> {
  const { data } = await client.get(`/api/v1/AdminCategory/${id}`)
  return data as CategoryResponse
}

export async function getAllCategoriesApi(): Promise<CategoryResponse[]> {
  const { data } = await client.get("/api/v1/AdminCategory/all")
  return data as CategoryResponse[]
}

export async function approveListingApi(id: number, newPrice?: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/approve/${id}`, { newPrice })
  return data as boolean
}

export async function declineListingApi(id: number, reason?: string): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/decline/${id}`, { rejectionReason: reason ?? "" })
  return data as boolean
}

export async function getAdminListingsByFilterApi(
  params?: AdminListingFilterParams,
): Promise<ListingResponsePagedResult> {
  const { data } = await client.get("/api/v1/AdminListing/by-filter", { params })
  return data as ListingResponsePagedResult
}

export async function getAdminListingByIdApi(id: number): Promise<ListingResponse> {
  const { data } = await client.get(`/api/v1/AdminListing/${id}`)
  return data as ListingResponse
}

export async function createStateApi(body: AddStateRequestDto): Promise<StateResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/state/create", body)
  return data as StateResponse
}

export async function updateStateApi(body: UpdateStateRequestDto): Promise<StateResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/state/update", body)
  return data as StateResponse
}

export async function deleteStateApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLocation/state/delete/${id}`)
  return data as boolean
}

export async function getStateByIdApi(id: number): Promise<StateResponse> {
  const { data } = await client.get(`/api/v1/AdminLocation/state/${id}`)
  return data as StateResponse
}

export async function getAllStatesApi(): Promise<StateResponse[]> {
  const { data } = await client.get("/api/v1/AdminLocation/state/all")
  return data as StateResponse[]
}

export async function createAreaApi(body: AddAreaRequestDto): Promise<AreaResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/area/create", body)
  return data as AreaResponse
}

export async function updateAreaApi(body: UpdateAreaRequestDto): Promise<AreaResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/area/update", body)
  return data as AreaResponse
}

export async function deleteAreaApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLocation/area/delete/${id}`)
  return data as boolean
}

export async function getAreaByIdApi(id: number): Promise<AreaResponse> {
  const { data } = await client.get(`/api/v1/AdminLocation/area/${id}`)
  return data as AreaResponse
}

export async function getAreasByStateApi(stateId: number): Promise<AreaResponse[]> {
  const { data } = await client.get(`/api/v1/AdminLocation/area/by-state/${stateId}`)
  return data as AreaResponse[]
}

// export type {
//   AddStateRequestDto,
//   UpdateStateRequestDto,
//   StateResponse,
//   AddAreaRequestDto,
//   UpdateAreaRequestDto,
//   AreaResponse,
// } from "../types"

// ─── Feedback ────────────────────────────────────────────────────────────────

export interface FeedbackItem {
  id: string
  name: string | null
  email: string | null
  message: string
  status: "Pending" | "Reviewed" | "Resolved"
  dateCreated: string | null
}

export interface FeedbackPagedResult {
  result: FeedbackItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetFeedbackParams {
  pageNumber?: number
  pageSize?: number
  status?: 1 | 2 | 3
}

export async function getFeedbackApi(params?: GetFeedbackParams): Promise<FeedbackPagedResult> {
  const { data } = await client.get("/api/v1/admin/AdminFeedback", { params })
  return data as FeedbackPagedResult
}

export async function updateFeedbackStatusApi(id: string, status: 1 | 2 | 3): Promise<boolean> {
  const { data } = await client.patch(`/api/v1/admin/AdminFeedback/${id}/status`, { status })
  return data as boolean
}

export async function deleteFeedbackApi(id: string): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/admin/AdminFeedback/${id}`)
  return data as boolean
}
export interface AdminOrderFilterParams {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export async function getAdminOrdersApi(params?: AdminOrderFilterParams): Promise<AdminOrderPagedResult> {
  const { data } = await client.get("/api/v1/admin/orders", { params })
  return data as AdminOrderPagedResult
}

export async function getAdminOrderApi(orderNumber: string): Promise<AdminOrderDto> {
  const { data } = await client.get(`/api/v1/admin/orders/${encodeURIComponent(orderNumber)}`)
  return data as AdminOrderDto
}

export async function updateAdminOrderStatusApi(orderNumber: string, status: string, note?: string): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admin/orders/${encodeURIComponent(orderNumber)}/status`, { status, note })
  return data as boolean
}

export async function getOrderShipmentsApi(orderId: number): Promise<OrderShipmentsDto> {
  const { data } = await client.get(`/api/v1/admin/shipments/${orderId}`)
  return data as OrderShipmentsDto
}

export async function getOrderShipmentsByNumberApi(orderNumber: string): Promise<OrderShipmentsDto> {
  const { data } = await client.get(`/api/v1/admin/shipments/by-number/${encodeURIComponent(orderNumber)}`)
  return data as OrderShipmentsDto
}

export async function initiateInboundShipmentApi(
  orderId: number,
  body: {
    sellerPhone?: string
    sellerName?: string
    sellerAddress?: string
    sellerProvince?: string
    sellerCity?: string
    sellerDistrict?: string
    parcelWeightKg?: number
    speedafStationId?: number
    remark?: string
  } = {},
): Promise<ShipmentDto> {
  const { data } = await client.post(`/api/v1/admin/shipments/${orderId}/inbound`, body)
  return data as ShipmentDto
}

export async function initiateInboundShipmentByNumberApi(
  orderNumber: string,
  body: {
    sellerPhone?: string
    sellerName?: string
    sellerAddress?: string
    sellerProvince?: string
    sellerCity?: string
    sellerDistrict?: string
    parcelWeightKg?: number
    speedafStationId?: number
    remark?: string
  } = {},
): Promise<ShipmentDto> {
  const { data } = await client.post(
    `/api/v1/admin/shipments/by-number/${encodeURIComponent(orderNumber)}/inbound`,
    body,
  )
  return data as ShipmentDto
}

export async function initiateOutboundShipmentApi(
  orderId: number,
  body: { parcelWeightKg?: number; speedafStationId?: number; remark?: string } = {},
): Promise<ShipmentDto> {
  const { data } = await client.post(`/api/v1/admin/shipments/${orderId}/outbound`, body)
  return data as ShipmentDto
}

export async function initiateOutboundShipmentByNumberApi(
  orderNumber: string,
  body: { parcelWeightKg?: number; speedafStationId?: number; remark?: string } = {},
): Promise<ShipmentDto> {
  const { data } = await client.post(
    `/api/v1/admin/shipments/by-number/${encodeURIComponent(orderNumber)}/outbound`,
    body,
  )
  return data as ShipmentDto
}

export async function markOrderLogisticsStatusApi(orderId: number, status: string, note?: string): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admin/shipments/${orderId}/status`, { status, note })
  return data as boolean
}

export interface SpeedafStationDto {
  id: number
  siteName: string
  siteMode: string
  city: string
  area: string
  address: string
  contactPhone: string
  region: string
}

export async function getAdminSpeedafStationsApi(city?: string): Promise<SpeedafStationDto[]> {
  const { data } = await client.get("/api/v1/admin/shipments/stations", { params: { city } })
  return data as SpeedafStationDto[]
}

/* ───────── Admin Customer Management ───────── */

export async function getAdminCustomersByFilterApi(params?: CustomerFilterParams): Promise<AdminCustomerPagedResult> {
  const { data } = await client.get("/api/v1/admincustomermanagement/by-filter", { params })
  return data as AdminCustomerPagedResult
}

export async function getAdminCustomerByIdApi(id: number): Promise<AdminCustomerDetailResponse> {
  const { data } = await client.get(`/api/v1/admincustomermanagement/${id}`)
  return data as AdminCustomerDetailResponse
}

export async function verifyCustomerApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/verify`)
  return data as boolean
}

export async function flagCustomerApi(id: number, body?: FlagCustomerRequest): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/flag`, body ?? {})
  return data as boolean
}

export async function warnCustomerApi(id: number, body: WarnCustomerRequest): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/warn`, body)
  return data as boolean
}

export async function suspendCustomerApi(id: number, body: SuspendCustomerRequest): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/suspend`, body)
  return data as boolean
}

export async function banCustomerApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/ban`)
  return data as boolean
}

export async function reactivateCustomerApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admincustomermanagement/${id}/reactivate`)
  return data as boolean
}

export async function getAdminPayoutRequestsApi(
  status?: string,
  pageNumber = 1,
  pageSize = 20,
): Promise<PayoutRequestResponsePagedResult> {
  const { data } = await client.get("/api/v1/admin/payout-requests", {
    params: { status, pageNumber, pageSize },
  })
  return data as PayoutRequestResponsePagedResult
}

export async function getAdminPayoutRequestByIdApi(id: number): Promise<PayoutRequestResponse> {
  const { data } = await client.get(`/api/v1/admin/payout-requests/${id}`)
  return data as PayoutRequestResponse
}

export async function updatePayoutRequestStatusApi(id: number, status: string): Promise<boolean> {
  const { data } = await client.post(`/api/v1/admin/payout-requests/${id}/status`, { status })
  return data as boolean
}

/* ───────── Admin Order Disputes ───────── */

export interface AdminDisputeFilterParams {
  Status?: AdminDisputeStatus
  Search?: string
  PageNumber?: number
  PageSize?: number
  FiledFrom?: string
  FiledTo?: string
}

export interface AdminDisputeUpdateRequest {
  status?: AdminDisputeStatus
  decision?: AdminDisputeDecision
  resolution?: string
}

export async function getAdminDisputesApi(params?: AdminDisputeFilterParams): Promise<{
  items: AdminDisputeResponse[]
  totalCount: number
}> {
  const { data, headers } = await client.get("/api/v1/admin/disputes", { params })
  const totalCount = parseInt(headers["x-total-count"] || "0", 10)
  return { items: data as AdminDisputeResponse[], totalCount }
}

export async function getAdminDisputeApi(orderNumber: string): Promise<AdminDisputeResponse> {
  const { data } = await client.get(`/api/v1/admin/disputes/${encodeURIComponent(orderNumber)}`)
  return data as AdminDisputeResponse
}

export async function updateAdminDisputeStatusApi(
  orderNumber: string,
  body: AdminDisputeUpdateRequest,
): Promise<AdminDisputeResponse> {
  const { data } = await client.post(`/api/v1/admin/disputes/${encodeURIComponent(orderNumber)}/status`, body)
  return data as AdminDisputeResponse
}

/* ───────── Admin Checkout Sessions ───────── */

export interface AdminCheckoutSessionSummaryDto {
  id: number
  sessionGuid: string
  status: string
  paymentReference?: string
  totalAmount: number
  orderCount: number
  buyerName: string
  buyerEmail: string
  createdAt: string
  orderStatuses: string[]
}

export interface AdminCheckoutSessionItemDto {
  id: number
  listingId: number
  title: string
  author?: string
  coverImageUrl?: string
  quantity: number
  unitPrice: number
  buyerPrice: number
  sellerEmail: string
  sellerName: string
  fulfillmentType: string
}

export interface AdminCheckoutSessionDetailDto {
  id: number
  sessionGuid: string
  status: string
  paymentReference?: string
  totalAmount: number
  deliveryFee?: number
  createdAt: string
  expiresAt?: string
  shippingAddress: string
  buyer: AdminOrderPartyDto
  orders: AdminOrderSummaryDto[]
  items: AdminCheckoutSessionItemDto[]
  payment: AdminOrderPaymentDto
}

export async function getAdminCheckoutSessionsApi(params?: {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}): Promise<AdminCheckoutSessionSummaryDto[]> {
  const { data } = await client.get("/api/v1/admin/checkout-sessions", { params })
  return data as AdminCheckoutSessionSummaryDto[]
}

export async function getAdminCheckoutSessionApi(id: number): Promise<AdminCheckoutSessionDetailDto> {
  const { data } = await client.get(`/api/v1/admin/checkout-sessions/${id}`)
  return data as AdminCheckoutSessionDetailDto
}

export async function getOrdersByCheckoutSessionApi(checkoutSessionId: number): Promise<AdminOrderSummaryDto[]> {
  const { data } = await client.get(`/api/v1/admin/orders/by-checkout/${checkoutSessionId}`)
  return data as AdminOrderSummaryDto[]
}
