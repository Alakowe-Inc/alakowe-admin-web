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
} from "../types"

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

export async function approveListingApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/approve/${id}`)
  return data as boolean
}

export async function declineListingApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/decline/${id}`)
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
