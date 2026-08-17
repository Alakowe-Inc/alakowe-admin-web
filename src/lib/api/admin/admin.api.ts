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

/* ───────── Admin Delivery Fee Configurations ───────── */

export async function createDeliveryFeeConfigApi(
  body: CreateDeliveryFeeConfigurationRequestDto,
): Promise<DeliveryFeeConfigurationResponse> {
  const { data } = await client.post("/api/v1/AdminDeliveryFee/create", body)
  return data as DeliveryFeeConfigurationResponse
}

export async function updateDeliveryFeeConfigApi(
  body: UpdateDeliveryFeeConfigurationRequestDto,
): Promise<DeliveryFeeConfigurationResponse> {
  const { data } = await client.post("/api/v1/AdminDeliveryFee/update", body)
  return data as DeliveryFeeConfigurationResponse
}

export async function deleteDeliveryFeeConfigApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminDeliveryFee/delete/${id}`)
  return data as boolean
}

export async function getDeliveryFeeConfigByIdApi(id: number): Promise<DeliveryFeeConfigurationResponse> {
  const { data } = await client.get(`/api/v1/AdminDeliveryFee/${id}`)
  return data as DeliveryFeeConfigurationResponse
}

export async function getAllDeliveryFeeConfigsApi(): Promise<DeliveryFeeConfigurationResponse[]> {
  const { data } = await client.get("/api/v1/AdminDeliveryFee/all")
  return data as DeliveryFeeConfigurationResponse[]
}

/* ───────── Admin Platform Fee Configurations ───────── */

export async function createPlatformFeeConfigApi(
  body: CreatePlatformFeeConfigRequestDto,
): Promise<PlatformFeeConfigResponse> {
  const { data } = await client.post("/api/v1/AdminPlatformFee/create", body)
  return data as PlatformFeeConfigResponse
}

export async function updatePlatformFeeConfigApi(
  body: UpdatePlatformFeeConfigRequestDto,
): Promise<PlatformFeeConfigResponse> {
  const { data } = await client.post("/api/v1/AdminPlatformFee/update", body)
  return data as PlatformFeeConfigResponse
}

export async function deletePlatformFeeConfigApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminPlatformFee/delete/${id}`)
  return data as boolean
}

export async function getPlatformFeeConfigByIdApi(id: number): Promise<PlatformFeeConfigResponse> {
  const { data } = await client.get(`/api/v1/AdminPlatformFee/${id}`)
  return data as PlatformFeeConfigResponse
}

export async function getAllPlatformFeeConfigsApi(): Promise<PlatformFeeConfigResponse[]> {
  const { data } = await client.get("/api/v1/AdminPlatformFee/all")
  return data as PlatformFeeConfigResponse[]
}

export async function getActivePlatformFeeConfigApi(): Promise<PlatformFeeConfigResponse> {
  const { data } = await client.get("/api/v1/AdminPlatformFee/active")
  return data as PlatformFeeConfigResponse
}

/* ───────── Admin Tags ───────── */

export async function createTagApi(body: AddTagRequestDto): Promise<TagResponse> {
  const { data } = await client.post("/api/v1/AdminTag/create", body)
  return data as TagResponse
}

export async function updateTagApi(body: UpdateTagRequestDto): Promise<TagResponse> {
  const { data } = await client.post("/api/v1/AdminTag/update", body)
  return data as TagResponse
}

export async function deleteTagApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminTag/delete/${id}`)
  return data as boolean
}

export async function getAllTagsApi(): Promise<TagResponse[]> {
  const { data } = await client.get("/api/v1/AdminTag/all")
  return data as TagResponse[]
}

export async function getTagsByCategoryApi(categoryId: number): Promise<TagResponse[]> {
  const { data } = await client.get(`/api/v1/AdminTag/by-category/${categoryId}`)
  return data as TagResponse[]
}

/* ───────── Admin Collections ───────── */

export async function createCollectionApi(body: AddCollectionRequestDto): Promise<CollectionResponse> {
  const { data } = await client.post("/api/v1/AdminCollection/create", body)
  return data as CollectionResponse
}

export async function updateCollectionApi(body: UpdateCollectionRequestDto): Promise<CollectionResponse> {
  const { data } = await client.post("/api/v1/AdminCollection/update", body)
  return data as CollectionResponse
}

export async function deleteCollectionApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminCollection/delete/${id}`)
  return data as boolean
}

export async function getAllCollectionsApi(): Promise<CollectionResponse[]> {
  const { data } = await client.get("/api/v1/AdminCollection/all")
  return data as CollectionResponse[]
}

export async function assignListingsToCollectionApi(body: AssignListingsToCollectionDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/assign-listings", body)
  return data as boolean
}

export async function removeListingsFromCollectionApi(body: RemoveListingsFromCollectionDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/remove-listings", body)
  return data as boolean
}

export async function updateCollectionPriorityApi(body: UpdateCollectionPriorityDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/update-priority", body)
  return data as boolean
}

/* ───────── Admin Landing Page ───────── */

export async function createLandingPageSectionApi(body: AddLandingPageSectionRequestDto): Promise<LandingPageSectionResponse> {
  const { data } = await client.post("/api/v1/AdminLandingPage/create", body)
  return data as LandingPageSectionResponse
}

export async function updateLandingPageSectionApi(body: UpdateLandingPageSectionRequestDto): Promise<LandingPageSectionResponse> {
  const { data } = await client.post("/api/v1/AdminLandingPage/update", body)
  return data as LandingPageSectionResponse
}

export async function deleteLandingPageSectionApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLandingPage/delete/${id}`)
  return data as boolean
}

export async function getLandingPageApi(): Promise<any> {
  const { data } = await client.get("/api/v1/LandingPage/landing-page")
  return data
}

/* ───────── Optional Speedaf logistics ───────── */

export interface ShipmentDto {
  id: number
  orderId: number
  leg: string
  carrier: string
  status: string
  speedafBillCode?: string
  customerOrderNo?: string
  labelUrl?: string
  pickupType: number
  senderName?: string
  receiverName?: string
  lastTrackAction?: string
  lastTrackMessage?: string
  lastTrackAt?: string
  bookedAt?: string
  speedafStationName?: string
  trackEvents?: Array<{
    action?: string
    actionName?: string
    message?: string
    messageEng?: string
    eventTime?: string
    source: string
  }>
}

export interface AdminOrderPartyDto {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  verified: boolean
}

export interface AdminOrderPaymentDto {
  method: string
  reference?: string
  status?: string
  channel?: string
  paidAt?: string
}

export interface AdminOrderItemDto {
  id: number
  listingId: number
  title: string
  author?: string
  category?: string
  format?: string
  condition?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  buyerPrice: number
  sellerPayout: number
  platformFee: number
  coverImageUrl?: string
}

export interface AdminOrderDto {
  id: number
  orderNumber: string
  status: string
  amount: number
  baseAmount: number
  deliveryFee?: number
  sellerPayout: number
  platformFee: number
  markupTotal: number
  commissionTotal: number
  isSettled: boolean
  settledAt?: string
  date: string
  paymentDate?: string
  shippedDate?: string
  deliveredDate?: string
  delivery: "Pickup" | "Drop-off" | "Courier" | string
  fulfillmentType?: "Courier" | "Pickup" | string
  shippingAddress?: string
  pickupAddress?: string | null
  pickupPreferredDates?: string[] | null
  preferredSpeedafStationId?: number | null
  preferredSpeedafStationName?: string | null
  preferredSpeedafStationAddress?: string | null
  preferredSpeedafStationCity?: string | null
  sellerDropoffScheduledAt?: string | null
  buyer: AdminOrderPartyDto
  seller: AdminOrderPartyDto
  payment: AdminOrderPaymentDto
  items: AdminOrderItemDto[]
  activity: Array<{ ts: string; text: string }>
  shipments: ShipmentDto[]
}

export interface OrderShipmentsDto {
  orderId: number
  orderStatus: string
  usesSpeedaf: boolean
  preferredSpeedafStationId?: number | null
  preferredSpeedafStationName?: string | null
  preferredSpeedafStationAddress?: string | null
  preferredSpeedafStationCity?: string | null
  sellerDropoffScheduledAt?: string | null
  shipments: ShipmentDto[]
}

export interface AdminOrderSummaryDto {
  id: number
  orderNumber: string
  status: string
  amount: number
  delivery: "Pickup" | "Drop-off" | "Courier" | string
  fulfillmentType?: "Courier" | "Pickup" | string
  date: string
  buyerName: string
  sellerName: string
  bookTitles: string[]
}

export async function getAdminOrdersApi(): Promise<AdminOrderSummaryDto[]> {
  const { data } = await client.get("/api/v1/admin/orders")
  return data as AdminOrderSummaryDto[]
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
